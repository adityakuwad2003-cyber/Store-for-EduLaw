import { adminDb } from "./_lib/adminInit";
import { FieldValue } from "firebase-admin/firestore";
import { setCorsHeaders, verifyBearerToken, isRateLimited, getClientIp } from "./_lib/security";

/**
 * /api/purchases
 * GET:  Returns authenticated user's purchases + invoice data.
 * POST: Saves a new purchase record and auto-creates a GST invoice.
 */

// ── GST helpers (intrastate, prices inclusive of 18%) ─────────────────────────
const SELLER = {
  name: "The EduLaw",
  address: "Pune, Maharashtra - 411001",
  gstin: "27EFLPK0704R1ZY",
  state: "Maharashtra",
  stateCode: "27",
};

function round2(n: number) { return Math.round(n * 100) / 100; }

function buildInvoiceItems(cartItems: Array<{ title: string; price: number }>) {
  return cartItems.map(item => {
    const taxable  = round2(item.price / 1.18);
    const cgst     = round2(taxable * 0.09);
    const sgst     = round2(taxable * 0.09);
    return {
      description: item.title,
      sacCode: "998431",
      quantity: 1,
      taxableValue: taxable,
      cgstRate: 9,
      cgstAmount: cgst,
      sgstRate: 9,
      sgstAmount: sgst,
      total: item.price,
    };
  });
}

/** Atomically increments the counter and returns the new invoice number. */
async function getNextInvoiceNumber(): Promise<string> {
  const counterRef = adminDb.collection("meta").doc("invoiceCounter");
  const num = await adminDb.runTransaction(async tx => {
    const snap = await tx.get(counterRef);
    const next = (snap.exists ? (snap.data()!.count as number) : 0) + 1;
    tx.set(counterRef, { count: next }, { merge: true });
    return next;
  });
  // Financial year: April 2025 – March 2026 → "2526"
  const now = new Date();
  const fy = now.getMonth() >= 3                         // April = month 3
    ? `${String(now.getFullYear()).slice(-2)}${String(now.getFullYear() + 1).slice(-2)}`
    : `${String(now.getFullYear() - 1).slice(-2)}${String(now.getFullYear()).slice(-2)}`;
  return `EL-${fy}-${String(num).padStart(6, "0")}`;
}

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

  // ─── GET: Fetch Purchases ─────────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const [purchasesSnapshot, invoicesSnapshot] = await Promise.all([
        adminDb.collection("purchases").where("userId", "==", verifiedUserId).get(),
        adminDb.collection("invoices").where("userId", "==", verifiedUserId).get(),
      ]);

      if (purchasesSnapshot.empty) return res.status(200).json({ purchases: [] });

      // Build a map: purchaseDocId → { invoiceNumber, invoiceId }
      const invoiceMap = new Map<string, { invoiceNumber: string; invoiceId: string }>();
      invoicesSnapshot.docs.forEach(doc => {
        const d = doc.data() as any;
        if (d.purchaseDocId) {
          invoiceMap.set(d.purchaseDocId, { invoiceNumber: d.invoiceNumber, invoiceId: doc.id });
        }
      });

      const productIds = new Set<string>();
      const bundleNoteIds = new Set<string>();
      const purchasesData = purchasesSnapshot.docs.map(doc => {
        const data = doc.data() as any;
        if (data.productId) productIds.add(data.productId);
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
          fileKeys = [{ name: data.title || data.productName || "Document", key: data.fileKey }];
        }
        if (fileKeys.length === 0 && Array.isArray(data.noteIds) && data.noteIds.length > 0) {
          data.noteIds.forEach((nid: string) => {
            const nd = notesMap.get(nid);
            if (nd) {
              if (Array.isArray(nd.fileKeys) && nd.fileKeys.length > 0) {
                fileKeys.push(...nd.fileKeys);
              } else if (nd.fileKey) {
                fileKeys.push({ name: nd.title || "Document", key: nd.fileKey });
              }
            }
          });
        }

        const inv = invoiceMap.get(data.id);
        return {
          id: data.id,
          productId: data.productId,
          title: data.title,
          fileKey: data.fileKey || "",
          fileKeys,
          price: data.price,
          razorpay_payment_id: data.razorpay_payment_id,
          purchasedAt: data.purchasedAt ? data.purchasedAt.toDate().toISOString() : null,
          invoiceNumber: inv?.invoiceNumber || null,
          invoiceId: inv?.invoiceId || null,
        };
      });

      return res.status(200).json({ purchases });
    } catch (err) {
      console.error("GET Purchases Error:", err);
      return res.status(500).json({ error: "Failed to fetch purchases." });
    }
  }

  // ─── POST: Save Purchase + Create Invoice ─────────────────────────────────
  if (req.method === "POST") {
    try {
      const {
        productId, title, price, razorpay_payment_id, fileKeys, fileKey,
        couponCode, discountAmount, noteIds,
        buyerName, buyerEmail,
        // cartItems is an array of { title, price } for all items in the session
        // (passed only on the first item call to create a consolidated invoice)
        cartItems,
      } = req.body;

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
        status: "success",
      };

      if (Array.isArray(noteIds) && noteIds.length > 0) {
        purchaseRecord.noteIds = noteIds.map(String);
      }
      if (couponCode) {
        purchaseRecord.couponCode = couponCode;
        purchaseRecord.discountAmount = discountAmount || 0;
      }

      const docRef = await adminDb.collection("purchases").add(purchaseRecord);

      // Increment coupon usage count (only for first item)
      if (couponCode) {
        const couponSnap = await adminDb.collection("coupons")
          .where("code", "==", String(couponCode).toUpperCase())
          .limit(1)
          .get();
        if (!couponSnap.empty) {
          await couponSnap.docs[0].ref.update({ usesCount: FieldValue.increment(1) });
        }
      }

      // ── Create GST Invoice (only when cartItems is provided, i.e., first item) ──
      let invoiceNumber: string | null = null;
      let invoiceId: string | null = null;

      if (Array.isArray(cartItems) && cartItems.length > 0) {
        invoiceNumber = await getNextInvoiceNumber();

        const invoiceItems = buildInvoiceItems(cartItems);
        const totalTaxableValue = round2(invoiceItems.reduce((s, i) => s + i.taxableValue, 0));
        const totalCgst         = round2(invoiceItems.reduce((s, i) => s + i.cgstAmount, 0));
        const totalSgst         = round2(invoiceItems.reduce((s, i) => s + i.sgstAmount, 0));
        const totalAmount       = invoiceItems.reduce((s, i) => s + i.total, 0);

        const invoiceDoc = {
          invoiceNumber,
          invoiceDate: new Date(),
          financialYear: (() => {
            const now = new Date();
            const y = now.getFullYear();
            return now.getMonth() >= 3 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
          })(),
          seller: SELLER,
          buyer: {
            name: buyerName || "Customer",
            email: buyerEmail || "",
          },
          items: invoiceItems,
          totalTaxableValue,
          totalCgst,
          totalSgst,
          totalAmount,
          couponDiscount: discountAmount || 0,
          placeOfSupply: "Maharashtra",
          razorpay_payment_id,
          purchaseDocId: docRef.id,
          userId: verifiedUserId,
          createdAt: new Date(),
        };

        const invRef = await adminDb.collection("invoices").add(invoiceDoc);
        invoiceId = invRef.id;
      }

      return res.status(200).json({ success: true, id: docRef.id, invoiceNumber, invoiceId });
    } catch (err) {
      console.error("POST Purchase Error:", err);
      return res.status(500).json({ error: "Failed to save purchase." });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
