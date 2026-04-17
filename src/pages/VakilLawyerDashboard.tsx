import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  doc, getDoc, collection, query, where, getDocs, orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import {
  Scale, Briefcase, Clock, CheckCircle2, AlertCircle,
  ChevronRight, User, MapPin, Phone, Mail, Loader2, Crown,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface LawyerProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  specializations: string[];
  experience: string;
  bio: string;
  photoUrl: string;
  status: 'pending' | 'approved' | 'suspended';
  subscriptionStatus: 'trial' | 'active' | 'expired';
  trialStartedAt: any;
  subscriptionExpiresAt: any;
}

interface Inquiry {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  issueType: string;
  issueDescription: string;
  location: string;
  status: 'pending' | 'matched' | 'closed';
  createdAt: any;
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    pending:   { cls: 'bg-amber-50 text-amber-700 border-amber-200',   label: 'Under Review' },
    approved:  { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Approved' },
    suspended: { cls: 'bg-red-50 text-red-700 border-red-200',         label: 'Suspended' },
    trial:     { cls: 'bg-blue-50 text-blue-700 border-blue-200',      label: 'Free Trial' },
    active:    { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Active' },
    expired:   { cls: 'bg-slate-50 text-slate-600 border-slate-200',   label: 'Expired' },
    matched:   { cls: 'bg-gold/10 text-amber-700 border-gold/25',      label: 'Matched' },
    closed:    { cls: 'bg-slate-50 text-slate-500 border-slate-200',   label: 'Closed' },
  };
  const { cls, label } = map[status] ?? { cls: 'bg-slate-50 text-slate-500 border-slate-200', label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border font-ui ${cls}`}>
      {label}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function VakilLawyerDashboard() {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<LawyerProfile | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingInquiries, setLoadingInquiries] = useState(true);
  const [notRegistered, setNotRegistered] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) { navigate('/login'); return; }

    const fetchProfile = async () => {
      try {
        const snap = await getDoc(doc(db, 'vakil_lawyers', currentUser.uid));
        if (!snap.exists()) { setNotRegistered(true); }
        else setProfile(snap.data() as LawyerProfile);
      } catch { setNotRegistered(true); }
      finally { setLoadingProfile(false); }
    };

    const fetchInquiries = async () => {
      try {
        const q = query(
          collection(db, 'vakil_inquiries'),
          where('matchedLawyerId', '==', currentUser.uid),
          orderBy('createdAt', 'desc'),
        );
        const snap = await getDocs(q);
        setInquiries(snap.docs.map(d => ({ id: d.id, ...d.data() } as Inquiry)));
      } catch { /* no inquiries yet */ }
      finally { setLoadingInquiries(false); }
    };

    fetchProfile();
    fetchInquiries();
  }, [currentUser, authLoading]);

  // Loading
  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  // Not registered
  if (notRegistered) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <Scale className="w-12 h-12 text-gold mx-auto mb-4" />
          <h2 className="font-display text-2xl text-ink mb-2">No Profile Found</h2>
          <p className="font-body text-sm text-ink/55 mb-6">You haven't registered as an advocate yet. Complete your KYC to get started.</p>
          <Link
            to="/vakil-connect/lawyer-onboard"
            className="inline-flex items-center gap-2 min-h-[48px] px-8 bg-ink text-parchment rounded-xl font-ui font-black text-sm uppercase tracking-widest hover:bg-ink/90 transition-all"
          >
            Register as Advocate <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const trialExpiry = profile?.subscriptionExpiresAt?.toDate?.();
  const daysLeft = trialExpiry
    ? Math.max(0, Math.ceil((trialExpiry - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="min-h-screen bg-parchment">
      <Helmet>
        <title>Advocate Dashboard — VakilConnect × TheEduLaw</title>
      </Helmet>

      {/* Top bar */}
      <div className="bg-ink py-4 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/vakil-connect" className="flex items-center gap-2 text-parchment/50 hover:text-gold transition-colors font-ui text-[10px] font-black uppercase tracking-widest">
            <Scale className="w-3.5 h-3.5" /> VakilConnect
          </Link>
          <span className="text-gold font-ui text-[10px] font-black uppercase tracking-widest">Advocate Dashboard</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">

        {/* Profile overview */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-ink/8 p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row gap-5 sm:items-start">
            {profile?.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={profile.name}
                className="w-16 h-16 rounded-2xl object-cover shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center shrink-0">
                <User className="w-8 h-8 text-gold" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="font-display text-2xl text-ink">{profile?.name}</h1>
                  <p className="font-body text-sm text-ink/50 mt-0.5">{profile?.experience} experience</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={profile?.status ?? ''} />
                  <StatusBadge status={profile?.subscriptionStatus ?? ''} />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs font-body text-ink/50">
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{profile?.city}, {profile?.state}</span>
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{profile?.phone}</span>
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{profile?.email}</span>
              </div>
              {(profile?.specializations?.length ?? 0) > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {profile?.specializations?.map(s => (
                    <span key={s} className="px-2.5 py-1 bg-parchment border border-ink/8 rounded-full font-ui text-[10px] font-bold text-ink/55">{s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Status banners */}
        {profile?.status === 'pending' && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-ui font-black text-sm text-amber-800">Application Under Review</p>
              <p className="font-body text-xs text-amber-700 mt-0.5">Our team is verifying your Bar Council enrollment. This typically takes 24 hours. You'll receive an email once approved.</p>
            </div>
          </div>
        )}

        {profile?.status === 'approved' && profile?.subscriptionStatus === 'trial' && daysLeft !== null && (
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <Crown className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-ui font-black text-sm text-blue-800">Free Trial — {daysLeft} days remaining</p>
              <p className="font-body text-xs text-blue-700 mt-0.5">You're on your free 1-month trial. After {trialExpiry?.toLocaleDateString('en-IN')}, continue at ₹999/month.</p>
            </div>
            <Link
              to="/subscription"
              className="shrink-0 min-h-[40px] px-4 flex items-center bg-blue-600 text-white rounded-xl font-ui font-bold text-xs hover:bg-blue-700 transition-colors"
            >
              Subscribe
            </Link>
          </div>
        )}

        {profile?.status === 'approved' && profile?.subscriptionStatus === 'expired' && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-ui font-black text-sm text-red-800">Subscription Expired</p>
              <p className="font-body text-xs text-red-700 mt-0.5">Your trial has ended and you're no longer receiving new leads. Renew at ₹999/month to continue.</p>
            </div>
            <Link
              to="/subscription"
              className="shrink-0 min-h-[40px] px-4 flex items-center bg-red-600 text-white rounded-xl font-ui font-bold text-xs hover:bg-red-700 transition-colors"
            >
              Renew
            </Link>
          </div>
        )}

        {/* Inquiry leads */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl text-ink">Your Matched Inquiries</h2>
              <p className="font-body text-xs text-ink/40 mt-0.5">Client inquiries matched to your specialization and location</p>
            </div>
            <span className="px-3 py-1.5 bg-parchment border border-ink/10 rounded-full font-ui text-xs font-bold text-ink/50">
              {inquiries.length} leads
            </span>
          </div>

          {loadingInquiries ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-ink/6" />)}
            </div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-ink/6">
              <Briefcase className="w-10 h-10 text-ink/10 mx-auto mb-3" />
              <p className="font-ui font-bold text-sm text-ink/30">No inquiries yet</p>
              <p className="font-body text-xs text-ink/25 mt-1 max-w-xs mx-auto">
                {profile?.status === 'pending'
                  ? 'Inquiries will appear here once your profile is approved.'
                  : 'New matched inquiries will appear here as clients submit them.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq, i) => (
                <motion.div
                  key={inq.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-ink/6 p-5"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="px-2.5 py-1 bg-burgundy/10 text-burgundy rounded-full font-ui text-[10px] font-black uppercase tracking-widest">
                          {inq.issueType}
                        </span>
                        <StatusBadge status={inq.status} />
                      </div>
                      <div className="space-y-1 text-sm font-body text-ink/60">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 shrink-0" />
                          <span className="font-bold text-ink">{inq.clientName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{inq.location}</span>
                        </div>
                        {inq.issueDescription && (
                          <p className="text-ink/50 line-clamp-2 mt-1">{inq.issueDescription}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 space-y-2">
                      <p className="text-[10px] font-ui font-bold text-gold/70 uppercase tracking-widest">
                        {inq.createdAt?.toDate?.()?.toLocaleDateString('en-IN') ?? ''}
                      </p>
                      <a
                        href={`tel:${inq.clientPhone}`}
                        className="inline-flex items-center gap-1.5 min-h-[36px] px-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-ui font-bold text-xs hover:bg-emerald-100 transition-colors"
                      >
                        <Phone className="w-3 h-3" /> Call Client
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Profile completeness nudge */}
        {profile?.status === 'approved' && (
          <div className="flex items-center gap-4 bg-gold/8 border border-gold/20 rounded-2xl p-5">
            <CheckCircle2 className="w-5 h-5 text-gold shrink-0" />
            <div className="flex-1">
              <p className="font-ui font-black text-sm text-ink">Profile Active</p>
              <p className="font-body text-xs text-ink/50 mt-0.5">Your profile is visible to clients. Keep your specializations updated to receive better-matched leads.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
