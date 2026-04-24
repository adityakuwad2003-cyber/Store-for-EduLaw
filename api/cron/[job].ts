import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminDb } from '../_lib/adminInit';
import { verifyAdmin } from '../_lib/security';
import { Resend } from 'resend';

// ─────────────────────────────────────────────────────────────────────────────
// Shared auth helper
// ─────────────────────────────────────────────────────────────────────────────
async function authCheck(req: VercelRequest, res: VercelResponse): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization || '';
  const provided = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  const isCron = cronSecret ? provided === cronSecret : false;
  if (isCron) return true;
  try {
    await verifyAdmin(req);
    return true;
  } catch {
    res.status(401).json({ error: 'Unauthorized.' });
    return false;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// JOB: playground-sync
// ═════════════════════════════════════════════════════════════════════════════

interface RawRssItem {
  title: string;
  court: string;
  rawSummary: string;
  publishedAt: string;
  sourceUrl: string;
}
interface NewsItem {
  title: string;
  source: 'EduLaw Digest';
  url: string;
  sourceUrl: string;
  court: string;
  summary: string;
  publishedAt: string;
  dateString: string;
  category: string;
  contentType: 'daily_news';
}

function extractCdata(raw: string): string {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ').trim();
}

function parseRssItems(xml: string, defaultCourt: string, today: string): RawRssItem[] {
  const items: RawRssItem[] = [];
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/g) || [];
  for (const block of itemBlocks) {
    const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/);
    const descMatch  = block.match(/<description>([\s\S]*?)<\/description>/);
    const dateMatch  = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const linkMatch  = block.match(/<link>([\s\S]*?)<\/link>/) ||
                       block.match(/<link\s[^>]*href="([^"]+)"/) ||
                       block.match(/<guid\s+isPermaLink="true">([\s\S]*?)<\/guid>/);
    if (!titleMatch) continue;
    const title = extractCdata(titleMatch[1]);
    if (!title || title.length < 10) continue;
    const rawDesc    = descMatch ? extractCdata(descMatch[1]) : '';
    const rawSummary = rawDesc.length > 700 ? rawDesc.slice(0, 697) + '…' : (rawDesc || title);
    const publishedAt = dateMatch ? dateMatch[1].trim() : new Date().toISOString();
    const sourceUrl = linkMatch ? extractCdata(linkMatch[1]).trim() : '';
    const pubTime = new Date(publishedAt).getTime();
    if (!isNaN(pubTime) && pubTime < Date.now() - 72 * 60 * 60 * 1000) continue;
    let court = defaultCourt;
    if (defaultCourt === 'Mixed') {
      const low = (title + ' ' + rawSummary).toLowerCase();
      if      (low.includes('supreme court') || low.includes(' sc ') || low.includes('apex court')) court = 'Supreme Court';
      else if (low.includes('high court') || low.includes(' hc '))                                  court = 'High Court';
      else if (low.includes('nclat') || low.includes('nclt') || low.includes('ngt') ||
               low.includes('itat')  || low.includes('cestat') || low.includes('sat ') ||
               low.includes('tdsat') || low.includes('cat ')   || low.includes('tribunal'))         court = 'Tribunal';
      else continue;
    }
    if (defaultCourt === 'Tribunal') court = 'Tribunal';
    if (defaultCourt === 'Current Affairs') {
      const low = (title + ' ' + rawSummary).toLowerCase();
      const legalKw = ['law','court','legal','judge','judgment','bill','act','ministry','policy',
        'government','supreme','high court','tribunal','parliament','constitution','bail','fir',
        'ordinance','legislature','petition','verdict','order','bench','plea','case','defendant',
        'counsel','advocate','cji','justice','regulation','statute'];
      if (!legalKw.some(kw => low.includes(kw))) continue;
      court = 'Current Affairs';
    }
    items.push({ title, court, rawSummary, publishedAt, sourceUrl });
  }
  return items;
}

