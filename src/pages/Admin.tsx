import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Upload, FileText, Trash2, Plus, Loader2,
  CheckCircle, AlertCircle, FolderOpen, ChevronDown,
  BarChart3, BookOpen, RefreshCw, X, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || 'adityakuwad2003@gmail.com')
  .split(',')
  .map((e: string) => e.trim().toLowerCase());

interface FileEntry { name: string; key: string; }
interface NoteRecord {
  id: string; title: string; slug: string; category: string;
  fileKeys: FileEntry[]; price: number; totalPages: number;
  isNew: boolean; isFeatured: boolean;
  createdAt: string | null; updatedAt: string | null;
}
interface UploadFile { file: File; name: string; progress: number; status: 'pending' | 'uploading' | 'done' | 'error'; key: string; error?: string; }

const CATEGORIES = [
  'Criminal Law', 'Civil Procedure', 'Constitutional Law', 'Corporate',
  'Evidence', 'Family Law', 'International Law', 'Jurisprudence',
  'Property Law', 'Taxation', 'Contract Law', 'Torts', 'Administrative Law', 'Other',
];

export function Admin() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [selectedNote, setSelectedNote] = useState<NoteRecord | null>(null);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // New note form
  const [noteId, setNoteId] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState(CATEGORIES[0]);
  const [notePrice, setNotePrice] = useState('');
  const [noteSubjectCode, setNoteSubjectCode] = useState('');

  const isAdmin = ADMIN_EMAILS.includes((currentUser?.email || '').toLowerCase());

  // Redirect non-admins
  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    if (!isAdmin) { navigate('/'); toast.error('Access denied.'); }
  }, [currentUser, isAdmin, navigate]);

  const getToken = async () => {
    if (!currentUser) throw new Error('Not authenticated');
    return currentUser.getIdToken(true);
  };

  const fetchNotes = useCallback(async () => {
    setIsLoadingNotes(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/list-notes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const data = await res.json();
      setNotes(data.notes);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load notes.');
    } finally {
      setIsLoadingNotes(false);
    }
  }, [currentUser]);

  useEffect(() => { if (isAdmin) fetchNotes(); }, [isAdmin, fetchNotes]);

  const addFiles = (incoming: FileList | File[]) => {
    const newFiles: UploadFile[] = Array.from(incoming)
      .filter(f => f.type === 'application/pdf')
      .map(f => ({
        file: f,
        name: f.name.replace('.pdf', '').replace(/[^a-zA-Z0-9\-_ ]/g, '').trim(),
        progress: 0,
        status: 'pending',
        key: '',
      }));
    if (newFiles.length === 0) { toast.error('Only PDF files are allowed.'); return; }
    setUploadFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const uploadSingleFile = async (uploadFile: UploadFile, index: number, token: string, targetNoteId: string) => {
    const fileName = uploadFile.name.replace(/\s+/g, '-').toLowerCase();
    const key = `notes/${targetNoteId}/${fileName}.pdf`;

    setUploadFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'uploading', key } : f));

    try {
      // Step 1: Get presigned PUT URL from our backend
      const urlRes = await fetch('/api/admin/get-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fileName: key, noteId: targetNoteId, fileSize: uploadFile.file.size }),
      });
      if (!urlRes.ok) throw new Error((await urlRes.json()).error || 'Failed to get upload URL');
      const { uploadUrl } = await urlRes.json();

      // Step 2: PUT file directly to Cloudflare R2
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/pdf' },
        body: uploadFile.file,
      });
      if (!uploadRes.ok) throw new Error('Upload to storage failed. Check R2 CORS settings.');

      setUploadFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'done', progress: 100, key } : f));
      return { name: uploadFile.name, key };
    } catch (err: any) {
      setUploadFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'error', error: err.message } : f));
      return null;
    }
  };

  const handleUpload = async () => {
    const targetNoteId = (selectedNote?.id || noteId).trim();
    if (!targetNoteId) { toast.error('Please select a note or enter a Note ID.'); return; }
    if (uploadFiles.length === 0) { toast.error('Please add at least one PDF file.'); return; }
    if (!selectedNote && !noteTitle) { toast.error('Please enter a title for the new note.'); return; }

    setIsUploading(true);
    try {
      const token = await getToken();
      const results = await Promise.all(
        uploadFiles.map((f, i) => uploadSingleFile(f, i, token, targetNoteId))
      );
      const uploaded = results.filter(Boolean) as { name: string; key: string }[];

      if (uploaded.length === 0) {
        toast.error('All uploads failed. Check your R2 configuration.');
        return;
      }

      // Save metadata to Firestore
      const saveBody: Record<string, unknown> = {
        noteId: targetNoteId,
        files: uploaded,
      };
      if (!selectedNote) {
        saveBody.title = noteTitle;
        saveBody.category = noteCategory;
        saveBody.price = Number(notePrice) || 0;
        saveBody.subjectCode = noteSubjectCode;
        saveBody.slug = targetNoteId;
        saveBody.isNew = true;
        saveBody.isFeatured = false;
      }

      const saveRes = await fetch('/api/admin/save-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(saveBody),
      });
      if (!saveRes.ok) throw new Error((await saveRes.json()).error);

      toast.success(`${uploaded.length} file(s) uploaded successfully!`);
      setUploadFiles([]);
      setNoteId(''); setNoteTitle(''); setNotePrice(''); setNoteSubjectCode('');
      fetchNotes();
    } catch (err: any) {
      toast.error(err.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (noteId: string, fileKey: string) => {
    if (!confirm('Remove this file from the note? (The file stays in storage.)')) return;
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/delete-file', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ noteId, fileKey }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('File removed from note.');
      fetchNotes();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove file.');
    }
  };

  if (!currentUser || !isAdmin) {
    return (
      <div className="pt-24 min-h-screen bg-parchment flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-ink via-[#1a0a0f] to-[#2d1020]">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="section-container py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-[#b8922a] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-ink" />
            </div>
            <div>
              <h1 className="font-display text-xl text-parchment">Admin Dashboard</h1>
              <p className="text-xs text-parchment/50">{currentUser.email}</p>
            </div>
          </div>
          <Link to="/" className="flex items-center gap-2 text-parchment/60 hover:text-parchment transition-colors text-sm font-ui">
            <ArrowLeft className="w-4 h-4" /> Back to Site
          </Link>
        </div>
      </div>

      <div className="section-container py-8 grid lg:grid-cols-2 gap-8">
        {/* ── LEFT: Upload Panel ── */}
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <h2 className="font-display text-lg text-parchment mb-5 flex items-center gap-2">
              <Upload className="w-5 h-5 text-gold" /> Upload Documents
            </h2>

            {/* Note Selection */}
            <div className="mb-5">
              <label className="block text-xs font-ui font-medium text-parchment/60 uppercase tracking-wider mb-2">
                Add to Existing Note
              </label>
              <div className="relative">
                <select
                  value={selectedNote?.id || ''}
                  onChange={e => {
                    const found = notes.find(n => n.id === e.target.value) || null;
                    setSelectedNote(found);
                    if (found) { setNoteId(''); setNoteTitle(''); }
                  }}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-parchment font-ui text-sm appearance-none focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30"
                  title="Select existing note"
                >
                  <option value="">— Create new note —</option>
                  {notes.map(n => (
                    <option key={n.id} value={n.id} className="bg-ink">{n.title || n.id}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment/40 pointer-events-none" />
              </div>
            </div>

            {/* New Note Fields (only when no existing note selected) */}
            <AnimatePresence>
              {!selectedNote && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 mb-5 overflow-hidden">
                  <div>
                    <label className="block text-xs font-ui text-parchment/60 mb-1">Note ID (slug) *</label>
                    <input type="text" value={noteId} onChange={e => setNoteId(e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, '-'))}
                      placeholder="e.g. bns-complete-notes" maxLength={128}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-parchment font-ui text-sm focus:outline-none focus:border-gold/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-ui text-parchment/60 mb-1">Note Title *</label>
                    <input type="text" value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder="BNS Complete Notes"
                      maxLength={512} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-parchment font-ui text-sm focus:outline-none focus:border-gold/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-ui text-parchment/60 mb-1">Category</label>
                      <select value={noteCategory} onChange={e => setNoteCategory(e.target.value)} title="Category"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-3 text-parchment font-ui text-sm appearance-none focus:outline-none focus:border-gold/50">
                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-ink">{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-ui text-parchment/60 mb-1">Price (₹)</label>
                      <input type="number" value={notePrice} onChange={e => setNotePrice(e.target.value)} min={0} max={99999}
                        placeholder="299" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-parchment font-ui text-sm focus:outline-none focus:border-gold/50"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Drag & Drop Zone */}
            <div
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all text-center mb-4 ${
                isDragging ? 'border-gold bg-gold/10' : 'border-white/20 hover:border-white/40 hover:bg-white/5'
              }`}
            >
              <FolderOpen className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-gold' : 'text-parchment/30'}`} />
              <p className="text-parchment/60 font-ui text-sm">
                {isDragging ? 'Drop your PDFs here' : 'Drag & drop PDFs here, or click to browse'}
              </p>
              <p className="text-parchment/30 text-xs mt-1">Max 50 MB per file · PDF only</p>
            </div>
            <input ref={fileInputRef} type="file" accept="application/pdf" multiple className="hidden"
              onChange={e => e.target.files && addFiles(e.target.files)} />

            {/* File Queue */}
            {uploadFiles.length > 0 && (
              <div className="space-y-2 mb-5">
                {uploadFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                    <FileText className="w-4 h-4 text-gold flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-parchment text-xs font-ui truncate">{f.file.name}</p>
                      {f.status === 'uploading' && (
                        <div className="w-full bg-white/10 rounded-full h-1 mt-1">
                          <div className="bg-gold h-1 rounded-full transition-all" style={{ width: `${f.progress}%` }} />
                        </div>
                      )}
                      {f.status === 'error' && <p className="text-red-400 text-xs">{f.error}</p>}
                    </div>
                    <div className="flex-shrink-0">
                      {f.status === 'done' && <CheckCircle className="w-4 h-4 text-green-400" />}
                      {f.status === 'uploading' && <Loader2 className="w-4 h-4 text-gold animate-spin" />}
                      {f.status === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
                      {f.status === 'pending' && (
                        <button onClick={() => setUploadFiles(prev => prev.filter((_, idx) => idx !== i))} title="Remove">
                          <X className="w-4 h-4 text-parchment/40 hover:text-red-400 transition-colors" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={isUploading || uploadFiles.length === 0}
              className="w-full py-3.5 bg-gradient-to-r from-gold to-[#b8922a] text-ink font-ui font-semibold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="w-4 h-4" /> Upload {uploadFiles.length || ''} File{uploadFiles.length !== 1 ? 's' : ''}</>
              )}
            </button>
          </div>
        </div>

        {/* ── RIGHT: Notes Library ── */}
        <div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg text-parchment flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-gold" /> Note Library
              </h2>
              <button onClick={fetchNotes} title="Refresh" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <RefreshCw className="w-4 h-4 text-parchment/40" />
              </button>
            </div>

            {isLoadingNotes ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-parchment/20 mx-auto mb-3" />
                <p className="text-parchment/40 font-ui">No notes yet. Upload your first PDF!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                {notes.map(note => (
                  <div key={note.id}
                    className={`rounded-xl border transition-all cursor-pointer p-4 ${
                      selectedNote?.id === note.id
                        ? 'border-gold/50 bg-gold/10'
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                    }`}
                    onClick={() => setSelectedNote(selectedNote?.id === note.id ? null : note)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-ui font-semibold text-parchment text-sm truncate">
                          {note.title || note.id}
                        </p>
                        <p className="text-xs text-parchment/40 mt-0.5">{note.category} · ₹{note.price}</p>
                      </div>
                      <span className="flex-shrink-0 text-xs font-ui px-2 py-0.5 rounded-full bg-white/10 text-parchment/60">
                        {note.fileKeys?.length || 0} file{(note.fileKeys?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* File list */}
                    <AnimatePresence>
                      {selectedNote?.id === note.id && note.fileKeys?.length > 0 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="mt-3 space-y-1.5 border-t border-white/10 pt-3 overflow-hidden">
                          {note.fileKeys.map((file, fi) => (
                            <div key={fi} className="flex items-center gap-2 text-xs">
                              <FileText className="w-3 h-3 text-gold flex-shrink-0" />
                              <span className="flex-1 text-parchment/60 truncate">{file.name}</span>
                              <span className="text-parchment/30 truncate max-w-[120px] font-mono">{file.key}</span>
                              <button
                                onClick={e => { e.stopPropagation(); handleDeleteFile(note.id, file.key); }}
                                title="Remove file"
                                className="p-1 hover:bg-red-500/20 rounded transition-colors"
                              >
                                <Trash2 className="w-3 h-3 text-red-400/60 hover:text-red-400" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={e => { e.stopPropagation(); setSelectedNote(note); fileInputRef.current?.click(); }}
                            className="flex items-center gap-1.5 text-xs text-gold/70 hover:text-gold transition-colors mt-2"
                          >
                            <Plus className="w-3 h-3" /> Add more files
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
