import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// ── Firebase Admin SDK ─────────────────────────────────────────────────────
// Initialize only once (Vercel may reuse the same function instance)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Newlines must be escaped in env vars
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    }),
  });
}
const adminAuth = getAuth();
const adminDb  = getFirestore();

// ── CORS helper ────────────────────────────────────────────────────────────
const ALLOWED_ORIGIN = "https://store.theedulaw.in";

function setCorsHeaders(res: any, origin: string) {
  if (origin === ALLOWED_ORIGIN || origin === "http://localhost:5173") {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

// ── Input validation ───────────────────────────────────────────────────────
// fileName must look like "category/some-file.pdf" — prevents path traversal attacks
const FILENAME_PATTERN = /^[\w\-]+\/[\w\-]+\.pdf$/;

export default async function handler(req: any, res: any) {
  const origin = req.headers.origin || "";
  setCorsHeaders(res, origin);

  // Handle preflight (browser OPTIONS request)
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // ── 1. Validate inputs ──────────────────────────────────────────────────
  const { fileName, productId } = req.body || {};

  if (!fileName || typeof fileName !== "string" || !FILENAME_PATTERN.test(fileName)) {
    return res.status(400).json({ error: "Invalid fileName. Must match pattern: category/file-name.pdf" });
  }

  if (!productId || typeof productId !== "string" || productId.trim().length === 0) {
    return res.status(400).json({ error: "Invalid productId." });
  }

  // ── 2. Verify Firebase Auth token (NEVER trust userId from client body) ──
  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!idToken) {
    return res.status(401).json({ error: "Unauthorized: Missing auth token." });
  }

  let verifiedUserId: string;
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    verifiedUserId = decodedToken.uid; // Trust ONLY the server-verified UID
  } catch {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token." });
  }

  // ── 3. Check purchase in Firestore ─────────────────────────────────────
  try {
    const purchaseRef = adminDb
      .collection("purchases")
      .doc(`${verifiedUserId}_${productId}`);
    const purchaseSnap = await purchaseRef.get();

    if (!purchaseSnap.exists) {
      return res.status(403).json({ error: "Forbidden: You have not purchased this document." });
    }
  } catch (err) {
    console.error("Firestore purchase check failed:", err);
    return res.status(500).json({ error: "Could not verify purchase." });
  }

  // ── 4. Generate presigned Cloudflare R2 URL ────────────────────────────
  try {
    const r2Client = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT || "",
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
      },
      forcePathStyle: true,
    });

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || "edulaw-pdfs",
      Key: fileName,
    });

    // 15-minute expiring download link — even if stolen, it expires fast
    const secureUrl = await getSignedUrl(r2Client, command, { expiresIn: 900 });
    return res.status(200).json({ url: secureUrl });

  } catch (error) {
    console.error("R2 signed URL error:", error);
    return res.status(500).json({ error: "Could not generate secure download link." });
  }
}

