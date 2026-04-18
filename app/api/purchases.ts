import { adminDb } from "./_lib/adminInit";
import { FieldValue } from "firebase-admin/firestore";
import { setCorsHeaders, verifyBearerToken, isRateLimited, getClientIp } from "./_lib/security";

/**
 * /api/purchases
 * GET:  Returns authenticated user's purchases + invoice data.
 * POST: Saves a new purchase record and auto-creates a GST invoice.
 *       Also handles action="ping-google", action="verify-coupon", action="subscribe".
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

// ── ping-google sub-handler ──────────────────────────────────────────────────
async function handlePingGoogle(res: any) {
  const SITEMAP_URL = 'https://www.store.theedulaw.in/sitemap.xml';
  try {
    const googlePing = await fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
      { method: 'GET' }
    );
    const bingPing = await fetch(
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
      { method: 'GET' }
    ).catch(() => null);
    return res.status(200).json({ success: true, google: googlePing.status, bing: bingPing?.status ?? 'skipped' });
  } catch (err: any) {
    console.error('Google ping failed:', err?.message);
    return res.status(200).json({ success: false, error: err?.message });
  }
}

// ── verify-coupon sub-handler ────────────────────────────────────────────────
async function handleVerifyCoupon(req: any, res: any, body: any) {
  const { code, subtotal, userId } = body;
  if (!code || typeof code !== "string") {
    return res.status(400).json({ valid: false, message: "Invalid coupon code." });
  }
  const sub = Number(subtotal) || 0;
  try {
    const snap = await adminDb.collection("coupons").where("code", "==", code.toUpperCase().trim()).limit(1).get();
    if (snap.empty) return res.status(200).json({ valid: false, message: "Invalid promo code" });
    const doc = snap.docs[0];
    const c = doc.data();
    if (!c.isActive) return res.status(200).json({ valid: false, message: "This coupon has been deactivated" });
    if (c.validUntil) {
      const expiry = new Date(c.validUntil);
      if (expiry < new Date()) return res.status(200).json({ valid: false, message: "This coupon has expired" });
    }
    if (c.maxUses > 0 && (c.usesCount || 0) >= c.maxUses) {
      return res.status(200).json({ valid: false, message: "Usage limit reached for this code" });
    }
    if (sub < (c.minOrder || 0)) {
      return res.status(200).json({ valid: false, message: `Min. order of ₹${c.minOrder} required for this discount` });
    }
    if (userId && typeof userId === "string") {
      const used = await adminDb.collection("purchases")
        .where("userId", "==", userId).where("couponCode", "==", code.toUpperCase().trim()).limit(1).get();
      if (!used.empty) return res.status(200).json({ valid: false, message: "You have already used this coupon" });
    }
    let discount = 0;
    if (c.discountType === "percent") {
      discount = Math.round(sub * (c.discountValue / 100));
      if (c.maxDiscount && c.maxDiscount > 0) discount = Math.min(discount, c.maxDiscount);
    } else {
      discount = c.discountValue;
    }
    return res.status(200).json({ valid: true, discount, couponId: doc.id });
  } catch (error) {
    console.error("Coupon verification error:", error);
    return res.status(500).json({ valid: false, message: "Verification service error" });
  }
}

// ── subscribe sub-handler ────────────────────────────────────────────────────
const PLAN_PRICES: Record<string, number> = { pro: 499, max: 999 };

async function handleSubscribe(req: any, res: any, body: any, uid: string) {
  const { planId, razorpay_payment_id, buyerName, buyerEmail } = body;
  if (!planId || !PLAN_PRICES[planId]) return res.status(400).json({ error: "Invalid planId. Must be 'pro' or 'max'." });
  if (!razorpay_payment_id || typeof razorpay_payment_id !== "string") return res.status(400).json({ error: "Missing razorpay_payment_id." });
  const existingSnap = await adminDb.collection("purchases").where("razorpay_payment_id", "==", razorpay_payment_id).limit(1).get();
  if (!existingSnap.empty) return res.status(200).json({ success: true, message: "Already activated." });
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 30);
  try {
    await adminDb.collection("users").doc(uid).set({
      subscription: { planId, status: "active", expiresAt: expiresAt.toISOString(), activatedAt: now.toISOString(), razorpay_payment_id },
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    await adminDb.collection("purchases").add({
      userId: uid, type: "subscription", planId,
      title: `EduLaw ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan — 30 days`,
      price: PLAN_PRICES[planId], razorpay_payment_id,
      buyerName: buyerName || "", buyerEmail: buyerEmail || "",
      purchasedAt: now, status: "success", expiresAt: expiresAt.toISOString(),
    });
    return res.status(200).json({ success: true, expiresAt: expiresAt.toISOString() });
  } catch (err) {
    console.error("subscribe handler error:", err);
    return res.status(500).json({ error: "Failed to activate subscription." });
  }
}

export default async function handler(req: any, res: any) {
  const origin = req.headers.origin || "";
  setCorsHeaders(res, origin, "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();

  // ── Action dispatch (some actions don't require auth) ────────────────────
  if (req.method === "POST") {
    const postBody = req.body || {};
    const { action } = postBody;

    if (action === "ping-google") return handlePingGoogle(res);

    if (action === "verify-coupon") {
      const vcIp = getClientIp(req);
      if (isRateLimited(`verify-coupon:${vcIp}`, { windowMs: 60_000, maxRequests: 20 })) {
        return res.status(429).json({ valid: false, message: "Too many attempts. Please wait." });
      }
      return handleVerifyCoupon(req, res, postBody);
    }

    if (action === "subscribe") {
      const subIp = getClientIp(req);
      if (isRateLimited(`subscribe:${subIp}`, { windowMs: 60_000, maxRequests: 20 })) {
        return res.status(429).json({ error: "Too many requests." });
      }
      let subUid: string;
      try { subUid = await verifyBearerToken(req); } catch (err: any) { return res.status(err.status || 401).json({ error: err.message }); }
      return handleSubscribe(req, res, postBody, subUid);
    }
  }

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

      // Check templates collection for productIds not found in notes
      const unresolvedAfterNotes = Array.from(productIds).filter(id => !notesMap.has(id));
      const templatesMap = new Map<string, { pdfUrl?: string; docxUrl?: string }>();
      if (unresolvedAfterNotes.length > 0) {
        const templateDocs = await Promise.all(
          unresolvedAfterNotes.map(id => adminDb.collection("templates").doc(id).get())
        );
        templateDocs.forEach(doc => { if (doc.exists) templatesMap.set(doc.id, doc.data() as any); });
      }

      // For productIds not found in notes or templates, check the bundles collection
      const unresolvedIds = Array.from(productIds).filter(id => !notesMap.has(id) && !templatesMap.has(id));
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
        const templateMapData = templatesMap.get(data.productId);
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
        const isTemplate = !!templateMapData;
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
          type: data.type || (isTemplate ? "template" : "note"),
          pdfUrl: isTemplate ? (templateMapData.pdfUrl || null) : null,
          docxUrl: isTemplate ? (templateMapData.docxUrl || null) : null,
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
          const couponRef = couponSnap.docs[0].ref;
          try {
            await adminDb.runTransaction(async tx => {
              const freshDoc = await tx.get(couponRef);
              const couponData = freshDoc.data();
              if (couponData && couponData.maxUses > 0 && (couponData.usesCount || 0) >= couponData.maxUses) {
                throw new Error("Coupon limit reached");
              }
              tx.update(couponRef, { usesCount: FieldValue.increment(1) });
            });
          } catch (couponErr: any) {
            if (couponErr.message === "Coupon limit reached") {
              return res.status(400).json({ error: "This coupon has reached its usage limit." });
            }
            // Non-fatal: log but don't fail the purchase
            console.error("Coupon transaction error:", couponErr);
          }
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
