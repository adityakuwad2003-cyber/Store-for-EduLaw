import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Brain, BookOpen, Newspaper,
  ChevronRight, ChevronLeft, Calendar,
  ArrowRight, X, User,
  ChevronDown, ChevronUp, Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { SEO } from '@/components/SEO';
import { glossaryData } from '@/data/glossaryData';
import { ExpandableCard } from '@/components/ui/expandable-card';

// ─── Types ─────────────────────────────────────────────────────────────────
export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  category: string;
  author: string;
  tags: string[];
  status: 'published' | 'draft' | 'archived';
  views: number;
  seo?: {
    metaTitle: string;
    metaDesc: string;
    keywords: string;
  };
  createdAt: any;
  updatedAt?: any;
}

interface Flashcard     { id: string; front: string; back: string; hint?: string; image?: string; }
interface FlashcardDeck {
  id: string; title: string; subject: string; category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Expert';
  cards: Flashcard[]; status: string;
}

export interface LegalNews {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  date: string;
  source: string;
  category: string;
  readTime: string;
}

// ─── Style maps ────────────────────────────────────────────────────────────
const originStyle: Record<string, string> = {
  Latin:   'bg-gold/10 text-[#7a5c1e]',
  French:  'bg-blue-50 text-blue-700',
  English: 'bg-slate-100 text-slate-600',
  Other:   'bg-purple-50 text-purple-700',
};

const difficultyStyle: Record<string, string> = {
  Beginner:     'bg-green-100 text-green-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Expert:       'bg-red-100 text-red-700',
};

// ─── Fixed blog categories ──────────────────────────────────────────────────
const FIXED_BLOG_CATEGORIES = [
  'Landmark Judgements',
  'AI & Tech Developments',
  'Criminal Law',
  'War & Geopolitics',
  'Legal Updates',
  'Case Studies',
  'News',
];

