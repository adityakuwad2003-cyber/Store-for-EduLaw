import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, Edit, Eye, 
  Layers, Package, X, Save,
  TrendingUp, ShoppingCart, 
  Check, ExternalLink, Loader2, GripVertical
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
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { ImageUploader } from '../../../components/admin/ImageUploader';

interface Bundle {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  coverImage?: string;
  noteIds: string[];
  isActive: boolean;
  expiryDate?: string;
  stats: {
    views: number;
    carts: number;
    purchases: number;
  };
  createdAt: any;
  updatedAt: any;
}

interface Note {
  id: string;
  title: string;
  price: number;
}

export default function BundlesManager() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Partial<Bundle> | null>(null);

  // ── DATA FETCHING ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch Bundles
      const bundleSnap = await getDocs(query(collection(db, 'bundles'), orderBy('createdAt', 'desc')));
      const fetchedBundles = bundleSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Bundle[];
      setBundles(fetchedBundles);

      // Fetch All Notes (for picker)
      const noteSnap = await getDocs(query(collection(db, 'notes'), orderBy('title', 'asc')));
      const fetchedNotes = noteSnap.docs.map(doc => ({ 
        id: doc.id, 
        title: doc.data().title,
        price: doc.data().price 
      })) as Note[];
      setAllNotes(fetchedNotes);
    } catch (error) {
      console.error('Error fetching bundles:', error);
      toast.error('Failed to load bundle catalog');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── AUTO-CALCULATIONS ──
  const originalTotal = useMemo(() => {
    if (!editingBundle?.noteIds) return 0;
    return editingBundle.noteIds.reduce((sum, id) => {
      const note = allNotes.find(n => n.id === id);
      return sum + (note?.price || 0);
    }, 0);
  }, [editingBundle?.noteIds, allNotes]);

  const discountPercentage = useMemo(() => {
    if (!originalTotal || !editingBundle?.price) return 0;
    return Math.round(((originalTotal - editingBundle.price) / originalTotal) * 100);
  }, [originalTotal, editingBundle?.price]);

  // ── ACTIONS ──
  const handleSave = async (data: Partial<Bundle>) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        originalPrice: originalTotal,
        discountPercentage: discountPercentage,
        updatedAt: serverTimestamp(),
        slug: data.title?.toLowerCase().replace(/\s+/g, '-') || data.slug,
        stats: data.stats || { views: 0, carts: 0, purchases: 0 }
      };

      if (data.id) {
        await updateDoc(doc(db, 'bundles', data.id), payload);
        toast.success('Bundle updated successfully');
      } else {
        await addDoc(collection(db, 'bundles'), {
          ...payload,
          createdAt: serverTimestamp(),
          isActive: true
        });
        toast.success('Bundle created successfully');
      }
      setIsEditorOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to save bundle');
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<Bundle>[] = [
    {
      key: 'cover',
      label: 'Cover',
      render: (row) => (
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          {row.coverImage ? (
            <img src={row.coverImage} className="w-full h-full object-cover" alt="" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-parchment/20">
              <Package className="w-6 h-6" />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'title',
      label: 'Bundle Name',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-parchment">{row.title}</p>
          <p className="text-[10px] text-parchment/40 uppercase tracking-widest mt-1">
            {row.noteIds?.length || 0} Notes Included
          </p>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Pricing',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-mono text-gold font-bold text-sm">₹{row.price}</span>
          <span className="text-[10px] text-parchment/30 line-through">₹{row.originalPrice}</span>
        </div>
      )
    },
    {
      key: 'discount',
      label: 'Savings',
      render: (row) => (
        <div className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider inline-block">
          {row.discountPercentage}% OFF
        </div>
      )
    },
    {
      key: 'status',
      label: 'Visibility',
      render: (row) => <StatusBadge status={row.isActive ? 'active' : 'inactive'} />
    },
    {
      key: 'analytics',
      label: 'Performance',
      render: (row) => (
        <div className="flex items-center gap-4 text-[10px] text-parchment/40">
          <div className="flex items-center gap-1"><Eye className="w-3 h-3" /> {row.stats?.views || 0}</div>
          <div className="flex items-center gap-1"><ShoppingCart className="w-3 h-3" /> {row.stats?.purchases || 0}</div>
        </div>
      )
    },
    {
      key: 'actions',
      label: '',
      className: 'w-10',
      render: (row) => (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); setEditingBundle(row); setIsEditorOpen(true); }}
            className="p-2 hover:bg-gold/10 text-parchment/40 hover:text-gold rounded-lg transition-all"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
             onClick={(e) => { e.stopPropagation(); window.open(`/bundles`, '_blank'); }}
            className="p-2 hover:bg-white/10 text-parchment/40 hover:text-parchment rounded-lg transition-all"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.02] border border-white/5 p-6 rounded-3xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-[#b8922a] flex items-center justify-center shadow-lg shadow-gold/20">
            <Layers className="w-7 h-7 text-ink" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-parchment">Bundles Manager</h1>
            <p className="text-sm text-parchment/40 font-ui tracking-wide">Create high-value note packages and limited-time deals</p>
          </div>
        </div>

        <button 
          onClick={() => { setEditingBundle({ noteIds: [], price: 0 }); setIsEditorOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-gold text-ink font-ui font-bold rounded-xl shadow-xl shadow-gold/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" /> Create Bundle
        </button>
      </div>

      <DataTable
        columns={columns}
        data={bundles}
        loading={loading}
        keyField="id"
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={(row) => { setEditingBundle(row); setIsEditorOpen(true); }}
      />

      {/* ── BUNDLE EDITOR ── */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsEditorOpen(false)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-md" 
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-[#0F0F0F] border-l border-white/10 shadow-2xl overflow-y-auto"
            >
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSave(editingBundle || {}); }}
                className="flex flex-col min-h-screen"
              >
                <div className="sticky top-0 z-20 px-8 py-6 bg-ink border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-xl text-parchment">{editingBundle?.id ? 'Edit Bundle' : 'New Bundle Package'}</h2>
                    <p className="text-[10px] text-gold uppercase tracking-[0.2em] font-black mt-1">Bundle Configuration</p>
                  </div>
                  <button type="button" onClick={() => setIsEditorOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-parchment/40 hover:text-parchment transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-8 space-y-10 pb-32">
                  <div className="grid grid-cols-2 gap-8">
                    <ImageUploader 
                      label="Bundle Cover Image"
                      value={editingBundle?.coverImage}
                      onChange={url => setEditingBundle(v => ({ ...v, coverImage: url }))}
                      className="col-span-1"
                    />

                    <div className="col-span-1 space-y-6">
                      <div className="p-6 rounded-2xl bg-gold/5 border border-gold/10 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gold font-bold uppercase tracking-widest">Pricing Strategy</span>
                          <TrendingUp className="w-4 h-4 text-gold" />
                        </div>
                        <div>
                          <label className="input-label">Bundle Sale Price (₹)</label>
                          <input 
                            type="number" required
                            value={editingBundle?.price || ''}
                            onChange={e => setEditingBundle(v => ({ ...v, price: Number(e.target.value) }))}
                            className="admin-input bg-ink border-gold/20" 
                          />
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gold/10">
                          <span className="text-xs text-parchment/40 italic">Savings to User:</span>
                          <span className="text-xs text-green-500 font-bold">₹{originalTotal - (editingBundle?.price || 0)} ({discountPercentage}%)</span>
                        </div>
                      </div>

                      <div>
                        <label className="input-label">Expiry Date (Optional)</label>
                        <input 
                          type="date"
                          value={editingBundle?.expiryDate || ''}
                          onChange={e => setEditingBundle(v => ({ ...v, expiryDate: e.target.value }))}
                          className="admin-input" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="input-label">Bundle Heading</label>
                    <input 
                      type="text" required
                      value={editingBundle?.title || ''}
                      onChange={e => setEditingBundle(v => ({ ...v, title: e.target.value }))}
                      className="admin-input text-lg font-bold" 
                      placeholder="e.g. Constitutional Law Complete Pack"
                    />
                    <label className="input-label">Sales Pitch / Description</label>
                    <textarea 
                      required rows={3}
                      value={editingBundle?.description || ''}
                      onChange={e => setEditingBundle(v => ({ ...v, description: e.target.value }))}
                      className="admin-input resize-none" 
                      placeholder="Explain why this bundle is essential for students..."
                    />
                  </div>

                  {/* Notes Picker Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-black">Notes Included in Package</h3>
                      <span className="text-xs text-parchment/40">{editingBundle?.noteIds?.length || 0} Notes Selected</span>
                    </div>

                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                      {allNotes.map(note => {
                        const isSelected = editingBundle?.noteIds?.includes(note.id);
                        return (
                          <button
                            key={note.id} type="button"
                            onClick={() => {
                              const currentIds = editingBundle?.noteIds || [];
                              const newIds = isSelected 
                                ? currentIds.filter(id => id !== note.id)
                                : [...currentIds, note.id];
                              setEditingBundle(v => ({ ...v, noteIds: newIds }));
                            }}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                              isSelected 
                                ? 'bg-gold/10 border-gold/30 ring-1 ring-gold/20' 
                                : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.07]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-gold text-ink' : 'bg-white/10 text-parchment/40'}`}>
                                {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-parchment">{note.title}</p>
                                <p className="text-[10px] text-parchment/40 uppercase tracking-widest">Value: ₹{note.price}</p>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gold/40">PICKED</span>
                                <GripVertical className="w-4 h-4 text-parchment/20 cursor-grab" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 z-20 px-8 py-6 bg-ink border-t border-white/10 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                   <div className="flex items-center gap-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editingBundle?.isActive} 
                        onChange={e => setEditingBundle(v => ({ ...v, isActive: e.target.checked }))}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                      <span className="ms-3 text-xs font-ui font-bold text-parchment/60 uppercase tracking-widest">Active Status</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={() => setIsEditorOpen(false)} className="text-sm font-ui text-parchment/40 hover:text-parchment">Discard</button>
                    <button type="submit" disabled={loading} className="px-10 py-3.5 bg-gold text-ink font-ui font-black rounded-xl shadow-xl shadow-gold/10 hover:scale-[1.02] flex items-center gap-2">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      {editingBundle?.id ? 'Update Bundle' : 'Launch Bundle'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .admin-input {
          @apply w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-parchment font-ui placeholder:text-parchment/20 focus:outline-none focus:border-gold/50 transition-all;
        }
        .input-label {
          @apply block text-[10px] font-ui text-parchment/40 uppercase tracking-widest font-black mb-2 ml-1;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(201, 168, 76, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(201, 168, 76, 0.4); }
      `}</style>
    </div>
  );
}
