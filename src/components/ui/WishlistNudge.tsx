import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlistStore, useCartStore } from '@/store';

const SESSION_KEY = 'edulaw_wishlist_nudge_shown';
// Delay before showing nudge (ms) — 45 seconds after page load
const NUDGE_DELAY = 45_000;

export function WishlistNudge() {
  const { items: wishlistItems } = useWishlistStore();
  const { addNote, items: cartItems } = useCartStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (wishlistItems.length === 0) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const t = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem(SESSION_KEY, '1');
    }, NUDGE_DELAY);

    return () => clearTimeout(t);
  }, [wishlistItems]);

  // Don't render anything if no wishlist items
  if (wishlistItems.length === 0) return null;

  const note = wishlistItems[0];
  const alreadyInCart = cartItems.some(i => i.type === 'note' && (i.item as any).id === note.id);

  const handleAddToCart = () => {
    if (!alreadyInCart) addNote(note);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="fixed bottom-6 right-6 z-[8000] w-72 bg-white rounded-2xl shadow-2xl border border-rose-100 overflow-hidden"
        >
          {/* Header strip */}
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-4 py-2.5 border-b border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" fill="#f43f5e" />
              <span className="text-[10px] font-ui font-black uppercase tracking-widest text-rose-600">
                Wishlist Reminder
              </span>
            </div>
            <button
              onClick={() => setVisible(false)}
              aria-label="Dismiss"
              className="p-1 rounded-lg hover:bg-rose-100 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-rose-400" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            <p className="font-ui font-bold text-sm text-ink mb-0.5">Still thinking about it?</p>
            <p className="text-xs text-slate-500 font-ui line-clamp-2 mb-3 leading-relaxed">
              {note.title}
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-2 bg-burgundy text-parchment rounded-lg font-ui font-bold text-xs hover:bg-burgundy-light transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                {alreadyInCart ? 'Already in Cart' : 'Add to Cart'}
              </button>
              <Link
                to={`/product/${note.slug}`}
                onClick={() => setVisible(false)}
                className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg font-ui text-xs font-bold hover:border-burgundy/40 hover:text-burgundy transition-all text-center"
              >
                View
              </Link>
            </div>

            {wishlistItems.length > 1 && (
              <p className="text-[10px] text-slate-400 font-ui mt-2 text-center">
                +{wishlistItems.length - 1} more note{wishlistItems.length > 2 ? 's' : ''} saved in your wishlist
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
