import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Gift, Scale, FileText, BookOpen, Copy, Check, ChevronLeft, Sparkles, Star,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const COUPON = 'EDULAW50';
const SESSION_KEY = 'edulaw_signin_popup_shown';

const BENEFITS = [
  { icon: Gift,     label: '50% off your first order', sub: 'Code: EDULAW50' },
  { icon: Scale,    label: 'Free Legal Playground', sub: 'Interactive case simulations' },
  { icon: FileText, label: '1 Free Mock Test', sub: 'Full-length MCQ booklet' },
  { icon: BookOpen, label: 'Premium Notes Access', sub: 'Hand-crafted by law toppers' },
];

type View = 'default' | 'email' | 'success';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export function SignInPopup() {
  const { currentUser, signInWithGoogle, loginWithEmail, signupWithEmail } = useAuth();

  const [visible, setVisible] = useState(false);
  const [view, setView] = useState<View>('default');

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [isSignUp, setIsSignUp]   = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading]     = useState(false);
  const [copied, setCopied]       = useState(false);

  useEffect(() => {
    if (currentUser) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && visible) {
      setView('success');
      sessionStorage.setItem(SESSION_KEY, '1');
      const t = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(t);
    }
  }, [currentUser, visible]);

  const dismiss = () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setVisible(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      setFormError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setFormError('Please fill in both fields.'); return; }
    setLoading(true);
    setFormError('');
    try {
      if (isSignUp) {
        await signupWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setFormError('Invalid email or password.');
      } else if (msg.includes('email-already-in-use')) {
        setFormError('Account already exists. Try signing in instead.');
      } else if (msg.includes('weak-password')) {
        setFormError('Password must be at least 6 characters.');
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyCoupon = async () => {
    await navigator.clipboard.writeText(COUPON);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="signin-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[9997]"
          />

          {/* Centering shell — flex keeps modal perfectly centred regardless of animation */}
          <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="signin-popup"
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 24 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="pointer-events-auto w-full max-w-[860px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-parchment rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">

                {/* ══════════════════════════════
                    LEFT PANEL — burgundy (desktop)
                    Compact header strip (mobile)
                ══════════════════════════════ */}
                <div className="bg-burgundy md:w-[42%] shrink-0 relative overflow-hidden">

                  {/* Decorative circles */}
                  <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gold/10 pointer-events-none" />
                  <div className="absolute -bottom-16 -left-10 w-48 h-48 rounded-full bg-gold/8 pointer-events-none" />

                  {/* ─── Mobile header (compact row) ─── */}
                  <div className="md:hidden flex items-center justify-between px-5 py-4 relative">
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Star className="w-3 h-3 text-gold fill-gold" />
                        <span className="font-ui text-[10px] font-bold uppercase tracking-[0.18em] text-gold/80">EduLaw Store</span>
                      </div>
                      <p className="font-display text-lg text-parchment leading-tight">
                        India's #1 <span className="text-gold">Legal Learning</span> Platform
                      </p>
                    </div>
                    {/* Mobile close */}
                    <button
                      onClick={dismiss}
                      aria-label="Close"
                      className="p-1.5 rounded-full text-parchment/50 hover:text-parchment hover:bg-white/10 transition-colors shrink-0 ml-3"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Mobile: horizontal benefits strip */}
                  <div className="md:hidden px-5 pb-4 relative">
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {BENEFITS.map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-1.5 shrink-0 bg-white/10 rounded-lg px-2.5 py-1.5">
                          <Icon className="w-3 h-3 text-gold shrink-0" />
                          <span className="font-ui text-[11px] text-parchment whitespace-nowrap">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ─── Desktop left panel (full) ─── */}
                  <div className="hidden md:flex flex-col px-7 py-8 h-full">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-4 h-4 text-gold fill-gold" />
                      <span className="font-ui text-[11px] font-bold uppercase tracking-[0.2em] text-gold/80">EduLaw Store</span>
                    </div>
                    <h2 className="font-display text-2xl lg:text-3xl text-parchment leading-tight mb-1">
                      India's #1<br />
                      <span className="text-gold">Legal Learning</span><br />
                      Platform
                    </h2>
                    <p className="font-ui text-xs text-parchment/60 mt-2 leading-relaxed">
                      Join 50,000+ law students who trust EduLaw for exam-ready notes, mock tests &amp; live legal tools.
                    </p>

                    <div className="my-5 flex items-center gap-3">
                      <div className="h-px flex-1 bg-gold/25" />
                      <Sparkles className="w-3.5 h-3.5 text-gold/60" />
                      <div className="h-px flex-1 bg-gold/25" />
                    </div>

                    <ul className="space-y-3.5 flex-1">
                      {BENEFITS.map(({ icon: Icon, label, sub }) => (
                        <li key={label} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/25 flex items-center justify-center shrink-0 mt-0.5">
                            <Icon className="w-4 h-4 text-gold" />
                          </div>
                          <div>
                            <p className="font-ui text-sm font-semibold text-parchment leading-tight">{label}</p>
                            <p className="font-ui text-[11px] text-parchment/55 mt-0.5">{sub}</p>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <p className="font-ui text-[10px] text-parchment/40 mt-6 leading-relaxed">
                      By signing in you agree to our Terms of Service &amp; Privacy Policy.
                    </p>
                  </div>
                </div>

                {/* ══════════════════════════════
                    RIGHT PANEL — form / success
                ══════════════════════════════ */}
                <div className="flex-1 flex flex-col px-5 sm:px-7 py-6 sm:py-8 overflow-y-auto relative min-h-0">

                  {/* Desktop close button */}
                  <button
                    onClick={dismiss}
                    aria-label="Close"
                    className="hidden md:flex absolute top-4 right-4 p-1.5 rounded-full text-mutedgray hover:text-ink hover:bg-ink/8 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* ── SUCCESS ── */}
                  {view === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center flex-1 text-center gap-4 py-4"
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center">
                        <Gift className="w-7 h-7 sm:w-8 sm:h-8 text-gold" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl sm:text-2xl text-ink mb-1">Welcome aboard! 🎉</h3>
                        <p className="font-ui text-sm text-mutedgray leading-relaxed">
                          Your exclusive coupon is ready.<br />Use it at checkout for <strong className="text-burgundy">50% off</strong>.
                        </p>
                      </div>
                      <button
                        onClick={copyCoupon}
                        className="w-full flex items-center justify-between gap-3 px-5 py-4 bg-parchment border-2 border-dashed border-gold/60 rounded-xl hover:border-gold hover:bg-gold/5 transition-all group"
                      >
                        <span className="font-display text-2xl text-burgundy tracking-widest">{COUPON}</span>
                        {copied
                          ? <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                          : <Copy className="w-5 h-5 text-gold/60 group-hover:text-gold shrink-0 transition-colors" />
                        }
                      </button>
                      <p className="font-ui text-[11px] text-mutedgray">
                        {copied ? '✓ Copied! Paste at checkout.' : 'Tap to copy · Valid for one use'}
                      </p>
                      <button onClick={() => setVisible(false)} className="btn-primary w-full py-3 text-sm">
                        Start Exploring →
                      </button>
                    </motion.div>
                  )}

                  {/* ── DEFAULT ── */}
                  {view === 'default' && (
                    <motion.div
                      key="default"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col flex-1"
                    >
                      <div className="mb-5">
                        <h3 className="font-display text-xl sm:text-2xl lg:text-3xl text-ink leading-tight mb-1.5">
                          Unlock everything.<br />
                          <span className="text-burgundy">Sign in to get started.</span>
                        </h3>
                        <p className="font-ui text-sm text-mutedgray leading-relaxed">
                          Get instant access to all features — plus your exclusive welcome coupon.
                        </p>
                      </div>

                      {/* Coupon pill */}
                      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gold/10 border border-gold/25 mb-5">
                        <Gift className="w-4 h-4 text-gold shrink-0" />
                        <p className="font-ui text-xs text-ink">
                          Sign in and instantly receive{' '}
                          <span className="font-bold text-burgundy">50% OFF</span> coupon{' '}
                          <span className="font-mono font-bold text-burgundy">{COUPON}</span>
                        </p>
                      </div>

                      <button
                        onClick={handleGoogle}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 py-3 px-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all font-ui text-sm font-medium text-ink active:scale-95 disabled:opacity-60 mb-3"
                      >
                        <GoogleIcon />
                        Continue with Google
                      </button>

                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-px flex-1 bg-gray-200" />
                        <span className="font-ui text-[11px] text-mutedgray">or</span>
                        <div className="h-px flex-1 bg-gray-200" />
                      </div>

                      <button
                        onClick={() => { setView('email'); setFormError(''); }}
                        className="w-full py-3 px-5 rounded-xl border border-burgundy/30 text-burgundy font-ui text-sm font-semibold hover:bg-burgundy/5 transition-colors active:scale-95"
                      >
                        Continue with Email
                      </button>

                      {formError && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="font-ui text-xs text-red-500 mt-3 text-center"
                        >
                          {formError}
                        </motion.p>
                      )}

                      <div className="mt-auto pt-5 text-center">
                        <button
                          onClick={dismiss}
                          className="font-ui text-xs text-mutedgray hover:text-ink transition-colors underline underline-offset-2"
                        >
                          Maybe later — browse without signing in
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ── EMAIL FORM ── */}
                  {view === 'email' && (
                    <motion.div
                      key="email"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      className="flex flex-col flex-1"
                    >
                      <button
                        onClick={() => { setView('default'); setFormError(''); }}
                        className="flex items-center gap-1 font-ui text-xs text-mutedgray hover:text-ink transition-colors mb-4 self-start"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Back
                      </button>

                      <h3 className="font-display text-xl sm:text-2xl text-ink mb-1">
                        {isSignUp ? 'Create your account' : 'Welcome back'}
                      </h3>
                      <p className="font-ui text-sm text-mutedgray mb-4">
                        {isSignUp
                          ? 'Sign up in seconds and claim your 50% coupon.'
                          : 'Sign in to access your notes, tests & more.'}
                      </p>

                      <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3 flex-1">
                        <div>
                          <label className="font-ui text-xs font-semibold text-ink/70 mb-1.5 block">Email</label>
                          <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white font-ui text-sm focus:outline-none focus:border-burgundy/50 focus:ring-2 focus:ring-burgundy/10 transition-all"
                            autoComplete="email"
                          />
                        </div>
                        <div>
                          <label className="font-ui text-xs font-semibold text-ink/70 mb-1.5 block">Password</label>
                          <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder={isSignUp ? 'Min. 6 characters' : '••••••••'}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white font-ui text-sm focus:outline-none focus:border-burgundy/50 focus:ring-2 focus:ring-burgundy/10 transition-all"
                            autoComplete={isSignUp ? 'new-password' : 'current-password'}
                          />
                        </div>

                        {formError && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="font-ui text-xs text-red-500"
                          >
                            {formError}
                          </motion.p>
                        )}

                        <button
                          type="submit"
                          disabled={loading}
                          className="btn-primary w-full py-3 text-sm mt-1 disabled:opacity-60"
                        >
                          {loading ? 'Please wait…' : isSignUp ? 'Create Account & Get Coupon' : 'Sign In'}
                        </button>
                      </form>

                      <p className="font-ui text-xs text-mutedgray text-center mt-4">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                          onClick={() => { setIsSignUp(!isSignUp); setFormError(''); }}
                          className="text-burgundy font-semibold hover:underline"
                        >
                          {isSignUp ? 'Sign in' : 'Sign up for free'}
                        </button>
                      </p>

                      <div className="pt-4 text-center">
                        <button
                          onClick={dismiss}
                          className="font-ui text-xs text-mutedgray hover:text-ink transition-colors underline underline-offset-2"
                        >
                          Maybe later
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
