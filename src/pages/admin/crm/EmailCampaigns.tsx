import { useState, useEffect, useCallback } from 'react';
import { 
  Mail, Send, Play,
  Plus, X, Save,
  Target, Eye, History, Edit,
  Layout
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

interface Campaign {
  id: string;
  title: string;
  subject: string;
  audience: 'all_students' | 'premium_subscribers' | 'recent_buyers' | 'inactive_users';
  status: 'draft' | 'scheduled' | 'sent';
  sentCount: number;
  openRate: number;
  clickRate: number;
  content: string;
  scheduledAt?: any;
  createdAt: any;
  updatedAt: any;
}

export default function EmailCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Partial<Campaign> | null>(null);

  // ── DATA FETCHING ──
  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'campaigns'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Campaign[];
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // ── ACTIONS ──
  const handleSave = async (data: Partial<Campaign>) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        updatedAt: serverTimestamp(),
        sentCount: data.sentCount || 0,
        openRate: data.openRate || 0,
        clickRate: data.clickRate || 0,
      };

      if (data.id) {
        await updateDoc(doc(db, 'campaigns', data.id), payload);
        toast.success('Campaign saved as draft');
      } else {
        await addDoc(collection(db, 'campaigns'), {
          ...payload,
          status: 'draft',
          createdAt: serverTimestamp(),
        });
        toast.success('New campaign draft created');
      }
      setIsEditorOpen(false);
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to save campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async (campaign: Campaign) => {
    if (!confirm(`Are you sure you want to send this campaign to ${campaign.audience.replace('_', ' ')}? This action cannot be undone.`)) return;
    
    setLoading(true);
    try {
      // In production, this would call a cloud function that uses Resend API
      const { getAuth } = await import('firebase/auth');
      const token = await getAuth().currentUser?.getIdToken();

      // For now, we simulate the request
      const res = await fetch('/api/admin/send-campaign', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ campaignId: campaign.id })
      });
      
      if (!res.ok) throw new Error('Cloud Function Error');
      
      await updateDoc(doc(db, 'campaigns', campaign.id), {
        status: 'sent',
        sentAt: serverTimestamp()
      });
      
      toast.success('Campaign broadcast started successfully via Resend');
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to trigger broadcast. Check Resend configuration.');
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<Campaign>[] = [
    {
      key: 'title',
      label: 'Campaign Name',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.title}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{row.subject}</p>
        </div>
      )
    },
    {
      key: 'audience',
      label: 'Recipient Group',
      render: (row) => (
        <div className="flex items-center gap-2 px-2 py-1 rounded bg-slate-50 border border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          <Target className="w-3 h-3 text-gold" />
          {row.audience.replace('_', ' ')}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'performance',
      label: 'Outreach',
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs font-mono text-slate-900 font-bold">{row.sentCount}</span>
            <span className="text-[8px] text-slate-400 uppercase font-black">Sent</span>
          </div>
          <div className="flex flex-col border-l border-slate-200 pl-4">
            <span className="text-xs font-mono text-gold font-bold">{row.openRate}%</span>
            <span className="text-[8px] text-slate-400 uppercase font-black">Open Rate</span>
          </div>
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
            onClick={(e) => { e.stopPropagation(); setEditingCampaign(row); setIsEditorOpen(true); }}
            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-gold rounded-lg transition-all"
            title="Edit Campaign"
          >
            <Edit className="w-4 h-4" />
          </button>
          {row.status === 'draft' && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleSendCampaign(row); }}
              className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-all"
              title="Launch Now"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
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
            <Mail className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-slate-900">Email Campaigns</h1>
            <p className="text-sm text-slate-500 font-ui tracking-wide">Design, schedule, and analyze your legal outreach broadcasts</p>
          </div>
        </div>

        <button 
          onClick={() => { setEditingCampaign({ audience: 'all_students', content: '', status: 'draft' }); setIsEditorOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-ui font-bold rounded-xl shadow-lg hover:bg-slate-800 active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" /> New Campaign
        </button>
      </div>

      {/* ── QUICK STATS ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sent', value: '45.2K', change: '+5.2%', icon: Send, color: 'text-blue-400' },
          { label: 'Avg. Open Rate', value: '24.8%', change: '+1.4%', icon: Eye, color: 'text-gold' },
          { label: 'CTR', value: '12.4%', change: '-0.8%', icon: Layout, color: 'text-green-500' },
          { label: 'Campaigns', value: campaigns.length, change: 'Active', icon: History, color: 'text-slate-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              {stat.label}
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-display text-slate-900">{stat.value}</p>
            <p className="text-[10px] font-bold text-green-600 mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={campaigns}
        loading={loading}
        keyField="id"
        onRowClick={(row) => { setEditingCampaign(row); setIsEditorOpen(true); }}
      />

      {/* ── CAMPAIGN EDITOR ── */}
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
              className="relative w-full max-w-3xl bg-white border-l border-slate-200 shadow-2xl flex flex-col"
            >
              <div className="px-8 py-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="font-display text-xl text-slate-900">{editingCampaign?.id ? 'Edit Campaign Draft' : 'New Broadcast Designer'}</h2>
                  <p className="text-[10px] text-gold uppercase tracking-[0.2em] font-black mt-1">Marketing Suite</p>
                </div>
                <button onClick={() => setIsEditorOpen(false)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-400" aria-label="Close editor">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form 
                onSubmit={(e) => { e.preventDefault(); handleSave(editingCampaign || {}); }}
                className="flex-1 overflow-y-auto p-8 space-y-10 pb-32 custom-scrollbar"
              >
                <div className="space-y-6">
                  <h3 className="text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-black">Meta Data</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 md:col-span-1">
                      <label className="input-label">Campaign Name (Internal)</label>
                      <input 
                        type="text" required
                        value={editingCampaign?.title || ''}
                        onChange={e => setEditingCampaign(v => ({ ...v, title: e.target.value }))}
                        className="admin-input" 
                        placeholder="e.g. BNS Launch - All Students"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label htmlFor="target-audience" className="input-label">Target Audience</label>
                      <select 
                        id="target-audience"
                        value={editingCampaign?.audience}
                        onChange={e => setEditingCampaign(v => ({ ...v, audience: e.target.value as any }))}
                        className="admin-input"
                      >
                        <option value="all_students">All Students</option>
                        <option value="premium_subscribers">Premium Subscribers</option>
                        <option value="recent_buyers">Recent Buyers (30d)</option>
                        <option value="inactive_users">Inactive Users</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="input-label">Email Subject Line</label>
                      <input 
                        type="text" required
                        value={editingCampaign?.subject || ''}
                        onChange={e => setEditingCampaign(v => ({ ...v, subject: e.target.value }))}
                        className="admin-input border-gold/20" 
                        placeholder="e.g. BIG NEWS: Master the New Criminal Laws (BNS) with EduLaw"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-black">Email Body</h3>
                  <RichTextEditor 
                    value={editingCampaign?.content || ''}
                    onChange={html => setEditingCampaign(v => ({ ...v, content: html }))}
                  />
                </div>
              </form>

              <div className="absolute bottom-0 left-0 right-0 p-8 bg-white border-t border-slate-200 flex items-center justify-between shadow-[0_-12px_40px_rgba(0,0,0,0.05)]">
                <div className="flex gap-4">
                  <button type="button" className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-400" title="Send Test Email">
                    <History className="w-5 h-5" />
                  </button>
                  <button type="button" className="text-xs font-ui text-slate-400 hover:text-slate-900">Save as Draft</button>
                </div>
                <button 
                  type="button"
                  onClick={() => handleSave(editingCampaign || {})}
                  className="px-10 py-3.5 bg-slate-900 text-white font-ui font-black rounded-xl shadow-lg hover:bg-slate-800 active:scale-[1.02] flex items-center gap-2"
                >
                   <Save className="w-5 h-5" /> Confirm Campaign Design
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
