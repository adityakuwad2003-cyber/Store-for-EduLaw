/**
 * DELETE /api/admin/delete-file
 * Admin-only. Removes a specific file entry from a note's fileKeys array in Firestore.
 * Does NOT delete from R2 (files are cheap, deletion is irreversible).
 */
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../_lib/adminInit";
import { setCorsHeaders, verifyAdmin, isRateLimited, getClientIp, isSafeFilePath } from "../_lib/security";

export default async function handler(req: any, res: any) {
  try {
  const origin = req.headers.origin || "";
  setCorsHeaders(res, origin, "DELETE, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method Not Allowed" });

  const ip = getClientIp(req);
  if (isRateLimited(`delete-file:${ip}`, { windowMs: 60_000, maxRequests: 20 })) {
    return res.status(429).json({ error: "Too many requests." });
  }

  try {
    await verifyAdmin(req);
  } catch (err: any) {
    return res.status(err.status || 401).json({ error: err.message });
  }

  const { noteId, fileKey } = req.body || {};

  if (!noteId || typeof noteId !== "string" || !/^[\w\-]{1,128}$/.test(noteId)) {
    return res.status(400).json({ error: "Invalid noteId." });
  }

  const cleanKey = typeof fileKey === "string" ? fileKey.replace(/^\/+/, "") : "";
  if (!isSafeFilePath(cleanKey)) {
    return res.status(400).json({ error: "Invalid fileKey." });
  }

  try {
    const noteRef = adminDb.collection("notes").doc(noteId);
    const snap = await noteRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Note not found." });

    const data = snap.data()!;
    const existingFiles: { name: string; key: string }[] = data.fileKeys || [];
    const updatedFiles = existingFiles.filter((f) => f.key !== cleanKey);

    await noteRef.update({
      fileKeys: updatedFiles,
      fileKey: updatedFiles[0]?.key || "",
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ success: true, remainingFiles: updatedFiles.length });
  } catch (err) {
    console.error("delete-file error:", err);
    return res.status(500).json({ error: "Failed to remove file." });
  }
  } catch (err: any) {
    console.error("Unhandled error in delete-file:", err);
    return res.status(500).json({ error: err?.message || "An unexpected server error occurred." });
  }
}
