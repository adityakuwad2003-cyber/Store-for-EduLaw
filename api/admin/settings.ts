import { adminDb } from "../_lib/adminInit";
import {
  setCorsHeaders,
  verifyAdmin,
  isRateLimited,
  getClientIp,
} from "../_lib/security";

export default async function handler(req: any, res: any) {
  const origin = (req.headers.origin as string) || "";
  setCorsHeaders(res, origin, "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();

  const ip = getClientIp(req);
  if (isRateLimited(ip, { windowMs: 60_000, maxRequests: 30 }))
    return res.status(429).json({ error: "Too many requests." });

  try {
    await verifyAdmin(req);
  } catch (err: any) {
    return res.status(err.status || 401).json({ error: err.message });
  }

  const ref = adminDb.collection("system").doc("settings");

  // ── GET: return current settings ─────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const snap = await ref.get();
      if (snap.exists) {
        return res.status(200).json({ settings: snap.data() });
      }
      // First run — return sensible defaults
      const defaults = {
        siteName: "The EduLaw",
        siteTagline: "India's Premium Legal Notes Shop",
        supportEmail: "support@theedulaw.in",
        supportWhatsApp: "+91 98765 43210",
        socialLinks: {
          instagram: "https://instagram.com/theedulaw",
          telegram: "https://t.me/theedulaw",
          twitter: "",
        },
        maintenanceMode: false,
        allowRegistrations: true,
        version: "2.0.0",
      };
      return res.status(200).json({ settings: defaults });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST: save settings ───────────────────────────────────────────────────
  if (req.method === "POST") {
    try {
      const body = req.body as Record<string, unknown>;
      if (!body || typeof body !== "object")
        return res.status(400).json({ error: "Invalid body." });

      await ref.set(
        { ...body, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      return res.status(200).json({ ok: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed." });
}
