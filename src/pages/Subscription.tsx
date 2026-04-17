import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Crown, Star, Scale, LogIn, Zap, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { subscriptionPlans } from '@/data/notes';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { createRazorpayCheckout } from '@/lib/razorpay';

// ── Feature comparison rows ───────────────────────────────────────────────────
const COMPARE_ROWS = [
  { label: 'Judgment Finder searches',  free: '1 lifetime',  pro: '30 / month',   max: '50 / day' },
  { label: 'MCQs per purchased note',   free: '—',           pro: '30 MCQs',      max: 'Unlimited' },
  { label: 'Monthly Judgment Digest',   free: '—',           pro: '✓',            max: '✓' },
  { label: 'Daily Legal Newsletter',    free: '—',           pro: '✓',            max: '✓' },
  { label: 'PDF downloads / month',     free: '—',           pro: '3 notes',      max: '5 notes' },
  { label: 'Priority support',          free: '—',           pro: '✓',            max: '✓ + account manager' },
];

export function Subscription() {
  const { currentUser, isPro, isMax } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const proPlan  = subscriptionPlans[0]; // id: 'pro'
  const maxPlan  = subscriptionPlans[1]; // id: 'max'

  const handleSubscribe = async (planId: 'pro' | 'max') => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const plan = planId === 'pro' ? proPlan : maxPlan;
    setLoadingPlan(planId);
    try {
      await createRazorpayCheckout({
        amount: plan.price * 100, // paise
        currency: 'INR',
        name: 'EduLaw',
        description: `${plan.name} Plan — 30 days`,
        prefill: {
          name: currentUser.displayName || '',
          email: currentUser.email || '',
        },
        theme: { color: planId === 'pro' ? '#6B1E2E' : '#C9A84C' },
        handler: async (response: any) => {
          try {
            const token = await currentUser.getIdToken();
            const res = await fetch('/api/subscribe', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                planId,
                razorpay_payment_id: response.razorpay_payment_id,
                buyerName: currentUser.displayName || '',
                buyerEmail: currentUser.email || '',
              }),
            });
            if (!res.ok) throw new Error('Activation failed');
            // AuthContext real-time listener auto-updates isPro/isMax
          } catch {
            alert(
              'Payment received but activation failed. Please contact support with your payment ID: ' +
              response.razorpay_payment_id
            );
          } finally {
            setLoadingPlan(null);
          }
        },
      });
    } catch {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-parchment">
      <SEO
        title="Pro & Max Subscription — Judgment Finder + Notes | EduLaw"
        description="Subscribe to EduLaw Pro (30 Judgment Finder searches/month) or Max (50/day) for full access to 46 legal notes, free legal services, and priority support."
        canonical="/subscription"
      />

      {/* ── Hero ── */}
      <div className="bg-ink py-16">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto">
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gold/20 rounded-full mb-6"
            >
              <Crown className="w-4 h-4 text-gold" />
              <span className="font-ui text-sm text-gold">Premium Access</span>
            </motion.span>
            <h1 className="font-display text-4xl lg:text-5xl text-parchment mb-4">
              India's Complete <span className="text-gold">Legal Suite</span>
            </h1>
            <p className="font-body text-lg text-parchment/70 max-w-xl mx-auto">
              Judgment Finder · 46 Law Notes · Free Legal Services. One subscription.
            </p>
          </div>
        </div>
      </div>

      <div className="section-container py-16">

        {/* ── Judgment Finder highlight banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-12 bg-white border border-gold/20 rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm"
        >
          <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
            <Scale className="w-7 h-7 text-gold" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gold font-ui mb-1">Judgment Finder</p>
            <h2 className="font-display text-xl text-ink mb-1">India's most complete legal research tool</h2>
            <p className="text-sm font-body text-ink/55 leading-relaxed">
              10-section reports: plain English explainers, citizen rights, live SC/HC precedents, IPC→BNS mapping, exam MCQs, judge profiles & lawyer directory. Gated after your 1 free search.
            </p>
          </div>
          <Link
            to="/judgement-finder"
            className="shrink-0 px-5 py-2.5 rounded-xl bg-ink text-parchment font-ui text-xs font-black uppercase tracking-wider hover:bg-ink/90 transition-colors"
          >
            Try Free Search
          </Link>
        </motion.div>

        {/* ── Pricing Cards ── */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-14">

          {/* Free tier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0 }}
            className="bg-white rounded-[1.5rem] p-7 border border-ink/10 shadow-sm flex flex-col"
          >
            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-ink/40 font-ui mb-1">Free</p>
              <p className="font-display text-3xl text-ink">₹0</p>
              <p className="text-xs text-mutedgray mt-1">Sign in, no payment needed</p>
            </div>
            <ul className="space-y-2.5 flex-1 mb-6">
              {[
                '1 Judgment Finder search (lifetime)',
                'Browse & buy from 46-note marketplace',
                'Daily legal news feed',
                'Legal playground & quizzes',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-mutedgray">
                  <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            {!currentUser ? (
              <Link
                to="/login"
                className="w-full h-11 border border-ink/15 rounded-xl font-ui text-sm font-bold text-ink/60 hover:text-ink hover:border-ink/30 transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Sign In Free
              </Link>
            ) : (
              <div className="w-full h-11 bg-ink/5 rounded-xl font-ui text-sm font-bold text-ink/40 flex items-center justify-center">
                Current Plan
              </div>
            )}
          </motion.div>

          {/* Pro tier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className={`bg-white rounded-[1.5rem] p-7 border shadow-lg flex flex-col ${isPro ? 'border-burgundy ring-2 ring-burgundy' : 'border-burgundy/30'}`}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Crown className="w-3.5 h-3.5 text-burgundy" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-burgundy font-ui">Pro</p>
                </div>
                <p className="font-display text-3xl text-ink">₹499<span className="text-base font-body text-ink/40">/mo</span></p>
                <p className="text-xs text-mutedgray mt-1">Billed monthly</p>
              </div>
              {isPro && (
                <span className="px-2.5 py-1 bg-burgundy/10 text-burgundy rounded-full text-[10px] font-black uppercase tracking-widest">Active</span>
              )}
            </div>
            <ul className="space-y-2.5 flex-1 mb-6">
              {proPlan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-mutedgray">
                  <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            {isPro ? (
              <div className="w-full h-11 bg-burgundy/8 rounded-xl font-ui text-sm font-bold text-burgundy flex items-center justify-center">
                You're on Pro ✓
              </div>
            ) : (
              <button
                onClick={() => handleSubscribe('pro')}
                disabled={loadingPlan === 'pro'}
                className="w-full h-11 bg-burgundy text-parchment rounded-xl font-ui text-sm font-bold hover:bg-burgundy/90 active:scale-[0.98] transition-all shadow-md shadow-burgundy/20 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loadingPlan === 'pro' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Opening...</>
                ) : 'Subscribe to Pro'}
              </button>
            )}
          </motion.div>

          {/* Max tier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 }}
            className={`relative bg-ink rounded-[1.5rem] p-7 border shadow-xl flex flex-col ${isMax ? 'border-gold' : 'border-gold/30'}`}
          >
            {/* Best value badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gold text-ink text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg whitespace-nowrap">
              Most Popular
            </div>
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Star className="w-3.5 h-3.5 text-gold" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gold font-ui">Max</p>
                </div>
                <p className="font-display text-3xl text-parchment">₹999<span className="text-base font-body text-parchment/40">/mo</span></p>
                <p className="text-xs text-parchment/50 mt-1">Billed monthly</p>
              </div>
              {isMax && (
                <span className="px-2.5 py-1 bg-gold/20 text-gold rounded-full text-[10px] font-black uppercase tracking-widest">Active</span>
              )}
            </div>
            <ul className="space-y-2.5 flex-1 mb-6">
              {maxPlan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-parchment/70">
                  <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            {isMax ? (
              <div className="w-full h-11 bg-gold/15 rounded-xl font-ui text-sm font-bold text-gold flex items-center justify-center">
                You're on Max ✓
              </div>
            ) : (
              <button
                onClick={() => handleSubscribe('max')}
                disabled={loadingPlan === 'max'}
                className="w-full h-11 bg-gold text-ink rounded-xl font-ui text-sm font-bold hover:bg-gold/90 active:scale-[0.98] transition-all shadow-md shadow-gold/20 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loadingPlan === 'max' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Opening...</>
                ) : 'Subscribe to Max'}
              </button>
            )}
          </motion.div>
        </div>

        {/* ── Feature comparison table ── */}
        <div className="max-w-5xl mx-auto mb-16 overflow-x-auto">
          <h2 className="font-display text-2xl text-ink text-center mb-6">Full Comparison</h2>
          <table className="w-full min-w-[600px] bg-white rounded-2xl overflow-hidden shadow-sm border border-ink/8">
            <thead>
              <tr className="border-b border-ink/8">
                <th className="text-left px-6 py-4 font-ui text-xs text-ink/40 uppercase tracking-widest">Feature</th>
                <th className="px-6 py-4 font-ui text-xs text-ink/40 uppercase tracking-widest text-center">Free</th>
                <th className="px-6 py-4 font-ui text-xs text-burgundy uppercase tracking-widest text-center">Pro</th>
                <th className="px-6 py-4 font-ui text-xs text-gold uppercase tracking-widest text-center bg-ink/3">Max</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {COMPARE_ROWS.map((row, i) => (
                <tr key={i} className="hover:bg-parchment/40 transition-colors">
                  <td className="px-6 py-3.5 font-ui text-sm text-ink/70">{row.label}</td>
                  <td className="px-6 py-3.5 font-ui text-xs text-center text-ink/40">{row.free}</td>
                  <td className="px-6 py-3.5 font-ui text-xs text-center text-burgundy font-bold">{row.pro}</td>
                  <td className="px-6 py-3.5 font-ui text-xs text-center text-gold font-bold bg-ink/3">{row.max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Conversion nudge strip ── */}
        <div className="max-w-4xl mx-auto mb-16 bg-gradient-to-r from-ink to-[#1a1a1a] rounded-[2rem] p-8 border border-gold/20 shadow-xl flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
            <Zap className="w-7 h-7 text-gold" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-xl text-parchment mb-1">Start with 1 free search — no card required</h3>
            <p className="text-sm font-body text-parchment/55">Sign in with Google and get your first Judgment Finder report instantly. Upgrade when you need more.</p>
          </div>
          {!currentUser ? (
            <Link
              to="/login"
              className="shrink-0 px-6 py-3 bg-gold text-ink rounded-xl font-ui text-sm font-black uppercase tracking-wider hover:bg-gold/90 active:scale-[0.98] transition-all"
            >
              Sign In Free
            </Link>
          ) : (
            <Link
              to="/judgement-finder"
              className="shrink-0 px-6 py-3 bg-gold text-ink rounded-xl font-ui text-sm font-black uppercase tracking-wider hover:bg-gold/90 active:scale-[0.98] transition-all"
            >
              Go to Finder
            </Link>
          )}
        </div>

        {/* ── FAQ ── */}
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl text-ink mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'What is included in the free plan?',
                a: 'Any signed-in user gets 1 complimentary Judgment Finder search (no payment needed). You can browse the marketplace and purchase individual notes at any time.',
              },
              {
                q: 'Do Judgment Finder searches roll over?',
                a: 'No. Pro\'s 30 monthly searches and Max\'s 50 daily searches reset at the start of each period and do not accumulate.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. Your access continues until the end of your billing period. No hidden fees. Payment secured via Razorpay.',
              },
              {
                q: 'How are download quotas handled?',
                a: 'Downloads reset at the start of your billing cycle. Pro gets 3 PDF downloads/month; Max gets 5. Unused downloads do not carry over.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-ink/5">
                <h3 className="font-ui font-bold text-sm text-ink mb-2">{faq.q}</h3>
                <p className="text-sm text-mutedgray leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
