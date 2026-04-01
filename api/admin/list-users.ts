/**
 * GET /api/admin/list-users
 * Admin-only. Lists registered Firebase Auth users and cross-references
 * purchase counts from the `purchases` Firestore collection.
 *
 * Returns up to 500 users sorted by creation date (newest first).
 */
import { adminAuth, adminDb } from "../_lib/adminInit";
import { setCorsHeaders, verifyAdmin, isRateLimited, getClientIp } from "../_lib/security";

export default async function handler(req: any, res: any) {
  try {
    const origin = req.headers.origin || "";
    setCorsHeaders(res, origin, "GET, OPTIONS");

    if (req.method === "OPTIONS") return res.status(204).end();
    if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

    const ip = getClientIp(req);
    if (isRateLimited(`list-users:${ip}`, { windowMs: 60_000, maxRequests: 10 })) {
      return res.status(429).json({ error: "Too many requests." });
    }

    try {
      await verifyAdmin(req);
    } catch (err: any) {
      return res.status(err.status || 401).json({ error: err.message });
    }

    try {
      // 1. Fetch Firebase Auth user list (max 500)
      const listResult = await adminAuth.listUsers(500);

      // 2. Fetch all purchases to calculate notesPurchased per user
      const purchasesSnap = await adminDb.collection("purchases").get();
      const purchaseCountMap: Record<string, number> = {};
      purchasesSnap.docs.forEach((doc) => {
        const uid = doc.data().userId;
        if (uid) purchaseCountMap[uid] = (purchaseCountMap[uid] || 0) + 1;
      });

      // 3. Also check Firestore `users` collection for extra fields (banned status, subscription)
      const usersSnap = await adminDb.collection("users").get();
      const firestoreUserMap: Record<string, Record<string, unknown>> = {};
      usersSnap.docs.forEach((doc) => {
        firestoreUserMap[doc.id] = doc.data();
      });

      // 4. Merge Auth + Firestore + purchases data
      const users = listResult.users
        .map((authUser) => {
          const fs = firestoreUserMap[authUser.uid] || {};
          const createdAt = authUser.metadata.creationTime || null;
          const lastLogin = authUser.metadata.lastSignInTime || null;

          // Calculate loyalty days from account creation
          const loyaltyDays = createdAt
            ? Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
            : 0;

          return {
            id: authUser.uid,
            uid: authUser.uid,
            email: authUser.email || "",
            displayName: authUser.displayName || (fs.displayName as string) || null,
            photoURL: authUser.photoURL || (fs.photoURL as string) || null,
            isBanned: authUser.disabled || (fs.isBanned as boolean) || false,
            subscription: (fs.subscription as any) || null,
            stats: {
              notesPurchased: purchaseCountMap[authUser.uid] || 0,
              testsAttempted: (fs.stats as any)?.testsAttempted || 0,
              lastLogin,
              loyaltyDays,
            },
            createdAt,
          };
        })
        // Sort newest first
        .sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

      return res.status(200).json({ users });
    } catch (err) {
      console.error("list-users error:", err);
      return res.status(500).json({ error: "Failed to fetch users." });
    }
  } catch (err: any) {
    console.error("Unhandled error in list-users:", err);
    return res.status(500).json({ error: err?.message || "Unexpected server error." });
  }
}
