import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminDb } from '../_lib/adminInit';

/**
 * Master Playground Sync Cron
 * 1. Generates 3 Daily MCQs via Groq
 * 2. Rotates Case of the Week from Archive
 * 3. Scrapes SC + HC + Tribunal + Current-Affairs news from 11 RSS feeds,
 *    rephrases via Groq into EduLaw voice, applies 500-item rolling window.
 *
 * Deletion policy:
 *   - News items accumulate in Firestore until total count reaches 500.
 *   - When ≥ 500, the 25 OLDEST items are removed before inserting new ones.
 *   - No date-based deletion — items stay as long as the pool is under 500.
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

    const rawDesc    = descMatch ? extractCdata(descMatch[1]) : '';
    const rawSummary = rawDesc.length > 700 ? rawDesc.slice(0, 697) + '…' : (rawDesc || title);
    const publishedAt = dateMatch ? dateMatch[1].trim() : new Date().toISOString();

    // Skip items older than 72 hours
    const pubTime = new Date(publishedAt).getTime();
    if (!isNaN(pubTime) && pubTime < Date.now() - 72 * 60 * 60 * 1000) continue;

    let court = defaultCourt;

    if (defaultCourt === 'Mixed') {
      const low = (title + ' ' + rawSummary).toLowerCase();
      if      (low.includes('supreme court') || low.includes(' sc ') || low.includes('apex court'))     court = 'Supreme Court';
      else if (low.includes('high court')    || low.includes(' hc '))                                   court = 'High Court';
      else if (
        low.includes('nclat') || low.includes('nclt') || low.includes('ngt') ||
        low.includes('itat')  || low.includes('cestat') || low.includes('sat ') ||
        low.includes('tdsat') || low.includes('cat ')   || low.includes('tribunals') ||
        low.includes('tribunal')
      )                                                                                                  court = 'Tribunal';
      else continue; // skip items that don't clearly belong to any court
    }

    if (defaultCourt === 'Tribunal') {
      court = 'Tribunal'; // explicit
    }

    if (defaultCourt === 'Current Affairs') {
      // Broad legal current affairs — include all items from these feeds
      const low = (title + ' ' + rawSummary).toLowerCase();
      // Only include if legal/policy flavour detected
      const legalKeywords = [
        'law', 'court', 'legal', 'judge', 'judgment', 'bill', 'act', 'ministry',
        'policy', 'government', 'supreme', 'high court', 'tribunal', 'parliament',
        'constitution', 'bail', 'fir', 'ordinance', 'legislature', 'petition',
        'verdict', 'order', 'bench', 'plea', 'case', 'defendant', 'counsel',
        'advocate', 'cji', 'justice', 'regulation', 'statute',
      ];
      if (!legalKeywords.some(kw => low.includes(kw))) continue;
      court = 'Current Affairs';
    }

    items.push({ title, court, rawSummary, publishedAt });
  }
  return items;
}

// ─── Groq: rephrase RSS items in EduLaw's editorial voice ──────────────────
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
- For Tribinals, preserve the exact tribunal name (NCLAT, NGT, ITAT, CESTAT, SAT, TDSAT, CAT)
- title: concise professional headline (keep case name)
- category: one of: Constitutional Law, Criminal Law, Commercial Law, Property Law, Environmental Law, Labour Law, Family Law, Tax Law, Election Law, Corporate Law, Current Affairs, General

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
      else if (low.includes('tax') || low.includes('gst') || low.includes('income'))                         category = 'Tax Law';
      else if (low.includes('election') || low.includes('evm'))                                               category = 'Election Law';
      else if (low.includes('company') || low.includes('corporate') || low.includes('nclat') || low.includes('sebi')) category = 'Corporate Law';
      else if (raw.court === 'Current Affairs')                                                               category = 'Current Affairs';
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

  // ─── 1. Generate Daily MCQs ────────────────────────────────────────────────
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

  // ─── 2. Rotate Case of the Week ───────────────────────────────────────────
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

  // ─── 3. Daily Legal News — 11 RSS Feeds → Groq rephrase → Firestore ───────
  try {
    // ── 11 RSS Feed Sources ──
    // Supreme Court (2) | High Courts (3) | Tribunals (3) | Current Affairs (3)
    const RSS_FEEDS = [
      // ── SUPREME COURT ──
      {
        url:   'https://www.livelaw.in/category/top-stories/supreme-court/feed',
        court: 'Supreme Court',
        label: 'LiveLaw SC',
      },
      {
        url:   'https://blog.scconline.com/category/supreme-court/feed',
        court: 'Supreme Court',
        label: 'SCC Online SC',
      },

      // ── HIGH COURTS ──
      {
        url:   'https://www.livelaw.in/category/top-stories/high-court/feed',
        court: 'High Court',
        label: 'LiveLaw HC',
      },
      {
        url:   'https://www.barandbench.com/feed',
        court: 'Mixed',
        label: 'Bar & Bench',
      },
      {
        url:   'https://theleaflet.in/category/judgments/feed',
        court: 'Mixed',
        label: 'The Leaflet',
      },

      // ── TRIBUNALS ──
      {
        url:   'https://indiacorplaw.in/feed',
        court: 'Tribunal',
        label: 'IndiaCorpLaw (NCLAT/NCLT)',
      },
      {
        url:   'https://taxmann.com/post/feed',
        court: 'Tribunal',
        label: 'Taxmann (ITAT/CESTAT)',
      },
      {
        url:   'https://thewire.in/law/feed',
        court: 'Mixed',
        label: 'The Wire Law',
      },

      // ── LEGAL CURRENT AFFAIRS ──
      {
        url:   'https://www.thehindu.com/topic/law/feeder/default.rss',
        court: 'Current Affairs',
        label: 'The Hindu Law',
      },
      {
        url:   'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',
        court: 'Current Affairs',
        label: 'Hindustan Times',
      },
      {
        url:   'https://www.deccanherald.com/rss-feeds/dh-national.rss',
        court: 'Current Affairs',
        label: 'Deccan Herald',
      },
    ];

    let rawItems: RawRssItem[] = [];

    const feedResults = await Promise.allSettled(
      RSS_FEEDS.map(async feed => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        try {
          const r = await fetch(feed.url, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'EduLaw-Bot/1.0 (+https://theedulaw.in)',
              'Accept': 'application/rss+xml, application/xml, text/xml',
            },
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

    // ── Cap per court type: 15 SC + 15 HC + 10 Tribunal + 10 Current Affairs = 50 max ──
    const scRaw   = rawItems.filter(i => i.court === 'Supreme Court').slice(0, 15);
    const hcRaw   = rawItems.filter(i => i.court === 'High Court').slice(0, 15);
    const trRaw   = rawItems.filter(i => i.court === 'Tribunal').slice(0, 10);
    const caRaw   = rawItems.filter(i => i.court === 'Current Affairs').slice(0, 10);
    rawItems = [...scRaw, ...hcRaw, ...trRaw, ...caRaw];

    // Rephrase ALL items through Groq into EduLaw's educational voice
    let newsItems: NewsItem[] = [];
    if (rawItems.length > 0) {
      newsItems = await rephraseForEduLaw(apiKey, rawItems, today);
    }

    if (newsItems.length === 0) {
      results.newsError = 'No RSS items found within 72 hours';
    } else {
      // ── 500-item rolling window: delete oldest 25 when pool hits 500 ──
      try {
        const countSnap = await adminDb.collection('playground_content')
          .where('contentType', '==', 'daily_news')
          .get();
        const totalCount = countSnap.size;

        if (totalCount >= 500) {
          // Sort by createdAt ascending to find the 25 oldest
          const allDocs = countSnap.docs.map(d => ({
            ref: d.ref,
            createdAt: (d.data().createdAt as any)?.toMillis?.() ?? 0,
          }));
          allDocs.sort((a, b) => a.createdAt - b.createdAt);
          const toDelete = allDocs.slice(0, 25);

          if (toDelete.length > 0) {
            const delBatch = adminDb.batch();
            toDelete.forEach(d => delBatch.delete(d.ref));
            await delBatch.commit();
            results.pruned = toDelete.length;
          }
        }
      } catch (_) { /* cleanup failure is non-fatal */ }

      // Write rephrased items
      const newsBatch = adminDb.batch();
      const col = adminDb.collection('playground_content');
      newsItems.forEach(item => newsBatch.set(col.doc(), { ...item, type: 'news', createdAt: new Date() }));
      await newsBatch.commit();

      results.legalNews = newsItems.length;
      results.legalNewsBreakdown = {
        sc:  newsItems.filter(i => i.court === 'Supreme Court').length,
        hc:  newsItems.filter(i => i.court === 'High Court').length,
        tr:  newsItems.filter(i => i.court === 'Tribunal').length,
        ca:  newsItems.filter(i => i.court === 'Current Affairs').length,
      };
    }
  } catch (e: any) {
    results.newsError = e?.message;
  }

  return res.status(200).json({ success: true, ...results });
}