async function rephraseForEduLaw(apiKey: string, rawItems: RawRssItem[], dateString: string): Promise<NewsItem[]> {
  if (rawItems.length === 0) return [];
  const inputJson = rawItems.map((item, i) => ({ index: i, court: item.court, title: item.title, rawSummary: item.rawSummary }));
  const prompt = `You are EduLaw's editorial team preparing daily legal news for Indian law students and judiciary exam aspirants.

Rephrase each of the following ${rawItems.length} news items in EduLaw's professional, educational voice.

Rules:
- Keep all case names, section numbers, and legal provisions from the original
- Write a 4–5 sentence summary: (1) parties and legal issue, (2) court's ruling, (3) legal provision/precedent applied, (4) significance for students
- Minimum 80 words per summary
- DO NOT invent facts not in the raw summary
- DO NOT mention sources, URLs, or publication names
- For High Courts, preserve the specific HC name if mentioned (Delhi HC, Bombay HC, etc.)
- For Tribunals, preserve the exact tribunal name (NCLAT, NGT, ITAT, CESTAT, SAT, TDSAT, CAT)
- title: concise professional headline (keep case name)
- category: one of: Constitutional Law, Criminal Law, Commercial Law, Property Law, Environmental Law, Labour Law, Family Law, Tax Law, Election Law, Corporate Law, Current Affairs, General

Input items:
${JSON.stringify(inputJson)}

Respond ONLY with valid JSON: {"items":[{"index":0,"title":"...","summary":"...","category":"..."}]}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], temperature: 0.3, response_format: { type: 'json_object' } }),
  });
  const data = await res.json();
  if (!data.choices?.[0]?.message?.content) throw new Error(`Groq rephrase error: ${JSON.stringify(data)}`);
  const parsed = JSON.parse(data.choices[0].message.content);
  const rephrased: any[] = parsed.items || [];
  return rawItems.map((raw, i) => {
    const r = rephrased.find((x: any) => x.index === i) ?? rephrased[i] ?? {};
    const low = raw.title.toLowerCase();
    let category = String(r.category || 'General');
    if (category === 'General') {
      if      (low.includes('constitution') || low.includes('fundamental') || low.includes('article'))         category = 'Constitutional Law';
      else if (low.includes('murder') || low.includes('bail') || low.includes('fir') || low.includes('bns'))   category = 'Criminal Law';
      else if (low.includes('contract') || low.includes('arbitration') || low.includes('insolvency'))           category = 'Commercial Law';
      else if (low.includes('property') || low.includes('land') || low.includes('rent'))                        category = 'Property Law';
      else if (low.includes('environment') || low.includes('pollution') || low.includes('forest'))              category = 'Environmental Law';
      else if (low.includes('labour') || low.includes('employee') || low.includes('wage'))                      category = 'Labour Law';
      else if (low.includes('family') || low.includes('divorce') || low.includes('custody'))                    category = 'Family Law';
      else if (low.includes('tax') || low.includes('gst') || low.includes('income'))                            category = 'Tax Law';
      else if (low.includes('election') || low.includes('evm'))                                                  category = 'Election Law';
      else if (low.includes('company') || low.includes('corporate') || low.includes('nclat') || low.includes('sebi')) category = 'Corporate Law';
      else if (raw.court === 'Current Affairs')                                                                   category = 'Current Affairs';
    }
    const safeUrl = raw.sourceUrl && raw.sourceUrl.startsWith('http') ? raw.sourceUrl : '#';
    return { title: String(r.title || raw.title), source: 'EduLaw Digest' as const, url: safeUrl, sourceUrl: safeUrl, court: raw.court, summary: String(r.summary || raw.rawSummary), publishedAt: raw.publishedAt, dateString, category, contentType: 'daily_news' as const };
  });
}

async function runPlaygroundSync(res: VercelResponse) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY missing' });
  const today = new Date().toISOString().split('T')[0];
  const results: Record<string, any> = {};

  try {
    const topics = ['Constitutional Law', 'BNS 2023', 'BNSS 2023', 'BSA 2023', 'Contract Law', 'Evidence'];
    const topic  = topics[Math.floor(Math.random() * topics.length)];
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: `Generate 3 high-quality Judiciary MCQs on ${topic}. Format as JSON: {"items":[{"question":"...","options":["A","B","C","D"],"correctAnswer":0,"explanation":"...","topic":"${topic}"}]}` }], temperature: 0.6, response_format: { type: 'json_object' } }),
    });
    const mcqData = await groqRes.json();
    if (!mcqData.choices?.[0]?.message?.content) throw new Error(`Groq MCQ error: ${JSON.stringify(mcqData)}`);
    const mcqs = JSON.parse(mcqData.choices[0].message.content).items || [];
    const mcqBatch = adminDb.batch();
    mcqs.forEach((m: any) => mcqBatch.set(adminDb.collection('daily_mcqs').doc(), { ...m, createdAt: new Date(), dateString: today }));
    await mcqBatch.commit();
    results.mcqs = mcqs.length;
  } catch (e: any) { results.mcqError = e?.message; }

  try {
    const archiveSnap = await adminDb.collection('cases_archive').get();
    if (!archiveSnap.empty) {
      const cases = archiveSnap.docs.map(d => d.data());
      const rotated = cases[Math.floor(Math.random() * cases.length)];
      await adminDb.collection('legal_playground').doc('config').set({ caseOfWeek: { ...rotated, updatedAt: new Date().toISOString() } }, { merge: true });
      results.caseRotated = true;
    }
  } catch (e: any) { results.caseError = e?.message; }

  try {
    const RSS_FEEDS = [
      { url: 'https://www.livelaw.in/category/top-stories/supreme-court/feed', court: 'Supreme Court', label: 'LiveLaw SC' },
      { url: 'https://blog.scconline.com/category/supreme-court/feed', court: 'Supreme Court', label: 'SCC Online SC' },
      { url: 'https://www.livelaw.in/category/top-stories/high-court/feed', court: 'High Court', label: 'LiveLaw HC' },
      { url: 'https://www.barandbench.com/feed', court: 'Mixed', label: 'Bar & Bench' },
      { url: 'https://theleaflet.in/category/judgments/feed', court: 'Mixed', label: 'The Leaflet' },
      { url: 'https://indiacorplaw.in/feed', court: 'Tribunal', label: 'IndiaCorpLaw' },
      { url: 'https://taxmann.com/post/feed', court: 'Tribunal', label: 'Taxmann' },
      { url: 'https://thewire.in/law/feed', court: 'Mixed', label: 'The Wire Law' },
      { url: 'https://www.thehindu.com/topic/law/feeder/default.rss', court: 'Current Affairs', label: 'The Hindu Law' },
      { url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml', court: 'Current Affairs', label: 'Hindustan Times' },
      { url: 'https://www.deccanherald.com/rss-feeds/dh-national.rss', court: 'Current Affairs', label: 'Deccan Herald' },
    ];
    let rawItems: RawRssItem[] = [];
    const feedResults = await Promise.allSettled(RSS_FEEDS.map(async feed => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      try {
        const r = await fetch(feed.url, { signal: controller.signal, headers: { 'User-Agent': 'EduLaw-Bot/1.0 (+https://theedulaw.in)', 'Accept': 'application/rss+xml, application/xml, text/xml' } });
        clearTimeout(timer);
        if (!r.ok) return [] as RawRssItem[];
        return parseRssItems(await r.text(), feed.court, today);
      } catch { clearTimeout(timer); return [] as RawRssItem[]; }
    }));
    for (const result of feedResults) if (result.status === 'fulfilled') rawItems.push(...result.value);
    const seen = new Set<string>();
    rawItems = rawItems.filter(item => {
      const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 50);
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
    rawItems = [
      ...rawItems.filter(i => i.court === 'Supreme Court').slice(0, 15),
      ...rawItems.filter(i => i.court === 'High Court').slice(0, 15),
      ...rawItems.filter(i => i.court === 'Tribunal').slice(0, 10),
      ...rawItems.filter(i => i.court === 'Current Affairs').slice(0, 10),
    ];
    const newsItems = rawItems.length > 0 ? await rephraseForEduLaw(apiKey, rawItems, today) : [];
    if (newsItems.length === 0) {
      results.newsError = 'No RSS items found within 72 hours';
    } else {
      const newsBatch = adminDb.batch();
      newsItems.forEach(item => newsBatch.set(adminDb.collection('playground_content').doc(), { ...item, type: 'news', createdAt: new Date() }));
      await newsBatch.commit();
      results.legalNews = newsItems.length;
      results.legalNewsBreakdown = { sc: newsItems.filter(i => i.court === 'Supreme Court').length, hc: newsItems.filter(i => i.court === 'High Court').length, tr: newsItems.filter(i => i.court === 'Tribunal').length, ca: newsItems.filter(i => i.court === 'Current Affairs').length };
    }
  } catch (e: any) { results.newsError = e?.message; }

  return res.status(200).json({ success: true, ...results });
}

// ═════════════════════════════════════════════════════════════════════════════
// JOB: daily-newsletter
// ═════════════════════════════════════════════════════════════════════════════

const BATCH_SIZE = 90;

function todayDateString() { return new Date().toISOString().slice(0, 10); }
function yesterdayDateString() { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); }

function buildNewsletterHtml(items: any[], dateStr: string): string {
  const formattedDate = new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
  const newsRows = items.slice(0, 8).map((item, i) => `
    <tr><td style="padding:16px 0;border-bottom:1px solid #f0ece4;">
      <p style="margin:0 0 4px;font-size:11px;color:#9c7b4a;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">${item.court || item.category || 'Legal Update'}</p>
      <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#1a1209;line-height:1.4;">${i + 1}. ${item.title}</p>
      <p style="margin:0 0 8px;font-size:14px;color:#6b5d4f;line-height:1.6;">${item.summary || ''}</p>
      ${item.url ? `<a href="${item.url}" style="font-size:12px;color:#6B1E2E;font-weight:700;text-decoration:none;">Read full judgment →</a>` : ''}
    </td></tr>`).join('');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>EduLaw Daily Legal Update</title></head>
<body style="margin:0;padding:0;background:#f7f3ec;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f3ec;padding:32px 16px;"><tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
      <tr><td style="background:#1a1209;padding:28px 32px;"><p style="margin:0 0 4px;font-size:11px;color:#c9a84c;font-weight:700;text-transform:uppercase;">Daily Legal Update</p><h1 style="margin:0;font-size:26px;color:#f7f3ec;">EduLaw Newsletter</h1><p style="margin:6px 0 0;font-size:13px;color:#c9a84c;">${formattedDate}</p></td></tr>
      <tr><td style="padding:24px 32px 8px;"><p style="margin:0;font-size:15px;color:#3d2b1f;line-height:1.7;">Here's your curated daily roundup of the most important Supreme Court &amp; High Court developments — hand-picked for EduLaw Pro &amp; Max subscribers.</p></td></tr>
      <tr><td style="padding:8px 32px 24px;"><table width="100%" cellpadding="0" cellspacing="0">${newsRows}</table></td></tr>
      <tr><td style="padding:0 32px 28px;" align="center"><a href="https://store.theedulaw.in/legal-hub" style="display:inline-block;background:#6B1E2E;color:#f7f3ec;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:700;">Read All Legal Updates →</a></td></tr>
      <tr><td style="background:#f7f3ec;padding:20px 32px;border-top:1px solid #e8e0d4;"><p style="margin:0;font-size:12px;color:#9c7b4a;text-align:center;line-height:1.6;">You're receiving this as an EduLaw Pro/Max subscriber.<br>© The EduLaw, Pune, Maharashtra<br><a href="https://store.theedulaw.in/subscription" style="color:#6B1E2E;">Manage subscription</a></p></td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

async function runDailyNewsletter(res: VercelResponse) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const senderEmail = process.env.VITE_SENDER_EMAIL || 'updates@theedulaw.in';
  try {
    const today = todayDateString();
    let newsSnap = await adminDb.collection('playground_content').where('contentType', '==', 'daily_news').where('dateString', '==', today).limit(10).get();
    if (newsSnap.empty) newsSnap = await adminDb.collection('playground_content').where('contentType', '==', 'daily_news').where('dateString', '==', yesterdayDateString()).limit(10).get();
    if (newsSnap.empty) {
      await adminDb.collection('cron_logs').add({ type: 'daily_newsletter', sentAt: new Date(), status: 'skipped', reason: 'No news items found' });
      return res.status(200).json({ success: true, skipped: true, reason: 'No news items found' });
    }
    const newsItems = newsSnap.docs.map(d => d.data());
    const usersSnap = await adminDb.collection('users').where('subscription.status', '==', 'active').get();
    const emails = usersSnap.docs.map(doc => doc.data()?.email).filter((e): e is string => typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    if (emails.length === 0) {
      await adminDb.collection('cron_logs').add({ type: 'daily_newsletter', sentAt: new Date(), status: 'skipped', reason: 'No active subscribers' });
      return res.status(200).json({ success: true, skipped: true, reason: 'No active subscribers' });
    }
    const html = buildNewsletterHtml(newsItems, today);
    const subject = `📋 EduLaw Daily Legal Update — ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    let sentCount = 0;
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      for (let i = 0; i < emails.length; i += BATCH_SIZE) {
        const batch = emails.slice(i, i + BATCH_SIZE).map(email => ({ from: `The EduLaw <${senderEmail}>`, to: [email], subject, html }));
        await resend.batch.send(batch);
        sentCount += batch.length;
      }
    } else { sentCount = emails.length; }
    await adminDb.collection('cron_logs').add({ type: 'daily_newsletter', sentAt: new Date(), recipientCount: sentCount, status: 'sent', dateString: today });
    return res.status(200).json({ success: true, sentCount });
  } catch (err) {
    console.error('daily-newsletter cron error:', err);
    await adminDb.collection('cron_logs').add({ type: 'daily_newsletter', sentAt: new Date(), status: 'error', error: String(err) }).catch(() => {});
    return res.status(500).json({ error: 'Newsletter send failed.' });
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// JOB: monthly-digest
// ═════════════════════════════════════════════════════════════════════════════

function buildDigestHtml(items: any[], monthLabel: string): string {
  const digestRows = items.slice(0, 10).map((item, i) => `
    <tr><td style="padding:20px 0;border-bottom:1px solid #f0ece4;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="width:36px;vertical-align:top;padding-top:2px;"><div style="width:28px;height:28px;background:#c9a84c;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#1a1209;">${i + 1}</div></td>
        <td style="padding-left:12px;">
          <p style="margin:0 0 4px;font-size:11px;color:#9c7b4a;font-weight:700;text-transform:uppercase;">${item.court || item.category || 'Supreme Court'}</p>
          <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#1a1209;line-height:1.4;">${item.title}</p>
          <p style="margin:0 0 8px;font-size:14px;color:#6b5d4f;line-height:1.7;">${item.summary || item.description || ''}</p>
          ${item.url ? `<a href="${item.url}" style="font-size:12px;color:#c9a84c;font-weight:700;text-decoration:none;">Read judgment →</a>` : ''}
        </td>
      </tr></table>
    </td></tr>`).join('');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>EduLaw Monthly Judgment Digest</title></head>
<body style="margin:0;padding:0;background:#f7f3ec;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f3ec;padding:32px 16px;"><tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
      <tr><td style="background:#1a1209;padding:28px 32px;"><p style="margin:0 0 4px;font-size:11px;color:#c9a84c;font-weight:700;text-transform:uppercase;">Monthly Judgment Digest</p><h1 style="margin:0;font-size:26px;color:#f7f3ec;">EduLaw Digest</h1><p style="margin:6px 0 0;font-size:13px;color:#c9a84c;">${monthLabel}</p></td></tr>
      <tr><td style="height:4px;background:linear-gradient(90deg,#c9a84c,#e8c96d);"></td></tr>
      <tr><td style="padding:28px 32px 8px;"><p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#1a1209;">Top 10 Judgments This Month</p><p style="margin:0;font-size:14px;color:#3d2b1f;line-height:1.7;">Your curated monthly roundup of the most consequential Supreme Court &amp; High Court rulings.</p></td></tr>
      <tr><td style="padding:8px 32px 24px;"><table width="100%" cellpadding="0" cellspacing="0">${digestRows}</table></td></tr>
      <tr><td style="padding:0 32px 32px;" align="center"><a href="https://store.theedulaw.in/legal-playground/digest" style="display:inline-block;background:#c9a84c;color:#1a1209;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:700;">Browse Full Digest Library →</a></td></tr>
      <tr><td style="background:#f7f3ec;padding:20px 32px;border-top:1px solid #e8e0d4;"><p style="margin:0;font-size:12px;color:#9c7b4a;text-align:center;line-height:1.6;">You're receiving this as an EduLaw Pro/Max subscriber.<br>© The EduLaw, Pune, Maharashtra<br><a href="https://store.theedulaw.in/subscription" style="color:#6B1E2E;">Manage subscription</a></p></td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

async function runMonthlyDigest(res: VercelResponse) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const senderEmail = process.env.VITE_SENDER_EMAIL || 'updates@theedulaw.in';
  try {
    let digestSnap = await adminDb.collection('playground_content').where('contentType', '==', 'digest').orderBy('publishedAt', 'desc').limit(10).get();
    let items: any[] = digestSnap.docs.map(d => d.data());
    if (items.length < 3) {
      const fallback = await adminDb.collection('playground_content').where('contentType', '==', 'daily_news').orderBy('publishedAt', 'desc').limit(10).get();
      items = fallback.docs.map(d => d.data());
    }
    if (items.length === 0) {
      await adminDb.collection('cron_logs').add({ type: 'monthly_digest', sentAt: new Date(), status: 'skipped', reason: 'No digest items found' });
      return res.status(200).json({ success: true, skipped: true, reason: 'No digest items' });
    }
    const usersSnap = await adminDb.collection('users').where('subscription.status', '==', 'active').get();
    const emails = usersSnap.docs.map(doc => doc.data()?.email).filter((e): e is string => typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    if (emails.length === 0) {
      await adminDb.collection('cron_logs').add({ type: 'monthly_digest', sentAt: new Date(), status: 'skipped', reason: 'No active subscribers' });
      return res.status(200).json({ success: true, skipped: true, reason: 'No active subscribers' });
    }
    const monthLabel = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    const html = buildDigestHtml(items, monthLabel);
    const subject = `⚖️ EduLaw Monthly Judgment Digest — ${monthLabel}`;
    let sentCount = 0;
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      for (let i = 0; i < emails.length; i += BATCH_SIZE) {
        const batch = emails.slice(i, i + BATCH_SIZE).map(email => ({ from: `The EduLaw <${senderEmail}>`, to: [email], subject, html }));
        await resend.batch.send(batch);
        sentCount += batch.length;
      }
    } else { sentCount = emails.length; }
    await adminDb.collection('cron_logs').add({ type: 'monthly_digest', sentAt: new Date(), recipientCount: sentCount, status: 'sent', monthLabel });
    return res.status(200).json({ success: true, sentCount });
  } catch (err) {
    console.error('monthly-digest cron error:', err);
    await adminDb.collection('cron_logs').add({ type: 'monthly_digest', sentAt: new Date(), status: 'error', error: String(err) }).catch(() => {});
    return res.status(500).json({ error: 'Digest send failed.' });
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// Router
// ═════════════════════════════════════════════════════════════════════════════

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const job = req.query.job as string;

  if (job === 'playground-sync') {
    // playground-sync uses its own GROQ_API_KEY check — no auth required for cron
    return runPlaygroundSync(res);
  }

  if (!(await authCheck(req, res))) return;

  if (job === 'daily-newsletter') return runDailyNewsletter(res);
  if (job === 'monthly-digest')   return runMonthlyDigest(res);

  return res.status(404).json({ error: `Unknown cron job: ${job}` });
}
