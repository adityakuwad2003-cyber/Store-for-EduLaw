import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Edit, Eye, 
  Star, Archive, X, Save,
  ShoppingCart, Download, Loader2, BookOpen,
  Trash2, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  collection, query, orderBy, limit,
  getDocs, startAfter, where, doc, 
  updateDoc, deleteDoc, addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { DataTable } from '../../../components/admin/DataTable';
import type { Column } from '../../../components/admin/DataTable';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { RichTextEditor } from '../../../components/admin/RichTextEditor';
import { ImageUploader } from '../../../components/admin/ImageUploader';

interface Note {
  id: string;
  title: string;
  slug: string;
  category: string;
  price: number;
  language: 'English' | 'Hindi' | 'Both';
  status: 'published' | 'draft' | 'archived';
  isFeatured: boolean;
  isNewArrival: boolean;
  coverImage?: string;
  samplePdfUrl?: string;
  pdfUrl?: string; // The main paid file
  description: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  visibility: 'public' | 'subscribers' | 'specific_plan';
  salesCount: number;
  downloadCount: number;
  createdAt: any;
  updatedAt: any;
}

const CATEGORIES = [
  'Criminal Law', 'Civil Procedure', 'Constitutional Law', 'Corporate',
  'Evidence', 'Family Law', 'International Law', 'Jurisprudence',
  'Property Law', 'Taxation', 'Contract Law', 'Torts', 'Administrative Law', 'Other',
];

