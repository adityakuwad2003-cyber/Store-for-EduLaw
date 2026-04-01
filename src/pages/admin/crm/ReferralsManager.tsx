import { useState, useEffect, useCallback } from 'react';
import { 
  Share2, TrendingUp, Wallet, 
  CheckCircle2, ArrowUpRight, Settings, 
  Award, Users, Download, X, Percent,
  IndianRupee, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  collection, query, orderBy, 
  getDocs, doc, updateDoc, 
  serverTimestamp, limit 
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { DataTable } from '../../../components/admin/DataTable';
import type { Column } from '../../../components/admin/DataTable';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { format } from 'date-fns';

interface ReferralRecord {
  id: string;
  referrerUid: string;
  referrerEmail: string;
  refereeUid: string;
  refereeEmail: string;
  orderId: string;
  orderAmount: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  createdAt: any;
}

interface ReferralSettings {
  commissionPercentage: number;
  minPayout: number;
  isEnabled: boolean;
}

export default function ReferralsManager() {
  const [records, setRecords] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<ReferralSettings>({
    commissionPercentage: 10,
    minPayout: 500,
    isEnabled: true
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ── DATA FETCHING ──
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'referrals'), orderBy('createdAt', 'desc'), limit(50));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ReferralRecord[];
      setRecords(data);
    } catch (error) {
      console.error('Error fetching referrals:', error);
      toast.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // ── ACTIONS ──
  const handleUpdateStatus = async (id: string, status: ReferralRecord['status']) => {
    try {
      await updateDoc(doc(db, 'referrals', id), {
        status,
        updatedAt: serverTimestamp()
      });
      toast.success(`Referral marked as ${status}`);
      fetchRecords();
    } catch (error) {
      toast.error('Failed to update referral status');
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // In production, save to a 'settings' collection or config doc
      await updateDoc(doc(db, 'system', 'referral_config'), {
        ...settings,
        updatedAt: serverTimestamp()
      });
      toast.success('Referral logic updated successfully');
      setIsSettingsOpen(false);
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<ReferralRecord>[] = [
    {
      key: 'referrer',
      label: 'Referrer',
      render: (row) => (
        <div>
           <p className="font-bold text-slate-900 truncate max-w-[150px]">{row.referrerEmail}</p>
           <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-1 font-black">Agent ID: {row.referrerUid.slice(0, 8)}</p>
        </div>
      )
    },
    {
      key: 'referee',
      label: 'New Student',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-gold" />
          <p className="text-xs text-slate-500 font-medium">{row.refereeEmail}</p>
        </div>
      )
    },
    {
      key: 'sale',
      label: 'Conversion',
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-xs font-mono text-slate-900 font-bold">₹{row.orderAmount}</span>
          <span className="text-[10px] text-gold font-bold">₹{row.commissionAmount} Comm.</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status === 'paid' ? 'published' : row.status === 'pending' ? 'draft' : row.status} />
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (row) => (
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
           {row.createdAt?.toDate ? format(row.createdAt.toDate(), 'MMM dd, yyyy') : 'Recently'}
        </span>
      )
    },
    {
      key: 'actions',
      label: '',
      className: 'w-10',
      render: (row) => (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {row.status === 'pending' && (
             <button 
                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(row.id, 'approved'); }}
                className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-all"
                title="Approve"
              >
                <CheckCircle2 className="w-4 h-4" />
             </button>
          )}
          <button 
            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-gold rounded-lg transition-all"
            aria-label="View referral details"
          >
            <ArrowUpRight className="w-4 h-4" />
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
            <Share2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-slate-900">Referrals Manager</h1>
            <p className="text-sm text-slate-500 font-ui tracking-wide">Track student affiliates, manage commissions, and drive organic growth</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-ui font-bold rounded-xl transition-all"
          >
            <Settings className="w-5 h-5" /> Config
          </button>
          <button 
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-ui font-bold rounded-xl shadow-lg hover:bg-slate-800 active:scale-[0.98] transition-all"
          >
            <Download className="w-5 h-5" /> Export Ledger
          </button>
        </div>
      </div>

      {/* ── ANALYTICS ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Network Value', value: '₹2.4L', change: '+15%', icon: TrendingUp, color: 'text-gold' },
          { label: 'Unpaid Comms', value: '₹14,500', change: '8 Records', icon: Wallet, color: 'text-blue-400' },
          { label: 'Top Agent', value: 'adv_verma', change: '45 Referrals', icon: Award, color: 'text-green-500' },
          { label: 'Growth rate', value: '4.2%', change: '+0.1%', icon: Users, color: 'text-slate-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
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
        data={records}
        loading={loading}
        keyField="id"
      />

      {/* ── SETTINGS MODAL ── */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-200 bg-white flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl text-slate-900">Referral Ecosystem</h2>
                  <p className="text-[10px] text-gold uppercase tracking-widest font-bold mt-1">Growth Configuration</p>
                </div>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400" aria-label="Close settings">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                   <div>
                     <p className="text-sm text-slate-900 font-bold">Incentive Program</p>
                     <p className="text-xs text-slate-500 mt-1">Allow students to earn from referrals</p>
                   </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.isEnabled}
                        onChange={e => setSettings(v => ({ ...v, isEnabled: e.target.checked }))}
                        className="sr-only peer" 
                        aria-label="Enable Incentive Program"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                    </label>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label htmlFor="commission-percent" className="text-[10px] text-slate-400 uppercase tracking-widest font-black flex items-center gap-2">
                       <Percent className="w-3 h-3 text-gold" /> Success Comm. (%)
                    </label>
                    <input 
                      id="commission-percent"
                      type="number"
                      value={settings.commissionPercentage}
                      onChange={e => setSettings(v => ({ ...v, commissionPercentage: Number(e.target.value) }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:border-gold outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label htmlFor="min-payout" className="text-[10px] text-slate-400 uppercase tracking-widest font-black flex items-center gap-2">
                       <IndianRupee className="w-3 h-3 text-gold" /> Min. Payout (₹)
                    </label>
                    <input 
                      id="min-payout"
                      type="number"
                      value={settings.minPayout}
                      onChange={e => setSettings(v => ({ ...v, minPayout: Number(e.target.value) }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:border-gold outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gold/5 border border-gold/20 flex items-start gap-4">
                  <TrendingUp className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-500 leading-relaxed font-ui">
                    A 10% commission on a 500 INR sale will grant the student 50 INR. Payouts are manually approved by admin to prevent fraud.
                  </p>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-4 font-ui">
                <button type="button" onClick={() => setIsSettingsOpen(false)} className="text-xs text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest">Discard</button>
                <button 
                  onClick={saveSettings}
                  className="px-8 py-3 bg-slate-900 text-white font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 text-xs uppercase tracking-widest"
                >
                  <Save className="w-4 h-4" /> Update Ecosystem
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(201, 168, 76, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}
