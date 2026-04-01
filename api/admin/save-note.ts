/**
 * POST /api/admin/save-note
 * 
 * Admin-only. After files are uploaded to R2, call this to create or
 * update a note document in Firestore with the file metadata.
 * 
 * Supports: creating new notes / adding files to existing notes.
 * 
 * Security:
 * - Admin email whitelist
 * - Rate limited (20/minute per IP)
 * - All string fields sanitized to prevent injection
 */
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../lib/adminInit";
import {
  setCorsHeaders, verifyAdmin, isRateLimited,
  getClientIp, isSafeFilePath, isSafeId,
} from "../lib/security";

// Max string length for text fields
const MAX_STR = 512;

function sanitize(val: unknown, maxLen = MAX_STR): string {
  if (typeof val !== "string") return "";
  // Strip HTML tags and control characters, then truncate
  return val.replace(/<[^>]*>/g, "").replace(/[\x00-\x1f\x7f]/g, "").trim().slice(0, maxLen);
}

function sanitizeNumber(val: unknown, fallback = 0): number {
  const n = Number(val);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export default async function handler(req: any, res: any) {
  try {
  const origin = req.headers.origin || "";
  setCorsHeaders(res, origin, "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  // ── Rate limit ──────────────────────────────────────────────────────────
  const ip = getClientIp(req);
  if (isRateLimited(`save-note:${ip}`, { windowMs: 60_000, maxRequests: 20 })) {
    return res.status(429).json({ error: "Too many requests. Please wait a moment." });
  }

  // ── Admin auth ──────────────────────────────────────────────────────────
  try {
    await verifyAdmin(req);
  } catch (err: any) {
    return res.status(err.status || 401).json({ error: err.message });
  }

  const body = req.body || {};

  // ── Required fields validation ──────────────────────────────────────────
  const noteId = sanitize(body.noteId);
  if (!noteId || !/^[\w\-]{1,128}$/.test(noteId)) {
    return res.status(400).json({ error: "Invalid noteId. Use slug format like: bns-complete-notes" });
  }

  // ── File array validation ───────────────────────────────────────────────
  const rawFiles: unknown[] = Array.isArray(body.files) ? body.files : [];
  const isUpdateOnly = body.isUpdateOnly === true;

  if (!isUpdateOnly && rawFiles.length === 0) {
    return res.status(400).json({ error: "At least one file must be provided for a new note." });
  }
  if (rawFiles.length > 20) {
    return res.status(400).json({ error: "Maximum 20 files per note." });
  }

  const files: { name: string; key: string }[] = [];
  if (!isUpdateOnly) {
    for (const f of rawFiles) {
      if (typeof f !== "object" || f === null) continue;
      const ff = f as Record<string, unknown>;
      const name = sanitize(ff.name, 255);
      const key = typeof ff.key === "string" ? ff.key.replace(/^\/+/, "") : "";
      if (!name || !isSafeFilePath(key)) {
        return res.status(400).json({ error: `Invalid file entry: ${JSON.stringify(f)}` });
      }
      files.push({ name, key });
    }

    if (files.length === 0) {
      return res.status(400).json({ error: "No valid files provided after validation." });
    }
  }

  // ── Optional metadata fields ────────────────────────────────────────────
  const metadata: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (body.title) metadata.title = sanitize(body.title);
  if (body.description) metadata.description = sanitize(body.description, 2000);
  if (body.category) metadata.category = sanitize(body.category);
  if (body.subjectCode) metadata.subjectCode = sanitize(body.subjectCode, 32);
  if (body.price !== undefined) metadata.price = sanitizeNumber(body.price);
  if (body.originalPrice !== undefined) metadata.originalPrice = sanitizeNumber(body.originalPrice);
  if (body.totalPages !== undefined) metadata.totalPages = sanitizeNumber(body.totalPages);
  if (body.previewPages !== undefined) metadata.previewPages = sanitizeNumber(body.previewPages);
  if (body.language) {
    const lang = sanitize(body.language, 10);
    if (["English", "Hindi", "Both"].includes(lang)) metadata.language = lang;
  }
  if (typeof body.isFeatured === "boolean") metadata.isFeatured = body.isFeatured;
  if (typeof body.isNew === "boolean") metadata.isNew = body.isNew;
  if (body.slug) metadata.slug = sanitize(body.slug);
  if (Array.isArray(body.tableOfContents)) {
    metadata.tableOfContents = body.tableOfContents
      .slice(0, 50)
      .map((t: unknown) => sanitize(t, 200))
      .filter(Boolean);
  }

  // ── Upsert note in Firestore ────────────────────────────────────────────
  try {
    const noteRef = adminDb.collection("notes").doc(noteId);
    const existing = await noteRef.get();

    if (existing.exists) {
      if (isUpdateOnly) {
        await noteRef.update(metadata);
      } else {
        // Merge files with existing ones (avoid duplicates by key)
        const existingFiles: { name: string; key: string }[] = existing.data()?.fileKeys || [];
        const existingKeys = new Set(existingFiles.map((f) => f.key));
        const newFiles = files.filter((f) => !existingKeys.has(f.key));
        const mergedFiles = [...existingFiles, ...newFiles];

        await noteRef.update({
          ...metadata,
          fileKey: mergedFiles[0]?.key || "",
          fileKeys: mergedFiles,
        });
      }
    } else {
      // Create new note document
      await noteRef.set({
        ...metadata,
        id: noteId,
        slug: metadata.slug || noteId,
        createdAt: FieldValue.serverTimestamp(),
        isFeatured: metadata.isFeatured ?? false,
        isNew: metadata.isNew ?? true,
        previewPages: metadata.previewPages ?? 5,
        totalPages: metadata.totalPages ?? 0,
        tableOfContents: metadata.tableOfContents ?? [],
        thumbnailUrl: "",
        pdfUrl: files[0].key,
        fileKey: files[0].key,
        fileKeys: files,
      });
    }

    return res.status(200).json({ success: true, noteId, filesAdded: files.length });
  } catch (err) {
    console.error("Firestore save-note error:", err);
    return res.status(500).json({ error: "Failed to save note metadata." });
  }
  } catch (err: any) {
    console.error("Unhandled error in save-note:", err);
    return res.status(500).json({ error: err?.message || "An unexpected server error occurred." });
  }
}
