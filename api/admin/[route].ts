/**
 * /api/admin/[route]
 *
 * Master Admin Router — handles ALL admin API routes in one serverless function.
 * This replaces 8 separate functions, freeing 7 Vercel function slots.
 *
 * Routes handled (same URLs as before — 100% backward compatible):
 *   GET  /api/admin/dashboard-stats
 *   GET  /api/admin/list-data?type=notes|orders|users
 *   POST /api/admin/save-note
 *   POST /api/admin/get-upload-url
 *   POST /api/admin/update-user
 *   POST /api/admin/settings  (also GET)
 *   DELETE /api/admin/delete-file
 *   DELETE /api/admin/delete-product
 */

import { FieldValue } from "firebase-admin/firestore";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Resend } from "resend";
import { adminAuth, adminDb } from "../_lib/adminInit";
import {
  setCorsHeaders, verifyAdmin, isRateLimited,
  getClientIp, isSafeFilePath, isSafeId, cleanFilePath,
} from "../_lib/security";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MAX_STR = 512;
const MAX_LONG_STR = 15000;

function sanitize(val: unknown, maxLen = MAX_STR, skipHtml = false): string {
  if (typeof val !== "string") return "";
  let cleaned = val.replace(/[\x00-\x1f\x7f]/g, "").trim();
  if (!skipHtml) cleaned = cleaned.replace(/<[^>]*>/g, "");
  return cleaned.slice(0, maxLen);
}

function sanitizeNumber(val: unknown, fallback = 0): number {
  const n = Number(val);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function isSafePreviewPath(v: unknown): v is string {
  return typeof v === "string" &&
    /^previews\/[\w\-]{1,128}\.(jpg|jpeg|png|webp|gif)$/.test(v) &&
    !v.includes("..");
}

// ─── Route handlers ───────────────────────────────────────────────────────────

async function handleDashboardStats(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });
  const ip = getClientIp(req);
  if (isRateLimited(`dashboard-stats:${ip}`, { windowMs: 60_000, maxRequests: 30 }))
    return res.status(429).json({ error: "Too many requests." });
  try { await verifyAdmin(req); } catch (err: any) { return res.status(err.status || 401).json({ error: err.message }); }

  const purchasesSnap = await adminDb.collection("purchases").orderBy("purchasedAt", "desc").get();
  let totalRevenue = 0, ordersToday = 0;
  const uniqueUsers = new Set<string>();
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const recentOrders: any[] = [];
  purchasesSnap.docs.forEach((doc) => {
    const d = doc.data();
    totalRevenue += Number(d.price) || 0;
    uniqueUsers.add(d.userId);
    const purchasedAt = d.purchasedAt?.toDate?.() || null;
    if (purchasedAt && purchasedAt >= todayStart) ordersToday++;
    if (recentOrders.length < 10) recentOrders.push({
      id: doc.id, title: d.title || "—", userEmail: d.userId || "—",
      price: d.price || 0, status: d.status || "completed",
      purchasedAt: purchasedAt ? purchasedAt.toISOString() : null,
      razorpay_payment_id: d.razorpay_payment_id || null,
    });
  });
  const notesSnap = await adminDb.collection("notes").get();
  const bundlesSnap = await adminDb.collection("bundles").get();
  return res.status(200).json({
    totalRevenue, totalOrders: purchasesSnap.size, ordersToday,
    totalUsers: uniqueUsers.size, totalNotes: notesSnap.size,
    totalBundles: bundlesSnap.size, recentOrders,
  });
}

