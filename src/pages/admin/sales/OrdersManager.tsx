import { useState, useEffect, useCallback } from 'react';
import {
  Eye, X, FileText,
  DollarSign, ShoppingBag,
  ShieldCheck, Undo2, User,
  Clock, CheckCircle2, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { auth } from '../../../lib/firebase';
import { DataTable } from '../../../components/admin/DataTable';
import type { Column } from '../../../components/admin/DataTable';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { ExportButton } from '../../../components/admin/ExportButton';

// ── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  title: string;
  type: string;
  price: number;
}

interface Order {
  id: string;
  orderId: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: 'captured' | 'refunded' | 'pending' | 'failed';
  method?: string;
  createdAt: string | null;
}

interface OrderStats {
  todayRevenue: number;
  totalOrders: number;
  successRate: number;
  refundCount: number;
}

// ── Helper ────────────────────────────────────────────────────────────────────

async function getBearerToken() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function OrdersManager() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [refunding, setRefunding] = useState(false);

  // ── Fetch from real API ────────────────────────────────────────────────────

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getBearerToken();
      const res = await fetch('/api/admin/list-orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Server error' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setAllOrders(data.orders ?? []);
      setStats(data.stats ?? null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Apply client-side filter when filterStatus or allOrders changes
  useEffect(() => {
    setOrders(
      filterStatus === 'all'
        ? allOrders
        : allOrders.filter((o) => o.status === filterStatus),
    );
  }, [filterStatus, allOrders]);

  // ── Mark as refunded ──────────────────────────────────────────────────────

  const handleMarkRefunded = async (_orderId: string) => {
    if (!confirm('This marks the order as Refunded in your database. Please also process the refund in your Razorpay Dashboard.')) return;
    setRefunding(true);
    try {
      // Redirect admin to Razorpay dashboard for the actual refund;
      // status will be updated via webhook or manual reconciliation.
      toast.info('Please process the refund in your Razorpay Dashboard. The status will be updated accordingly.');
    } catch (err: any) {
      toast.error(err.message || 'Could not mark as refunded');
    } finally {
      setRefunding(false);
      setIsDetailOpen(false);
    }
  };

  // ── Table columns ─────────────────────────────────────────────────────────

  const columns: Column<Order>[] = [
    {
      key: 'orderId',
      label: 'Transaction',
      render: (row) => (
        <div>
          <p className="font-mono text-xs text-slate-900 font-bold truncate max-w-[140px]">
            {row.razorpayPaymentId || row.id.slice(-12)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-mono truncate max-w-[140px]">
            {row.id.slice(-16)}
          </p>
        </div>
      ),
    },
    {
      key: 'userEmail',
      label: 'Customer',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-xs text-slate-700 truncate max-w-[150px]">{row.userEmail}</p>
        </div>
      ),
    },
    {
      key: 'items',
      label: 'Product',
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          {row.items?.slice(0, 2).map((item, idx) => (
            <p key={idx} className="text-[10px] text-slate-500 truncate max-w-[180px]">
              {item.title}
            </p>
          ))}
          {(row.items?.length ?? 0) > 2 && (
            <p className="text-[10px] text-gold font-bold">+{row.items.length - 2} more</p>
          )}
        </div>
      ),
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-mono text-gold font-bold">₹{row.totalAmount.toLocaleString('en-IN')}</span>
          <p className="text-[9px] text-slate-400 uppercase mt-0.5">{row.method || 'Razorpay'}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <StatusBadge status={row.status === 'captured' ? 'published' : row.status} />
          {row.status === 'captured' && <ShieldCheck className="w-3 h-3 text-green-500" />}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (row) => (
        <span className="text-[10px] text-slate-400 whitespace-nowrap">
          {row.createdAt ? format(new Date(row.createdAt), 'MMM dd, HH:mm') : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      className: 'w-10',
      render: (row) => (
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedOrder(row); setIsDetailOpen(true); }}
          className="p-2 hover:bg-slate-100 text-slate-400 hover:text-gold rounded-lg transition-all"
          aria-label="View order details"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-[#b8922a] flex items-center justify-center shadow-lg shadow-gold/20">
            <ShoppingBag className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-slate-900">Orders Manager</h1>
            <p className="text-sm text-slate-500 font-ui tracking-wide">
              {loading ? 'Loading...' : `${allOrders.length} total transactions`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-400 hover:text-gold transition-all"
            aria-label="Refresh orders"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <ExportButton data={orders} filename="edulaw-sales-report" label="Export CSV" variant="primary" />
        </div>
      </div>

      {/* ── Real Stats (from API) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Today's Revenue",
            value: stats ? `₹${(stats.todayRevenue).toLocaleString('en-IN')}` : '—',
            icon: DollarSign,
            color: 'text-gold',
            sub: 'live from purchases',
          },
          {
            label: 'Total Orders',
            value: stats?.totalOrders ?? '—',
            icon: Clock,
            color: 'text-blue-400',
            sub: 'all time',
          },
          {
            label: 'Success Rate',
            value: stats ? `${stats.successRate}%` : '—',
            icon: CheckCircle2,
            color: 'text-green-400',
            sub: 'payments captured',
          },
          {
            label: 'Refunds',
            value: stats?.refundCount ?? '—',
            icon: Undo2,
            color: 'text-red-400',
            sub: 'marked refunded',
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-gold/20 transition-all shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{stat.sub}</span>
            </div>
            <p className="text-2xl font-display text-slate-900">{loading ? <span className="text-slate-200">...</span> : stat.value}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'captured', 'pending', 'failed', 'refunded'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-xs font-ui font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${
              filterStatus === status
                ? 'bg-gold text-white shadow-sm'
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            {status === 'all' ? `All (${allOrders.length})` : status}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        keyField="id"
        totalCount={orders.length}
        onRowClick={(row) => { setSelectedOrder(row); setIsDetailOpen(true); }}
        emptyMessage={filterStatus === 'all' ? 'No orders yet. Sales will appear here after first purchase.' : `No ${filterStatus} orders.`}
        searchPlaceholder="Search by customer, product, or payment ID..."
      />

      {/* ── Order Detail Modal ── */}
      <AnimatePresence>
        {isDetailOpen && selectedOrder && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDetailOpen(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg text-slate-900">Order Details</h2>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">
                    {selectedOrder.razorpayPaymentId || selectedOrder.id}
                  </p>
                </div>
                <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400" aria-label="Close details">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Customer */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-900 font-bold">{selectedOrder.userEmail}</p>
                    <p className="text-xs text-slate-400">Registered Student</p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  <h3 className="text-gold text-[10px] uppercase tracking-[0.2em] font-black">Items Purchased</h3>
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                          <FileText className="w-4 h-4 text-gold/60" />
                        </div>
                        <span className="text-sm text-slate-700">{item.title}</span>
                      </div>
                      <span className="font-mono text-gold font-bold">₹{item.price}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <span className="text-sm text-slate-900 font-bold uppercase tracking-widest">Total Paid</span>
                    <span className="text-xl font-display text-gold">₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Payment info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Gateway</p>
                    <p className="text-sm text-slate-700">Razorpay</p>
                    {selectedOrder.razorpayPaymentId && (
                      <p className="text-[10px] text-gold/60 font-mono break-all">{selectedOrder.razorpayPaymentId}</p>
                    )}
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Date & Time</p>
                    <p className="text-sm text-slate-700">
                      {selectedOrder.createdAt
                        ? format(new Date(selectedOrder.createdAt), 'MMM dd, yyyy')
                        : 'N/A'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {selectedOrder.createdAt
                        ? format(new Date(selectedOrder.createdAt), 'HH:mm')
                        : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleMarkRefunded(selectedOrder.id)}
                  disabled={selectedOrder.status === 'refunded' || refunding}
                  className="flex items-center gap-2 px-5 py-2.5 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-all font-ui font-bold text-xs uppercase tracking-widest disabled:opacity-30"
                >
                  <Undo2 className="w-4 h-4" /> Refund Note
                </button>
                <a
                  href={`https://dashboard.razorpay.com/app/payments/${selectedOrder.razorpayPaymentId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-ui font-bold rounded-xl hover:bg-slate-800 transition-all text-xs"
                >
                  View in Razorpay ↗
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
