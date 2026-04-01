/**
 * GET /api/admin/list-notes
 * Admin-only. Returns all notes from Firestore for the admin dashboard.
 */
import { adminDb } from "../_lib/adminInit";
import { setCorsHeaders, verifyAdmin, isRateLimited, getClientIp } from "../_lib/security";

export default async function handler(req: any, res: any) {
  try {
  const origin = req.headers.origin || "";
  setCorsHeaders(res, origin, "GET, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

  const ip = getClientIp(req);
  if (isRateLimited(`list-notes:${ip}`, { windowMs: 60_000, maxRequests: 30 })) {
    return res.status(429).json({ error: "Too many requests." });
  }

  try {
    await verifyAdmin(req);
  } catch (err: any) {
    return res.status(err.status || 401).json({ error: err.message });
  }

  try {
    const snap = await adminDb.collection("notes").orderBy("createdAt", "desc").get();
    const notes = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        title: d.title || doc.id,
        slug: d.slug || doc.id,
        category: d.category || "",
        fileKey: d.fileKey || "",
        fileKeys: d.fileKeys || (d.fileKey ? [{ name: "Document", key: d.fileKey }] : []),
        price: d.price || 0,
        totalPages: d.totalPages || 0,
        isNew: d.isNew ?? false,
        isFeatured: d.isFeatured ?? false,
        createdAt: d.createdAt ? d.createdAt.toDate().toISOString() : null,
        updatedAt: d.updatedAt ? d.updatedAt.toDate().toISOString() : null,
      };
    });
    return res.status(200).json({ notes });
  } catch (err) {
    console.error("list-notes error:", err);
    return res.status(500).json({ error: "Failed to fetch notes." });
  }
  } catch (err: any) {
    console.error("Unhandled error in list-notes:", err);
    return res.status(500).json({ error: err?.message || "An unexpected server error occurred." });
  }
}