async function handleListData(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });
  const { type } = req.query;
  const ip = getClientIp(req);
  if (isRateLimited(`list-data:${type}:${ip}`, { windowMs: 60_000, maxRequests: 30 }))
    return res.status(429).json({ error: "Too many requests." });
  try { await verifyAdmin(req); } catch (err: any) { return res.status(err.status || 401).json({ error: err.message }); }

  if (type === "notes") {
    const snap = await adminDb.collection("notes").orderBy("createdAt", "desc").get();
    const notes = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id, title: d.title || doc.id, slug: d.slug || doc.id,
        category: d.category || "", fileKey: d.fileKey || "",
        fileKeys: d.fileKeys || (d.fileKey ? [{ name: "Document", key: d.fileKey }] : []),
        price: d.price ?? 0, totalPages: d.totalPages || 0,
        isNew: d.isNew ?? false, isFeatured: d.isFeatured ?? false,
        description: d.description || "", publicDescription: d.publicDescription || "",
        language: d.language || "English", contentFeatures: d.contentFeatures || [],
        featuredSections: d.featuredSections || [], tableOfContents: d.tableOfContents || [],
        previewImageKey: d.previewImageKey || "",
        previewImageKeys: d.previewImageKeys || (d.previewImageKey ? [d.previewImageKey] : []),
        samplePdfKey: d.samplePdfKey || "",
        createdAt: d.createdAt ? d.createdAt.toDate().toISOString() : null,
        updatedAt: d.updatedAt ? d.updatedAt.toDate().toISOString() : null,
      };
    });
    return res.status(200).json({ notes });
  }

  if (type === "orders") {
    const snap = await adminDb.collection("purchases").orderBy("purchasedAt", "desc").limit(500).get();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let todayRevenue = 0, refundCount = 0;
    const allOrders = snap.docs.map((docSnap) => {
      const d = docSnap.data();
      const purchasedAt = d.purchasedAt?.toDate?.() ?? null;
      const isToday = purchasedAt && purchasedAt >= today;
      if (isToday) todayRevenue += Number(d.price) || 0;
      if (d.status === "refunded") refundCount++;
      return {
        id: docSnap.id, orderId: docSnap.id,
        razorpayOrderId: d.razorpay_order_id || null,
        razorpayPaymentId: d.razorpay_payment_id || null,
        userId: d.userId || "", userEmail: d.userEmail || d.userId || "—",
        items: [{ id: d.productId || docSnap.id, title: d.title || "Unknown Product", type: "note", price: Number(d.price) || 0 }],
        totalAmount: Number(d.price) || 0, currency: "INR",
        status: d.status === "refunded" ? "refunded" : "captured",
        method: "Razorpay",
        createdAt: purchasedAt ? purchasedAt.toISOString() : null,
      };
    });
    const successCount = allOrders.filter((o) => o.status === "captured").length;
    const successRate = allOrders.length > 0 ? Math.round((successCount / allOrders.length) * 100) : 100;
    const statusFilter = typeof req.query?.status === "string" ? req.query.status : "all";
    const orders = statusFilter && statusFilter !== "all" ? allOrders.filter((o) => o.status === statusFilter) : allOrders;
    return res.status(200).json({ orders, stats: { todayRevenue, totalOrders: allOrders.length, successRate, refundCount } });
  }

  if (type === "users") {
    const listResult = await adminAuth.listUsers(500);
    const purchasesSnap = await adminDb.collection("purchases").get();
    const purchaseCountMap: Record<string, number> = {};
    purchasesSnap.docs.forEach((doc) => {
      const uid = doc.data().userId;
      if (uid) purchaseCountMap[uid] = (purchaseCountMap[uid] || 0) + 1;
    });
    const usersSnap = await adminDb.collection("users").get();
    const firestoreUserMap: Record<string, Record<string, unknown>> = {};
    usersSnap.docs.forEach((doc) => { firestoreUserMap[doc.id] = doc.data(); });
    const users = listResult.users.map((authUser) => {
      const fs = firestoreUserMap[authUser.uid] || {};
      const createdAt = authUser.metadata.creationTime || null;
      const lastLogin = authUser.metadata.lastSignInTime || null;
      const loyaltyDays = createdAt ? Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      return {
        id: authUser.uid, uid: authUser.uid, email: authUser.email || "",
        displayName: authUser.displayName || (fs.displayName as string) || null,
        photoURL: authUser.photoURL || (fs.photoURL as string) || null,
        isBanned: authUser.disabled || (fs.isBanned as boolean) || false,
        subscription: (fs.subscription as any) || null,
        stats: { notesPurchased: purchaseCountMap[authUser.uid] || 0, testsAttempted: (fs.stats as any)?.testsAttempted || 0, lastLogin, loyaltyDays },
        createdAt,
      };
    }).sort((a, b) => {
      if (!a.createdAt) return 1; if (!b.createdAt) return -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return res.status(200).json({ users });
  }

  if (type === "coupons") {
    const snap = await adminDb.collection("coupons").orderBy("createdAt", "desc").get();
    const coupons = snap.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        code: d.code || "",
        type: d.discountType === "percent" ? "percentage" : "fixed",
        value: d.discountValue ?? 0,
        minOrderAmount: d.minOrder ?? 0,
        usageLimit: d.maxUses ?? 0,
        usageCount: d.usesCount ?? 0,
        expiryDate: d.validUntil ?? null,
        status: d.isActive ? "active" : "disabled",
        description: d.description || "",
        applicableTo: d.applicableTo || "all",
        createdAt: d.createdAt ? d.createdAt.toDate().toISOString() : null,
        updatedAt: d.updatedAt ? d.updatedAt.toDate().toISOString() : null,
      };
    });
    return res.status(200).json({ coupons });
  }

  return res.status(400).json({ error: "Invalid type requested" });
}

