import { useState, useEffect, useRef, useCallback, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText, BookOpen, GraduationCap, Scale, ArrowRight, Loader2 } from 'lucide-react';
import { collection, getDocs, query as fsQuery, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

type ResultType = 'note' | 'blog' | 'page';
type FilterType = 'all' | 'notes' | 'blogs' | 'exam' | 'subject';

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  type: ResultType;
  category?: string;
  examTags?: string[];
  keywords?: string;
}

// ─── Synonyms & Exam Map ──────────────────────────────────────────────────────

const SYNONYMS: Record<string, string[]> = {
  criminal:    ['bns', 'bnss', 'crpc', 'ipc', 'penal', 'crime', 'offence'],
  evidence:    ['bsa', 'sakshya', 'proof', 'witness', 'testimony'],
  civil:       ['cpc', 'tort', 'property', 'procedure', 'code'],
  contract:    ['agreement', 'bargain', 'corporate', 'company', 'consideration'],
  constitution:['constitutional', 'fundamental rights', 'directive', 'preamble'],
  family:      ['hindu', 'muslim', 'matrimonial', 'personal law', 'divorce'],
  clat:        ['common law', 'entrance', 'pg', 'law school', 'nlsiu'],
  judiciary:   ['judge', 'judicial', 'pcs-j', 'hjs', 'district court'],
  llb:         ['bachelor of laws', 'degree', 'graduation', 'semester'],
  ca:          ['chartered accountant', 'audit', 'idt', 'gst', 'taxation'],
  tax:         ['gst', 'income tax', 'idt', 'indirect', 'direct tax'],
  adr:         ['arbitration', 'conciliation', 'mediation', 'dispute'],
  environment: ['pollution', 'ecology', 'forest', 'green', 'climate'],
  international:['treaty', 'convention', 'il', 'world', 'un', 'global'],
};

const EXAM_KEYWORDS: Record<string, string[]> = {
  'CLAT PG':     ['clat', 'pg', 'entrance', 'common law', 'nlsiu'],
  'Judiciary':   ['judiciary', 'judge', 'pcs-j', 'hjs', 'judicial service'],
  'LLB':         ['llb', 'bachelor', 'semester', 'graduation'],
  'LLM':         ['llm', 'master', 'postgraduate', 'advanced'],
  'CA Final':    ['ca', 'chartered accountant', 'audit', 'idt', 'tax'],
  'CS Exam':     ['cs', 'company secretary', 'corporate', 'icsi'],
};

const SUBJECT_KEYWORDS: Record<string, string[]> = {
  'Criminal Law':      ['bns', 'criminal', 'ipc', 'offence', 'punishment'],
  'Civil Procedure':   ['cpc', 'civil', 'procedure', 'suit', 'decree'],
  'Constitutional Law':['constitution', 'fundamental', 'article', 'rights'],
  'Corporate Law':     ['company', 'corporate', 'contract', 'ipr', 'sebi'],
  'Evidence':          ['evidence', 'bsa', 'witness', 'proof', 'document'],
  'Family Law':        ['family', 'hindu', 'muslim', 'matrimonial'],
  'Taxation':          ['tax', 'gst', 'income', 'idt', 'ca'],
  'International Law': ['international', 'treaty', 'convention', 'un'],
};

// ─── Utility Functions ────────────────────────────────────────────────────────

function fuzzyScore(text: string, q: string): number {
  text = text.toLowerCase();
  q = q.toLowerCase();
  if (text === q) return 2;
  if (text.startsWith(q)) return 1.8;
  if (text.includes(q)) return 1.5;
  // sequential char match
  let si = 0;
  for (let i = 0; i < text.length && si < q.length; i++) {
    if (text[i] === q[si]) si++;
  }
  const charScore = si / q.length;
  // Allow up to 1 char typo forgiveness when length >= 4
  if (charScore >= 0.85 && q.length >= 3) return 0.9 + charScore * 0.1;
  return charScore >= 0.7 ? charScore : 0;
}

function synonymScore(text: string, q: string): number {
  const lq = q.toLowerCase();
  const lt = text.toLowerCase();
  for (const [key, syns] of Object.entries(SYNONYMS)) {
    const qMatches = lq.includes(key) || syns.some(s => lq.includes(s));
    const tMatches = lt.includes(key) || syns.some(s => lt.includes(s));
    if (qMatches && tMatches) return 0.75;
  }
  return 0;
}

