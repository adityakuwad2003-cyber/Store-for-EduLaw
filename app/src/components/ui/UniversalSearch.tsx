import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText, BookOpen, Globe, Loader2, ArrowRight } from 'lucide-react';
import { collection, getDocs, query as fsQuery, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ─── Fuzzy + Synonym helpers (shared logic) ──────────────────────────────────

const SYNONYMS: Record<string, string[]> = {
  criminal:    ['bns', 'bnss', 'crpc', 'ipc', 'penal', 'crime', 'offence'],
  evidence:    ['bsa', 'sakshya', 'proof', 'witness', 'testimony'],
  civil:       ['cpc', 'tort', 'property', 'procedure', 'code'],
  contract:    ['agreement', 'corporate', 'company', 'consideration'],
  constitution:['constitutional', 'fundamental rights', 'directive', 'preamble'],
  family:      ['hindu', 'muslim', 'matrimonial', 'personal law', 'divorce'],
  clat:        ['common law', 'entrance', 'pg', 'nlsiu'],
  judiciary:   ['judge', 'judicial', 'pcs-j', 'hjs'],
  tax:         ['gst', 'income tax', 'idt', 'indirect', 'direct tax'],
  adr:         ['arbitration', 'conciliation', 'mediation', 'dispute'],
};

function fuzzyScore(text: string, q: string): number {
  text = text.toLowerCase(); q = q.toLowerCase();
  if (text === q) return 2;
  if (text.startsWith(q)) return 1.8;
  if (text.includes(q)) return 1.5;
  let si = 0;
  for (let i = 0; i < text.length && si < q.length; i++) { if (text[i] === q[si]) si++; }
  const r = si / q.length;
  return r >= 0.75 ? r : 0;
}

function synonymScore(text: string, q: string): number {
  const lq = q.toLowerCase(), lt = text.toLowerCase();
  for (const [key, syns] of Object.entries(SYNONYMS)) {
    if ((lq.includes(key) || syns.some(s => lq.includes(s))) &&
        (lt.includes(key) || syns.some(s => lt.includes(s)))) return 0.75;
  }
  return 0;
}

function scoreResult(r: SearchResult, q: string): number {
  const combined = `${r.title} ${r.subtitle}`;
  return Math.max(fuzzyScore(r.title, q) * 1.5, fuzzyScore(combined, q), synonymScore(combined, q));
}

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  type: 'note' | 'article' | 'page' | 'glossary';
}

const STATIC_PAGES: SearchResult[] = [
  { id: 'market', title: 'Marketplace', subtitle: 'Browse all legal notes', href: '/marketplace', type: 'page' },
  { id: 'bundles', title: 'Bundles', subtitle: 'Save more with note bundles', href: '/bundles', type: 'page' },
  { id: 'sub', title: 'Subscription Plans', subtitle: 'Unlimited access plans', href: '/subscription', type: 'page' },
  { id: 'services', title: 'Legal Services', subtitle: 'Professional legal assistance', href: '/legal-services', type: 'page' },
  { id: 'tests', title: 'Mock Tests', subtitle: 'Practice judiciary exams', href: '/mock-tests', type: 'page' },
  { id: 'templates', title: 'Legal Templates', subtitle: 'Downloadable legal document templates', href: '/templates', type: 'page' },
  { id: 'hub', title: 'Legal Hub', subtitle: 'Blog, flashcards & glossary', href: '/legal-hub', type: 'page' },
  { id: 'referral', title: 'Refer & Earn', subtitle: 'Earn rewards by referring friends', href: '/referral', type: 'page' },
  { id: 'cart', title: 'My Cart', subtitle: 'View your shopping cart', href: '/cart', type: 'page' },
  { id: 'dashboard', title: 'My Library', subtitle: 'Access your purchased notes', href: '/dashboard', type: 'page' },
  { id: 'college', title: 'College Licensing', subtitle: 'Bulk licensing for law institutions', href: '/college-licensing', type: 'page' },
];

function typeIcon(type: SearchResult['type']) {
  const cls = 'w-4 h-4 shrink-0';
  switch (type) {
    case 'note': return <FileText className={`${cls} text-burgundy`} />;
    case 'article': return <BookOpen className={`${cls} text-blue-500`} />;
    case 'glossary': return <BookOpen className={`${cls} text-purple-500`} />;
    default: return <Globe className={`cls ${cls} text-gold`} />;
  }
}

function typeLabel(type: SearchResult['type']) {
  switch (type) {
    case 'note': return 'Note';
    case 'article': return 'Article';
    case 'glossary': return 'Glossary';
    default: return 'Page';
  }
}

const typeColor: Record<SearchResult['type'], string> = {
  note: 'bg-burgundy/10 text-burgundy',
  article: 'bg-blue-50 text-blue-600',
  glossary: 'bg-purple-50 text-purple-600',
  page: 'bg-gold/10 text-gold',
};

interface UniversalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UniversalSearch({ isOpen, onClose }: UniversalSearchProps) {
  const [query2, setQuery2] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [allNotes, setAllNotes] = useState<SearchResult[]>([]);
  const [allArticles, setAllArticles] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const fetchedRef = useRef(false);

