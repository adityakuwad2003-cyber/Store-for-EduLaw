import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CheckCircle2, Loader2, ChevronDown, MessageCircle, Clock } from 'lucide-react';

const EDULAW_WA = '917756040198';          // EduLaw WhatsApp number

const LEGAL_CATEGORIES = [
  'Criminal Law', 'Civil Law', 'Family Law / Divorce', 'Property Law',
  'Corporate / Business Law', 'Labour & Employment', 'Tax Law',
  'Constitutional Law', 'Environmental Law', 'Cyber Law',
  'Intellectual Property', 'Banking & Finance', 'Immigration',
  'Arbitration & Mediation', 'Service / Government Law', 'Other',
];

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

interface FormData {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  issueType: string;
  issueDescription: string;
  location: string;
}

// ── Rule-based matchmaking ───────────────────────────────────────────────────
async function matchLawyer(issueType: string, location: string): Promise<string | null> {
  try {
    const snap = await getDocs(
      query(collection(db, 'vakil_lawyers'), where('status', '==', 'approved'))
    );
    let best: { id: string; score: number } | null = null;
    for (const d of snap.docs) {
      const data = d.data();
      if (!['trial', 'active'].includes(data.subscriptionStatus)) continue;
      let score = 0;
      if (Array.isArray(data.specializations) && data.specializations.includes(issueType)) score += 3;
      if (data.state && location && data.state.toLowerCase() === location.toLowerCase()) score += 2;
      if (data.city && location && data.city.toLowerCase().includes(location.toLowerCase())) score += 1;
      score += Math.min(parseInt(data.experience) || 0, 5);
      if (!best || score > best.score) best = { id: d.id, score };
    }
    return best ? best.id : null;
  } catch { return null; }
}

// ── WhatsApp message builder ──────────────────────────────────────────────────
function buildWAMessage(form: Partial<FormData>): string {
  const lines = [
    `Hi EduLaw VakilConnect! I need legal help.`,
    form.clientName     ? `Name: ${form.clientName}` : '',
    form.clientPhone    ? `Phone: ${form.clientPhone}` : '',
    form.issueType      ? `Issue: ${form.issueType}` : '',
    form.location       ? `Location: ${form.location}` : '',
    form.issueDescription ? `Details: ${form.issueDescription}` : '',
  ].filter(Boolean);
  return encodeURIComponent(lines.join('\n'));
}

// ── Success Popup ─────────────────────────────────────────────────────────────
function SuccessPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-ink/70 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-end sm:items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl"
        >
          <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400" />
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl text-ink mb-3">Inquiry Submitted!</h2>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 mb-4">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-amber-700 text-sm font-ui font-black">Verified within 48 hours</span>
            </div>
            <p className="font-body text-sm text-ink/55 leading-relaxed mb-6">
              Your details have been received. Our team will verify your inquiry and match you with a verified advocate. You'll be contacted within 48 hours.
            </p>
            <button
              onClick={onClose}
              className="w-full min-h-[52px] flex items-center justify-center bg-ink text-parchment rounded-xl font-ui font-black text-sm uppercase tracking-widest hover:bg-ink/90 transition-all"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function InquiryForm() {
  const [form, setForm] = useState<FormData>({
    clientName: '', clientPhone: '', clientEmail: '',
    issueType: '', issueDescription: '', location: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError]     = useState('');

  const set = (k: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientName || !form.clientPhone || !form.issueType || !form.location) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const matchedLawyerId = await matchLawyer(form.issueType, form.location);
      await addDoc(collection(db, 'vakil_inquiries'), {
        ...form,
        matchedLawyerId: matchedLawyerId ?? null,
        status: matchedLawyerId ? 'matched' : 'pending',
        createdAt: Timestamp.now(),
      });
      setShowSuccess(true);
    } catch (err: any) {
      const msg = err?.code === 'permission-denied'
        ? 'Submission failed — database permission error. Please contact support.'
        : 'Something went wrong. Please try the WhatsApp option below.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    const msg = buildWAMessage(form);
    window.open(`https://wa.me/${EDULAW_WA}?text=${msg}`, '_blank');
  };

  const inputCls = 'w-full bg-parchment border border-ink/10 rounded-xl px-4 py-3 font-body text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition';
  const labelCls = 'block text-[10px] font-black uppercase tracking-[0.18em] text-ink/50 font-ui mb-1.5';

  return (
    <>
      {/* Success popup */}
      <AnimatePresence>
        {showSuccess && <SuccessPopup onClose={() => setShowSuccess(false)} />}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Your Name *</label>
            <input type="text" autoComplete="name" placeholder="Ravi Sharma"
              value={form.clientName} onChange={set('clientName')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Phone Number *</label>
            <input type="tel" autoComplete="tel" placeholder="+91 98765 43210"
              value={form.clientPhone} onChange={set('clientPhone')} className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Email (optional)</label>
          <input type="email" autoComplete="email" placeholder="you@example.com"
            value={form.clientEmail} onChange={set('clientEmail')} className={inputCls} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Type of Legal Issue *</label>
            <div className="relative">
              <select value={form.issueType} onChange={set('issueType')}
                className={`${inputCls} appearance-none pr-9`}>
                <option value="">Select issue type…</option>
                {LEGAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Your State / Location *</label>
            <div className="relative">
              <select value={form.location} onChange={set('location')}
                className={`${inputCls} appearance-none pr-9`}>
                <option value="">Select state…</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30 pointer-events-none" />
            </div>
          </div>
        </div>

        <div>
          <label className={labelCls}>Describe your issue briefly</label>
          <textarea rows={3}
            placeholder="Give a short description — our advocate will review before calling."
            value={form.issueDescription} onChange={set('issueDescription')}
            className={`${inputCls} resize-none`} />
        </div>

        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-xs text-red-600 font-ui">
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* ── Divider with "or" ── */}
        <div className="relative flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-ink/8" />
          <span className="text-[10px] font-ui font-black uppercase tracking-widest text-ink/25">Choose how to submit</span>
          <div className="flex-1 h-px bg-ink/8" />
        </div>

        {/* ── Two CTA buttons ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Form submit */}
          <button type="submit" disabled={submitting}
            className="min-h-[52px] flex items-center justify-center gap-2 bg-burgundy text-white rounded-xl font-ui font-black text-sm hover:bg-burgundy/90 transition-colors shadow-lg shadow-burgundy/15 disabled:opacity-60">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {submitting ? 'Submitting…' : 'Submit Inquiry →'}
          </button>

          {/* WhatsApp */}
          <button type="button" onClick={openWhatsApp}
            className="min-h-[52px] flex items-center justify-center gap-2.5 bg-[#25D366] text-white rounded-xl font-ui font-black text-sm hover:bg-[#1ebe59] transition-colors shadow-lg shadow-[#25D366]/20">
            <MessageCircle className="w-4 h-4" />
            Inquire on WhatsApp
          </button>
        </div>

        <p className="text-center text-[10px] font-ui text-ink/30 uppercase tracking-widest">
          Free to submit · No advance payment required
        </p>
      </form>
    </>
  );
}
