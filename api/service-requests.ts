import { FieldValue } from "firebase-admin/firestore";
import { adminDb, adminAuth } from "./_lib/adminInit";
import { setCorsHeaders, getClientIp, isRateLimited } from "./_lib/security";

export default async function handler(req: any, res: any) {
  try {
    const origin = req.headers.origin || "";
    setCorsHeaders(res, origin, "POST, OPTIONS");
    if (req.method === "OPTIONS") return res.status(204).end();

    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const ip = getClientIp(req);
    // Tight rate limit: max 5 service requests per minute per IP
    if (isRateLimited(`service-request:${ip}`, { windowMs: 60_000, maxRequests: 5 })) {
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }

    const authHeader = req.headers.authorization;
    let userId = null;
    let userEmail = null;
    let userName = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split("Bearer ")[1];
        const decoded = await adminAuth.verifyIdToken(token);
        userId = decoded.uid;
        userEmail = decoded.email;
        userName = decoded.name;
      } catch (err) {
        // We allow anonymous/guest bookings if they provide details in form
      }
    }

    const {
      serviceId,
      serviceName,
      pricingType,
      amountPaid, // Could be 0 if it's just a quote
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      // Lead Details Capture
      leadName,
      leadEmail,
      leadPhone,
      leadDescription,
    } = req.body;

    if (!serviceId || !serviceName || !leadName || !leadEmail || !leadPhone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Construct the document to save
    const requestDoc = {
      serviceId,
      serviceName,
      pricingType: pricingType || "quote",
      status: "new", // Kanban stages: new, in_progress, quoted, completed
      amountPaid: amountPaid || 0,
      
      // Payment details if applicable
      paymentId: razorpay_payment_id || null,
      orderId: razorpay_order_id || null,
      signature: razorpay_signature || null,
      isPaid: !!razorpay_payment_id,

      // Lead Details
      customer: {
        userId,
        name: leadName || userName || "Anonymous Client",
        email: leadEmail || userEmail || "No Email provided",
        phone: leadPhone || "No Phone provided",
        description: leadDescription || "",
      },

      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection("service_requests").add(requestDoc);

    return res.status(200).json({ success: true, requestId: docRef.id });

  } catch (err: any) {
    console.error("Service request error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
