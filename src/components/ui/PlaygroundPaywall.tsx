import { motion } from 'framer-motion';
import { LogIn, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlaygroundPaywallProps {
  section: 'news' | 'digest' | 'insights';
  itemsShown: number;
  totalItems: number;
  className?: string;
  onDismiss?: () => void;
}

const COPY: Record<'news' | 'digest' | 'insights', { heading: string; sub: string }> = {
  news: {
    heading: "Sign in to read more",
    sub: "You've seen a preview. Create a free account to read all daily legal updates — no subscription needed.",
  },
  digest: {
    heading: "Sign in to read more",
    sub: "Create a free account to access all landmark case digests every day.",
  },
  insights: {
    heading: "Sign in to read more",
    sub: "Create a free account to access the full EduLaw knowledge library.",
  },
};

export function PlaygroundPaywall({
  section,
  itemsShown,
  totalItems,
  className = '',
  onDismiss,
}: PlaygroundPaywallProps) {
  const { heading, sub } = COPY[section];
  const remaining = totalItems - itemsShown;

  return (
    <div className={className}>
      {/* Full-screen modal — mobile-safe: outer scrolls, card anchors to bottom on mobile */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-blue-950/80 backdrop-blur-sm" onClick={onDismiss} />

        {/* Sheet on mobile, centred on desktop */}
        <div className="flex min-h-full items-end sm:items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 w-full max-w-lg bg-white rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl"
          >
            {/* Gold top bar */}
            <div className="h-1 bg-gradient-to-r from-gold/40 via-gold to-gold/40" />

            <div className="p-6 sm:p-8">
              {/* Ghost card previews */}
              <div className="pointer-events-none select-none space-y-3 mb-6 opacity-60">
                {[1, 2].map(i => (
                  <div key={i} className={`bg-parchment rounded-2xl p-4 blur-sm ${i === 2 ? 'opacity-50' : ''}`}>
                    <div className="h-3 bg-ink/10 rounded w-3/4 mb-2" />
                    <div className="h-2.5 bg-ink/8 rounded w-full mb-1.5" />
                    <div className="h-2.5 bg-ink/8 rounded w-4/6" />
                  </div>
                ))}
              </div>

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-ink/8 border border-ink/10 flex items-center justify-center mb-5 mx-auto">
                <LogIn className="w-7 h-7 text-ink/60" />
              </div>

              {/* Copy */}
              <h2 className="font-display text-2xl text-ink text-center mb-2 leading-snug">
                {heading}
              </h2>
              <p className="font-body text-sm text-ink/60 text-center leading-relaxed mb-2">
                {sub}
              </p>
              {remaining > 0 && (
                <p className="font-ui text-[11px] font-black uppercase tracking-widest text-gold text-center mb-8">
                  {remaining} more {section === 'news' ? 'stories' : section === 'digest' ? 'digests' : 'articles'} waiting
                </p>
              )}

              {/* Free account badge */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-green-700 font-ui text-[11px] font-black uppercase tracking-widest">
                  ✓ Always free — no credit card needed
                </span>
              </div>

              {/* CTAs — all min-h-[48px] */}
              <div className="flex flex-col gap-3">
                {/* Primary: Sign in / Register */}
                <Link
                  to="/login"
                  className="w-full min-h-[48px] flex items-center justify-center gap-2 bg-ink text-parchment rounded-xl font-ui text-sm font-black uppercase tracking-wider hover:bg-ink/90 transition-colors"
                >
                  <LogIn className="w-4 h-4" /> Sign In / Register Free
                </Link>

                {/* Secondary: soft subscription nudge */}
                <Link
                  to="/subscription"
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 border border-gold/30 bg-gold/6 text-ink/70 rounded-xl font-ui text-xs font-bold hover:bg-gold/12 transition-colors"
                >
                  <Crown className="w-3.5 h-3.5 text-gold" /> Unlock Pro features from ₹499/mo
                </Link>

                {onDismiss && (
                  <button
                    onClick={onDismiss}
                    className="w-full min-h-[40px] text-ink/35 font-ui text-xs hover:text-ink/55 transition-colors"
                  >
                    Maybe later
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
