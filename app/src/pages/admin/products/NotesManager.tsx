import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Edit, Eye,
  Star, X, Save,
  Loader2, BookOpen,
  FileText, Upload, CheckCircle, AlertCircle,
  RefreshCw, Trash2, Image as ImageIcon, ShieldCheck
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
  samplePdfKey?: string;
  previewImageKey?: string; // Legacy support
  previewImageKeys?: string[]; // Multiple previews
  totalPages: number;
  description?: string;
  isNew: boolean;
  isFeatured: boolean;
  contentFeatures?: string[];
  featuredSections?: { title: string; content: string }[];
  publicDescription?: string;
  language: string; // Ensure language is here
  tableOfContents?: string[];
  audioSummaryKeyEnglish?: string;
  audioSummaryKeyHindi?: string;
  infographicKey?: string;
  quizData?: string;
  createdAt: string | null;
  updatedAt: string | null;
  hasGst?: boolean;
  gstRate?: number;
}

interface PreviewFile {
  id: string;
  file?: File;
  key?: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  url: string;
}

interface NoteForm {
  title: string;
  category: string;
  price: number | string;
  description: string;
  publicDescription: string;
  isFeatured: boolean;
  isNew: boolean;
  language: string;
  contentFeatures: string[];
  featuredSections: { title: string; content: string }[];
  tableOfContents: string[];
  audioSummaryKeyEnglish: string;
  audioSummaryKeyHindi: string;
  infographicKey: string;
  quizData: string;
  previewImageKeys: string[];
  totalPages: number | string;
  hasGst: boolean;
  gstRate: number;
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
  publicDescription: '',
  isFeatured: false,
  isNew: true,
  language: 'English',
  contentFeatures: [],
  featuredSections: [],
  tableOfContents: [],
  audioSummaryKeyEnglish: '',
  audioSummaryKeyHindi: '',
  infographicKey: '',
  quizData: '',
  previewImageKeys: [],
  totalPages: '',
  hasGst: true,
  gstRate: 18,
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

  // Preview images (Multi-upload)
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([]);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const previewInputRef = useRef<HTMLInputElement>(null);

  // Sample PDF upload (low-res preview pdf)
  const [sampleFile, setSampleFile]       = useState<File | null>(null);
  const [sampleStatus, setSampleStatus]   = useState<'idle'|'uploading'|'done'|'error'>('idle');
  const [samplePdfKey, setSamplePdfKey]   = useState<string>('');
  const [sampleThumb, setSampleThumb]     = useState<string>('');
  const sampleInputRef = useRef<HTMLInputElement>(null);

  // Mastery content uploads
  const [audioEnFile, setAudioEnFile]     = useState<File | null>(null);
  const [audioEnStatus, setAudioEnStatus] = useState<'idle'|'uploading'|'done'|'error'>('idle');
  const [audioHiFile, setAudioHiFile]     = useState<File | null>(null);
  const [audioHiStatus, setAudioHiStatus] = useState<'idle'|'uploading'|'done'|'error'>('idle');
  const [infoFile, setInfoFile]           = useState<File | null>(null);
  const [infoStatus, setInfoStatus]       = useState<'idle'|'uploading'|'done'|'error'>('idle');
  const audioEnInputRef = useRef<HTMLInputElement>(null);
  const audioHiInputRef = useRef<HTMLInputElement>(null);
  const infoInputRef = useRef<HTMLInputElement>(null);

  // Confirm delete state
  const [deletingKey, setDeletingKey] = useState<{ noteId: string; key: string } | null>(null);