export default function NotesManager() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Partial<Note> | null>(null);
  const [filterCategory] = useState('all');

  const PAGE_SIZE = 20;

  // ── FIREBASE DATA FETCHING ──
  const fetchNotes = useCallback(async (isNext = false) => {
    setLoading(true);
    try {
      let q = query(
        collection(db, 'notes'),
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE)
      );

      // Filtering (Firestore limitation: can't easily combine orderBy and inequality filter on different fields)
      if (filterCategory !== 'all') {
        q = query(q, where('category', '==', filterCategory));
      }

      if (isNext && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const snapshot = await getDocs(q);
      const fetchedNotes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Note[];

      setNotes(fetchedNotes);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      
      // Get total count (one-time or cached)
      // For real-time we use the new Firestore count() aggregation
      // const totalRes = await getCountFromServer(collection(db, 'notes'));
      // setTotalCount(totalRes.data().count);
      
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load catalog');
    } finally {
      setLoading(false);
    }
  }, [filterCategory, lastVisible]);

  useEffect(() => {
    fetchNotes();
  }, [filterCategory]);

  // ── ACTIONS ──
  const handleSave = async (data: Partial<Note>) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        updatedAt: serverTimestamp(),
        slug: data.title?.toLowerCase().replace(/\s+/g, '-') || data.slug,
      };

      if (data.id) {
        await updateDoc(doc(db, 'notes', data.id), payload);
        toast.success('Note updated successfully');
      } else {
        await addDoc(collection(db, 'notes'), {
          ...payload,
          createdAt: serverTimestamp(),
          salesCount: 0,
          downloadCount: 0,
        });
        toast.success('Note created successfully');
      }
      setIsEditorOpen(false);
      fetchNotes();
    } catch (error) {
      toast.error('Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: 'feature' | 'unpublish' | 'delete') => {
    if (!confirm(`Are you sure you want to ${action} ${selectedIds.length} items?`)) return;
    
    setLoading(true);
    try {
      const promises = selectedIds.map(id => {
        const noteRef = doc(db, 'notes', id);
        if (action === 'feature') return updateDoc(noteRef, { isFeatured: true });
        if (action === 'unpublish') return updateDoc(noteRef, { status: 'draft' });
        if (action === 'delete') return deleteDoc(noteRef);
        return Promise.resolve();
      });

      await Promise.all(promises);
      toast.success(`Successfully processed ${selectedIds.length} items`);
      setSelectedIds([]);
      fetchNotes();
    } catch (error) {
      toast.error('Bulk action failed');
    } finally {
      setLoading(false);
    }
  };

  // ── TABLE COLUMNS ──
  const columns: Column<Note>[] = [
    {
      key: 'cover',
      label: 'Cover',
      render: (row) => (
        <div className="w-12 h-16 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
          {row.coverImage ? (
            <img src={row.coverImage} className="w-full h-full object-cover" alt="" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-parchment/20">
              <BookOpen className="w-6 h-6" />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (row) => (
        <div className="max-w-xs">
          <p className="font-bold text-parchment truncate">{row.title}</p>
          <p className="text-[10px] text-parchment/40 uppercase tracking-widest mt-1">{row.slug}</p>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => (
        <span className="px-2 py-1 rounded bg-white/5 text-parchment/60 text-xs">{row.category}</span>
      )
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (row) => <span className="font-mono text-gold">₹{row.price}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'featured',
      label: 'Highlights',
      render: (row) => (
        <div className="flex gap-2">
          {row.isFeatured && <Star className="w-4 h-4 text-gold fill-gold" aria-label="Featured" />}
          {row.isNewArrival && <div className="px-1.5 py-0.5 rounded bg-burgundy text-[8px] font-bold text-white uppercase">New</div>}
        </div>
      )
    },
    {
      key: 'stats',
      label: 'Activity',
      render: (row) => (
        <div className="flex flex-col gap-1">
          <p className="text-[10px] text-parchment/40 flex items-center gap-1">
            <ShoppingCart className="w-3 h-3" /> {row.salesCount || 0} Sales
          </p>
          <p className="text-[10px] text-parchment/40 flex items-center gap-1">
            <Download className="w-3 h-3" /> {row.downloadCount || 0} Dls
          </p>
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
            onClick={(e) => { e.stopPropagation(); setEditingNote(row); setIsEditorOpen(true); }}
            className="p-2 hover:bg-gold/10 text-parchment/40 hover:text-gold rounded-lg transition-all"
            title="Edit Note"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); window.open(`/product/${row.slug}`, '_blank'); }}
            className="p-2 hover:bg-white/10 text-parchment/40 hover:text-parchment rounded-lg transition-all"
            title="Preview on Store"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* ── MODULE HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.02] border border-white/5 p-6 rounded-3xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-[#b8922a] flex items-center justify-center shadow-lg shadow-gold/20">
            <BookOpen className="w-7 h-7 text-ink" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-parchment">Notes Manager</h1>
            <p className="text-sm text-parchment/40 font-ui tracking-wide">Manage legal document catalog, pricing, and SEO</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setEditingNote({}); setIsEditorOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-gold text-ink font-ui font-bold rounded-xl shadow-xl shadow-gold/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5" /> New Note
          </button>
        </div>
      </div>

      {/* ── BULK ACTIONS BAR ── */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-4 p-4 bg-ink/60 border border-gold/30 rounded-2xl backdrop-blur-xl shadow-2xl"
          >
            <span className="text-sm font-ui text-gold font-bold px-4 border-r border-gold/20">
              {selectedIds.length} Selected
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => handleBulkAction('feature')}
                className="btn-bulk bg-gold/10 text-gold hover:bg-gold hover:text-ink"
              >
                <Star className="w-4 h-4" /> Feature Selected
              </button>
              <button 
                onClick={() => handleBulkAction('unpublish')}
                className="btn-bulk bg-white/5 text-parchment/60 hover:bg-white/10 hover:text-parchment"
              >
                <Archive className="w-4 h-4" /> Unpublish
              </button>
              <button 
                onClick={() => handleBulkAction('delete')}
                className="btn-bulk bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
              >
                <Trash2 className="w-4 h-4" /> Delete Permanently
              </button>
            </div>
            <button 
              onClick={() => setSelectedIds([])}
              className="ml-auto p-2 text-parchment/40 hover:text-parchment"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DATA TABLE ── */}
      <DataTable
        columns={columns}
        data={notes}
        loading={loading}
        keyField="id"
        totalCount={notes.length}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={(row) => { setEditingNote(row); setIsEditorOpen(true); }}
      />

      {/* ── EDITOR SLIDE-OVER ── */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsEditorOpen(false)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-md" 
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-[#0F0F0F] border-l border-white/10 shadow-2xl overflow-y-auto"
            >
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave(editingNote || {});
                }}
                className="flex flex-col min-h-screen"
              >
                <div className="sticky top-0 z-20 px-8 py-6 bg-ink border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-xl text-parchment">
                      {editingNote?.id ? 'Edit Note' : 'Create New Note'}
                    </h2>
                    <p className="text-xs text-parchment/40 mt-1 uppercase tracking-widest font-bold">Catalog Management</p>
                  </div>
                  <button type="button" onClick={() => setIsEditorOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-parchment/40 hover:text-parchment transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-8 space-y-10 pb-32">
                  {/* Basic Information */}
                  <section className="space-y-6">
                    <h3 className="text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-black flex items-center gap-2">
                       Basic Information
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2">
                        <label className="input-label">Document Title</label>
                        <input 
                          type="text" 
                          required
                          value={editingNote?.title || ''} 
                          onChange={e => setEditingNote(v => ({ ...v, title: e.target.value }))}
                          className="admin-input" 
                          placeholder="e.g. Criminal Procedure Code (CrPC) Master Notes"
                        />
                      </div>
                      
                      <div className="col-span-2 md:col-span-1">
                        <label className="input-label">Category</label>
                        <select 
                          value={editingNote?.category || ''}
                          onChange={e => setEditingNote(v => ({ ...v, category: e.target.value }))}
                          className="admin-input border-white/10 focus:border-gold/50"
                        >
                          <option value="">Select Category</option>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      <div className="col-span-2 md:col-span-1">
                        <label className="input-label">Price (INR)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-parchment/30 font-mono">₹</span>
                          <input 
                            type="number" 
                            required
                            value={editingNote?.price || ''}
                            onChange={e => setEditingNote(v => ({ ...v, price: Number(e.target.value) }))}
                            className="admin-input pl-10" 
                            placeholder="299"
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Document & Assets */}
                  <section className="space-y-6">
                    <h3 className="text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-black flex items-center gap-2">
                      Document & Assets
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-8">
                      <ImageUploader 
                        label="Cover Page (JPG/PNG)"
                        value={editingNote?.coverImage}
                        onChange={url => setEditingNote(v => ({ ...v, coverImage: url }))}
                        aspectRatio="aspect-[3/4]"
                        className="col-span-1"
                      />
                      
                      <div className="space-y-4 col-span-1">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm text-parchment font-medium">Main PDF File</p>
                            <p className="text-[10px] text-parchment/40 uppercase tracking-widest mt-1">Full Document</p>
                          </div>
                          <button type="button" className="text-xs text-gold underline">Upload File</button>
                        </div>

                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-burgundy/10 text-burgundy flex items-center justify-center">
                            <BookOpen className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm text-parchment font-medium">Sample PDF</p>
                            <p className="text-[10px] text-parchment/40 uppercase tracking-widest mt-1">Free 5-Page Preview</p>
                          </div>
                          <button type="button" className="text-xs text-gold underline">Upload Sample</button>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Content Editor */}
                  <section className="space-y-6">
                    <h3 className="text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-black flex items-center gap-2">
                      Public Description
                    </h3>
                    <RichTextEditor 
                      value={editingNote?.description || ''}
                      onChange={html => setEditingNote(v => ({ ...v, description: html }))}
                    />
                  </section>

                  {/* SEO & Visibility */}
                   <section className="space-y-6">
                    <h3 className="text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-black flex items-center gap-2">
                      SEO & Meta Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="input-label">Meta Title (SEO)</label>
                        <input 
                          type="text" 
                          value={editingNote?.metaTitle || ''}
                          onChange={e => setEditingNote(v => ({ ...v, metaTitle: e.target.value }))}
                          className="admin-input" 
                          placeholder="e.g. Best CrPC Master Notes for Judiciary Exams 2024"
                        />
                      </div>
                      <div>
                        <label className="input-label">Meta Description</label>
                        <textarea 
                          value={editingNote?.metaDescription || ''}
                          onChange={e => setEditingNote(v => ({ ...v, metaDescription: e.target.value }))}
                          rows={3}
                          className="admin-input resize-none" 
                          placeholder="Brief summary for Google results..."
                        />
                      </div>
                    </div>
                  </section>
                </div>

                {/* Fixed Footer */}
                <div className="sticky bottom-0 z-20 px-8 py-6 bg-ink border-t border-white/10 flex items-center justify-end gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                  <button 
                    type="button" 
                    onClick={() => setIsEditorOpen(false)}
                    className="px-6 py-3 text-parchment/60 hover:text-parchment font-ui font-semibold transition-colors"
                  >
                    Discard Changes
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-gold text-ink font-ui font-black rounded-xl shadow-xl shadow-gold/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {editingNote?.id ? 'Update Note' : 'Create Note'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .admin-input {
          @apply w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-parchment font-ui placeholder:text-parchment/20 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all;
        }
        .input-label {
          @apply block text-[10px] font-ui text-parchment/40 uppercase tracking-widest font-black mb-2 ml-1;
        }
        .btn-bulk {
          @apply flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-ui font-bold transition-all active:scale-[0.98];
        }
      `}</style>
    </div>
  );
}
