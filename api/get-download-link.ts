/**
 * POST /api/get-download-link
 * 
 * Secure download link generation. Verifies:
 * 1. Firebase ID token (server-side)
 * 2. Purchase record exists in Firestore
 * 3. File path is safe (no path traversal)
 * 
 * Returns a 15-minute presigned Cloudflare R2 URL.
 */
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { adminDb } from "./lib/adminInit";
import {
  setCorsHeaders, verifyBearerToken, isRateLimited,
  getClientIp, isSafeFilePath, cleanFilePath, isSafeId,
} from "./lib/security";

export default async function handler(req: any, res: any) {
  const origin = req.headers.origin || "";
  setCorsHeaders(res, origin, "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  // ── Rate limit: 30 downloads/minute per IP ──────────────────────────────
  const ip = getClientIp(req);
  if (isRateLimited(`download:${ip}`, { windowMs: 60_000, maxRequests: 30 })) {
    return res.status(429).json({ error: "Too many download requests. Please wait a moment." });
  }

  // ── 1. Verify Firebase ID token ─────────────────────────────────────────
  let verifiedUserId: string;
  try {
    verifiedUserId = await verifyBearerToken(req);
  } catch (err: any) {
    return res.status(err.status || 401).json({ error: err.message });
  }

  // ── 2. Validate inputs ──────────────────────────────────────────────────
  const { fileName: rawFileName, productId } = req.body || {};

  const fileName = cleanFilePath(typeof rawFileName === "string" ? rawFileName : "");
  if (!isSafeFilePath(fileName)) {
    return res.status(400).json({ error: "Invalid fileName. Must be a path like: notes/subject/file.pdf" });
  }

  if (!isSafeId(productId)) {
    return res.status(400).json({ error: "Invalid productId." });
  }

  // ── 3. Verify purchase in Firestore ────────────────────────────────────
  try {
    const purchaseRef = adminDb.collection("purchases").doc(`${verifiedUserId}_${productId}`);
    const purchaseSnap = await purchaseRef.get();
    if (!purchaseSnap.exists) {
      return res.status(403).json({ error: "Forbidden: You have not purchased this document." });
    }
  } catch (err) {
    console.error("Firestore purchase check failed:", err);
    return res.status(500).json({ error: "Could not verify purchase." });
  }

  // ── 4. Generate presigned Cloudflare R2 GET URL (expires in 15 min) ────
  try {
    const r2 = new S3Client({
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

    const secureUrl = await getSignedUrl(r2, command, { expiresIn: 900 }); // 15 minutes
    return res.status(200).json({ url: secureUrl });
  } catch (err) {
    console.error("R2 signed URL error:", err);
    return res.status(500).json({ error: "Could not generate secure download link." });
  }
}