function scoreItem(item: SearchItem, q: string): number {
  const combined = `${item.title} ${item.subtitle} ${item.category || ''} ${item.examTags?.join(' ') || ''} ${item.keywords || ''}`;
  const titleScore = fuzzyScore(item.title, q) * 1.5;
  const bodyScore = fuzzyScore(combined, q);
  const synScore = synonymScore(combined, q);
  return Math.max(titleScore, bodyScore, synScore);
}

function filterByExam(item: SearchItem, exam: string): boolean {
  const kws = EXAM_KEYWORDS[exam] || [];
  const txt = `${item.title} ${item.subtitle} ${item.keywords || ''}`.toLowerCase();
  return kws.some(k => txt.includes(k));
}

function filterBySubject(item: SearchItem, subject: string): boolean {
  const kws = SUBJECT_KEYWORDS[subject] || [];
  const txt = `${item.title} ${item.subtitle} ${item.category || ''}`.toLowerCase();
  return kws.some(k => txt.includes(k)) || item.category === subject;
}

// ─── Filter config ────────────────────────────────────────────────────────────

const FILTER_TABS: { key: FilterType; label: string }[] = [
  { key: 'all',     label: 'All' },
  { key: 'notes',   label: 'Notes' },
  { key: 'blogs',   label: 'Blogs' },
  { key: 'exam',    label: 'Exam' },
  { key: 'subject', label: 'Subject' },
];

const EXAM_OPTIONS   = Object.keys(EXAM_KEYWORDS);
const SUBJECT_OPTIONS = Object.keys(SUBJECT_KEYWORDS);

const ICON_MAP: Record<ResultType, ReactElement> = {
  note: <FileText className="w-4 h-4 text-burgundy" />,
  blog: <BookOpen className="w-4 h-4 text-blue-500" />,
  page: <Scale className="w-4 h-4 text-gold" />,
};

