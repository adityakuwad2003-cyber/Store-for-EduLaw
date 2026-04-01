/**
 * GET /api/admin/get-upload-url
 * 
 * Admin-only endpoint. Generates a presigned S3 PUT URL for uploading
 * a PDF to Cloudflare R2 directly from the browser.
 * 
 * Security:
 * - Admin email whitelist check
 * - Rate limited (10 uploads/minute per IP)
 * - Strict file name validation (path traversal prevention)
 * - Signed URL expires in 5 minutes
 */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  setCorsHeaders, verifyAdmin, isRateLimited,
  getClientIp, isSafeFilePath, cleanFilePath,
} from "../_lib/security";

const MAX_PDF_BYTES   = 50 * 1024 * 1024; // 50 MB
const MAX_IMAGE_BYTES =  5 * 1024 * 1024; //  5 MB

// Validates a preview image path: previews/<slug>.jpg|jpeg|png
function isSafePreviewPath(v: unknown): v is string {
  return typeof v === "string" &&
    /^previews\/[\w\-]{1,128}\.(jpg|jpeg|png)$/.test(v) &&
    !v.includes("..");
}

export default async function handler(req: any, res: any) {
  // Top-level safety net — ensures we ALWAYS return JSON, never a plain-text crash page
  try {
  const origin = req.headers.origin || "";
  setCorsHeaders(res, origin, "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  // ── Rate limit: 10 requests per minute per IP ───────────────────────────
  const ip = getClientIp(req);
  if (isRateLimited(`upload:${ip}`, { windowMs: 60_000, maxRequests: 10 })) {
    return res.status(429).json({ error: "Too many requests. Please wait a moment." });
  }

  // ── Admin auth check ────────────────────────────────────────────────────
  try {
    await verifyAdmin(req);
  } catch (err: any) {
    return res.status(err.status || 401).json({ error: err.message });
  }

  // ── Input validation ────────────────────────────────────────────────────
  const { fileName: rawFileName, noteId, fileSize } = req.body || {};

  const fileName = typeof rawFileName === "string" ? cleanFilePath(rawFileName) : "";
  const isPreview = isSafePreviewPath(fileName);
  const isPdf     = isSafeFilePath(fileName);

  if (!isPreview && !isPdf) {
    return res.status(400).json({
      error: "Invalid file path. Use notes/slug/file.pdf or previews/slug.jpg",
    });
  }

  const maxSize = isPreview ? MAX_IMAGE_BYTES : MAX_PDF_BYTES;
  if (typeof fileSize === "number" && fileSize > maxSize) {
    return res.status(400).json({
      error: isPreview ? "Image too large. Max 5 MB." : "File too large. Max 50 MB.",
    });
  }

  // noteId only required for PDF uploads
  if (isPdf && (!noteId || typeof noteId !== "string" || !/^[\w\-]{1,128}$/.test(noteId))) {
    return res.status(400).json({ error: "Invalid noteId." });
  }

  const contentType = isPreview
    ? (fileName.endsWith(".png") ? "image/png" : "image/jpeg")
    : "application/pdf";

  // ── Generate presigned PUT URL ──────────────────────────────────────────
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

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || "edulaw-pdfs",
      Key: fileName,
      ContentType: contentType,
    });

    // 5-minute upload window
    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 });

    return res.status(200).json({ uploadUrl, key: fileName });
  } catch (err) {
    console.error("R2 presign error:", err);
    return res.status(500).json({ error: "Could not generate upload URL." });
  }
  } catch (err: any) {
    // Outer safety net — catch anything that escaped inner handlers
    console.error("Unhandled error in get-upload-url:", err);
    return res.status(500).json({ error: err?.message || "An unexpected server error occurred." });
  }
}