  // ── Data loading ─────────────────────────────────────────────────────────

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getBearerToken();
      const res = await fetch('/api/admin/list-data?type=notes', {
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
    setPreviewFiles([]);
    if (previewInputRef.current) previewInputRef.current.value = '';
  };

  const resetSample = () => {
    setSampleFile(null);
    setSampleStatus('idle');
    setSamplePdfKey('');
    setSampleThumb('');
  };

  const resetMasteryState = () => {
    setAudioEnFile(null); setAudioEnStatus('idle');
    setAudioHiFile(null); setAudioHiStatus('idle');
    setInfoFile(null); setInfoStatus('idle');
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(BLANK_FORM);
    setFileQueue([]);
    resetPreview();
    resetSample();
    resetMasteryState();
    setIsEditorOpen(true);
  };

  const openEdit = (note: Note) => {
    setEditingId(note.id as string);
    setForm({
      title: note.title,
      category: note.category,
      price: note.price,
      description: note.description || '', 
      publicDescription: note.publicDescription || '',
      isFeatured: note.isFeatured,
      isNew: note.isNew,
      language: (note as any).language || 'English',
      contentFeatures: note.contentFeatures || [],
      featuredSections: note.featuredSections || [],
      tableOfContents: note.tableOfContents || [],
      audioSummaryKeyEnglish: note.audioSummaryKeyEnglish || '',
      audioSummaryKeyHindi: note.audioSummaryKeyHindi || '',
      infographicKey: note.infographicKey || '',
      quizData: note.quizData || '',
      previewImageKeys: note.previewImageKeys || (note.previewImageKey ? [note.previewImageKey] : []),
      totalPages: note.totalPages || '',
      hasGst: note.hasGst ?? true,
      gstRate: note.gstRate ?? 18,
    });
    setFileQueue([]);
    resetPreview();
    resetSample();

    // Load existing previews into the multi-upload queue
    const existingKeys = note.previewImageKeys || (note.previewImageKey ? [note.previewImageKey] : []);
    if (existingKeys.length > 0) {
      setPreviewFiles(existingKeys.map(key => ({
        id: Math.random().toString(36).substring(7),
        key,
        status: 'done',
        url: `/api/get-download-link?previewKey=${encodeURIComponent(key)}`
      })));
    }

    if (note.samplePdfKey) setSamplePdfKey(note.samplePdfKey);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setFileQueue([]);
    resetPreview();
    resetSample();
    resetMasteryState();
  };

  // ── Preview image selection & upload ──────────────────────────────────────
  // ... (existing selectPreviewFile and uploadPreviewImage) ...

  // ── Sample PDF selection & upload ─────────────────────────────────────────

  const selectSampleFile = (file: File) => {
    if (file.type !== 'application/pdf') { toast.error('Please select a PDF file for the sample.'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Sample PDF must be under 10 MB.'); return; }
    setSampleFile(file);
    setSampleStatus('idle');
    setSampleThumb(file.name);
  };

  const uploadSamplePdf = async (noteId: string, token: string): Promise<string> => {
    if (!sampleFile) return samplePdfKey;
    setSampleStatus('uploading');
    const key = `samples/${noteId}.pdf`;
    try {
      const urlRes = await fetch('/api/admin/get-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fileName: key, noteId, fileSize: sampleFile.size }),
      });
      if (!urlRes.ok) throw new Error((await urlRes.json()).error || 'URL error');
      const { uploadUrl } = await urlRes.json();
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/pdf' },
        body: sampleFile,
      });
      if (!putRes.ok) throw new Error(`R2 upload failed (${putRes.status})`);
      setSampleStatus('done');
      setSamplePdfKey(key);
      return key;
    } catch (err: any) {
      setSampleStatus('error');
      throw err;
    }
  };

  // ── Mastery Content selection & upload ─────────────────────────────────────
  
  const selectAudioEnFile = (file: File) => {
    if (!file.type.startsWith('audio/')) { toast.error('Please select an MP3 file.'); return; }
    if (file.size > 25 * 1024 * 1024) { toast.error('Audio must be under 25 MB.'); return; }
    setAudioEnFile(file);
    setAudioEnStatus('idle');
  };

  const selectAudioHiFile = (file: File) => {
    if (!file.type.startsWith('audio/')) { toast.error('Please select an MP3 file.'); return; }
    if (file.size > 25 * 1024 * 1024) { toast.error('Audio must be under 25 MB.'); return; }
    setAudioHiFile(file);
    setAudioHiStatus('idle');
  };

  const selectInfoFile = (file: File) => {
    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) { toast.error('Please select a PDF or Image file.'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Infographic must be under 10 MB.'); return; }
    setInfoFile(file);
    setInfoStatus('idle');
  };

  const uploadMasteryFile = async (
    file: File | null, 
    noteId: string, 
    token: string, 
    prefix: 'audio' | 'infographics', 
    suffix: string, 
    setStatus: (s: 'idle'|'uploading'|'done'|'error') => void,
    existingKey: string
  ): Promise<string> => {
    if (!file) return existingKey;
    setStatus('uploading');
    const ext = file.name.split('.').pop() || (prefix === 'audio' ? 'mp3' : 'pdf');
    const key = `${prefix}/${noteId}_${suffix}.${ext}`;
    try {
      const urlRes = await fetch('/api/admin/get-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fileName: key, noteId, fileSize: file.size }),
      });
      if (!urlRes.ok) throw new Error((await urlRes.json()).error || 'URL error');
      const { uploadUrl } = await urlRes.json();
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error(`R2 upload failed (${putRes.status})`);
      setStatus('done');
      return key;
    } catch (err: any) {
      setStatus('error');
      throw err;
    }
  };

