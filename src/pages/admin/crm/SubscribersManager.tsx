import { useState, useEffect, useCallback } from 'react';
import { 
  Users, RefreshCw, X, User,
  Mail, Crown, Ban, CheckCircle2, 
  MoreVertical, BookOpen, ClipboardCheck, 
  History, Zap, Gift, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  collection, query, orderBy, 
  getDocs, doc, updateDoc, 
  Timestamp, limit, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { DataTable } from '../../../components/admin/DataTable';
import type { Column } from '../../../components/admin/DataTable';
import { ExportButton } from '../../../components/admin/ExportButton';
import { format } from 'date-fns';

interface Student {
  id: string;
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  subscription?: {
    planId: string;
    expiresAt: any;
    status: 'active' | 'expired' | 'none';
  };
  stats: {
    notesPurchased: number;
    testsAttempted: number;
    lastLogin: any;
  };
  isBanned?: boolean;
  createdAt: any;
}

export default function SubscribersManager() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // ── DATA FETCHING ──
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(50));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        // Mocking some stats if missing in real DB for UI demonstration
        stats: doc.data().stats || { notesPurchased: 0, testsAttempted: 0, lastLogin: doc.data().createdAt?.toDate() || new Date() }
      })) as Student[];
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load student database');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // ── ACTIONS ──
  const handleBanToggle = async (studentId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'unban' : 'ban';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', studentId), {
        isBanned: !currentStatus,
        updatedAt: serverTimestamp()
      });
      toast.success(`User ${action}ned successfully`);
      fetchStudents();
    } catch (error) {
      toast.error('Failed to update user status');
    } finally {
      setLoading(false);
    }
  };

  const handleGiftSub = async (studentId: string) => {
    const plan = prompt('Enter Plan ID (e.g. platinum_annual):');
    if (!plan) return;
    
    setLoading(true);
    try {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 365); // Default 1 year
      
      await updateDoc(doc(db, 'users', studentId), {
        subscription: {
          planId: plan,
          expiresAt: Timestamp.fromDate(expiry),
          status: 'active'
        },
        updatedAt: serverTimestamp()
      });
      toast.success('Subscription granted successfully');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to grant subscription');
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<Student>[] = [
    {
      key: 'user',
      label: 'Student',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center">
            {row.photoURL ? (
              <img src={row.photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-parchment/20" />
            )}
          </div>
          <div>
            <p className="font-bold text-parchment truncate max-w-[150px]">{row.displayName || 'Anonymous User'}</p>
            <p className="text-[10px] text-parchment/40 lowercase tracking-widest">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'subscription',
      label: 'Membership',
      render: (row) => (
        <div className="flex flex-col gap-1">
          {row.subscription?.status === 'active' ? (
            <>
              <div className="flex items-center gap-1.5 text-gold text-[10px] font-bold uppercase tracking-widest">
                <Crown className="w-3 h-3 fill-gold" /> {row.subscription.planId.replace('_', ' ')}
              </div>
              <p className="text-[10px] text-parchment/30">Expires {row.subscription.expiresAt?.toDate ? format(row.subscription.expiresAt.toDate(), 'MMM dd, yyyy') : 'N/A'}</p>
            </>
          ) : (
             <span className="text-[10px] text-parchment/30 font-bold uppercase tracking-widest">Standard Tier</span>
          )}
        </div>
      )
    },
    {
      key: 'activity',
      label: 'Activity',
      render: (row) => (
        <div className="flex items-center gap-4 text-[10px] text-parchment/40">
          <div className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {row.stats?.notesPurchased || 0}</div>
          <div className="flex items-center gap-1"><ClipboardCheck className="w-3.5 h-3.5" /> {row.stats?.testsAttempted || 0}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Access',
      render: (row) => row.isBanned ? (
        <span className="px-2 py-1 rounded bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
          <Ban className="w-3 h-3" /> Blocked
        </span>
      ) : (
        <span className="px-2 py-1 rounded bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Active
        </span>
      )
    },
    {
      key: 'lastLogin',
      label: 'Last Seen',
      sortable: true,
      render: (row) => (
        <span className="text-[10px] text-parchment/40 uppercase tracking-widest font-bold">
          {row.stats?.lastLogin ? format(new Date(row.stats.lastLogin), 'MMM dd') : 'N/A'}
        </span>
      )
    },
    {
      key: 'actions',
      label: '',
      className: 'w-10',
      render: (row) => (
        <button 
          onClick={(e) => { e.stopPropagation(); setSelectedStudent(row); setIsProfileOpen(true); }}
          className="p-2 hover:bg-gold/10 text-parchment/40 hover:text-gold rounded-lg transition-all"
        >
          <MoreVertical className="w-4 h-4" />
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
            <Users className="w-7 h-7 text-ink" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-parchment">Subscribers Manager</h1>
            <p className="text-sm text-parchment/40 font-ui tracking-wide">Manage your student community, memberships, and learning access</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchStudents}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-parchment/40 transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <ExportButton data={students} filename="edulaw-students-db" label="Export DB" variant="secondary" />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        keyField="id"
        onRowClick={(row) => { setSelectedStudent(row); setIsProfileOpen(true); }}
      />

      {/* ── STUDENT PROFILE SLIDE-OVER ── */}
      <AnimatePresence>
        {isProfileOpen && selectedStudent && (
          <div className="fixed inset-0 z-[110] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-md" 
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-ink border-l border-white/10 shadow-2xl flex flex-col"
            >
              {/* Profile Header */}
              <div className="relative h-48 shrink-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-burgundy/20" />
                <div className="absolute inset-0 backdrop-blur-3xl" />
                <div className="absolute bottom-6 left-8 flex items-end gap-6">
                  <div className="w-24 h-24 rounded-3xl border-4 border-ink bg-white/5 overflow-hidden flex items-center justify-center shadow-2xl">
                    {selectedStudent.photoURL ? (
                      <img src={selectedStudent.photoURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-parchment/20" />
                    )}
                  </div>
                  <div className="pb-2">
                    <h2 className="font-display text-2xl text-parchment">{selectedStudent.displayName || 'Anonymous'}</h2>
                    <p className="text-sm text-parchment/40 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" /> {selectedStudent.email}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsProfileOpen(false)} className="absolute top-6 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full text-parchment/40">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Membership Card */}
                <div className={`p-6 rounded-2xl border ${selectedStudent.subscription?.status === 'active' ? 'border-gold/30 bg-gold/5' : 'border-white/10 bg-white/5'} space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Zap className={`w-5 h-5 ${selectedStudent.subscription?.status === 'active' ? 'text-gold' : 'text-parchment/20'}`} />
                       <span className="text-xs font-ui font-black uppercase tracking-widest text-parchment">Subscription Profile</span>
                    </div>
                    {selectedStudent.subscription?.status === 'active' && (
                      <span className="px-3 py-1 rounded-full bg-gold text-ink text-[10px] font-black uppercase tracking-widest">Premium User</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-display text-parchment">
                        {selectedStudent.subscription?.status === 'active' 
                          ? selectedStudent.subscription.planId.replace('_', ' ').toUpperCase()
                          : 'FREE TIER'}
                      </p>
                      <p className="text-xs text-parchment/30 mt-1 uppercase tracking-widest font-bold">Current Access Level</p>
                    </div>
                    <button 
                      onClick={() => handleGiftSub(selectedStudent.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold border border-gold/20 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-ink transition-all"
                    >
                      <Gift className="w-4 h-4" /> Gift Access
                    </button>
                  </div>
                </div>

                {/* Engagement Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Notes Bought', value: selectedStudent.stats?.notesPurchased || 0, icon: BookOpen },
                    { label: 'Exams Taken', value: selectedStudent.stats?.testsAttempted || 0, icon: ClipboardCheck },
                    { label: 'Loyalty Days', value: '124', icon: History },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center space-y-2">
                       <stat.icon className="w-4 h-4 text-parchment/30 mx-auto" />
                       <p className="text-xl font-display text-parchment">{stat.value}</p>
                       <p className="text-[8px] text-parchment/40 uppercase tracking-widest font-bold">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Logs (Mocked for UI) */}
                <div className="space-y-4">
                  <h3 className="text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-black">Authentication Timeline</h3>
                  <div className="space-y-3">
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                          <span className="text-xs text-parchment/80 font-medium">Successful Login - Mobile App</span>
                        </div>
                        <span className="text-[10px] text-parchment/40">2h ago</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-8 bg-white/[0.02] border-t border-white/10 flex items-center justify-between">
                <button 
                  onClick={() => handleBanToggle(selectedStudent.id, selectedStudent.isBanned || false)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-ui font-black text-xs uppercase tracking-widest transition-all ${
                    selectedStudent.isBanned 
                      ? 'bg-green-500/10 text-green-500 border border-green-500/30' 
                      : 'bg-red-500/10 text-red-500 border border-red-500/30'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" /> {selectedStudent.isBanned ? 'Unban Student' : 'Restrict Access'}
                </button>
                <div className="flex gap-4">
                   <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-parchment/40" title="Email Student">
                    <Mail className="w-4 h-4" />
                  </button>
                  <button className="flex items-center gap-2 px-8 py-3 bg-white/10 text-parchment font-ui font-bold rounded-xl hover:bg-white/20 transition-all">
                    Reset Progress
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
