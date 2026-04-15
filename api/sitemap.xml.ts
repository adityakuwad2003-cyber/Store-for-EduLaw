import { adminDb } from "./_lib/adminInit";

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function generateUrl(loc: string, lastmod: string, changefreq: string, priority: string) {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export default async function handler(req: any, res: any) {
  try {
    const baseUrl = "https://www.store.theedulaw.in";
    const today = new Date().toISOString().split("T")[0];

    const urls: string[] = [];

    // 1. Static Core Hubs
    urls.push(generateUrl(`${baseUrl}/`, today, "daily", "1.0"));
    urls.push(generateUrl(`${baseUrl}/marketplace`, today, "daily", "1.0"));
    urls.push(generateUrl(`${baseUrl}/legal-playground`, today, "daily", "1.0"));
    urls.push(generateUrl(`${baseUrl}/legal-news`, today, "daily", "0.95"));
    urls.push(generateUrl(`${baseUrl}/legal-hub`, today, "daily", "0.9"));
    urls.push(generateUrl(`${baseUrl}/mock-tests`, today, "weekly", "0.9"));
    urls.push(generateUrl(`${baseUrl}/bundles`, today, "weekly", "0.9"));
    urls.push(generateUrl(`${baseUrl}/templates`, today, "weekly", "0.9"));
    urls.push(generateUrl(`${baseUrl}/legal-services`, today, "monthly", "0.8"));
    urls.push(generateUrl(`${baseUrl}/community`, today, "daily", "0.8"));
    urls.push(generateUrl(`${baseUrl}/subscription`, today, "monthly", "0.8"));
    urls.push(generateUrl(`${baseUrl}/college-licensing`, today, "monthly", "0.8"));
    urls.push(generateUrl(`${baseUrl}/referral`, today, "monthly", "0.6"));

    // Playground sections (Anchors)
    const sections = ["daily-tools", "case-law", "digest", "legal-news", "flashcards", "blogs", "glossary"];
    sections.forEach(sec => {
      urls.push(generateUrl(`${baseUrl}/legal-playground#${sec}`, today, "daily", "0.8"));
    });

    // 2. Dynamic Categories
    const categories = [
      "criminal-law", "constitutional-law", "civil-law", "corporate-law", 
      "family-law", "special-acts", "public-law", "foundation", "evidence", 
      "criminal-procedure", "drafting", "adr", "procedural", "international-law"
    ];
    categories.forEach(cat => {
      urls.push(generateUrl(`${baseUrl}/category/${cat}`, today, "weekly", "0.9"));
    });

    // Fetch dynamic content simultaneously
    const [notesSnap, bundlesSnap, mockTestsSnap, templatesSnap, blogsSnap, newsSnap] = await Promise.all([
      adminDb.collection("notes").get(),
      adminDb.collection("bundles").get(),
      adminDb.collection("mockTests").get(),
      adminDb.collection("templates").get(),
      adminDb.collection("blogs").get(),
      adminDb.collection("playground_content").get()
    ]);

    // Format utility
    const getDate = (doc: any) => {
      const data = doc.data();
      if (data.updatedAt) return data.updatedAt.toDate().toISOString().split("T")[0];
      if (data.createdAt) return data.createdAt.toDate().toISOString().split("T")[0];
      if (data.publishedAt) return new Date(data.publishedAt).toISOString().split("T")[0];
      return today;
    };

    // 3. Notes (Products)
    notesSnap.docs.forEach(doc => {
      const slug = doc.data().slug || doc.id;
      urls.push(generateUrl(`${baseUrl}/product/${slug}`, getDate(doc), "monthly", "1.0"));
    });

    // 4. Bundles
    bundlesSnap.docs.forEach(doc => {
      const slug = doc.data().slug || doc.id;
      urls.push(generateUrl(`${baseUrl}/bundles`, getDate(doc), "monthly", "0.8")); // Deep bundles links don't seem to exist universally outside marketplace, actually wait: bundles uses note detail
      urls.push(generateUrl(`${baseUrl}/product/${slug}`, getDate(doc), "monthly", "0.8"));
    });

    // 5. Mock Tests
    mockTestsSnap.docs.forEach(doc => {
      const slug = doc.data().slug || doc.id;
      urls.push(generateUrl(`${baseUrl}/mock-tests/${slug}`, getDate(doc), "monthly", "0.9"));
    });

    // 6. Templates
    templatesSnap.docs.forEach(doc => {
      const slug = doc.data().slug || doc.id;
      urls.push(generateUrl(`${baseUrl}/product/${slug}`, getDate(doc), "monthly", "0.8"));
    });

    // 7. Blogs
    blogsSnap.docs.forEach(doc => {
      const slug = doc.data().slug || doc.id;
      urls.push(generateUrl(`${baseUrl}/blog/${slug}`, getDate(doc), "monthly", "0.8"));
    });

    // 8. Legal Playground Items
    newsSnap.docs.forEach(doc => {
      const data = doc.data();
      const type = data.type;
      const slug = data.slug || doc.id;
      if (type) {
        urls.push(generateUrl(`${baseUrl}/legal-playground/${type}/${slug}`, getDate(doc), "monthly", "0.9"));
      } else {
        urls.push(generateUrl(`${baseUrl}/legal-news/${doc.id}`, getDate(doc), "monthly", "0.9")); // Fallback for old news structure if any
      }
    });

    // Add legal pages
    urls.push(generateUrl(`${baseUrl}/privacy-policy`, today, "yearly", "0.3"));
    urls.push(generateUrl(`${baseUrl}/terms-of-service`, today, "yearly", "0.3"));
    urls.push(generateUrl(`${baseUrl}/refund-policy`, today, "yearly", "0.3"));

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    res.status(200).send(sitemap);

  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).end();
  }
}
