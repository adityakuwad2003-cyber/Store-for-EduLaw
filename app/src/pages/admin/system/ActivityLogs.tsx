import { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, Shield,
  History, User,
  Database, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  collection, query, orderBy, 
  getDocs, limit
} from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { DataTable } from '../../../components/admin/DataTable';
import type { Column } from '../../../components/admin/DataTable';
import { format } from 'date-fns';

interface ActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'REFUND' | 'PUBLISH';
  module: string;
  targetId: string;
  targetName: string;
  description: string;
  timestamp: Timestamp;
  ipAddress?: string;
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  // ── DATA FETCHING ──
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'admin_activity_logs'), orderBy('timestamp', 'desc'), limit(100));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ActivityLog[];
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to load audit trail');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const columns: Column<ActivityLog>[] = [
    {
      key: 'action',
      label: 'Operation',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            row.action === 'CREATE' ? 'bg-green-50 text-green-600 border border-green-100' :
            row.action === 'DELETE' ? 'bg-red-50 text-red-600 border border-red-100' :
            row.action === 'UPDATE' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
            row.action === 'LOGIN' ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-slate-100 text-slate-400'
          }`}>
            {row.action === 'LOGIN' ? <Zap className="w-4 h-4" /> : <Database className="w-4 h-4" />}
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-700">{row.action}</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{row.module}</p>
          </div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Event Details',
      render: (row) => (
        <div className="min-w-0">
          <p className="text-xs text-slate-900 font-ui line-clamp-1">{row.description}</p>
          <p className="text-[10px] text-slate-400 truncate mt-1">Target: {row.targetName} ({row.targetId.slice(0, 8)}...)</p>
        </div>
      )
    },
    {
      key: 'admin',
      label: 'Initiator',
      render: (row) => (
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
              <User className="w-3 h-3 text-slate-400" />
           </div>
           <span className="text-xs text-slate-600 font-bold">{row.adminName}</span>
        </div>
      )
    },
    {
      key: 'time',
      label: 'Timestamp',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col text-right">
           <span className="text-xs font-mono text-slate-500 font-bold">
              {row.timestamp?.toDate ? format(row.timestamp.toDate(), 'HH:mm:ss') : 'Just now'}
           </span>
           <span className="text-[10px] text-slate-300 uppercase tracking-widest font-black mt-0.5">
              {row.timestamp?.toDate ? format(row.timestamp.toDate(), 'MMM dd, yyyy') : ''}
           </span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-[#b8922a] flex items-center justify-center shadow-lg shadow-gold/20">
            <History className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-slate-900">Audit Logs</h1>
            <p className="text-sm text-slate-500 font-ui tracking-wide">Comprehensive immutable record of all administrative system interactions</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[10px] text-slate-900 font-bold uppercase tracking-widest outline-none focus:border-gold transition-all"
            aria-label="Filter activity logs"
          >
             <option value="ALL">All Operations</option>
             <option value="CREATE">Creation Only</option>
             <option value="DELETE">Deletions Only</option>
             <option value="LOGIN">Security Logs</option>
          </select>
          <button 
            onClick={fetchLogs}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-400 transition-all"
            aria-label="Refresh logs"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs.filter(l => filter === 'ALL' || l.action === filter)}
        loading={loading}
        keyField="id"
      />

      <div className="flex items-center gap-3 p-6 rounded-3xl bg-slate-50 border border-slate-100">
         <Shield className="w-5 h-5 text-gold shrink-0" />
         <p className="text-xs text-slate-400 leading-relaxed font-ui">
           Activity logs are stored for 180 days by default. For compliance audits, export the ledger as a signed PDF or CSV from the Reports Center.
         </p>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(201, 168, 176, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
