import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Edit,
  FileText, X, Save, Trash2,
  FileCode, Globe, Loader2, DollarSign,
  RefreshCw, Upload, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  collection, query, orderBy,
  getDocs, doc, updateDoc,
  addDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { DataTable } from '../../../components/admin/DataTable';
import type { Column } from '../../../components/admin/DataTable';

interface Template {
  id: string;
  title: string;
  slug: string;
  category: 'Petition' | 'Agreement' | 'Notice' | 'Affidavit' | 'Other';
  price: number;
  isFree: boolean;
  language: 'English' | 'Hindi' | 'Both';
  pdfKey?: string;   // R2 key e.g. templates/slug.pdf
  docxKey?: string;  // R2 key e.g. templates/slug.docx
  downloadCount: number;
  createdAt: any;
  updatedAt: any;
}

const CATEGORIES = ['Petition', 'Agreement', 'Notice', 'Affidavit', 'Other'];

export default function TemplatesManager() {
  const { currentUser } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<Template> | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ pdf: number | null; docx: number | null }>({ pdf: null, docx: null });
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const docxInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (type: 'pdf' | 'docx', file: File) => {
    const ext = type === 'pdf' ? 'pdf' : 'docx';
    if (!file.name.toLowerCase().endsWith(`.${ext}`)) {
      toast.error(`Please select a .${ext} file`);
      return;
    }
    if (!currentUser) { toast.error('Not authenticated'); return; }

    const slug = (editingTemplate?.slug || editingTemplate?.title?.toLowerCase().replace(/\s+/g, '-') || `template-${Date.now()}`)
      .replace(/[^a-z0-9\-]/g, '-');
    const fileName = `templates/${slug}.${ext}`;

    setUploadProgress(p => ({ ...p, [type]: 0 }));
    try {
      // 1. Get a presigned R2 PUT URL from the admin API (same mechanism as Notes)
      const token = await currentUser.getIdToken();
      const urlRes = await fetch('/api/admin/get-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fileName, fileSize: file.size }),
      });
      if (!urlRes.ok) {
        const err = await urlRes.json().catch(() => ({}));
        throw new Error(err.error || 'Could not get upload URL');
      }
      const { uploadUrl } = await urlRes.json();

      // 2. Upload directly to R2 via PUT
      const mime = ext === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': mime },
        body: file,
      });
      if (!putRes.ok) throw new Error(`Upload failed (${putRes.status})`);

      // 3. Store the R2 key in state
      const keyField = type === 'pdf' ? 'pdfKey' : 'docxKey';
      setEditingTemplate(v => ({ ...v, [keyField]: fileName }));
      setUploadProgress(p => ({ ...p, [type]: null }));
      toast.success(`${ext.toUpperCase()} uploaded successfully`);
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message}`);
      setUploadProgress(p => ({ ...p, [type]: null }));
    }
  };

  // ── DATA FETCHING ──
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'templates'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Template[];
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // ── ACTIONS ──
  const handleSave = async (data: Partial<Template>) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        updatedAt: serverTimestamp(),
        slug: data.title?.toLowerCase().replace(/\s+/g, '-') || data.slug,
        downloadCount: data.downloadCount || 0
      };

      if (data.id) {
        await updateDoc(doc(db, 'templates', data.id), payload);
        toast.success('Template updated successfully');
      } else {
        await addDoc(collection(db, 'templates'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success('Template created successfully');
      }
      // Auto-ping Google to pick up the new/updated template in sitemap
      fetch('/api/purchases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'ping-google' }) }).catch(() => null);
      setIsEditorOpen(false);
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template completely? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'templates', templateId));
      toast.success('Template deleted successfully');
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  const columns: Column<Template>[] = [
    {
      key: 'title',
      label: 'Document Title',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.title}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{row.category}</p>
        </div>
      )
    },
    {
      key: 'language',
      label: 'Language',
      render: (row) => (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Globe className="w-3.5 h-3.5" />
          {row.language}
        </div>
      )
    },
    {
      key: 'price',
      label: 'Type',
      render: (row) => (
        <div className="flex flex-col">
          {row.isFree ? (
             <span className="text-green-500 font-bold text-xs uppercase tracking-widest">Free</span>
          ) : (
            <span className="text-gold font-bold text-xs">₹{row.price}</span>
          )}
        </div>
      )
    },
    {
      key: 'files',
      label: 'Formats',
      render: (row) => (
        <div className="flex gap-2">
          {row.pdfKey && <FileText className="w-4 h-4 text-red-400" aria-label="PDF Available" />}
          {row.docxKey && <FileCode className="w-4 h-4 text-blue-400" aria-label="DOCX Available" />}
        </div>
      )
    },
    {
      key: 'stats',
      label: 'Downloads',
      sortable: true,
      render: (row) => (
        <span className="text-sm font-mono text-slate-500">{row.downloadCount || 0}</span>
      )
    },
    {
      key: 'actions',
      label: '',
      className: 'w-10',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); setEditingTemplate(row); setIsEditorOpen(true); }}
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-gold/10 hover:text-gold hover:border-gold/30 rounded-lg transition-all shadow-sm"
            aria-label="Edit template"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(row.id as string); }}
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 rounded-lg transition-all shadow-sm"
            title="Delete template completely"
            aria-label="Delete template completely"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-[#b8922a] flex items-center justify-center shadow-lg shadow-gold/20">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-slate-900">Templates Manager</h1>
            <p className="text-sm text-slate-500 font-ui tracking-wide">Manage legal petitions, agreements, and notices</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTemplates}
            disabled={loading}
            className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-gold hover:shadow-sm rounded-xl transition-all shadow-sm"
            aria-label="Refresh templates"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => { setEditingTemplate({ isFree: false, language: 'English', category: 'Petition' }); setIsEditorOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-ui font-bold rounded-xl shadow-lg hover:bg-slate-800 active:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5" /> New Template
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={templates}
        loading={loading}
        keyField="id"
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={(row) => { setEditingTemplate(row); setIsEditorOpen(true); }}
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
              className="relative w-full max-w-xl bg-white border-l border-slate-200 shadow-2xl overflow-y-auto"
            >
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSave(editingTemplate || {}); }}
                className="flex flex-col min-h-screen"
              >
                <div className="sticky top-0 z-20 px-8 py-6 bg-white border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-xl text-slate-900">{editingTemplate?.id ? 'Edit Template' : 'New Legal Draft'}</h2>
                    <p className="text-[10px] text-gold uppercase tracking-[0.2em] font-black mt-1">Template Configuration</p>
                  </div>
                  <button type="button" onClick={() => setIsEditorOpen(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-all" aria-label="Close editor">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-8 space-y-8 pb-32">
                  <div className="space-y-4">
                    <label className="input-label">Draft Title</label>
                    <input 
                      type="text" required
                      value={editingTemplate?.title || ''}
                      onChange={e => setEditingTemplate(v => ({ ...v, title: e.target.value }))}
                      className="admin-input" 
                      placeholder="e.g. Rent Agreement for Residential Property"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="template-category" className="input-label">Main Category</label>
                      <select 
                        id="template-category"
                        value={editingTemplate?.category}
                        onChange={e => setEditingTemplate(v => ({ ...v, category: e.target.value as any }))}
                        className="admin-input"
                        aria-label="Template Category"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="template-language" className="input-label">Language</label>
                      <select 
                        id="template-language"
                        value={editingTemplate?.language}
                        onChange={e => setEditingTemplate(v => ({ ...v, language: e.target.value as any }))}
                        className="admin-input"
                      >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Both">Both Languages</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-slate-900 font-ui text-[10px] uppercase tracking-[0.2em] font-black">Monetization</h3>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={editingTemplate?.isFree} 
                          onChange={e => setEditingTemplate(v => ({ ...v, isFree: e.target.checked }))}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        <span className="ms-3 text-[10px] font-bold text-slate-400 uppercase">Mark as Free</span>
                      </label>
                    </div>

                    {!editingTemplate?.isFree && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        <label htmlFor="template-price" className="input-label text-gold/60">Sale Price (₹)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/30" />
                          <input 
                            id="template-price"
                            type="number" required
                            value={editingTemplate?.price || ''}
                            onChange={e => setEditingTemplate(v => ({ ...v, price: Number(e.target.value) }))}
                            className="admin-input pl-10 border-gold/20" 
                            aria-label="Template Price"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-black">Asset Management</h3>

                    {/* Hidden file inputs */}
                    <input
                      ref={pdfInputRef} type="file" accept=".pdf,application/pdf" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload('pdf', f); e.target.value = ''; }}
                    />
                    <input
                      ref={docxInputRef} type="file"
                      accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload('docx', f); e.target.value = ''; }}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      {/* PDF upload */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center gap-3">
                        {editingTemplate?.pdfKey
                          ? <CheckCircle className="w-5 h-5 text-green-500" />
                          : <FileText className="w-5 h-5 text-red-400" />}
                        <span className="text-xs text-slate-900 font-medium">PDF File</span>
                        {uploadProgress.pdf !== null ? (
                          <div className="w-full bg-slate-200 rounded-full h-1.5">
                            <div className="bg-red-400 h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress.pdf}%` }} />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => pdfInputRef.current?.click()}
                            className="flex items-center gap-1 text-[10px] text-red-500 font-bold uppercase hover:text-red-600 transition-colors"
                          >
                            <Upload className="w-3 h-3" />
                            {editingTemplate?.pdfKey ? 'Replace' : 'Upload PDF'}
                          </button>
                        )}
                        {editingTemplate?.pdfKey && (
                          <p className="text-[9px] text-slate-400 truncate max-w-full">{editingTemplate.pdfKey}</p>
                        )}
                      </div>

                      {/* DOCX upload */}
                      <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex flex-col items-center gap-3">
                        {editingTemplate?.docxKey
                          ? <CheckCircle className="w-5 h-5 text-green-500" />
                          : <FileCode className="w-5 h-5 text-blue-500" />}
                        <span className="text-xs text-slate-900 font-medium">Word (.docx)</span>
                        {uploadProgress.docx !== null ? (
                          <div className="w-full bg-slate-200 rounded-full h-1.5">
                            <div className="bg-blue-400 h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress.docx}%` }} />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => docxInputRef.current?.click()}
                            className="flex items-center gap-1 text-[10px] text-blue-600 font-bold uppercase hover:text-blue-700 transition-colors"
                          >
                            <Upload className="w-3 h-3" />
                            {editingTemplate?.docxKey ? 'Replace' : 'Upload Word'}
                          </button>
                        )}
                        {editingTemplate?.docxKey && (
                          <p className="text-[9px] text-slate-400 truncate max-w-full">{editingTemplate.docxKey}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 z-20 px-8 py-6 bg-white border-t border-slate-200 flex items-center justify-end gap-4 shadow-[0_-12px_40px_rgba(0,0,0,0.05)]">
                  <button type="button" onClick={() => setIsEditorOpen(false)} className="text-sm font-ui text-slate-400 hover:text-slate-900">Discard</button>
                  <button type="submit" disabled={loading} className="px-10 py-3.5 bg-slate-900 text-white font-ui font-black rounded-xl shadow-lg hover:bg-slate-800 active:scale-[1.02] flex items-center gap-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Template
                  </button>
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
      `}</style>
    </div>
  );
}
