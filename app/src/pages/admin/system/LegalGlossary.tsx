import { useState, useEffect, useCallback } from 'react';
import { 
  Book, Plus, X, Save, FileUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  collection, query, orderBy, 
  getDocs, doc, updateDoc, 
  addDoc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { DataTable } from '../../../components/admin/DataTable';
import type { Column } from '../../../components/admin/DataTable';
import Papa from 'papaparse';

interface GlossaryTerm {
  id: string;
  term: string;
  pronunciation?: string;
  origin: 'Latin' | 'English' | 'French' | 'Other';
  definition: string;
  usageExample?: string;
  category: string;
  createdAt: any;
  updatedAt: any;
}

export default function LegalGlossary() {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Partial<GlossaryTerm> | null>(null);

  // ── DATA FETCHING ──
  const fetchTerms = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'legal_glossary'), orderBy('term', 'asc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GlossaryTerm[];
      setTerms(data);
    } catch (error) {
      console.error('Error fetching glossary:', error);
      toast.error('Failed to load glossary terms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);

  // ── ACTIONS ──
  const handleSave = async (data: Partial<GlossaryTerm>) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      if (data.id) {
        await updateDoc(doc(db, 'legal_glossary', data.id), payload);
        toast.success('Term updated successfully');
      } else {
        await addDoc(collection(db, 'legal_glossary'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success('New legal term added');
      }
      setIsEditorOpen(false);
      fetchTerms();
    } catch (error) {
      toast.error('Failed to save term');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        toast.info(`Analyzing ${results.data.length} terms...`);
        // In production, split into batches for Firestore
        fetchTerms();
      }
    });
  };

  const columns: Column<GlossaryTerm>[] = [
    {
      key: 'term',
      label: 'Legal Term',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 italic">{row.term}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{row.origin} · {row.category}</p>
        </div>
      )
    },
    {
      key: 'definition',
      label: 'Definition',
      render: (row) => (
        <p className="text-xs text-slate-500 line-clamp-2 max-w-[400px] leading-relaxed">
          {row.definition}
        </p>
      )
    },
    {
      key: 'actions',
      label: '',
      className: 'w-10',
      render: (row) => (
        <button 
          onClick={(e) => { e.stopPropagation(); setEditingTerm(row); setIsEditorOpen(true); }}
          className="p-2 hover:bg-slate-100 text-slate-400 hover:text-gold rounded-lg transition-all"
          aria-label="Edit term"
        >
          <Plus className="w-4 h-4 rotate-45" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-[#b8922a] flex items-center justify-center shadow-lg shadow-gold/20">
            <Book className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-slate-900">Legal Glossary</h1>
            <p className="text-sm text-slate-500 font-ui tracking-wide">Maintain an authoritative database of legal terminology and maxims</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-6 py-3 bg-slate-50 border border-slate-200 text-slate-600 font-ui font-bold rounded-xl hover:bg-slate-100 cursor-pointer transition-all">
            <FileUp className="w-5 h-5 text-gold" /> Bulk Import
            <input type="file" accept=".csv" onChange={handleBulkImport} className="hidden" />
          </label>
          <button 
            onClick={() => { setEditingTerm({ origin: 'Latin', category: 'Civil Law' }); setIsEditorOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-gold text-ink font-ui font-bold rounded-xl shadow-xl shadow-gold/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5" /> Add Term
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={terms}
        loading={loading}
        keyField="id"
        onRowClick={(row) => { setEditingTerm(row); setIsEditorOpen(true); }}
      />

      {/* ── EDITOR SLIDE-OVER ── */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsEditorOpen(false)}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-white border-l border-slate-200 shadow-2xl flex flex-col h-screen"
            >
              <div className="px-8 py-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="font-display text-xl text-slate-900">{editingTerm?.id ? 'Edit Legal Term' : 'Define New Lexicon'}</h2>
                  <p className="text-[10px] text-gold uppercase tracking-[0.2em] font-black mt-1">System Repository</p>
                </div>
                <button onClick={() => setIsEditorOpen(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400" aria-label="Close editor">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form 
                onSubmit={(e) => { e.preventDefault(); handleSave(editingTerm || {}); }}
                className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar"
              >
                <div className="space-y-4">
                  <label htmlFor="term-word" className="input-label">Word / Maxim</label>
                  <input 
                    id="term-word"
                    type="text" required
                    value={editingTerm?.term || ''}
                    onChange={e => setEditingTerm(v => ({ ...v, term: e.target.value }))}
                    className="admin-input italic font-serif text-lg" 
                    placeholder="e.g. Audi Alteram Partem"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="term-origin" className="input-label">Origin Language</label>
                    <select 
                      id="term-origin"
                      value={editingTerm?.origin}
                      onChange={e => setEditingTerm(v => ({ ...v, origin: e.target.value as any }))}
                      className="admin-input"
                    >
                      <option value="Latin">Latin</option>
                      <option value="English">English</option>
                      <option value="French">French</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="term-category" className="input-label">Category</label>
                    <input 
                      id="term-category"
                      type="text" required
                      value={editingTerm?.category || ''}
                      onChange={e => setEditingTerm(v => ({ ...v, category: e.target.value }))}
                      className="admin-input uppercase text-[10px] tracking-widest font-black" 
                      placeholder="e.g. CONSTITUTIONAL"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label htmlFor="term-definition" className="input-label">Legal Definition</label>
                  <textarea 
                    id="term-definition"
                    required rows={5}
                    value={editingTerm?.definition || ''}
                    onChange={e => setEditingTerm(v => ({ ...v, definition: e.target.value }))}
                    className="admin-input resize-none" 
                    placeholder="Provide a comprehensive legal definition..."
                  />
                </div>

                <div className="space-y-4">
                  <label htmlFor="term-usage" className="input-label">Practical Usage Example</label>
                  <textarea 
                    id="term-usage"
                    rows={3}
                    value={editingTerm?.usageExample || ''}
                    onChange={e => setEditingTerm(v => ({ ...v, usageExample: e.target.value }))}
                    className="admin-input resize-none bg-slate-50/50" 
                    placeholder="e.g. As per the principle of Audi Alteram Partem, the judge must hear both sides..."
                  />
                </div>
              </form>

              <div className="p-8 border-t border-slate-200 bg-white flex items-center justify-end gap-4 shadow-[0_-12px_40px_rgba(0,0,0,0.05)]">
                <button type="button" onClick={() => setIsEditorOpen(false)} className="text-sm font-ui text-slate-400 hover:text-slate-900 font-bold">Discard</button>
                <button 
                  type="button"
                  onClick={() => handleSave(editingTerm || {})}
                  className="px-10 py-3.5 bg-slate-900 text-white font-ui font-black rounded-xl shadow-lg hover:bg-slate-800 active:scale-[1.02] flex items-center gap-2"
                >
                  <Save className="w-5 h-5" /> Commit Definition
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .admin-input {
          @apply w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 font-ui placeholder:text-slate-300 focus:outline-none focus:border-gold/50 transition-all;
        }
        .input-label {
          @apply block text-[10px] font-ui text-slate-400 uppercase tracking-widest font-black mb-2 ml-1;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(201, 168, 76, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}