const TYPE_COLOR: Record<ResultType, string> = {
  note: 'bg-burgundy/10 text-burgundy',
  blog: 'bg-blue-50 text-blue-600',
  page: 'bg-gold/10 text-gold-700',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function HeroSearch() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [subFilter, setSubFilter] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allItems, setAllItems] = useState<SearchItem[]>([]);
  const [results, setResults] = useState<SearchItem[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef(false);
  const navigate = useNavigate();

  // Pre-fetch all searchable data once
  const prefetch = useCallback(async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setIsLoading(true);
    try {
      const items: SearchItem[] = [];

      // Notes
      const notesSnap = await getDocs(fsQuery(collection(db, 'notes'), orderBy('title', 'asc'), limit(300)));
      notesSnap.docs.forEach(doc => {
        const d = doc.data();
        items.push({
          id: doc.id,
          title: d.title || 'Untitled Note',
          subtitle: `${d.category || 'Note'} · ₹${d.price ?? 0}`,
          href: `/product/${d.slug || doc.id}`,
          type: 'note',
          category: d.category,
          keywords: [d.subjectCode, d.description, ...(d.tableOfContents || [])].filter(Boolean).join(' '),
          examTags: [],
        });
      });

      // Blog posts
      try {
        const blogSnap = await getDocs(
          fsQuery(collection(db, 'blog_posts'), orderBy('createdAt', 'desc'), limit(100))
        );
        blogSnap.docs.forEach(doc => {
          const d = doc.data();
          items.push({
            id: doc.id,
            title: d.title || 'Blog Article',
            subtitle: d.category || 'Legal Insight',
            href: `/blog/${d.slug || doc.id}`,
            type: 'blog',
            category: d.category,
            keywords: d.excerpt || d.content?.slice(0, 200) || '',
          });
        });
      } catch (_) { /* no blog collection yet */ }

      setAllItems(items);
    } catch (e) {
      console.warn('HeroSearch prefetch error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    prefetch();
  }, [prefetch]);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Search logic
  useEffect(() => {
    const q = query.trim();
    if (!q && !subFilter) { setResults([]); return; }

    let pool = [...allItems];

    // Type filter
    if (filter === 'notes') pool = pool.filter(i => i.type === 'note');
    if (filter === 'blogs') pool = pool.filter(i => i.type === 'blog');
    if (filter === 'exam' && subFilter) pool = pool.filter(i => filterByExam(i, subFilter));
    if (filter === 'subject' && subFilter) pool = pool.filter(i => filterBySubject(i, subFilter));

    if (!q) {
      setResults(pool.slice(0, 8));
      setActiveIdx(0);
      return;
    }

    const scored = pool
      .map(item => ({ item, score: scoreItem(item, q) }))
      .filter(({ score }) => score > 0.3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ item }) => item);

    setResults(scored);
    setActiveIdx(0);
  }, [query, filter, subFilter, allItems]);

  const handleSelect = (item: SearchItem) => {
    navigate(item.href);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[activeIdx]) handleSelect(results[activeIdx]);
    if (e.key === 'Escape') { setIsOpen(false); inputRef.current?.blur(); }
  };

  const handleFilterChange = (f: FilterType) => {
    setFilter(f);
    setSubFilter('');
    inputRef.current?.focus();
  };

  const showDropdown = isOpen && (results.length > 0 || isLoading || query.trim().length > 0);

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div
        className={`relative flex items-center gap-3 bg-white rounded-2xl border-2 transition-all duration-200 shadow-lg ${
          isOpen ? 'border-burgundy ring-4 ring-burgundy/10' : 'border-parchment-dark hover:border-gold/50'
        }`}
      >
        <Search className="absolute left-5 w-5 h-5 text-mutedgray pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search notes, blogs, exams, subjects..."
          autoComplete="off"
          className="w-full pl-14 pr-12 py-4 bg-transparent text-ink placeholder:text-mutedgray font-ui text-base focus:outline-none"
        />
        {isLoading && <Loader2 className="absolute right-14 w-4 h-4 text-mutedgray animate-spin" />}
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
            className="absolute right-4 p-2 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Clear"
          >
            <X className="w-4 h-4 text-slate-300 hover:text-slate-600" />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => handleFilterChange(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-ui font-bold uppercase tracking-wider transition-all ${
              filter === tab.key
                ? 'bg-burgundy text-parchment shadow-md'
                : 'bg-white/70 text-ink border border-parchment-dark hover:border-burgundy/40 hover:text-burgundy'
            }`}
          >
            {tab.label}
          </button>
        ))}

        {/* Sub-filter options */}
        {filter === 'exam' && (
          <div className="flex items-center gap-1.5 flex-wrap ml-1">
            {EXAM_OPTIONS.map(exam => (
              <button
                key={exam}
                onClick={() => { setSubFilter(prev => prev === exam ? '' : exam); setIsOpen(true); }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-ui font-bold uppercase tracking-wide transition-all border ${
                  subFilter === exam
                    ? 'bg-gold text-ink border-gold'
                    : 'bg-white text-mutedgray border-parchment-dark hover:border-gold'
                }`}
              >
                <GraduationCap className="w-3 h-3" />
                {exam}
              </button>
            ))}
          </div>
        )}

        {filter === 'subject' && (
          <div className="flex items-center gap-1.5 flex-wrap ml-1">
            {SUBJECT_OPTIONS.map(subj => (
              <button
                key={subj}
                onClick={() => { setSubFilter(prev => prev === subj ? '' : subj); setIsOpen(true); }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-ui font-bold uppercase tracking-wide transition-all border ${
                  subFilter === subj
                    ? 'bg-gold text-ink border-gold'
                    : 'bg-white text-mutedgray border-parchment-dark hover:border-gold'
                }`}
              >
                <Scale className="w-3 h-3" />
                {subj}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[60]"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-8 gap-2 text-mutedgray font-ui text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading results…
              </div>
            ) : results.length === 0 && query.trim() ? (
              <div className="py-8 text-center text-mutedgray font-ui text-sm">
                No results for "<span className="font-semibold text-ink">{query}</span>"
                <p className="text-xs mt-1 opacity-70">Try different keywords or check spelling</p>
              </div>
            ) : (
              <ul>
                {results.map((item, idx) => (
                  <li key={item.id + idx}>
                    <button
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setActiveIdx(idx)}
                      className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-all border-b border-slate-50 last:border-0 ${
                        idx === activeIdx ? 'bg-slate-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        {ICON_MAP[item.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-ui font-bold text-ink text-sm truncate">{item.title}</p>
                        <p className="font-ui text-xs text-mutedgray truncate">{item.subtitle}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-ui font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${TYPE_COLOR[item.type]}`}>
                          {item.type}
                        </span>
                        {idx === activeIdx && <ArrowRight className="w-3.5 h-3.5 text-slate-400" />}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Footer */}
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-ui">
                <span><kbd className="bg-white border border-slate-200 rounded px-1">↑↓</kbd> Navigate</span>
                <span><kbd className="bg-white border border-slate-200 rounded px-1">↵</kbd> Open</span>
                <span><kbd className="bg-white border border-slate-200 rounded px-1">ESC</kbd> Close</span>
              </div>
              {results.length > 0 && (
                <span className="text-[10px] text-slate-400 font-ui">{results.length} result{results.length !== 1 ? 's' : ''}</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
