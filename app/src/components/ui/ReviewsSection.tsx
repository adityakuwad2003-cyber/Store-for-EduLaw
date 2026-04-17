import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, ThumbsUp, Loader2, LogIn, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getReviews, submitReview, hasUserReviewed } from '@/lib/db';
import type { Review } from '@/types';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface ReviewsSectionProps {
  noteId: string;
  noteName: string;
}

function StarRow({
  rating,
  interactive = false,
  size = 'sm',
  onSelect,
}: {
  rating: number;
  interactive?: boolean;
  size?: 'sm' | 'lg';
  onSelect?: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const dim = size === 'lg' ? 'w-8 h-8' : 'w-4 h-4';
  const active = hovered || rating;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => interactive && onSelect?.(i)}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? 'cursor-pointer' : 'cursor-default pointer-events-none'}
          tabIndex={interactive ? 0 : -1}
          aria-label={interactive ? `Rate ${i} star${i > 1 ? 's' : ''}` : undefined}
        >
          <Star
            className={`${dim} transition-colors`}
            fill={i <= active ? '#C9A84C' : 'none'}
            stroke={i <= active ? '#C9A84C' : '#CBD5E1'}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-xs font-ui">
      <span className="text-slate-500 w-4 text-right">{label}</span>
      <Star className="w-3 h-3 text-gold shrink-0" fill="#C9A84C" strokeWidth={0} />
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full bg-gold rounded-full"
        />
      </div>
      <span className="text-slate-400 w-5">{count}</span>
    </div>
  );
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const date = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-gold/20 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-burgundy to-burgundy-light flex items-center justify-center shrink-0">
            <span className="text-parchment font-display font-bold text-base">{review.userInitial}</span>
          </div>
          <div>
            <p className="font-ui font-bold text-sm text-ink">{review.userName}</p>
            {review.userAffiliation && (
              <p className="text-[11px] text-burgundy/70 font-ui font-medium -mt-0.5 mb-1">
                {review.userAffiliation}
              </p>
            )}
            <div className="flex items-center gap-2">
              <StarRow rating={review.rating} size="sm" />
              {date && <span className="text-[10px] text-slate-400 font-ui">{date}</span>}
            </div>
          </div>
        </div>
        <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-ui font-bold rounded-full border border-emerald-100 whitespace-nowrap shrink-0">
          <ThumbsUp className="w-2.5 h-2.5" /> Verified
        </span>
      </div>
      {review.text && (
        <p className="text-sm text-slate-600 font-ui leading-relaxed ml-[52px]">{review.text}</p>
      )}
    </motion.div>
  );
}

