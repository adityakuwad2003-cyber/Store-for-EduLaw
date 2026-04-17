import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  collection, getDocs, doc, updateDoc, query, orderBy, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Users, Briefcase, FileText, BarChart3,
  CheckCircle2, X, Eye, AlertTriangle, Loader2,
  Phone, Mail, MapPin, Calendar, ExternalLink, MessageCircle,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface LawyerDoc {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  specializations: string[];
  experience: string;
  bio: string;
  barCouncilId: string;
  stateBarCouncil: string;
  enrollmentYear: string;
  enrollmentCertUrl: string;
  photoUrl: string;
  status: 'pending' | 'approved' | 'suspended';
  subscriptionStatus: 'trial' | 'active' | 'expired';
  trialStartedAt: Timestamp;
  subscriptionExpiresAt: Timestamp;
  createdAt: Timestamp;
}

interface InquiryDoc {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  issueType: string;
  issueDescription: string;
  location: string;
  matchedLawyerId: string | null;
  status: 'pending' | 'matched' | 'closed';
  createdAt: Timestamp;
}

type TabKey = 'pending' | 'active' | 'inquiries' | 'stats';

// ── Helpers ───────────────────────────────────────────────────────────────────
function StatusPill({ value }: { value: string }) {
  const map: Record<string, string> = {
    pending:   'bg-amber-100 text-amber-800',
    approved:  'bg-emerald-100 text-emerald-800',
    suspended: 'bg-red-100 text-red-800',
    trial:     'bg-blue-100 text-blue-800',
    active:    'bg-emerald-100 text-emerald-800',
    expired:   'bg-slate-100 text-slate-600',
    matched:   'bg-gold/15 text-amber-800',
    closed:    'bg-slate-100 text-slate-500',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${map[value] ?? 'bg-slate-100 text-slate-500'}`}>
      {value}
    </span>
  );
}

function fmtDate(ts?: Timestamp): string {
  if (!ts?.toDate) return '—';
  return ts.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── KYC Drawer ────────────────────────────────────────────────────────────────
function KYCDrawer({ lawyer, onClose, onApprove, onReject }: {
  lawyer: LawyerDoc;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const approve = async () => {
    setBusy(true);
    await onApprove();
    setBusy(false);
  };

  const reject = async () => {
    if (!reason.trim()) return;
    setBusy(true);
    await onReject(reason);
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl"
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-semibold text-slate-900">KYC Review</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Photo + name */}
          <div className="flex items-center gap-4">
            {lawyer.photoUrl ? (
              <img src={lawyer.photoUrl} alt={lawyer.name} className="w-16 h-16 rounded-2xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-slate-400" />
              </div>
            )}
            <div>
              <p className="font-bold text-slate-900">{lawyer.name}</p>
              <p className="text-sm text-slate-500">{lawyer.city}, {lawyer.state}</p>
              <div className="flex gap-1.5 mt-1">
                <StatusPill value={lawyer.status} />
                <StatusPill value={lawyer.subscriptionStatus} />
              </div>
            </div>
          </div>

          {/* Details grid */}
          {[
            ['Email', lawyer.email],
            ['Phone', lawyer.phone],
            ['Bar Council No.', lawyer.barCouncilId],
            ['State Bar Council', lawyer.stateBarCouncil],
            ['Enrollment Year', lawyer.enrollmentYear],
            ['Experience', lawyer.experience],
            ['Submitted', fmtDate(lawyer.createdAt)],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-3 text-sm border-b border-slate-50 pb-3">
              <span className="w-40 shrink-0 text-slate-400 font-medium">{k}</span>
              <span className="text-slate-700">{v}</span>
            </div>
          ))}

          {/* Specializations */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Specializations</p>
            <div className="flex flex-wrap gap-1.5">
              {lawyer.specializations.map(s => (
                <span key={s} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">{s}</span>
              ))}
            </div>
          </div>

          {/* Bio */}
          {lawyer.bio && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Bio</p>
              <p className="text-sm text-slate-600 leading-relaxed">{lawyer.bio}</p>
            </div>
          )}

          {/* Documents */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Documents</p>
            <div className="space-y-2">
              {lawyer.enrollmentCertUrl && (
                <a
                  href={lawyer.enrollmentCertUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  Enrollment Certificate
                  <ExternalLink className="w-3.5 h-3.5 ml-auto text-slate-400" />
                </a>
              )}
            </div>
          </div>

          {/* Actions */}
          {lawyer.status === 'pending' && (
            <div className="pt-2 space-y-3">
              {!rejecting ? (
                <div className="flex gap-2">
                  <button
                    onClick={approve}
                    disabled={busy}
                    className="flex-1 min-h-[48px] flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-60 shadow-md shadow-emerald-200"
                  >
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Verify & Approve
                  </button>
                  <button
                    onClick={() => setRejecting(true)}
                    className="flex-1 min-h-[48px] flex items-center justify-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    placeholder="Reason for rejection (will be saved for records)…"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-body resize-none focus:outline-none focus:border-red-300"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={reject}
                      disabled={busy || !reason.trim()}
                      className="flex-1 min-h-[44px] bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-60"
                    >
                      {busy ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirm Reject'}
                    </button>
                    <button
                      onClick={() => setRejecting(false)}
                      className="px-4 min-h-[44px] border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.aside>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function VakilAdminPanel() {
  const [tab, setTab] = useState<TabKey>('pending');
  const [lawyers, setLawyers] = useState<LawyerDoc[]>([]);
  const [inquiries, setInquiries] = useState<InquiryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerLawyer, setDrawerLawyer] = useState<LawyerDoc | null>(null);
  const [actionMsg, setActionMsg] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [lawyerSnap, inquirySnap] = await Promise.all([
        getDocs(query(collection(db, 'vakil_lawyers'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'vakil_inquiries'), orderBy('createdAt', 'desc'))),
      ]);
      setLawyers(lawyerSnap.docs.map(d => ({ id: d.id, ...d.data() } as LawyerDoc)));
      setInquiries(inquirySnap.docs.map(d => ({ id: d.id, ...d.data() } as InquiryDoc)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const showMsg = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const approveLawyer = async (lawyer: LawyerDoc) => {
    await updateDoc(doc(db, 'vakil_lawyers', lawyer.id), { status: 'approved' });
    setLawyers(ls => ls.map(l => l.id === lawyer.id ? { ...l, status: 'approved' } : l));
    setDrawerLawyer(null);
    showMsg(`✓ ${lawyer.name} approved`);
  };

  const rejectLawyer = async (lawyer: LawyerDoc, reason: string) => {
    await updateDoc(doc(db, 'vakil_lawyers', lawyer.id), { status: 'suspended', rejectionReason: reason });
    setLawyers(ls => ls.map(l => l.id === lawyer.id ? { ...l, status: 'suspended' } : l));
    setDrawerLawyer(null);
    showMsg(`${lawyer.name} rejected`);
  };

  const suspendLawyer = async (id: string, name: string) => {
    if (!confirm(`Suspend ${name}? They will stop receiving leads.`)) return;
    await updateDoc(doc(db, 'vakil_lawyers', id), { status: 'suspended' });
    setLawyers(ls => ls.map(l => l.id === id ? { ...l, status: 'suspended' } : l));
    showMsg(`${name} suspended`);
  };

  const pendingLawyers  = lawyers.filter(l => l.status === 'pending');
  const activeLawyers   = lawyers.filter(l => l.status === 'approved');
  const expiredLawyers  = lawyers.filter(l => l.subscriptionStatus === 'expired');

  const TABS: { key: TabKey; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: 'pending',   label: 'Pending KYC',    icon: FileText,  badge: pendingLawyers.length },
    { key: 'active',    label: 'Active Lawyers',  icon: Users,     badge: activeLawyers.length },
    { key: 'inquiries', label: 'Client Inquiries',icon: Briefcase, badge: inquiries.length },
    { key: 'stats',     label: 'Stats',           icon: BarChart3 },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">VakilConnect Admin</h1>
        <p className="text-sm text-slate-500 mt-1">Manage advocate KYC, subscriptions and client inquiries</p>
      </div>

      {/* Action toast */}
      <AnimatePresence>
        {actionMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-medium text-emerald-800"
          >
            {actionMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 mb-6">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-medium text-sm transition-all ${
              tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
            {t.badge !== undefined && t.badge > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${tab === t.key ? 'bg-burgundy text-white' : 'bg-slate-200 text-slate-600'}`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 text-gold animate-spin" />
        </div>
      ) : (
        <>
          {/* ── PENDING KYC ── */}
          {tab === 'pending' && (
            <div className="space-y-3">
              {pendingLawyers.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-500">No pending applications</p>
                </div>
              ) : pendingLawyers.map(l => (
                <div key={l.id} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    {l.photoUrl
                      ? <img src={l.photoUrl} alt={l.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      : <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0"><Users className="w-5 h-5 text-slate-400" /></div>
                    }
                    <div>
                      <p className="font-bold text-slate-900">{l.name}</p>
                      <p className="text-xs text-slate-400">{l.city}, {l.state} · Submitted {fmtDate(l.createdAt)}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {l.specializations.slice(0, 3).map(s => (
                          <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setDrawerLawyer(l)}
                    className="min-h-[40px] px-4 flex items-center gap-2 bg-emerald-700 text-white rounded-xl font-bold text-sm hover:bg-emerald-800 transition-colors"
                  >
                    <Eye className="w-4 h-4" /> Review & Verify
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── ACTIVE LAWYERS ── */}
          {tab === 'active' && (
            <div className="space-y-3">
              {expiredLawyers.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <p className="text-sm text-amber-800 font-medium">{expiredLawyers.length} lawyer(s) with expired subscriptions</p>
                </div>
              )}
              {activeLawyers.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-400">No approved lawyers yet</p>
                </div>
              ) : activeLawyers.map(l => (
                <div key={l.id} className="bg-white rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-4">
                      {l.photoUrl
                        ? <img src={l.photoUrl} alt={l.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                        : <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0"><Users className="w-5 h-5 text-slate-400" /></div>
                      }
                      <div>
                        <p className="font-bold text-slate-900">{l.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                          <MapPin className="w-3 h-3" />{l.city}, {l.state}
                          <span>·</span>
                          <Calendar className="w-3 h-3" />Approved
                        </div>
                        <div className="flex gap-1.5 mt-1.5">
                          <StatusPill value={l.status} />
                          <StatusPill value={l.subscriptionStatus} />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setDrawerLawyer(l)}
                        className="min-h-[38px] px-3 flex items-center gap-1.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      {l.status !== 'suspended' && (
                        <button
                          onClick={() => suspendLawyer(l.id, l.name)}
                          className="min-h-[38px] px-3 flex items-center gap-1.5 border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" /> Suspend
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── INQUIRIES ── */}
          {tab === 'inquiries' && (
            <div className="space-y-3">
              {inquiries.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                  <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-400">No inquiries yet</p>
                </div>
              ) : inquiries.map(inq => {
                const matchedLawyer = lawyers.find(l => l.id === inq.matchedLawyerId);
                return (
                  <div key={inq.id} className="bg-white rounded-2xl border border-slate-100 p-5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2.5 py-1 bg-burgundy/10 text-burgundy rounded-full text-[10px] font-black uppercase tracking-widest">
                            {inq.issueType}
                          </span>
                          <StatusPill value={inq.status} />
                        </div>
                        <div className="space-y-1 text-sm text-slate-600">
                          <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-slate-400" /><span className="font-bold text-slate-900">{inq.clientName}</span></div>
                          <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" />{inq.clientPhone}</div>
                          {inq.clientEmail && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" />{inq.clientEmail}</div>}
                          <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-400" />{inq.location}</div>
                          {inq.issueDescription && <p className="text-slate-400 text-xs line-clamp-2 mt-1">{inq.issueDescription}</p>}
                        </div>
                        {matchedLawyer && (
                          <p className="mt-2 text-xs text-slate-500">
                            Matched to: <strong className="text-slate-700">{matchedLawyer.name}</strong> ({matchedLawyer.city})
                          </p>
                        )}
                        {!inq.matchedLawyerId && (
                          <p className="mt-2 text-xs text-amber-600 font-medium">⚠ No match found — review manually</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{fmtDate(inq.createdAt)}</p>
                        {inq.clientPhone && (
                          <a
                            href={`https://wa.me/${inq.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${inq.clientName}, this is EduLaw VakilConnect regarding your ${inq.issueType} inquiry.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 min-h-[36px] px-3 bg-[#25D366] text-white rounded-xl font-bold text-xs hover:bg-[#1ebe59] transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── STATS ── */}
          {tab === 'stats' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Pending Review',       value: pendingLawyers.length,                                      cls: 'border-amber-200 bg-amber-50' },
                { label: 'Approved Advocates',   value: activeLawyers.length,                                       cls: 'border-emerald-200 bg-emerald-50' },
                { label: 'Expired Subscriptions',value: expiredLawyers.length,                                      cls: 'border-red-200 bg-red-50' },
                { label: 'Total Inquiries',      value: inquiries.length,                                           cls: 'border-blue-200 bg-blue-50' },
                { label: 'Matched Inquiries',    value: inquiries.filter(i => i.matchedLawyerId).length,            cls: 'border-gold/30 bg-gold/5' },
                { label: 'Unmatched Inquiries',  value: inquiries.filter(i => !i.matchedLawyerId).length,           cls: 'border-red-200 bg-red-50' },
                { label: 'Active Trials',        value: lawyers.filter(l => l.subscriptionStatus === 'trial').length, cls: 'border-blue-200 bg-blue-50' },
                { label: 'Paid Subscribers',     value: lawyers.filter(l => l.subscriptionStatus === 'active').length, cls: 'border-emerald-200 bg-emerald-50' },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl border p-5 ${s.cls}`}>
                  <p className="text-3xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs font-medium text-slate-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* KYC Drawer */}
      <AnimatePresence>
        {drawerLawyer && (
          <KYCDrawer
            lawyer={drawerLawyer}
            onClose={() => setDrawerLawyer(null)}
            onApprove={() => approveLawyer(drawerLawyer)}
            onReject={(reason) => rejectLawyer(drawerLawyer, reason)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
