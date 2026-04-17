import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import {
  User, Briefcase, FileText, CheckSquare,
  ChevronRight, ChevronLeft, Upload, X,
  CheckCircle2, Loader2, AlertCircle, Scale,
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman & Nicobar Islands', 'Chandigarh', 'Dadra & Nagar Haveli',
  'Daman & Diu', 'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const MAJOR_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai',
  'Kolkata', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Visakhapatnam',
  'Indore', 'Thane', 'Bhopal', 'Pimpri-Chinchwad', 'Patna', 'Vadodara',
  'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut',
  'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar',
  'Navi Mumbai', 'Allahabad', 'Ranchi', 'Coimbatore', 'Jabalpur', 'Gwalior',
  'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Chandigarh',
  'Guwahati', 'Solapur', 'Hubballi', 'Tiruchirappalli', 'Mysuru', 'Bareilly',
  'Erode', 'Noida', 'Gurugram', 'Faridabad', 'Other',
];

const STATE_BAR_COUNCILS: Record<string, string> = {
  'Delhi': 'Bar Council of Delhi',
  'Maharashtra': 'Bar Council of Maharashtra & Goa',
  'Goa': 'Bar Council of Maharashtra & Goa',
  'Tamil Nadu': 'Bar Council of Tamil Nadu & Puducherry',
  'Puducherry': 'Bar Council of Tamil Nadu & Puducherry',
  'Karnataka': 'Bar Council of Karnataka',
  'Kerala': 'Bar Council of Kerala',
  'Andhra Pradesh': 'Bar Council of Andhra Pradesh',
  'Telangana': 'Bar Council of Telangana',
  'Gujarat': 'Bar Council of Gujarat',
  'Rajasthan': 'Bar Council of Rajasthan',
  'Uttar Pradesh': 'Bar Council of Uttar Pradesh',
  'Madhya Pradesh': 'Bar Council of Madhya Pradesh',
  'Bihar': 'Bar Council of Bihar',
  'West Bengal': 'Bar Council of West Bengal',
  'Punjab': 'Bar Council of Punjab & Haryana',
  'Haryana': 'Bar Council of Punjab & Haryana',
  'Himachal Pradesh': 'Bar Council of Himachal Pradesh',
  'Jammu & Kashmir': 'Bar Council of Jammu & Kashmir',
  'Ladakh': 'Bar Council of Jammu & Kashmir',
  'Jharkhand': 'Bar Council of Jharkhand',
  'Chhattisgarh': 'Bar Council of Chhattisgarh',
  'Uttarakhand': 'Bar Council of Uttarakhand',
  'Odisha': 'Bar Council of Odisha',
  'Assam': 'Bar Council of Assam, Nagaland, Mizoram & Arunachal Pradesh',
  'Nagaland': 'Bar Council of Assam, Nagaland, Mizoram & Arunachal Pradesh',
  'Mizoram': 'Bar Council of Assam, Nagaland, Mizoram & Arunachal Pradesh',
  'Arunachal Pradesh': 'Bar Council of Assam, Nagaland, Mizoram & Arunachal Pradesh',
  'Manipur': 'Bar Council of Manipur',
  'Meghalaya': 'Bar Council of Meghalaya',
  'Tripura': 'Bar Council of Tripura',
  'Sikkim': 'Bar Council of Sikkim',
  'Chandigarh': 'Bar Council of Punjab & Haryana',
};

const SPECIALIZATIONS = [
  'Criminal Law', 'Civil Law', 'Family Law', 'Property Law', 'Corporate Law',
  'Labour Law', 'Tax Law', 'Constitutional Law', 'Environmental Law',
  'Cyber Law', 'Intellectual Property', 'Banking Law', 'Immigration',
  'Arbitration & Mediation', 'Service Law',
];

const LANGUAGES = [
  'Hindi', 'English', 'Tamil', 'Telugu', 'Kannada', 'Malayalam',
  'Marathi', 'Bengali', 'Gujarati', 'Punjabi', 'Odia', 'Urdu',
  'Assamese', 'Maithili', 'Sindhi',
];

const EXPERIENCE_OPTIONS = ['0–2 years', '3–5 years', '6–10 years', '10+ years'];

const CURRENT_YEAR = new Date().getFullYear();
const ENROLLMENT_YEARS = Array.from({ length: CURRENT_YEAR - 1950 + 1 }, (_, i) => String(CURRENT_YEAR - i));

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

