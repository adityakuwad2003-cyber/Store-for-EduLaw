import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminDb } from '../_lib/adminInit';

/**
 * Master Playground Sync Cron
 * 1. Generates 3 Daily MCQs via Groq
 * 2. Rotates Case of the Week from Archive
 * 3. Scrapes HC + SC news from RSS (LiveLaw, Bar & Bench), rephrases via Groq into EduLaw voice
 */

// ─── Types ───────────────────────────────────────────────────────────────────
interface RawRssItem {
  title: string;
  court: string;
  rawSummary: string;
  publishedAt: string;
}

interface NewsItem {
  title: string;
  source: 'EduLaw Digest';
  url: '#';
  court: string;
  summary: string;
  publishedAt: string;
  dateString: string;
  category: string;
  contentType: 'daily_news';
}

// ─── RSS Parser ───────────────────────────────────────────────────────────────
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

    if (!titleMatch) continue;
    const title = extractCdata(titleMatch[1]);
    if (!title || title.length < 10) continue;

    const rawDesc  = descMatch ? extractCdata(descMatch[1]) : '';
    // Keep full description for Groq to work with (up to 700 chars)
    const rawSummary = rawDesc.length > 700 ? rawDesc.slice(0, 697) + '…' : (rawDesc || title);
    const publishedAt = dateMatch ? dateMatch[1].trim() : new Date().toISOString();

    // Skip items older than 72 hours to keep news fresh (but leave enough raw items to reliably fill the 10 SC + 10 HC cap)
    const pubTime = new Date(publishedAt).getTime();
    if (!isNaN(pubTime) && pubTime < Date.now() - 72 * 60 * 60 * 1000) continue;

    let court = defaultCourt;
    if (defaultCourt === 'Mixed') {
      const low = (title + ' ' + rawSummary).toLowerCase();
      if      (low.includes('supreme court') || low.includes(' sc ') || low.includes('apex court')) court = 'Supreme Court';
      else if (low.includes('high court')    || low.includes(' hc '))                               court = 'High Court';
      else continue;
    }

    items.push({ title, court, rawSummary, publishedAt });
  }
  return items;
}

