/**
 * GET /api/get-purchases
 * Returns the authenticated user's purchases. Includes fileKeys array 
 * so Dashboard can offer per-file downloads.
 */
import { adminDb } from "./lib/adminInit";
import { setCorsHeaders, verifyBearerToken, isRateLimited, getClientIp } from "./lib/security";

export default async function handler(req: any, res: any) {
  const origin = req.headers.origin || "";
  setCorsHeaders(res, origin, "GET, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

  // ── Rate limit: 60/minute per IP ────────────────────────────────────────
  const ip = getClientIp(req);
  if (isRateLimited(`purchases:${ip}`, { windowMs: 60_000, maxRequests: 60 })) {
    return res.status(429).json({ error: "Too many requests." });
  }

  // ── Verify token ─────────────────────────────────────────────────────────
  let verifiedUserId: string;
  try {
    verifiedUserId = await verifyBearerToken(req);
  } catch (err: any) {
    return res.status(err.status || 401).json({ error: err.message });
  }

  try {
    const snapshot = await adminDb
      .collection("purchases")
      .where("userId", "==", verifiedUserId)
      .get();

    const purchases = snapshot.docs.map((doc) => {
      const d = doc.data();
      // Support both old single-file (fileKey) and new multi-file (fileKeys) format
      const legacyKey = d.fileKey || "";
      const fileKeys: { name: string; key: string }[] =
        Array.isArray(d.fileKeys) && d.fileKeys.length > 0
          ? d.fileKeys
          : legacyKey
          ? [{ name: d.title || "Document", key: legacyKey }]
          : [];

      return {
        id: doc.id,
        productId: d.productId,
        title: d.title,
        fileKey: legacyKey,    // legacy compat
        fileKeys,              // multi-file support
        price: d.price,
        razorpay_payment_id: d.razorpay_payment_id,
        purchasedAt: d.purchasedAt ? d.purchasedAt.toDate().toISOString() : null,
      };
    });

    return res.status(200).json({ purchases });
  } catch (err) {
    console.error("Error fetching purchases:", err);
    return res.status(500).json({ error: "Failed to fetch purchases." });
  }
}
