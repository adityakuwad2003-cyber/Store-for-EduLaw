import { useState, useEffect, useCallback } from 'react';
import { 
  FileEdit, Plus, X, Save,
  Eye, Image as ImageIcon, Globe,
  Layout, RefreshCw
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
import { RichTextEditor } from '../../../components/admin/RichTextEditor';
import { ImageUploader } from '../../../components/admin/ImageUploader';
import { format } from 'date-fns';

interface Article {
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
  seo: {
    metaTitle: string;
    metaDesc: string;
    keywords: string;
  };
  createdAt: any;
  updatedAt: any;
}

const CATEGORIES = [
  'Landmark Judgements',
  'AI & Tech Developments',
  'Criminal Law',
  'War & Geopolitics',
  'Legal Updates',
  'Case Studies',
  'Career Advice',
  'News',
  'Academic'
];

export default function BlogManager() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);

  // ── DATA FETCHING ──
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'blog_articles'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Article[];
      setArticles(data);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // ── ACTIONS ──
  const handleSave = async (data: Partial<Article>) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        updatedAt: serverTimestamp(),
        slug: data.title?.toLowerCase().replace(/\s+/g, '-') || data.slug,
        views: data.views || 0,
        author: data.author || 'EduLaw Editorial',
        seo: data.seo || { metaTitle: '', metaDesc: '', keywords: '' }
      };

      if (data.id) {
        await updateDoc(doc(db, 'blog_articles', data.id), payload);
        toast.success('Article updated successfully');
      } else {
        await addDoc(collection(db, 'blog_articles'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success('Article published to drafts');
      }
      setIsEditorOpen(false);
      fetchArticles();
    } catch (error) {
      toast.error('Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<Article>[] = [
    {
      key: 'article',
      label: 'Article Details',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
             {row.featuredImage ? (
               <img src={row.featuredImage} className="w-full h-full object-cover" alt="" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-slate-200">
                 <ImageIcon className="w-5 h-5" />
               </div>
             )}
          </div>
          <div>
            <p className="font-bold text-slate-800 truncate max-w-[200px]">{row.title}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{row.category} · {row.author}</p>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'views',
      label: 'Readership',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
           <Eye className="w-3.5 h-3.5 text-slate-300" />
           <span className="text-xs font-mono text-slate-500">{row.views || 0}</span>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Published',
      sortable: true,
      render: (row) => (
        <span className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">
           {row.createdAt?.toDate ? format(row.createdAt.toDate(), 'MMM dd, yyyy') : 'Recently'}
        </span>
      )
    },
    {
      key: 'actions',
      label: '',
      className: 'w-10',
      render: (row) => (
        <button 
          onClick={(e) => { e.stopPropagation(); setEditingArticle(row); setIsEditorOpen(true); }}
          className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-gold/10 hover:text-gold hover:border-gold/30 rounded-lg transition-all shadow-sm"
          aria-label="Edit article"
        >
          <FileEdit className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-[#b8922a] flex items-center justify-center shadow-lg shadow-gold/20">
            <Layout className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-slate-900">Blog Manager</h1>
            <p className="text-sm text-slate-500 font-ui tracking-wide">Publish legal insights, case summaries, and platform updates</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchArticles}
            disabled={loading}
            className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-gold hover:shadow-sm rounded-xl transition-all shadow-sm"
            aria-label="Refresh articles"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => { setEditingArticle({ status: 'draft', category: 'Legal Updates', content: '', tags: [], seo: { metaTitle: '', metaDesc: '', keywords: '' } }); setIsEditorOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-ui font-bold rounded-xl shadow-lg hover:bg-slate-800 active:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5" /> New Article
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={articles}
        loading={loading}
        keyField="id"
        onRowClick={(row) => { setEditingArticle(row); setIsEditorOpen(true); }}
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
              className="relative w-full max-w-4xl bg-white border-l border-slate-200 shadow-2xl flex flex-col h-screen"
            >
              <div className="px-8 py-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="font-display text-xl text-slate-900">{editingArticle?.id ? 'Edit Article' : 'Draft New Insight'}</h2>
                  <p className="text-[10px] text-gold uppercase tracking-[0.2em] font-black mt-1">Editorial Suite</p>
                </div>
                <button onClick={() => setIsEditorOpen(false)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-400" aria-label="Close editor">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form 
                onSubmit={(e) => { e.preventDefault(); handleSave(editingArticle || {}); }}
                className="flex-1 overflow-y-auto p-8 space-y-10 pb-32 custom-scrollbar"
              >
                <div className="grid grid-cols-3 gap-8">
                  {/* Content Meta */}
                  <div className="col-span-2 space-y-8">
                    <div className="space-y-4">
                      <label className="input-label">Title</label>
                      <input 
                        type="text" required
                        value={editingArticle?.title || ''}
                        onChange={e => setEditingArticle(v => ({ ...v, title: e.target.value }))}
                        className="admin-input text-lg font-bold" 
                        placeholder="Mastering the new Bhartiya Nyaya Sanhita..."
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="input-label">Rich content Body</label>
                      <RichTextEditor 
                        value={editingArticle?.content || ''}
                        onChange={html => setEditingArticle(v => ({ ...v, content: html }))}
                      />
                    </div>
                  </div>

                  {/* Sidebar Config */}
                  <div className="col-span-1 space-y-8">
                    <div className="space-y-4">
                      <label className="input-label">Featured Image</label>
                      <ImageUploader 
                        label="Article Header Image"
                        value={editingArticle?.featuredImage}
                        onChange={url => setEditingArticle(v => ({ ...v, featuredImage: url }))}
                      />
                    </div>

                    <div className="space-y-4">
                      <label htmlFor="article-category" className="input-label">Category</label>
                      <select 
                        id="article-category"
                        value={editingArticle?.category}
                        onChange={e => setEditingArticle(v => ({ ...v, category: e.target.value }))}
                        className="admin-input"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label htmlFor="article-status" className="input-label">Publishing Status</label>
                      <select 
                        id="article-status"
                        value={editingArticle?.status}
                        onChange={e => setEditingArticle(v => ({ ...v, status: e.target.value as any }))}
                        className="admin-input"
                      >
                         <option value="draft">Draft</option>
                         <option value="published">Published</option>
                         <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                       <div className="flex items-center gap-2 mb-2">
                         <Globe className="w-4 h-4 text-gold" />
                         <span className="text-[10px] text-gold uppercase font-black tracking-widest">SEO Engine</span>
                       </div>
                       <div className="space-y-4">
                          <div>
                            <label htmlFor="meta-title" className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-1 block">Meta Title</label>
                            <input 
                              id="meta-title"
                              type="text"
                              value={editingArticle?.seo?.metaTitle || ''}
                              onChange={e => setEditingArticle(v => v ? ({ ...v, seo: { ...v.seo!, metaTitle: e.target.value } }) : null)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none"
                            />
                          </div>
                          <div>
                            <label htmlFor="meta-desc" className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-1 block">Meta Description</label>
                            <textarea 
                              id="meta-desc"
                              rows={3}
                              value={editingArticle?.seo?.metaDesc || ''}
                              onChange={e => setEditingArticle(v => v ? ({ ...v, seo: { ...v.seo!, metaDesc: e.target.value } }) : null)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none resize-none"
                            />
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </form>

              <div className="absolute bottom-0 left-0 right-0 p-8 bg-white border-t border-slate-200 flex items-center justify-end gap-4 shadow-[0_-12px_40px_rgba(0,0,0,0.05)]">
                <button type="button" onClick={() => setIsEditorOpen(false)} className="text-sm font-ui text-slate-400 hover:text-slate-900">Discard</button>
                <button 
                  type="button"
                  onClick={() => handleSave(editingArticle || {})}
                  className="px-10 py-3.5 bg-slate-900 text-white font-ui font-black rounded-xl shadow-lg hover:bg-slate-800 active:scale-[1.02] flex items-center gap-2"
                >
                  <Save className="w-5 h-5" /> Commit Article
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
