/**
 * Shared in-memory rate limiter — OWASP API Security Top 10 (API4:2023)
 * Limits repeated requests from the same IP to prevent abuse/DoS.
 * Without Redis, this resets on every Vercel cold start — sufficient for serverless.
 */

interface RateLimitEntry {
  count: number;
  firstRequestAt: number;
}

const store = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

/**
 * Returns true if the request should be BLOCKED (over limit).
 */
export function isRateLimited(key: string, options: RateLimitOptions): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.firstRequestAt > options.windowMs) {
    // New window — reset counter
    store.set(key, { count: 1, firstRequestAt: now });
    return false;
  }

  entry.count += 1;
  if (entry.count > options.maxRequests) {
    return true; // BLOCKED
  }
  return false;
}

/**
 * Extract the real IP from Vercel's request headers.
 */
export function getClientIp(req: any): string {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

/**
 * Validate that a string is a safe alphanumeric+dash+slash ID (no injection).
 * OWASP: Input Validation (CWE-20)
 */
export function isSafeId(value: unknown): value is string {
  return typeof value === "string" && /^[\w\-]{1,128}$/.test(value);
}

/**
 * Validate an R2 file path: prevents path traversal (OWASP A01).
 * Only allows patterns like "notes/bns-complete-notes/file.pdf"
 */
export function isSafeFilePath(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const clean = value.replace(/^\/+/, ""); // strip leading slashes
  return /^[\w\-]+(\/[\w\-]+)*\.pdf$/.test(clean) && !clean.includes("..");
}

/**
 * Strip a leading slash from a file path.
 */
export function cleanFilePath(raw: string): string {
  return raw.replace(/^\/+/, "");
}

/**
 * Shared CORS helper — only allows trusted origins.
 */
const ALLOWED_ORIGINS = new Set([
  "https://store.theedulaw.in",
  "https://www.store.theedulaw.in",
  "http://localhost:5173",
]);

export function setCorsHeaders(res: any, origin: string, methods = "POST, OPTIONS") {
  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

/**
 * Verify a Bearer token and return the uid, or throw.
 */
import { adminAuth } from "./adminInit";

export async function verifyBearerToken(req: any): Promise<string> {
  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!idToken) throw Object.assign(new Error("Missing auth token."), { status: 401 });

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return decoded.uid;
  } catch {
    throw Object.assign(new Error("Invalid or expired token."), { status: 401 });
  }
}

/**
 * Verify the user is an admin (email in ADMIN_EMAILS env var).
 */
export async function verifyAdmin(req: any): Promise<string> {
  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!idToken) throw Object.assign(new Error("Missing auth token."), { status: 401 });

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken);
  } catch {
    throw Object.assign(new Error("Invalid or expired token."), { status: 401 });
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  if (!adminEmails.includes((decoded.email || "").toLowerCase())) {
    throw Object.assign(new Error("Forbidden: Admin access only."), { status: 403 });
  }
  return decoded.uid;
}
