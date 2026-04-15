import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper, RefreshCw, Copy, Check,
  Bookmark, BookMarked, Scale, Gavel, ExternalLink,
} from 'lucide-react';
import { useDailyLegalNews } from '../../hooks/useDailyLegalNews';
import type { LegalNewsItem } from '../../hooks/useDailyLegalNews';
import { useBookmarks } from '../../hooks/useBookmarks';
import {
  IG_GRADIENT, wrapTextCanvas, drawBadge, drawDivider,
  drawBaseBackground, shareFile,
} from '../../lib/playgroundShare';

// ─── IG Story Generator ───────────────────────────────────────────────────────
async function generateNewsStoryCard(item: LegalNewsItem): Promise<Blob | null> {
  const W = 1080, H = 1920, PAD = 80;
  // Reserve bottom 140px for footer band — content must not enter this zone
  const FOOTER_TOP = H - 140;

  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const raw = canvas.getContext('2d');
  if (!raw) return null;
  const ctx = raw as CanvasRenderingContext2D;

  // ── Background ──────────────────────────────────────────────────────────────
  // Paper-cream base
  ctx.fillStyle = '#F9F7F2';
  ctx.fillRect(0, 0, W, H);

  // Textured radial gradient — top-left warm gold
  const g1 = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 1.1);
  g1.addColorStop(0, 'rgba(201,168,76,0.13)');
  g1.addColorStop(0.6, 'rgba(201,168,76,0.04)');
  g1.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);

  // Bottom-right burgundy glow
  const g2 = ctx.createRadialGradient(W, H, 0, W, H, W * 0.9);
  g2.addColorStop(0, 'rgba(107,30,46,0.10)');
  g2.addColorStop(0.5, 'rgba(107,30,46,0.04)');
  g2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);

  // Diagonal grain stripes (subtle texture)
  ctx.save();
  ctx.globalAlpha = 0.025;
  ctx.strokeStyle = '#6B1E2E';
  ctx.lineWidth = 1;
  for (let x = -H; x < W + H; x += 28) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + H, H); ctx.stroke();
  }
  ctx.restore();

  // Top gold accent bar (thicker, gradient)
  const topBar = ctx.createLinearGradient(0, 0, W, 0);
  topBar.addColorStop(0, '#6B1E2E');
  topBar.addColorStop(0.5, '#C9A84C');
  topBar.addColorStop(1, '#6B1E2E');
  ctx.fillStyle = topBar; ctx.fillRect(0, 0, W, 18);

  // ── Header (logo + EDULAW) ───────────────────────────────────────────────────
  let Y = await drawBaseBackground(ctx, W, H);
  // drawBaseBackground already drew the top bar again — that's fine (double draw is harmless)

  // ── Badge ────────────────────────────────────────────────────────────────────
  if (Y < FOOTER_TOP - 76) {
    drawBadge(ctx, 'DAILY LEGAL UPDATE', W / 2, Y + 28);
    Y += 80;
  }

  // ── Court pill ──────────────────────────────────────────────────────────────
  if (Y < FOOTER_TOP - 60) {
    const isSC = item.court === 'Supreme Court';
    const pillColor = isSC ? '#6B1E2E' : '#0D7377';
    ctx.fillStyle = pillColor;
    const pillW = 340, pillH = 48, pillR = 24;
    const pillX = W / 2 - pillW / 2;
    ctx.beginPath();
    ctx.roundRect(pillX, Y, pillW, pillH, pillR);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.court.toUpperCase(), W / 2, Y + 31);
    Y += 68;
  }

  // ── Category chip ────────────────────────────────────────────────────────────
  if (Y < FOOTER_TOP - 52) {
    ctx.font = 'bold 20px Arial, sans-serif';
    const chipW = Math.min(ctx.measureText(item.category).width + 48, W - PAD * 2);
    ctx.fillStyle = 'rgba(201,168,76,0.18)';
    ctx.beginPath();
    ctx.roundRect(W / 2 - chipW / 2, Y, chipW, 40, 20);
    ctx.fill();
    ctx.fillStyle = '#9A7A20';
    ctx.textAlign = 'center';
    ctx.fillText(item.category, W / 2, Y + 26);
    Y += 60;
  }

  drawDivider(ctx, W, Y, PAD);
  Y += 52;

  // ── Headline ─────────────────────────────────────────────────────────────────
  if (Y < FOOTER_TOP - 80) {
    ctx.fillStyle = '#1A1A1A';
    ctx.font = 'bold 52px Georgia, serif';
    ctx.textAlign = 'center';
    // Clamp headline to max 3 lines
    const maxHeadlineH = Math.min(FOOTER_TOP - Y - 280, 3 * 72);
    const headlineBottom = wrapTextCanvas(ctx, item.title, PAD, Y, W - PAD * 2, 72, 'center');
    Y = Math.min(headlineBottom, Y + maxHeadlineH) + 40;
  }

  if (Y < FOOTER_TOP - 60) {
    drawDivider(ctx, W, Y, PAD);
    Y += 48;
  }

  // ── Summary label ────────────────────────────────────────────────────────────
  if (Y < FOOTER_TOP - 100) {
    ctx.fillStyle = '#C9A84C';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('KEY DEVELOPMENT', PAD, Y);
    Y += 52;

    // Summary text — clamp to available space
    const summaryMaxH = FOOTER_TOP - Y - 30;
    const lineH = 64;
    const maxLines = Math.floor(summaryMaxH / lineH);
    if (maxLines >= 1) {
      ctx.fillStyle = 'rgba(26,26,26,0.82)';
      ctx.font = '42px Arial, sans-serif';
      ctx.textAlign = 'left';
      // Truncate summary text to fit
      const charPerLine = Math.floor((W - PAD * 2) / (42 * 0.52));
      const maxChars = maxLines * charPerLine;
      const summaryText = item.summary.length > maxChars
        ? item.summary.slice(0, maxChars - 1) + '…'
        : item.summary;
      Y = wrapTextCanvas(ctx, summaryText, PAD, Y, W - PAD * 2, lineH);
    }
  }

  // ── Footer band (dark ink, gold accent — no red) ────────────────────────────
  // Soft fade from transparent to dark ink
  const footerGrad = ctx.createLinearGradient(0, FOOTER_TOP - 30, 0, H);
  footerGrad.addColorStop(0, 'rgba(249,247,242,0)');
  footerGrad.addColorStop(0.35, 'rgba(26,16,10,0.70)');
  footerGrad.addColorStop(1, 'rgba(20,12,8,0.92)');
  ctx.fillStyle = footerGrad;
  ctx.fillRect(0, FOOTER_TOP - 30, W, H - FOOTER_TOP + 30);

  // Bottom gold bar
  const bottomBar = ctx.createLinearGradient(0, 0, W, 0);
  bottomBar.addColorStop(0, '#C9A84C');
  bottomBar.addColorStop(0.5, '#E8C97A');
  bottomBar.addColorStop(1, '#C9A84C');
  ctx.fillStyle = bottomBar;
  ctx.fillRect(0, H - 18, W, 18);

  // Footer text
  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  ctx.font = 'bold 28px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('EduLaw Daily Digest', W / 2, FOOTER_TOP + 42);
  ctx.fillStyle = 'rgba(232,201,122,0.95)';
  ctx.font = '22px Arial, sans-serif';
  ctx.fillText(dateStr, W / 2, FOOTER_TOP + 72);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '20px Arial, sans-serif';
  ctx.fillText('theedulaw.in/legal-playground', W / 2, FOOTER_TOP + 100);

  return new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b), 'image/png'));
}

