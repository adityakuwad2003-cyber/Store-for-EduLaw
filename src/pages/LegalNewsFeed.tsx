import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  Newspaper, Scale, Gavel, Building2,
  ChevronLeft, ChevronRight, X, Calendar,
  Share2, RefreshCw, Globe, Instagram,
  ShoppingBag, ArrowLeft,
  BookOpen
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { shareNewsStoryAction } from '@/lib/newsShare';
import { useNavigate } from 'react-router-dom';
import { getRecommendedHook, type PromoHook } from '@/lib/hookEngine';
import { SubtleHook } from '@/components/playground/SubtleHook';

// ─── Types ──────────────────────────────────────────────────────────────────
interface NewsItem {
  id: string;
  title: string;
  court: string;
  summary: string;
  category: string;
  source: string;
  dateString: string;
  publishedAt: string;
  contentType: string;
  createdAt?: any;
}

// ─── Court badge config ──────────────────────────────────────────────────────
function CourtBadge({ court }: { court: string }) {
  if (court === 'Supreme Court') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-burgundy/15 text-burgundy border border-burgundy/20">
        <Scale className="w-2.5 h-2.5" /> SC
      </span>
    );
  }
  if (court === 'High Court') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-teal-50 text-teal-700 border border-teal-100">
        <Gavel className="w-2.5 h-2.5" /> HC
      </span>
    );
  }
  if (court === 'Tribunal') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-50 text-purple-700 border border-purple-100">
        <Building2 className="w-2.5 h-2.5" /> TRIB
      </span>
    );
  }
  // Current Affairs
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-100">
      <Globe className="w-2.5 h-2.5" /> LEGAL
    </span>
  );
}

