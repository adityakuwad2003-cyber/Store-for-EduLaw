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
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "./_lib/adminInit";
import {
  setCorsHeaders, verifyBearerToken, isRateLimited,
  getClientIp, isSafeFilePath, cleanFilePath, isSafeId,
} from "./_lib/security";

function isSafePreviewKey(v: unknown): v is string {
  return typeof v === "string" &&
    /^previews\/[\w\-]{1,128}\.(jpg|jpeg|png|pdf)$/.test(v) &&
    !v.includes("..");
}

async function getR2SignedUrl(key: string, expiresIn: number) {
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
    Key: key,
  });
  return getSignedUrl(r2, command, { expiresIn });
}

export default async function handler(req: any, res: any) {
  try {
  const origin = req.headers.origin || "";
  setCorsHeaders(res, origin, "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();

  // ── GET /api/get-download-link?previewKey=previews/... ──────────────────
  // Public, no auth — only serves files from the previews/ prefix.
  if (req.method === "GET") {
    const previewKey = req.query?.previewKey as string | undefined;
    if (!isSafePreviewKey(previewKey)) {
      return res.status(400).json({ error: "Invalid previewKey." });
    }
    const ip = getClientIp(req);
    if (isRateLimited(`preview:${ip}`, { windowMs: 60_000, maxRequests: 60 })) {
      return res.status(429).json({ error: "Too many requests." });
    }
    try {
      const url = await getR2SignedUrl(previewKey, 3600); // 1 hour
      return res.status(200).json({ url });
    } catch {
      return res.status(500).json({ error: "Could not generate preview link." });
    }
  }

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
  const { fileName: rawFileName, productId, subscriptionDownload } = req.body || {};

  const fileName = cleanFilePath(typeof rawFileName === "string" ? rawFileName : "");
  if (!isSafeFilePath(fileName)) {
    return res.status(400).json({ error: "Invalid fileName. Must be a path like: notes/subject/file.pdf" });
  }

  if (!isSafeId(productId)) {
    return res.status(400).json({ error: "Invalid productId." });
  }

  // ── 3a. Subscription download path ─────────────────────────────────────
  if (subscriptionDownload === true) {
    try {
      const userDoc = await adminDb.collection("users").doc(verifiedUserId).get();
      const userData = userDoc.data();
      const sub = userData?.subscription;

      if (!sub || sub.status !== "active") {
        return res.status(403).json({ error: "No active subscription." });
      }

      const monthKey = new Date().toISOString().slice(0, 7); // "YYYY-MM"
      const used: number = userData?.subscriptionUsage?.downloads?.[monthKey] ?? 0;
      const limit = sub.planId === "pro" ? 3 : 5;

      if (used >= limit) {
        return res.status(429).json({ error: `Monthly download limit reached (${limit} notes/month).`, used, limit });
      }

      // Atomically increment usage before issuing the URL
      await adminDb.collection("users").doc(verifiedUserId).update({
        [`subscriptionUsage.downloads.${monthKey}`]: FieldValue.increment(1),
      });
    } catch (err) {
      console.error("Subscription quota check failed:", err);
      return res.status(500).json({ error: "Could not verify subscription quota." });
    }
  } else {
    // ── 3b. Verify purchase in Firestore ──────────────────────────────────
    try {
      const purchaseQuery = await adminDb.collection("purchases")
        .where("userId", "==", verifiedUserId)
        .where("productId", "==", productId)
        .limit(1)
        .get();

      let hasPurchase = !purchaseQuery.empty;
      if (!hasPurchase) {
        const legacySnap = await adminDb.collection("purchases")
          .doc(`${verifiedUserId}_${productId}`)
          .get();
        hasPurchase = legacySnap.exists;
      }

      if (!hasPurchase) {
        return res.status(403).json({ error: "Forbidden: You have not purchased this document." });
      }
    } catch (err) {
      console.error("Firestore purchase check failed:", err);
      return res.status(500).json({ error: "Could not verify purchase." });
    }
  }

  // ── 4. Generate presigned Cloudflare R2 GET URL (expires in 15 min) ────
  try {
    const secureUrl = await getR2SignedUrl(fileName, 900); // 15 minutes
    return res.status(200).json({ url: secureUrl });
  } catch (err) {
    console.error("R2 signed URL error:", err);
    return res.status(500).json({ error: "Could not generate secure download link." });
  }
  } catch (err: any) {
    console.error("Unhandled error in get-download-link:", err);
    return res.status(500).json({ error: err?.message || "An unexpected server error occurred." });
  }
}
