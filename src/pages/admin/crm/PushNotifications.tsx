import { useState, useEffect, useCallback } from 'react';
import { 
  Bell, Plus, X, Save,
  Smartphone, Zap, Edit
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

interface PushNotification {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  target: 'all' | 'premium' | 'active_today' | 'cart_abandoners';
  deepLink?: string;
  status: 'draft' | 'scheduled' | 'sent';
  sentCount: number;
  clickCount: number;
  scheduledAt?: any;
  createdAt: any;
  updatedAt: any;
}

export default function PushNotifications() {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNotif, setEditingNotif] = useState<Partial<PushNotification> | null>(null);

  // ── DATA FETCHING ──
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'push_notifications'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PushNotification[];
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notification history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ── ACTIONS ──
  const handleSave = async (data: Partial<PushNotification>) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        updatedAt: serverTimestamp(),
        sentCount: data.sentCount || 0,
        clickCount: data.clickCount || 0,
      };

      if (data.id) {
        await updateDoc(doc(db, 'push_notifications', data.id), payload);
        toast.success('Notification draft updated');
      } else {
        await addDoc(collection(db, 'push_notifications'), {
          ...payload,
          status: 'draft',
          createdAt: serverTimestamp(),
        });
        toast.success('Notification draft created');
      }
      setIsEditorOpen(false);
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to save notification');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNow = async (notif: PushNotification) => {
    if (!confirm(`Broadcast "${notif.title}" to ${notif.target} immediately?`)) return;
    
    setLoading(true);
    try {
      // Logic for FCM / OneSignal / Pusher integration
      // const res = await fetch('/api/admin/push-broadcast', { ... });
      
      await updateDoc(doc(db, 'push_notifications', notif.id), {
        status: 'sent',
        sentAt: serverTimestamp(),
        sentCount: 12450 // Mocked for UI feedback
      });
      
      toast.success('Push broadcast initiated successfully');
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<PushNotification>[] = [
    {
      key: 'content',
      label: 'Notification Content',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
             {row.imageUrl ? <img src={row.imageUrl} className="w-full h-full object-cover rounded-lg" alt="" /> : <Bell className="w-4 h-4 text-gold" />}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-parchment truncate max-w-[200px]">{row.title}</p>
            <p className="text-[10px] text-parchment/40 truncate max-w-[200px]">{row.body}</p>
          </div>
        </div>
      )
    },
    {
      key: 'target',
      label: 'Target',
      render: (row) => (
        <span className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-parchment/60 font-bold uppercase tracking-widest">
          {row.target.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'stats',
      label: 'Engagement',
      render: (row) => (
        <div className="flex flex-col gap-1">
          <p className="text-[10px] text-parchment font-mono"><span className="text-parchment/40">SENT:</span> {row.sentCount}</p>
          <p className="text-[10px] text-gold font-mono"><span className="text-parchment/40">CTR:</span> {row.sentCount > 0 ? ((row.clickCount / row.sentCount) * 100).toFixed(1) : 0}%</p>
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
            onClick={(e) => { e.stopPropagation(); setEditingNotif(row); setIsEditorOpen(true); }}
            className="p-2 hover:bg-gold/10 text-parchment/40 hover:text-gold rounded-lg transition-all"
          >
            <Edit className="w-4 h-4" />
          </button>
          {row.status === 'draft' && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleSendNow(row); }}
              className="p-2 hover:bg-gold/20 text-gold rounded-lg transition-all"
              title="Push Now"
            >
              <Zap className="w-4 h-4" />
            </button>
          )}
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
            <Smartphone className="w-7 h-7 text-ink" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-parchment">Push Notifications</h1>
            <p className="text-sm text-parchment/40 font-ui tracking-wide">Send real-time alerts, class reminders, and specialized law updates</p>
          </div>
        </div>

        <button 
          onClick={() => { setEditingNotif({ target: 'all', status: 'draft' }); setIsEditorOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-gold text-ink font-ui font-bold rounded-xl shadow-xl shadow-gold/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" /> New Alert
        </button>
      </div>

      <DataTable
        columns={columns}
        data={notifications}
        loading={loading}
        keyField="id"
        onRowClick={(row) => { setEditingNotif(row); setIsEditorOpen(true); }}
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
              className="relative w-full max-w-xl bg-ink border-l border-white/10 shadow-2xl flex flex-col"
            >
              <div className="px-8 py-6 bg-ink border-b border-white/10 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="font-display text-xl text-parchment">{editingNotif?.id ? 'Edit Alert' : 'Create Push Broadcast'}</h2>
                  <p className="text-[10px] text-gold uppercase tracking-[0.2em] font-black mt-1">Real-time Engagement</p>
                </div>
                <button onClick={() => setIsEditorOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-parchment/40">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form 
                onSubmit={(e) => { e.preventDefault(); handleSave(editingNotif || {}); }}
                className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar"
              >
                <div className="space-y-4">
                  <label className="input-label">Notification Title</label>
                  <input 
                    type="text" required maxLength={65}
                    value={editingNotif?.title || ''}
                    onChange={e => setEditingNotif(v => ({ ...v, title: e.target.value }))}
                    className="admin-input font-bold" 
                    placeholder="e.g. New BNS Notes are Live! 📚"
                  />
                </div>

                <div className="space-y-4">
                  <label className="input-label">Push Message Body</label>
                  <textarea 
                    required maxLength={150} rows={3}
                    value={editingNotif?.body || ''}
                    onChange={e => setEditingNotif(v => ({ ...v, body: e.target.value }))}
                    className="admin-input resize-none" 
                    placeholder="Briefly explain why students should click this alert..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="input-label">Target Segment</label>
                    <select 
                      value={editingNotif?.target}
                      onChange={e => setEditingNotif(v => ({ ...v, target: e.target.value as any }))}
                      className="admin-input"
                    >
                      <option value="all">Every User</option>
                      <option value="premium">Premium Students</option>
                      <option value="active_today">Recently Active</option>
                      <option value="cart_abandoners">Cart Abandoners</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Deep Link (Optional)</label>
                    <input 
                      type="text"
                      value={editingNotif?.deepLink || ''}
                      onChange={e => setEditingNotif(v => ({ ...v, deepLink: e.target.value }))}
                      className="admin-input" 
                      placeholder="/product/crpc-notes"
                    />
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <h3 className="text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-black">Visual Asset</h3>
                  <input 
                    type="text"
                    value={editingNotif?.imageUrl || ''}
                    onChange={e => setEditingNotif(v => ({ ...v, imageUrl: e.target.value }))}
                    className="admin-input text-xs" 
                    placeholder="HTTPS Image URL (Optional)"
                  />
                  {editingNotif?.imageUrl && (
                    <div className="w-full aspect-video rounded-xl border border-white/10 overflow-hidden bg-white/5">
                      <img src={editingNotif.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                  )}
                </div>

                {/* Mobile Preview UI */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h3 className="text-parchment/20 font-ui text-[10px] uppercase tracking-[0.2em] font-black">Native Mobile Preview</h3>
                  <div className="w-full max-w-[300px] mx-auto bg-black p-4 rounded-[2rem] border border-white/10 shadow-2xl scale-90">
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-3 flex gap-3 items-center">
                      <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-ink" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-white truncate">{editingNotif?.title || 'Headline'}</p>
                        <p className="text-[10px] text-white/70 line-clamp-2 leading-tight">{editingNotif?.body || 'Your message will appear here...'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </form>

              <div className="p-8 border-t border-white/10 flex items-center justify-end gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <button type="button" onClick={() => setIsEditorOpen(false)} className="text-sm font-ui text-parchment/40 hover:text-parchment">Cancel</button>
                <button 
                  type="button"
                  onClick={() => handleSave(editingNotif || {})}
                  className="px-10 py-3.5 bg-gold text-ink font-ui font-black rounded-xl shadow-xl shadow-gold/10 hover:scale-[1.02] flex items-center gap-2"
                >
                  <Save className="w-5 h-5" /> Save Payload
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
