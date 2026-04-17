import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import {
  Scale, ShieldCheck, Users, Briefcase,
  Star, CheckCircle2, ArrowRight, Zap,
  FileCheck, Clock, Award, ChevronRight,
} from 'lucide-react';
import { InquiryForm } from '@/components/vakil/InquiryForm';

// ── Data ─────────────────────────────────────────────────────────────────────
const HOW_IT_WORKS_CLIENT = [
  { icon: FileCheck, title: 'Submit Your Inquiry', desc: 'Tell us your legal issue — takes under 2 minutes.' },
  { icon: Zap,       title: 'AI Matches You',      desc: 'Our system matches you with a verified advocate in your area.' },
  { icon: Clock,     title: 'Get Called Back',      desc: 'Your matched advocate reviews and calls within 24 hours.' },
];

const HOW_IT_WORKS_LAWYER = [
  { icon: ShieldCheck, title: 'Register & KYC',       desc: 'Upload your Bar Council enrollment and complete a quick profile.' },
  { icon: Award,       title: '1-Month Free Trial',   desc: 'Get full access to leads for your first month — completely free.' },
  { icon: Users,       title: 'Receive Matched Leads', desc: 'Only relevant inquiries land in your dashboard, matched by specialization & location.' },
];

const SPECIALIZATIONS = [
  'Criminal Law', 'Family Law', 'Property Law', 'Corporate Law',
  'Labour Law', 'Tax Law', 'Constitutional Law', 'Environmental Law',
  'Cyber Law', 'Intellectual Property', 'Banking Law', 'Arbitration',
];

const STATS = [
  { value: '1 Month', label: 'Free Trial for Lawyers' },
  { value: '₹999/mo', label: 'After Trial' },
  { value: '24 hrs', label: 'Average Match Time' },
  { value: 'AI', label: 'Smart Matchmaking' },
];

const FAQS = [
  {
    q: 'Is VakilConnect free for clients?',
    a: 'Yes — submitting an inquiry is completely free. You only pay the advocate directly for their services, if you choose to proceed.',
  },
  {
    q: 'How does the 1-month free trial work for lawyers?',
    a: 'When you complete KYC registration, your account is activated on a 1-month trial. During this period you receive matched leads at no cost. After 30 days, continue with ₹999/month.',
  },
  {
    q: 'How is the match made?',
    a: 'Our system scores registered advocates on specialization match, location proximity, and years of experience. The best-fit advocate receives the inquiry first.',
  },
  {
    q: 'What KYC documents do I need as a lawyer?',
    a: 'You need your Bar Enrollment Certificate (PDF or image, max 1 MB) and a profile photo. All documents are securely stored and only used for verification.',
  },
];

