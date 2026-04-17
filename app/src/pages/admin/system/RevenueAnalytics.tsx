import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  DollarSign,
  ShoppingBag,
  RefreshCw,
  MousePointer2,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  subDays,
  format,
  startOfDay,
  endOfDay,
  isWithinInterval,
  eachDayOfInterval,
} from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { DateRangePicker } from '../../../components/admin/DateRangePicker';
import { ExportButton } from '../../../components/admin/ExportButton';
import { useAuth } from '../../../contexts/AuthContext';

// ── Types ──────────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  title: string;
  type: string;
  price: number;
}

interface Order {
  id: string;
  orderId: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: 'captured' | 'refunded';
  method: string;
  createdAt: string | null;
}

interface ApiStats {
  todayRevenue: number;
  totalOrders: number;
  successRate: number;
  refundCount: number;
}

interface ApiResponse {
  orders: Order[];
  stats: ApiStats;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  note: 'Individual Notes',
  bundle: 'Premium Bundles',
  test: 'Mock Tests',
  template: 'Legal Templates',
};

const TYPE_COLORS: Record<string, string> = {
  note: 'bg-blue-400',
  bundle: 'bg-green-500',
  test: 'bg-gold',
  template: 'bg-slate-400',
};

function formatINR(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toFixed(0)}`;
}

function filterByRange(orders: Order[], range: DateRange | undefined): Order[] {
  if (!range?.from) return orders;
  const from = startOfDay(range.from);
  const to = endOfDay(range.to ?? range.from);
  return orders.filter((o) => {
    if (!o.createdAt) return false;
    const d = new Date(o.createdAt);
    return isWithinInterval(d, { start: from, end: to });
  });
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function RevenueAnalytics() {
  const { currentUser } = useAuth();

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [apiStats, setApiStats] = useState<ApiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/admin/list-data?type=orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ApiResponse = await res.json();
      setAllOrders(json.orders ?? []);
      setApiStats(json.stats ?? null);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Derived metrics ──────────────────────────────────────────────────────────

  const filteredOrders = filterByRange(allOrders, dateRange);
  const capturedOrders = filteredOrders.filter((o) => o.status === 'captured');

  const totalRevenue = capturedOrders.reduce((s, o) => s + o.totalAmount, 0);
  const avgOrderValue = capturedOrders.length > 0 ? totalRevenue / capturedOrders.length : 0;
  const conversionRate =
    apiStats != null ? `${apiStats.successRate.toFixed(1)}%` : 'N/A';
  const refundRate =
    apiStats && apiStats.totalOrders > 0
      ? (apiStats.refundCount / apiStats.totalOrders) * 100
      : 0;

  // ── Bar chart: revenue per day over the selected range (max 14 days shown) ──

  const chartDays: Date[] = (() => {
    const from = dateRange?.from ?? subDays(new Date(), 13);
    const to = dateRange?.to ?? new Date();
    const all = eachDayOfInterval({ start: from, end: to });
    // If more than 14 days, take last 14
    return all.length > 14 ? all.slice(all.length - 14) : all;
  })();

  const revenueByDay: number[] = chartDays.map((day) => {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    return capturedOrders
      .filter((o) => {
        if (!o.createdAt) return false;
        const d = new Date(o.createdAt);
        return isWithinInterval(d, { start: dayStart, end: dayEnd });
      })
      .reduce((s, o) => s + o.totalAmount, 0);
  });

  const maxRevDay = Math.max(...revenueByDay, 1);

  // ── Sales mix ────────────────────────────────────────────────────────────────

  const typeCounts: Record<string, number> = {};
  capturedOrders.forEach((o) => {
    const t = o.items[0]?.type ?? 'other';
    typeCounts[t] = (typeCounts[t] ?? 0) + 1;
  });

  const totalTyped = Object.values(typeCounts).reduce((a, b) => a + b, 0) || 1;

  const salesMix = ['note', 'bundle', 'test', 'template'].map((type) => ({
    type,
    label: TYPE_LABELS[type] ?? type,
    color: TYPE_COLORS[type] ?? 'bg-slate-300',
    count: typeCounts[type] ?? 0,
    pct: Math.round(((typeCounts[type] ?? 0) / totalTyped) * 100),
  }));

  // ── Recent transactions (last 10) ────────────────────────────────────────────

  const recentTx = [...filteredOrders]
    .sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    })
    .slice(0, 10);

  // ── Stat cards ───────────────────────────────────────────────────────────────

  const stats = [
    {
      label: 'Total Revenue',
      value: formatINR(totalRevenue),
      icon: DollarSign,
      color: 'text-gold',
    },
    {
      label: 'Avg. Order Val',
      value: formatINR(avgOrderValue),
      icon: ShoppingBag,
      color: 'text-blue-400',
    },
    {
      label: 'Success Rate',
      value: conversionRate,
      icon: MousePointer2,
      color: 'text-green-500',
    },
    {
      label: 'Refund Rate',
      value: `${refundRate.toFixed(1)}%`,
      icon: RefreshCw,
      color: 'text-red-400',
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-gold" />
          <p className="text-sm font-ui tracking-wide">Loading revenue data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4 text-red-400 max-w-sm text-center">
          <AlertCircle className="w-10 h-10" />
          <p className="text-sm font-ui">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-gold text-ink text-xs font-black rounded-xl hover:bg-[#b8922a] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full -mr-20 -mt-20" />

        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-[#b8922a] flex items-center justify-center shadow-2xl shadow-gold/20">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-slate-900">Revenue Analytics</h1>
            <p className="text-sm text-slate-500 font-ui tracking-wide">
              Monitor financial health and commercial performance metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <ExportButton
            data={filteredOrders}
            filename="revenue-report"
            label="Financial Export"
            variant="primary"
          />
        </div>
      </div>

      {/* ── KEY METRICS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:border-gold/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl bg-slate-50 group-hover:scale-110 transition-transform ${stat.color}`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-display text-slate-900 mb-1">{stat.value}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Revenue Growth Chart ── */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl text-slate-900">Revenue Growth</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">
                Daily trend visualization
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg">
                GROSS
              </button>
            </div>
          </div>

          {revenueByDay.every((v) => v === 0) ? (
            <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm font-ui">
              No captured orders in this date range.
            </div>
          ) : (
            <div className="h-[300px] w-full flex items-end justify-between gap-2 px-2">
              {chartDays.map((day, i) => {
                const val = revenueByDay[i];
                const heightPct = Math.max((val / maxRevDay) * 100, val > 0 ? 4 : 1);
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-4 group cursor-pointer"
                  >
                    <div className="relative w-full" style={{ height: '260px', display: 'flex', alignItems: 'flex-end' }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{ delay: i * 0.05, duration: 0.8 }}
                        className="w-full bg-gradient-to-t from-gold/5 via-gold/20 to-gold rounded-t-lg relative"
                      >
                        {val > 0 && (
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {formatINR(val)}
                          </div>
                        )}
                      </motion.div>
                    </div>
                    <span className="text-[8px] text-slate-300 font-mono rotate-45 md:rotate-0">
                      {format(day, 'dd MMM')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Sales Mix ── */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
          <div>
            <h3 className="font-display text-xl text-slate-900">Sales Mix</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">
              Product segment distribution
            </p>
          </div>

          <div className="space-y-6">
            {salesMix.map((seg, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">{seg.label}</span>
                  <span className="text-slate-900">
                    {seg.count} · {seg.pct}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${seg.pct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className={`h-full ${seg.color}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-4 h-4 text-gold" />
              <span className="text-[10px] text-slate-900 uppercase font-black tracking-widest">
                Trust Metrics
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-ui">
              {apiStats
                ? `${apiStats.successRate.toFixed(1)}% payment success rate. ${apiStats.refundCount} refund${apiStats.refundCount !== 1 ? 's' : ''} out of ${apiStats.totalOrders} total orders.`
                : 'Payment trust metrics unavailable.'}
            </p>
          </div>
        </div>
      </div>

      {/* ── RECENT TRANSACTIONS TABLE ── */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-display text-xl text-slate-900">Recent Transactions</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">
              Last 10 orders in selected range
            </p>
          </div>
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
            {filteredOrders.length} total
          </span>
        </div>

        {recentTx.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm font-ui">
            No transactions found in this date range.
          </div>
        ) : (
          <div className="space-y-4">
            {recentTx.map((order, i) => {
              const title = order.items[0]?.title ?? 'Unknown Product';
              const isCaptured = order.status === 'captured';
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 font-mono text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-900 font-bold truncate max-w-xs">{title}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 truncate max-w-xs">
                        {order.userEmail}
                        {order.createdAt
                          ? ` · ${format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm')}`
                          : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-mono text-gold font-bold">
                      {formatINR(order.totalAmount)}
                    </p>
                    <p
                      className={`text-[10px] font-bold uppercase mt-1 ${
                        isCaptured ? 'text-green-600' : 'text-red-500'
                      }`}
                    >
                      {isCaptured ? 'SUCCESS' : 'REFUNDED'}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(201, 168, 76, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}