export function ReviewsSection({ noteId, noteName }: ReviewsSectionProps) {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchaseChecking, setPurchaseChecking] = useState(false);

  // Form state
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [userAffiliation, setUserAffiliation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setLoading(true);
    getReviews(noteId).then(r => {
      setReviews(r);
      setLoading(false);
    });
  }, [noteId]);

  useEffect(() => {
    if (!currentUser) {
      setAlreadyReviewed(false);
      setHasPurchased(false);
      return;
    }
    hasUserReviewed(noteId, currentUser.uid).then(setAlreadyReviewed);

    // Verify purchase via the purchases API
    setPurchaseChecking(true);
    currentUser.getIdToken().then(token =>
      fetch('/api/purchases', { headers: { Authorization: `Bearer ${token}` } })
    ).then(res => res.ok ? res.json() : { purchases: [] })
      .then(data => {
        const purchased = (data.purchases || []).some(
          (p: { productId: string }) => String(p.productId) === String(noteId)
        );
        setHasPurchased(purchased);
      })
      .catch(() => setHasPurchased(false))
      .finally(() => setPurchaseChecking(false));
  }, [noteId, currentUser]);

  // Ensure each review shows a unique display name by appending a counter for duplicates
  const reviewsWithUniqueNames = useMemo(() => {
    const totalCount: Record<string, number> = {};
    reviews.forEach(r => { totalCount[r.userName] = (totalCount[r.userName] || 0) + 1; });
    const seenIndex: Record<string, number> = {};
    return reviews.map(r => {
      if (totalCount[r.userName] > 1) {
        seenIndex[r.userName] = (seenIndex[r.userName] || 0) + 1;
        return { ...r, userName: `${r.userName} ${seenIndex[r.userName]}` };
      }
      return r;
    });
  }, [reviews]);

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) { toast.error('Please log in to submit a review'); return; }
    if (userRating === 0) { toast.error('Please select a star rating'); return; }
    if (reviewText.trim().length < 10) { toast.error('Review must be at least 10 characters'); return; }

    setSubmitting(true);
    try {
      await submitReview(
        noteId,
        currentUser.uid,
        currentUser.displayName || currentUser.email?.split('@')[0] || 'Student',
        userRating,
        reviewText,
        userAffiliation
      );
      toast.success('Review submitted! Thank you.');
      setAlreadyReviewed(true);
      setShowForm(false);
      setUserRating(0);
      setReviewText('');
      setUserAffiliation('');
      // Refresh
      getReviews(noteId).then(setReviews);
    } catch {
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-16 sm:mt-20">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-5 h-5 text-burgundy" />
        <h2 className="font-display text-2xl sm:text-3xl text-ink font-bold">
          Student Reviews
        </h2>
        {reviews.length > 0 && (
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 text-xs font-ui font-bold rounded-full">
            {reviews.length}
          </span>
        )}
      </div>

      {/* Rating summary */}
      {reviews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-slate-100 mb-6 flex flex-col sm:flex-row gap-6"
        >
          {/* Big average */}
          <div className="flex flex-col items-center justify-center sm:border-r border-slate-100 sm:pr-8 shrink-0">
            <p className="font-display text-5xl font-bold text-ink">{avgRating.toFixed(1)}</p>
            <StarRow rating={Math.round(avgRating)} size="sm" />
            <p className="text-xs text-slate-400 font-ui mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
          </div>
          {/* Bars */}
          <div className="flex-1 space-y-2">
            {ratingCounts.map(({ star, count }) => (
              <RatingBar key={star} label={String(star)} count={count} total={reviews.length} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Write a review CTA */}
      {!alreadyReviewed && !showForm && (
        <div className="mb-6">
          {!currentUser ? (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-3 border-2 border-burgundy text-burgundy rounded-xl font-ui font-bold text-sm hover:bg-burgundy/5 transition-all"
            >
              <LogIn className="w-4 h-4" /> Log in to write a review
            </Link>
          ) : purchaseChecking ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm font-ui">
              <Loader2 className="w-4 h-4 animate-spin" /> Checking purchase status…
            </div>
          ) : hasPurchased ? (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-burgundy text-parchment rounded-xl font-ui font-bold text-sm hover:bg-burgundy-light transition-all shadow-md shadow-[#6B1E2E]/15 active:scale-95"
            >
              <Star className="w-4 h-4" /> Write a Review
            </button>
          ) : (
            <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl max-w-md">
              <ShoppingCart className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-ui font-semibold text-amber-800">Purchase required to review</p>
                <p className="text-xs text-amber-600 font-ui mt-0.5">
                  Only verified buyers can submit reviews.{' '}
                  <Link to="/cart" className="underline underline-offset-2 hover:text-amber-800">
                    Buy this note
                  </Link>{' '}to share your experience.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {alreadyReviewed && (
        <div className="mb-6 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl inline-flex items-center gap-2 text-emerald-700 text-sm font-ui font-semibold">
          <ThumbsUp className="w-4 h-4" /> You've already reviewed this note. Thank you!
        </div>
      )}

      {/* Review form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-gold/20 p-6 mb-6 overflow-hidden"
          >
            <h3 className="font-display text-lg text-ink mb-4">
              Your Review of <span className="text-burgundy">{noteName}</span>
            </h3>

            {/* Star picker */}
            <div className="mb-4">
              <p className="text-xs font-ui font-bold text-slate-500 uppercase tracking-wider mb-2">Your Rating *</p>
              <StarRow rating={userRating} interactive size="lg" onSelect={setUserRating} />
              {userRating > 0 && (
                <p className="text-xs text-slate-400 font-ui mt-1">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][userRating]}
                </p>
              )}
            </div>

            {/* Text */}
            <div className="mb-5">
              <p className="text-xs font-ui font-bold text-slate-500 uppercase tracking-wider mb-2">Your Review *</p>
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                rows={4}
                placeholder="Share your experience with this note — what did you find helpful? How did it help your preparation?"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-ui text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/50 resize-none"
                maxLength={1000}
              />
              <p className="text-[10px] text-slate-300 text-right font-ui mt-1">{reviewText.length}/1000</p>
            </div>

            {/* Affiliation */}
            <div className="mb-5">
              <p className="text-xs font-ui font-bold text-slate-500 uppercase tracking-wider mb-2">College / University (Optional)</p>
              <input
                type="text"
                value={userAffiliation}
                onChange={e => setUserAffiliation(e.target.value)}
                placeholder="e.g. NLU Delhi, GLC Mumbai, etc."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-ui text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/50"
                maxLength={100}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting || userRating === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-burgundy text-parchment rounded-xl font-ui font-bold text-sm hover:bg-burgundy-light transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setUserRating(0); setReviewText(''); setUserAffiliation(''); }}
                className="px-4 py-2.5 text-slate-500 hover:text-slate-700 font-ui text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reviews list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-burgundy" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
          <Star className="w-10 h-10 text-slate-200 mx-auto mb-3" fill="#e2e8f0" strokeWidth={0} />
          <p className="font-display text-lg text-slate-400">No reviews yet</p>
          <p className="text-sm text-slate-300 font-ui mt-1">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviewsWithUniqueNames.map((review, i) => (
            <ReviewCard key={review.id} review={review} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
