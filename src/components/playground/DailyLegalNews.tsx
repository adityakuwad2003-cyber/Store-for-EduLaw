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
import { shareNewsStoryAction } from '../../lib/newsShare';

// Logic moved to src/lib/newsShare.ts

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
    shareNewsStoryAction(item, setShareBusy);
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

      {/* Headline — links to unified news feed */}
      <Link
        to="/legal-news-feed"
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
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-burgundy/5 border border-burgundy/10 font-ui text-[11px] font-black text-burgundy disabled:opacity-50 active:scale-95 transition-transform"
        >
          {shareBusy ? <RefreshCw className="w-3 h-3 animate-spin" /> : <span>📱</span>}
          {shareBusy ? 'Generating…' : 'Story'}
        </button>
        <Link
          to="/legal-news-feed"
          className="ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-ink/5 hover:bg-ink/5 transition-colors text-[11px] font-ui text-ink/70 hover:text-ink"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Full Feed
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
