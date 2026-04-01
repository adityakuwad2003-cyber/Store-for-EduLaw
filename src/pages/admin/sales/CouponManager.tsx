import { useState, useEffect, useCallback } from 'react';
import { 
  Ticket, Plus, X, Save,
  Percent, IndianRupee,
  Clock, Edit
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
import { format } from 'date-fns';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  expiryDate: any;
  status: 'active' | 'expired' | 'disabled';
  description?: string;
  createdAt: any;
  updatedAt: any;
}

export default function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);

  // ── DATA FETCHING ──
  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'coupons'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Coupon[];
      setCoupons(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupon library');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // ── ACTIONS ──
  const handleSave = async (data: Partial<Coupon>) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        code: data.code?.toUpperCase() || '',
        updatedAt: serverTimestamp(),
        usageCount: data.usageCount || 0
      };

      if (data.id) {
        await updateDoc(doc(db, 'coupons', data.id), payload);
        toast.success('Coupon updated successfully');
      } else {
        await addDoc(collection(db, 'coupons'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success('New promotion launched');
      }
      setIsEditorOpen(false);
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to save coupon');
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<Coupon>[] = [
    {
      key: 'code',
      label: 'Promo Code',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 bg-gold/10 border border-gold/20 rounded text-gold font-mono font-bold text-xs">
            {row.code}
          </div>
        </div>
      )
    },
    {
      key: 'discount',
      label: 'Incentive',
      render: (row) => (
        <div className="flex items-center gap-1 text-xs font-bold text-parchment">
          {row.type === 'percentage' ? <Percent className="w-3 h-3 text-gold" /> : <IndianRupee className="w-3 h-3 text-gold" />}
          {row.value}{row.type === 'percentage' ? '%' : ''} Off
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status === 'active' ? 'published' : row.status === 'disabled' ? 'archived' : 'draft'} />
    },
    {
      key: 'usage',
      label: 'Redemptions',
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-xs font-mono text-parchment/60">{row.usageCount} / {row.usageLimit || '∞'}</span>
          <div className="w-16 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-gold" 
              style={{ width: `${Math.min(100, (row.usageCount / (row.usageLimit || 1)) * 100)}%` }} 
            />
          </div>
        </div>
      )
    },
    {
      key: 'expiry',
      label: 'Valid Until',
      sortable: true,
      render: (row) => (
        <span className="text-[10px] text-parchment/30 font-bold uppercase tracking-widest flex items-center gap-1">
           <Clock className="w-3 h-3" />
           {row.expiryDate?.toDate ? format(row.expiryDate.toDate(), 'MMM dd, yyyy') : 'No Expiry'}
        </span>
      )
    },
    {
      key: 'actions',
      label: '',
      className: 'w-10',
      render: (row) => (
        <button 
          onClick={(e) => { e.stopPropagation(); setEditingCoupon(row); setIsEditorOpen(true); }}
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
            <Ticket className="w-7 h-7 text-ink" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-parchment">Coupon Manager</h1>
            <p className="text-sm text-parchment/40 font-ui tracking-wide">Manage promotional codes, holiday discounts, and welcome offers</p>
          </div>
        </div>

        <button 
          onClick={() => { setEditingCoupon({ type: 'percentage', status: 'active', usageCount: 0 }); setIsEditorOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-gold text-ink font-ui font-bold rounded-xl shadow-xl shadow-gold/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" /> New Promo Code
        </button>
      </div>

      <DataTable
        columns={columns}
        data={coupons}
        loading={loading}
        keyField="id"
        onRowClick={(row) => { setEditingCoupon(row); setIsEditorOpen(true); }}
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
                  <h2 className="font-display text-xl text-parchment">{editingCoupon?.id ? 'Edit Coupon' : 'Create Promotion'}</h2>
                  <p className="text-[10px] text-gold uppercase tracking-[0.2em] font-black mt-1">Pricing Engine</p>
                </div>
                <button onClick={() => setIsEditorOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-parchment/40">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form 
                onSubmit={(e) => { e.preventDefault(); handleSave(editingCoupon || {}); }}
                className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar"
              >
                <div className="space-y-4">
                  <label className="input-label">Voucher Code</label>
                  <input 
                    type="text" required
                    value={editingCoupon?.code || ''}
                    onChange={e => setEditingCoupon(v => ({ ...v, code: e.target.value.toUpperCase() }))}
                    className="admin-input font-mono font-bold text-lg tracking-widest text-gold selection:bg-gold/20" 
                    placeholder="e.g. EDULAW50"
                  />
                  <p className="text-[10px] text-parchment/20">Letters and numbers only. Case insensitive.</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="input-label">Discount Type</label>
                    <select 
                      value={editingCoupon?.type}
                      onChange={e => setEditingCoupon(v => ({ ...v, type: e.target.value as any }))}
                      className="admin-input"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Discount Value</label>
                    <div className="relative">
                       {editingCoupon?.type === 'percentage' ? (
                          <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment/30" />
                       ) : (
                          <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment/30" />
                       )}
                       <input 
                        type="number" required
                        value={editingCoupon?.value || ''}
                        onChange={e => setEditingCoupon(v => ({ ...v, value: Number(e.target.value) }))}
                        className="admin-input pl-10" 
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
                   <h3 className="text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-black">Conversion Guardrails</h3>
                   <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="input-label">Min. Order (₹)</label>
                        <input 
                          type="number"
                          value={editingCoupon?.minOrderAmount || ''}
                          onChange={e => setEditingCoupon(v => ({ ...v, minOrderAmount: Number(e.target.value) }))}
                          className="admin-input" 
                        />
                      </div>
                      <div>
                        <label className="input-label">Usage Limit (Total)</label>
                        <input 
                          type="number"
                          value={editingCoupon?.usageLimit || ''}
                          onChange={e => setEditingCoupon(v => ({ ...v, usageLimit: Number(e.target.value) }))}
                          className="admin-input" 
                          placeholder="e.g. 100"
                        />
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                  <label className="input-label">Promotion Description</label>
                  <textarea 
                    rows={2}
                    value={editingCoupon?.description || ''}
                    onChange={e => setEditingCoupon(v => ({ ...v, description: e.target.value }))}
                    className="admin-input resize-none" 
                    placeholder="Brief internal note about this promo..."
                  />
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between border-t border-white/5 pt-6">
                    <div>
                      <p className="text-sm text-parchment font-bold">Public Status</p>
                      <p className="text-xs text-parchment/30 mt-1">Deactivated coupons cannot be redeemed</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editingCoupon?.status === 'active'}
                        onChange={e => setEditingCoupon(v => ({ ...v, status: e.target.checked ? 'active' : 'disabled' }))}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                    </label>
                  </div>
                </div>
              </form>

              <div className="p-8 border-t border-white/10 flex items-center justify-end gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <button type="button" onClick={() => setIsEditorOpen(false)} className="text-sm font-ui text-parchment/40 hover:text-parchment">Discard</button>
                <button 
                  type="button"
                  onClick={() => handleSave(editingCoupon || {})}
                  className="px-10 py-3.5 bg-gold text-ink font-ui font-black rounded-xl shadow-xl shadow-gold/10 hover:scale-[1.02] flex items-center gap-2"
                >
                  <Save className="w-5 h-5" /> Launch Voucher
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
