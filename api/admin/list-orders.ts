/**
 * GET /api/admin/list-orders
 * Admin-only. Returns all purchase records from Firestore `purchases` collection,
 * mapped to the OrdersManager UI format. Also returns real calculated stats.
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
    if (isRateLimited(`list-orders:${ip}`, { windowMs: 60_000, maxRequests: 30 })) {
      return res.status(429).json({ error: "Too many requests." });
    }

    try {
      await verifyAdmin(req);
    } catch (err: any) {
      return res.status(err.status || 401).json({ error: err.message });
    }

    try {
      const snap = await adminDb
        .collection("purchases")
        .orderBy("purchasedAt", "desc")
        .limit(500)
        .get();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let todayRevenue = 0;
      let refundCount = 0;

      const allOrders = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        const purchasedAt = d.purchasedAt?.toDate?.() ?? null;
        const isToday = purchasedAt && purchasedAt >= today;

        if (isToday) todayRevenue += Number(d.price) || 0;
        if (d.status === "refunded") refundCount++;

        // Map purchase document → order format the UI expects
        return {
          id: docSnap.id,
          orderId: docSnap.id,
          razorpayOrderId: d.razorpay_order_id || null,
          razorpayPaymentId: d.razorpay_payment_id || null,
          userId: d.userId || "",
          userEmail: d.userEmail || d.userId || "—",
          items: [
            {
              id: d.productId || docSnap.id,
              title: d.title || "Unknown Product",
              type: "note",
              price: Number(d.price) || 0,
            },
          ],
          totalAmount: Number(d.price) || 0,
          currency: "INR",
          // purchases save status as "completed"; map to "captured" for Razorpay terminology
          status: d.status === "refunded" ? "refunded" : "captured",
          method: "Razorpay",
          createdAt: purchasedAt ? purchasedAt.toISOString() : null,
        };
      });

      const successCount = allOrders.filter((o) => o.status === "captured").length;
      const successRate =
        allOrders.length > 0
          ? Math.round((successCount / allOrders.length) * 100)
          : 100;

      // Apply optional status filter from query param
      const statusFilter = typeof req.query?.status === "string" ? req.query.status : "all";
      const orders =
        statusFilter && statusFilter !== "all"
          ? allOrders.filter((o) => o.status === statusFilter)
          : allOrders;

      return res.status(200).json({
        orders,
        stats: {
          todayRevenue,
          totalOrders: allOrders.length,
          successRate,
          refundCount,
        },
      });
    } catch (err) {
      console.error("list-orders Firestore error:", err);
      return res.status(500).json({ error: "Failed to fetch orders." });
    }
  } catch (err: any) {
    console.error("Unhandled error in list-orders:", err);
    return res.status(500).json({ error: err?.message || "Unexpected server error." });
  }
}
