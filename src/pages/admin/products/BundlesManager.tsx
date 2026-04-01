import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, Edit, Eye, 
  Package, X, Save,
  TrendingUp, ShoppingCart, 
  Check, ExternalLink, Loader2, GripVertical,
  RefreshCw
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
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Partial<Bundle> | null>(null);
  const [saving, setSaving] = useState(false);

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
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBundle) return;
    if (!editingBundle.title || !editingBundle.noteIds?.length) {
      toast.error('Please provide a title and select at least one note');
      return;
    }

    setSaving(true);
    try {
      const slug = editingBundle.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      const payload = {
        ...editingBundle,
        slug,
        originalPrice: originalTotal,
        discountPercentage,
        updatedAt: serverTimestamp(),
        isActive: editingBundle.isActive ?? true,
        stats: editingBundle.stats || { views: 0, carts: 0, purchases: 0 }
      };

      if (editingBundle.id) {
        await updateDoc(doc(db, 'bundles', editingBundle.id), payload);
        toast.success('Bundle updated!');
      } else {
        await addDoc(collection(db, 'bundles'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success('New bundle launched!');
      }
      setIsEditorOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving bundle:', error);
      toast.error('Failed to save bundle');
    } finally {
      setSaving(false);
    }
  };

  // ── TABLE COLUMNS ──
  const columns: Column<Bundle>[] = [
    {
      key: 'cover',
      label: 'Cover',
      render: (row) => (
        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden">
          {row.coverImage ? (
            <img src={row.coverImage} className="w-full h-full object-cover" alt="" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <Package className="w-6 h-6" />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'title',
      label: 'Bundle Details',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.title}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
            {row.noteIds?.length || 0} Notes Included
          </p>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-mono text-gold font-bold text-sm">₹{row.price}</span>
          <span className="text-[10px] text-slate-400 line-through">₹{row.originalPrice}</span>
        </div>
      )
    },
    {
      key: 'discount',
      label: 'Savings',
      render: (row) => (
        <div className="px-2 py-0.5 rounded bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider inline-block">
          {row.discountPercentage}% OFF
        </div>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => (
        <StatusBadge 
          status={row.isActive ? 'published' : 'draft'} 
        />
      )
    },
    {
      key: 'analytics',
      label: 'Performance',
      render: (row) => (
        <div className="flex items-center gap-4 text-[10px] text-slate-400">
          <div className="flex items-center gap-1"><Eye className="w-3 h-3" /> {row.stats?.views || 0}</div>
          <div className="flex items-center gap-1"><ShoppingCart className="w-3 h-3" /> {row.stats?.purchases || 0}</div>
        </div>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); setEditingBundle(row); setIsEditorOpen(true); }}
            className="p-2 hover:bg-gold/10 text-slate-400 hover:text-gold rounded-lg transition-all"
            aria-label="Edit bundle"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
             onClick={(e) => { e.stopPropagation(); window.open(`/bundles`, '_blank'); }}
            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-lg transition-all"
            aria-label="View bundle"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-[#b8922a] flex items-center justify-center shadow-lg shadow-gold/20">
            <Package className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-slate-900">Bundles Manager</h1>
            <p className="text-sm text-slate-500 font-ui tracking-wide">
              {loading ? 'Crunching numbers...' : `${bundles.length} active bundles`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-400 hover:text-gold transition-all"
            aria-label="Refresh bundles"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => { setEditingBundle({ noteIds: [], price: 0 }); setIsEditorOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-ui font-bold rounded-xl shadow-lg hover:bg-slate-800 active:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5" /> Launch Bundle
          </button>
        </div>
      </div>

      <DataTable 
        columns={columns}
        data={bundles}
        loading={loading}
        keyField="id"
        onRowClick={(row) => { setEditingBundle(row); setIsEditorOpen(true); }}
        emptyMessage="No bundles active. Combine your notes to boost sales!"
      />

      {/* Editor Slide-over */}
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
              className="relative w-full max-w-2xl bg-white border-l border-slate-200 shadow-2xl overflow-y-auto"
            >
              <form onSubmit={handleSave} className="flex flex-col min-h-screen">
                <div className="sticky top-0 z-20 px-8 py-6 bg-white border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-xl text-slate-900">
                      {editingBundle?.id ? 'Edit Bundle' : 'New Bundle Package'}
                    </h2>
                    <p className="text-[10px] text-gold uppercase tracking-[0.2em] font-black mt-1">Bundle Configuration</p>
                  </div>
                  <button type="button" onClick={() => setIsEditorOpen(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-all" aria-label="Close editor">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-8 space-y-10 pb-32">
                  <div className="grid grid-cols-2 gap-8">
                    <ImageUploader 
                      label="Cover Image"
                      value={editingBundle?.coverImage || ''}
                      onChange={url => setEditingBundle(v => ({ ...v, coverImage: url }))}
                      className="col-span-1"
                    />

                    <div className="col-span-1 space-y-6">
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pricing Strategy</span>
                          <TrendingUp className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <label htmlFor="bundle-price" className="input-label">Bundle Sale Price (₹)</label>
                          <input 
                            id="bundle-price"
                            type="number" required
                            value={editingBundle?.price || ''}
                            onChange={e => setEditingBundle(v => ({ ...v, price: Number(e.target.value) }))}
                            className="admin-input bg-white border-slate-200" 
                          />
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                          <span className="text-xs text-slate-400 italic">Savings to User:</span>
                          <span className="text-xs text-green-600 font-bold">₹{originalTotal - (editingBundle?.price || 0)} ({discountPercentage}%)</span>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="bundle-expiry" className="input-label">Expiry Date (Optional)</label>
                        <input 
                          id="bundle-expiry"
                          type="date"
                          value={editingBundle?.expiryDate || ''}
                          onChange={e => setEditingBundle(v => ({ ...v, expiryDate: e.target.value }))}
                          className="admin-input" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label htmlFor="bundle-title" className="input-label">Bundle Heading</label>
                    <input 
                      id="bundle-title"
                      type="text" required
                      value={editingBundle?.title || ''}
                      onChange={e => setEditingBundle(v => ({ ...v, title: e.target.value }))}
                      className="admin-input text-lg font-bold" 
                      placeholder="e.g. Constitutional Law Complete Pack"
                    />
                    <label htmlFor="bundle-description" className="input-label">Sales Pitch / Description</label>
                    <textarea 
                      id="bundle-description"
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
                      <h3 className="text-slate-900 font-ui text-[10px] uppercase tracking-[0.2em] font-black">Notes Included in Package</h3>
                      <span className="text-xs text-slate-400">{editingBundle?.noteIds?.length || 0} Notes Selected</span>
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
                                ? 'bg-gold/5 border-gold/30 ring-1 ring-gold/20' 
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-gold text-white' : 'bg-slate-200 text-slate-500'}`}>
                                {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{note.title}</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Value: ₹{note.price}</p>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gold">PICKED</span>
                                <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 z-20 px-8 py-6 bg-white border-t border-slate-200 flex items-center justify-between shadow-[0_-12px_40px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        id="bundle-active-toggle"
                        type="checkbox" 
                        checked={editingBundle?.isActive} 
                        onChange={e => setEditingBundle(v => ({ ...v, isActive: e.target.checked }))}
                        className="sr-only peer" 
                        aria-label="Toggle bundle active status"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold transition-all"></div>
                      <span className="ms-3 text-xs font-ui font-bold text-slate-500 uppercase tracking-widest">Active Status</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={() => setIsEditorOpen(false)} className="text-sm font-ui text-slate-400 hover:text-slate-900">Discard</button>
                    <button type="submit" disabled={saving} className="px-10 py-3.5 bg-slate-900 text-white font-ui font-black rounded-xl shadow-lg hover:bg-slate-800 active:scale-[1.02] flex items-center gap-2">
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
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
          @apply w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 font-ui placeholder:text-slate-300 focus:outline-none focus:border-gold/50 transition-all;
        }
        .input-label {
          @apply block text-[10px] font-ui text-slate-400 uppercase tracking-widest font-black mb-2 ml-1;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(201, 168, 76, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(201, 168, 76, 0.4); }
      `}</style>
    </div>
  );
}