// ─── Helpers ───────────────────────────────────────────────────────────────
function slugifyCategory(cat: string) {
  return cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

// ─── Inshorts-style FlashCard viewer ───────────────────────────────────────
function InshortsViewer({ deck, onClose }: { deck: FlashcardDeck; onClose: () => void }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const currentCard = deck.cards[activeIdx];

  const handleNext = () => {
    if (isAnimating) return;
    if (activeIdx < deck.cards.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveIdx(prev => prev + 1);
        setIsFlipped(false);
        setIsAnimating(false);
      }, 300);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (isAnimating || activeIdx === 0) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActiveIdx(prev => prev - 1);
      setIsFlipped(false);
      setIsAnimating(false);
    }, 300);
  };

  const handleFlip = () => setIsFlipped(!isFlipped);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); handleFlip(); }
      if (e.code === 'ArrowRight' || e.code === 'Enter') handleNext();
      if (e.code === 'ArrowLeft') handlePrev();
      if (e.code === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIdx, isFlipped, isAnimating]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/60 backdrop-blur-md p-2 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-lg bg-parchment rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
        style={{ height: 'min(90vh, 720px)' }}
      >
        {/* Progress Bar (Segmented) */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex gap-1 px-1 pt-1 z-20">
          {deck.cards.map((_, i) => (
            <div 
              key={i} 
              className={`h-full rounded-full transition-all duration-500 ${
                i < activeIdx ? 'bg-gold w-full' : 
                i === activeIdx ? 'bg-gold w-full' : 'bg-ink/10 w-full'
              }`} 
            />
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-8 pb-4">
          <div>
            <span className="text-[10px] font-ui text-gold uppercase font-black tracking-[0.2em] mb-1 block">
              {deck.subject}
            </span>
            <h3 className="font-display text-xl text-ink leading-tight">{deck.title}</h3>
          </div>
          <button
            onClick={onClose}
            title="Close news viewer"
            aria-label="Close news viewer"
            className="p-4 bg-ink/5 hover:bg-ink/10 rounded-2xl text-ink/40 transition-all active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Card Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 relative perspective-1000">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ x: 100, opacity: 0, rotate: 5 }}
              animate={{ x: 0, opacity: 1, rotate: 0 }}
              exit={{ x: -100, opacity: 0, rotate: -5 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="w-full h-full max-h-[380px] relative cursor-pointer group"
              onClick={handleFlip}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 80 }}
                className="w-full h-full relative preserve-3d"
              >
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden bg-white border border-ink/5 rounded-[2rem] p-8 sm:p-10 flex flex-col items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.08)] group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] transition-shadow">
                  <div className="absolute top-6 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-gold/10 text-gold text-[9px] font-ui font-black uppercase tracking-widest rounded-full">Question</span>
                  </div>
                  <p className="font-display text-xl sm:text-2xl text-ink text-center leading-relaxed">
                    {currentCard.front}
                  </p>
                  <p className="absolute bottom-8 text-[10px] font-ui text-mutedgray flex items-center gap-2 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                    Tap to reveal answer
                  </p>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 backface-hidden bg-[#Fdfbf7] border-2 border-gold/20 rounded-[2rem] p-8 sm:p-10 flex flex-col rotate-y-180 shadow-inner overflow-y-auto hide-scrollbar">
                  <div className="shrink-0 flex justify-center mb-6">
                    <span className="px-3 py-1 bg-burgundy/10 text-burgundy text-[9px] font-ui font-black uppercase tracking-widest rounded-full">Context & Resolution</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="font-body text-base sm:text-lg text-ink/90 text-center leading-relaxed whitespace-pre-line">
                      {currentCard.back}
                    </p>
                  </div>
                  {currentCard.hint && (
                    <div className="mt-6 pt-4 border-t border-gold/10 shrink-0">
                      <p className="text-[10px] font-ui text-gold/60 text-center italic leading-relaxed">
                        Tip: {currentCard.hint}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Card Stack Effect (Visual decoration) */}
          {activeIdx < deck.cards.length - 1 && (
            <div className="absolute inset-x-10 bottom-4 h-full max-h-[380px] bg-white/50 border border-ink/5 rounded-[2rem] -z-10 translate-y-3 scale-[0.96] blur-[2px]" />
          )}
          {activeIdx < deck.cards.length - 2 && (
            <div className="absolute inset-x-14 bottom-4 h-full max-h-[380px] bg-white/30 border border-ink/5 rounded-[2rem] -z-20 translate-y-6 scale-[0.92] blur-[4px]" />
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-8 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              disabled={activeIdx === 0}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border border-ink/10 rounded-2xl text-ink font-ui text-xs font-bold hover:bg-ink hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-ink transition-all transition-colors active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-burgundy text-parchment rounded-2xl font-ui text-xs font-bold hover:bg-burgundy-light transition-colors shadow-lg shadow-burgundy/20 active:scale-95"
            >
              {activeIdx === deck.cards.length - 1 ? 'Finish Review' : <>Next Concept <ChevronRight className="w-4 h-4" /></>}
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-8 pt-2">
             <div className="text-[10px] font-ui font-black text-ink/30 uppercase tracking-[0.2em]">
               {activeIdx + 1} of {deck.cards.length} Mastery
             </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Placeholder decks shown when Firestore returns nothing ────────────────
const PLACEHOLDER_DECKS: FlashcardDeck[] = [
  {
    id: 'ph-1', title: 'Contract Law Essentials', subject: 'Contract Law',
    category: 'Civil Law', difficulty: 'Beginner', status: 'coming-soon',
    cards: [{ id: 'ph-c1', front: 'Coming Soon', back: 'This deck is being prepared.' }],
  },
  {
    id: 'ph-2', title: 'Constitutional Fundamentals', subject: 'Constitutional Law',
    category: 'Public Law', difficulty: 'Intermediate', status: 'coming-soon',
    cards: [{ id: 'ph-c1', front: 'Coming Soon', back: 'This deck is being prepared.' }],
  },
  {
    id: 'ph-3', title: 'Criminal Law Concepts', subject: 'Criminal Law',
    category: 'Criminal Law', difficulty: 'Intermediate', status: 'coming-soon',
    cards: [{ id: 'ph-c1', front: 'Coming Soon', back: 'This deck is being prepared.' }],
  },
  {
    id: 'ph-4', title: 'Corporate Law Mastery', subject: 'Companies Act',
    category: 'Corporate Law', difficulty: 'Expert', status: 'coming-soon',
    cards: [{ id: 'ph-c1', front: 'Coming Soon', back: 'This deck is being prepared.' }],
  },
];

const DAILY_NEWS: LegalNews[] = [
  {
    id: 'news-1',
    title: 'New Income-tax Act, 2025 Comes Into Force',
    summary: 'The milestone shift in India\'s direct tax history has started. The New Act focuses on "Ease of Compliance" and simplifying forms.',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80',
    date: 'Apr 04, 2026',
    source: 'Financial Express',
    category: 'Business & Tax',
    readTime: '4 min read'
  },
  {
    id: 'news-2',
    title: 'Jan Vishwas Bill 2026: 717 Offences Decriminalized',
    summary: 'Both Houses pass the landmark bill aimed at improving Ease of Doing Business by replacing minor criminal charges with penalties.',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80',
    date: 'Apr 04, 2026',
    source: 'Press Information Bureau',
    category: 'Indian Law',
    readTime: '3 min read'
  },
  {
    id: 'news-3',
    title: 'SC Takes Cognizance of AI-Generated "Fake Precedents"',
    summary: 'Supreme Court issues notices to the AG and Solicitor General regarding the systemic risks posed by synthetic legal precedents.',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80',
    date: 'Apr 04, 2026',
    source: 'LiveLaw',
    category: 'AI & Tech',
    readTime: '5 min read'
  },
  {
    id: 'news-4',
    title: 'Oil Prices Surge to $118 Amid West Asia Conflict',
    summary: 'Escalating regional conflict pushes crude prices to multi-year highs, impacting India\'s trade deficit and energy security.',
    imageUrl: 'https://images.unsplash.com/photo-1614728523512-c9066603a11a?auto=format&fit=crop&q=80',
    date: 'Apr 04, 2026',
    source: 'Reuters / India Today',
    category: 'War & Geopolitics',
    readTime: '6 min read'
  },
  {
    id: 'news-5',
    title: 'Rajasthan HC: Gender Self-Identity is Intrinsic Facet of Dignity',
    summary: 'Court reaffirms transgender rights and personal liberty, expunging remarks that suggested new amendments dilute guarantees.',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80',
    date: 'Apr 04, 2026',
    source: 'The Hindu',
    category: 'Landmark Judgments',
    readTime: '4 min read'
  },
  {
    id: 'news-6',
    title: 'SC Principles on Judicial Restraint in Contractual Bidding',
    summary: 'Court rules that judiciary should avoid interfering in tenders if bidding results are based on competitive merit scoring.',
    imageUrl: 'https://images.unsplash.com/photo-1450175804616-784f7ba7042b?auto=format&fit=crop&q=80',
    date: 'Apr 04, 2026',
    source: 'SCC Online',
    category: 'Business & Tax',
    readTime: '3 min read'
  },
  {
    id: 'news-7',
    title: 'India Navigates Energy Risks via Multi-Alignment Policy',
    summary: 'Safe passage of LPG tankers through Iranian waters showcases India\'s diplomatic success in balancing global ties.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80',
    date: 'Apr 04, 2026',
    source: 'Observer Research Foundation',
    category: 'War & Geopolitics',
    readTime: '5 min read'
  },
  {
    id: 'news-8',
    title: 'California CPPA Cybersecurity Audits Begin',
    summary: 'Mandatory annual audits for large tech firms set a global standard for corporate data governance and privacy.',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80',
    date: 'Apr 04, 2026',
    source: 'TechCrunch / Bar & Bench',
    category: 'AI & Tech',
    readTime: '4 min read'
  },
  {
    id: 'news-9',
    title: 'SC Upholds Income Criteria Reconsideration for OBCs',
    summary: 'Supreme Court directs authorities to review creamy layer status for candidates from PSUs and private organizations.',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80',
    date: 'Apr 04, 2026',
    source: 'Times of India',
    category: 'Indian Law',
    readTime: '4 min read'
  },
  {
    id: 'news-10',
    title: 'US National Policy Framework for AI Released',
    summary: 'Guidelines advocate for federal-led regulation over state laws to ensure AI development remains competitive.',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80',
    date: 'Apr 04, 2026',
    source: 'Wired / Global Times',
    category: 'AI & Tech',
    readTime: '5 min read'
  }
];

function DailyNewsViewer({ news, activeIdx, setActiveIdx, onClose }: { news: LegalNews[]; activeIdx: number; setActiveIdx: (i: number) => void; onClose: () => void }) {
  const currentItem = news[activeIdx];

  const handleNext = () => {
    if (activeIdx < news.length - 1) setActiveIdx(activeIdx + 1);
    else onClose();
  };
  const handlePrev = () => {
    if (activeIdx > 0) setActiveIdx(activeIdx - 1);
  };

  // Keep track of scroll for vertical snapping

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown' || e.code === 'Space') { e.preventDefault(); handleNext(); }
      if (e.code === 'ArrowUp') { e.preventDefault(); handlePrev(); }
      if (e.code === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIdx]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/80 backdrop-blur-xl p-4 sm:p-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-parchment rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)] flex flex-col sm:h-[80vh] h-[85vh]"
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 flex gap-1 px-4 pt-2 z-30">
          {news.map((_, i) => (
            <div key={i} className={`h-full rounded-full transition-all duration-500 ${i === activeIdx ? 'bg-gold w-full' : i < activeIdx ? 'bg-gold/40 w-full' : 'bg-white/20 w-full'}`} />
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 relative flex flex-col h-full overflow-hidden">
          {/* Image Section */}
          <div className="relative h-[45%] w-full">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentItem.id}
                src={currentItem.imageUrl}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-parchment via-transparent" />
            <div className="absolute top-8 left-8 right-8 flex items-start justify-between">
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-burgundy text-white text-[9px] font-ui font-black uppercase tracking-widest rounded-full shadow-lg">Breaking</span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[9px] font-ui font-black uppercase tracking-widest rounded-full">{currentItem.category}</span>
              </div>
              <button 
                onClick={onClose} 
                title="Close news viewer"
                aria-label="Close news viewer"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Text Section */}
          <div className="flex-1 bg-parchment p-8 sm:p-12 flex flex-col -mt-12 relative z-10 rounded-t-[2.5rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="flex flex-col h-full"
              >
                <div className="flex items-center gap-3 text-[10px] font-ui font-bold text-gold uppercase tracking-[0.2em] mb-4">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {currentItem.date}</span>
                  <span className="w-1 h-1 rounded-full bg-gold/30" />
                  <span>{currentItem.source}</span>
                </div>
                
                <h2 className="font-display text-2xl sm:text-3xl text-ink leading-tight mb-6">
                  {currentItem.title}
                </h2>
                
                <p className="font-body text-base text-ink/70 leading-relaxed overflow-y-auto pr-2 custom-scrollbar">
                  {currentItem.summary}
                </p>

                <div className="mt-auto pt-8 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handlePrev} 
                      disabled={activeIdx === 0} 
                      title="Previous news item"
                      aria-label="Previous news item"
                      className="w-12 h-12 flex items-center justify-center border border-ink/10 rounded-full text-ink disabled:opacity-20 hover:bg-ink hover:text-white transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleNext} 
                      title={activeIdx === news.length - 1 ? 'Close news' : 'Next news item'}
                      aria-label={activeIdx === news.length - 1 ? 'Close news' : 'Next news item'}
                      className="h-12 px-6 flex items-center justify-center bg-burgundy text-parchment rounded-full font-ui text-xs font-bold hover:bg-burgundy-light transition-colors shadow-lg shadow-burgundy/20"
                    >
                      {activeIdx === news.length - 1 ? 'Close Feed' : 'Next Story'}
                    </button>
                  </div>
                  <div className="text-[10px] font-ui font-black text-ink/30 uppercase tracking-widest">
                    {currentItem.readTime}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page Component ───────────────────────────────────────────────────
export default function LegalHub() {
  // Articles state
  const [articles, setArticles]               = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);

  // Flashcard decks state
  const [decks, setDecks]               = useState<FlashcardDeck[]>([]);
  const [decksLoading, setDecksLoading] = useState(true);
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);

  // Glossary state
  const [glossarySearch, setGlossarySearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('All');
  const [showAllTerms, setShowAllTerms]     = useState(false);

  // News state
  const [newsViewerIdx, setNewsViewerIdx] = useState<number | null>(null);

  // Load articles from Firestore
  useEffect(() => {
    async function loadArticles() {
      setArticlesLoading(true);
      try {
        const q = query(collection(db, 'blog_articles'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const fbData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Article[];
        setArticles(fbData.filter(a => a.status === 'published'));
      } catch (err) {
        console.error('Firestore articles error:', err);
      } finally {
        setArticlesLoading(false);
      }
    }
    loadArticles();
  }, []);

  // Load flashcard decks from Firestore
  useEffect(() => {
    async function loadDecks() {
      setDecksLoading(true);
      try {
        const q = query(collection(db, 'flashcard_decks'), orderBy('title'), limit(12));
        const snap = await getDocs(q);
        const fbDecks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FlashcardDeck[];
        setDecks(fbDecks.length > 0 ? fbDecks : PLACEHOLDER_DECKS);
      } catch (err) {
        console.error('Firestore flashcard_decks error:', err);
        setDecks(PLACEHOLDER_DECKS);
      } finally {
        setDecksLoading(false);
      }
    }
    loadDecks();
  }, []);

  // Build categorised articles map
  const articlesByCategory: Record<string, Article[]> = {};
  for (const article of articles) {
    const cat = FIXED_BLOG_CATEGORIES.includes(article.category)
      ? article.category
      : 'Other Insights';
    if (!articlesByCategory[cat]) articlesByCategory[cat] = [];
    articlesByCategory[cat].push(article);
  }
  const activeBlogCategories = [
    ...FIXED_BLOG_CATEGORIES.filter(c => (articlesByCategory[c]?.length ?? 0) > 0),
    ...(articlesByCategory['Other Insights']?.length ? ['Other Insights'] : []),
  ];

  // Glossary logic
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const filteredTerms = glossaryData.filter(t => {
    const matchesSearch =
      t.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      t.definition.toLowerCase().includes(glossarySearch.toLowerCase());
    const matchesLetter = selectedLetter === 'All' || t.term.startsWith(selectedLetter);
    return matchesSearch && matchesLetter;
  });
  const displayTerms = showAllTerms ? filteredTerms : filteredTerms.slice(0, 5);
  const hiddenCount  = filteredTerms.length - 5;

  // Section refs for smooth-scroll jump links
  const flashcardsRef = useRef<HTMLElement>(null);
  const blogsRef      = useRef<HTMLElement>(null);
  const glossaryRef   = useRef<HTMLElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-parchment pt-20">
      <SEO
        title="The Legal Hub — EduLaw"
        description="Daily legal insights, landmark judgments simplified, conceptual flashcards, and a comprehensive legal glossary for CA and CS students."
      />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      {/* ── NEWS RIBBON ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-ink/5 py-4 relative z-50">
        <div className="section-container px-4">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="px-3 py-1 bg-burgundy/10 text-burgundy rounded-full font-ui text-[9px] font-black uppercase tracking-widest shrink-0">
                Live Updates
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <motion.div
                  animate={{ x: [0, -1000] }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="flex gap-12 whitespace-nowrap"
                >
                  {DAILY_NEWS.map((n, i) => (
                    <button key={n.id} onClick={() => setNewsViewerIdx(i)} className="text-xs font-ui font-medium text-ink/60 hover:text-burgundy transition-colors">
                      <span className="text-gold mr-2 font-bold">●</span> {n.title}
                    </button>
                  ))}
                </motion.div>
              </div>
            </div>
            <button
              onClick={() => setNewsViewerIdx(0)}
              className="flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold rounded-xl font-ui text-[10px] font-black uppercase tracking-widest hover:bg-gold hover:text-ink transition-all shadow-sm shrink-0"
            >
              Read News <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <section className="relative py-12 sm:py-20 border-b border-ink/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gold/5 -skew-x-12 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-burgundy/5 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none" />

        <div className="section-container relative z-10 px-4">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-gold/20 text-[#7a5c1e] rounded-full font-ui text-[10px] font-black uppercase tracking-widest mb-6"
            >
              <Brain className="w-3 h-3" /> The Legal Hub
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl text-ink leading-[1.1] mb-6"
            >
              Refining Your <span className="text-burgundy italic">Legal Intuition.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-body text-base sm:text-lg text-ink/70 leading-relaxed mb-10 max-w-2xl"
            >
              A curated space for Indian law students. Whether it's the latest high court judgment or a tricky core concept, we simplify the complex.
            </motion.p>

            {/* Jump-to section links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2 sm:gap-4"
            >
              {[
                { label: 'Knowledge Cards', icon: Brain,     ref: flashcardsRef },
                { label: 'Legal Insights',  icon: Newspaper, ref: blogsRef },
                { label: 'Legal Lexicon',   icon: BookOpen,  ref: glossaryRef },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.ref)}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-ui text-sm font-bold bg-white/50 text-ink/60 hover:bg-white hover:text-ink border border-ink/5 transition-all"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 1 — FLASHCARDS
      ══════════════════════════════════════════════════════════════════ */}
      <section ref={flashcardsRef} id="flashcards" className="py-16 sm:py-20 border-b border-ink/10 scroll-mt-20">
        <div className="section-container px-4">
          {/* Heading */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-burgundy/10 text-burgundy rounded-full font-ui text-[10px] font-black uppercase tracking-widest mb-4">
              <Brain className="w-3 h-3" /> Knowledge Cards
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-ink">Knowledge Cards</h2>
            <p className="font-body text-ink/60 mt-2 text-sm sm:text-base">Bite-sized legal concepts to ace your exams</p>
          </div>

          {decksLoading ? (
            <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="shrink-0 w-56 h-44 bg-white/60 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Mobile: horizontal scroll */}
              <div className="sm:hidden flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                {decks.map((deck, idx) => (
                  <DeckCard key={deck.id} deck={deck} index={idx} onOpen={setSelectedDeck} />
                ))}
              </div>
              {/* Desktop: 2-row grid */}
              <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
                {decks.map((deck, idx) => (
                  <DeckCard key={deck.id} deck={deck} index={idx} onOpen={setSelectedDeck} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 2 — BLOGS
      ══════════════════════════════════════════════════════════════════ */}
      <section ref={blogsRef} id="blogs" className="py-16 sm:py-20 border-b border-ink/10 scroll-mt-20">
        <div className="section-container px-4">
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Left Sidebar: Categories */}
            <aside className="lg:col-span-3">
              <div className="sticky top-28 space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/20 text-[#7a5c1e] rounded-full font-ui text-[10px] font-black uppercase tracking-widest mb-4">
                    <Newspaper className="w-3 h-3" /> Area of Knowledge
                  </div>
                  <h2 className="font-display text-3xl text-ink">Legal Insights</h2>
                </div>

                <nav className="flex flex-col gap-1.5">
                  {activeBlogCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        document
                          .getElementById(`blog-cat-${slugifyCategory(cat)}`)
                          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="group flex items-center justify-between px-4 py-3 rounded-xl font-ui text-sm font-bold text-ink/60 hover:text-burgundy hover:bg-burgundy/5 transition-all text-left"
                    >
                      <span className="truncate">{cat}</span>
                      <span className="px-2 py-0.5 bg-ink/5 text-ink/40 group-hover:bg-burgundy/10 group-hover:text-burgundy rounded-full text-[10px] transition-colors">
                        {articlesByCategory[cat]?.length || 0}
                      </span>
                    </button>
                  ))}
                  {activeBlogCategories.length === 0 && !articlesLoading && (
                    <p className="text-xs text-mutedgray italic px-4">New highlights being published soon...</p>
                  )}
                </nav>
              </div>
            </aside>

            {/* Main Content: Article Cards grouped by category */}
            <div className="lg:col-span-9 space-y-20">
              {articlesLoading ? (
                <div className="space-y-12">
                  {[1, 2].map(i => (
                    <div key={i} className="animate-pulse space-y-4">
                      <div className="h-5 bg-white/60 rounded w-48" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2].map(j => (
                          <div key={j} className="w-full h-72 bg-white/40 rounded-2xl" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeBlogCategories.length === 0 ? (
                <div className="text-center py-24 text-mutedgray bg-white/30 rounded-3xl border border-dashed border-ink/10">
                  <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-ui text-sm">No articles published yet. Check back soon.</p>
                </div>
              ) : (
                <>
                  {activeBlogCategories.map(cat => (
                    <div
                      key={cat}
                      id={`blog-cat-${slugifyCategory(cat)}`}
                      className="scroll-mt-28"
                    >
                      <div className="flex items-center gap-4 mb-8">
                        <div className="h-px bg-gold/20 flex-1 hidden sm:block" />
                        <h3 className="font-display text-xl sm:text-2xl text-ink px-4 bg-parchment relative z-10">{cat}</h3>
                        <div className="h-px bg-gold/20 flex-1 hidden sm:block" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {(articlesByCategory[cat] ?? []).map((article) => (
                          <ArticleCard key={article.id} article={article} />
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 3 — GLOSSARY
      ══════════════════════════════════════════════════════════════════ */}
      <section ref={glossaryRef} id="glossary" className="py-16 sm:py-20 scroll-mt-20">
        <div className="section-container px-4">
          {/* Heading */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-burgundy/10 text-burgundy rounded-full font-ui text-[10px] font-black uppercase tracking-widest mb-4">
              <BookOpen className="w-3 h-3" /> Legal Lexicon
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-ink">Legal Lexicon</h2>
            <p className="font-body text-ink/60 mt-2 text-sm sm:text-base">Master the language of law</p>
          </div>

          {/* Search */}
          <div className="relative max-w-lg mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-mutedgray w-5 h-5" />
            <input
              type="text"
              placeholder="Search the legal dictionary..."
              value={glossarySearch}
              onChange={e => { setGlossarySearch(e.target.value); setShowAllTerms(false); }}
              className="w-full bg-white border border-ink/10 rounded-2xl pl-12 pr-6 py-4 font-ui text-sm focus:outline-none focus:border-gold shadow-sm transition-all"
            />
          </div>

          {/* A-Z Picker */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-10">
            <button
              onClick={() => { setSelectedLetter('All'); setShowAllTerms(false); }}
              className={`px-3 py-1.5 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl font-ui text-xs font-bold transition-all ${
                selectedLetter === 'All' ? 'bg-gold text-ink' : 'bg-white text-ink/40 hover:text-gold'
              }`}
            >
              All
            </button>
            {alphabet.map(l => (
              <button
                key={l}
                onClick={() => { setSelectedLetter(l); setShowAllTerms(false); }}
                className={`w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center rounded-xl font-ui text-xs font-bold transition-all ${
                  selectedLetter === l ? 'bg-gold text-ink' : 'bg-white text-ink/40 hover:text-gold'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Terms list */}
          {filteredTerms.length === 0 ? (
            <div className="text-center py-16 text-mutedgray">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-ui text-sm">No glossary terms found matching your filter.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 max-w-3xl">
                {displayTerms.map((t, idx) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="bg-white border border-ink/10 rounded-2xl px-6 py-5 hover:border-gold/30 hover:shadow-lg transition-all group"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-display text-lg text-ink group-hover:text-burgundy transition-colors">
                        {t.term}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${originStyle[t.origin] || originStyle.Other}`}>
                        {t.origin}
                      </span>
                      <span className="px-2 py-0.5 bg-ink/5 text-ink/50 rounded-md text-[10px] font-ui uppercase tracking-widest">
                        {t.category}
                      </span>
                    </div>
                    <p className="font-body text-sm text-ink/70 leading-relaxed line-clamp-3 mb-2">
                      {t.definition}
                    </p>
                    {t.usageExample && (
                      <p className="text-xs text-mutedgray italic border-t border-ink/5 pt-3 mt-3 line-clamp-2">
                        "{t.usageExample}"
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Show More / Less */}
              {filteredTerms.length > 5 && (
                <div className="mt-8 max-w-3xl">
                  <button
                    onClick={() => setShowAllTerms(v => !v)}
                    className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-parchment border-2 border-ink/10 rounded-xl font-ui font-bold text-sm text-ink hover:border-gold/50 hover:bg-white transition-all shadow-sm"
                  >
                    {showAllTerms ? (
                      <>Show less <ChevronUp className="w-4 h-4" /></>
                    ) : (
                      <>Show {hiddenCount} more {hiddenCount === 1 ? 'term' : 'terms'} <ChevronDown className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── FOOTER CTA ───────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-12 bg-ink text-parchment">
        <div className="section-container text-center px-4">
          <p className="font-display text-xl sm:text-2xl mb-2">Deepen Your Legal Knowledge</p>
          <p className="font-ui text-sm text-parchment/60 mb-6">
            Explore our full notes library, mock tests, and subscription plans.
          </p>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-gold text-ink rounded-xl font-ui font-black text-sm hover:bg-gold-light transition-all shadow-lg shadow-gold/20"
          >
            Browse Notes Library <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* InshortsViewer modal */}
      <AnimatePresence>
        {selectedDeck && (
          <InshortsViewer deck={selectedDeck} onClose={() => setSelectedDeck(null)} />
        )}
        {newsViewerIdx !== null && (
          <DailyNewsViewer
            news={DAILY_NEWS}
            activeIdx={newsViewerIdx}
            setActiveIdx={setNewsViewerIdx}
            onClose={() => setNewsViewerIdx(null)}
          />
        )}
      </AnimatePresence>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .perspective-1000 { perspective: 1000px; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}

// ─── Deck Card ─────────────────────────────────────────────────────────────
function DeckCard({
  deck,
  index,
  onOpen,
}: {
  deck: FlashcardDeck;
  index: number;
  onOpen: (deck: FlashcardDeck) => void;
}) {
  const isPlaceholder = deck.status === 'coming-soon';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      onClick={() => !isPlaceholder && onOpen(deck)}
      className={`group relative flex flex-col justify-between bg-white border border-ink/10 rounded-2xl p-5 transition-all
        ${isPlaceholder
          ? 'opacity-60 cursor-default'
          : 'cursor-pointer hover:border-gold/40 hover:shadow-xl hover:-translate-y-0.5'}
        sm:w-full w-56`}
    >
      {/* Difficulty badge */}
      <span
        className={`self-start px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest mb-3 ${
          difficultyStyle[deck.difficulty] ?? 'bg-slate-100 text-slate-500'
        }`}
      >
        {deck.difficulty}
      </span>

      <div className="flex-1 min-h-0">
        <h4 className="font-display text-base text-ink leading-snug line-clamp-2 group-hover:text-burgundy transition-colors mb-1">
          {deck.title}
        </h4>
        <p className="font-ui text-[11px] text-mutedgray uppercase tracking-widest">{deck.subject}</p>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-ink/5">
        <span className="flex items-center gap-1 text-[11px] font-ui text-ink/40">
          <Layers className="w-3.5 h-3.5" />
          {isPlaceholder ? '—' : `${deck.cards.length} cards`}
        </span>
        {isPlaceholder ? (
          <span className="text-[10px] font-ui text-amber-500 font-bold uppercase tracking-widest">
            Coming Soon
          </span>
        ) : (
          <ChevronRight className="w-4 h-4 text-ink/30 group-hover:text-burgundy transition-colors" />
        )}
      </div>
    </motion.div>
  );
}

// ─── Article Card ──────────────────────────────────────────────────────────
function ArticleCard({ article }: { article: Article }) {
  return (
    <ExpandableCard
      title={article.title}
      description={article.category}
      src={article.featuredImage || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800'}
      className="h-full"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4 text-xs font-ui font-bold text-gold uppercase tracking-widest pb-6 border-b border-gold/10">
          <span className="flex items-center gap-2"><Calendar size={14} /> {article.createdAt?.toDate ? format(article.createdAt.toDate(), 'MMM d, yyyy') : 'Recently'}</span>
          <span className="w-1 h-1 rounded-full bg-gold/30" />
          <span className="flex items-center gap-2"><User size={14} /> {article.author || 'EduLaw Editor'}</span>
        </div>
        
        <div 
          className="prose prose-slate max-w-none text-ink/80 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: article.content }} 
        />

        <div className="pt-10 flex justify-center">
            <Link 
              to={`/blog/${article.slug}`}
              className="px-8 py-3 bg-burgundy text-white rounded-xl font-ui font-black uppercase tracking-widest text-xs hover:bg-burgundy-light transition-all shadow-lg active:scale-95"
            >
              Open Full Reading Mode
            </Link>
        </div>
      </div>
    </ExpandableCard>
  );
}