// ─── Subject color map ────────────────────────────────────────────────────────
const categoryColors: Record<string, string> = {
  'Constitutional Law': 'bg-burgundy/10 text-burgundy',
  'Criminal Law':       'bg-red-100 text-red-700',
  'Commercial Law':     'bg-blue-100 text-blue-700',
  'Property Law':       'bg-amber-100 text-amber-700',
  'Environmental Law':  'bg-green-100 text-green-700',
  'Labour Law':         'bg-teal-100 text-teal-700',
  'Family Law':         'bg-pink-100 text-pink-700',
  'Tax Law':            'bg-purple-100 text-purple-700',
  'Election Law':       'bg-orange-100 text-orange-700',
};

// ─── JSON-LD structured data injector ────────────────────────────────────────
function useNewsJsonLd(items: LegalNewsItem[]) {
  useEffect(() => {
    if (items.length === 0) return;
    const id = 'edulaw-news-jsonld';
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement('script');
      el.id = id;
      el.type = 'application/ld+json';
      document.head.appendChild(el);
    }
    const structured = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Daily Legal News — Indian Supreme Court & High Court Updates',
      description: 'Daily curated legal news from the Supreme Court of India and various High Courts, updated every morning.',
      url: 'https://theedulaw.in/legal-playground',
      numberOfItems: items.length,
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'NewsArticle',
          headline: item.title,
          description: item.summary,
          url: `https://store.theedulaw.in/legal-news/${item.id}`,
          datePublished: item.publishedAt,
          publisher: {
            '@type': 'Organization',
            name: item.source,
          },
          about: {
            '@type': 'Thing',
            name: item.court,
          },
          keywords: `${item.category}, ${item.court}, Indian Law, Judiciary`,
        },
      })),
    };
    el.textContent = JSON.stringify(structured);
    return () => { el?.remove(); };
  }, [items]);
}

