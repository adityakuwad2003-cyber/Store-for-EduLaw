import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, X, Save,
  Clock, Video,
  Youtube, Monitor, Edit,
  PlayCircle
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

interface VideoLecture {
  id: string;
  title: string;
  subject: string;
  duration: string; // e.g. "45:00"
  videoUrl: string;
  provider: 'youtube' | 'vimeo' | 'hosted';
  description: string;
  status: 'published' | 'draft' | 'private';
  views: number;
  thumbnailUrl?: string;
  createdAt: any;
  updatedAt: any;
}

export default function VideoLectures() {
  const [lectures, setLectures] = useState<VideoLecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Partial<VideoLecture> | null>(null);

  // ── DATA FETCHING ──
  const fetchLectures = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'video_lectures'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as VideoLecture[];
      setLectures(data);
    } catch (error) {
      console.error('Error fetching lectures:', error);
      toast.error('Failed to load video library');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);

  // ── ACTIONS ──
  const handleSave = async (data: Partial<VideoLecture>) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        updatedAt: serverTimestamp(),
        views: data.views || 0,
      };

      if (data.id) {
        await updateDoc(doc(db, 'video_lectures', data.id), payload);
        toast.success('Lecture updated successfully');
      } else {
        await addDoc(collection(db, 'video_lectures'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success('New lecture added to library');
      }
      setIsEditorOpen(false);
      fetchLectures();
    } catch (error) {
      toast.error('Failed to save lecture');
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<VideoLecture>[] = [
    {
      key: 'lecture',
      label: 'Lecture Detail',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-16 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0 relative group/thumb">
             {row.thumbnailUrl ? (
               <img src={row.thumbnailUrl} className="w-full h-full object-cover" alt="" />
             ) : (
               <div className="w-full h-full flex items-center justify-center bg-gold/10">
                 <Video className="w-4 h-4 text-gold/40" />
               </div>
             )}
             <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                <PlayCircle className="w-4 h-4 text-white" />
             </div>
          </div>
          <div>
            <p className="font-bold text-parchment truncate max-w-[200px]">{row.title}</p>
            <p className="text-[10px] text-parchment/40 uppercase tracking-widest mt-1">{row.subject} · {row.duration}</p>
          </div>
        </div>
      )
    },
    {
      key: 'provider',
      label: 'Source',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.provider === 'youtube' ? <Youtube className="w-4 h-4 text-red-500" /> : <Monitor className="w-4 h-4 text-blue-400" />}
          <span className="text-[10px] font-bold uppercase tracking-widest text-parchment/60">{row.provider}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status === 'private' ? 'archived' : row.status} />
    },
    {
      key: 'views',
      label: 'Watch Count',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-mono text-parchment/60">{row.views || 0}</span>
      )
    },
    {
      key: 'actions',
      label: '',
      className: 'w-10',
      render: (row) => (
        <button 
          onClick={(e) => { e.stopPropagation(); setEditingLecture(row); setIsEditorOpen(true); }}
          className="p-2 hover:bg-gold/10 text-parchment/40 hover:text-gold rounded-lg transition-all"
        >
          <Edit className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.02] border border-white/5 p-6 rounded-3xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-[#b8922a] flex items-center justify-center shadow-lg shadow-gold/20">
            <PlayCircle className="w-7 h-7 text-ink" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-parchment">Video Lectures</h1>
            <p className="text-sm text-parchment/40 font-ui tracking-wide">Manage masterclasses, recorded webinars, and course videos</p>
          </div>
        </div>

        <button 
          onClick={() => { setEditingLecture({ provider: 'youtube', status: 'draft', duration: '00:00' }); setIsEditorOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-gold text-ink font-ui font-bold rounded-xl shadow-xl shadow-gold/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" /> Add Masterclass
        </button>
      </div>

      <DataTable
        columns={columns}
        data={lectures}
        loading={loading}
        keyField="id"
        onRowClick={(row) => { setEditingLecture(row); setIsEditorOpen(true); }}
      />

      {/* ── EDITOR SLIDE-OVER ── */}
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
              className="relative w-full max-w-xl bg-ink border-l border-white/10 shadow-2xl flex flex-col h-screen"
            >
              <div className="px-8 py-6 bg-ink border-b border-white/10 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="font-display text-xl text-parchment">{editingLecture?.id ? 'Edit Lecture' : 'New Video Asset'}</h2>
                  <p className="text-[10px] text-gold uppercase tracking-[0.2em] font-black mt-1">Streaming Config</p>
                </div>
                <button onClick={() => setIsEditorOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-parchment/40">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form 
                onSubmit={(e) => { e.preventDefault(); handleSave(editingLecture || {}); }}
                className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar"
              >
                <div className="space-y-4">
                  <label className="input-label">Lecture Title</label>
                  <input 
                    type="text" required
                    value={editingLecture?.title || ''}
                    onChange={e => setEditingLecture(v => ({ ...v, title: e.target.value }))}
                    className="admin-input" 
                    placeholder="e.g. Introduction to CrPC - Session 01"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="input-label">Subject Category</label>
                    <input 
                      type="text" required
                      value={editingLecture?.subject || ''}
                      onChange={e => setEditingLecture(v => ({ ...v, subject: e.target.value }))}
                      className="admin-input" 
                      placeholder="Criminal Law"
                    />
                  </div>
                  <div>
                    <label className="input-label">Duration (MM:SS)</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment/30" />
                      <input 
                        type="text" required
                        value={editingLecture?.duration || ''}
                        onChange={e => setEditingLecture(v => ({ ...v, duration: e.target.value }))}
                        className="admin-input pl-10" 
                        placeholder="45:00"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="input-label">Video Provider</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['youtube', 'vimeo', 'hosted'].map(p => (
                      <button
                        key={p} type="button"
                        onClick={() => setEditingLecture(v => ({ ...v, provider: p as any }))}
                        className={`py-3 rounded-xl border text-[10px] uppercase font-black tracking-widest transition-all ${
                          editingLecture?.provider === p 
                            ? 'bg-gold/10 border-gold text-gold shadow-lg shadow-gold/5' 
                            : 'bg-white/5 border-white/10 text-parchment/40 hover:text-parchment'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="input-label">Resource URL / Embed ID</label>
                  <input 
                    type="text" required
                    value={editingLecture?.videoUrl || ''}
                    onChange={e => setEditingLecture(v => ({ ...v, videoUrl: e.target.value }))}
                    className="admin-input font-mono text-xs" 
                    placeholder="e.g. dQw4w9WgXcQ"
                  />
                </div>

                <div className="space-y-4">
                  <label className="input-label">Video Description</label>
                  <textarea 
                    rows={4}
                    value={editingLecture?.description || ''}
                    onChange={e => setEditingLecture(v => ({ ...v, description: e.target.value }))}
                    className="admin-input resize-none" 
                    placeholder="Brief overview of the lecture content..."
                  />
                </div>

                {editingLecture?.videoUrl && editingLecture.provider === 'youtube' && (
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                     <iframe 
                        className="w-full aspect-video rounded-xl"
                        src={`https://www.youtube.com/embed/${editingLecture.videoUrl}`}
                        title="YouTube Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                     />
                   </div>
                )}
              </form>

              <div className="p-8 border-t border-white/10 flex items-center justify-end gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <button type="button" onClick={() => setIsEditorOpen(false)} className="text-sm font-ui text-parchment/40 hover:text-parchment">Discard</button>
                <button 
                  type="button"
                  onClick={() => handleSave(editingLecture || {})}
                  className="px-10 py-3.5 bg-gold text-ink font-ui font-black rounded-xl shadow-xl shadow-gold/10 hover:scale-[1.02] flex items-center gap-2"
                >
                  <Save className="w-5 h-5" /> Save Masterclass
                </button>
              </div>
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
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(201, 168, 76, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
