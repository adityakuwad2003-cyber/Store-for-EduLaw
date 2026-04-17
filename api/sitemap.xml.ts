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
    urls.push(generateUrl(`${baseUrl}/bundles`, today, "weekly", "0.9"));   // single entry — not per bundle doc
    urls.push(generateUrl(`${baseUrl}/templates`, today, "weekly", "0.9"));
    urls.push(generateUrl(`${baseUrl}/legal-services`, today, "monthly", "0.8"));
    urls.push(generateUrl(`${baseUrl}/community`, today, "daily", "0.8"));
    urls.push(generateUrl(`${baseUrl}/subscription`, today, "monthly", "0.8"));
    urls.push(generateUrl(`${baseUrl}/college-licensing`, today, "monthly", "0.8"));
    urls.push(generateUrl(`${baseUrl}/judgement-finder`, today, "daily", "0.95"));
    urls.push(generateUrl(`${baseUrl}/referral`, today, "monthly", "0.6"));
    urls.push(generateUrl(`${baseUrl}/vakil-connect`, today, "monthly", "0.8"));

    // 1.5 Modular Playground Sub-routes
    const playgroundRoutes = ["quiz", "case-law", "digest", "flashcards", "insights", "lexicon"];
    playgroundRoutes.forEach(route => {
      urls.push(generateUrl(`${baseUrl}/legal-playground/${route}`, today, "daily", "0.85"));
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

    // Fetch all dynamic content simultaneously
    const [
      notesSnap,
      bundlesSnap,
      mockTestsSnap,
      templatesSnap,
      blogsSnap,
      playgroundSnap,
      legalNewsSnap,
    ] = await Promise.all([
      adminDb.collection("notes").get(),
      adminDb.collection("bundles").get(),
      adminDb.collection("mockTests").get(),
      adminDb.collection("templates").get(),
      adminDb.collection("blog_articles").get(),
      adminDb.collection("playground_content").where("contentType", "!=", "daily_news").get(),
      adminDb.collection("playground_content").where("contentType", "==", "daily_news").get(),
    ]);

    // Format utility
    const getDate = (doc: any) => {
      const data = doc.data();
      if (data.updatedAt?.toDate) return data.updatedAt.toDate().toISOString().split("T")[0];
      if (data.createdAt?.toDate) return data.createdAt.toDate().toISOString().split("T")[0];
      if (data.publishedAt) return new Date(data.publishedAt).toISOString().split("T")[0];
      return today;
    };

    // 3. Notes (Products)
    notesSnap.docs.forEach(doc => {
      const slug = doc.data().slug || doc.id;
      urls.push(generateUrl(`${baseUrl}/product/${slug}`, getDate(doc), "monthly", "1.0"));
    });

    // 4. Bundles — only individual product pages, /bundles hub already added above
    bundlesSnap.docs.forEach(doc => {
      const slug = doc.data().slug || doc.id;
      if (slug) {
        urls.push(generateUrl(`${baseUrl}/product/${slug}`, getDate(doc), "monthly", "0.8"));
      }
    });

    // 5. Mock Tests
    mockTestsSnap.docs.forEach(doc => {
      const slug = doc.data().slug || doc.id;
      urls.push(generateUrl(`${baseUrl}/mock-tests/${slug}`, getDate(doc), "monthly", "0.9"));
    });

    // 6. Templates — no individual detail pages currently, skip product links for templates
    // (templates page is a store, not individual detail pages)
    void templatesSnap; // referenced to avoid unused-var warning

    // 7. Blogs
    blogsSnap.docs.forEach(doc => {
      const slug = doc.data().slug || doc.id;
      urls.push(generateUrl(`${baseUrl}/blog/${slug}`, getDate(doc), "monthly", "0.8"));
    });

    // 8. Playground Items (non-news content) — route is /playground-item/:id
    playgroundSnap.docs.forEach(doc => {
      urls.push(generateUrl(`${baseUrl}/playground-item/${doc.id}`, getDate(doc), "monthly", "0.9"));
    });

    // 9. Legal News Articles — individual article pages at /legal-news/:id
    // Reads from playground_content where contentType == 'daily_news'
    legalNewsSnap.docs.forEach(doc => {
      urls.push(generateUrl(`${baseUrl}/legal-news/${doc.id}`, getDate(doc), "weekly", "0.85"));
    });

    // 10. Legal / policy pages
    urls.push(generateUrl(`${baseUrl}/privacy-policy`, today, "yearly", "0.3"));
    urls.push(generateUrl(`${baseUrl}/terms-of-service`, today, "yearly", "0.3"));
    urls.push(generateUrl(`${baseUrl}/refund-policy`, today, "yearly", "0.3"));

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    // 10-min CDN cache — fresh enough for new content, light on Firestore reads
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=86400");
    res.status(200).send(sitemap);

  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).end();
  }
}
