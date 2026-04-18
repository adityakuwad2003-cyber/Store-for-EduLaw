import type { VercelRequest, VercelResponse } from '@vercel/node';

// Extend Vercel function timeout to 30s (Pro plan) — prevents HTML timeout page
// being returned instead of JSON, which causes "Network error" on the client.
export const config = {
  maxDuration: 30,
};

// ─── Types ────────────────────────────────────────────────────────────────────
export interface JudgmentResult {
  title:   string;
  court:   string;
  date:    string;
  summary: string;
  url:     string;
  source:  string;
}

export interface NewsResult {
  headline: string;
  source:   string;
  date:     string;
  url:      string;
  snippet:  string;
}

export interface LawyerResult {
  title:   string;
  source:  string;
  url:     string;
  snippet: string;
}

// ─── Act label map ────────────────────────────────────────────────────────────
const ACT_LABEL: Record<string, string> = {
  ipc:   'Indian Penal Code',
  bns:   'Bharatiya Nyaya Sanhita',
  crpc:  'Code of Criminal Procedure',
  bnss:  'Bharatiya Nagarik Suraksha Sanhita',
  cpc:   'Code of Civil Procedure',
  iea:   'Indian Evidence Act',
  bsa:   'Bharatiya Sakshya Adhiniyam',
  ca:    'Companies Act 2013',
  const: 'Constitution of India',
  tp:    'Transfer of Property Act 1882',
  sra:   'Specific Relief Act 1963',
  hma:   'Hindu Marriage Act 1955',
  dv:    'Protection of Women from Domestic Violence Act 2005',
  pocso: 'Protection of Children from Sexual Offences Act 2012',
  ni:    'Negotiable Instruments Act 1881',
  arb:   'Arbitration and Conciliation Act 1996',
  cp:    'Consumer Protection Act 2019',
  it:    'Information Technology Act 2000',
  rti:   'Right to Information Act 2005',
  mv:    'Motor Vehicles Act 1988',
};

// ─── Query builders ───────────────────────────────────────────────────────────
function buildQuery(act: string, query: string, mode: string, court: string): string {
  let q = '';
  if (mode === 'keyword') {
    q = query;
  } else if (mode === 'citation') {
    q = `"${query}" judgment`;
  } else {
    const label = ACT_LABEL[act] ?? act;
    q = `${label} section ${query} landmark judgment leading case`;
  }
  if (court === 'sc')           q += ' "Supreme Court of India"';
  else if (court === 'hc')      q += ' "High Court"';
  else if (court === 'tribunal') q += ' tribunal';
  q += ' site:indiankanoon.org OR site:judis.nic.in';
  return q;
}

function buildNewsQuery(act: string, query: string, mode: string): string {
  const label = ACT_LABEL[act] ?? act;
  if (mode === 'keyword')  return `${query} legal India`;
  if (mode === 'citation') return `"${query}" court ruling India`;
  return `"${label}" section ${query} India`;
}

function buildLawyerQuery(act: string, query: string, mode: string): string {
  const label = ACT_LABEL[act] ?? act;
  const topic = mode === 'keyword' ? query : `${label} section ${query}`;
  return `${topic} lawyer advocate legal help India`;
}

// ─── Parsers ──────────────────────────────────────────────────────────────────
function parseSerperResult(item: any): JudgmentResult {
  const rawTitle = (item.title ?? '') as string;
  const title = rawTitle
    .replace(/\s*[-–|]\s*(Indian Kanoon|IndianKanoon|JUDIS|NIC|indiankanoon\.org)\s*$/i, '')
    .trim();
  const snippet = (item.snippet ?? '') as string;
  const link    = (item.link    ?? '') as string;
  const court   = extractCourt(snippet + ' ' + title);
  const date    = extractDate(title + ' ' + snippet);
  let source: string;
  try {
    source = link.includes('judis.nic.in')
      ? 'JUDIS (NIC)'
      : link.includes('indiankanoon.org')
      ? 'IndianKanoon'
      : new URL(link).hostname.replace('www.', '');
  } catch {
    source = 'Indian Court';
  }
  return { title, court, date, summary: snippet, url: link, source };
}

