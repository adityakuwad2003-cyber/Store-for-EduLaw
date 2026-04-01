/**
 * POST /api/admin/seed-database
 * Admin-only script to migrate hardcoded static notes and bundles into Firestore.
 * This should usually be run ONCE manually by the developer/admin.
 */
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../lib/adminInit";
import { setCorsHeaders, verifyAdmin } from "../lib/security";

// Import local static data
import { notesData, bundles } from "../../src/data/notes";

export default async function handler(req: any, res: any) {
  try {
    const origin = req.headers.origin || "";
    setCorsHeaders(res, origin, "POST, OPTIONS");

    if (req.method === "OPTIONS") return res.status(204).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

    // Verify Admin authentication
    try {
      await verifyAdmin(req);
    } catch (err: any) {
      return res.status(err.status || 401).json({ error: err.message });
    }

    let notesMigrated = 0;
    let bundlesMigrated = 0;

    // 1. Migrate Notes
    const notesBatch = adminDb.batch();
    for (const note of notesData) {
      // Use the static slug as the document ID for absolute consistency
      const docRef = adminDb.collection("notes").doc(note.slug);
      notesBatch.set(docRef, {
        id: note.slug,
        title: note.title,
        slug: note.slug,
        description: note.description,
        category: note.category,
        subjectCode: note.subjectCode,
        price: note.price,
        originalPrice: note.originalPrice,
        previewPages: note.previewPages,
        totalPages: note.totalPages,
        thumbnailUrl: note.thumbnailUrl || "",
        pdfUrl: note.pdfUrl || "",
        // Maintain backwards and forwards file compatibility natively
        fileKey: note.fileKey || note.pdfUrl?.replace(/^\//, "") || "",
        fileKeys: [
          {
            name: note.title,
            key: note.fileKey || note.pdfUrl?.replace(/^\//, "") || ""
          }
        ],
        isFeatured: note.isFeatured,
        isNew: note.isNew,
        language: note.language,
        tableOfContents: note.tableOfContents || [],
        createdAt: note.createdAt ? new Date(note.createdAt) : FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true }); // Merge true preserves user modifications if ran twice by accident
      notesMigrated++;

      // Firebase limits batches to 500 ops. If catalog is huge, you'd chunk it.
      // Since it's ~35 notes, a single batch works perfectly natively.
    }
    await notesBatch.commit();

    // 2. Migrate Bundles
    const bundlesBatch = adminDb.batch();
    for (const bundle of bundles) {
      const docRef = adminDb.collection("bundles").doc(bundle.id);
      bundlesBatch.set(docRef, {
        id: bundle.id,
        title: bundle.title,
        description: bundle.description,
        price: bundle.price,
        originalPrice: bundle.originalPrice,
        savings: bundle.savings,
        features: bundle.features,
        popular: bundle.popular || false,
        noteSlugs: bundle.notes.map((n: any) => n.slug), // Map out what notes it includes
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      bundlesMigrated++;
    }
    await bundlesBatch.commit();

    return res.status(200).json({ 
      success: true, 
      message: `Successfully seeded ${notesMigrated} notes and ${bundlesMigrated} bundles to Firebase.`
    });
  } catch (err: any) {
    console.error("Unhanded database seed error:", err);
    return res.status(500).json({ error: err?.message || "Internal server error during database seeding." });
  }
}