  const selectPreviewFiles = (files: FileList | null) => {
    if (!files) return;
    setPreviewError(null);

    const newFiles = Array.from(files).filter(f => {
      if (!f.type.startsWith('image/')) { toast.error(`${f.name} is not an image.`); return false; }
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} exceeds 5MB.`); return false; }
      return true;
    });

    if (previewFiles.length + newFiles.length > 10) {
      setPreviewError('Maximum 10 preview images allowed.');
      return;
    }

    const newEntries: PreviewFile[] = newFiles.map(f => ({
      id: Math.random().toString(36).substring(7),
      file: f,
      status: 'pending',
      url: URL.createObjectURL(f),
    }));

    setPreviewFiles(prev => [...prev, ...newEntries]);
  };

  const removePreviewFile = (id: string) => {
    setPreviewFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      const removed = prev.find(f => f.id === id);
      if (removed?.url && removed.url.startsWith('blob:')) {
        URL.revokeObjectURL(removed.url);
      }
      return filtered;
    });
    setPreviewError(null);
  };

  const uploadPreviewImages = async (noteId: string, token: string): Promise<string[]> => {
    const results: string[] = [];
    
    // Create a copy of the queue for processing
    for (let i = 0; i < previewFiles.length; i++) {
      const item = previewFiles[i];
      
      if (item.status === 'done' && item.key) {
        results.push(item.key);
        continue;
      }

      if (!item.file) continue;

      // Update status to uploading in the state
      setPreviewFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'uploading' } : f));

      const ext = (item.file.name.split('.').pop() || 'jpg').toLowerCase().replace('jpeg', 'jpg');
      const key = `previews/${noteId}_${item.id}.${ext}`;

      try {
        const urlRes = await fetch('/api/admin/get-upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ fileName: key, noteId, fileSize: item.file.size }),
        });
        if (!urlRes.ok) throw new Error('Upload URL error');
        const { uploadUrl } = await urlRes.json();
        
        const putRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': item.file.type },
          body: item.file,
        });
        if (!putRes.ok) throw new Error('R2 upload error');

        setPreviewFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'done', key } : f));
        results.push(key);
      } catch (err) {
        setPreviewFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'error' } : f));
        throw err;
      }
    }
    return results;
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

      // Upload preview images (multi-upload)
      let finalPreviewKeys: string[] = [];
      try {
        finalPreviewKeys = await uploadPreviewImages(noteId, token);
      } catch (err: any) {
        toast.error(`Preview image upload failed: ${err.message}`);
        setSaving(false);
        return;
      }

      // Track images to delete (those that were in the original note but are no longer in the final list)
      const initialKeys = editingId ? (notes.find(n => n.id === editingId)?.previewImageKeys || (notes.find(n => n.id === editingId)?.previewImageKey ? [notes.find(n => n.id === editingId)!.previewImageKey!] : [])) : [];
      const imagesToDelete = initialKeys.filter(k => !finalPreviewKeys.includes(k));

      // Upload sample PDF if one was selected
      let savedSampleKey = samplePdfKey;
      if (sampleFile) {
        try {
          savedSampleKey = await uploadSamplePdf(noteId, token);
        } catch (err: any) {
          toast.error(`Sample PDF upload failed: ${err.message}`);
          setSaving(false);
          return;
        }
      }

      // Upload Mastery Content Files
      let savedAudioEnKey = form.audioSummaryKeyEnglish;
      if (audioEnFile) {
        try {
          savedAudioEnKey = await uploadMasteryFile(audioEnFile, noteId, token, 'audio', 'en', setAudioEnStatus, savedAudioEnKey);
        } catch (err: any) { toast.error(`Audio EN upload failed: ${err.message}`); setSaving(false); return; }
      }

      let savedAudioHiKey = form.audioSummaryKeyHindi;
      if (audioHiFile) {
        try {
          savedAudioHiKey = await uploadMasteryFile(audioHiFile, noteId, token, 'audio', 'hi', setAudioHiStatus, savedAudioHiKey);
        } catch (err: any) { toast.error(`Audio HI upload failed: ${err.message}`); setSaving(false); return; }
      }

      let savedInfoKey = form.infographicKey;
      if (infoFile) {
        try {
          savedInfoKey = await uploadMasteryFile(infoFile, noteId, token, 'infographics', 'map', setInfoStatus, savedInfoKey);
        } catch (err: any) { toast.error(`Infographic upload failed: ${err.message}`); setSaving(false); return; }
      }

      // Save note metadata to Firestore via admin API
      const payload: Record<string, unknown> = {
        noteId,
        title: form.title.trim(),
        category: form.category,
        price: Number(form.price) || 0,
        description: form.description,
        publicDescription: form.publicDescription,
        language: form.language,
        isFeatured: form.isFeatured,
        isNew: form.isNew,
        slug: noteId,
        files: allFiles,
        isUpdateOnly: editingId !== null && allFiles.length === 0,
        contentFeatures: form.contentFeatures,
        featuredSections: form.featuredSections,
        tableOfContents: form.tableOfContents,
        previewImageKeys: finalPreviewKeys,
        previewImageKey: finalPreviewKeys[0] || '', // Legacy compatibility
        imagesToDelete, // Flagged for removal
        totalPages: Number(form.totalPages) || 0,
        hasGst: form.hasGst,
        gstRate: Number(form.gstRate) || 0,
        audioSummaryKeyEnglish: savedAudioEnKey,
        audioSummaryKeyHindi: savedAudioHiKey,
        infographicKey: savedInfoKey,
        quizData: form.quizData,
        ...(savedSampleKey ? { samplePdfKey: savedSampleKey } : {}),
        // TODO: Confirm with backend whether to send:
        // (a) newImages + imagesToDelete separately, or
        // (b) full updated images array in one field
        // Current implementation uses option (b) with an additional imagesToDelete flag — adjust if needed
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
      // Auto-ping Google to pick up the new/updated note in sitemap
      fetch('/api/purchases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'ping-google' }) }).catch(() => null);
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

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note completely? This cannot be undone.')) return;
    try {
      const token = await getBearerToken();
      const res = await fetch('/api/admin/delete-product', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: noteId, collectionName: 'notes' }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Server error' }));
        throw new Error(err.error || `Delete error ${res.status}`);
      }
      toast.success('Note deleted successfully');
      fetchNotes();
    } catch (err: any) {
      toast.error(err.message || 'Could not delete note');
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
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); openEdit(row); }}
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-gold/10 hover:text-gold hover:border-gold/30 rounded-lg transition-all shadow-sm"
            title="Edit note"
            aria-label="Edit note"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); window.open(`/notes/${row.slug}`, '_blank'); }}
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-all shadow-sm"
            title="Preview on store"
            aria-label="Preview on store"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteNote(row.id as string); }}
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 rounded-lg transition-all shadow-sm"
            title="Delete note completely"
            aria-label="Delete note completely"
          >
            <Trash2 className="w-4 h-4" />
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
            className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-gold hover:shadow-sm rounded-xl transition-all shadow-sm"
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
                <div className="sticky top-0 z-20 px-4 sm:px-8 py-4 sm:py-6 bg-white border-b border-slate-200 flex items-center justify-between">
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

                <div className="px-4 sm:px-8 py-6 sm:py-8 space-y-10 pb-36">
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

                      <div className="col-span-2">
                        <label htmlFor="note-description" className="input-label">Short Description (Card) *</label>
                        <textarea
                          id="note-description"
                          required
                          rows={2}
                          value={form.description}
                          onChange={e => setForm(v => ({ ...v, description: e.target.value }))}
                          className="admin-input py-3"
                          placeholder="Brief 1-2 sentence description for the marketplace card..."
                        />
                      </div>

                      <div className="col-span-2">
                        <label htmlFor="note-public-description" className="input-label">Content Description (Product Page)</label>
                        <textarea
                          id="note-public-description"
                          rows={4}
                          value={form.publicDescription || ''}
                          onChange={e => setForm(v => ({ ...v, publicDescription: e.target.value }))}
                          className="admin-input py-3"
                          placeholder="Full detailed description shown on the product detail page. Supports basic HTML formatting."
                        />
                        <p className="text-[10px] text-slate-400 mt-1 ml-1 font-ui">Displays under 'Overview &amp; Scope' on the product page</p>
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

                      <div>
                        <label htmlFor="note-total-pages" className="input-label">Total Pages *</label>
                        <input
                          id="note-total-pages"
                          type="number"
                          required
                          min="0"
                          value={form.totalPages}
                          onChange={e => setForm(v => ({ ...v, totalPages: e.target.value }))}
                          className="admin-input"
                          placeholder="0"
                        />
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

                    {/* File list — queued for upload */}
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
                                title="Remove file from queue"
                                aria-label="Remove file from queue"
                                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all flex-shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Currently attached files (edit mode) */}
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
                          {existing.map((f, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
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
                                aria-label="Remove this file"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </section>

                  {/* ── Preview Images (multi-upload, max 10) ── */}
                  <section className="space-y-4">
                    {/* Header row */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-black">
                        Preview Images
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-ui uppercase tracking-widest font-black ${previewFiles.length >= 10 ? 'text-red-400' : 'text-slate-400'}`}>
                          {previewFiles.length} / 10
                        </span>
                        <span className="text-[9px] text-slate-300 font-ui uppercase tracking-widest">
                          JPG · PNG · WEBP · GIF
                        </span>
                      </div>
                    </div>

                    {/* Inline error */}
                    {previewError && (
                      <p className="text-[11px] text-red-500 font-ui bg-red-50 border border-red-100 rounded-xl px-3 py-2 flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {previewError}
                      </p>
                    )}

                    {/* ── Empty drop zone (no images yet) ── */}
                    {previewFiles.length === 0 && (
                      <div
                        className="border-2 border-dashed border-slate-200 hover:border-gold/40 rounded-2xl p-10 text-center cursor-pointer transition-all group"
                        onClick={() => { if (previewInputRef.current) { previewInputRef.current.value = ''; previewInputRef.current.click(); } }}
                        onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={e => { e.preventDefault(); e.stopPropagation(); selectPreviewFiles(e.dataTransfer.files); }}
                      >
                        <ImageIcon className="w-10 h-10 text-slate-200 group-hover:text-gold/50 mx-auto mb-3 transition-colors" />
                        <p className="text-sm text-slate-500 font-ui">
                          Click or drag &amp; drop images here
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1.5 font-ui uppercase tracking-widest">
                          JPG, PNG, WEBP, GIF · max 5 MB each · up to 10 images
                        </p>
                      </div>
                    )}

                    {/* ── Responsive image grid (3 cols mobile → 4 cols desktop) ── */}
                    {previewFiles.length > 0 && (
                      <>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {previewFiles.map((img, idx) => (
                            <div
                              key={img.id}
                              className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                                img.status === 'uploading'
                                  ? 'border-gold/60 animate-pulse'
                                  : img.status === 'error'
                                  ? 'border-red-300 bg-red-50'
                                  : img.status === 'done'
                                  ? 'border-green-200'
                                  : 'border-gold/40'
                              }`}
                              style={{ aspectRatio: '1 / 1' }}
                            >
                              {/* Image — use img element directly; no lazy loading so it appears immediately */}
                              {img.url ? (
                                <img
                                  src={img.url}
                                  alt={`Preview ${idx + 1}`}
                                  className="absolute inset-0 w-full h-full object-cover bg-slate-100"
                                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                  loading="lazy"
                                />
                              ) : (
                                <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                                  <ImageIcon className="w-6 h-6 text-slate-300" />
                                </div>
                              )}

                              {/* Uploading spinner overlay */}
                              {img.status === 'uploading' && (
                                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                  <Loader2 className="w-5 h-5 text-gold animate-spin" />
                                </div>
                              )}

                              {/* Bottom-left badge */}
                              <span className={`absolute bottom-1 left-1 text-[8px] rounded px-1 py-0.5 font-black uppercase leading-tight ${
                                img.status === 'done'
                                  ? 'bg-green-500/90 text-white'
                                  : img.status === 'error'
                                  ? 'bg-red-500/90 text-white'
                                  : img.status === 'uploading'
                                  ? 'bg-gold/90 text-white'
                                  : 'bg-gold text-white'
                              }`}>
                                {img.status === 'done' ? '✓' : img.status === 'error' ? '!' : img.status === 'uploading' ? '…' : 'new'}
                              </span>

                              {/* Position number */}
                              <span className="absolute top-1 left-1 text-[8px] bg-black/40 text-white rounded px-1 py-0.5 leading-tight font-bold">
                                {idx + 1}
                              </span>

                              {/* Remove button — 28×28px for easy tap on mobile */}
                              <button
                                type="button"
                                onClick={() => removePreviewFile(img.id)}
                                disabled={img.status === 'uploading'}
                                className="absolute top-1 right-1 w-7 h-7 bg-white/90 hover:bg-red-500 rounded-full shadow-md flex items-center justify-center text-slate-600 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Remove image"
                                aria-label={`Remove preview image ${idx + 1}`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}

                          {/* "Add more" tile — appears inside the grid */}
                          {previewFiles.length < 10 && (
                            <div
                              className="rounded-xl border-2 border-dashed border-slate-200 hover:border-gold/40 hover:bg-gold/5 flex flex-col items-center justify-center cursor-pointer transition-all group"
                              style={{ aspectRatio: '1 / 1' }}
                              onClick={() => { if (previewInputRef.current) { previewInputRef.current.value = ''; previewInputRef.current.click(); } }}
                              onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                              onDrop={e => { e.preventDefault(); e.stopPropagation(); selectPreviewFiles(e.dataTransfer.files); }}
                            >
                              <Plus className="w-6 h-6 text-slate-300 group-hover:text-gold/70 transition-colors" />
                              <span className="text-[9px] text-slate-400 group-hover:text-gold mt-1 font-ui tracking-wide">
                                Add
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Info row below grid */}
                        <p className="text-[10px] text-slate-400 font-ui">
                          {previewFiles.filter(f => f.status === 'pending').length > 0
                            ? `${previewFiles.filter(f => f.status === 'pending').length} image${previewFiles.filter(f => f.status === 'pending').length !== 1 ? 's' : ''} ready to upload · will save when you click "${editingId ? 'Update Note' : 'Create & Upload'}"`
                            : `${previewFiles.length} image${previewFiles.length !== 1 ? 's' : ''} attached`
                          }
                        </p>
                      </>
                    )}

                    {/* Hidden file input */}
                    <input
                      ref={previewInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      multiple
                      className="hidden"
                      aria-label="Upload preview images"
                      onChange={e => {
                        if (e.target.files && e.target.files.length > 0) {
                          selectPreviewFiles(e.target.files);
                        }
                      }}
                    />
                  </section>

                  {/* ── Sample PDF Preview ── */}
                  <section className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-black">
                        Dedicated Sample PDF
                      </h3>
                      <span className="text-[9px] text-slate-400 font-ui uppercase tracking-widest">
                        Visible to public · Watermark applied
                      </span>
                    </div>

                    {(sampleThumb || samplePdfKey) && (
                      <div className="flex items-center gap-4 p-4 bg-burgundy/5 border border-burgundy/10 rounded-2xl relative group">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                          <FileText className="w-6 h-6 text-burgundy" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-ui font-bold text-slate-900 truncate">
                            {sampleThumb || 'Sample PDF Uploaded'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">
                            {samplePdfKey || 'Pending Upload'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={resetSample}
                          title="Remove sample PDF"
                          aria-label="Remove sample PDF"
                          className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-red-500 transition-all flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {sampleStatus === 'uploading' && (
                          <div className="absolute inset-0 bg-white/40 flex items-center justify-center rounded-2xl">
                            <RefreshCw className="w-5 h-5 text-burgundy animate-spin" />
                          </div>
                        )}
                      </div>
                    )}

                    {!sampleThumb && !samplePdfKey && (
                      <div
                        className="border-2 border-dashed border-slate-200 hover:border-gold/40 rounded-2xl p-8 text-center cursor-pointer transition-all group"
                        onClick={() => sampleInputRef.current?.click()}
                      >
                        <Upload className="w-8 h-8 text-slate-200 group-hover:text-gold/50 mx-auto mb-2 transition-colors" />
                        <p className="text-xs text-slate-500 font-ui">Upload Public Sample PDF</p>
                        <input
                          ref={sampleInputRef}
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          aria-label="Upload sample PDF file"
                          onChange={e => { const f = e.target.files?.[0]; if (f) selectSampleFile(f); }}
                        />
                      </div>
                    )}
                  </section>

                  {/* ── Add-On Mastery Content ── */}
                  <section className="space-y-5 border-t border-slate-100 pt-8 mt-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-black">
                        Add-On Mastery Content
                      </h3>
                      <span className="text-[9px] text-slate-400 font-ui uppercase tracking-widest">
                        NotebookLM Magic
                      </span>
                    </div>

                    {/* Audio English */}
                    <div className="flex flex-col md:flex-row items-center gap-4">
                      <div className="flex-1 w-full">
                        <label className="input-label">English Audio Summary (.mp3)</label>
                        {form.audioSummaryKeyEnglish && !audioEnFile ? (
                          <div className="text-xs font-mono text-green-600 bg-green-50 p-3 rounded-xl break-all relative group cursor-pointer" onClick={() => audioEnInputRef.current?.click()}>
                            <span className="group-hover:opacity-0 transition-opacity">Stored: {form.audioSummaryKeyEnglish}</span>
                            <span className="absolute inset-0 flex items-center justify-center font-bold absolute opacity-0 group-hover:opacity-100 transition-opacity text-green-700">Change File</span>
                            <input ref={audioEnInputRef} type="file" accept="audio/mpeg,.mp3" className="hidden" aria-label="Upload English Audio Summary" title="Upload English Audio Summary" onChange={e => { const f = e.target.files?.[0]; if (f) selectAudioEnFile(f); }} />
                          </div>
                        ) : (
                          <div
                            className="bg-slate-50 border border-slate-200 hover:border-gold/30 p-4 rounded-xl cursor-pointer transition-all flex items-center gap-3"
                            onClick={() => audioEnInputRef.current?.click()}
                          >
                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-slate-200 shadow-sm transition-colors">
                              {audioEnStatus === 'uploading' ? <Loader2 className="w-5 h-5 text-gold animate-spin" /> : <Upload className="w-5 h-5 text-slate-400 group-hover:text-gold" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-700 truncate">{audioEnFile ? audioEnFile.name : 'Upload English MP3'}</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-ui">{audioEnStatus === 'done' ? 'Ready to Save' : 'Max 25 MB'}</p>
                            </div>
                            <input
                              ref={audioEnInputRef} type="file" accept="audio/mpeg,.mp3" className="hidden"
                              aria-label="Upload English Audio Summary" title="Upload English Audio Summary"
                              onChange={e => { const f = e.target.files?.[0]; if (f) selectAudioEnFile(f); }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Audio Hindi */}
                      <div className="flex-1 w-full">
                        <label className="input-label">Hindi Audio Summary (.mp3)</label>
                        {form.audioSummaryKeyHindi && !audioHiFile ? (
                          <div className="text-xs font-mono text-green-600 bg-green-50 p-3 rounded-xl break-all relative group cursor-pointer" onClick={() => audioHiInputRef.current?.click()}>
                            <span className="group-hover:opacity-0 transition-opacity">Stored: {form.audioSummaryKeyHindi}</span>
                            <span className="absolute inset-0 flex items-center justify-center font-bold absolute opacity-0 group-hover:opacity-100 transition-opacity text-green-700">Change File</span>
                            <input ref={audioHiInputRef} type="file" accept="audio/mpeg,.mp3" className="hidden" aria-label="Upload Hindi Audio Summary" title="Upload Hindi Audio Summary" onChange={e => { const f = e.target.files?.[0]; if (f) selectAudioHiFile(f); }} />
                          </div>
                        ) : (
                          <div
                            className="bg-slate-50 border border-slate-200 hover:border-gold/30 p-4 rounded-xl cursor-pointer transition-all flex items-center gap-3"
                            onClick={() => audioHiInputRef.current?.click()}
                          >
                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-slate-200 shadow-sm transition-colors">
                              {audioHiStatus === 'uploading' ? <Loader2 className="w-5 h-5 text-gold animate-spin" /> : <Upload className="w-5 h-5 text-slate-400 group-hover:text-gold" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-700 truncate">{audioHiFile ? audioHiFile.name : 'Upload Hindi MP3'}</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-ui">{audioHiStatus === 'done' ? 'Ready to Save' : 'Max 25 MB'}</p>
                            </div>
                            <input
                              ref={audioHiInputRef} type="file" accept="audio/mpeg,.mp3" className="hidden"
                              aria-label="Upload Hindi Audio Summary" title="Upload Hindi Audio Summary"
                              onChange={e => { const f = e.target.files?.[0]; if (f) selectAudioHiFile(f); }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Infographic & Quiz */}
                    <div className="flex flex-col md:flex-row items-start gap-4">
                      <div className="flex-1 w-full">
                        <label className="input-label">Transition Infographic (.pdf/.png)</label>
                        {form.infographicKey && !infoFile ? (
                          <div className="text-xs font-mono text-green-600 bg-green-50 p-3 rounded-xl break-all relative group cursor-pointer" onClick={() => infoInputRef.current?.click()}>
                            <span className="group-hover:opacity-0 transition-opacity">Stored: {form.infographicKey}</span>
                            <span className="absolute inset-0 flex items-center justify-center font-bold absolute opacity-0 group-hover:opacity-100 transition-opacity text-green-700">Change File</span>
                            <input ref={infoInputRef} type="file" accept="application/pdf,image/*" className="hidden" aria-label="Upload Transition Infographic" title="Upload Transition Infographic" onChange={e => { const f = e.target.files?.[0]; if (f) selectInfoFile(f); }} />
                          </div>
                        ) : (
                          <div
                            className="bg-slate-50 border border-slate-200 hover:border-gold/30 p-4 rounded-xl cursor-pointer transition-all flex items-center gap-3"
                            onClick={() => infoInputRef.current?.click()}
                          >
                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-slate-200 shadow-sm transition-colors">
                              {infoStatus === 'uploading' ? <Loader2 className="w-5 h-5 text-gold animate-spin" /> : <Upload className="w-5 h-5 text-slate-400 group-hover:text-gold" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-700 truncate">{infoFile ? infoFile.name : 'Upload Infographic'}</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-ui">{infoStatus === 'done' ? 'Ready to Save' : 'Max 10 MB'}</p>
                            </div>
                            <input
                              ref={infoInputRef} type="file" accept="application/pdf,image/*" className="hidden"
                              aria-label="Upload Transition Infographic" title="Upload Transition Infographic"
                              onChange={e => { const f = e.target.files?.[0]; if (f) selectInfoFile(f); }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 w-full">
                        <label className="input-label">Law Quiz JSON Text</label>
                        <textarea
                          placeholder='Paste NotebookLM generated JSON [{"question": "...", "options": [...]}]'
                          value={form.quizData}
                          onChange={e => setForm({ ...form, quizData: e.target.value })}
                          className="admin-input font-mono text-xs h-32 custom-scrollbar resize-none bg-slate-900 text-green-400 focus:border-green-400"
                          title="Law Quiz JSON Data"
                          aria-label="Law Quiz JSON Data"
                        />
                      </div>
                    </div>
                  </section>

                  {/* ── Marketplace Content Features ── */}
                  <section className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-black">
                        Content Features
                      </h3>
                      <button
                        type="button"
                        onClick={() => setForm(v => ({ ...v, contentFeatures: [...v.contentFeatures, ''] }))}
                        className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-ui font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-sm"
                        title="Add New Content Feature"
                      >
                        <Plus className="w-3 h-3" /> ADD FEATURE
                      </button>
                    </div>
                    <div className="space-y-3">
                      {form.contentFeatures.map((f, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            type="text"
                            value={f}
                            onChange={e => {
                              const newF = [...form.contentFeatures];
                              newF[i] = e.target.value;
                              setForm(v => ({ ...v, contentFeatures: newF }));
                            }}
                            className="admin-input flex-1"
                            placeholder="e.g. Detailed Case Summaries"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newF = form.contentFeatures.filter((_, idx) => idx !== i);
                              setForm(v => ({ ...v, contentFeatures: newF }));
                            }}
                            title="Remove this feature"
                            aria-label="Remove this feature"
                            className="p-3 text-slate-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* ── Featured Sections ── */}
                  <section className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-black">
                        Premium Highlights
                      </h3>
                      <button
                        type="button"
                        onClick={() => setForm(v => ({ ...v, featuredSections: [...v.featuredSections, { title: '', content: '' }] }))}
                        className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-ui font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-sm"
                        title="Add New Highlight Section"
                      >
                        <Plus className="w-3 h-3" /> ADD HIGHLIGHT
                      </button>
                    </div>

                    {/* Taxation Section */}
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-6">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-4 h-4 text-gold" />
                        <span className="text-[10px] text-gold uppercase font-black tracking-widest">Taxation (GST)</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className={`relative w-10 h-5 rounded-full transition-colors ${form.hasGst ? 'bg-gold' : 'bg-slate-200'}`}>
                            <input 
                              type="checkbox"
                              checked={form.hasGst}
                              onChange={e => setForm(v => ({ ...v, hasGst: e.target.checked }))}
                              className="sr-only"
                            />
                            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${form.hasGst ? 'translate-x-5' : 'translate-x-0'}`} />
                          </div>
                          <span className="text-xs font-ui font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-widest">Enable GST</span>
                        </label>
                      </div>

                      {form.hasGst && (
                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                          <label className="input-label">GST Rate (%)</label>
                          <div className="relative">
                            <input 
                              type="number"
                              value={form.gstRate}
                              onChange={e => setForm(v => ({ ...v, gstRate: Number(e.target.value) }))}
                              className="admin-input"
                              placeholder="18"
                              min="0"
                              max="100"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">%</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {form.featuredSections.map((s, i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative">
                          <button
                            type="button"
                            onClick={() => {
                              const newS = form.featuredSections.filter((_, idx) => idx !== i);
                              setForm(v => ({ ...v, featuredSections: newS }));
                            }}
                            title="Remove this highlight"
                            aria-label="Remove this highlight"
                            className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <input
                            type="text"
                            value={s.title}
                            onChange={e => {
                              const newS = [...form.featuredSections];
                              newS[i] = { ...newS[i], title: e.target.value };
                              setForm(v => ({ ...v, featuredSections: newS }));
                            }}
                            className="admin-input bg-white"
                            placeholder="Highlight Title (e.g. Important Sections)"
                          />
                          <textarea
                            value={s.content}
                            onChange={e => {
                              const newS = [...form.featuredSections];
                              newS[i] = { ...newS[i], content: e.target.value };
                              setForm(v => ({ ...v, featuredSections: newS }));
                            }}
                            className="admin-input bg-white min-h-[80px]"
                            placeholder="Brief description of this highlight..."
                          />
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* ── Curriculum Structure ── */}
                  <section className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-black">
                        Curriculum Structure
                      </h3>
                      <button
                        type="button"
                        onClick={() => setForm(v => ({ ...v, tableOfContents: [...(v.tableOfContents || []), ''] }))}
                        className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-ui font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-sm"
                        title="Add New Chapter"
                      >
                        <Plus className="w-3 h-3" /> ADD CHAPTER
                      </button>
                    </div>
                    <div className="space-y-3">
                      {(form.tableOfContents || []).map((chapter, i) => (
                        <div key={i} className="flex gap-2">
                          <div className="w-10 flex-shrink-0 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-[10px] font-ui font-black text-slate-400">
                            {(i + 1).toString().padStart(2, '0')}
                          </div>
                          <input
                            type="text"
                            value={chapter}
                            onChange={e => {
                              const newTOC = [...(form.tableOfContents || [])];
                              newTOC[i] = e.target.value;
                              setForm(v => ({ ...v, tableOfContents: newTOC }));
                            }}
                            className="admin-input flex-1"
                            placeholder="e.g. Introduction to BNS"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newTOC = (form.tableOfContents || []).filter((_, idx) => idx !== i);
                              setForm(v => ({ ...v, tableOfContents: newTOC }));
                            }}
                            className="p-3 text-slate-400 hover:text-red-500"
                            title="Remove Chapter"
                            aria-label="Remove Chapter"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* ── Public Description (Rich Text) ── */}
                  <section className="space-y-5">
                    <h3 className="text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-black">
                      Detailed Public Description
                    </h3>
                    <RichTextEditor
                      value={form.publicDescription}
                      onChange={html => setForm(v => ({ ...v, publicDescription: html }))}
                    />
                  </section>
                </div>

                {/* Sticky footer */}
                <div className="sticky bottom-0 z-20 px-4 sm:px-8 py-4 sm:py-5 bg-white border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 shadow-[0_-12px_40px_rgba(0,0,0,0.05)]">
                  <button
                    type="button"
                    onClick={closeEditor}
                    className="w-full sm:w-auto px-6 py-3 text-slate-500 hover:text-slate-900 font-ui font-semibold transition-colors text-center border border-slate-200 sm:border-0 rounded-xl sm:rounded-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-8 py-3 bg-gold text-ink font-ui font-black rounded-xl shadow-xl shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
