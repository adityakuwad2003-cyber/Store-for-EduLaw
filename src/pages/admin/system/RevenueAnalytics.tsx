import { useState } from 'react';
import { 
  BarChart3, 
  DollarSign, ShoppingBag,
  RefreshCw, MousePointer2, ArrowUpRight,
  ArrowDownRight, ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  subDays, format 
} from 'date-fns';
import { DateRangePicker } from '../../../components/admin/DateRangePicker';
import { ExportButton } from '../../../components/admin/ExportButton';

interface RevenueStat {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: any;
  color: string;
}

export default function RevenueAnalytics() {
  const [dateRange, setDateRange] = useState<any>({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  const stats: RevenueStat[] = [
    { label: 'Total Revenue', value: '₹14.2L', change: '+12.5%', trend: 'up', icon: DollarSign, color: 'text-gold' },
    { label: 'Avg. Order Val', value: '₹1,240', change: '+2.1%', trend: 'up', icon: ShoppingBag, color: 'text-blue-400' },
    { label: 'Conversion Rate', value: '4.8%', change: '-0.3%', trend: 'down', icon: MousePointer2, color: 'text-green-500' },
    { label: 'Refund Rate', value: '0.4%', change: '-12%', trend: 'up', icon: RefreshCw, color: 'text-red-400' },
  ];

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
            <p className="text-sm text-slate-500 font-ui tracking-wide">Monitor financial health and commercial performance metrics</p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <ExportButton data={[]} filename="revenue-report" label="Financial Export" variant="primary" />
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
              <div className={`p-3 rounded-xl bg-slate-50 group-hover:scale-110 transition-transform ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${
                stat.trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <p className="text-3xl font-display text-slate-900 mb-1">{stat.value}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Revenue Chart (Visualization) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
          <div className="flex items-center justify-between">
             <div>
               <h3 className="font-display text-xl text-slate-900">Revenue Growth</h3>
               <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Daily trend visualization</p>
             </div>
             <div className="flex gap-2">
                <button className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg">GROSS</button>
                <button className="px-3 py-1 bg-slate-100 text-slate-400 text-[10px] font-black rounded-lg">NET</button>
             </div>
          </div>

          <div className="h-[300px] w-full flex items-end justify-between gap-2 px-2">
             {[40, 65, 45, 80, 55, 90, 70, 85, 60, 100, 75, 95, 65, 85].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group cursor-pointer">
                   <div className="relative w-full">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${val}%` }}
                        transition={{ delay: i * 0.05, duration: 1 }}
                        className="w-full bg-gradient-to-t from-gold/5 via-gold/20 to-gold rounded-t-lg relative"
                      >
                         <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            ₹{val * 100}
                         </div>
                      </motion.div>
                   </div>
                   <span className="text-[8px] text-slate-300 font-mono rotate-45 md:rotate-0">
                      {format(subDays(new Date(), 14 - i), 'dd MMM')}
                   </span>
                </div>
             ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
           <div>
             <h3 className="font-display text-xl text-slate-900">Sales Mix</h3>
             <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Product segment distribution</p>
           </div>

           <div className="space-y-6">
             {[
               { label: 'Exams & Mock Tests', share: 45, color: 'bg-gold' },
               { label: 'Judiciary Notes', share: 30, color: 'bg-blue-400' },
               { label: 'Premium Bundles', share: 15, color: 'bg-green-500' },
               { label: 'Legal Templates', share: 10, color: 'bg-slate-200' },
             ].map((seg, i) => (
               <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                     <span className="text-slate-400">{seg.label}</span>
                     <span className="text-slate-900">{seg.share}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${seg.share}%` }}
                        className={`h-full ${seg.color}`}
                     />
                  </div>
               </div>
             ))}
           </div>

           <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                 <ShieldCheck className="w-4 h-4 text-gold" />
                 <span className="text-[10px] text-slate-900 uppercase font-black tracking-widest">Trust Metrics</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-ui">
                98.2% Payment success rate via Razorpay. Your average settlement time is 2.4 days.
              </p>
           </div>
        </div>
      </div>

      {/* ── RECENT TRANSACTIONS MINI-TABLE ── */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
         <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-display text-xl text-slate-900">High Value Sales</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Transactions exceeding ₹2,500</p>
            </div>
            <button className="text-[10px] text-gold uppercase font-black tracking-widest hover:underline">View All Sales</button>
         </div>
         
         <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all cursor-pointer">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 font-mono text-xs font-bold">
                       {i + 1}
                    </div>
                    <div>
                       <p className="text-sm text-slate-900 font-bold">Judiciary Platinum Bundle</p>
                       <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Adv. Rahul Sharma · rsharma@gmail.com</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-sm font-mono text-gold font-bold">₹4,999</p>
                    <p className="text-[10px] text-green-600 font-bold uppercase mt-1">SUCCESS</p>
                 </div>
              </div>
            ))}
         </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(201, 168, 76, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}
