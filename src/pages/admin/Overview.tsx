import { BarChart3, TrendingUp, Users, ShoppingCart, Activity } from 'lucide-react';


export default function Overview() {

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-parchment">Welcome back, Admin</h1>
          <p className="text-parchment/60 font-ui text-sm mt-1">Here's what's happening with your store today.</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-parchment/40 font-ui uppercase tracking-widest font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: '₹45,200', trend: '+12%', icon: BarChart3, color: 'text-green-400' },
          { label: 'Orders Today', value: '14', trend: '+2', icon: ShoppingCart, color: 'text-blue-400' },
          { label: 'Active Users', value: '1,248', trend: '+54', icon: Users, color: 'text-purple-400' },
          { label: 'Conversion Rate', value: '3.2%', trend: '-0.4%', icon: Activity, color: 'text-yellow-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-ink rounded-lg border border-white/5">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                stat.trend.startsWith('+') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-parchment/60 font-ui pl-1 text-sm">{stat.label}</p>
              <h3 className="text-2xl font-display text-parchment pl-1 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Placeholder for Revenue Chart */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 h-[400px] flex flex-col justify-center items-center">
          <TrendingUp className="w-12 h-12 text-parchment/20 mb-4" />
          <p className="text-parchment/50 font-ui text-sm">Revenue Chart (Coming Soon)</p>
          <p className="text-parchment/30 text-xs mt-2 max-w-sm text-center">
            Phase 2 will integrate live connection to Firebase orders collection for real-time charting.
          </p>
        </div>

        {/* Placeholder for Recent Orders */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-[400px] flex flex-col">
          <h3 className="font-display text-lg text-parchment mb-4 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-gold" /> Recent Orders
          </h3>
          <div className="flex-1 overflow-auto pr-2 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-ink/50 border border-white/5 rounded-xl">
                <div>
                  <p className="text-sm font-ui text-parchment font-medium">BNS Complete Notes</p>
                  <p className="text-xs text-parchment/40">user{i}@example.com</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gold">₹299</p>
                  <p className="text-xs text-green-400">Paid</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
