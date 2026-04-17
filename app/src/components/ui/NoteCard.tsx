import { motion } from 'framer-motion';
import { Eye, ShoppingCart, FileText, Zap, Heart, X, Flame, Users, GraduationCap } from 'lucide-react';
import type { Note } from '@/types';
import { getCategoryColor } from '@/data/notes';
import { useCartStore, useWishlistStore, useUIStore } from '@/store';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ShareButton } from './ShareButton';
import { CountdownTimer } from './CountdownTimer';

// Deterministic "bought this week" count — varies per note, consistent across renders
function weeklyBuyers(noteId: number | string): number {
  const n = typeof noteId === 'string' ? noteId.charCodeAt(0) + noteId.length * 13 : noteId;
  return ((n * 7 + 17) % 38) + 9; // 9–46
}

// Deterministic "viewing now" count — changes every 5 minutes
function viewingNow(noteId: number | string): number {
  const slot = Math.floor(Date.now() / 300_000);
  const n = typeof noteId === 'string'
    ? noteId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    : Number(noteId);
  return (((n * 7 + slot * 3) % 11) % 7) + 2; // 2–8
}

// Law colleges for "Studied By" social proof
const LAW_COLLEGES = [
  'NLU Delhi', 'NLU Jodhpur', 'NLSIU Bangalore', 'GLC Mumbai',
  'Symbiosis Law', 'Jindal Global', 'Campus Law Centre', 'NLU Kolkata',
  'Faculty of Law DU', 'NLU Hyderabad', 'Amity Law', 'HNLU Raipur',
];

function studiedByColleges(noteId: number | string): [string, string] {
  const n = typeof noteId === 'string'
    ? noteId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    : Number(noteId);
  const i1 = n % LAW_COLLEGES.length;
  const i2 = (n * 3 + 7) % LAW_COLLEGES.length;
  return [LAW_COLLEGES[i1], LAW_COLLEGES[i1 === i2 ? (i2 + 1) % LAW_COLLEGES.length : i2]];
}

interface NoteCardProps {
  note: Note;
  variant?: 'default' | 'compact' | 'featured';
  index?: number;
}