// ── Types ─────────────────────────────────────────────────────────────────────
interface Step1 { name: string; phone: string; email: string; city: string; state: string; languages: string[]; }
interface Step2 { barCouncilId: string; stateBarCouncil: string; enrollmentYear: string; specializations: string[]; experience: string; }
interface Step3 { enrollmentCertFile: File | null; photoFile: File | null; bio: string; }

// ── Sub-components ────────────────────────────────────────────────────────────
const inputCls = 'w-full bg-parchment border border-ink/10 rounded-xl px-4 py-3 font-body text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition';
const labelCls = 'block text-[10px] font-black uppercase tracking-[0.18em] text-ink/50 font-ui mb-1.5';

function SelectInput({ label, value, onChange, options, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; placeholder?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`${inputCls} appearance-none pr-9`}
        >
          <option value="">{placeholder ?? `Select ${label.toLowerCase()}…`}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30 pointer-events-none rotate-90" />
      </div>
    </div>
  );
}

function ChipSelector({ label, options, selected, onChange, max }: {
  label: string; options: string[]; selected: string[];
  onChange: (v: string[]) => void; max?: number;
}) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) onChange(selected.filter(s => s !== opt));
    else if (!max || selected.length < max) onChange([...selected, opt]);
  };
  return (
    <div>
      <label className={labelCls}>{label} {max && <span className="text-ink/30 normal-case font-normal">(up to {max})</span>}</label>
      <div className="flex flex-wrap gap-2 mt-1">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-full font-ui text-xs font-bold transition-all border ${
              selected.includes(opt)
                ? 'bg-gold/15 border-gold/40 text-gold'
                : 'bg-parchment border-ink/10 text-ink/50 hover:border-ink/20'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function FileUploadZone({ label, accept, hint, file, onFile, error }: {
  label: string; accept: string; hint: string;
  file: File | null; onFile: (f: File | null) => void; error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.size > MAX_FILE_SIZE) {
      onFile(null);
      // We pass null and let the parent handle the error display
      return;
    }
    onFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
          error ? 'border-red-300 bg-red-50' : file ? 'border-gold/40 bg-gold/5' : 'border-ink/15 hover:border-gold/30 bg-parchment'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {file ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div className="text-left min-w-0">
                <p className="font-ui font-bold text-sm text-ink truncate">{file.name}</p>
                <p className="text-[10px] text-ink/40 font-ui">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
            </div>
            <button
              type="button"
              onClick={ev => { ev.stopPropagation(); onFile(null); }}
              className="p-1.5 hover:bg-ink/5 rounded-lg transition-colors shrink-0"
            >
              <X className="w-4 h-4 text-ink/40" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-6 h-6 text-ink/25 mx-auto mb-2" />
            <p className="font-ui text-xs font-bold text-ink/40">Drag & drop or click to browse</p>
            <p className="font-body text-[10px] text-ink/30 mt-1">{hint}</p>
          </>
        )}
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600 font-ui">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-ink/10">
          <motion.div
            className="h-full bg-gold rounded-full"
            initial={{ width: 0 }}
            animate={{ width: i < current ? '100%' : '0%' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      ))}
    </div>
  );
}

