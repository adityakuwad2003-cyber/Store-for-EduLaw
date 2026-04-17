import { adminDb } from "./_lib/adminInit";
import { FieldValue } from "firebase-admin/firestore";
import { setCorsHeaders, verifyBearerToken, isRateLimited, getClientIp } from "./_lib/security";

/**
 * /api/subscribe
 * POST: Activates a Pro or Max subscription for the authenticated user after Razorpay payment.
 *
 * Body: { planId: "pro" | "max", razorpay_payment_id, buyerName, buyerEmail }
 * Auth: Bearer <Firebase ID Token>
 */

const PLAN_PRICES: Record<string, number> = { pro: 499, max: 999 };

export default async function handler(req: any, res: any) {
  const origin = req.headers.origin || "";
  setCorsHeaders(res, origin, "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const ip = getClientIp(req);
  if (isRateLimited(`subscribe:${ip}`, { windowMs: 60_000, maxRequests: 20 })) {
    return res.status(429).json({ error: "Too many requests." });
  }

  let uid: string;
  try {
    uid = await verifyBearerToken(req);
  } catch (err: any) {
    return res.status(err.status || 401).json({ error: err.message });
  }

  const { planId, razorpay_payment_id, buyerName, buyerEmail } = req.body || {};

  if (!planId || !PLAN_PRICES[planId]) {
    return res.status(400).json({ error: "Invalid planId. Must be 'pro' or 'max'." });
  }
  if (!razorpay_payment_id || typeof razorpay_payment_id !== "string") {
    return res.status(400).json({ error: "Missing razorpay_payment_id." });
  }

  // Prevent duplicate activations for the same payment ID
  const existingSnap = await adminDb
    .collection("purchases")
    .where("razorpay_payment_id", "==", razorpay_payment_id)
    .limit(1)
    .get();
  if (!existingSnap.empty) {
    return res.status(200).json({ success: true, message: "Already activated." });
  }

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 30);

  try {
    // 1. Activate subscription in users/{uid}
    await adminDb.collection("users").doc(uid).set(
      {
        subscription: {
          planId,
          status: "active",
          expiresAt: expiresAt.toISOString(),
          activatedAt: now.toISOString(),
          razorpay_payment_id,
        },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // 2. Save purchase record for audit trail
    await adminDb.collection("purchases").add({
      userId: uid,
      type: "subscription",
      planId,
      title: `EduLaw ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan — 30 days`,
      price: PLAN_PRICES[planId],
      razorpay_payment_id,
      buyerName: buyerName || "",
      buyerEmail: buyerEmail || "",
      purchasedAt: now,
      status: "success",
      expiresAt: expiresAt.toISOString(),
    });

    return res.status(200).json({ success: true, expiresAt: expiresAt.toISOString() });
  } catch (err) {
    console.error("subscribe handler error:", err);
    return res.status(500).json({ error: "Failed to activate subscription." });
  }
}