  // Pre-fetch notes and articles once when first opened
  useEffect(() => {
    if (!isOpen || fetchedRef.current) return;
    fetchedRef.current = true;
    setIsLoading(true);

    const fetchData = async () => {
      try {
        // Fetch notes
        const notesSnap = await getDocs(fsQuery(collection(db, 'notes'), orderBy('title', 'asc'), limit(200)));
        const notes: SearchResult[] = notesSnap.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            title: d.title || 'Untitled Note',
            subtitle: `${d.category || 'Note'} · ₹${d.price || 0}`,
            href: `/product/${d.slug || doc.id}`,
            type: 'note' as const,
          };
        });
        setAllNotes(notes);

        // Fetch articles (optional — silently skips if collection doesn't exist)
        try {
          const artSnap = await getDocs(fsQuery(collection(db, 'blog_posts'), orderBy('createdAt', 'desc'), limit(100)));
          const articles: SearchResult[] = artSnap.docs.map(doc => {
            const d = doc.data();
            return {
              id: doc.id,
              title: d.title || 'Article',
              subtitle: d.category || 'Legal Blog',
              href: `/blog/${d.slug || doc.id}`,
              type: 'article' as const,
            };
          });
          setAllArticles(articles);
        } catch (_) { /* silently ignore if collection doesn't exist */ }
      } catch (e) {
        console.warn('Search pre-fetch failed:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery2('');
      setActiveIdx(0);
    }
  }, [isOpen]);

  // Search logic — fuzzy + synonym scoring
  const doSearch = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); return; }

    const score = (r: SearchResult) => scoreResult(r, q);
    const ranked = (arr: SearchResult[], cap: number) =>
      arr.map(r => ({ r, s: score(r) }))
         .filter(({ s }) => s > 0.3)
         .sort((a, b) => b.s - a.s)
         .slice(0, cap)
         .map(({ r }) => r);

    const noteMatches = ranked(allNotes, 6);
    const artMatches  = ranked(allArticles, 4);
    const pageMatches = ranked(STATIC_PAGES, 5);

    setResults([...noteMatches, ...artMatches, ...pageMatches]);
    setActiveIdx(0);
  }, [allNotes, allArticles]);

  useEffect(() => { doSearch(query2); }, [query2, doSearch]);

  const handleSelect = useCallback((result: SearchResult) => {
    navigate(result.href);
    onClose();
    setQuery2('');
  }, [navigate, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[activeIdx]) { handleSelect(results[activeIdx]); }
    if (e.key === 'Escape') { onClose(); }
  };

  const displayResults = query2.trim() ? results : STATIC_PAGES.slice(0, 8);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[8000]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed inset-x-3 top-[72px] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl z-[8001] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query2}
                onChange={e => setQuery2(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search notes, articles, pages..."
                className="flex-1 text-sm sm:text-base font-ui text-slate-900 placeholder:text-slate-400 bg-transparent outline-none"
                autoComplete="off"
              />
              {isLoading && <Loader2 className="w-4 h-4 text-slate-400 animate-spin shrink-0" />}
              {query2 && !isLoading && (
                <button onClick={() => setQuery2('')} className="text-slate-400 hover:text-slate-600 shrink-0" aria-label="Clear search">
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd
                onClick={onClose}
                className="hidden sm:flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-[10px] font-mono text-slate-500 cursor-pointer hover:bg-slate-200 transition-colors shrink-0"
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {displayResults.length === 0 && query2.trim() ? (
                <div className="py-10 text-center text-slate-400 font-ui text-sm">
                  No results for "<span className="font-semibold text-slate-600">{query2}</span>"
                </div>
              ) : (
                <div className="p-2">
                  {!query2.trim() && (
                    <p className="text-[10px] font-ui font-black uppercase tracking-widest text-slate-400 px-3 py-2">Quick Navigation</p>
                  )}
                  {displayResults.map((result, idx) => (
                    <button
                      key={result.id + idx}
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setActiveIdx(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                        idx === activeIdx ? 'bg-slate-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        {typeIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-ui font-semibold text-slate-900 text-sm truncate">{result.title}</p>
                        <p className="font-ui text-xs text-slate-400 truncate">{result.subtitle}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-ui font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${typeColor[result.type]}`}>
                          {typeLabel(result.type)}
                        </span>
                        {idx === activeIdx && <ArrowRight className="w-3.5 h-3.5 text-slate-400" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-ui">
                <span><kbd className="bg-white border border-slate-200 rounded px-1">↑↓</kbd> Navigate</span>
                <span><kbd className="bg-white border border-slate-200 rounded px-1">↵</kbd> Select</span>
                <span><kbd className="bg-white border border-slate-200 rounded px-1">ESC</kbd> Close</span>
              </div>
              <span className="text-[10px] text-slate-400 font-ui hidden sm:block">
                {displayResults.length} result{displayResults.length !== 1 ? 's' : ''}
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