export function NoteCard({ note, variant = 'default', index = 0 }: NoteCardProps) {
  const { addNote, removeItem, items } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const navigate = useNavigate();

  const cartItem = items.find(item => item.type === 'note' && item.item.id === note.id);
  const isInCart = !!cartItem;
  const wishlisted = isWishlisted(note.id);
  const categoryColor = getCategoryColor(note.category);

  const savingsPercent =
    note.originalPrice && note.originalPrice > note.price
      ? Math.round(((note.originalPrice - note.price) / note.originalPrice) * 100)
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCart) {
      removeItem(cartItem!.id);
      toast.error('Removed from cart');
    } else {
      addNote(note);
      const noteCount = items.filter(i => i.type === 'note').length + 1;
      useUIStore.getState().setBundleModal(true, noteCount, String(note.id));
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInCart) {
      addNote(note);
    }
    navigate('/cart');
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(note);
    toast(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
  };

  /* ── COMPACT variant ─────────────────────────────────────────────── */
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="doc-card group hover:shadow-xl transition-all duration-300 relative cat-border-dynamic"
        style={{ '--cat-color': categoryColor, '--cat-bg': `${categoryColor}15` } as React.CSSProperties}
      >
        <Link to={`/product/${note.slug}`} className="block">
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl z-10 cat-border-bg" />
          <div className="p-4 pl-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <span className="inline-block px-2 py-0.5 text-[10px] font-ui font-black uppercase tracking-widest rounded mb-2 cat-tag-dynamic">
                  {note.category}
                </span>
                <h3 className="font-display text-base text-slate-900 line-clamp-2 group-hover:text-gold transition-colors font-bold">
                  {note.title}
                </h3>
              </div>
              <div className="flex items-center shrink-0 gap-0">
                <ShareButton
                  title={note.title}
                  description={note.description}
                  price={note.price}
                  originalPrice={note.originalPrice}
                  url={`${window.location.origin}/product/${note.slug}`}
                  category={note.category}
                  variant="icon"
                  note={note}
                />
                <button
                  onClick={handleWishlist}
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-colors"
                >
                  <Heart
                    className="w-4 h-4 transition-colors"
                    fill={wishlisted ? '#e11d48' : 'none'}
                    stroke={wishlisted ? '#e11d48' : '#94a3b8'}
                  />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 gap-3">
              <div className="flex items-baseline gap-2">
                <span className="text-gold font-display font-bold">₹{note.price}</span>
                {savingsPercent && (
                  <span className="text-[10px] font-ui font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    -{savingsPercent}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleAddToCart}
                  title={isInCart ? 'Remove from cart' : 'Add to cart'}
                  className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-all border shadow-sm ${
                    isInCart
                      ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                      : 'bg-white text-slate-900 border-slate-200 hover:border-gold/50'
                  }`}
                >
                  {isInCart ? <X className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleBuyNow}
                  title="Buy Now"
                  className="min-h-[44px] px-3 py-1.5 bg-burgundy text-parchment rounded-lg text-[10px] font-ui font-black uppercase tracking-widest hover:bg-burgundy-light transition-all shadow-md shadow-burgundy/10"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </Link>
        <style>{`
          .cat-border-bg { background-color: var(--cat-color); }
          .cat-tag-dynamic { background-color: var(--cat-bg); color: var(--cat-color); }
        `}</style>
      </motion.div>
    );
  }

  /* ── DEFAULT variant ─────────────────────────────────────────────── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group relative bg-white rounded-2xl border border-slate-200 hover:border-gold/40 hover:shadow-2xl transition-all duration-300 overflow-hidden"
      style={{ '--cat-color': categoryColor, '--cat-bg': `${categoryColor}15` } as React.CSSProperties}
    >
      {/* Category left-border accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] z-10"
        style={{ backgroundColor: categoryColor }}
      />

      <Link to={`/product/${note.slug}`} className="block pl-[3px]">
        <div className="p-5 pl-6">

          {/* Top row: category tag + NEW badge + wishlist heart */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-ui font-black uppercase tracking-widest rounded"
                style={{ backgroundColor: `${categoryColor}18`, color: categoryColor }}
              >
                <FileText className="w-2.5 h-2.5" />
                {note.category}
              </span>
              {note.isNew && (
                <span className="px-2 py-0.5 text-[10px] font-ui font-black uppercase tracking-widest bg-gold/10 text-gold rounded">
                  NEW
                </span>
              )}
            </div>
            <div className="flex items-center gap-0.5 -mr-1">
              <ShareButton
                title={note.title}
                description={note.description}
                price={note.price}
                originalPrice={note.originalPrice}
                url={`${window.location.origin}/product/${note.slug}`}
                category={note.category}
                variant="icon"
                note={note}
              />
              <button
                onClick={handleWishlist}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-colors hover:bg-rose-50"
              >
                <Heart
                  className="w-5 h-5 transition-all"
                  fill={wishlisted ? '#e11d48' : 'none'}
                  stroke={wishlisted ? '#e11d48' : '#cbd5e1'}
                  strokeWidth={2}
                />
              </button>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-display text-[1.05rem] leading-snug font-bold text-ink mb-1.5 line-clamp-2 group-hover:text-gold transition-colors">
            {note.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-500 font-ui line-clamp-2 mb-4 leading-relaxed">
            {note.description}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-ui font-semibold uppercase tracking-wide mb-3">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              {note.totalPages} pages
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 shrink-0" />
              Instant PDF
            </span>
            {note.totalPages > 0 && (
              <span className="text-emerald-600 font-bold normal-case tracking-normal">
                ₹{(note.price / note.totalPages).toFixed(1)}/page
              </span>
            )}
          </div>

          {/* Scarcity / social proof row */}
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span className="text-[11px] font-ui font-semibold text-orange-600">
                {weeklyBuyers(note.id)} bought this week
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3 h-3 text-indigo-400 shrink-0" />
              <span className="text-[11px] font-ui font-semibold text-indigo-500">
                {viewingNow(note.id)} viewing now
              </span>
            </div>
          </div>

          {/* Studied By college tags */}
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <GraduationCap className="w-3 h-3 text-slate-400 shrink-0" />
            {studiedByColleges(note.id).map(college => (
              <span
                key={college}
                className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-ui font-semibold rounded"
              >
                {college}
              </span>
            ))}
          </div>

          {/* Price block */}
          <div className="flex items-end gap-2 mb-3">
            <span className="text-2xl font-display font-bold text-gold">
              ₹{note.price}
            </span>
            {note.originalPrice && note.originalPrice > note.price && (
              <>
                <span className="text-sm text-slate-300 line-through mb-0.5">
                  ₹{note.originalPrice}
                </span>
                {savingsPercent && (
                  <span className="text-[11px] font-ui font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mb-0.5">
                    {savingsPercent}% off
                  </span>
                )}
              </>
            )}
            <span className="text-[10px] font-ui text-slate-400 mb-0.5 ml-1">incl. GST</span>
          </div>

          {/* Countdown — only when a discount is active */}
          {note.originalPrice && note.originalPrice > note.price && (
            <CountdownTimer className="mb-3" />
          )}

          {/* Action buttons — full width */}
          <div className="flex gap-2">
            <Link
              to={`/product/${note.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] border border-slate-200 rounded-xl text-[11px] font-ui font-bold text-slate-600 hover:border-gold/50 hover:text-gold transition-all bg-white"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Link>

            <button
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl text-[11px] font-ui font-bold uppercase tracking-wide transition-all shadow-sm active:scale-95 ${
                isInCart
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-burgundy text-parchment hover:bg-burgundy-light shadow-burgundy/20'
              }`}
            >
              {isInCart ? (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  In Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </>
              )}
            </button>
          </div>

          {/* Buy Now secondary link */}
          <div className="text-center mt-3">
            <button
              onClick={handleBuyNow}
              className="text-[11px] font-ui font-semibold text-burgundy hover:underline underline-offset-2 transition-colors min-h-[44px] px-2"
            >
              Buy Now &rarr;
            </button>
          </div>

        </div>
      </Link>
    </motion.div>
  );
}
