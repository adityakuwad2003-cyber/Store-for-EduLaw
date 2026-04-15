import { useState, useEffect, useCallback } from 'react';
import {
  Newspaper, Trash2, Save, RefreshCw,
  Scale, Gavel, ChevronDown, ChevronUp, X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  collection, query, where,
  getDocs, doc, updateDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { ConfirmModal } from '../../../components/admin/ConfirmModal';

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

const COURTS = ['Supreme Court', 'High Court'];
const CATEGORIES = [
  'Constitutional Law', 'Criminal Law', 'Commercial Law', 'Property Law',
  'Environmental Law', 'Labour Law', 'Family Law', 'Tax Law', 'Election Law', 'General',
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function PlaygroundNewsManager() {
  const [items, setItems]         = useState<NewsItem[]>([]);
  const [loading, setLoading]     = useState(false);
  const [syncing, setSyncing]     = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editing, setEditing]     = useState<Partial<NewsItem> | null>(null);
  const [saving, setSaving]       = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NewsItem | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      // Simple where-only query (no composite index required);
      // sort client-side to avoid Firestore index errors.
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
      // Default to most recent date
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

  const availableDates = [...new Set(items.map(i => i.dateString))].sort((a, b) => b.localeCompare(a));
  const displayed = dateFilter ? items.filter(i => i.dateString === dateFilter) : items;

  // ── Trigger cron sync ─────────────────────────────────────────────────────
  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/cron/playground-sync');
      const data = await res.json();
      if (data.newsError) {
        toast.error(`Sync error: ${data.newsError}`);
      } else {
        toast.success(`Synced ${data.legalNews ?? 0} news items`);
        await fetchItems();
      }
    } catch {
      toast.error('Sync request failed');
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
        title:    editing.title    ?? '',
        court:    editing.court    ?? 'Supreme Court',
        summary:  editing.summary  ?? '',
        category: editing.category ?? 'General',
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

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDoc(doc(db, 'playground_content', deleteTarget.id));
      setItems(prev => prev.filter(i => i.id !== deleteTarget.id));
      toast.success('Item deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleteTarget(null);
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
            <h1 className="text-xl font-display text-slate-900">Live Legal News</h1>
            <p className="text-xs text-slate-400 font-ui">{items.length} items across {availableDates.length} day(s)</p>
          </div>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-burgundy text-white rounded-xl text-sm font-ui font-semibold hover:bg-burgundy/90 disabled:opacity-60 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing…' : 'Sync Now'}
        </button>
      </div>

      {/* Date filter */}
      {availableDates.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {availableDates.map(d => (
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
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {(['all', 'Supreme Court', 'High Court'] as const).map(ct => {
          const count = ct === 'all' ? displayed.length : displayed.filter(i => i.court === ct).length;
          return (
            <div key={ct} className="bg-white border border-slate-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-display text-slate-900">{count}</p>
              <p className="text-xs font-ui text-slate-400 mt-0.5">
                {ct === 'all' ? 'Total' : ct === 'Supreme Court' ? 'Supreme Court' : 'High Courts'}
              </p>
            </div>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <RefreshCw className="w-6 h-6 text-slate-300 animate-spin" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <Newspaper className="w-8 h-8 text-slate-200 mx-auto" />
          <p className="text-sm font-ui text-slate-400">No news items. Click "Sync Now" to scrape fresh news.</p>
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
                    {isSC ? <Scale className="w-4 h-4 text-burgundy" /> : <Gavel className="w-4 h-4 text-teal-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${isSC ? 'bg-burgundy/10 text-burgundy' : 'bg-teal-100 text-teal-700'}`}>
                        {isSC ? 'SC' : 'HC'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.category}
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
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 text-red-500 text-xs font-ui font-semibold hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                          <span className="ml-auto text-[10px] font-ui text-slate-400">{item.dateString}</span>
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

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete news item?"
        message={deleteTarget ? `"${deleteTarget.title}" will be permanently removed from the Live News panel.` : ''}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