const STEPS = [
  { icon: User,        label: 'Personal Info' },
  { icon: Briefcase,   label: 'Professional' },
  { icon: FileText,    label: 'Documents' },
  { icon: CheckSquare, label: 'Review & Submit' },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function VakilLawyerOnboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step data
  const [s1, setS1] = useState<Step1>({
    name: currentUser?.displayName ?? '',
    phone: '',
    email: currentUser?.email ?? '',
    city: '',
    state: '',
    languages: [],
  });
  const [s2, setS2] = useState<Step2>({
    barCouncilId: '', stateBarCouncil: '', enrollmentYear: '', specializations: [], experience: '',
  });
  const [s3, setS3] = useState<Step3>({ enrollmentCertFile: null, photoFile: null, bio: '' });
  const [confirmed, setConfirmed] = useState(false);

  // When state changes, auto-fill Bar Council
  const handleStateChange = (state: string) => {
    setS1(p => ({ ...p, state }));
    const bc = STATE_BAR_COUNCILS[state] ?? '';
    setS2(p => ({ ...p, stateBarCouncil: bc }));
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!s1.name.trim())   e.name   = 'Full name is required';
      if (!s1.phone.trim())  e.phone  = 'Phone number is required';
      if (!s1.email.trim())  e.email  = 'Email is required';
      if (!s1.city)          e.city   = 'Please select your city';
      if (!s1.state)         e.state  = 'Please select your state';
      if (s1.languages.length === 0) e.languages = 'Select at least one language';
    }
    if (step === 2) {
      if (!s2.barCouncilId.trim())   e.barCouncilId   = 'Bar Council ID is required';
      if (!s2.stateBarCouncil)       e.stateBarCouncil = 'Select your State Bar Council';
      if (!s2.enrollmentYear)        e.enrollmentYear  = 'Select enrollment year';
      if (s2.specializations.length === 0) e.specializations = 'Select at least one specialization';
      if (!s2.experience)            e.experience     = 'Select experience range';
    }
    if (step === 3) {
      if (!s3.enrollmentCertFile) e.enrollmentCert = 'Please upload your enrollment certificate';
      if (!s3.photoFile)          e.photo          = 'Please upload a profile photo';
      if (!s3.bio.trim())         e.bio            = 'Please write a short bio';

      // File size checks
      if (s3.enrollmentCertFile && s3.enrollmentCertFile.size > MAX_FILE_SIZE)
        e.enrollmentCert = 'File too large — please compress to under 1 MB';
      if (s3.photoFile && s3.photoFile.size > MAX_FILE_SIZE)
        e.photo = 'File too large — please compress to under 1 MB';
    }
    if (step === 4 && !confirmed) e.confirmed = 'Please confirm your details are accurate';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    if (!currentUser) { navigate('/login'); return; }

    setSubmitting(true);
    setErrors({});
    try {
      const uid = currentUser.uid;

      // Try file uploads — non-blocking: if storage rules haven't been set,
      // we still save the profile doc and admin can request re-upload later.
      let enrollmentCertUrl = '';
      let photoUrl = '';
      try {
        if (s3.enrollmentCertFile) {
          const ext = s3.enrollmentCertFile.name.split('.').pop() ?? 'pdf';
          const certRef = ref(storage, `vakil-kyc/${uid}/enrollment.${ext}`);
          await uploadBytes(certRef, s3.enrollmentCertFile);
          enrollmentCertUrl = await getDownloadURL(certRef);
        }
        if (s3.photoFile) {
          const ext = s3.photoFile.name.split('.').pop() ?? 'jpg';
          const photoRef = ref(storage, `vakil-kyc/${uid}/photo.${ext}`);
          await uploadBytes(photoRef, s3.photoFile);
          photoUrl = await getDownloadURL(photoRef);
        }
      } catch (storageErr) {
        // Storage upload failed (likely rules not set yet) — save profile without URLs.
        // Admin can re-request documents manually.
        console.warn('Storage upload skipped:', storageErr);
      }

      const now = Timestamp.now();
      const trialExpiry = Timestamp.fromMillis(now.toMillis() + 30 * 24 * 60 * 60 * 1000);

      await setDoc(doc(db, 'vakil_lawyers', uid), {
        uid,
        name: s1.name,
        phone: s1.phone,
        email: s1.email,
        city: s1.city,
        state: s1.state,
        languages: s1.languages,
        barCouncilId: s2.barCouncilId,
        stateBarCouncil: s2.stateBarCouncil,
        enrollmentYear: s2.enrollmentYear,
        specializations: s2.specializations,
        experience: s2.experience,
        bio: s3.bio,
        enrollmentCertUrl,
        photoUrl,
        enrollmentCertName: s3.enrollmentCertFile?.name ?? '',
        photoName: s3.photoFile?.name ?? '',
        status: 'pending',
        subscriptionStatus: 'trial',
        trialStartedAt: now,
        subscriptionExpiresAt: trialExpiry,
        createdAt: now,
      });

      setShowPopup(true);
    } catch (err: any) {
      console.error('VakilOnboard submit error:', err);
      const msg = err?.code === 'permission-denied'
        ? 'Permission denied — please make sure you are signed in and try again.'
        : `Submission failed: ${err?.message ?? 'Please try again.'}`;
      setErrors({ submit: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success popup modal (shown on top of the form after submit) ─────────────
  const SuccessPopup = () => (
    <AnimatePresence>
      {showPopup && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-ink/70 backdrop-blur-sm" />
          <div className="flex min-h-full items-end sm:items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="relative z-10 w-full max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl"
            >
              {/* Gold bar */}
              <div className="h-1.5 bg-gradient-to-r from-gold/40 via-gold to-gold/40" />
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="font-display text-2xl sm:text-3xl text-ink mb-3">Application Submitted!</h2>
                <p className="font-body text-sm text-ink/60 leading-relaxed mb-2">
                  Your KYC details have been received.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 mb-6">
                  <span className="text-amber-600 text-sm font-ui font-black">⏱ Verification within 48 hours</span>
                </div>
                <p className="font-body text-xs text-ink/40 leading-relaxed mb-8">
                  We'll verify your Bar Council enrollment and send you a confirmation. Your 1-month free trial starts automatically upon approval.
                </p>
                <div className="space-y-3">
                  <Link
                    to="/vakil-dashboard"
                    className="w-full min-h-[52px] flex items-center justify-center gap-2 bg-ink text-parchment rounded-xl font-ui font-black text-sm uppercase tracking-widest hover:bg-ink/90 transition-all"
                  >
                    Go to My Dashboard
                  </Link>
                  <Link
                    to="/vakil-connect"
                    className="w-full min-h-[48px] flex items-center justify-center border border-ink/15 text-ink/60 rounded-xl font-ui font-bold text-sm hover:bg-parchment transition-all"
                  >
                    Back to VakilConnect
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  // ── Auth guard ──────────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <Scale className="w-12 h-12 text-gold mx-auto mb-4" />
          <h2 className="font-display text-2xl text-ink mb-2">Sign in to Register</h2>
          <p className="font-body text-sm text-ink/55 mb-6">You need a free EduLaw account to enroll as an advocate.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 min-h-[48px] px-8 bg-ink text-parchment rounded-xl font-ui font-black text-sm uppercase tracking-widest hover:bg-ink/90 transition-all"
          >
            Sign In / Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment">
      <SuccessPopup />
      <Helmet>
        <title>Register as Advocate — VakilConnect × TheEduLaw</title>
        <meta name="description" content="Join VakilConnect as a verified advocate. Complete your Bar Council KYC in 4 steps and start receiving matched client leads — 1 month free trial, then ₹999/month." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      {/* Top bar */}
      <div className="bg-ink py-4 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/vakil-connect" className="flex items-center gap-2 text-parchment/50 hover:text-gold transition-colors font-ui text-[10px] font-black uppercase tracking-[0.2em]">
            <ChevronLeft className="w-3.5 h-3.5" /> VakilConnect
          </Link>
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-gold" />
            <span className="text-gold font-ui text-[10px] font-black uppercase tracking-[0.2em]">Advocate Registration</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Step indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  i + 1 < step ? 'bg-emerald-500 text-white'
                  : i + 1 === step ? 'bg-gold text-ink'
                  : 'bg-ink/8 text-ink/30'
                }`}>
                  {i + 1 < step
                    ? <CheckCircle2 className="w-4 h-4" />
                    : <s.icon className="w-4 h-4" />
                  }
                </div>
                <span className={`hidden sm:block font-ui text-[10px] font-black uppercase tracking-widest transition-colors ${
                  i + 1 === step ? 'text-ink' : 'text-ink/30'
                }`}>{s.label}</span>
                {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-ink/15 mx-1" />}
              </div>
            ))}
          </div>
          <StepBar current={step} total={4} />
        </div>

        {/* Step card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-3xl shadow-sm border border-ink/8 p-6 sm:p-8"
          >
            {/* ── STEP 1: Personal Info ── */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-display text-2xl text-ink mb-1">Personal Information</h2>
                  <p className="font-body text-sm text-ink/50">Basic details so clients know who you are.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Full Name *</label>
                    <input
                      type="text"
                      autoComplete="name"
                      placeholder="Adv. Priya Sharma"
                      value={s1.name}
                      onChange={e => setS1(p => ({ ...p, name: e.target.value }))}
                      className={`${inputCls} ${errors.name ? 'border-red-300' : ''}`}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500 font-ui">{errors.name}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Phone Number *</label>
                    <input
                      type="tel"
                      autoComplete="tel"
                      placeholder="+91 98765 43210"
                      value={s1.phone}
                      onChange={e => setS1(p => ({ ...p, phone: e.target.value }))}
                      className={`${inputCls} ${errors.phone ? 'border-red-300' : ''}`}
                    />
                    {errors.phone && <p className="mt-1 text-xs text-red-500 font-ui">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Email *</label>
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="advocate@example.com"
                    value={s1.email}
                    onChange={e => setS1(p => ({ ...p, email: e.target.value }))}
                    className={`${inputCls} ${errors.email ? 'border-red-300' : ''}`}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500 font-ui">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <SelectInput
                      label="City *"
                      value={s1.city}
                      onChange={v => setS1(p => ({ ...p, city: v }))}
                      options={MAJOR_CITIES}
                      placeholder="Select your city…"
                    />
                    {errors.city && <p className="mt-1 text-xs text-red-500 font-ui">{errors.city}</p>}
                  </div>
                  <div>
                    <SelectInput
                      label="State *"
                      value={s1.state}
                      onChange={handleStateChange}
                      options={INDIAN_STATES}
                      placeholder="Select your state…"
                    />
                    {errors.state && <p className="mt-1 text-xs text-red-500 font-ui">{errors.state}</p>}
                  </div>
                </div>

                <ChipSelector
                  label="Languages You Practice In *"
                  options={LANGUAGES}
                  selected={s1.languages}
                  onChange={v => setS1(p => ({ ...p, languages: v }))}
                />
                {errors.languages && <p className="text-xs text-red-500 font-ui -mt-2">{errors.languages}</p>}
              </div>
            )}

            {/* ── STEP 2: Professional Details ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-display text-2xl text-ink mb-1">Professional Details</h2>
                  <p className="font-body text-sm text-ink/50">Your Bar Council information and practice areas.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Bar Council Enrollment Number *</label>
                    <input
                      type="text"
                      placeholder="D/123/2015"
                      value={s2.barCouncilId}
                      onChange={e => setS2(p => ({ ...p, barCouncilId: e.target.value }))}
                      className={`${inputCls} ${errors.barCouncilId ? 'border-red-300' : ''}`}
                    />
                    {errors.barCouncilId && <p className="mt-1 text-xs text-red-500 font-ui">{errors.barCouncilId}</p>}
                  </div>
                  <div>
                    <SelectInput
                      label="Year of Enrollment *"
                      value={s2.enrollmentYear}
                      onChange={v => setS2(p => ({ ...p, enrollmentYear: v }))}
                      options={ENROLLMENT_YEARS}
                      placeholder="Select year…"
                    />
                    {errors.enrollmentYear && <p className="mt-1 text-xs text-red-500 font-ui">{errors.enrollmentYear}</p>}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>State Bar Council *</label>
                  <input
                    type="text"
                    readOnly
                    placeholder="Auto-filled from state selection in Step 1"
                    value={s2.stateBarCouncil}
                    onChange={e => setS2(p => ({ ...p, stateBarCouncil: e.target.value }))}
                    className={`${inputCls} ${s2.stateBarCouncil ? 'text-ink' : 'text-ink/30'}`}
                  />
                  {errors.stateBarCouncil && <p className="mt-1 text-xs text-red-500 font-ui">{errors.stateBarCouncil}</p>}
                </div>

                <div>
                  <SelectInput
                    label="Years of Experience *"
                    value={s2.experience}
                    onChange={v => setS2(p => ({ ...p, experience: v }))}
                    options={EXPERIENCE_OPTIONS}
                    placeholder="Select experience…"
                  />
                  {errors.experience && <p className="mt-1 text-xs text-red-500 font-ui">{errors.experience}</p>}
                </div>

                <ChipSelector
                  label="Areas of Specialization * (up to 5)"
                  options={SPECIALIZATIONS}
                  selected={s2.specializations}
                  onChange={v => setS2(p => ({ ...p, specializations: v }))}
                  max={5}
                />
                {errors.specializations && <p className="text-xs text-red-500 font-ui -mt-2">{errors.specializations}</p>}
              </div>
            )}

            {/* ── STEP 3: Documents ── */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-display text-2xl text-ink mb-1">Documents & Bio</h2>
                  <p className="font-body text-sm text-ink/50">Upload your certificates and tell clients about yourself.</p>
                </div>

                <FileUploadZone
                  label="Bar Enrollment Certificate *"
                  accept=".pdf,.jpg,.jpeg,.png"
                  hint="PDF or image — max 1 MB"
                  file={s3.enrollmentCertFile}
                  onFile={f => setS3(p => ({ ...p, enrollmentCertFile: f }))}
                  error={errors.enrollmentCert}
                />

                <FileUploadZone
                  label="Profile Photo *"
                  accept=".jpg,.jpeg,.png,.webp"
                  hint="JPEG, PNG or WebP — max 1 MB"
                  file={s3.photoFile}
                  onFile={f => setS3(p => ({ ...p, photoFile: f }))}
                  error={errors.photo}
                />

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={labelCls.replace('mb-1.5', '')}>Short Bio *</label>
                    <span className={`text-[10px] font-ui font-bold ${s3.bio.length > 280 ? 'text-red-500' : 'text-ink/30'}`}>
                      {s3.bio.length} / 300
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={300}
                    placeholder="I am an advocate specialising in criminal law with 8 years of experience at the Delhi High Court…"
                    value={s3.bio}
                    onChange={e => setS3(p => ({ ...p, bio: e.target.value }))}
                    className={`${inputCls} resize-none ${errors.bio ? 'border-red-300' : ''}`}
                  />
                  {errors.bio && <p className="mt-1 text-xs text-red-500 font-ui">{errors.bio}</p>}
                </div>
              </div>
            )}

            {/* ── STEP 4: Review & Submit ── */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-display text-2xl text-ink mb-1">Review & Submit</h2>
                  <p className="font-body text-sm text-ink/50">Confirm your details before we send your application for review.</p>
                </div>

                {/* Summary */}
                <div className="bg-parchment rounded-2xl border border-ink/8 p-5 space-y-3">
                  {[
                    ['Name', s1.name], ['Phone', s1.phone], ['Email', s1.email],
                    ['City', s1.city], ['State', s1.state],
                    ['Languages', s1.languages.join(', ')],
                    ['Bar Council No.', s2.barCouncilId],
                    ['State Bar Council', s2.stateBarCouncil],
                    ['Enrolled', s2.enrollmentYear],
                    ['Experience', s2.experience],
                    ['Specializations', s2.specializations.join(', ')],
                    ['Enrollment Cert', s3.enrollmentCertFile?.name ?? '—'],
                    ['Profile Photo', s3.photoFile?.name ?? '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-3 text-sm">
                      <span className="font-ui font-bold text-ink/40 w-36 shrink-0">{k}</span>
                      <span className="font-body text-ink/80">{v}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="font-body text-sm text-ink/60 bg-parchment rounded-xl p-4 border border-ink/8 leading-relaxed">
                    {s3.bio}
                  </p>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={e => setConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-gold"
                  />
                  <span className="font-body text-sm text-ink/70 leading-relaxed">
                    I confirm that all the details provided are accurate and my Bar Council enrollment is valid. I understand that submitting false information will result in rejection.
                  </span>
                </label>
                {errors.confirmed && <p className="text-xs text-red-500 font-ui">{errors.confirmed}</p>}
                {errors.submit   && <p className="text-xs text-red-500 font-ui">{errors.submit}</p>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className={`mt-6 flex gap-3 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
          {step > 1 && (
            <button
              onClick={back}
              className="min-h-[48px] px-6 flex items-center gap-2 border border-ink/15 text-ink/60 rounded-xl font-ui font-bold text-sm hover:border-ink/30 hover:text-ink transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={next}
              className="min-h-[48px] px-8 flex items-center gap-2 bg-ink text-parchment rounded-xl font-ui font-black text-sm uppercase tracking-widest hover:bg-ink/90 transition-all ml-auto"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="min-h-[48px] px-8 flex items-center gap-2 bg-burgundy text-white rounded-xl font-ui font-black text-sm uppercase tracking-widest hover:bg-burgundy/90 transition-all disabled:opacity-60 ml-auto shadow-lg shadow-burgundy/20"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {submitting ? 'Submitting…' : 'Submit Application'}
            </button>
          )}
        </div>

        {/* Free trial nudge */}
        <p className="text-center text-[10px] font-ui text-ink/30 uppercase tracking-widest mt-4">
          Your 1-month free trial starts on approval — no credit card needed
        </p>
      </div>
    </div>
  );
}
