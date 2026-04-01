import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Edit, Eye,
  Star, X, Save,
  Loader2, BookOpen,
  FileText, Upload, CheckCircle, AlertCircle,
  RefreshCw, Trash2, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { auth } from '../../../lib/firebase';
import { DataTable } from '../../../components/admin/DataTable';
import type { Column } from '../../../components/admin/DataTable';
import { RichTextEditor } from '../../../components/admin/RichTextEditor';

// ── Types ────────────────────────────────────────────────────────────────────

interface FileEntry { name: string; key: string; }

interface Note {
  id: string;
  title: string;
  slug: string;
  category: string;
  price: number;
  fileKey: string;
  fileKeys: FileEntry[];
  totalPages: number;
  isNew: boolean;
  isFeatured: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

interface NoteForm {
  title: string;
  category: string;
  price: number | string;
  description: string;
  isFeatured: boolean;
  isNew: boolean;
  language: string;
}

interface QueuedFile {
  file: File;
  displayName: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  key: string;
  errorMsg?: string;
}

const CATEGORIES = [
  'Criminal Law', 'Civil Procedure', 'Constitutional Law', 'Corporate',
  'Evidence', 'Family Law', 'International Law', 'Jurisprudence',
  'Property Law', 'Taxation', 'Contract Law', 'Torts', 'Administrative Law', 'Other',
];

const BLANK_FORM: NoteForm = {
  title: '',
  category: '',
  price: '',
  description: '',
  isFeatured: false,
  isNew: true,
  language: 'English',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getBearerToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function NotesManager() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // null = create new
  const [form, setForm] = useState<NoteForm>(BLANK_FORM);
  const [saving, setSaving] = useState(false);

  // PDF upload queue
  const [fileQueue, setFileQueue] = useState<QueuedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview image upload
  const [previewFile, setPreviewFile]       = useState<File | null>(null);
  const [previewStatus, setPreviewStatus]   = useState<'idle'|'uploading'|'done'|'error'>('idle');
  const [previewImageKey, setPreviewImageKey] = useState<string>('');
  const [previewThumb, setPreviewThumb]     = useState<string>('');
  const previewInputRef = useRef<HTMLInputElement>(null);

  // Confirm delete state
  const [deletingKey, setDeletingKey] = useState<{ noteId: string; key: string } | null>(null);

  // ── Data loading ─────────────────────────────────────────────────────────

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getBearerToken();
      const res = await fetch('/api/admin/list-notes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Server error' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setNotes(data.notes ?? []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  // ── Open editor ───────────────────────────────────────────────────────────

  const resetPreview = () => {
    setPreviewFile(null);
    setPreviewStatus('idle');
    setPreviewImageKey('');
    setPreviewThumb('');
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(BLANK_FORM);
    setFileQueue([]);
    resetPreview();
    setIsEditorOpen(true);
  };

  const openEdit = (note: Note) => {
    setEditingId(note.id as string);
    setForm({
      title: note.title,
      category: note.category,
      price: note.price,
      description: '',
      isFeatured: note.isFeatured,
      isNew: note.isNew,
      language: 'English',
    });
    setFileQueue([]);
    resetPreview();
    // Show existing preview key
    if ((note as any).previewImageKey) {
      setPreviewImageKey((note as any).previewImageKey);
    }
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setFileQueue([]);
    resetPreview();
  };

  // ── Preview image selection & upload ──────────────────────────────────────

  const selectPreviewFile = (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please select a JPG or PNG image.'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Preview image must be under 5 MB.'); return; }
    setPreviewFile(file);
    setPreviewStatus('idle');
    setPreviewThumb(URL.createObjectURL(file));
  };

  const uploadPreviewImage = async (noteId: string, token: string): Promise<string> => {
    if (!previewFile) return previewImageKey; // already uploaded or none
    setPreviewStatus('uploading');
    const ext  = previewFile.name.endsWith('.png') ? 'png' : 'jpg';
    const key  = `previews/${noteId}.${ext}`;
    try {
      const urlRes = await fetch('/api/admin/get-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fileName: key, fileSize: previewFile.size }),
      });
      if (!urlRes.ok) throw new Error((await urlRes.json()).error || 'URL error');
      const { uploadUrl } = await urlRes.json();
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': previewFile.type },
        body: previewFile,
      });
      if (!putRes.ok) throw new Error(`R2 upload failed (${putRes.status})`);
      setPreviewStatus('done');
      setPreviewImageKey(key);
      return key;
    } catch (err: any) {
      setPreviewStatus('error');
      throw err;
    }
  };

  // ── File selection ────────────────────────────────────────────────────────

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const pdfs = Array.from(fileList).filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    if (pdfs.length === 0) { toast.error('Please select PDF files only.'); return; }
    const newEntries: QueuedFile[] = pdfs.map(f => ({
      file: f,
      displayName: f.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' '),
      status: 'pending',
      key: '',
    }));
    setFileQueue(prev => [...prev, ...newEntries]);
  };

  const removeQueued = (index: number) => {
    setFileQueue(prev => prev.filter((_, i) => i !== index));
  };

  // ── Upload a single file to R2 via presigned URL ──────────────────────────

  const uploadOneFile = async (
    index: number,
    noteId: string,
    token: string,
  ): Promise<FileEntry | null> => {
    const item = fileQueue[index];
    if (!item || item.status === 'done') {
      return item?.key ? { name: item.displayName, key: item.key } : null;
    }

    setFileQueue(prev =>
      prev.map((f, i) => i === index ? { ...f, status: 'uploading' } : f),
    );

    try {
      // Build a safe key: notes/<noteId>/<sanitised-filename>.pdf
      const safeName = item.file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileKey = `notes/${noteId}/${safeName}`;

      // Step 1 — get presigned PUT URL from the admin API
      const urlRes = await fetch('/api/admin/get-upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileName: fileKey, noteId, fileSize: item.file.size }),
      });

      if (!urlRes.ok) {
        const err = await urlRes.json().catch(() => ({ error: 'Server error' }));
        throw new Error(err.error || `Upload URL error ${urlRes.status}`);
      }

      const { uploadUrl, key } = await urlRes.json();

      // Step 2 — PUT directly to Cloudflare R2
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/pdf' },
        body: item.file,
      });

      if (!putRes.ok) throw new Error(`R2 upload failed (${putRes.status})`);

      setFileQueue(prev =>
        prev.map((f, i) =>
          i === index ? { ...f, status: 'done', key } : f,
        ),
      );

      return { name: item.displayName, key };
    } catch (err: any) {
      setFileQueue(prev =>
        prev.map((f, i) =>
          i === index ? { ...f, status: 'error', errorMsg: err.message } : f,
        ),
      );
      throw err;
    }
  };

  // ── Save note (create or update) ──────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.price && form.price !== 0) { toast.error('Price is required'); return; }
    if (!editingId && fileQueue.length === 0) {
      toast.error('Please add at least one PDF file for a new note');
      return;
    }

    setSaving(true);
    try {
      const token = await getBearerToken();
      const noteId = editingId || slugify(form.title);

      // Upload all pending files
      const pendingIndices = fileQueue.map((f, i) => ({ f, i })).filter(({ f }) => f.status === 'pending').map(({ i }) => i);
      const uploadedEntries: FileEntry[] = [];

      for (const idx of pendingIndices) {
        try {
          const entry = await uploadOneFile(idx, noteId, token);
          if (entry) uploadedEntries.push(entry);
        } catch (err: any) {
          toast.error(`Failed to upload "${fileQueue[idx].file.name}": ${err.message}`);
          setSaving(false);
          return;
        }
      }

      // Include already-uploaded (done) files from previous attempts
      const alreadyDone = fileQueue
        .filter(f => f.status === 'done' && f.key)
        .filter(f => !uploadedEntries.find(u => u.key === f.key))
        .map(f => ({ name: f.displayName, key: f.key }));

      const allFiles = [...alreadyDone, ...uploadedEntries];

      // Upload preview image if one was selected
      let savedPreviewKey = previewImageKey;
      if (previewFile) {
        try {
          savedPreviewKey = await uploadPreviewImage(noteId, token);
        } catch (err: any) {
          toast.error(`Preview image upload failed: ${err.message}`);
          setSaving(false);
          return;
        }
      }

      // Save note metadata to Firestore via admin API
      const payload: Record<string, unknown> = {
        noteId,
        title: form.title.trim(),
        category: form.category,
        price: Number(form.price) || 0,
        description: form.description,
        language: form.language,
        isFeatured: form.isFeatured,
        isNew: form.isNew,
        slug: noteId,
        files: allFiles,
        isUpdateOnly: editingId !== null && allFiles.length === 0,
        ...(savedPreviewKey ? { previewImageKey: savedPreviewKey } : {}),
      };

      const saveRes = await fetch('/api/admin/save-note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!saveRes.ok) {
        const err = await saveRes.json().catch(() => ({ error: 'Server error' }));
        throw new Error(err.error || `Save error ${saveRes.status}`);
      }

      toast.success(editingId ? 'Note updated successfully!' : 'Note created and files uploaded!');
      closeEditor();
      fetchNotes();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete a file from a note ─────────────────────────────────────────────

  const confirmDeleteFile = async () => {
    if (!deletingKey) return;
    try {
      const token = await getBearerToken();
      const res = await fetch('/api/admin/delete-file', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(deletingKey),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Server error' }));
        throw new Error(err.error || `Delete error ${res.status}`);
      }
      toast.success('File removed from note');
      setDeletingKey(null);
      fetchNotes();
    } catch (err: any) {
      toast.error(err.message || 'Could not delete file');
    }
  };

  // ── Table columns ─────────────────────────────────────────────────────────

  const columns: Column<Note>[] = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (row) => (
        <div className="max-w-xs">
          <p className="font-bold text-slate-900 truncate">{row.title}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">{row.slug}</p>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => (
        <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs">
          {row.category || '—'}
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (row) => <span className="font-mono text-gold font-bold">₹{row.price}</span>,
    },
    {
      key: 'files',
      label: 'Files',
      render: (row) => {
        const count = row.fileKeys?.length || (row.fileKey ? 1 : 0);
        return (
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">{count} file{count !== 1 ? 's' : ''}</span>
          </div>
        );
      },
    },
    {
      key: 'badges',
      label: 'Tags',
      render: (row) => (
        <div className="flex gap-1.5 flex-wrap">
          {row.isFeatured && (
            <span className="px-1.5 py-0.5 rounded-md bg-gold/10 text-gold text-[9px] font-black uppercase tracking-widest">
              Featured
            </span>
          )}
          {row.isNew && (
            <span className="px-1.5 py-0.5 rounded-md bg-burgundy/20 text-burgundy text-[9px] font-black uppercase tracking-widest">
              New
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: '',
      className: 'w-24',
      render: (row) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); openEdit(row); }}
            className="p-2 hover:bg-gold/10 text-slate-400 hover:text-gold rounded-lg transition-all"
            title="Edit note"
            aria-label="Edit note"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); window.open(`/notes/${row.slug}`, '_blank'); }}
            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-lg transition-all"
            title="Preview on store"
            aria-label="Preview on store"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 border border-slate-200 p-6 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-[#b8922a] flex items-center justify-center shadow-lg shadow-gold/20">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-slate-900">Notes Manager</h1>
            <p className="text-sm text-slate-500 font-ui tracking-wide">
              {loading ? 'Loading catalog...' : `${notes.length} notes in catalog`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchNotes}
            disabled={loading}
            className="p-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-400 hover:text-gold transition-all"
            title="Refresh"
            aria-label="Refresh notes"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-ui font-bold rounded-xl shadow-xl shadow-slate-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5" /> Upload New Note
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <DataTable
        columns={columns}
        data={notes}
        loading={loading}
        keyField="id"
        totalCount={notes.length}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={(row) => openEdit(row)}
        emptyMessage="No notes yet. Click 'Upload New Note' to add your first PDF."
        searchPlaceholder="Search notes by title or slug..."
      />

      {/* ── Delete confirm modal ── */}
      <AnimatePresence>
        {deletingKey && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeletingKey(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white border border-slate-200 rounded-3xl p-8 max-w-sm w-full shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="font-display text-lg text-slate-900 text-center mb-2">Remove File?</h3>
              <p className="text-sm text-slate-500 text-center mb-6">
                This removes the file from the note's download list. The actual file in storage is kept.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingKey(null)}
                  className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-500 font-ui text-sm transition-all border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteFile}
                  className="flex-1 py-3 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-xl font-ui text-sm font-bold transition-all"
                >
                  Remove File
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Editor slide-over ── */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeEditor}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full max-w-2xl bg-white border-l border-slate-200 shadow-2xl overflow-y-auto"
            >
              <form onSubmit={handleSave} className="flex flex-col min-h-screen">
                {/* Sticky header */}
                <div className="sticky top-0 z-20 px-8 py-6 bg-white border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-xl text-slate-900">
                      {editingId ? 'Edit Note' : 'Upload New Note'}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">
                      Catalog Management
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeEditor}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-all"
                    aria-label="Close editor"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-8 space-y-10 pb-36">
                  {/* ── Basic Info ── */}
                  <section className="space-y-6">
                    <h3 className="text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-black">
                      Basic Information
                    </h3>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="col-span-2">
                        <label htmlFor="note-title" className="input-label">Document Title *</label>
                        <input
                          id="note-title"
                          type="text"
                          required
                          value={form.title}
                          onChange={e => setForm(v => ({ ...v, title: e.target.value }))}
                          className="admin-input"
                          placeholder="e.g. BNSS Volume 1 — Complete Notes"
                        />
                      </div>

                      <div>
                        <label htmlFor="note-category" className="input-label">Category</label>
                        <select
                          id="note-category"
                          value={form.category}
                          onChange={e => setForm(v => ({ ...v, category: e.target.value }))}
                          className="admin-input"
                          aria-label="Note Category"
                        >
                          <option value="">Select Category</option>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="note-price" className="input-label">Price (INR) *</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">₹</span>
                          <input
                            id="note-price"
                            type="number"
                            required
                            min="0"
                            value={form.price}
                            onChange={e => setForm(v => ({ ...v, price: e.target.value }))}
                            className="admin-input pl-9"
                            placeholder="299"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="note-language" className="input-label">Language</label>
                        <select
                          id="note-language"
                          value={form.language}
                          onChange={e => setForm(v => ({ ...v, language: e.target.value }))}
                          className="admin-input"
                          aria-label="Note Language"
                        >
                          <option value="English">English</option>
                          <option value="Hindi">Hindi</option>
                          <option value="Both">Both</option>
                        </select>
                      </div>

                      <div className="flex items-end gap-6">
                        <label className="flex items-center gap-2.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={form.isFeatured}
                            onChange={e => setForm(v => ({ ...v, isFeatured: e.target.checked }))}
                            className="w-4 h-4 rounded accent-gold"
                            aria-label="Mark as featured"
                          />
                          <span className="text-sm text-slate-500 group-hover:text-slate-900 font-ui transition-colors flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-gold" /> Featured
                          </span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={form.isNew}
                            onChange={e => setForm(v => ({ ...v, isNew: e.target.checked }))}
                            className="w-4 h-4 rounded accent-gold"
                            aria-label="Mark as new"
                          />
                          <span className="text-sm text-slate-500 group-hover:text-slate-900 font-ui transition-colors">
                            Mark as New
                          </span>
                        </label>
                      </div>
                    </div>
                  </section>

                  {/* ── PDF Upload ── */}
                  <section className="space-y-5">
                    <h3 className="text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-black">
                      PDF Files {!editingId && <span className="text-red-400">*</span>}
                    </h3>

                    {/* Drop zone */}
                    <div
                      className="border-2 border-dashed border-slate-200 hover:border-gold/40 rounded-2xl p-10 text-center cursor-pointer transition-all group"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); }}
                      onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
                    >
                      <Upload className="w-10 h-10 text-slate-200 group-hover:text-gold/50 mx-auto mb-3 transition-colors" />
                      <p className="text-sm text-slate-500 font-ui">
                        Drop PDF files here or{' '}
                        <span className="text-gold underline cursor-pointer">browse files</span>
                      </p>
                      <p className="text-[10px] text-slate-300 mt-1.5 font-ui uppercase tracking-widest">
                        PDF only · max 50 MB per file · multiple files allowed
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        multiple
                        className="hidden"
                        onChange={(e) => addFiles(e.target.files)}
                        aria-label="Upload PDF files"
                      />
                    </div>

                    {/* File list */}
                    {fileQueue.length > 0 && (
                      <div className="space-y-2">
                        {fileQueue.map((item, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                              item.status === 'done'
                                ? 'bg-green-50 border-green-200'
                                : item.status === 'error'
                                ? 'bg-red-50 border-red-200'
                                : item.status === 'uploading'
                                ? 'bg-gold/5 border-gold/20 animate-pulse'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-900 truncate font-ui">{item.file.name}</p>
                              <p className="text-[10px] text-slate-400 font-ui">
                                {(item.file.size / 1024 / 1024).toFixed(1)} MB
                                {item.status === 'uploading' && ' · Uploading...'}
                                {item.status === 'done' && ` · Saved as ${item.key}`}
                                {item.status === 'error' && ` · Error: ${item.errorMsg}`}
                              </p>
                            </div>
                            {item.status === 'done' && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
                            {item.status === 'uploading' && <Loader2 className="w-4 h-4 text-gold animate-spin flex-shrink-0" />}
                            {item.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                            {(item.status === 'pending' || item.status === 'error') && (
                              <button
                                type="button"
                                onClick={() => removeQueued(i)}
                                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all flex-shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Show existing files when editing */}
                    {editingId && (() => {
                      const note = notes.find(n => n.id === editingId);
                      const existing = note?.fileKeys?.length
                        ? note.fileKeys
                        : note?.fileKey ? [{ name: note.title, key: note.fileKey }] : [];
                      if (existing.length === 0) return null;
                      return (
                        <div className="space-y-2">
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black ml-1">
                            Currently attached files
                          </p>
                          {existing.map((f, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                              <CheckCircle className="w-4 h-4 text-green-500/60 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-700 truncate font-ui">{f.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono truncate">{f.key}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setDeletingKey({ noteId: editingId, key: f.key })}
                                className="p-1.5 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 transition-all flex-shrink-0"
                                title="Remove this file"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </section>

                  {/* ── Preview Image ── */}
                  <section className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-black">
                        Preview Image
                      </h3>
                      <span className="text-[9px] text-slate-400 font-ui uppercase tracking-widest">
                        Shown to visitors · EduLaw logo watermark auto-applied
                      </span>
                    </div>

                    {/* Show existing or newly selected preview */}
                    {(previewThumb || previewImageKey) && (
                      <div className="relative w-full max-w-xs rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                        {previewThumb ? (
                          <img src={previewThumb} alt="Preview" className="w-full object-cover" />
                        ) : (
                          <div className="p-4 bg-slate-50 flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <div>
                              <p className="text-xs text-slate-700 font-ui font-bold">Preview image uploaded</p>
                              <p className="text-[10px] text-slate-400 font-mono">{previewImageKey}</p>
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={resetPreview}
                          className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow text-slate-400 hover:text-red-500 transition-all"
                          title="Remove preview image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        {previewStatus === 'uploading' && (
                          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-gold animate-spin" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Drop zone */}
                    {!previewThumb && !previewImageKey && (
                      <div
                        className="border-2 border-dashed border-slate-200 hover:border-gold/40 rounded-2xl p-8 text-center cursor-pointer transition-all group"
                        onClick={() => previewInputRef.current?.click()}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) selectPreviewFile(f); }}
                      >
                        <ImageIcon className="w-8 h-8 text-slate-200 group-hover:text-gold/50 mx-auto mb-2 transition-colors" />
                        <p className="text-sm text-slate-500 font-ui">
                          Drop image here or <span className="text-gold underline">browse</span>
                        </p>
                        <p className="text-[10px] text-slate-300 mt-1 font-ui uppercase tracking-widest">
                          JPG or PNG · max 5 MB
                        </p>
                        <input
                          ref={previewInputRef}
                          type="file"
                          accept="image/jpeg,image/png"
                          className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) selectPreviewFile(f); }}
                          aria-label="Upload preview image"
                        />
                      </div>
                    )}
                  </section>

                  {/* ── Description ── */}
                  <section className="space-y-5">
                    <h3 className="text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-black">
                      Public Description
                    </h3>
                    <RichTextEditor
                      value={form.description}
                      onChange={html => setForm(v => ({ ...v, description: html }))}
                    />
                  </section>
                </div>

                {/* Sticky footer */}
                <div className="sticky bottom-0 z-20 px-8 py-5 bg-white border-t border-slate-200 flex items-center justify-end gap-4 shadow-[0_-12px_40px_rgba(0,0,0,0.05)]">
                  <button
                    type="button"
                    onClick={closeEditor}
                    className="px-6 py-3 text-slate-500 hover:text-slate-900 font-ui font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 bg-gold text-ink font-ui font-black rounded-xl shadow-xl shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving
                      ? <><Loader2 className="w-5 h-5 animate-spin" />Saving...</>
                      : <><Save className="w-5 h-5" />{editingId ? 'Update Note' : 'Create & Upload'}</>
                    }
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .admin-input {
          width: 100%;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #0f172a;
          font-family: inherit;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
        }
        .admin-input::placeholder { color: #94a3b8; }
        .admin-input:focus {
          border-color: rgba(201,168,76,0.6);
          box-shadow: 0 0 0 2px rgba(201,168,76,0.12);
        }
        .input-label {
          display: block;
          font-size: 0.625rem;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 0.5rem;
          margin-left: 0.25rem;
        }
      `}</style>
    </div>
  );
}
