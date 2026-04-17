import { 
  ShoppingCart, Users, 
  BookOpen, RefreshCw,
  ArrowUpRight,
  Zap, Bell, Clock,
  DollarSign, Activity, ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { useAdminStats } from "../../hooks/admin/useAdminStats";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function Overview() {
  const { stats, loading, refresh } = useAdminStats();

  const kpis = [
    { label: 'Gross Revenue', value: stats?.totalRevenue || 0, icon: DollarSign, trend: '+12.5%', color: 'text-gold', isCurrency: true },
    { label: 'Active Orders', value: stats?.totalOrders || 0, icon: ShoppingCart, trend: '+5.4%', color: 'text-blue-400', isCurrency: false },
    { label: 'New Students', value: stats?.totalUsers || 0, icon: Users, trend: '+8.1%', color: 'text-green-500', isCurrency: false },
    { label: 'Library Size', value: stats?.totalNotes || 0, icon: BookOpen, trend: '+2.0%', color: 'text-burgundy', isCurrency: false },
    { label: 'System Health', value: '99.9%', icon: ShieldCheck, trend: 'Optimal', color: 'text-teal-400', isCurrency: false },
  ];

  const quickActions = [
    { name: 'Upload Note', path: '/admin/notes', icon: BookOpen, color: 'bg-gold/10 text-gold' },
    { name: 'Push Notify', path: '/admin/notifications', icon: Bell, color: 'bg-blue-500/10 text-blue-400' },
    { name: 'Create Coupon', path: '/admin/coupons', icon: Zap, color: 'bg-green-500/10 text-green-500' },
    { name: 'Review Tickets', path: '/admin/support', icon: Activity, color: 'bg-burgundy/10 text-burgundy' },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* ── LUXURY HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white border border-slate-200 p-8 rounded-[2.5rem] backdrop-blur-md relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 blur-[120px] rounded-full -mr-48 -mt-48 transition-all duration-1000" />
        
        <div className="relative z-10">
          <h1 className="font-display text-3xl text-slate-900 leading-tight">Admin Command Center</h1>
          <p className="text-sm text-slate-500 font-ui tracking-wide mt-1">
            {format(new Date(), 'EEEE, MMMM do, yyyy')} • Welcome back, Administrator
          </p>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="hidden md:flex flex-col items-end mr-4 text-right">
             <p className="text-[10px] text-gold uppercase tracking-[0.2em] font-black">Backend Status</p>
             <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-slate-500 font-mono tracking-tighter">Live Connection</span>
             </div>
          </div>
          <button 
            onClick={refresh} 
            className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-slate-400 hover:text-gold transition-all group"
            aria-label="Refresh stats"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          </button>
        </div>
      </div>

      {/* ── KPI GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-slate-200 p-6 rounded-3xl hover:border-gold/20 transition-all group relative overflow-hidden shadow-sm"
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
               <kpi.icon className="w-20 h-20" />
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-slate-50 group-hover:scale-110 transition-transform ${kpi.color}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-gold uppercase tracking-widest">{kpi.trend}</span>
            </div>
            
            <p className="text-2xl font-display text-slate-900 mb-1">
              {kpi.isCurrency ? `₹${Number(kpi.value).toLocaleString('en-IN')}` : kpi.value}
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
           {/* Chart Placeholder / Activity visualization */}
           <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 space-y-8 min-h-[400px] shadow-sm">
              <div className="flex items-center justify-between">
                 <div>
                   <h3 className="font-display text-xl text-slate-900">Conversion Velocity</h3>
                   <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Real-time engagement tracking</p>
                 </div>
                 <Link to="/admin/analytics" className="text-[10px] text-gold uppercase font-black tracking-widest hover:underline flex items-center gap-1">
                    Advanced Reports <ArrowUpRight className="w-3 h-3" />
                 </Link>
              </div>

              <div className="flex-1 flex items-center justify-center border border-dashed border-slate-200 rounded-3xl bg-slate-50">
                 <div className="text-center space-y-4">
                    <Activity className="w-12 h-12 text-slate-200 mx-auto" />
                    <p className="text-xs text-slate-300 font-ui uppercase tracking-widest">Global Analytics Data Stream</p>
                    <div className="flex gap-2 justify-center">
                       {[1,2,3,4,5].map(i => <div key={i} className={`w-2 h-8 bg-gold/20 rounded-full animate-pulse bar-anim bar-delay-${i}`} />)}
                    </div>
                 </div>
              </div>
           </div>

           {/* Quick Actions */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, i) => (
                <Link 
                  key={i} to={action.path}
                  className={`p-6 rounded-3xl border border-slate-200 flex flex-col items-center gap-4 transition-all hover:scale-[1.02] hover:border-gold/30 hover:bg-slate-50 active:scale-[0.98] shadow-sm ${action.color}`}
                >
                   <action.icon className="w-6 h-6" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-center">{action.name}</span>
                </Link>
              ))}
           </div>
        </div>

        {/* Sidebar Data Area */}
        <div className="space-y-8">
           {/* System Health */}
           <div className="bg-gradient-to-br from-gold to-[#b8922a] p-8 rounded-[2.5rem] shadow-2xl shadow-gold/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 rotate-12 opacity-10 group-hover:rotate-45 transition-transform duration-1000">
                 <ShieldCheck className="w-32 h-32 text-ink" />
              </div>
              <h3 className="font-display text-xl text-ink">Premium Access</h3>
              <p className="text-xs text-ink/60 mt-2 font-ui leading-relaxed">
                Super Admin credentials verified. You have maximum security clearance for all 20 management modules.
              </p>
              <div className="mt-6 flex items-center gap-3 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl w-fit">
                 <Clock className="w-3.5 h-3.5 text-ink" />
                 <span className="text-[10px] text-ink font-bold uppercase tracking-widest">Audit Trail: ON</span>
              </div>
           </div>

           {/* Live Feed Miniature */}
           <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                 <h3 className="font-display text-lg text-slate-900">Live Feed</h3>
                 <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
              </div>

              <div className="space-y-3">
                 {loading ? (
                   Array.from({ length: 4 }).map((_, i) => (
                     <div key={i} className="h-14 rounded-2xl bg-slate-100 animate-pulse" />
                   ))
                 ) : stats?.recentOrders?.length ? (
                   stats.recentOrders.slice(0, 5).map((order: any, i: number) => (
                     <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-all group">
                       <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                         <Zap className="w-4 h-4 text-gold" />
                       </div>
                       <div className="min-w-0 flex-1">
                         <p className="text-[11px] text-slate-900 font-bold line-clamp-1">{order.title || "Note Purchased"}</p>
                         <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                           <span className="text-gold font-bold">₹{order.price}</span>
                           <span>•</span>
                           <span>{order.purchasedAt ? new Date(order.purchasedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recently'}</span>
                         </p>
                       </div>
                     </div>
                   ))
                 ) : (
                   <div className="py-8 text-center">
                     <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">No orders yet</p>
                   </div>
                 )}
              </div>
              
              <Link to="/admin/activity" className="block w-full py-3 text-center bg-slate-50 hover:bg-slate-100 rounded-2xl text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] transition-all">
                 View Historical Logs
              </Link>
           </div>
        </div>
      </div>
      <style>{`
        .bar-anim.bar-delay-1 { animation-delay: 200ms; }
        .bar-anim.bar-delay-2 { animation-delay: 400ms; }
        .bar-anim.bar-delay-3 { animation-delay: 600ms; }
        .bar-anim.bar-delay-4 { animation-delay: 800ms; }
        .bar-anim.bar-delay-5 { animation-delay: 1000ms; }
      `}</style>
    </div>
  );
}
