import { useState, useEffect, useCallback } from 'react';
import {
  Users, RefreshCw, X, User,
  Mail, Crown, Ban, CheckCircle2,
  MoreVertical, BookOpen, ClipboardCheck,
  Calendar, Zap, Gift, ShieldAlert, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { auth } from '../../../lib/firebase';
import { DataTable } from '../../../components/admin/DataTable';
import type { Column } from '../../../components/admin/DataTable';
import { ExportButton } from '../../../components/admin/ExportButton';

// ── Types ────────────────────────────────────────────────────────────────────

interface StudentStats {
  notesPurchased: number;
  testsAttempted: number;
  lastLogin: string | null;
  loyaltyDays: number;
}

interface Student {
  id: string;
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  isBanned: boolean;
  subscription?: {
    planId: string;
    status: 'active' | 'expired' | 'none';
    expiresAt?: string;
  } | null;
  stats: StudentStats;
  createdAt: string | null;
}

// ── Helper ────────────────────────────────────────────────────────────────────

async function getBearerToken() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

async function adminPost(path: string, body: Record<string, unknown>, token: string) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Server error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SubscribersManager() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [giftPlanInput, setGiftPlanInput] = useState('');
  const [showGiftInput, setShowGiftInput] = useState(false);

  // ── Fetch real users from Firebase Auth via Admin API ─────────────────────

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getBearerToken();
      const res = await fetch('/api/admin/list-users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Server error' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setStudents(data.users ?? []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load student database');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // ── Actions via Admin API ─────────────────────────────────────────────────

  const handleBanToggle = async (student: Student) => {
    const action = student.isBanned ? 'unban' : 'ban';
    if (!confirm(`${action === 'ban' ? 'Restrict' : 'Restore'} access for ${student.email}?`)) return;
    setActionLoading(true);
    try {
      const token = await getBearerToken();
      await adminPost('/api/admin/update-user', { uid: student.uid, action }, token);
      toast.success(`User ${action === 'ban' ? 'banned' : 'unbanned'} successfully`);
      fetchStudents();
      setIsProfileOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGiftSubscription = async () => {
    if (!selectedStudent) return;
    const planId = giftPlanInput.trim();
    if (!planId) { toast.error('Enter a plan ID'); return; }
    setActionLoading(true);
    try {
      const token = await getBearerToken();
      await adminPost('/api/admin/update-user', {
        uid: selectedStudent.uid,
        action: 'gift_subscription',
        payload: { planId, durationDays: 365 },
      }, token);
      toast.success(`Subscription '${planId}' granted for 1 year`);
      setShowGiftInput(false);
      setGiftPlanInput('');
      fetchStudents();
    } catch (err: any) {
      toast.error(err.message || 'Failed to grant subscription');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Table columns ─────────────────────────────────────────────────────────

  const columns: Column<Student>[] = [
    {
      key: 'user',
      label: 'Student',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
            {row.photoURL
              ? <img src={row.photoURL} alt="" className="w-full h-full object-cover" />
              : <User className="w-4.5 h-4.5 text-slate-400" />}
          </div>
          <div>
            <p className="font-bold text-slate-900 truncate max-w-[160px] text-sm">{row.displayName || 'Anonymous'}</p>
            <p className="text-[10px] text-slate-400 lowercase">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'subscription',
      label: 'Membership',
      render: (row) =>
        row.subscription?.status === 'active' ? (
          <div>
            <div className="flex items-center gap-1.5 text-gold text-[10px] font-bold uppercase tracking-widest">
              <Crown className="w-3 h-3 fill-gold" />
              {row.subscription.planId.replace(/_/g, ' ')}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Expires {row.subscription.expiresAt
                ? format(new Date(row.subscription.expiresAt), 'MMM dd, yyyy')
                : 'N/A'}
            </p>
          </div>
        ) : (
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Free Tier</span>
        ),
    },
    {
      key: 'activity',
      label: 'Activity',
      render: (row) => (
        <div className="flex items-center gap-4 text-[10px] text-slate-500">
          <div className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {row.stats?.notesPurchased ?? 0} notes
          </div>
          <div className="flex items-center gap-1">
            <ClipboardCheck className="w-3.5 h-3.5" />
            {row.stats?.testsAttempted ?? 0} tests
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Access',
      render: (row) =>
        row.isBanned ? (
          <span className="px-2 py-1 rounded bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 w-fit">
            <Ban className="w-3 h-3" /> Banned
          </span>
        ) : (
          <span className="px-2 py-1 rounded bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" /> Active
          </span>
        ),
    },
    {
      key: 'lastLogin',
      label: 'Last Seen',
      render: (row) => (
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold whitespace-nowrap">
          {row.stats?.lastLogin
            ? format(new Date(row.stats.lastLogin), 'MMM dd, yyyy')
            : 'Never'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      className: 'w-10',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedStudent(row);
            setShowGiftInput(false);
            setGiftPlanInput('');
            setIsProfileOpen(true);
          }}
          className="p-2 hover:bg-slate-100 text-slate-400 hover:text-gold rounded-lg transition-all"
          aria-label="View student profile"
        >
          <MoreVertical className="w-4 h-4" />
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
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-slate-900">Subscribers</h1>
            <p className="text-sm text-slate-500 font-ui tracking-wide">
              {loading ? 'Loading...' : `${students.length} registered users`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchStudents}
            disabled={loading}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-400 hover:text-gold transition-all"
            aria-label="Refresh user list"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <ExportButton data={students} filename="edulaw-students-db" label="Export CSV" variant="secondary" />
        </div>
      </div>

      {/* ── Table ── */}
      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        keyField="id"
        totalCount={students.length}
        onRowClick={(row) => {
          setSelectedStudent(row);
          setShowGiftInput(false);
          setGiftPlanInput('');
          setIsProfileOpen(true);
        }}
        emptyMessage="No registered users yet. Users appear here once they sign up."
        searchPlaceholder="Search by name or email..."
      />

      {/* ── Student Profile Slide-Over ── */}
      <AnimatePresence>
        {isProfileOpen && selectedStudent && (
          <div className="fixed inset-0 z-[110] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col"
            >
              {/* Profile Header */}
              <div className="relative h-36 shrink-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gold/30 to-burgundy/10" />
                <div className="absolute inset-0 backdrop-blur-3xl" />
                <div className="absolute bottom-4 left-6 flex items-end gap-4 text-white">
                  <div className="w-16 h-16 rounded-2xl border-2 border-white/20 bg-white/10 overflow-hidden flex items-center justify-center shadow-xl">
                    {selectedStudent.photoURL
                      ? <img src={selectedStudent.photoURL} alt="" className="w-full h-full object-cover" />
                      : <User className="w-8 h-8 text-white/40" />}
                  </div>
                  <div className="pb-1">
                    <h2 className="font-display text-lg text-white">{selectedStudent.displayName || 'Anonymous'}</h2>
                    <p className="text-xs text-white/70 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {selectedStudent.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full text-white/70"
                  aria-label="Close profile"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Membership */}
                <div className={`p-5 rounded-2xl border ${selectedStudent.subscription?.status === 'active' ? 'border-gold/30 bg-gold/5' : 'border-slate-200 bg-slate-50'} space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className={`w-4 h-4 ${selectedStudent.subscription?.status === 'active' ? 'text-gold' : 'text-slate-400'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Subscription</span>
                    </div>
                    {selectedStudent.subscription?.status === 'active' && (
                      <span className="px-2 py-0.5 rounded-full bg-gold text-white text-[9px] font-black uppercase">Premium</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-display text-slate-900">
                        {selectedStudent.subscription?.status === 'active'
                          ? selectedStudent.subscription.planId.replace(/_/g, ' ').toUpperCase()
                          : 'FREE TIER'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest">
                        {selectedStudent.subscription?.expiresAt
                          ? `Expires ${format(new Date(selectedStudent.subscription.expiresAt), 'MMM dd, yyyy')}`
                          : 'No active plan'}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowGiftInput(!showGiftInput)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 text-gold border border-gold/20 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition-all"
                    >
                      <Gift className="w-3.5 h-3.5" /> Gift
                    </button>
                  </div>

                  {showGiftInput && (
                    <div className="flex gap-2 pt-2 border-t border-slate-200">
                      <input
                        type="text"
                        value={giftPlanInput}
                        onChange={(e) => setGiftPlanInput(e.target.value)}
                        placeholder="Plan ID (e.g. platinum_annual)"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-gold/50"
                      />
                      <button
                        onClick={handleGiftSubscription}
                        disabled={actionLoading}
                        className="px-3 py-2 bg-gold text-white rounded-xl text-xs font-bold disabled:opacity-50"
                      >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Grant'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Real Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Notes Bought', value: selectedStudent.stats?.notesPurchased ?? 0, icon: BookOpen },
                    { label: 'Exams Taken', value: selectedStudent.stats?.testsAttempted ?? 0, icon: ClipboardCheck },
                    { label: 'Days Active', value: selectedStudent.stats?.loyaltyDays ?? 0, icon: Calendar },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                      <stat.icon className="w-4 h-4 text-slate-400 mx-auto" />
                      <p className="text-xl font-display text-slate-900">{stat.value}</p>
                      <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold leading-tight">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Account Info */}
                <div className="space-y-3">
                  <h3 className="text-gold text-[10px] uppercase tracking-[0.2em] font-black">Account Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Registered</span>
                      <span className="text-xs text-slate-900">
                        {selectedStudent.createdAt
                          ? format(new Date(selectedStudent.createdAt), 'MMM dd, yyyy')
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Last Login</span>
                      <span className="text-xs text-slate-900">
                        {selectedStudent.stats?.lastLogin
                          ? format(new Date(selectedStudent.stats.lastLogin), 'MMM dd, yyyy HH:mm')
                          : 'Never'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">User ID</span>
                      <span className="text-[10px] text-slate-600 font-mono truncate max-w-[150px]">{selectedStudent.uid}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleBanToggle(selectedStudent)}
                  disabled={actionLoading}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-ui font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 ${
                    selectedStudent.isBanned
                      ? 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'
                      : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                  }`}
                >
                  {actionLoading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <ShieldAlert className="w-4 h-4" />}
                  {selectedStudent.isBanned ? 'Restore Access' : 'Restrict Access'}
                </button>
                <a
                  href={`mailto:${selectedStudent.email}`}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold uppercase tracking-widest transition-all"
                  aria-label="Send email to student"
                >
                  <Mail className="w-4 h-4" /> Email
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
