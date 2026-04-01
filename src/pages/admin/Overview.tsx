import { BarChart3, ShoppingCart, Users, BookOpen, Package, RefreshCw } from "lucide-react";
import { StatCard } from "../../components/admin/StatCard";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { useAdminStats } from "../../hooks/admin/useAdminStats";

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
  });
}

export default function Overview() {
  const { stats, loading, error, refresh } = useAdminStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          ⚠️ Error loading stats: {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Total Revenue"
          value={loading ? "..." : formatCurrency(stats?.totalRevenue ?? 0)}
          subtitle="All-time revenue"
          icon={BarChart3}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          loading={loading}
        />
        <StatCard
          title="Total Orders"
          value={loading ? "..." : String(stats?.totalOrders ?? 0)}
          subtitle={loading ? "" : `${stats?.ordersToday ?? 0} today`}
          icon={ShoppingCart}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          loading={loading}
        />
        <StatCard
          title="Unique Buyers"
          value={loading ? "..." : String(stats?.totalUsers ?? 0)}
          subtitle="Total paying users"
          icon={Users}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
          loading={loading}
        />
        <StatCard
          title="Notes in Catalog"
          value={loading ? "..." : String(stats?.totalNotes ?? 0)}
          subtitle="Live in Firestore"
          icon={BookOpen}
          iconColor="text-[#7b2d42]"
          iconBg="bg-[#f9e8ec]"
          loading={loading}
        />
        <StatCard
          title="Bundles"
          value={loading ? "..." : String(stats?.totalBundles ?? 0)}
          subtitle="Active bundles"
          icon={Package}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          loading={loading}
        />
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[#7b2d42]" />
            Recent Orders
          </h2>
          <span className="text-xs text-slate-400">Last 10 purchases</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Product", "Buyer (User ID)", "Amount", "Status", "Date", "Razorpay ID"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-slate-100 rounded w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                : (stats?.recentOrders ?? []).length === 0
                ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                      No orders yet. Share your marketplace to get your first sale! 🎉
                    </td>
                  </tr>
                )
                : stats!.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 max-w-[200px] truncate">{order.title}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs font-mono max-w-[120px] truncate">{order.userEmail}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{formatCurrency(order.price)}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(order.purchasedAt)}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs font-mono truncate max-w-[120px]">
                      {order.razorpay_payment_id ? (
                        <a
                          href={`https://dashboard.razorpay.com/app/payments/${order.razorpay_payment_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {order.razorpay_payment_id.slice(-8)}
                        </a>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
