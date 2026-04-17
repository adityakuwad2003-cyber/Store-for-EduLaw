import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, CheckCircle, Zap, Tag, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store';

const CODE = 'FIRST10';
const LS_KEY = 'edulaw_exit_shown';

export function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { items } = useCartStore();

  useEffect(() => {
    // Don't show again if already dismissed this session
    if (sessionStorage.getItem(LS_KEY)) return;

    let triggered = false;

    const onMouseOut = (e: MouseEvent) => {
      if (triggered) return;
      // Fire when cursor leaves top of viewport
      if (e.clientY <= 8 && (e.relatedTarget === null || (e.relatedTarget as Node).nodeName === 'HTML')) {
        triggered = true;
        setVisible(true);
        sessionStorage.setItem(LS_KEY, '1');
      }
    };

    // Small delay so page loads first
    const t = setTimeout(() => {
      document.addEventListener('mouseout', onMouseOut);
    }, 3000);

    return () => {
      clearTimeout(t);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, []);

  const copy = async () => {
    await navigator.clipboard.writeText(CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const close = () => setVisible(false);

  const handleAddToCart = async () => {
    if (!copied) await copy();
    close();
    // Go to cart if user has items, otherwise go to marketplace to start shopping
    navigate(items.length > 0 ? '/cart' : '/marketplace');
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-[9998]"
          />

          {/* Modal */}
          <motion.div
            key="popup"
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[92vw] max-w-md"
          >
            <div className="relative bg-parchment rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">

              {/* Burgundy top band */}
              <div className="bg-burgundy px-4 sm:px-6 pt-5 pb-7 sm:pt-6 sm:pb-8 text-center relative">
                <button
                  onClick={close}
                  aria-label="Close"
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 rounded-full text-parchment/60 hover:text-parchment hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Icon */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gold/20 border border-gold/30 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Tag className="w-6 h-6 sm:w-7 sm:h-7 text-gold" />
                </div>

                <p className="font-ui text-xs font-bold uppercase tracking-[0.2em] text-gold/80 mb-1">
                  Wait — before you go!
                </p>
                <h2 className="font-display text-2xl sm:text-3xl text-parchment leading-tight">
                  10% off your
                  <span className="text-gold"> first purchase</span>
                </h2>
              </div>

              {/* Overlap card */}
              <div className="-mt-4 mx-3 sm:mx-5 bg-white rounded-2xl shadow-lg p-4 sm:p-5 relative z-10 mb-4 sm:mb-5">
                <p className="font-ui text-sm text-mutedgray text-center mb-3 sm:mb-4 leading-relaxed">
                  Use this code at checkout and save 10% instantly.
                </p>

                {/* Code box */}
                <button
                  onClick={copy}
                  className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4 bg-parchment border-2 border-dashed border-gold/60 rounded-xl hover:border-gold hover:bg-gold/5 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-gold shrink-0" />
                    <span className="font-display text-xl sm:text-2xl text-burgundy tracking-widest">
                      {CODE}
                    </span>
                  </div>
                  {copied
                    ? <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    : <Copy className="w-5 h-5 text-gold/60 group-hover:text-gold shrink-0 transition-colors" />
                  }
                </button>
                <p className="text-center font-ui text-[11px] text-mutedgray mt-2">
                  {copied ? '✓ Copied! Paste at checkout.' : 'Tap to copy'}
                </p>
              </div>

              {/* CTAs */}
              <div className="px-3 sm:px-5 pb-5 sm:pb-6 flex flex-col gap-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3 sm:py-3.5 bg-burgundy text-parchment rounded-xl font-ui font-bold text-sm text-center hover:bg-burgundy-light transition-all shadow-lg shadow-burgundy/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {items.length > 0 ? 'Go to Cart & Use FIRST10' : 'Add to Cart & Use FIRST10'}
                </button>
                <button
                  onClick={close}
                  className="w-full py-2 sm:py-2.5 text-mutedgray font-ui text-xs hover:text-ink transition-colors"
                >
                  No thanks, I'll pay full price
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
