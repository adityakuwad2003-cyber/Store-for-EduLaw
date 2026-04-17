import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Newspaper, Save, RefreshCw,
  Scale, Gavel, ChevronDown, ChevronUp, X, Database, Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  collection, query, where,
  getDocs, doc, updateDoc, serverTimestamp, addDoc,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { SAMPLE_NEWS } from '@/data/sampleNews';

// ─── Types ────────────────────────────────────────────────────────────────────
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

const COURTS = ['Supreme Court', 'High Court', 'Tribunal', 'Current Affairs'];
const CATEGORIES = [
  'Constitutional Law', 'Criminal Law', 'Commercial Law', 'Property Law',
  'Environmental Law', 'Labour Law', 'Family Law', 'Tax Law', 'Election Law',
  'Corporate Law', 'Current Affairs', 'General',
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function PlaygroundNewsManager() {
  const [items, setItems]           = useState<NewsItem[]>([]);
  const [loading, setLoading]       = useState(false);
  const [syncing, setSyncing]       = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editing, setEditing]       = useState<Partial<NewsItem> | null>(null);
  const [saving, setSaving]         = useState(false);

  // ── Archive filters ───────────────────────────────────────────────────────
  const [dateFilter, setDateFilter]         = useState<string>('');   // '' = all dates
  const [courtFilter, setCourtFilter]       = useState<string>('');   // '' = all courts
  const [categoryFilter, setCategoryFilter] = useState<string>('');   // '' = all categories
  const [showFilters, setShowFilters]       = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'playground_content'),
        where('contentType', '==', 'daily_news'),
      );
      const snap = await getDocs(q);
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() })) as NewsItem[];
      // Sort descending by createdAt
      all.sort((a, b) => {
        const ta = (a as any).createdAt?.toMillis?.() ?? 0;
        const tb = (b as any).createdAt?.toMillis?.() ?? 0;
        return tb - ta;
      });
      setItems(all);
      // Default to most recent date on first load
      if (all.length > 0 && !dateFilter) {
        const latest = all.reduce((a, b) => (a.dateString > b.dateString ? a : b)).dateString;
        setDateFilter(latest);
      }
    } catch (err: any) {
      console.error('[PlaygroundNewsManager] fetchItems error:', err);
      toast.error(`Failed to load news items: ${err?.message ?? err}`);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const availableDates = useMemo(
    () => [...new Set(items.map(i => i.dateString))].sort((a, b) => b.localeCompare(a)),
    [items],
  );

  const displayed = useMemo(() => items.filter(i => {
    if (dateFilter     && i.dateString !== dateFilter)     return false;
    if (courtFilter    && i.court      !== courtFilter)    return false;
    if (categoryFilter && i.category   !== categoryFilter) return false;
    return true;
  }), [items, dateFilter, courtFilter, categoryFilter]);

  const archiveStats = useMemo(() => ({
    total: items.length,
    sc:    items.filter(i => i.court === 'Supreme Court').length,
    hc:    items.filter(i => i.court === 'High Court').length,
    tr:    items.filter(i => i.court === 'Tribunal').length,
    ca:    items.filter(i => i.court === 'Current Affairs').length,
    days:  availableDates.length,
  }), [items, availableDates]);

  const activeFilters = [dateFilter, courtFilter, categoryFilter].filter(Boolean).length;

  // ── Trigger cron sync ─────────────────────────────────────────────────────
  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/cron/playground-sync');
      const data = await res.json();
      if (data.newsError) {
        toast.error(`Sync error: ${data.newsError}`);
      } else {
        const bd = data.legalNewsBreakdown;
        const detail = bd
          ? `SC:${bd.sc ?? 0} HC:${bd.hc ?? 0} Trib:${bd.tr ?? 0} CA:${bd.ca ?? 0}`
          : '';
        toast.success(`Synced ${data.legalNews ?? 0} items${detail ? ' — ' + detail : ''}`);
        await fetchItems();
      }
    } catch {
      toast.error('Sync request failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleSeed = async () => {
    if (!window.confirm(`Are you sure you want to seed ${SAMPLE_NEWS.length} high-quality news samples into Firestore?`)) return;
    setSyncing(true);
    try {
      const collectionRef = collection(db, 'playground_content');
      const today = new Date().toISOString().split('T')[0];
      let seededCount = 0;
      for (const item of SAMPLE_NEWS) {
        await addDoc(collectionRef, {
          ...item,
          source: 'EduLaw Digest',
          publishedAt: new Date().toISOString(),
          dateString: today,
          contentType: 'daily_news',
          createdAt: serverTimestamp(),
        });
        seededCount++;
      }
      toast.success(`Success! Seeded ${seededCount} legal news items.`);
      await fetchItems();
    } catch (error) {
      console.error('Seed error:', error);
      toast.error('Failed to seed samples');
    } finally {
      setSyncing(false);
    }
  };

  // ── Edit helpers ──────────────────────────────────────────────────────────
  const startEdit = (item: NewsItem) => {
    setEditing({ ...item });
    setExpandedId(item.id);
  };

  const cancelEdit = () => setEditing(null);

  const handleSave = async () => {
    if (!editing?.id) return;
    setSaving(true);
    try {
      const ref = doc(db, 'playground_content', editing.id);
      await updateDoc(ref, {
        title:     editing.title    ?? '',
        court:     editing.court    ?? 'Supreme Court',
        summary:   editing.summary  ?? '',
        category:  editing.category ?? 'General',
        updatedAt: serverTimestamp(),
      });
      setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...editing } as NewsItem : i));
      setEditing(null);
      toast.success('News item updated');
    } catch {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-display text-slate-900">Live Legal News Archive</h1>
            <p className="text-xs text-slate-400 font-ui">
              {archiveStats.total} articles across {archiveStats.days} day(s) — articles are never deleted
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSeed}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-ui font-semibold hover:bg-emerald-100 disabled:opacity-60 transition-colors"
          >
            <Database className="w-4 h-4" />
            Seed Samples
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-burgundy text-white rounded-xl text-sm font-ui font-semibold hover:bg-burgundy/90 disabled:opacity-60 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing…' : 'Sync Now'}
          </button>
        </div>
      </div>

      {/* Archive stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {([
          { label: 'Total',          value: archiveStats.total, colour: 'text-slate-900'  },
          { label: 'Supreme Court',  value: archiveStats.sc,    colour: 'text-burgundy'   },
          { label: 'High Courts',    value: archiveStats.hc,    colour: 'text-teal-600'   },
          { label: 'Tribunals',      value: archiveStats.tr,    colour: 'text-purple-600' },
          { label: 'Current Affairs',value: archiveStats.ca,    colour: 'text-blue-600'   },
        ]).map(ct => (
          <div key={ct.label} className="bg-white border border-slate-100 rounded-xl p-4 text-center">
            <p className={`text-2xl font-display ${ct.colour}`}>{ct.value}</p>
            <p className="text-xs font-ui text-slate-400 mt-0.5">{ct.label}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-ui font-semibold text-slate-700">Archive Filters</span>
            {activeFilters > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-burgundy text-white text-[10px] font-black">
                {activeFilters} active
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {activeFilters > 0 && (
              <button
                onClick={() => { setDateFilter(''); setCourtFilter(''); setCategoryFilter(''); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-xs font-ui font-semibold hover:bg-slate-200 transition-colors"
              >
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
            <button
              onClick={() => setShowFilters(v => !v)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-xs font-ui font-semibold hover:bg-slate-200 transition-colors"
            >
              {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showFilters ? 'Hide' : 'Expand'}
            </button>
          </div>
        </div>

        {/* Date pills (always shown) */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setDateFilter('')}
            className={`px-3 py-1 rounded-lg text-xs font-ui font-bold transition-colors ${
              !dateFilter ? 'bg-burgundy text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            All Dates
          </button>
          {availableDates.slice(0, showFilters ? undefined : 7).map(d => (
            <button
              key={d}
              onClick={() => setDateFilter(d)}
              className={`px-3 py-1 rounded-lg text-xs font-ui font-bold transition-colors ${
                dateFilter === d
                  ? 'bg-burgundy text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {d}
            </button>
          ))}
          {!showFilters && availableDates.length > 7 && (
            <button
              onClick={() => setShowFilters(true)}
              className="px-3 py-1 rounded-lg text-xs font-ui font-bold text-slate-400 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              +{availableDates.length - 7} more
            </button>
          )}
        </div>

        {/* Court + Category selects (shown when expanded) */}
        {showFilters && (
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
            <div>
              <label className="block text-xs font-ui font-semibold text-slate-500 mb-1">Court / Forum</label>
              <select
                value={courtFilter}
                onChange={e => setCourtFilter(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-ui text-slate-700 focus:outline-none focus:border-burgundy"
              >
                <option value="">All Courts</option>
                {COURTS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-ui font-semibold text-slate-500 mb-1">Topic / Category</label>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-ui text-slate-700 focus:outline-none focus:border-burgundy"
              >
                <option value="">All Topics</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        )}

        <p className="text-xs font-ui text-slate-400">
          Showing <strong className="text-slate-700">{displayed.length}</strong> of {items.length} articles
        </p>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <RefreshCw className="w-6 h-6 text-slate-300 animate-spin" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <Newspaper className="w-8 h-8 text-slate-200 mx-auto" />
          <p className="text-sm font-ui text-slate-400">
            {items.length === 0
              ? 'No articles yet. Click "Sync Now" to scrape fresh news.'
              : 'No articles match the selected filters.'}
          </p>
          {activeFilters > 0 && (
            <button
              onClick={() => { setDateFilter(''); setCourtFilter(''); setCategoryFilter(''); }}
              className="text-xs font-ui font-bold text-burgundy hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(item => {
            const isExpanded = expandedId === item.id;
            const isEditing  = editing?.id === item.id;
            const isSC = item.court === 'Supreme Court';

            return (
              <div key={item.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                {/* Summary row */}
                <div
                  className="flex items-start gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => { setExpandedId(isExpanded ? null : item.id); if (isEditing) setEditing(null); }}
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${isSC ? 'bg-burgundy/10' : 'bg-teal-50'}`}>
                    {item.court === 'Supreme Court' ? (
                      <Scale className="w-4 h-4 text-burgundy" />
                    ) : item.court === 'High Court' ? (
                      <Gavel className="w-4 h-4 text-teal-600" />
                    ) : item.court === 'Tribunal' ? (
                      <span className="text-[10px] font-black text-purple-600">T</span>
                    ) : (
                      <span className="text-[10px] font-black text-blue-600">CA</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                        item.court === 'Supreme Court'   ? 'bg-burgundy/10 text-burgundy'
                        : item.court === 'High Court'    ? 'bg-teal-100 text-teal-700'
                        : item.court === 'Tribunal'      ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.court === 'Supreme Court' ? 'SC'
                          : item.court === 'High Court' ? 'HC'
                          : item.court === 'Tribunal'   ? 'TRIB'
                          : 'CA'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                      <span className="text-[10px] font-bold text-slate-300 bg-slate-50 px-2 py-0.5 rounded-md">
                        {item.dateString}
                      </span>
                    </div>
                    <p className="text-sm font-ui font-semibold text-slate-800 leading-snug line-clamp-2">{item.title}</p>
                  </div>
                  <div className="shrink-0 text-slate-300">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded: view or edit */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 space-y-4">
                    {isEditing ? (
                      /* ── Edit form ── */
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-ui font-semibold text-slate-500 mb-1">Title</label>
                          <input
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-ui text-slate-800 focus:outline-none focus:border-burgundy"
                            value={editing.title ?? ''}
                            onChange={e => setEditing(prev => ({ ...prev, title: e.target.value }))}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-ui font-semibold text-slate-500 mb-1">Court</label>
                            <select
                              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-ui text-slate-800 focus:outline-none focus:border-burgundy"
                              value={editing.court ?? 'Supreme Court'}
                              onChange={e => setEditing(prev => ({ ...prev, court: e.target.value }))}
                            >
                              {COURTS.map(c => <option key={c}>{c}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-ui font-semibold text-slate-500 mb-1">Category</label>
                            <select
                              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-ui text-slate-800 focus:outline-none focus:border-burgundy"
                              value={editing.category ?? 'General'}
                              onChange={e => setEditing(prev => ({ ...prev, category: e.target.value }))}
                            >
                              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-ui font-semibold text-slate-500 mb-1">Summary</label>
                          <textarea
                            rows={6}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-ui text-slate-800 focus:outline-none focus:border-burgundy resize-none"
                            value={editing.summary ?? ''}
                            onChange={e => setEditing(prev => ({ ...prev, summary: e.target.value }))}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-2 bg-burgundy text-white rounded-xl text-sm font-ui font-semibold hover:bg-burgundy/90 disabled:opacity-60 transition-colors"
                          >
                            <Save className="w-3.5 h-3.5" />
                            {saving ? 'Saving…' : 'Save changes'}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-ui font-semibold hover:bg-slate-200 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── View mode ── */
                      <div className="space-y-3">
                        <p className="text-sm font-body text-slate-700 leading-relaxed">{item.summary}</p>
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => startEdit(item)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-ui font-semibold hover:bg-slate-200 transition-colors"
                          >
                            Edit
                          </button>
                          <span className="ml-auto text-[10px] font-ui text-slate-400">{item.source} · {item.dateString}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