// ─── Countdown to next refresh (10:30 AM IST = 05:00 UTC) ───────────────────
function useNextRefreshLabel() {
  const now = new Date();
  const next = new Date();
  next.setUTCHours(5, 0, 0, 0);
  if (now.getUTCHours() >= 5) next.setUTCDate(next.getUTCDate() + 1);
  const diffMs = next.getTime() - now.getTime();
  const h = Math.floor(diffMs / 3600000);
  const m = Math.floor((diffMs % 3600000) / 60000);
  return h > 0 ? `Refreshes in ${h}h ${m}m` : `Refreshes in ${m}m`;
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border border-ink/10 rounded-2xl p-5 space-y-3 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-5 w-20 rounded-md bg-ink/8" />
        <div className="h-5 w-16 rounded-md bg-ink/8" />
      </div>
      <div className="h-5 w-full rounded-md bg-ink/8" />
      <div className="h-5 w-4/5 rounded-md bg-ink/8" />
      <div className="h-4 w-full rounded-md bg-ink/5" />
      <div className="h-4 w-3/4 rounded-md bg-ink/5" />
    </div>
  );
}

// ─── Individual News Card ─────────────────────────────────────────────────────
const SUMMARY_COLLAPSE_AT = 200;

function NewsCard({ item }: { item: LegalNewsItem }) {
  const [copied, setCopied]       = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [expanded, setExpanded]   = useState(false);
  const { toggle, isBookmarked } = useBookmarks();
  const longSummary = item.summary.length > SUMMARY_COLLAPSE_AT;

  const handleCopy = useCallback(() => {
    const text = `${item.title}\n${item.court} · ${item.source}\n\n${item.summary}${item.url !== '#' ? `\n\nRead more: ${item.url}` : ''}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [item]);

  const handleShare = async () => {
    setShareBusy(true);
    try {
      const blob = await generateNewsStoryCard(item);
      if (blob) await shareFile(new File([blob], `edulaw-news-${item.id}.png`, { type: 'image/png' }), item.title);
    } catch (_) {}
    finally { setShareBusy(false); }
  };

  const timeLabel = (() => {
    try {
      const d = new Date(item.publishedAt);
      if (isNaN(d.getTime())) return '';
      const diffMs = Date.now() - d.getTime();
      const h = Math.floor(diffMs / 3600000);
      if (h < 1) return 'Just now';
      if (h < 24) return `${h}h ago`;
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch { return ''; }
  })();

  const catColor = categoryColors[item.category] ?? 'bg-slate-100 text-slate-600';
  const isBooked = isBookmarked(item.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white border border-ink/10 rounded-2xl p-5 hover:border-burgundy/25 hover:shadow-md transition-all flex flex-col gap-3"
    >
      {/* Top row: badges + timestamp */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${item.court === 'Supreme Court' ? 'bg-burgundy/10 text-burgundy' : 'bg-teal-100 text-teal-700'}`}>
            {item.court === 'Supreme Court' ? <Scale className="w-2.5 h-2.5" /> : <Gavel className="w-2.5 h-2.5" />}
            {item.court === 'Supreme Court' ? 'SC' : 'HC'}
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-ink/5 text-[10px] font-bold text-mutedgray">
            {item.source}
          </span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${catColor}`}>
            {item.category}
          </span>
        </div>
        {timeLabel && (
          <span className="text-[10px] font-ui text-mutedgray shrink-0">{timeLabel}</span>
        )}
      </div>

      {/* Headline — links to individual news article page */}
      <Link
        to={`/legal-news/${item.id}`}
        className="font-display text-base text-ink leading-snug group-hover:text-burgundy transition-colors hover:underline decoration-burgundy/30"
      >
        {item.title}
      </Link>

      {/* Summary */}
      <div className="flex-1">
        <p className="font-body text-sm text-ink/70 leading-relaxed">
          {longSummary && !expanded
            ? item.summary.slice(0, SUMMARY_COLLAPSE_AT).trimEnd() + '…'
            : item.summary}
        </p>
        {longSummary && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="mt-1 text-[11px] font-ui font-bold text-burgundy/70 hover:text-burgundy transition-colors"
          >
            {expanded ? 'Show less ↑' : 'Read more ↓'}
          </button>
        )}
      </div>

      {/* Action row */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-ink/5">
        <button onClick={handleCopy} title="Copy" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-ink/5 transition-colors text-[11px] font-ui text-ink/50">
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button onClick={() => toggle(item.id)} title={isBooked ? 'Remove bookmark' : 'Save'} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-ink/5 transition-colors text-[11px] font-ui text-ink/50">
          {isBooked ? <BookMarked className="w-3.5 h-3.5 text-burgundy" /> : <Bookmark className="w-3.5 h-3.5" />}
          {isBooked ? 'Saved' : 'Save'}
        </button>
        <button
          onClick={handleShare}
          disabled={shareBusy}
          style={{ background: IG_GRADIENT }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-ui text-[11px] font-black text-white disabled:opacity-50 active:scale-95 transition-transform"
        >
          {shareBusy ? <RefreshCw className="w-3 h-3 animate-spin" /> : <span>📱</span>}
          {shareBusy ? 'Generating…' : 'Story'}
        </button>
        <Link
          to={`/legal-news/${item.id}`}
          className="ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-ink/5 transition-colors text-[11px] font-ui text-burgundy/70 hover:text-burgundy"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Full article
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────
type Tab = 'all' | 'sc' | 'hc';

export function DailyLegalNews() {
  const { items, sc, hc, loading, error } = useDailyLegalNews();
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const refreshLabel = useNextRefreshLabel();
  useNewsJsonLd(items);

  const displayed = activeTab === 'all' ? items : activeTab === 'sc' ? sc : hc;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: 'All',            count: items.length },
    { key: 'sc',  label: 'Supreme Court',  count: sc.length },
    { key: 'hc',  label: 'High Courts',    count: hc.length },
  ];

  return (
    <div className="bg-white border border-ink/10 rounded-3xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-ink/5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <Newspaper className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-ui font-black text-sm text-ink">Daily Legal News</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Live</span>
              </span>
            </div>
            <p className="text-[10px] font-ui text-mutedgray">SC &amp; HC updates · {refreshLabel}</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 px-4 py-3 border-b border-ink/5 overflow-x-auto hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-ui text-[11px] font-bold transition-all ${activeTab === tab.key ? 'bg-red-500 text-white' : 'text-ink/50 hover:bg-ink/5'}`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-ink/8 text-ink/50'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 max-h-[780px] overflow-y-auto">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {error && !loading && (
          <div className="py-12 text-center">
            <p className="text-sm font-ui text-mutedgray">{error}</p>
          </div>
        )}

        {!loading && !error && displayed.length === 0 && (
          <div className="py-12 text-center space-y-2">
            <Newspaper className="w-8 h-8 text-ink/20 mx-auto" />
            <p className="text-sm font-ui font-bold text-ink/40">
              {items.length === 0 ? 'News refreshes at 10:30 AM IST' : `No ${activeTab === 'sc' ? 'Supreme Court' : 'High Court'} items today`}
            </p>
            <p className="text-xs font-ui text-mutedgray">Check back after the next refresh</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!loading && !error && displayed.length > 0 && (
            <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {displayed.map(item => (
                <NewsCard key={item.id} item={item} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
