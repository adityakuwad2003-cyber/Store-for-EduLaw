import { adminDb } from "./_lib/adminInit";
import { FieldValue } from "firebase-admin/firestore";
import { setCorsHeaders, verifyBearerToken, isRateLimited, getClientIp } from "./_lib/security";

/**
 * /api/purchases
 * Consolidated endpoint for fetching and saving user purchases.
 * GET: Returns authenticated user's purchases.
 * POST: Saves a new purchase record.
 */

export default async function handler(req: any, res: any) {
  const origin = req.headers.origin || "";
  setCorsHeaders(res, origin, "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();

  const ip = getClientIp(req);
  if (isRateLimited(`purchases:${ip}`, { windowMs: 60_000, maxRequests: 60 })) {
    return res.status(429).json({ error: "Too many requests." });
  }

  let verifiedUserId: string;
  try {
    verifiedUserId = await verifyBearerToken(req);
  } catch (err: any) {
    return res.status(err.status || 401).json({ error: err.message });
  }

  // ─── GET: Fetch Purchases ──────────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const purchasesSnapshot = await adminDb
        .collection("purchases")
        .where("userId", "==", verifiedUserId)
        .get();

      if (purchasesSnapshot.empty) return res.status(200).json({ purchases: [] });

      const productIds = new Set<string>();
      const bundleNoteIds = new Set<string>();
      const purchasesData = purchasesSnapshot.docs.map(doc => {
        const data = doc.data() as any;
        if (data.productId) productIds.add(data.productId);
        // Collect noteIds from bundle purchases
        if (Array.isArray(data.noteIds)) {
          data.noteIds.forEach((id: string) => bundleNoteIds.add(String(id)));
        }
        return { id: doc.id, ...data };
      });

      // Fetch all relevant note IDs (direct purchases + bundle noteIds)
      const allNoteIds = new Set([...productIds, ...bundleNoteIds]);
      const noteDocs = await Promise.all(
        Array.from(allNoteIds).map(id => adminDb.collection("notes").doc(id).get())
      );

      const notesMap = new Map();
      noteDocs.forEach(doc => { if (doc.exists) notesMap.set(doc.id, doc.data()); });

      // For productIds not found in notes, check the bundles collection
      const unresolvedIds = Array.from(productIds).filter(id => !notesMap.has(id));
      if (unresolvedIds.length > 0) {
        const bundleDocs = await Promise.all(
          unresolvedIds.map(id => adminDb.collection("bundles").doc(id).get())
        );

        // Collect all note IDs referenced by these bundles
        const bundleNoteIdSets: { bundleId: string; noteIds: string[] }[] = [];
        bundleDocs.forEach(doc => {
          if (doc.exists) {
            const d = doc.data() as any;
            if (Array.isArray(d.noteIds) && d.noteIds.length > 0) {
              bundleNoteIdSets.push({ bundleId: doc.id, noteIds: d.noteIds.map(String) });
            }
          }
        });

        if (bundleNoteIdSets.length > 0) {
          const allBundleNoteIds = new Set<string>();
          bundleNoteIdSets.forEach(({ noteIds }) => noteIds.forEach(id => allBundleNoteIds.add(id)));

          const bundleNoteDocs = await Promise.all(
            Array.from(allBundleNoteIds).map(id => adminDb.collection("notes").doc(id).get())
          );

          const bundleNotesMap = new Map<string, any>();
          bundleNoteDocs.forEach(doc => { if (doc.exists) bundleNotesMap.set(doc.id, doc.data()); });

          // Build combined fileKeys for each bundle and add to notesMap
          bundleNoteIdSets.forEach(({ bundleId, noteIds }) => {
            const combinedFileKeys: any[] = [];
            noteIds.forEach(noteId => {
              const noteData = bundleNotesMap.get(noteId);
              if (noteData) {
                if (Array.isArray(noteData.fileKeys) && noteData.fileKeys.length > 0) {
                  combinedFileKeys.push(...noteData.fileKeys);
                } else if (noteData.fileKey) {
                  combinedFileKeys.push({ name: noteData.title || "Document", key: noteData.fileKey });
                }
              }
            });
            if (combinedFileKeys.length > 0) {
              notesMap.set(bundleId, { fileKeys: combinedFileKeys });
            }
          });
        }
      }

      const purchases = purchasesData.map(data => {
        const noteMapData = notesMap.get(data.productId);
        let fileKeys: any[] = [];
        if (noteMapData && Array.isArray(noteMapData.fileKeys) && noteMapData.fileKeys.length > 0) {
          fileKeys = noteMapData.fileKeys;
        } else if (Array.isArray(data.fileKeys) && data.fileKeys.length > 0) {
          fileKeys = data.fileKeys;
        } else if (data.fileKey) {
          fileKeys = [{ name: data.title || data.productName || 'Document', key: data.fileKey }];
        }
        // For bundle purchases with noteIds: collect files from each note
        if (fileKeys.length === 0 && Array.isArray(data.noteIds) && data.noteIds.length > 0) {
          data.noteIds.forEach((nid: string) => {
            const nd = notesMap.get(nid);
            if (nd) {
              if (Array.isArray(nd.fileKeys) && nd.fileKeys.length > 0) {
                fileKeys.push(...nd.fileKeys);
              } else if (nd.fileKey) {
                fileKeys.push({ name: nd.title || 'Document', key: nd.fileKey });
              }
            }
          });
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
      console.error("GET Purchases Error:", err);
      return res.status(500).json({ error: "Failed to fetch purchases." });
    }
  }

  // ─── POST: Save Purchase ───────────────────────────────────────────────────
  if (req.method === "POST") {
    try {
      const { productId, title, price, razorpay_payment_id, fileKeys, fileKey, couponCode, discountAmount, noteIds } = req.body;
      if (!productId || !razorpay_payment_id) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      const purchaseRecord: Record<string, any> = {
        userId: verifiedUserId,
        productId,
        title,
        price,
        razorpay_payment_id,
        fileKeys: fileKeys || [],
        fileKey: fileKey || "",
        purchasedAt: new Date(),
        status: "success"
      };

      // For bundle purchases: save noteIds so files can be resolved later
      if (Array.isArray(noteIds) && noteIds.length > 0) {
        purchaseRecord.noteIds = noteIds.map(String);
      }

      if (couponCode) {
        purchaseRecord.couponCode = couponCode;
        purchaseRecord.discountAmount = discountAmount || 0;
      }

      const docRef = await adminDb.collection("purchases").add(purchaseRecord);

      // Increment coupon usage count (only when couponCode is provided — first item in cart)
      if (couponCode) {
        const couponSnap = await adminDb.collection("coupons")
          .where("code", "==", String(couponCode).toUpperCase())
          .limit(1)
          .get();
        if (!couponSnap.empty) {
          await couponSnap.docs[0].ref.update({ usesCount: FieldValue.increment(1) });
        }
      }

      return res.status(200).json({ success: true, id: docRef.id });
    } catch (err) {
      console.error("POST Purchase Error:", err);
      return res.status(500).json({ error: "Failed to save purchase." });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
