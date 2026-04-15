import { useState, useEffect, useCallback } from 'react';
import {
  Ticket, Plus, X, Save,
  Percent, IndianRupee,
  Clock, Edit, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '../../../contexts/AuthContext';
import { DataTable } from '../../../components/admin/DataTable';
import type { Column } from '../../../components/admin/DataTable';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { format } from 'date-fns';


// Local extension of GlobalCoupon for Admin management
interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed'; // Maps to discountType
  value: number;               // Maps to discountValue
  minOrderAmount: number;      // Maps to minOrder
  usageLimit?: number;         // Maps to maxUses
  usageCount: number;          // Maps to usesCount
  expiryDate: any;             // Maps to validUntil
  status: 'active' | 'expired' | 'disabled'; // Maps to isActive
  description?: string;
  applicableTo: 'all' | 'bundles' | 'subscription' | 'notes';
  createdAt: any;
  updatedAt: any;
}

export default function CouponManager() {
  const { currentUser } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);

  // ── DATA FETCHING ──
  const fetchCoupons = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/admin/list-data?type=coupons', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load coupons');
      setCoupons(json.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupon library');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // ── ACTIONS ──
  const handleSave = async (data: Partial<Coupon>) => {
    if (!data.code || !data.value) {
      toast.error('Code and Value are required');
      return;
    }

    if (!currentUser) {
      toast.error('Not authenticated');
      return;
    }

    setLoading(true);
    try {
      const token = await currentUser.getIdToken();

      const expiryDate = data.expiryDate;
      const validUntil = expiryDate
        ? (typeof expiryDate === 'string' ? expiryDate : (expiryDate as Date).toISOString?.() ?? null)
        : null;

      const payload: any = {
        id: data.id || undefined,
        code: data.code.toUpperCase(),
        discountType: data.type === 'percentage' ? 'percent' : 'flat',
        discountValue: Number(data.value),
        minOrder: Number(data.minOrderAmount || 0),
        maxUses: Number(data.usageLimit || 0),
        usesCount: data.usageCount || 0,
        validUntil,
        applicableTo: (data as any).applicableTo || 'all',
        isActive: data.status === 'active',
        description: data.description || '',
      };

      const res = await fetch('/api/admin/save-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save coupon');

      toast.success(data.id ? 'Coupon updated successfully' : 'New promotion launched');
      setIsEditorOpen(false);
      fetchCoupons();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save coupon');
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
        <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
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
          <span className="text-xs font-mono text-slate-500">{row.usageCount} / {row.usageLimit || '∞'}</span>
          <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-gold progress-bar-usage" 
              style={{ '--usage': `${Math.min(100, (row.usageCount / (row.usageLimit || 1)) * 100)}%` } as any} 
            />
          </div>
        </div>
      )
    },
    {
      key: 'expiry',
      label: 'Valid Until',
      sortable: true,
      render: (row) => {
        let dateStr = 'No Expiry';
        if (row.expiryDate) {
          const d = row.expiryDate?.toDate ? row.expiryDate.toDate() : new Date(row.expiryDate);
          if (!isNaN(d.getTime())) dateStr = format(d, 'MMM dd, yyyy');
        }
        return (
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {dateStr}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: '',
      className: 'w-10',
      render: (row) => (
        <button 
          onClick={(e) => { e.stopPropagation(); setEditingCoupon(row); setIsEditorOpen(true); }}
          className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-gold/10 hover:text-gold hover:border-gold/30 rounded-lg transition-all shadow-sm"
          aria-label="Edit coupon"
        >
          <Edit className="w-4 h-4" />
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
            <Ticket className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-slate-900">Coupon Manager</h1>
            <p className="text-sm text-slate-500 font-ui tracking-wide">Manage promotional codes, holiday discounts, and welcome offers</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCoupons}
            disabled={loading}
            className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-gold hover:shadow-sm rounded-xl transition-all shadow-sm"
            aria-label="Refresh coupons"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => { setEditingCoupon({ type: 'percentage', status: 'active', usageCount: 0 }); setIsEditorOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-ui font-bold rounded-xl shadow-lg hover:bg-slate-800 active:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5" /> New Promo Code
          </button>
        </div>
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
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-white border-l border-slate-200 shadow-2xl flex flex-col h-screen"
            >
              <div className="px-8 py-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="font-display text-xl text-slate-900">{editingCoupon?.id ? 'Edit Coupon' : 'Create Promotion'}</h2>
                  <p className="text-[10px] text-gold uppercase tracking-[0.2em] font-black mt-1">Pricing Engine</p>
                </div>
                <button onClick={() => setIsEditorOpen(false)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-400" aria-label="Close editor">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form 
                onSubmit={(e) => { e.preventDefault(); handleSave(editingCoupon || {}); }}
                className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar"
              >
                <div className="space-y-4">
                  <label htmlFor="coupon-code" className="input-label">Voucher Code</label>
                  <input 
                    id="coupon-code"
                    type="text" required
                    value={editingCoupon?.code || ''}
                    onChange={e => setEditingCoupon(v => ({ ...v, code: e.target.value.toUpperCase() }))}
                    className="admin-input font-mono font-bold text-lg tracking-widest text-gold selection:bg-gold/20" 
                    placeholder="e.g. EDULAW50"
                  />
                  <p className="text-[10px] text-slate-400">Letters and numbers only. Case insensitive.</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="discount-type" className="input-label">Discount Type</label>
                    <select 
                      id="discount-type"
                      value={editingCoupon?.type}
                      onChange={e => setEditingCoupon(v => ({ ...v, type: e.target.value as any }))}
                      className="admin-input"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="coupon-value" className="input-label">Discount Value</label>
                    <div className="relative">
                       {editingCoupon?.type === 'percentage' ? (
                          <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       ) : (
                          <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       )}
                       <input 
                        id="coupon-value"
                        type="number" required
                        value={editingCoupon?.value || ''}
                        onChange={e => setEditingCoupon(v => ({ ...v, value: Number(e.target.value) }))}
                        className="admin-input pl-10" 
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-6">
                   <h3 className="text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-black">Conversion Guardrails</h3>
                   <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="min-order" className="input-label">Min. Order (₹)</label>
                        <input 
                          id="min-order"
                          type="number"
                          value={editingCoupon?.minOrderAmount || ''}
                          onChange={e => setEditingCoupon(v => ({ ...v, minOrderAmount: Number(e.target.value) }))}
                          className="admin-input" 
                        />
                      </div>
                      <div>
                        <label htmlFor="usage-limit" className="input-label">Usage Limit (Total)</label>
                        <input 
                          id="usage-limit"
                          type="number"
                          value={editingCoupon?.usageLimit || ''}
                          onChange={e => setEditingCoupon(v => ({ ...v, usageLimit: Number(e.target.value) }))}
                          className="admin-input" 
                          placeholder="e.g. 100"
                        />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label htmlFor="expiry-date" className="input-label">Expiry Date</label>
                    <input 
                      id="expiry-date"
                      type="date"
                      value={editingCoupon?.expiryDate ? format(new Date(editingCoupon.expiryDate), 'yyyy-MM-dd') : ''}
                      onChange={e => setEditingCoupon(v => ({ ...v, expiryDate: e.target.value ? new Date(e.target.value) : null }))}
                      className="admin-input" 
                    />
                  </div>
                  <div className="space-y-4">
                    <label htmlFor="applicable-to" className="input-label">Applicable Range</label>
                    <select 
                      id="applicable-to"
                      value={(editingCoupon as any)?.applicableTo || 'all'}
                      onChange={e => setEditingCoupon(v => ({ ...v, applicableTo: e.target.value } as any))}
                      className="admin-input"
                    >
                      <option value="all">Entire Store</option>
                      <option value="notes">Individual Drafts</option>
                      <option value="bundles">Premium Bundles</option>
                      <option value="subscription">Subscriptions</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label htmlFor="promo-desc" className="input-label">Promotion Description</label>
                  <textarea 
                    id="promo-desc"
                    rows={2}
                    value={editingCoupon?.description || ''}
                    onChange={e => setEditingCoupon(v => ({ ...v, description: e.target.value }))}
                    className="admin-input resize-none" 
                    placeholder="Brief internal note about this promo..."
                  />
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                    <div>
                      <p className="text-sm text-slate-900 font-bold">Public Status</p>
                      <p className="text-xs text-slate-400 mt-1">Deactivated coupons cannot be redeemed</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editingCoupon?.status === 'active'}
                        onChange={e => setEditingCoupon(v => ({ ...v, status: e.target.checked ? 'active' : 'disabled' }))}
                        className="sr-only peer" 
                        aria-label="Toggle coupon status"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                    </label>
                  </div>
                </div>
              </form>

              <div className="p-8 border-t border-slate-200 bg-white flex items-center justify-end gap-4 shadow-[0_-12px_40px_rgba(0,0,0,0.05)]">
                <button type="button" onClick={() => setIsEditorOpen(false)} className="text-sm font-ui text-slate-400 hover:text-slate-900">Discard</button>
                <button 
                  type="button"
                  onClick={() => handleSave(editingCoupon || {})}
                  className="px-10 py-3.5 bg-slate-900 text-white font-ui font-black rounded-xl shadow-lg hover:bg-slate-800 active:scale-[1.02] flex items-center gap-2"
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
          @apply w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 font-ui placeholder:text-slate-300 focus:outline-none focus:border-gold/50 transition-all;
        }
        .input-label {
          @apply block text-[10px] font-ui text-slate-400 uppercase tracking-widest font-black mb-2 ml-1;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(201, 168, 76, 0.2); border-radius: 10px; }
        .progress-bar-usage { width: var(--usage); }
      `}</style>
    </div>
  );
}
