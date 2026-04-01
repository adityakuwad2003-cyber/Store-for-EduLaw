/**
 * POST /api/save-purchase
 * Saves a purchase record after successful Razorpay payment.
 * Token-verified — never trusts client-provided userId.
 */
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "./_lib/adminInit";
import {
  setCorsHeaders, verifyBearerToken, isRateLimited,
  getClientIp, isSafeId, cleanFilePath,
} from "./_lib/security";
import { verifyRazorpaySignature } from "./_lib/config";

function sanitize(val: unknown, max = 512): string {
  if (typeof val !== "string") return "";
  return val.replace(/<[^>]*>/g, "").replace(/[\x00-\x1f\x7f]/g, "").trim().slice(0, max);
}

export default async function handler(req: any, res: any) {
  try {
  const origin = req.headers.origin || "";
  setCorsHeaders(res, origin, "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  // ── Rate limit: 10 purchases/minute per IP ──────────────────────────────
  const ip = getClientIp(req);
  if (isRateLimited(`save-purchase:${ip}`, { windowMs: 60_000, maxRequests: 10 })) {
    return res.status(429).json({ error: "Too many requests." });
  }

  // ── Verify token ─────────────────────────────────────────────────────────
  let verifiedUserId: string;
  try {
    verifiedUserId = await verifyBearerToken(req);
  } catch (err: any) {
    return res.status(err.status || 401).json({ error: err.message });
  }

  const body = req.body || {};
  const productId = sanitize(body.productId, 128);
  const title = sanitize(body.title);

  if (!productId) return res.status(400).json({ error: "Missing required fields: productId" });
  if (!title) return res.status(400).json({ error: "Missing required fields: title" });

  const fileKey = cleanFilePath(sanitize(body.fileKey, 512));
  const price = Number.isFinite(Number(body.price)) ? Number(body.price) : 0;
  const razorpay_payment_id = sanitize(body.razorpay_payment_id, 128);
  const razorpay_order_id = sanitize(body.razorpay_order_id, 128) || null;
  const razorpay_signature = sanitize(body.razorpay_signature, 256);

  // ── Signature Verification (Critical for Live payments) ───────────────────
  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing Razorpay payment details." });
  }

  const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!isValid) {
    console.error("Invalid Razorpay signature for order:", razorpay_order_id);
    return res.status(400).json({ error: "Invalid payment signature." });
  }

  try {
    const docId = `${verifiedUserId}_${productId}`;

    // Also fetch note's fileKeys to store them with the purchase
    let fileKeys: { name: string; key: string }[] = [];
    try {
      const noteSnap = await adminDb.collection("notes").doc(productId).get();
      if (noteSnap.exists) {
        const noteData = noteSnap.data()!;
        fileKeys = Array.isArray(noteData.fileKeys) ? noteData.fileKeys : [];
      }
    } catch (_) {} // Non-fatal — purchase still saved with basic fileKey

    if (fileKeys.length === 0 && fileKey) {
      fileKeys = [{ name: title, key: fileKey }];
    }

    await adminDb.collection("purchases").doc(docId).set({
      userId: verifiedUserId,
      productId,
      title,
      fileKey,
      fileKeys,
      price,
      status: "completed",
      razorpay_payment_id,
      razorpay_order_id,
      purchasedAt: FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error saving purchase:", err);
    return res.status(500).json({ error: "Failed to save purchase record." });
  }
  } catch (err: any) {
    console.error("Unhandled error in save-purchase:", err);
    return res.status(500).json({ error: err?.message || "An unexpected server error occurred." });
  }
}
