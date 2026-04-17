import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Globe,
  Gavel,
  Instagram, 
  RefreshCw, 
  Scale, 
  X, 
  History as HistoryIcon 
} from 'lucide-react';
import { Drawer } from 'vaul';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { shareNewsStoryAction } from '@/lib/newsShare';
import { useAuth } from '@/contexts/AuthContext';

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
  type?: 'news';
}

interface MarketingHook {
  id: string;
  type: 'hook' | 'gate';
  title: string;
  summary: string;
  category: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  court: string;
  dateString: string;
}

type FeedItem = NewsItem | MarketingHook;

// ─── News image helper ────────────────────────────────────────────────────────
// The "Easy Way Out": Just name your images news-1.jpg, news-2.jpg etc.
// and drop them in public/legal-discovery/.
const TOTAL_NEWS_IMAGES = 53; 

function titleHash(title: string): number {
  let h = 0;
  for (let i = 0; i < title.length; i++) {
    h = (Math.imul(31, h) + title.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function getNewsImage(title: string, _category: string, id?: string): string {
  const hash = titleHash(title + (id || ''));
  const imageNumber = (hash % TOTAL_NEWS_IMAGES) + 1;
  // Absolute path with cache buster for reliability
  return `/legal-discovery/news-${imageNumber}.jpg?v=2`;
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
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-100">
      <Globe className="w-2.5 h-2.5" /> LEGAL
    </span>
  );
}

const MARKETING_HOOKS: MarketingHook[] = [
  {
    id: 'hook-vakilconnect',
    type: 'hook',
    title: 'Hire a Top-Rated Advocate from ₹399',
    summary: 'Need immediate legal clarity? Consult with verified advocates for same-day professional advice on any legal matter.',
    category: 'VakilConnect',
    court: 'EduLaw Connect',
    ctaText: 'Find Your Advocate',
    ctaLink: '/vakil-connect',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200',
    dateString: 'Expert Access'
  },
  {
    id: 'hook-marketplace',
    type: 'hook',
    title: 'Unlock Comprehensive Subject Notes',
    summary: 'Access 46+ pro-grade notes and MCQ banks covering CLAT, Judiciary, and LLB semester exams.',
    category: 'Marketplace',
    court: 'EduLaw Store',
    ctaText: 'Browse the Store',
    ctaLink: '/marketplace',
    image: 'https://images.unsplash.com/photo-1473186578172-c141e6798fe4?q=80&w=1200',
    dateString: 'Self-Study'
  },
  {
    id: 'hook-subscription',
    type: 'hook',
    title: 'The Full EduLaw Experience. Unlocked.',
    summary: 'Go beyond the limit. Access every historical case judgment, watch AI summaries, and unlock the entire playground.',
    category: 'Subscription',
    court: 'Member Area',
    ctaText: 'View Membership',
    ctaLink: '/subscription',
    image: 'https://images.unsplash.com/photo-1550399105-c4db5e0d0b5b?q=80&w=1200',
    dateString: 'Premium'
  },
  {
    id: 'hook-templates',
    type: 'hook',
    title: 'Professional Legal Drafting Templates',
    summary: 'Stop starting from scratch. Download 500+ courtroom-vetted drafts, contracts, and legal templates.',
    category: 'Templates',
    court: 'Legal Tech',
    ctaText: 'Get Templates',
    ctaLink: '/marketplace?category=Templates',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200',
    dateString: 'Drafting Tools'
  }
];

const SIGN_IN_GATE: MarketingHook = {
  id: 'hook-gate',
  type: 'gate',
  title: 'Unlock Infinite Discovery',
  summary: 'You\'ve reached your free daily limit. Sign in to continue reading thousands of summarised judgments for free.',
  category: 'Registration',
  court: 'Community',
  ctaText: 'Sign In to Continue',
  ctaLink: '/login',
  image: 'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?q=80&w=1200',
  dateString: 'Limit Reached'
};

function NewsCardViewer({
  news,
  activeIdx,
  setActiveIdx,
  onClose,
}: {
  news: FeedItem[];
  activeIdx: number;
  setActiveIdx: (i: number) => void;
  onClose: () => void;
}) {
  const current = news[activeIdx];
  const isHook = 'type' in current && (current.type === 'hook' || current.type === 'gate');
  const [shareBusy, setShareBusy] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: scrollContainerRef });

  const imgOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const imgScale   = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);
  const headerOpacity = useTransform(scrollYProgress, [0.15, 0.25], [0, 1]);

  const handleNext = () => { if (activeIdx < news.length - 1) setActiveIdx(activeIdx + 1); else onClose(); };
  const handlePrev = () => { if (activeIdx > 0) setActiveIdx(activeIdx - 1); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown' || e.code === 'Space') { e.preventDefault(); handleNext(); }
      if (e.code === 'ArrowUp')   { e.preventDefault(); handlePrev(); }
      if (e.code === 'Escape')    onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIdx, onClose]);

  const imgSrc = isHook 
    ? (current as MarketingHook).image 
    : getNewsImage(current.title, current.category, (current as NewsItem).id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/90 backdrop-blur-xl p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        onClick={e => e.stopPropagation()}
        className={`relative w-full max-w-2xl overflow-hidden sm:rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.6)] flex flex-col h-full sm:h-[min(90vh,800px)] transition-colors duration-500 ${isHook ? 'bg-ink text-parchment' : 'bg-parchment text-ink'}`}
      >
        <motion.div 
          style={{ opacity: headerOpacity }}
          className={`absolute top-0 left-0 right-0 h-[64px] backdrop-blur-md border-b z-[45] flex items-center px-6 pr-16 ${isHook ? 'bg-ink/95 border-white/10' : 'bg-parchment/95 border-ink/5'}`}
        >
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-black text-gold uppercase tracking-widest mb-1">{current.court}</span>
            <h4 className={`text-[13px] font-display truncate font-bold ${isHook ? 'text-parchment' : 'text-ink'}`}>{current.title}</h4>
          </div>
        </motion.div>

        <div className="absolute top-0 right-0 p-4 z-[50]">
          <button onClick={onClose} className={`p-2.5 rounded-full backdrop-blur-sm transition-colors ${isHook ? 'bg-white/10 hover:bg-white/20 text-parchment' : 'bg-ink/5 hover:bg-ink/10 text-ink'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overscroll-contain scroll-smooth touch-auto">
          <div className="relative h-[48vh] sm:h-[400px] w-full shrink-0 overflow-hidden">
            <motion.div style={{ opacity: imgOpacity, scale: imgScale }} className="w-full h-full">
              <img src={imgSrc} alt={current.title} className="w-full h-full object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-t ${isHook ? 'from-ink to-transparent' : 'from-ink/60 to-transparent'}`} />
              <div className="absolute bottom-12 left-8 flex gap-2">
                {!isHook && <CourtBadge court={current.court} />}
                <span className={`px-2.5 py-1 backdrop-blur-sm border text-[10px] font-black uppercase tracking-widest rounded-full ${isHook ? 'bg-gold/20 border-gold/30 text-gold' : 'bg-white/15 border-white/20 text-white'}`}>{current.category}</span>
              </div>
            </motion.div>
          </div>

          <div className={`relative rounded-t-[2.5rem] -mt-10 px-8 pb-32 sm:px-10 z-20 pt-10 transition-colors duration-500 ${isHook ? 'bg-ink' : 'bg-parchment'}`}>
            <div className={`flex items-center gap-3 text-[10px] font-ui font-bold uppercase tracking-[0.18em] mb-6 ${isHook ? 'text-gold/60' : 'text-gold'}`}>
              <Calendar className="w-3.5 h-3.5" /> {current.dateString}
            </div>
            <h2 className={`font-display text-2xl sm:text-3xl leading-tight mb-8 ${isHook ? 'text-gold' : 'text-ink'}`}>{current.title}</h2>
            <div className="prose prose-stone max-w-none">
              <p className={`font-body text-base sm:text-lg leading-relaxed ${isHook ? 'text-parchment/70' : 'text-ink/80'}`}>
                {current.summary}
              </p>
              {isHook && (
                <div className="mt-8">
                  <Link to={(current as MarketingHook).ctaLink} className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-ink rounded-2xl font-ui text-sm font-black uppercase tracking-widest hover:scale-105 transition-all">
                    {(current as MarketingHook).ctaText} <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`absolute bottom-0 left-0 right-0 p-6 sm:p-8 pt-16 z-30 flex items-center justify-between pointer-events-none bg-gradient-to-t ${isHook ? 'from-ink via-ink to-transparent' : 'from-parchment via-parchment to-parchment/0'}`}>
          <div className="flex items-center gap-3 pointer-events-auto">
            <button onClick={handlePrev} disabled={activeIdx === 0} className={`w-12 h-12 flex items-center justify-center border rounded-full disabled:opacity-20 transition-all shadow-sm ${isHook ? 'border-white/10 text-parchment hover:bg-white/10' : 'border-ink/10 text-ink hover:bg-ink hover:text-white'}`}>
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={handleNext} className={`h-12 px-8 flex items-center gap-2 rounded-full font-ui text-[11px] font-black uppercase tracking-widest transition-all shadow-xl ${isHook ? 'bg-gold text-ink hover:opacity-90' : 'bg-ink text-parchment hover:bg-burgundy'}`}>
              {isHook ? 'Continue Feed' : 'Next Update'} <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          {!isHook && (
             <button onClick={() => shareNewsStoryAction(current as any, setShareBusy)} disabled={shareBusy} className="w-12 h-12 pointer-events-auto flex items-center justify-center bg-white border border-ink/10 rounded-full text-ink hover:text-gold transition-all shadow-sm">
                {shareBusy ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Instagram className="w-5 h-5" />}
             </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Marketing Card Component ───────────────────────────────────────────────
function MarketingCard({ hook, onClick }: { hook: MarketingHook; onClick: () => void }) {
  const isGate = hook.type === 'gate';
  return (
    <motion.div
      layout
      onClick={onClick}
      className={`group cursor-pointer relative rounded-3xl overflow-hidden border transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] ${
        isGate 
          ? 'bg-burgundy border-white/10 text-parchment' 
          : 'bg-ink border-gold/20 text-parchment'
      } h-full flex flex-col p-6`}
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <img src={hook.image} alt="" className="w-full h-full object-cover grayscale" />
        <div className="absolute inset-0 bg-gradient-to-br from-ink via-transparent to-ink" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
            isGate ? 'bg-white/10 border-white/20 text-white' : 'bg-gold/10 border-gold/20 text-gold'
          }`}>
            {hook.category}
          </span>
          <span className="text-[9px] font-ui font-black text-white/30 uppercase tracking-widest">
            {hook.court}
          </span>
        </div>

        <h3 className="font-display text-xl sm:text-2xl leading-none mb-3 group-hover:text-gold transition-colors">
          {hook.title}
        </h3>
        
        <p className={`text-xs font-body mb-6 flex-1 ${isGate ? 'text-parchment/70' : 'text-parchment/50'}`}>
          {hook.summary}
        </p>

        <div className={`mt-auto inline-flex items-center gap-2 font-ui text-[10px] font-black uppercase tracking-widest ${
          isGate ? 'text-white' : 'text-gold'
        }`}>
          {hook.ctaText} <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
}

const FILTERS = ['All', 'Supreme Court', 'High Court', 'Tribunal', 'District Law', 'Landmark Cases', 'Law & Policy', 'Current Affairs'] as const;
type FilterType = typeof FILTERS[number];

const TIME_FILTERS = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7days' },
  { label: 'This Month', value: 'month' },
] as const;
type TimeFilterType = typeof TIME_FILTERS[number]['value'];

export default function LegalNewsFeed() {
  const [items, setItems]       = useState<NewsItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]         = useState<FilterType>('All');
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('all');
  const [viewerIdx, setViewerIdx]   = useState<number | null>(null);
  const [isTimeDrawerOpen, setIsTimeDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'playground_content'), where('contentType', '==', 'daily_news'));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as NewsItem[];
      data.sort((a: any, b: any) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      setItems(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const filteredNews = items.filter(i => {
    const categoryMatch = filter === 'All' || 
                        (filter === 'Supreme Court' && i.court === 'Supreme Court') ||
                        (filter === 'High Court' && i.court === 'High Court') ||
                        (filter === 'Tribunal' && i.court === 'Tribunal') ||
                        (filter === 'District Law' && (i.court === 'District Law' || i.category === 'District Court')) ||
                        (filter === 'Landmark Cases' && i.category === 'Landmark Judgment') ||
                        (filter === 'Law & Policy' && i.category === 'Law & Policy') ||
                        (filter === 'Current Affairs' && i.court === 'Current Affairs');

    if (!categoryMatch) return false;

    if (timeFilter === 'all') return true;
    const now = new Date();
    const createdDate = i.createdAt ? (i.createdAt as any).toDate() : new Date();
    const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);

    if (timeFilter === 'today') return diffDays < 1;
    if (timeFilter === '7days') return diffDays < 7;
    if (timeFilter === 'month') return diffDays < 30;

    return true;
  });

  const feed: FeedItem[] = [];
  const isGated = !authLoading && !currentUser;
  let newsCount = 0;
  let hookIdx = 0;

  for (let i = 0; i < filteredNews.length; i++) {
    if (isGated && newsCount >= 15) break;
    feed.push({ ...filteredNews[i], type: 'news' });
    newsCount++;
    if (newsCount % 3 === 0 && (i < filteredNews.length - 1)) {
      if (isGated && newsCount >= 15) break; 
      feed.push(MARKETING_HOOKS[hookIdx % MARKETING_HOOKS.length]);
      hookIdx++;
    }
  }
  if (isGated && newsCount >= 15) feed.push(SIGN_IN_GATE);

  return (
    <div className="min-h-screen bg-parchment pb-20">
      <Helmet><title>Legal News Feed — EduLaw</title></Helmet>
      
      <div className="bg-ink py-3 px-4 flex items-center justify-between border-b border-gold/10">
        <button onClick={() => navigate('/legal-playground')} className="flex items-center gap-2 text-parchment/50 hover:text-gold font-ui text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
        <div className="text-gold font-ui text-[10px] font-black uppercase tracking-widest">Discovery Feed</div>
      </div>

      <div className="bg-ink px-4 py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/20 via-transparent to-transparent" />
        </div>
        <div className="relative z-10">
          <h1 className="font-display text-4xl sm:text-6xl text-parchment mb-4 tracking-tight"><span className="text-gold">Daily</span> Legal News</h1>
          <p className="font-body text-parchment/40 text-xs sm:text-base max-w-lg mx-auto uppercase tracking-[0.2em] font-bold">Curated Intelligence for the modern law professional</p>
        </div>
      </div>

      <div className="sticky top-0 z-40 bg-parchment/95 backdrop-blur-md border-b border-ink/5 py-4">
        <div className="relative max-w-5xl mx-auto flex items-center">
          <div className="relative flex-1 min-w-0">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-parchment to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-parchment to-transparent z-10 pointer-events-none" />
            
            <div className="flex items-center gap-2 overflow-x-auto px-8 hide-scrollbar scroll-smooth">
              {FILTERS.map(f => (
                <button 
                  key={f} 
                  onClick={() => setFilter(f)} 
                  className={`relative shrink-0 px-5 py-2.5 rounded-full font-ui text-[11px] font-black uppercase tracking-widest transition-all ${
                    filter === f ? 'text-parchment' : 'text-ink/40 hover:text-ink'
                  }`}
                >
                  {filter === f && (
                    <motion.div
                      layoutId="activeFilter"
                      className="absolute inset-0 bg-ink rounded-full z-[-1]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {f}
                    <span className={`text-[9px] opacity-40 ${filter === f ? 'text-gold' : 'text-ink'}`}>
                      {items.filter(i => {
                         if (f === 'All') return true;
                         if (f === 'Supreme Court') return i.court === 'Supreme Court';
                         if (f === 'High Court') return i.court === 'High Court';
                         if (f === 'Tribunal') return i.court === 'Tribunal';
                         if (f === 'District Law') return i.court === 'District Law' || i.category === 'District Court';
                         if (f === 'Landmark Cases') return i.category === 'Landmark Judgment';
                         if (f === 'Law & Policy') return i.category === 'Law & Policy';
                         if (f === 'Current Affairs') return i.court === 'Current Affairs';
                         return false;
                      }).length}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pr-4 shrink-0">
            <button 
              onClick={() => setIsTimeDrawerOpen(true)}
              className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all ${
                timeFilter !== 'all' ? 'bg-ink text-gold border-gold' : 'bg-white text-ink/40 border-ink/5 hover:text-ink hover:border-ink/10'
              }`}
            >
              <HistoryIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <Drawer.Root open={isTimeDrawerOpen} onOpenChange={setIsTimeDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[100]" />
          <Drawer.Content className="bg-ink flex flex-col rounded-t-[2.5rem] h-auto max-h-[85vh] fixed bottom-0 left-0 right-0 z-[101] outline-none">
            <div className="p-8 pb-12 w-full max-w-xl mx-auto">
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
              
              <div className="mb-8">
                <span className="text-gold font-ui text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">Discovery Settings</span>
                <h2 className="text-2xl font-display text-parchment">Filter by Time Period</h2>
              </div>

              <div className="space-y-3">
                {TIME_FILTERS.map((tf) => (
                  <button
                    key={tf.value}
                    onClick={() => {
                      setTimeFilter(tf.value);
                      setIsTimeDrawerOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all border ${
                      timeFilter === tf.value 
                        ? 'bg-gold/10 border-gold text-gold' 
                        : 'bg-white/5 border-white/5 text-parchment/60 hover:bg-white/10'
                    }`}
                  >
                    <span className="font-ui text-sm font-bold uppercase tracking-widest">{tf.label}</span>
                    {timeFilter === tf.value && <div className="w-2 h-2 rounded-full bg-gold shadow-[0_0_10px_rgba(255,215,0,0.5)]" />}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setIsTimeDrawerOpen(false)}
                className="w-full mt-8 p-5 bg-white/5 text-parchment/40 font-ui text-[10px] font-black uppercase tracking-widest rounded-2xl hover:text-parchment transition-all"
              >
                Close Filters
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <div className="max-w-5xl mx-auto px-4 py-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-60 bg-white rounded-3xl animate-pulse" />)
        ) : feed.map((item, idx) => {
          const isMarketing = 'type' in item && (item.type === 'hook' || item.type === 'gate');
          
          if (isMarketing) {
            return (
              <MarketingCard 
                key={item.id} 
                hook={item as MarketingHook} 
                onClick={() => setViewerIdx(idx)} 
              />
            );
          }

          const newsItem = item as NewsItem;
          return (
            <motion.div
              key={newsItem.id}
              layout
              onClick={() => setViewerIdx(idx)}
              className="group cursor-pointer bg-white rounded-3xl border border-ink/8 p-5 hover:border-gold/30 hover:shadow-xl transition-all h-full flex flex-col"
            >
              <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-4 bg-parchment relative shrink-0">
                <img 
                  src={getNewsImage(newsItem.title, newsItem.category, newsItem.id)} 
                  alt={newsItem.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <CourtBadge court={newsItem.court} />
                <span className="text-[10px] font-bold text-ink/30 uppercase tracking-widest">{newsItem.category}</span>
              </div>
              <h3 className="font-display text-lg text-ink line-clamp-2 leading-snug group-hover:text-gold transition-colors flex-1">
                {newsItem.title}
              </h3>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {viewerIdx !== null && (
          <NewsCardViewer news={feed} activeIdx={viewerIdx} setActiveIdx={setViewerIdx} onClose={() => setViewerIdx(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
