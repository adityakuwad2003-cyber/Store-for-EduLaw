import { useState, useEffect, useCallback } from 'react';
import { 
  Eye, X, FileText,
  DollarSign, ShoppingBag, 
  ShieldCheck, Undo2, User,
  Clock, CheckCircle2, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  collection, query, orderBy, 
  getDocs, doc, updateDoc, 
  where, limit 
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { DataTable } from '../../../components/admin/DataTable';
import type { Column } from '../../../components/admin/DataTable';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { DateRangePicker } from '../../../components/admin/DateRangePicker';
import { ExportButton } from '../../../components/admin/ExportButton';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

interface Order {
  id: string;
  orderId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  userId: string;
  userEmail: string;
  items: {
    id: string;
    title: string;
    type: 'note' | 'bundle' | 'template' | 'mock_test';
    price: number;
  }[];
  totalAmount: number;
  currency: string;
  status: 'captured' | 'failed' | 'refunded' | 'pending';
  method?: string;
  createdAt: any;
  updatedAt?: any;
}

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Filters
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined
  });
  const [filterStatus, setFilterStatus] = useState('all');

  // ── DATA FETCHING ──
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(50));
      
      if (filterStatus !== 'all') {
        q = query(q, where('status', '==', filterStatus));
      }

      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ── ACTIONS ──
  const handleRefund = async (orderId: string) => {
    if (!confirm('This will mark the order as Refunded in the database. Please ensure you also process the refund in Razorpay Dashboard.')) return;
    
    setLoading(true);
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'refunded',
        updatedAt: new Date()
      });
      toast.success('Order status updated to Refunded');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<Order>[] = [
    {
      key: 'orderId',
      label: 'Transaction ID',
      render: (row) => (
        <div>
          <p className="font-mono text-xs text-parchment font-bold">{row.orderId || row.id}</p>
          <p className="text-[10px] text-parchment/30 uppercase tracking-[0.2em] mt-1">{row.razorpayPaymentId || 'Manual/Pending'}</p>
        </div>
      )
    },
    {
      key: 'userEmail',
      label: 'Customer',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
            <User className="w-4 h-4 text-parchment/40" />
          </div>
          <p className="text-xs text-parchment/80 font-medium truncate max-w-[140px]">{row.userEmail}</p>
        </div>
      )
    },
    {
      key: 'items',
      label: 'Product(s)',
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          {row.items?.slice(0, 2).map((item, idx) => (
            <p key={idx} className="text-[10px] text-parchment/60 truncate max-w-[180px]">
              {item.title}
            </p>
          ))}
          {row.items?.length > 2 && <p className="text-[10px] text-gold font-bold">+{row.items.length - 2} more items</p>}
        </div>
      )
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-mono text-gold font-bold">₹{row.totalAmount}</span>
          <span className="text-[10px] text-parchment/30 uppercase">{row.method || 'Online'}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <div className="flex items-center gap-2">
           <StatusBadge status={row.status === 'captured' ? 'published' : row.status} />
           {row.status === 'captured' && <ShieldCheck className="w-3 h-3 text-green-500" aria-label="Payment Verified" />}
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (row) => (
        <div className="text-[10px] text-parchment/40 font-ui uppercase tracking-widest whitespace-nowrap">
          {row.createdAt?.toDate ? format(row.createdAt.toDate(), 'MMM dd, HH:mm') : 'Recently'}
        </div>
      )
    },
    {
      key: 'actions',
      label: '',
      className: 'w-10',
      render: (row) => (
        <button 
          onClick={(e) => { e.stopPropagation(); setSelectedOrder(row); setIsDetailOpen(true); }}
          className="p-2 hover:bg-gold/10 text-parchment/40 hover:text-gold rounded-lg transition-all"
        >
          <Eye className="w-4 h-4" />
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
            <ShoppingBag className="w-7 h-7 text-ink" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-parchment">Orders Manager</h1>
            <p className="text-sm text-parchment/40 font-ui tracking-wide">Monitor sales, manage refunds, and track customer lifetime value</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <ExportButton data={orders} filename="edulaw-sales-report" label="Sales Export" variant="primary" />
        </div>
      </div>

      {/* ── QUICK STATS ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Today Sales', value: '₹12,450', change: '+12%', icon: DollarSign, color: 'text-gold' },
          { label: 'Active Orders', value: orders.length, change: 'Running', icon: Clock, color: 'text-blue-400' },
          { label: 'Success Rate', value: '98.4%', change: '+0.2%', icon: CheckCircle2, color: 'text-green-500' },
          { label: 'Refunds', value: '2', change: '-40%', icon: Undo2, color: 'text-red-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">{stat.change}</span>
            </div>
            <p className="text-2xl font-display text-parchment">{stat.value}</p>
            <p className="text-[10px] text-parchment/40 uppercase tracking-widest font-black mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── FILTER BAR ── */}
      <div className="flex items-center gap-2 px-2 overflow-x-auto pb-2 custom-scrollbar">
        {['all', 'captured', 'pending', 'failed', 'refunded'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-xs font-ui font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              filterStatus === status 
                ? 'bg-gold text-ink' 
                : 'bg-white/5 text-parchment/40 hover:bg-white/10 hover:text-parchment'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        keyField="id"
        onRowClick={(row) => { setSelectedOrder(row); setIsDetailOpen(true); }}
      />

      {/* ── ORDER DETAIL MODAL ── */}
      <AnimatePresence>
        {isDetailOpen && selectedOrder && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDetailOpen(false)}
              className="absolute inset-0 bg-ink/80 backdrop-blur-md" 
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-ink border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
                <div>
                   <h2 className="font-display text-xl text-parchment">Order Details</h2>
                   <p className="text-[10px] text-parchment/40 uppercase tracking-widest font-bold mt-1">Order ID: {selectedOrder.orderId}</p>
                </div>
                <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-parchment/40">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Customer Info */}
                <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-parchment font-bold">{selectedOrder.userEmail}</p>
                      <p className="text-xs text-parchment/40">Registered Student</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-parchment/40 uppercase tracking-widest">Signed Up via</p>
                    <p className="text-xs text-parchment font-medium">Google Auth</p>
                  </div>
                </div>

                {/* Items Purchased */}
                <div className="space-y-4">
                  <h3 className="text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-black">Purchase Narrative</h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white/5 rounded-lg">
                            <FileText className="w-4 h-4 text-gold/60" />
                          </div>
                          <span className="text-sm text-parchment/80 font-medium">{item.title}</span>
                        </div>
                        <span className="text-sm font-mono text-parchment/60 font-bold">₹{item.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-sm text-parchment font-bold uppercase tracking-widest">Total Amount Paid</span>
                    <span className="text-2xl font-display text-gold">₹{selectedOrder.totalAmount}</span>
                  </div>
                </div>

                {/* Payment Evidence */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <p className="text-[10px] text-parchment/40 uppercase tracking-widest font-bold">Payment Vendor</p>
                    <p className="text-sm text-parchment font-medium">Razorpay Gateway</p>
                    <p className="text-[10px] text-gold/60 font-mono break-all">{selectedOrder.razorpayPaymentId}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <p className="text-[10px] text-parchment/40 uppercase tracking-widest font-bold">Verification Date</p>
                    <p className="text-sm text-parchment font-medium">
                      {selectedOrder.createdAt?.toDate ? format(selectedOrder.createdAt.toDate(), 'MMMM dd, yyyy HH:mm') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white/[0.02] border-t border-white/10 flex items-center justify-between">
                <button 
                  onClick={() => handleRefund(selectedOrder.id)}
                  disabled={selectedOrder.status === 'refunded'}
                  className="flex items-center gap-2 px-6 py-3 border border-red-500/30 text-red-500 rounded-xl hover:bg-red-500/10 transition-all font-ui font-bold text-xs uppercase tracking-widest disabled:opacity-30"
                >
                  <Undo2 className="w-4 h-4" /> Issue Manual Refund
                </button>
                <div className="flex gap-4">
                   <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-parchment/40" title="Send Receipt">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button className="flex items-center gap-2 px-8 py-3 bg-white/10 text-parchment font-ui font-bold rounded-xl hover:bg-white/20 transition-all">
                    Download Invoice
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(201, 168, 76, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
