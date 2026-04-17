/**
 * POST /api/ping-google
 *
 * Pings Google Search Console to re-fetch the sitemap immediately
 * after new content is published. Called automatically by the admin
 * panel whenever a blog article or news item is saved as 'published'.
 *
 * No auth required — this is a fire-and-forget notification to Google.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SITEMAP_URL = 'https://www.store.theedulaw.in/sitemap.xml';

  try {
    // Ping Google to re-crawl the sitemap
    const googlePing = await fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
      { method: 'GET' }
    );

    // Also ping Bing (free, worth doing)
    const bingPing = await fetch(
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
      { method: 'GET' }
    ).catch(() => null); // Bing ping is optional — don't fail if it errors

    return res.status(200).json({
      success: true,
      google: googlePing.status,
      bing: bingPing?.status ?? 'skipped',
    });
  } catch (err: any) {
    // Ping failure is non-fatal — content is still saved in Firestore
    console.error('Google ping failed:', err?.message);
    return res.status(200).json({ success: false, error: err?.message });
  }
}
