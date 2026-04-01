/**
 * POST /api/admin/update-user
 * Admin-only. Updates a Firebase Auth user (disable/enable) and optionally
 * updates their Firestore `users` document (subscription, etc.).
 */
import { adminAuth, adminDb } from "../_lib/adminInit";
import { setCorsHeaders, verifyAdmin, isRateLimited, getClientIp } from "../_lib/security";
import { FieldValue } from "firebase-admin/firestore";

export default async function handler(req: any, res: any) {
  try {
    const origin = req.headers.origin || "";
    setCorsHeaders(res, origin, "POST, OPTIONS");

    if (req.method === "OPTIONS") return res.status(204).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

    const ip = getClientIp(req);
    if (isRateLimited(`update-user:${ip}`, { windowMs: 60_000, maxRequests: 30 })) {
      return res.status(429).json({ error: "Too many requests." });
    }

    try {
      await verifyAdmin(req);
    } catch (err: any) {
      return res.status(err.status || 401).json({ error: err.message });
    }

    const { uid, action, payload } = req.body || {};
    if (!uid || typeof uid !== "string") {
      return res.status(400).json({ error: "Missing uid." });
    }

    try {
      if (action === "ban") {
        await adminAuth.updateUser(uid, { disabled: true });
        await adminDb.collection("users").doc(uid).set(
          { isBanned: true, updatedAt: FieldValue.serverTimestamp() },
          { merge: true }
        );
        return res.status(200).json({ success: true, message: "User banned." });
      }

      if (action === "unban") {
        await adminAuth.updateUser(uid, { disabled: false });
        await adminDb.collection("users").doc(uid).set(
          { isBanned: false, updatedAt: FieldValue.serverTimestamp() },
          { merge: true }
        );
        return res.status(200).json({ success: true, message: "User unbanned." });
      }

      if (action === "gift_subscription") {
        const { planId, durationDays = 365 } = payload || {};
        if (!planId) return res.status(400).json({ error: "Missing planId in payload." });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);

        await adminDb.collection("users").doc(uid).set(
          {
            subscription: {
              planId,
              status: "active",
              expiresAt: expiresAt.toISOString(),
              grantedAt: new Date().toISOString(),
            },
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
        return res.status(200).json({ success: true, message: `Subscription '${planId}' granted for ${durationDays} days.` });
      }

      return res.status(400).json({ error: `Unknown action: ${action}` });
    } catch (err) {
      console.error("update-user error:", err);
      return res.status(500).json({ error: "Failed to update user." });
    }
  } catch (err: any) {
    console.error("Unhandled error in update-user:", err);
    return res.status(500).json({ error: err?.message || "Unexpected server error." });
  }
}