async function handleSaveNote(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
  const ip = getClientIp(req);
  if (isRateLimited(`save-note:${ip}`, { windowMs: 60_000, maxRequests: 20 }))
    return res.status(429).json({ error: "Too many requests. Please wait a moment." });
  try { await verifyAdmin(req); } catch (err: any) { return res.status(err.status || 401).json({ error: err.message }); }

  const body = req.body || {};
  const noteId = sanitize(body.noteId);
  if (!noteId || !/^[\w\-]{1,128}$/.test(noteId))
    return res.status(400).json({ error: "Invalid noteId. Use slug format like: bns-complete-notes" });

  const rawFiles: unknown[] = Array.isArray(body.files) ? body.files : [];
  const isUpdateOnly = body.isUpdateOnly === true;

  if (!isUpdateOnly && rawFiles.length === 0) return res.status(400).json({ error: "At least one file must be provided for a new note." });
  if (rawFiles.length > 20) return res.status(400).json({ error: "Maximum 20 files per note." });

  const files: { name: string; key: string }[] = [];
  if (!isUpdateOnly) {
    for (const f of rawFiles) {
      if (typeof f !== "object" || f === null) continue;
      const ff = f as Record<string, unknown>;
      const name = sanitize(ff.name, 255);
      const key = typeof ff.key === "string" ? ff.key.replace(/^\/+/, "") : "";
      if (!name || !isSafeFilePath(key)) return res.status(400).json({ error: `Invalid file entry: ${JSON.stringify(f)}` });
      files.push({ name, key });
    }
    if (files.length === 0) return res.status(400).json({ error: "No valid files provided after validation." });
  }

  const metadata: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
  if (body.title) metadata.title = sanitize(body.title, 255, false);
  const previewPattern = /^previews\/[\w\-]{1,128}\.(jpg|jpeg|png|webp|gif)$/;
  if (typeof body.previewImageKey === "string" && previewPattern.test(body.previewImageKey)) metadata.previewImageKey = body.previewImageKey;
  if (Array.isArray(body.previewImageKeys)) {
    const validKeys = body.previewImageKeys.filter((k: unknown) => typeof k === "string" && previewPattern.test(k)).slice(0, 10);
    metadata.previewImageKeys = validKeys;
    if (validKeys.length > 0 && !metadata.previewImageKey) metadata.previewImageKey = validKeys[0];
  }
  if (typeof body.samplePdfKey === "string" && /^samples\/[\w\-]{1,128}\.pdf$/.test(body.samplePdfKey)) metadata.samplePdfKey = body.samplePdfKey;
  if (body.description) metadata.description = sanitize(body.description, MAX_LONG_STR, true);
  if (body.publicDescription) metadata.publicDescription = sanitize(body.publicDescription, MAX_LONG_STR, true);
  if (body.category) metadata.category = sanitize(body.category);
  if (body.subjectCode) metadata.subjectCode = sanitize(body.subjectCode, 32);
  if (body.price !== undefined) metadata.price = sanitizeNumber(body.price);
  if (body.originalPrice !== undefined) metadata.originalPrice = sanitizeNumber(body.originalPrice);
  if (body.totalPages !== undefined) metadata.totalPages = sanitizeNumber(body.totalPages);
  if (body.previewPages !== undefined) metadata.previewPages = sanitizeNumber(body.previewPages);
  if (body.language) { const lang = sanitize(body.language, 10); if (["English", "Hindi", "Both"].includes(lang)) metadata.language = lang; }
  if (typeof body.isFeatured === "boolean") metadata.isFeatured = body.isFeatured;
  if (typeof body.isNew === "boolean") metadata.isNew = body.isNew;
  if (body.slug) metadata.slug = sanitize(body.slug, 128, false);
  if (typeof body.audioSummaryKeyEnglish === "string" && /^audio\/[\w\-]{1,128}\.mp3$/.test(body.audioSummaryKeyEnglish)) metadata.audioSummaryKeyEnglish = body.audioSummaryKeyEnglish;
  if (typeof body.audioSummaryKeyHindi === "string" && /^audio\/[\w\-]{1,128}\.mp3$/.test(body.audioSummaryKeyHindi)) metadata.audioSummaryKeyHindi = body.audioSummaryKeyHindi;
  if (typeof body.infographicKey === "string" && /^infographics\/[\w\-]{1,128}\.(pdf|png|jpe?g|webp)$/.test(body.infographicKey)) metadata.infographicKey = body.infographicKey;
  if (typeof body.quizData === "string") metadata.quizData = sanitize(body.quizData, 30000, true);
  if (Array.isArray(body.contentFeatures)) metadata.contentFeatures = body.contentFeatures.slice(0, 30).map((f: unknown) => sanitize(f, 200, false)).filter(Boolean);
  if (Array.isArray(body.featuredSections)) metadata.featuredSections = body.featuredSections.slice(0, 20).map((s: any) => ({ title: sanitize(s?.title, 200, false), content: sanitize(s?.content, 5000, true) })).filter((s: any) => s.title);
  if (Array.isArray(body.tableOfContents)) metadata.tableOfContents = body.tableOfContents.slice(0, 100).map((t: unknown) => sanitize(t, 200, false)).filter(Boolean);

  const noteRef = adminDb.collection("notes").doc(noteId);
  const existing = await noteRef.get();
  if (existing.exists) {
    if (isUpdateOnly) {
      await noteRef.update(metadata);
    } else {
      const existingFiles: { name: string; key: string }[] = existing.data()?.fileKeys || [];
      const existingKeys = new Set(existingFiles.map((f) => f.key));
      const newFiles = files.filter((f) => !existingKeys.has(f.key));
      const mergedFiles = [...existingFiles, ...newFiles];
      await noteRef.update({ ...metadata, fileKey: mergedFiles[0]?.key || "", fileKeys: mergedFiles });
    }
  } else {
    await noteRef.set({
      ...metadata, id: noteId, slug: metadata.slug || noteId,
      createdAt: FieldValue.serverTimestamp(), isFeatured: metadata.isFeatured ?? false,
      isNew: metadata.isNew ?? true, previewPages: metadata.previewPages ?? 5,
      totalPages: metadata.totalPages ?? 0, tableOfContents: metadata.tableOfContents ?? [],
      thumbnailUrl: "", pdfUrl: files[0].key, fileKey: files[0].key, fileKeys: files,
    });
  }
  return res.status(200).json({ success: true, noteId, filesAdded: files.length });
}

