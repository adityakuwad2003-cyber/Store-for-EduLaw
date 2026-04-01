/**
 * GET /api/admin/dashboard-stats
 * Returns aggregated real KPIs from Firestore for the admin overview.
 * - Total revenue (sum of purchases.price)
 * - Orders count today
 * - Total unique users (purchases)
 * - Total notes count
 * - Recent 10 orders
 */
import { adminDb } from "../lib/adminInit";
import { setCorsHeaders, verifyAdmin, isRateLimited, getClientIp } from "../lib/security";

export default async function handler(req: any, res: any) {
  try {
    const origin = req.headers.origin || "";
    setCorsHeaders(res, origin, "GET, OPTIONS");

    if (req.method === "OPTIONS") return res.status(204).end();
    if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

    const ip = getClientIp(req);
    if (isRateLimited(`dashboard-stats:${ip}`, { windowMs: 60_000, maxRequests: 30 })) {
      return res.status(429).json({ error: "Too many requests." });
    }

    try {
      await verifyAdmin(req);
    } catch (err: any) {
      return res.status(err.status || 401).json({ error: err.message });
    }

    // ── Fetch all purchases ──────────────────────────────────────────────────
    const purchasesSnap = await adminDb
      .collection("purchases")
      .orderBy("purchasedAt", "desc")
      .get();

    let totalRevenue = 0;
    let ordersToday = 0;
    const uniqueUsers = new Set<string>();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const recentOrders: any[] = [];

    purchasesSnap.docs.forEach((doc) => {
      const d = doc.data();
      totalRevenue += Number(d.price) || 0;
      uniqueUsers.add(d.userId);

      // Check if purchased today
      const purchasedAt = d.purchasedAt?.toDate?.() || null;
      if (purchasedAt && purchasedAt >= todayStart) {
        ordersToday++;
      }

      // Collect recent 10 for the feed
      if (recentOrders.length < 10) {
        recentOrders.push({
          id: doc.id,
          title: d.title || "—",
          userEmail: d.userId || "—",
          price: d.price || 0,
          status: d.status || "completed",
          purchasedAt: purchasedAt ? purchasedAt.toISOString() : null,
          razorpay_payment_id: d.razorpay_payment_id || null,
        });
      }
    });

    // ── Fetch notes count ────────────────────────────────────────────────────
    const notesSnap = await adminDb.collection("notes").get();
    const totalNotes = notesSnap.size;

    // ── Fetch bundles count ──────────────────────────────────────────────────
    const bundlesSnap = await adminDb.collection("bundles").get();
    const totalBundles = bundlesSnap.size;

    return res.status(200).json({
      totalRevenue,
      totalOrders: purchasesSnap.size,
      ordersToday,
      totalUsers: uniqueUsers.size,
      totalNotes,
      totalBundles,
      recentOrders,
    });
  } catch (err: any) {
    console.error("dashboard-stats error:", err);
    return res.status(500).json({ error: err?.message || "Server error." });
  }
}
