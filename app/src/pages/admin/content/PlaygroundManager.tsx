import { useState, useEffect, useCallback } from 'react';
import {
  Plus, X, Save, Trash2, RefreshCw,
  Scale, BookOpen, HelpCircle, FileText, Gavel,
  ChevronDown, ChevronUp, Search, Newspaper,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  collection, query,
  getDocs, doc, updateDoc, deleteDoc,
  addDoc, serverTimestamp, where,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';

// ─── Types ───────────────────────────────────────────────────────────────────

type PlaygroundType = 'caselaw' | 'maxim' | 'constitution' | 'quiz' | 'digest' | 'news';

interface BaseItem {
  id: string;
  type: PlaygroundType;
  createdAt?: any;
  updatedAt?: any;
}

interface CaseLawItem extends BaseItem {
  type: 'caselaw';
  name: string;
  citation: string;
  court: string;
  year: number;
  subject: string;
  ratio: string;
  significance: string;
}

interface MaximItem extends BaseItem {
  type: 'maxim';
  maxim: string;
  origin: string;
  meaning: string;
  usage: string;
  memoryHook: string;
}

interface ConstitutionItem extends BaseItem {
  type: 'constitution';
  article: string;
  title: string;
  part: string;
  plainLanguage: string;
  keyPoint: string;
  relatedCase: string;
}

interface QuizItem extends BaseItem {
  type: 'quiz';
  q: string;
  options: string[];
  correct: number;
  explanation: string;
  subject: string;
}

interface DigestItem extends BaseItem {
  type: 'digest';
  title: string;
  court: string;
  date: string;
  citation: string;
  facts: string;
  issue: string;
  held: string;
  impact: string;
  subject: string;
}

interface NewsItem extends BaseItem {
  type: 'news';
  title: string;
  court: string;
  summary: string;
  publishedAt: string;
  dateString: string;
  category: string;
}

type PlaygroundItem = CaseLawItem | MaximItem | ConstitutionItem | QuizItem | DigestItem | NewsItem;

// ─── Tab config ──────────────────────────────────────────────────────────────

const TABS: { type: PlaygroundType; label: string; icon: typeof Scale }[] = [
  { type: 'caselaw',      label: 'Case Laws',            icon: Scale    },
  { type: 'maxim',        label: 'Legal Maxims',         icon: BookOpen },
  { type: 'constitution', label: 'Constitution Articles', icon: FileText },
  { type: 'quiz',         label: 'Quiz Questions',       icon: HelpCircle },
  { type: 'digest',       label: 'Judgment Digests',     icon: Gavel   },
  { type: 'news',         label: 'Daily News',           icon: Newspaper },
];



const COURTS = ['Supreme Court of India', 'Delhi High Court', 'Bombay High Court', 'Allahabad High Court', 'Madras High Court', 'Calcutta High Court', 'Other'];
const ORIGINS = ['Latin', 'French', 'English', 'Other'];
const SUBJECTS = ['Constitutional Law', 'Criminal Law', 'Criminal Procedure', 'Civil Procedure', 'Contract Law', 'Family Law', 'Property Law', 'Labour Law', 'Administrative Law', 'Environmental Law', 'Intellectual Property', 'Commercial Law', 'Evidence Law', 'Service Law', 'Insurance Law', 'Fundamental Rights', 'Other'];
const CONSTITUTION_PARTS = ['Part I — The Union and its Territory', 'Part II — Citizenship', 'Part III — Fundamental Rights', 'Part IV — Directive Principles of State Policy', 'Part IVA — Fundamental Duties', 'Part V — The Union', 'Part VI — The States', 'Part XIV — Services Under the Union and the States', 'Part XVIII — Emergency Provisions', 'Part XX — Amendment of the Constitution', 'Part XII — Finance, Property, Contracts & Suits', 'Other'];

// ─── Default blank states ────────────────────────────────────────────────────

const BLANK: Record<PlaygroundType, Omit<PlaygroundItem, 'id' | 'type' | 'createdAt' | 'updatedAt'>> = {
  caselaw: { name: '', citation: '', court: 'Supreme Court of India', year: new Date().getFullYear(), subject: 'Constitutional Law', ratio: '', significance: '' },
  maxim:   { maxim: '', origin: 'Latin', meaning: '', usage: '', memoryHook: '' },
  constitution: { article: '', title: '', part: 'Part III — Fundamental Rights', plainLanguage: '', keyPoint: '', relatedCase: '' },
  quiz:    { q: '', options: ['', '', '', ''], correct: 0, explanation: '', subject: 'Constitutional Law' },
  digest:  { title: '', court: 'Supreme Court of India', date: '', citation: '', facts: '', issue: '', held: '', impact: '', subject: 'Constitutional Law' },
  news:    { title: '', court: 'Supreme Court of India', summary: '', publishedAt: new Date().toISOString(), dateString: new Date().toISOString().split('T')[0], category: 'General' },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function PlaygroundManager() {
  const [activeTab, setActiveTab] = useState<PlaygroundType>('caselaw');
  const [items, setItems] = useState<PlaygroundItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<PlaygroundItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const fetchItems = useCallback(async (type: PlaygroundType) => {
    setLoading(true);
    try {
      // Simple where-only query (no composite index required);
      // sort client-side to avoid Firestore index errors.
      const q = query(
        collection(db, 'playground_content'),
        where('type', '==', type),
      );
      const snap = await getDocs(q);
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() })) as PlaygroundItem[];
      // Sort descending by createdAt (Timestamp or null)
      data.sort((a, b) => {
        const ta = (a as any).createdAt?.toMillis?.() ?? 0;
        const tb = (b as any).createdAt?.toMillis?.() ?? 0;
        return tb - ta;
      });
      setItems(data);
    } catch (err: any) {
      console.error('[PlaygroundManager] fetchItems error:', err);
      toast.error(`Failed to load items: ${err?.message ?? err}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(activeTab);
    setIsFormOpen(false);
    setEditing(null);
    setExpandedId(null);
    setSearchQuery('');
    setCollapsedGroups(new Set());
  }, [activeTab, fetchItems]);

  // ── Search filter ──────────────────────────────────────────────────────────
  const filteredItems = (() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(item => {
      const haystack = (() => {
        switch (item.type) {
          case 'caselaw':      return `${item.name} ${item.citation} ${item.ratio} ${item.significance} ${item.subject}`;
          case 'maxim':        return `${item.maxim} ${item.meaning} ${item.usage}`;
          case 'constitution': return `${item.article} ${item.title} ${item.plainLanguage} ${item.keyPoint}`;
          case 'quiz':         return `${item.q} ${item.explanation} ${item.subject}`;
          case 'digest':       return `${item.title} ${item.facts} ${item.held} ${item.subject} ${item.court}`;
          case 'news':         return `${item.title} ${item.summary} ${item.category} ${item.court}`;
          default:             return '';
        }
      })();
      return haystack.toLowerCase().includes(q);
    });
  })();

  // ── Grouping by a type-specific field ─────────────────────────────────────
  const getGroupKey = (item: PlaygroundItem): string => {
    switch (item.type) {
      case 'caselaw':      return item.subject || 'Uncategorized';
      case 'maxim':        return item.origin  || 'Uncategorized';
      case 'constitution': return item.part    || 'Uncategorized';
      case 'quiz':         return item.subject || 'Uncategorized';
      case 'digest':       return item.court   || 'Uncategorized';
      case 'news':         return item.dateString || 'Uncategorized';
      default:             return 'Uncategorized';
    }
  };

  const groupedItems = (() => {
    const groups: Record<string, PlaygroundItem[]> = {};
    for (const item of filteredItems) {
      const key = getGroupKey(item);
      (groups[key] ||= []).push(item);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  })();

  const toggleGroup = (key: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const openNew = () => {
    setEditing({ type: activeTab, ...(BLANK[activeTab] as any) });
    setIsFormOpen(true);
  };

  const openEdit = (item: PlaygroundItem) => {
    setEditing({ ...item });
    setIsFormOpen(true);
  };

  const closeForm = () => { setIsFormOpen(false); setEditing(null); };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const { id, createdAt, ...data } = editing as any;
      if (id) {
        await updateDoc(doc(db, 'playground_content', id), { ...data, updatedAt: serverTimestamp() });
        toast.success('Item updated');
      } else {
        await addDoc(collection(db, 'playground_content'), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        toast.success('Item added');
      }
      closeForm();
      fetchItems(activeTab);
    } catch (err) {
      console.error(err);
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item permanently?')) return;
    try {
      await deleteDoc(doc(db, 'playground_content', id));
      toast.success('Deleted');
      setItems(prev => prev.filter(i => i.id !== id));
    } catch {
      toast.error('Delete failed');
    }
  };

  const set = (field: string, value: any) =>
    setEditing(prev => ({ ...prev, [field]: value }));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display text-slate-900">Playground Content</h1>
          <p className="text-sm text-slate-500 font-ui mt-1">Manage case laws, maxims, constitution articles, quizzes & digests shown in the Legal Playground.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              if(!confirm('Seed basic data?')) return;
              try {
                // Dynamically import pools
                const { CASE_LAW_POOL } = await import('../../../data/playground/caseLaws');
                const { MAXIM_POOL } = await import('../../../data/playground/maximsData');
                const { DIGEST_POOL } = await import('../../../data/playground/judgmentDigests');
                const { CONSTITUTION_POOL } = await import('../../../data/playground/constitutionData');
                const { QUIZ_POOL } = await import('../../../data/playground/quizData');
                
                const itemsToSeed: any[] = [];
                const add = (pool: any[], type: string) => pool.forEach(i => itemsToSeed.push({ ...i, type }));
                
                add(CASE_LAW_POOL, 'caselaw');
                add(MAXIM_POOL, 'maxim');
                add(DIGEST_POOL, 'digest');
                add(CONSTITUTION_POOL, 'constitution');
                add(QUIZ_POOL, 'quiz');
                
                const { getAuth } = await import('firebase/auth');
                const auth = getAuth();
                const token = await auth.currentUser?.getIdToken();
                if (!token) throw new Error("Not authenticated");

                const res = await fetch('/api/admin/seed-playground', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ items: itemsToSeed })
                });
                
                if (!res.ok) {
                  const err = await res.json();
                  throw new Error(err.error || 'Failed to seed data');
                }
                
                toast.success(`Seeded ${itemsToSeed.length} items. Refresh page!`);
              } catch (e: any) {
                toast.error(e.message);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-ui font-semibold text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Seed Core Items
          </button>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 bg-gold text-white rounded-xl font-ui font-semibold text-sm hover:bg-[#b8922a] transition-colors"
          >
            <Plus className="w-4 h-4" /> Add {TABS.find(t => t.type === activeTab)?.label.slice(0, -1)}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-4 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-ui font-medium whitespace-nowrap transition-all ${
                activeTab === tab.type
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={`Search ${TABS.find(t => t.type === activeTab)?.label.toLowerCase() || 'items'}…`}
          className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm font-ui text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Items list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-6 h-6 text-slate-300 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-slate-400 font-ui">
          <p className="text-lg mb-2">No items yet</p>
          <p className="text-sm">Click "Add" above to create your first entry.</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 text-slate-400 font-ui">
          <p className="text-lg mb-2">No items match your search</p>
          <p className="text-sm">Try a different keyword or clear the search.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedItems.map(([groupKey, groupItems]) => {
            const isCollapsed = collapsedGroups.has(groupKey);
            return (
              <div key={groupKey}>
                <button
                  onClick={() => toggleGroup(groupKey)}
                  className="sticky top-0 z-10 w-full bg-white/95 backdrop-blur-sm border-b border-slate-100 py-2 px-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2 font-ui font-semibold text-sm text-slate-700">
                    {isCollapsed ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
                    {groupKey}
                  </span>
                  <span className="text-xs font-ui text-slate-400">{groupItems.length}</span>
                </button>
                {!isCollapsed && (
                  <div className="space-y-3 mt-3">
                    {groupItems.map(item => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        expanded={expandedId === item.id}
                        onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        onEdit={() => openEdit(item)}
                        onDelete={() => handleDelete(item.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Form Drawer */}
      {isFormOpen && editing && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={closeForm} />
          <div className="relative ml-auto w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
              <h2 className="font-display text-lg text-slate-900">
                {(editing as any).id ? 'Edit' : 'New'} {TABS.find(t => t.type === activeTab)?.label.slice(0, -1)}
              </h2>
              <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 px-6 py-5 space-y-4">
              {activeTab === 'caselaw' && <CaseLawForm data={editing as CaseLawItem} set={set} />}
              {activeTab === 'maxim'   && <MaximForm    data={editing as MaximItem}   set={set} />}
              {activeTab === 'constitution' && <ConstitutionForm data={editing as ConstitutionItem} set={set} />}
              {activeTab === 'quiz'    && <QuizForm     data={editing as QuizItem}    set={set} />}
              {activeTab === 'digest'  && <DigestForm   data={editing as DigestItem}  set={set} />}
              {activeTab === 'news'    && <NewsForm     data={editing as NewsItem}    set={set} />}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={closeForm} className="px-4 py-2 rounded-xl text-sm font-ui text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-gold text-white rounded-xl text-sm font-ui font-semibold hover:bg-[#b8922a] transition-colors disabled:opacity-60"
              >
                <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Item Card ────────────────────────────────────────────────────────────────

function ItemCard({ item, expanded, onToggle, onEdit, onDelete }: {
  item: PlaygroundItem;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const label = getItemLabel(item);
  const sub = getItemSub(item);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-white">
        <button onClick={onToggle} className="flex-1 text-left">
          <p className="font-ui font-medium text-slate-900 text-sm leading-snug">{label}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </button>
        <button onClick={onToggle} className="p-1 text-slate-400 hover:text-slate-600">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <button onClick={onEdit} className="px-3 py-1.5 text-xs font-ui font-medium text-gold border border-gold/40 rounded-lg hover:bg-gold/5 transition-colors">Edit</button>
        <button onClick={onDelete} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
      </div>
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50 text-xs font-ui text-slate-600 space-y-1.5">
          <ItemDetail item={item} />
        </div>
      )}
    </div>
  );
}

function getItemLabel(item: PlaygroundItem): string {
  switch (item.type) {
    case 'caselaw':      return item.name;
    case 'maxim':        return item.maxim;
    case 'constitution': return `${item.article} — ${item.title}`;
    case 'quiz':         return item.q;
    case 'digest':       return item.title;
    case 'news':         return item.title;
  }
}

function getItemSub(item: PlaygroundItem): string {
  switch (item.type) {
    case 'caselaw':      return `${item.citation} · ${item.subject}`;
    case 'maxim':        return item.origin;
    case 'constitution': return item.part;
    case 'quiz':         return item.subject;
    case 'digest':       return `${item.court} · ${item.date}`;
    case 'news':         return `${item.court} · ${item.dateString}`;
  }
}

function ItemDetail({ item }: { item: PlaygroundItem }) {
  switch (item.type) {
    case 'caselaw':
      return (<>
        <p><span className="font-semibold text-slate-700">Ratio:</span> {item.ratio}</p>
        <p><span className="font-semibold text-slate-700">Significance:</span> {item.significance}</p>
      </>);
    case 'maxim':
      return (<>
        <p><span className="font-semibold text-slate-700">Meaning:</span> {item.meaning}</p>
        <p><span className="font-semibold text-slate-700">Usage:</span> {item.usage}</p>
        <p><span className="font-semibold text-slate-700">Memory Hook:</span> {item.memoryHook}</p>
      </>);
    case 'constitution':
      return (<>
        <p><span className="font-semibold text-slate-700">Plain Language:</span> {item.plainLanguage}</p>
        <p><span className="font-semibold text-slate-700">Key Point:</span> {item.keyPoint}</p>
        <p><span className="font-semibold text-slate-700">Related Case:</span> {item.relatedCase}</p>
      </>);
    case 'quiz':
      return (<>
        {item.options.map((o, i) => (
          <p key={i} className={i === item.correct ? 'text-emerald-700 font-semibold' : ''}>{String.fromCharCode(65+i)}. {o}{i === item.correct ? ' ✓' : ''}</p>
        ))}
        <p className="mt-1"><span className="font-semibold text-slate-700">Explanation:</span> {item.explanation}</p>
      </>);
    case 'digest':
      return (<>
        <p><span className="font-semibold text-slate-700">Facts:</span> {item.facts}</p>
        <p><span className="font-semibold text-slate-700">Issue:</span> {item.issue}</p>
        <p><span className="font-semibold text-slate-700">Held:</span> {item.held}</p>
        <p><span className="font-semibold text-slate-700">Impact:</span> {item.impact}</p>
      </>);
    case 'news':
      return (<>
        <p><span className="font-semibold text-slate-700">Court:</span> {item.court}</p>
        <p><span className="font-semibold text-slate-700">Category:</span> {item.category}</p>
        <p><span className="font-semibold text-slate-700">Summary:</span> {item.summary}</p>
        <p><span className="font-semibold text-slate-700">Date:</span> {item.dateString}</p>
      </>);
  }
}

// ─── Form helpers ─────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-ui font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-ui text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-colors';
const textareaCls = `${inputCls} resize-y min-h-[80px]`;

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <Field label={label}>
      <select value={value} onChange={e => onChange(e.target.value)} className={inputCls}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </Field>
  );
}

// ─── Type-specific forms ──────────────────────────────────────────────────────

function CaseLawForm({ data, set }: { data: Partial<CaseLawItem>; set: (f: string, v: any) => void }) {
  return (<>
    <Field label="Case Name"><input className={inputCls} value={data.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Kesavananda Bharati v. State of Kerala" /></Field>
    <div className="grid grid-cols-2 gap-4">
      <Field label="Citation"><input className={inputCls} value={data.citation || ''} onChange={e => set('citation', e.target.value)} placeholder="AIR 1973 SC 1461" /></Field>
      <Field label="Year"><input type="number" className={inputCls} value={data.year || ''} onChange={e => set('year', parseInt(e.target.value))} /></Field>
    </div>
    <SelectField label="Court" value={data.court || 'Supreme Court of India'} onChange={v => set('court', v)} options={COURTS} />
    <SelectField label="Subject" value={data.subject || 'Constitutional Law'} onChange={v => set('subject', v)} options={SUBJECTS} />
    <Field label="Ratio (Rule/Holding)"><textarea className={textareaCls} value={data.ratio || ''} onChange={e => set('ratio', e.target.value)} placeholder="What the court held — 1–2 sentences." /></Field>
    <Field label="Significance"><textarea className={textareaCls} value={data.significance || ''} onChange={e => set('significance', e.target.value)} placeholder="Why this case matters and its lasting impact." /></Field>
  </>);
}

function MaximForm({ data, set }: { data: Partial<MaximItem>; set: (f: string, v: any) => void }) {
  return (<>
    <Field label="Maxim (Latin/original phrase)"><input className={inputCls} value={data.maxim || ''} onChange={e => set('maxim', e.target.value)} placeholder="e.g. Audi alteram partem" /></Field>
    <SelectField label="Origin" value={data.origin || 'Latin'} onChange={v => set('origin', v)} options={ORIGINS} />
    <Field label="Meaning"><input className={inputCls} value={data.meaning || ''} onChange={e => set('meaning', e.target.value)} placeholder="Plain English translation" /></Field>
    <Field label="Usage in Law"><textarea className={textareaCls} value={data.usage || ''} onChange={e => set('usage', e.target.value)} placeholder="How and where this maxim is applied." /></Field>
    <Field label="Memory Hook"><textarea className={textareaCls} value={data.memoryHook || ''} onChange={e => set('memoryHook', e.target.value)} placeholder="A memorable analogy or example to remember this maxim." /></Field>
  </>);
}

function ConstitutionForm({ data, set }: { data: Partial<ConstitutionItem>; set: (f: string, v: any) => void }) {
  return (<>
    <div className="grid grid-cols-2 gap-4">
      <Field label="Article Number"><input className={inputCls} value={data.article || ''} onChange={e => set('article', e.target.value)} placeholder="e.g. Article 21" /></Field>
      <Field label="Title"><input className={inputCls} value={data.title || ''} onChange={e => set('title', e.target.value)} placeholder="e.g. Protection of Life and Personal Liberty" /></Field>
    </div>
    <SelectField label="Part of Constitution" value={data.part || 'Part III — Fundamental Rights'} onChange={v => set('part', v)} options={CONSTITUTION_PARTS} />
    <Field label="Plain Language Explanation"><textarea className={textareaCls} value={data.plainLanguage || ''} onChange={e => set('plainLanguage', e.target.value)} placeholder="Explain the article in simple, student-friendly language." /></Field>
    <Field label="Key Point"><textarea className={textareaCls} value={data.keyPoint || ''} onChange={e => set('keyPoint', e.target.value)} placeholder="The most important thing to remember about this article." /></Field>
    <Field label="Related Case"><input className={inputCls} value={data.relatedCase || ''} onChange={e => set('relatedCase', e.target.value)} placeholder="Case name (year) — one-line takeaway." /></Field>
  </>);
}

function QuizForm({ data, set }: { data: Partial<QuizItem>; set: (f: string, v: any) => void }) {
  const options = data.options ?? ['', '', '', ''];
  return (<>
    <SelectField label="Subject" value={data.subject || 'Constitutional Law'} onChange={v => set('subject', v)} options={SUBJECTS} />
    <Field label="Question"><textarea className={textareaCls} value={data.q || ''} onChange={e => set('q', e.target.value)} placeholder="Write the quiz question here." /></Field>
    <div className="space-y-2">
      <label className="block text-xs font-ui font-semibold text-slate-500 uppercase tracking-wide">Options (mark the correct one)</label>
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="radio"
            name="correct"
            checked={data.correct === i}
            onChange={() => set('correct', i)}
            className="accent-gold w-4 h-4 shrink-0"
          />
          <input
            className={inputCls}
            value={opt}
            onChange={e => {
              const next = [...options];
              next[i] = e.target.value;
              set('options', next);
            }}
            placeholder={`Option ${String.fromCharCode(65 + i)}`}
          />
        </div>
      ))}
    </div>
    <Field label="Explanation (shown after answer)"><textarea className={textareaCls} value={data.explanation || ''} onChange={e => set('explanation', e.target.value)} placeholder="Explain why the correct answer is correct." /></Field>
  </>);
}

function DigestForm({ data, set }: { data: Partial<DigestItem>; set: (f: string, v: any) => void }) {
  return (<>
    <Field label="Case Title / Headline"><input className={inputCls} value={data.title || ''} onChange={e => set('title', e.target.value)} placeholder="e.g. SC: Bail Conditions Must Not Be Onerous" /></Field>
    <div className="grid grid-cols-2 gap-4">
      <SelectField label="Court" value={data.court || 'Supreme Court of India'} onChange={v => set('court', v)} options={COURTS} />
      <Field label="Date (e.g. Apr 2026)"><input className={inputCls} value={data.date || ''} onChange={e => set('date', e.target.value)} placeholder="Apr 2026" /></Field>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <Field label="Citation"><input className={inputCls} value={data.citation || ''} onChange={e => set('citation', e.target.value)} placeholder="2026 SCC OnLine SC 312" /></Field>
      <SelectField label="Subject" value={data.subject || 'Constitutional Law'} onChange={v => set('subject', v)} options={SUBJECTS} />
    </div>
    <Field label="Facts"><textarea className={textareaCls} value={data.facts || ''} onChange={e => set('facts', e.target.value)} placeholder="Brief background facts of the case." /></Field>
    <Field label="Issue"><input className={inputCls} value={data.issue || ''} onChange={e => set('issue', e.target.value)} placeholder="The key legal question the court decided." /></Field>
    <Field label="Held (Court's Decision)"><textarea className={textareaCls} value={data.held || ''} onChange={e => set('held', e.target.value)} placeholder="What the court decided and why." /></Field>
    <Field label="Impact / Significance"><textarea className={textareaCls} value={data.impact || ''} onChange={e => set('impact', e.target.value)} placeholder="Why this judgment matters for practitioners and students." /></Field>
  </>);
}

function NewsForm({ data, set }: { data: Partial<NewsItem>; set: (f: string, v: any) => void }) {
  return (<>
    <Field label="News Title"><input className={inputCls} value={data.title || ''} onChange={e => set('title', e.target.value)} placeholder="Breaking News title..." /></Field>
    <div className="grid grid-cols-2 gap-4">
      <SelectField label="Court" value={data.court || 'Supreme Court of India'} onChange={v => set('court', v)} options={COURTS} />
      <Field label="Category"><input className={inputCls} value={data.category || 'General'} onChange={e => set('category', e.target.value)} placeholder="e.g. Constitutional Law" /></Field>
    </div>
    <Field label="Summary"><textarea className={textareaCls} value={data.summary || ''} onChange={e => set('summary', e.target.value)} placeholder="Full news summary..." /></Field>
    <Field label="Date String (YYYY-MM-DD)"><input className={inputCls} value={data.dateString || ''} onChange={e => set('dateString', e.target.value)} /></Field>
  </>);
}