async function handleGetUploadUrl(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
  const ip = getClientIp(req);
  if (isRateLimited(`upload:${ip}`, { windowMs: 60_000, maxRequests: 25 }))
    return res.status(429).json({ error: "Too many requests. Please wait a moment." });
  try { await verifyAdmin(req); } catch (err: any) { return res.status(err.status || 401).json({ error: err.message }); }

  const { fileName: rawFileName, noteId, fileSize } = req.body || {};
  const fileName = typeof rawFileName === "string" ? cleanFilePath(rawFileName) : "";
  const isPreview = isSafePreviewPath(fileName);
  const isPdf = isSafeFilePath(fileName);
  const isAudio = typeof fileName === "string" && /^audio\/[\w\-]{1,128}\.mp3$/.test(fileName);
  const isInfo = typeof fileName === "string" && /^infographics\/[\w\-]{1,128}\.(pdf|png|jpe?g|webp)$/.test(fileName);

  if (!isPreview && !isPdf && !isAudio && !isInfo)
    return res.status(400).json({ error: "Invalid file path. Use 'notes/', 'samples/', 'previews/', 'audio/', or 'infographics/' prefixes." });

  const maxSize = isPreview ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
  if (typeof fileSize === "number" && fileSize > maxSize)
    return res.status(400).json({ error: isPreview ? "Image too large. Max 5 MB." : "File too large. Max 50 MB." });

  if (!isPreview && isPdf && (!noteId || typeof noteId !== "string" || !/^[\w\-]{1,128}$/.test(noteId)))
    return res.status(400).json({ error: "Invalid noteId." });

  let contentType = "application/octet-stream";
  if (isAudio) contentType = "audio/mpeg";
  else if (isInfo && fileName.endsWith(".pdf")) contentType = "application/pdf";
  else if ((isPreview || isInfo) && fileName.endsWith(".png")) contentType = "image/png";
  else if ((isPreview || isInfo) && fileName.endsWith(".webp")) contentType = "image/webp";
  else if ((isPreview || isInfo) && fileName.endsWith(".gif")) contentType = "image/gif";
  else if (isPreview || isInfo) contentType = "image/jpeg";
  else if (isPdf) contentType = "application/pdf";

  const r2 = new S3Client({
    region: "auto", endpoint: process.env.R2_ENDPOINT || "",
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID || "", secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "" },
    forcePathStyle: true,
  });
  const command = new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME || "edulaw-pdfs", Key: fileName, ContentType: contentType });
  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 });
  return res.status(200).json({ uploadUrl, key: fileName });
}