// ─── Groq: rephrase RSS items in EduLaw's editorial voice ─────────────────────
async function rephraseForEduLaw(
  apiKey: string,
  rawItems: RawRssItem[],
  dateString: string,
): Promise<NewsItem[]> {
  if (rawItems.length === 0) return [];

  const inputJson = rawItems.map((item, i) => ({
    index: i,
    court: item.court,
    title: item.title,
    rawSummary: item.rawSummary,
  }));

  const prompt = `You are EduLaw's editorial team preparing daily legal news for Indian law students and judiciary exam aspirants.

Rephrase each of the following ${rawItems.length} news items in EduLaw's professional, educational voice.

Rules:
- Keep all case names, section numbers, and legal provisions from the original
- Write a 4–5 sentence summary: (1) parties and legal issue, (2) court's ruling, (3) legal provision/precedent applied, (4) significance for students
- Minimum 80 words per summary
- DO NOT invent facts not in the raw summary
- DO NOT mention sources, URLs, or publication names
- For High Courts, preserve the specific HC name if mentioned (Delhi HC, Bombay HC, etc.)
- title: concise professional headline (keep case name)
- category: one of: Constitutional Law, Criminal Law, Commercial Law, Property Law, Environmental Law, Labour Law, Family Law, Tax Law, Election Law, General

Input items:
${JSON.stringify(inputJson)}

Respond ONLY with valid JSON: {"items":[{"index":0,"title":"...","summary":"...","category":"..."}]}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  });
  const data = await res.json();
  if (!data.choices?.[0]?.message?.content) throw new Error(`Groq rephrase error: ${JSON.stringify(data)}`);
  const parsed = JSON.parse(data.choices[0].message.content);
  const rephrased: any[] = parsed.items || [];

  return rawItems.map((raw, i) => {
    const r = rephrased.find((x: any) => x.index === i) ?? rephrased[i] ?? {};

    // Categorise from title if Groq didn't return one
    const low = raw.title.toLowerCase();
    let category = String(r.category || 'General');
    if (category === 'General') {
      if      (low.includes('constitution') || low.includes('fundamental') || low.includes('article'))        category = 'Constitutional Law';
      else if (low.includes('murder') || low.includes('bail') || low.includes('fir') || low.includes('bns')) category = 'Criminal Law';
      else if (low.includes('contract') || low.includes('arbitration') || low.includes('insolvency'))         category = 'Commercial Law';
      else if (low.includes('property') || low.includes('land') || low.includes('rent'))                      category = 'Property Law';
      else if (low.includes('environment') || low.includes('pollution') || low.includes('forest'))            category = 'Environmental Law';
      else if (low.includes('labour') || low.includes('employee') || low.includes('wage'))                    category = 'Labour Law';
      else if (low.includes('family') || low.includes('divorce') || low.includes('custody'))                  category = 'Family Law';
      else if (low.includes('tax') || low.includes('gst'))                                                    category = 'Tax Law';
      else if (low.includes('election') || low.includes('evm'))                                               category = 'Election Law';
    }

    return {
      title:       String(r.title     || raw.title),
      source:      'EduLaw Digest' as const,
      url:         '#' as const,
      court:       raw.court,
      summary:     String(r.summary   || raw.rawSummary),
      publishedAt: raw.publishedAt,
      dateString,
      category,
      contentType: 'daily_news' as const,
    };
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY missing' });

  const today = new Date().toISOString().split('T')[0];
  const results: Record<string, any> = {};

  // ─── 1. Generate Daily MCQs ───────────────────────────────────────────────
  try {
    const topics = ['Constitutional Law', 'BNS 2023', 'BNSS 2023', 'BSA 2023', 'Contract Law', 'Evidence'];
    const topic  = topics[Math.floor(Math.random() * topics.length)];
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: `Generate 3 high-quality Judiciary MCQs on ${topic}. Format as JSON: {"items":[{"question":"...","options":["A","B","C","D"],"correctAnswer":0,"explanation":"...","topic":"${topic}"}]}` }],
        temperature: 0.6,
        response_format: { type: 'json_object' },
      }),
    });
    const mcqData = await groqRes.json();
    if (!mcqData.choices?.[0]?.message?.content) throw new Error(`Groq MCQ error: ${JSON.stringify(mcqData)}`);
    const mcqs = JSON.parse(mcqData.choices[0].message.content).items || [];
    const mcqCol = adminDb.collection('daily_mcqs');
    const mcqBatch = adminDb.batch();
    mcqs.forEach((m: any) => mcqBatch.set(mcqCol.doc(), { ...m, createdAt: new Date(), dateString: today }));
    await mcqBatch.commit();
    results.mcqs = mcqs.length;
  } catch (e: any) {
    results.mcqError = e?.message;
  }

  // ─── 2. Rotate Case of the Week ──────────────────────────────────────────
  try {
    const archiveSnap = await adminDb.collection('cases_archive').get();
    if (!archiveSnap.empty) {
      const cases = archiveSnap.docs.map(d => d.data());
      const rotated = cases[Math.floor(Math.random() * cases.length)];
      await adminDb.collection('legal_playground').doc('config').set(
        { caseOfWeek: { ...rotated, updatedAt: new Date().toISOString() } },
        { merge: true }
      );
      results.caseRotated = true;
    }
  } catch (e: any) {
    results.caseError = e?.message;
  }

  // ─── 3. Daily Legal News — RSS → Groq rephrase → Firestore ───────────────
  try {
    const RSS_FEEDS = [
      { url: 'https://www.livelaw.in/category/top-stories/supreme-court/feed', court: 'Supreme Court' },
      { url: 'https://www.livelaw.in/category/top-stories/high-court/feed',    court: 'High Court'   },
      { url: 'https://www.barandbench.com/feed',                               court: 'Mixed'        },
    ];

    let rawItems: RawRssItem[] = [];

    const feedResults = await Promise.allSettled(
      RSS_FEEDS.map(async feed => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        try {
          const r = await fetch(feed.url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'EduLaw-Bot/1.0 (+https://theedulaw.in)', 'Accept': 'application/rss+xml, application/xml, text/xml' },
          });
          clearTimeout(timer);
          if (!r.ok) return [] as RawRssItem[];
          const xml = await r.text();
          return parseRssItems(xml, feed.court, today);
        } catch {
          clearTimeout(timer);
          return [] as RawRssItem[];
        }
      })
    );

    for (const result of feedResults) {
      if (result.status === 'fulfilled') rawItems.push(...result.value);
    }

    // Deduplicate by title
    const seen = new Set<string>();
    rawItems = rawItems.filter(item => {
      const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Cap at 10 SC + 10 HC
    const scRaw = rawItems.filter(i => i.court === 'Supreme Court').slice(0, 10);
    const hcRaw = rawItems.filter(i => i.court === 'High Court').slice(0, 10);
    rawItems = [...scRaw, ...hcRaw];

    // Rephrase ALL items through Groq into EduLaw's educational voice
    let newsItems: NewsItem[] = [];
    if (rawItems.length > 0) {
      newsItems = await rephraseForEduLaw(apiKey, rawItems, today);
    }

    if (newsItems.length === 0) {
      results.newsError = 'No RSS items found within 48 hours';
    } else {
      // Delete old news items (older than 3 days)
      try {
        const oldSnap = await adminDb.collection('playground_content')
          .where('contentType', '==', 'daily_news')
          .get();
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 3);
        const cutoffStr = cutoff.toISOString().split('T')[0];
        const toDelete = oldSnap.docs.filter(d => {
          const ds = d.data().dateString as string | undefined;
          return ds && ds < cutoffStr;
        });
        if (toDelete.length > 0) {
          const delBatch = adminDb.batch();
          toDelete.forEach(d => delBatch.delete(d.ref));
          await delBatch.commit();
        }
      } catch (_) { /* cleanup failure is non-fatal */ }

      // Write rephrased items
      const newsBatch = adminDb.batch();
      const col = adminDb.collection('playground_content');
      newsItems.forEach(item => newsBatch.set(col.doc(), { ...item, type: 'news', createdAt: new Date() }));
      await newsBatch.commit();

      results.legalNews = newsItems.length;
      results.legalNewsBreakdown = {
        sc: newsItems.filter(i => i.court === 'Supreme Court').length,
        hc: newsItems.filter(i => i.court === 'High Court').length,
      };
    }
  } catch (e: any) {
    results.newsError = e?.message;
  }

  return res.status(200).json({ success: true, ...results });
}
