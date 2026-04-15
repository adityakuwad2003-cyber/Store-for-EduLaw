import { adminDb } from "./_lib/adminInit";
import { setCorsHeaders, isRateLimited, getClientIp } from "./_lib/security";

/**
 * POST /api/verify-coupon
 * Verifies a coupon code against Firestore (server-side, bypasses security rules).
 * Body: { code: string, subtotal: number }
 */
export default async function handler(req: any, res: any) {
  const origin = req.headers.origin || "";
  setCorsHeaders(res, origin, "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const ip = getClientIp(req);
  if (isRateLimited(`verify-coupon:${ip}`, { windowMs: 60_000, maxRequests: 20 })) {
    return res.status(429).json({ valid: false, message: "Too many attempts. Please wait." });
  }

  const { code, subtotal } = req.body || {};

  if (!code || typeof code !== "string") {
    return res.status(400).json({ valid: false, message: "Invalid coupon code." });
  }

  const sub = Number(subtotal) || 0;

  try {
    const snap = await adminDb
      .collection("coupons")
      .where("code", "==", code.toUpperCase().trim())
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(200).json({ valid: false, message: "Invalid promo code" });
    }

    const doc = snap.docs[0];
    const c = doc.data();

    if (!c.isActive) {
      return res.status(200).json({ valid: false, message: "This coupon has been deactivated" });
    }

    if (c.validUntil) {
      const expiry = new Date(c.validUntil);
      if (expiry < new Date()) {
        return res.status(200).json({ valid: false, message: "This coupon has expired" });
      }
    }

    if (c.maxUses > 0 && (c.usesCount || 0) >= c.maxUses) {
      return res.status(200).json({ valid: false, message: "Usage limit reached for this code" });
    }

    if (sub < (c.minOrder || 0)) {
      return res.status(200).json({
        valid: false,
        message: `Min. order of ₹${c.minOrder} required for this discount`,
      });
    }

    let discount = 0;
    if (c.discountType === "percent") {
      discount = Math.round(sub * (c.discountValue / 100));
    } else {
      discount = c.discountValue;
    }

    return res.status(200).json({ valid: true, discount, couponId: doc.id });
  } catch (error) {
    console.error("Coupon verification error:", error);
    return res.status(500).json({ valid: false, message: "Verification service error" });
  }
}
