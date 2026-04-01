/**
 * GET /api/get-purchases
 * Returns the authenticated user's purchases. Includes fileKeys array 
 * so Dashboard can offer per-file downloads.
 */
import { adminDb } from "./lib/adminInit";
import { setCorsHeaders, verifyBearerToken, isRateLimited, getClientIp } from "./lib/security";

export default async function handler(req: any, res: any) {
  try {
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
    // Get all completed purchases for this user
    const purchasesSnapshot = await adminDb
      .collection("purchases")
      .where("userId", "==", verifiedUserId)
      .where("status", "==", "completed")
      .get();

    if (purchasesSnapshot.empty) {
      return res.status(200).json({ purchases: [] });
    }

    // Prepare note IDs to fetch corresponding fresh note data
    const noteIds = new Set<string>();
    const purchasesData = purchasesSnapshot.docs.map(doc => {
      const data = doc.data() as any;
      if (data.productId) noteIds.add(data.productId);
      return { id: doc.id, ...data };
    });

    // Fetch the latest note metadata in parallel
    const noteDocs = await Promise.all(
      Array.from(noteIds).map(id => adminDb.collection("notes").doc(id).get())
    );

    // Create a dictionary of current notes
    const notesMap = new Map();
    noteDocs.forEach(doc => {
      if (doc.exists) {
        notesMap.set(doc.id, doc.data());
      }
    });

    // Merge latest fileKeys into each purchase
    const purchases = purchasesData.map(data => {
      const noteMapData = notesMap.get(data.productId);
      
      // Attempt to load from fresh note DB data, fallback to purchase history, fallback to legacy
      let fileKeys: any[] = [];
      if (noteMapData && Array.isArray(noteMapData.fileKeys) && noteMapData.fileKeys.length > 0) {
        fileKeys = noteMapData.fileKeys;
      } else if (Array.isArray(data.fileKeys) && data.fileKeys.length > 0) {
        fileKeys = data.fileKeys;
      } else if (data.fileKey) {
        // Legacy single string fallback
        fileKeys = [{ name: data.title || data.productName || 'Document', key: data.fileKey }];
      }

      return {
        id: data.id,
        productId: data.productId,
        title: data.title,
        fileKey: data.fileKey || "",
        fileKeys,
        price: data.price,
        razorpay_payment_id: data.razorpay_payment_id,
        purchasedAt: data.purchasedAt ? data.purchasedAt.toDate().toISOString() : null,
      };
    });

    return res.status(200).json({ purchases });
  } catch (err) {
    console.error("Error fetching purchases:", err);
    return res.status(500).json({ error: "Failed to fetch purchases." });
  }
  } catch (err: any) {
    console.error("Unhandled error in get-purchases:", err);
    return res.status(500).json({ error: err?.message || "An unexpected server error occurred." });
  }
}