async function handleUpdateUser(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
  const ip = getClientIp(req);
  if (isRateLimited(`update-user:${ip}`, { windowMs: 60_000, maxRequests: 30 }))
    return res.status(429).json({ error: "Too many requests." });
  try { await verifyAdmin(req); } catch (err: any) { return res.status(err.status || 401).json({ error: err.message }); }

  const { uid, action, payload } = req.body || {};
  if (!uid || typeof uid !== "string") return res.status(400).json({ error: "Missing uid." });

  if (action === "ban") {
    await adminAuth.updateUser(uid, { disabled: true });
    await adminDb.collection("users").doc(uid).set({ isBanned: true, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return res.status(200).json({ success: true, message: "User banned." });
  }
  if (action === "unban") {
    await adminAuth.updateUser(uid, { disabled: false });
    await adminDb.collection("users").doc(uid).set({ isBanned: false, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return res.status(200).json({ success: true, message: "User unbanned." });
  }
  if (action === "gift_subscription") {
    const { planId, durationDays = 365 } = payload || {};
    if (!planId) return res.status(400).json({ error: "Missing planId in payload." });
    const expiresAt = new Date(); expiresAt.setDate(expiresAt.getDate() + durationDays);
    await adminDb.collection("users").doc(uid).set({
      subscription: { planId, status: "active", expiresAt: expiresAt.toISOString(), grantedAt: new Date().toISOString() },
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    return res.status(200).json({ success: true, message: `Subscription '${planId}' granted for ${durationDays} days.` });
  }
  return res.status(400).json({ error: `Unknown action: ${action}` });
}

async function handleSettings(req: any, res: any) {
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  const ip = getClientIp(req);
  if (isRateLimited(ip, { windowMs: 60_000, maxRequests: 30 })) return res.status(429).json({ error: "Too many requests." });
  try { await verifyAdmin(req); } catch (err: any) { return res.status(err.status || 401).json({ error: err.message }); }

  const ref = adminDb.collection("system").doc("settings");
  if (req.method === "GET") {
    const snap = await ref.get();
    if (snap.exists) return res.status(200).json({ settings: snap.data() });
    return res.status(200).json({ settings: { siteName: "The EduLaw", siteTagline: "India's Premium Legal Notes Shop", supportEmail: "support@theedulaw.in", supportWhatsApp: "+91 98765 43210", socialLinks: { instagram: "https://instagram.com/theedulaw", telegram: "https://t.me/theedulaw", twitter: "" }, maintenanceMode: false, allowRegistrations: true, version: "2.0.0" } });
  }
  const body = req.body as Record<string, unknown>;
  if (!body || typeof body !== "object") return res.status(400).json({ error: "Invalid body." });
  await ref.set({ ...body, updatedAt: new Date().toISOString() }, { merge: true });
  return res.status(200).json({ ok: true });
}

async function handleDeleteFile(req: any, res: any) {
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method Not Allowed" });
  const ip = getClientIp(req);
  if (isRateLimited(`delete-file:${ip}`, { windowMs: 60_000, maxRequests: 20 }))
    return res.status(429).json({ error: "Too many requests." });
  try { await verifyAdmin(req); } catch (err: any) { return res.status(err.status || 401).json({ error: err.message }); }

  const { noteId, fileKey } = req.body || {};
  if (!noteId || typeof noteId !== "string" || !/^[\w\-]{1,128}$/.test(noteId)) return res.status(400).json({ error: "Invalid noteId." });
  const cleanKey = typeof fileKey === "string" ? fileKey.replace(/^\/+/, "") : "";
  if (!isSafeFilePath(cleanKey)) return res.status(400).json({ error: "Invalid fileKey." });

  const noteRef = adminDb.collection("notes").doc(noteId);
  const snap = await noteRef.get();
  if (!snap.exists) return res.status(404).json({ error: "Note not found." });
  const data = snap.data()!;
  const existingFiles: { name: string; key: string }[] = data.fileKeys || [];
  const updatedFiles = existingFiles.filter((f) => f.key !== cleanKey);
  await noteRef.update({ fileKeys: updatedFiles, fileKey: updatedFiles[0]?.key || "", updatedAt: FieldValue.serverTimestamp() });
  return res.status(200).json({ success: true, remainingFiles: updatedFiles.length });
}

async function handleDeleteProduct(req: any, res: any) {
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({ error: "Missing or invalid token" });
  const token = authHeader.split("Bearer ")[1];
  const decodedToken = await adminAuth.verifyIdToken(token);
  const email = decodedToken.email || "";
  const adminEmails = (process.env.VITE_ADMIN_EMAILS || "adityakuwad2003@gmail.com").split(",").map((e) => e.trim().toLowerCase());
  if (!adminEmails.includes(email.toLowerCase())) return res.status(403).json({ error: "Forbidden: Admin access required" });

  const { productId, collectionName } = req.body;
  if (!productId || !collectionName) return res.status(400).json({ error: "Missing productId or collectionName" });
  const allowedCollections = ["notes", "bundles", "mockTests", "templates"];
  if (!allowedCollections.includes(collectionName)) return res.status(400).json({ error: "Invalid collection name" });
  await adminDb.collection(collectionName).doc(productId).delete();
  return res.status(200).json({ success: true, message: "Product deleted successfully" });
}

async function handleSaveCoupon(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
  const ip = getClientIp(req);
  if (isRateLimited(`save-coupon:${ip}`, { windowMs: 60_000, maxRequests: 30 }))
    return res.status(429).json({ error: "Too many requests." });
  try { await verifyAdmin(req); } catch (err: any) { return res.status(err.status || 401).json({ error: err.message }); }

  const body = req.body || {};
  const { id, code, discountType, discountValue, minOrder, maxUses, usesCount, validUntil, applicableTo, isActive, description } = body;

  if (!code || discountValue === undefined || discountValue === null) {
    return res.status(400).json({ error: "Code and discountValue are required." });
  }

  const payload: Record<string, any> = {
    code: String(code).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 32),
    discountType: discountType === "percent" ? "percent" : "flat",
    discountValue: sanitizeNumber(discountValue),
    minOrder: sanitizeNumber(minOrder),
    maxUses: sanitizeNumber(maxUses),
    validUntil: typeof validUntil === "string" ? validUntil : null,
    applicableTo: ["all", "notes", "bundles", "subscription"].includes(applicableTo) ? applicableTo : "all",
    isActive: Boolean(isActive),
    description: sanitize(description || "", 500),
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (id) {
    const ref = adminDb.collection("coupons").doc(String(id));
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Coupon not found." });
    await ref.update(payload);
    return res.status(200).json({ success: true, id });
  } else {
    const docRef = await adminDb.collection("coupons").add({
      ...payload,
      usesCount: sanitizeNumber(usesCount),
      createdAt: FieldValue.serverTimestamp(),
    });
    return res.status(200).json({ success: true, id: docRef.id });
  }
}

async function handleSendCampaign(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
  const ip = getClientIp(req);
  if (isRateLimited(`send-campaign:${ip}`, { windowMs: 60_000, maxRequests: 5 }))
    return res.status(429).json({ error: "Too many requests." });
  try { await verifyAdmin(req); } catch (err: any) { return res.status(err.status || 401).json({ error: err.message }); }

  const { campaignId } = req.body || {};
  if (!campaignId) return res.status(400).json({ error: "Missing campaignId." });

  const ref = adminDb.collection("campaigns").doc(campaignId);
  const snap = await ref.get();
  if (!snap.exists) return res.status(404).json({ error: "Campaign not found." });
  const campaign = snap.data()!;

  if (campaign.status === "sent") return res.status(400).json({ error: "Campaign already sent." });

  // 1. Fetch audience emails
  let emails: string[] = [];
  
  if (campaign.audience === "all_students") {
    // For large userbases, you'd paginate this. For now, max 1000
    const listResult = await adminAuth.listUsers(1000);
    emails = listResult.users.filter(u => u.email).map(u => u.email!);
  } else if (campaign.audience === "premium_subscribers") {
    const listResult = await adminAuth.listUsers(1000);
    const usersSnap = await adminDb.collection("users").where("subscription.status", "==", "active").get();
    const premiumUids = new Set(usersSnap.docs.map(d => d.id));
    emails = listResult.users.filter(u => u.email && premiumUids.has(u.uid)).map(u => u.email!);
  } else if (campaign.audience === "recent_buyers") {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const purchasesSnap = await adminDb.collection("purchases").where("purchasedAt", ">=", thirtyDaysAgo).get();
    emails = Array.from(new Set(purchasesSnap.docs.map(d => d.data().userEmail || d.data().userId).filter(e => e && e.includes("@"))));
  } else {
    // fallback or 'inactive_users' (simulated)
    const listResult = await adminAuth.listUsers(500);
    emails = listResult.users.filter(u => u.email).map(u => u.email!);
  }

  // Ensure unique and valid emails
  emails = Array.from(new Set(emails)).filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
  
  if (emails.length === 0) {
    await ref.update({ status: "sent", sentAt: FieldValue.serverTimestamp(), sentCount: 0 });
    return res.status(200).json({ success: true, sentCount: 0 });
  }

  // 2. Send via Resend
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn("No RESEND_API_KEY found. Simulating send to", emails.length, "users.");
    await ref.update({ status: "sent", sentAt: FieldValue.serverTimestamp(), sentCount: emails.length });
    return res.status(200).json({ success: true, sentCount: emails.length, simulated: true });
  }

  const resend = new Resend(resendKey);
  const BATCH_SIZE = 90; // Resend batch limit is 100
  let totalSent = 0;

  try {
    const senderEmail = process.env.VITE_SENDER_EMAIL || "updates@theedulaw.in"; 
    
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE).map(email => ({
        from: `The EduLaw Store <${senderEmail}>`,
        to: [email],
        subject: campaign.subject || "EduLaw Update",
        html: campaign.content || "<p>Hello from EduLaw!</p>",
      }));
      
      const { data, error } = await resend.batch.send(batch);
      if (error) {
        console.error("Resend batch error:", error);
      } else {
        totalSent += batch.length;
      }
    }

    await ref.update({ status: "sent", sentAt: FieldValue.serverTimestamp(), sentCount: totalSent });
    return res.status(200).json({ success: true, sentCount: totalSent });
  } catch (err) {
    console.error("Failed to send campaign emails:", err);
    return res.status(500).json({ error: "Failed to send emails via Resend." });
  }
}

async function handleSeedPlayground(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
  try { await verifyAdmin(req); } catch (err: any) { return res.status(err.status || 401).json({ error: err.message }); }

  const body = req.body || {};
  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) return res.status(400).json({ error: "No items provided." });

  const batch = adminDb.batch();
  items.forEach((item) => {
    const { id, ...data } = item;
    const ref = id 
      ? adminDb.collection("playground_content").doc(id)
      : adminDb.collection("playground_content").doc();
    batch.set(ref, { 
      ...data, 
      createdAt: FieldValue.serverTimestamp(), 
      updatedAt: FieldValue.serverTimestamp() 
    }, { merge: true });
  });
  await batch.commit();

  return res.status(200).json({ success: true, count: items.length });
}

// ─── Main router ──────────────────────────────────────────────────────────────

export default async function handler(req: any, res: any) {
  try {
    const origin = req.headers.origin || "";
    // Allow all standard methods
    setCorsHeaders(res, origin, "GET, POST, DELETE, OPTIONS");
    if (req.method === "OPTIONS") return res.status(204).end();

    // Extract the route from the URL path
    // e.g. /api/admin/save-note → "save-note"
    const urlPath = req.url || "";
    const segments = urlPath.split("?")[0].split("/").filter(Boolean);
    // segments = ["api", "admin", "save-note"]
    const route = segments[segments.length - 1] || "";

    switch (route) {
      case "dashboard-stats":  return await handleDashboardStats(req, res);
      case "list-data":        return await handleListData(req, res);
      case "save-note":        return await handleSaveNote(req, res);
      case "get-upload-url":   return await handleGetUploadUrl(req, res);
      case "update-user":      return await handleUpdateUser(req, res);
      case "settings":         return await handleSettings(req, res);
      case "delete-file":      return await handleDeleteFile(req, res);
      case "delete-product":   return await handleDeleteProduct(req, res);
      case "save-coupon":      return await handleSaveCoupon(req, res);
      case "send-campaign":    return await handleSendCampaign(req, res);
      case "seed-playground":  return await handleSeedPlayground(req, res);
      default:
        return res.status(404).json({ error: `Unknown admin route: ${route}` });
    }
  } catch (err: any) {
    console.error("Admin router unhandled error:", err);
    return res.status(500).json({ error: err?.message || "An unexpected server error occurred." });
  }
}