function parseNewsResult(item: any): NewsResult {
  const link = (item.link ?? '') as string;
  let source = 'Legal News';
  try {
    const host = new URL(link).hostname.replace('www.', '');
    if (host.includes('livelaw'))       source = 'LiveLaw';
    else if (host.includes('barandbench')) source = 'Bar & Bench';
    else if (host.includes('scobserver'))  source = 'SC Observer';
    else if (host.includes('latestlaws'))  source = 'LatestLaws';
    else if (host.includes('lawstreet'))   source = 'LawStreet';
    else source = host.split('.')[0].replace(/^[a-z]/, c => c.toUpperCase());
  } catch { /* keep default */ }
  return {
    headline: (item.title   ?? '') as string,
    source,
    date:     (item.date    ?? '') as string,
    url:      link,
    snippet:  (item.snippet ?? '') as string,
  };
}

function parseLawyerResult(item: any): LawyerResult {
  const link = (item.link ?? '') as string;
  let source = 'Legal Resource';
  try {
    const host = new URL(link).hostname.replace('www.', '');
    if (host.includes('lawrato'))           source = 'Lawrato';
    else if (host.includes('vakilsearch'))  source = 'Vakil Search';
    else if (host.includes('nalsa'))        source = 'NALSA';
    else if (host.includes('legalservices')) source = 'Legal Services India';
    else if (host.includes('indiakanoon') || host.includes('indiankanoon')) source = 'IndianKanoon';
    else if (host.includes('advocatekhoj')) source = 'AdvocateKhoj';
    else if (host.includes('justdial'))     source = 'JustDial';
    else source = host.split('.')[0].replace(/^[a-z]/, c => c.toUpperCase());
  } catch { /* keep default */ }
  return {
    title:   (item.title   ?? '') as string,
    source,
    url:     link,
    snippet: (item.snippet ?? '') as string,
  };
}

function extractCourt(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('supreme court'))  return 'Supreme Court of India';
  if (t.includes('high court')) {
    const m = text.match(/([A-Z][a-z]+(?: [A-Z][a-z]+)*)?\s*High Court/);
    return m ? m[0].trim() : 'High Court';
  }
  if (t.includes('tribunal'))       return 'Tribunal';
  if (t.includes('district court')) return 'District Court';
  return 'Indian Court';
}

function extractDate(text: string): string {
  const m1 = text.match(/on\s+(\d{1,2}\s+\w+[,\s]+\d{4})/i);
  if (m1) return m1[1].replace(/,\s*/, ' ');
  const m2 = text.match(/\b(20\d{2}|19\d{2})\b/);
  if (m2) return m2[1];
  return '';
}

// Extract "Justice XYZ" names from combined text
function extractJudgeNames(text: string): string[] {
  const matches = text.match(/Justice\s+[A-Z][a-z]+(?:\s+[A-Z][a-z.]+)*/g) ?? [];
  return [...new Set(matches.map(m => m.trim()))].slice(0, 4);
}

// ─── Unified Gemini synthesis ────────────────────────────────────────────────
interface GroqSynthesis {
  problemSummary: string;
  currentPosition: string;
  solution:        string;
  keyPrinciples:   string[];
  synthesis:       string; // kept for fallback compatibility
  plainEnglish:    string;
  citizenRights:   string[];
  examAngle:       string;
}