// ─── Inshorts-style news card viewer ────────────────────────────────────────
function NewsCardViewer({
  news,
  activeIdx,
  setActiveIdx,
  onClose,
}: {
  news: NewsItem[];
  activeIdx: number;
  setActiveIdx: (i: number) => void;
  onClose: () => void;
}) {
  const current = news[activeIdx];
  const [shareBusy, setShareBusy] = useState(false);
  const navigate = useNavigate();

  const handleNext = () => {
    if (activeIdx < news.length - 1) setActiveIdx(activeIdx + 1);
    else onClose();
  };
  const handlePrev = () => {
    if (activeIdx > 0) setActiveIdx(activeIdx - 1);
  };

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown' || e.code === 'Space') { e.preventDefault(); handleNext(); }
      if (e.code === 'ArrowUp')   { e.preventDefault(); handlePrev(); }
      if (e.code === 'Escape')    onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIdx]);

  // Court gradient maps
  const courtGrad: Record<string, string> = {
    'Supreme Court':  'from-burgundy/90 via-burgundy/60 to-transparent',
    'High Court':     'from-teal-900/90 via-teal-900/50 to-transparent',
    'Tribunal':       'from-purple-900/90 via-purple-900/50 to-transparent',
    'Current Affairs':'from-blue-900/90 via-blue-900/50 to-transparent',
  };
  const grad = courtGrad[current.court] ?? 'from-ink/80 via-ink/40 to-transparent';

  // Hero pattern based on court
  const patternMap: Record<string, string> = {
    'Supreme Court':  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    'High Court':     'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    'Tribunal':       'https://images.unsplash.com/photo-1450175804616-784f7ba7042b?auto=format&fit=crop&w=800&q=80',
    'Current Affairs':'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
  };
  const imgSrc = patternMap[current.court] ?? patternMap['Current Affairs'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/85 backdrop-blur-xl p-4 sm:p-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-parchment rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)] flex flex-col"
        style={{ height: 'min(88vh, 700px)' }}
      >
        {/* ── Segmented progress bar ── */}
        <div className="absolute top-0 left-0 right-0 h-1 flex gap-0.5 px-4 pt-1.5 z-30">
          {news.map((_, i) => (
            <div
              key={i}
              className={`h-full rounded-full flex-1 transition-all duration-500 ${
                i < activeIdx  ? 'bg-gold'
                : i === activeIdx ? 'bg-gold'
                : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* ── Hero image ── */}
        <div className="relative h-[44%] w-full shrink-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={current.id}
              src={imgSrc}
              alt={current.title}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className={`absolute inset-0 bg-gradient-to-t ${grad}`} />

          {/* Close & badge */}
          <div className="absolute top-8 left-8 right-8 flex items-start justify-between z-10">
            <div className="flex gap-2 flex-wrap">
              <CourtBadge court={current.court} />
              <span className="px-2.5 py-1 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                {current.category}
              </span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2.5 bg-white/10 hover:bg-white/25 rounded-full text-white transition-all backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Text section ── */}
        <div className="flex-1 bg-parchment p-8 sm:p-10 flex flex-col -mt-10 relative z-10 rounded-t-[2.5rem] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="flex flex-col h-full"
            >
              {/* Meta */}
              <div className="flex items-center gap-3 text-[10px] font-ui font-bold text-gold uppercase tracking-[0.18em] mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {current.dateString}
                </span>
                <span className="w-1 h-1 rounded-full bg-gold/30" />
                <span>EduLaw Digest</span>
              </div>

              {/* Title */}
              <h2 className="font-display text-2xl sm:text-3xl text-ink leading-tight mb-5">
                {current.title}
              </h2>

              {/* Summary */}
              <p className="font-body text-base text-ink/70 leading-relaxed overflow-y-auto pr-1 flex-1"
                style={{ WebkitOverflowScrolling: 'touch' }}>
                {current.summary}
              </p>

              {/* Actions & Hooks */}
              <div className="mt-auto space-y-4">
                {/* Study Hook Card */}
                <div className="mt-auto">
                  <SubtleHook textToMatch={current.summary + " " + current.title} className="bg-ink/5 border-ink/10" />
                </div>

                {/* Main Navigation */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrev}
                      disabled={activeIdx === 0}
                      aria-label="Previous"
                      className="w-11 h-11 flex items-center justify-center border border-ink/10 rounded-full text-ink disabled:opacity-25 hover:bg-ink hover:text-white transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNext}
                      aria-label={activeIdx === news.length - 1 ? 'Close' : 'Next'}
                      className="h-11 px-5 flex items-center gap-2 bg-ink text-parchment rounded-full font-ui text-[11px] font-bold uppercase tracking-widest hover:bg-ink/90 transition-colors shadow-lg shadow-ink/10"
                    >
                      {activeIdx === news.length - 1 ? 'Done' : <>Next Story <ChevronRight className="w-4 h-4" /></>}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => shareNewsStoryAction(current as any, setShareBusy)}
                      disabled={shareBusy}
                      className="w-11 h-11 flex items-center justify-center bg-parchment border border-ink/10 rounded-full text-ink hover:border-gold hover:text-gold transition-all relative group"
                      title="Share to Instagram Story"
                    >
                      {shareBusy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Instagram className="w-4 h-4" />}
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-ink text-parchment text-[9px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Share Story</span>
                    </button>
                    <div className="text-[10px] font-ui font-black text-ink/20 uppercase tracking-widest ml-2">
                      {activeIdx + 1} / {news.length}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Promo/Hook Card ────────────────────────────────────────────────────────
function HookCard({ hook }: { hook: PromoHook }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`group relative overflow-hidden rounded-2xl border p-5 flex flex-col gap-3 transition-all hover:shadow-xl ${hook.bgClass}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{hook.topic}</span>
        <span className="text-lg">{hook.icon}</span>
      </div>
      <h3 className="font-display text-lg leading-tight text-current">{hook.cta}</h3>
      <p className="font-body text-xs opacity-70 line-clamp-2">{hook.description}</p>
      
      <button 
        onClick={() => navigate(hook.link)}
        className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-ink text-parchment rounded-xl font-ui text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg shadow-black/10"
      >
        <ShoppingBag className="w-3.5 h-3.5" />
        {hook.label}
      </button>

      {/* Decorative pattern */}
       <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none scale-150">
          <BookOpen className="w-24 h-24" />
       </div>
    </motion.div>
  );
}



// ─── Filter tabs ──────────────────────────────────────────────────────────────
const FILTERS = ['All', 'Supreme Court', 'High Court', 'Tribunal', 'Current Affairs'] as const;
type FilterType = typeof FILTERS[number];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LegalNewsFeed() {
  const [items, setItems]       = useState<NewsItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]         = useState<FilterType>('All');
  const [viewerIdx, setViewerIdx]   = useState<number | null>(null);
  const navigate = useNavigate();

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'playground_content'),
        where('contentType', '==', 'daily_news'),
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as NewsItem[];
      // Sort newest first
      data.sort((a: any, b: any) => {
        const ta = a.createdAt?.toMillis?.() ?? 0;
        const tb = b.createdAt?.toMillis?.() ?? 0;
        return tb - ta;
      });
      setItems(data);
    } catch (err) {
      console.error('LegalNewsFeed fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const filtered = filter === 'All' ? items : items.filter(i => i.court === filter);

  // Share
  const handleShare = async () => {
    const shareData = {
      title: 'EduLaw Daily Legal News',
      text: 'Fresh Supreme Court, High Court, Tribunal & legal current affairs — curated for law students.',
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (_) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Counts
  const counts: Record<string, number> = {
    'All':             items.length,
    'Supreme Court':   items.filter(i => i.court === 'Supreme Court').length,
    'High Court':      items.filter(i => i.court === 'High Court').length,
    'Tribunal':        items.filter(i => i.court === 'Tribunal').length,
    'Current Affairs': items.filter(i => i.court === 'Current Affairs').length,
  };

  return (
    <div className="min-h-screen bg-parchment">
      <Helmet>
        <title>EduLaw Legal News Feed — Supreme Court, High Court & Tribunals</title>
        <meta name="description" content="Daily curated legal news from Supreme Court, High Courts, Tribunals & legal current affairs — for Indian law students and advocates." />
        <meta property="og:title" content="EduLaw Legal News Feed" />
        <meta property="og:description" content="Daily curated legal news from Supreme Court, High Courts, Tribunals & legal current affairs." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://store.theedulaw.in/legal-news-feed" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="keywords" content="Supreme Court news, High Court judgments, NCLAT, NGT, ITAT, Indian legal news, EduLaw, law students" />
        <link rel="canonical" href="https://store.theedulaw.in/legal-news-feed" />
      </Helmet>

      {/* ── Top Unification Nav ── */}
      <div className="bg-ink border-b border-gold/10 py-3 relative z-[50]">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/legal-playground')}
            className="group flex items-center gap-2 text-parchment/50 hover:text-gold transition-colors font-ui text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Back to Playground
          </button>
          <div className="hidden sm:flex items-center gap-6">
            <span className="text-gold font-ui text-[10px] font-black uppercase tracking-[0.2em]">News Feed</span>
            <span className="w-1 h-1 rounded-full bg-gold/20" />
            <button 
              onClick={() => navigate('/legal-hub')}
              className="text-parchment/30 hover:text-parchment transition-colors font-ui text-[10px] font-black uppercase tracking-[0.2em]"
            >
              Interactive Hub
            </button>
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="relative bg-ink overflow-hidden">
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ink/60" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-14 sm:pt-20 sm:pb-16">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
            </span>
            <span className="text-gold text-[10px] font-black uppercase tracking-[0.25em] font-ui">Live Legal Updates</span>
          </div>

          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1">
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-parchment leading-[1.1] mb-4">
                EduLaw<br />
                <span className="text-gold italic">Legal News Feed</span>
              </h1>
              <p className="font-body text-parchment/60 text-base sm:text-lg max-w-xl leading-relaxed">
                Supreme Court · High Courts · Tribunals · Legal Current Affairs — scraped fresh daily,
                rephrased for law students and judiciary aspirants.
              </p>
            </div>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-3 border border-gold/30 text-gold rounded-xl font-ui text-sm font-bold hover:bg-gold hover:text-ink transition-all backdrop-blur-sm"
            >
              <Share2 className="w-4 h-4" />
              Share Feed
            </button>
          </div>

          {/* Stats */}
          {!loading && items.length > 0 && (
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'SC Updates',   count: counts['Supreme Court'],   icon: Scale,     colour: 'border-burgundy/30 text-burgundy' },
                { label: 'HC Updates',   count: counts['High Court'],      icon: Gavel,     colour: 'border-teal-500/30 text-teal-400' },
                { label: 'Tribunals',    count: counts['Tribunal'],        icon: Building2,  colour: 'border-purple-400/30 text-purple-400' },
                { label: 'Current Affairs', count: counts['Current Affairs'], icon: Globe, colour: 'border-blue-400/30 text-blue-400' },
              ].map(stat => (
                <div key={stat.label} className={`bg-white/5 backdrop-blur-sm border rounded-2xl p-4 ${stat.colour}`}>
                  <stat.icon className="w-4 h-4 mb-2" />
                  <p className="font-display text-2xl text-parchment">{stat.count}</p>
                  <p className="text-[10px] font-ui font-bold text-parchment/40 uppercase tracking-widest mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Filter strip ── */}
      <div className="sticky top-0 z-40 bg-parchment/95 backdrop-blur-md border-b border-ink/8 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 overflow-x-auto hide-scrollbar">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 px-4 py-2 rounded-xl font-ui text-xs font-bold transition-all ${
                filter === f
                  ? 'bg-ink text-parchment shadow-md'
                  : 'bg-white/60 text-ink/50 hover:bg-white hover:text-ink border border-ink/8'
              }`}
            >
              {f} {f !== 'All' && counts[f] > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] ${filter === f ? 'bg-white/20' : 'bg-ink/8'}`}>
                  {counts[f]}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={fetchNews}
            disabled={loading}
            className="shrink-0 ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl border border-ink/10 text-ink/40 font-ui text-xs font-bold hover:bg-white hover:text-ink transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── News grid ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-52 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Newspaper className="w-12 h-12 text-ink/10 mx-auto mb-4" />
            <p className="font-body text-mutedgray">
              {items.length === 0
                ? 'No news yet. Check back after the daily cron runs.'
                : `No ${filter} news available right now.`}
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((item, idx) => {
              const elements = [];
              const hook = getRecommendedHook(item.summary + ' ' + item.title);
              
              if (hook && (idx === 2 || idx === 7 || idx === 12)) {
                 elements.push(<HookCard key={`hook-${item.id}`} hook={hook} />);
              }

              elements.push(
                <motion.button
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                  onClick={() => setViewerIdx(idx)}
                  className="group text-left bg-white rounded-2xl border border-ink/6 p-5 hover:border-gold/30 hover:shadow-lg transition-all flex flex-col gap-3"
                >
                  {/* Court + category row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <CourtBadge court={item.court} />
                    <span className="text-[10px] font-bold text-mutedgray bg-parchment px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <Instagram className="w-3 h-3 text-gold" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-ui font-semibold text-ink text-sm leading-snug group-hover:text-burgundy transition-colors line-clamp-3 flex-1">
                    {item.title}
                  </h3>

                  {/* Summary preview */}
                  <p className="text-xs font-body text-mutedgray line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>

                  {/* Date footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-ink/5">
                    <span className="text-[10px] font-ui font-bold text-gold/70 uppercase tracking-widest">
                      {item.dateString}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-ink/20 opacity-0 group-hover:opacity-100 transition-opacity">READ MORE</span>
                      <ChevronRight className="w-3.5 h-3.5 text-ink/20 group-hover:text-gold transition-colors" />
                    </div>
                  </div>
                </motion.button>
              );

              return elements;
            })}
          </motion.div>
        )}

        {/* Bottom promo */}
        {!loading && filtered.length > 0 && (
          <div className="mt-16 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest text-gold font-ui">
                Updates every morning via RSS scrape
              </span>
            </div>
            <p className="font-body text-sm text-mutedgray max-w-md mx-auto">
              Bookmark this page for daily legal coverage across all courts and tribunals in India.
            </p>
            <button
              onClick={() => filtered.length > 0 && setViewerIdx(0)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-burgundy text-parchment rounded-xl font-ui font-bold text-sm hover:bg-burgundy/90 transition-colors shadow-lg shadow-burgundy/15"
            >
              <Newspaper className="w-4 h-4" />
              Read Today's {filter !== 'All' ? filter : ''} News  
            </button>
          </div>
        )}
      </div>

      {/* ── News Card Viewer ── */}
      <AnimatePresence>
        {viewerIdx !== null && (
          <NewsCardViewer
            news={filtered}
            activeIdx={viewerIdx}
            setActiveIdx={setViewerIdx}
            onClose={() => setViewerIdx(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
