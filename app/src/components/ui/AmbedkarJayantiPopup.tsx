import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, CheckCircle, Tag, ShoppingCart, BookOpen, Calendar, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COUPON_CODE = 'LAW135';
const POPUP_LS_PREFIX = 'edulaw_ajpopup_';

function isWithinJayantiWindow(): boolean {
  const istNow = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return (
    istNow.getUTCFullYear() === 2026 &&
    istNow.getUTCMonth() === 3 && // April = 3 (0-indexed)
    (istNow.getUTCDate() === 14 || istNow.getUTCDate() === 15)
  );
}

function getTodayKey(): string {
  const istNow = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const y = istNow.getUTCFullYear();
  const m = String(istNow.getUTCMonth() + 1).padStart(2, '0');
  const d = String(istNow.getUTCDate()).padStart(2, '0');
  return `${POPUP_LS_PREFIX}${y}-${m}-${d}`;
}

export function AmbedkarJayantiPopup() {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isWithinJayantiWindow()) return;
    if (localStorage.getItem(getTodayKey())) return;
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setVisible(false);
    localStorage.setItem(getTodayKey(), '1');
  };

  const copy = async () => {
    await navigator.clipboard.writeText(COUPON_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAutoApply = () => {
    localStorage.setItem('edulaw_pending_coupon', JSON.stringify({ code: COUPON_CODE }));
    close();
    navigate('/cart');
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="aj-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-[9998]"
          />

          {/* Outer scroll container — fixed + overflow-y-auto allows scrolling on short screens */}
          <div className="fixed inset-0 z-[9999] overflow-y-auto">
            {/* Inner flex container — min-h-full + items-center centers when space allows, scrolls when it doesn't */}
            <div className="flex min-h-full items-center justify-center p-4 pointer-events-none">
          <motion.div
            key="aj-popup"
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="w-full max-w-md pointer-events-auto"
          >
            <div className="relative bg-parchment rounded-3xl shadow-2xl overflow-hidden">

              {/* Navy header band */}
              <div className="bg-[#1B2A6B] px-4 sm:px-6 pt-4 pb-6 text-center relative">
                <button
                  onClick={close}
                  aria-label="Close"
                  className="absolute top-3 right-3 p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Icon */}
                <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-5 h-5 text-[#F5C518]" />
                </div>

                <p className="font-ui text-xs font-bold uppercase tracking-[0.2em] text-[#F5C518]/80 mb-1">
                  135th Birth Anniversary
                </p>
                <h2 className="font-display text-2xl sm:text-3xl text-white leading-tight">
                  Dr. Babasaheb{' '}
                  <span className="text-[#F5C518]">Ambedkar Jayanti</span>
                </h2>
                <p className="font-body text-white/70 text-sm mt-1.5">
                  ₹135 off all notes — today &amp; tomorrow only
                </p>
              </div>

              {/* Overlap card */}
              <div className="-mt-4 mx-3 sm:mx-5 bg-white rounded-2xl shadow-lg p-4 relative z-10 mb-3">
                {/* Coupon code box */}
                <button
                  onClick={copy}
                  className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4 bg-parchment border-2 border-dashed border-gold/60 rounded-xl hover:border-gold hover:bg-gold/5 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gold shrink-0" />
                    <span className="font-display text-xl sm:text-2xl text-burgundy tracking-widest">
                      {COUPON_CODE}
                    </span>
                  </div>
                  {copied
                    ? <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    : <Copy className="w-5 h-5 text-gold/60 group-hover:text-gold shrink-0 transition-colors" />
                  }
                </button>
                <p className="text-center font-ui text-[11px] text-mutedgray mt-2">
                  {copied ? '✓ Copied to clipboard!' : 'Tap to copy code'}
                </p>

                {/* Details strip */}
                <div className="mt-3 pt-3 border-t border-parchment-dark flex items-center justify-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5 text-[10px] font-ui font-bold text-[#1B2A6B] uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" />
                    April 14 – 15 only
                  </div>
                  <div className="w-1 h-1 rounded-full bg-mutedgray/30" />
                  <div className="flex items-center gap-1.5 text-[10px] font-ui font-bold text-gold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    ₹135 off any order
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="px-3 sm:px-5 pb-4 flex flex-col gap-2">
                <button
                  onClick={handleAutoApply}
                  className="w-full py-3 sm:py-3.5 bg-[#1B2A6B] text-white rounded-xl font-ui font-bold text-sm text-center hover:bg-[#243580] transition-all shadow-lg shadow-[#1B2A6B]/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Auto-Apply &amp; Go to Cart
                </button>
                <button
                  onClick={close}
                  className="w-full py-2 sm:py-2.5 text-mutedgray font-ui text-xs hover:text-ink transition-colors"
                >
                  I'll enter the code manually
                </button>
              </div>

            </div>
          </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