async function synthesiseUnified(
  geminiKey: string,
  actLabel: string,
  query: string,
  snippets: string[],
): Promise<GroqSynthesis> {
  const combined = snippets
    .filter(Boolean)
    .slice(0, 3)
    .map((s, i) => `[${i + 1}] ${s}`)
    .join('\n\n');

  const prompt = `You are analysing Indian court case snippets about "${query}" under the ${actLabel}. Return a JSON object with EXACTLY these 8 keys — no extra text, no markdown outside the JSON:

{
  "problemSummary": "<2-3 sentences: What core legal problem does ${query} under ${actLabel} address? Who does it protect and against what harm? State the essential legal issue clearly.>",
  "currentPosition": "<150-200 words: The current judicial position — what courts have consistently held, how the law has evolved, what the settled position is today. Cite principles from the snippets. Formal legal language.>",
  "solution": "<120-150 words: Practical legal remedies and strategies available to someone invoking ${query} of ${actLabel}. What relief can the court grant? What arguments are strongest? What procedural steps must be followed? Be specific and actionable.>",
  "keyPrinciples": [
    "<Landmark principle #1 established by courts — one crisp sentence citing the rule of law>",
    "<Landmark principle #2>",
    "<Landmark principle #3>",
    "<Landmark principle #4>"
  ],
  "synthesis": "<150 words: Concise judicial intelligence summary combining legal position and case significance — for senior advocates.>",
  "plainEnglish": "<Exactly 3 sentences explaining this to a 12-year-old Indian student. Simple words, real-life analogies — school, family, police. Zero legal jargon.>",
  "citizenRights": [
    "<Practical right #1 a citizen gains under this section — plain language, max 20 words>",
    "<Practical right #2>",
    "<Practical right #3>",
    "<Practical right #4>"
  ],
  "examAngle": "<1-2 sentences on how this appears in UPSC J, HJS, APO, Munsiff exams — specific angle examiners test.>"
}

Case Snippets:
${combined}`;

  // gemini-1.5-flash: stable JSON output, generous free tier (1500 req/day)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    signal: AbortSignal.timeout(20000), // 20 s — enough for rich multi-field output
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `You are a senior Indian legal researcher and educator. You write formal legal analysis for lawyers, plain-language explanations for citizens, and exam tips for judiciary aspirants.\n\n${prompt}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 3000, // enough for all 8 fields without truncation
        response_mime_type: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    console.error('Gemini error', response.status, errText);
    return { problemSummary: '', currentPosition: '', solution: '', keyPrinciples: [], synthesis: '', plainEnglish: '', citizenRights: [], examAngle: '' };
  }

  const data = await response.json();

  // Gemini wraps content in candidates[0].content.parts[0].text
  const raw = (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  ).trim();

  if (!raw) {
    console.error('Gemini empty response', JSON.stringify(data).slice(0, 400));
    return { problemSummary: '', currentPosition: '', solution: '', keyPrinciples: [], synthesis: '', plainEnglish: '', citizenRights: [], examAngle: '' };
  }

  // Strip markdown code fences if model wraps JSON in ```json ... ```
  const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  try {
    const parsed = JSON.parse(jsonStr) as Partial<GroqSynthesis>;
    return {
      problemSummary:  typeof parsed.problemSummary  === 'string' ? parsed.problemSummary  : '',
      currentPosition: typeof parsed.currentPosition === 'string' ? parsed.currentPosition : '',
      solution:        typeof parsed.solution        === 'string' ? parsed.solution        : '',
      keyPrinciples:   Array.isArray(parsed.keyPrinciples)        ? parsed.keyPrinciples   : [],
      synthesis:       typeof parsed.synthesis       === 'string' ? parsed.synthesis       : '',
      plainEnglish:    typeof parsed.plainEnglish    === 'string' ? parsed.plainEnglish    : '',
      citizenRights:   Array.isArray(parsed.citizenRights)        ? parsed.citizenRights   : [],
      examAngle:       typeof parsed.examAngle       === 'string' ? parsed.examAngle       : '',
    };
  } catch (e) {
    console.error('Gemini JSON parse failed', String(e), jsonStr.slice(0, 300));
    // Put the raw text in synthesis as a best-effort fallback
    return { problemSummary: '', currentPosition: '', solution: '', keyPrinciples: [], synthesis: jsonStr.slice(0, 800), plainEnglish: '', citizenRights: [], examAngle: '' };
  }
}

import { setCorsHeaders } from './_lib/security';

// ─── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = (req.headers.origin as string) || '';
  setCorsHeaders(res, origin, 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')     return res.status(405).json({ error: 'Method Not Allowed' });

  const {
    act   = 'ipc',
    query = '',
    mode  = 'section',
    court = 'all',
  } = req.query as Record<string, string>;

  if (!query.trim()) return res.status(400).json({ error: 'query is required' });

  const serperKey = process.env.SERPER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!serperKey) {
    return res.status(503).json({
      error:   'no_key',
      message: 'Search API not configured. Add SERPER_API_KEY to Vercel environment variables.',
    });
  }

  const actLabel   = ACT_LABEL[act] ?? act;
  const searchQ    = buildQuery(act, query.trim(), mode, court);
  const newsQ      = buildNewsQuery(act, query.trim(), mode);
  const lawyerQ    = buildLawyerQuery(act, query.trim(), mode);

  const serperHeaders = {
    'X-API-KEY':    serperKey,
    'Content-Type': 'application/json',
  };

  try {
    // Fire all 3 Serper calls in parallel — 7 s timeout each so we
    // never blow the 10 s Vercel Hobby limit or 30 s Pro limit.
    const serperTimeout = () => AbortSignal.timeout(7000);
    const [searchRes, newsRes, lawyerRes] = await Promise.all([
      fetch('https://google.serper.dev/search', {
        method: 'POST', headers: serperHeaders, signal: serperTimeout(),
        body: JSON.stringify({ q: searchQ,  num: 10, hl: 'en', gl: 'in' }),
      }),
      fetch('https://google.serper.dev/news', {
        method: 'POST', headers: serperHeaders, signal: serperTimeout(),
        body: JSON.stringify({ q: newsQ,    num: 6,  hl: 'en', gl: 'in' }),
      }),
      fetch('https://google.serper.dev/search', {
        method: 'POST', headers: serperHeaders, signal: serperTimeout(),
        body: JSON.stringify({ q: lawyerQ,  num: 5,  hl: 'en', gl: 'in' }),
      }),
    ]);

    if (!searchRes.ok) {
      const text = await searchRes.text().catch(() => '');
      console.error('Serper search error', searchRes.status, text);
      return res.status(502).json({ error: `Search service returned ${searchRes.status}` });
    }

    const searchData = await searchRes.json();
    const newsData   = newsRes.ok    ? await newsRes.json()   : { news: [] };
    const lawyerData = lawyerRes.ok  ? await lawyerRes.json() : { organic: [] };

    const results: JudgmentResult[] = (searchData.organic ?? [] as any[])
      .filter((r: any) => r.link && r.title)
      .map(parseSerperResult)
      .slice(0, 10);

    const newsResults: NewsResult[] = (newsData.news ?? [] as any[])
      .filter((r: any) => r.link && r.title)
      .map(parseNewsResult)
      .slice(0, 6);

    const lawyerResults: LawyerResult[] = (lawyerData.organic ?? [] as any[])
      .filter((r: any) => r.link && r.title)
      .map(parseLawyerResult)
      .slice(0, 4);

    // Extract judge names mentioned in top results
    const combinedText = results.slice(0, 5).map(r => r.title + ' ' + r.summary).join(' ');
    const judgesMentioned = extractJudgeNames(combinedText);

    // Unified Groq synthesis
    let groqData: GroqSynthesis = { problemSummary: '', currentPosition: '', solution: '', keyPrinciples: [], synthesis: '', plainEnglish: '', citizenRights: [], examAngle: '' };
    if (geminiKey && results.length > 0) {
      groqData = await synthesiseUnified(
        geminiKey,
        actLabel,
        query.trim(),
        results.slice(0, 3).map(r => r.summary),
      ).catch(() => groqData);
    }

    return res.status(200).json({
      results,
      newsResults,
      lawyerResults,
      judgesMentioned,
      problemSummary:  groqData.problemSummary,
      currentPosition: groqData.currentPosition,
      solution:        groqData.solution,
      keyPrinciples:   groqData.keyPrinciples,
      synthesis:       groqData.synthesis,
      plainEnglish:    groqData.plainEnglish,
      citizenRights:   groqData.citizenRights,
      examAngle:       groqData.examAngle,
      count: results.length,
      total: searchData.searchInformation?.totalResults,
    });
  } catch (err: any) {
    console.error('judgment-search error:', err);
    return res.status(500).json({ error: 'Search failed. Please try again.' });
  }
}