// ── FAQ Schema ────────────────────────────────────────────────────────────────
const vakilFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": FAQS.map(faq => ({
    "@type": "Question",
    "name": faq.q,
    "acceptedAnswer": { "@type": "Answer", "text": faq.a },
  })),
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function VakilConnect() {
  return (
    <div className="min-h-screen bg-parchment">
      <SEO
        title="VakilConnect — Find Verified Advocates Online"
        description="Connect with verified advocates across India — free to submit. AI matches you with a specialist in criminal, family, property or corporate law within 24 hours."
        canonical="/vakil-connect"
        structuredData={vakilFaqSchema}
      />

      {/* ── HERO ── */}
      <section className="relative bg-ink overflow-hidden">
        {/* Grid bg */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(201,168,76,1) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,1) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute inset-0 bg-gradient-to-br from-burgundy/20 via-transparent to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/15 border border-gold/25 mb-6">
              <Scale className="w-3.5 h-3.5 text-gold" />
              <span className="text-gold text-[10px] font-black uppercase tracking-[0.2em] font-ui">VakilConnect × TheEduLaw</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-parchment leading-[1.05] mb-5">
              Legal Help,<br />
              <span className="text-gold italic">Matched to You.</span>
            </h1>
            <p className="font-body text-parchment/60 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-8">
              Tell us your issue. Our AI finds the right verified advocate in your city — free for clients, powerful for lawyers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="#find-advocate"
                className="w-full sm:w-auto min-h-[52px] inline-flex items-center justify-center gap-2 px-8 bg-gold text-ink rounded-xl font-ui font-black text-sm uppercase tracking-widest hover:bg-gold/90 transition-all shadow-xl shadow-gold/20"
              >
                Find an Advocate <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/vakil-connect/lawyer-onboard"
                className="w-full sm:w-auto min-h-[52px] inline-flex items-center justify-center gap-2 px-8 border border-white/20 text-parchment/80 rounded-xl font-ui font-bold text-sm hover:border-gold/40 hover:text-gold transition-all"
              >
                <Briefcase className="w-4 h-4" /> I'm a Lawyer — Join Free
              </Link>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {STATS.map(s => (
              <div key={s.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
                <p className="font-display text-2xl sm:text-3xl text-gold">{s.value}</p>
                <p className="text-[10px] font-ui font-bold text-parchment/40 uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS — CLIENTS ── */}
      <section className="py-16 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gold font-ui mb-2">For Clients</p>
          <h2 className="font-display text-3xl sm:text-4xl text-ink">Get Legal Help in 3 Steps</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {HOW_IT_WORKS_CLIENT.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-ink/6 p-6 flex flex-col gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-burgundy/10 flex items-center justify-center">
                <step.icon className="w-5 h-5 text-burgundy" />
              </div>
              <div>
                <p className="font-ui font-black text-[10px] uppercase tracking-[0.18em] text-gold mb-1">Step {i + 1}</p>
                <h3 className="font-display text-xl text-ink mb-1">{step.title}</h3>
                <p className="font-body text-sm text-ink/55 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FIND ADVOCATE FORM ── */}
      <section id="find-advocate" className="bg-white border-y border-ink/6 py-16 sm:py-20 scroll-mt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gold font-ui mb-2">Free Consultation Match</p>
            <h2 className="font-display text-3xl sm:text-4xl text-ink mb-2">Describe Your Legal Issue</h2>
            <p className="font-body text-sm text-ink/50">Our system finds the best-fit advocate for you.</p>
          </div>
          <InquiryForm />
        </div>
      </section>

      {/* ── FOR LAWYERS ── */}
      <section className="py-16 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gold font-ui mb-3">For Advocates</p>
            <h2 className="font-display text-3xl sm:text-4xl text-ink mb-4 leading-tight">
              Grow Your Practice with<br />
              <span className="text-burgundy italic">Verified Client Leads</span>
            </h2>
            <p className="font-body text-ink/60 text-sm sm:text-base leading-relaxed mb-6">
              Join VakilConnect to receive pre-qualified inquiries matched to your specialization and location. Start with a full free month — no credit card needed.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'AI-matched leads — only relevant inquiries reach you',
                '1 month completely free when you register',
                '₹999/month after trial — cancel anytime',
                'KYC verification builds client trust',
              ].map(item => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="font-body text-sm text-ink/70">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/vakil-connect/lawyer-onboard"
              className="inline-flex items-center gap-2 min-h-[52px] px-8 bg-ink text-parchment rounded-xl font-ui font-black text-sm uppercase tracking-widest hover:bg-ink/90 transition-all shadow-lg shadow-ink/10"
            >
              Register as Advocate <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Steps for lawyers */}
          <div className="space-y-4">
            {HOW_IT_WORKS_LAWYER.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 bg-white rounded-2xl border border-ink/6 p-5"
              >
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                  <step.icon className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h3 className="font-ui font-black text-sm text-ink mb-0.5">{step.title}</h3>
                  <p className="font-body text-xs text-ink/55 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECIALIZATIONS ── */}
      <section className="bg-white border-y border-ink/6 py-14 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gold font-ui mb-3">Areas We Cover</p>
          <h2 className="font-display text-2xl sm:text-3xl text-ink mb-8">Advocates Across All Practice Areas</h2>
          <div className="flex flex-wrap justify-center gap-2.5">
            {SPECIALIZATIONS.map(s => (
              <span
                key={s}
                className="px-4 py-2 rounded-full bg-parchment border border-ink/10 font-ui text-xs font-bold text-ink/60 hover:border-burgundy/30 hover:text-burgundy transition-colors"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section className="py-14 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          {[
            { icon: ShieldCheck, title: 'KYC Verified Advocates', desc: 'Every lawyer on the platform has submitted their Bar enrollment certificate.' },
            { icon: Star,        title: 'Quality Matched',        desc: 'AI scores each lawyer on expertise, location and experience before routing your inquiry.' },
            { icon: Scale,       title: 'No Advance Payment',     desc: "Submitting an inquiry is free. Pay the advocate directly — only if you proceed." },
          ].map(b => (
            <div key={b.title} className="bg-parchment rounded-2xl border border-ink/8 p-6">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-3">
                <b.icon className="w-5 h-5 text-gold" />
              </div>
              <h3 className="font-ui font-black text-sm text-ink mb-1">{b.title}</h3>
              <p className="font-body text-xs text-ink/55 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white border-t border-ink/6 py-14 sm:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl sm:text-3xl text-ink">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map(faq => (
              <div key={faq.q} className="bg-parchment rounded-2xl border border-ink/8 p-5">
                <h3 className="font-ui font-black text-sm text-ink mb-2">{faq.q}</h3>
                <p className="font-body text-sm text-ink/60 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-ink py-16 sm:py-20 text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="font-display text-3xl sm:text-4xl text-parchment mb-4">
            Ready to Connect?
          </h2>
          <p className="font-body text-parchment/50 text-sm mb-8">
            Whether you need legal help or want to offer it — VakilConnect is your platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#find-advocate"
              className="min-h-[52px] inline-flex items-center justify-center gap-2 px-8 bg-gold text-ink rounded-xl font-ui font-black text-sm uppercase tracking-widest hover:bg-gold/90 transition-all"
            >
              Find an Advocate
            </a>
            <Link
              to="/vakil-connect/lawyer-onboard"
              className="min-h-[52px] inline-flex items-center justify-center gap-2 px-8 border border-white/20 text-parchment/80 rounded-xl font-ui font-bold text-sm hover:border-gold/40 hover:text-gold transition-all"
            >
              Join as a Lawyer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
