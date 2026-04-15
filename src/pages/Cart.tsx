import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Trash2, ArrowRight, Package, FileText,
  Tag, Shield, Check, AlertCircle, Loader2,
  Zap, Volume2, Layers, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '@/store';
import { CouponInput } from '@/components/ui/CouponInput';
import { createRazorpayCheckout } from '@/lib/razorpay';
import { useAuth } from '@/contexts/AuthContext';
import { findReferrerByCode, createReferral, hasExistingReferral } from '@/lib/referrals';
import { referralConfig } from '@/data/notes';
import { verifyCoupon } from '@/lib/coupons';

const IS_GST_ENABLED = false;

export function Cart() {
  const { items, removeItem, clearCart, couponCode, discountAmount, applyCoupon, removeCoupon, getSubtotal, getTotal } = useCartStore();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  // Auto-apply coupon stored by AmbedkarJayantiPopup (or any future source)
  useEffect(() => {
    const raw = localStorage.getItem('edulaw_pending_coupon');
    if (!raw) return;
    localStorage.removeItem('edulaw_pending_coupon'); // clear immediately (StrictMode safety)

    let parsed: { code: string };
    try { parsed = JSON.parse(raw); } catch { return; }
    if (!parsed?.code || couponCode) return; // skip if malformed or coupon already active

    verifyCoupon(parsed.code, getSubtotal()).then((result) => {
      if (result.valid && result.discount) {
        applyCoupon(parsed.code, result.discount);
        toast.success(`₹${result.discount} off applied!`, {
          description: `Ambedkar Jayanti offer (${parsed.code}) was auto-applied.`,
          duration: 5000,
        });
      } else {
        toast.error(result.message || `Could not apply ${parsed.code} — please enter it manually.`);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApplyCoupon = async (code: string): Promise<boolean> => {
    const subtotal = getSubtotal();
    const result = await verifyCoupon(code, subtotal);

    if (result.valid && result.discount) {
      applyCoupon(code, result.discount);
      toast.success(`Coupon applied: ₹${result.discount} off`);
      return true;
    } else {
      const msg = result.message || 'Invalid coupon code';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const calculateGST = () => {
    if (!IS_GST_ENABLED) return 0;
    
    // Calculate total GST by summing up GST for each item
    // Note: We apply the discount proportionally to each item for GST calculation
    const subtotal = getSubtotal();
    const currentTotal = getTotal();
    const discountRatio = subtotal > 0 ? currentTotal / subtotal : 1;

    return items.reduce((acc, item) => {
      const itemData = item.item as any;
      const hasGst = itemData.hasGst ?? true;
      const rate = itemData.gstRate ?? 18;
      
      if (!hasGst) return acc;
      
      const itemPriceAfterDiscount = itemData.price * discountRatio;
      return acc + (itemPriceAfterDiscount * (rate / 100));
    }, 0);
  };

  const gstAmount = Math.round(calculateGST());
  const totalWithGST = Math.round(getTotal() + gstAmount);

  const handleCheckout = async () => {
    if (!currentUser) {
      toast.error("Please log in to complete your purchase.");
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    
    try {
      await createRazorpayCheckout({
        amount: totalWithGST * 100, // Razorpay uses paise
        currency: 'INR',
        name: 'EduLaw Notes',
        description: `${items.length} document(s)`,
        prefill: {
          name: currentUser.displayName || undefined,
          email: currentUser.email || undefined,
        },
        theme: { color: '#6B1E2E' },
        handler: async (response: any) => {
          // Payment successful — save receipts via secure backend API
          try {
            const token = await currentUser.getIdToken();

            for (let itemIdx = 0; itemIdx < items.length; itemIdx++) {
              const item = items[itemIdx];
              const itemData = item.item as any;
              // Robust ID extraction
              const productId = String(itemData.id || item.id || itemData._id || '');
              const title = itemData.title || itemData.name || 'Untitled Document';
              const fileKey = itemData.fileKey || itemData.pdfUrl || itemData.fileUrl || '';

              if (!productId) {
                console.warn("Skipping item with missing ID:", item);
                continue;
              }

              const res = await fetch('/api/purchases', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  productId,
                  title,
                  fileKey,
                  price: itemData.price,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id || null,
                  razorpay_signature: response.razorpay_signature,
                  // For bundles: pass noteIds so the server can resolve files
                  ...(item.type === 'bundle' && Array.isArray(itemData.noteIds)
                    ? { noteIds: itemData.noteIds.map(String) }
                    : {}),
                  // Pass coupon info only on the first item to avoid double-incrementing
                  ...(itemIdx === 0 && couponCode ? { couponCode, discountAmount } : {}),
                }),
              });

              if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to save purchase');
              }
            }

            clearCart();
            toast.success("🎉 Purchase successful! Check your library for downloads.");

            // Track referral if a referral code was captured on first visit
            const pendingRefCode = localStorage.getItem('pending_ref_code');
            if (pendingRefCode) {
              try {
                const alreadyReferred = await hasExistingReferral(currentUser.uid);
                if (!alreadyReferred) {
                  const referrer = await findReferrerByCode(pendingRefCode);
                  if (referrer && referrer.uid !== currentUser.uid) {
                    const orderAmount = items.reduce((sum, i) => sum + i.item.price, 0);
                    if (orderAmount >= referralConfig.minPurchaseForReward) {
                      await createReferral({
                        referrerUid: referrer.uid,
                        referrerEmail: referrer.email,
                        refereeUid: currentUser.uid,
                        refereeEmail: currentUser.email || '',
                        orderId: response.razorpay_payment_id,
                        orderAmount,
                        commissionAmount: referralConfig.referrerReward,
                      });
                    }
                  }
                }
                localStorage.removeItem('pending_ref_code');
              } catch (refErr) {
                console.error('Referral tracking error:', refErr);
              }
            }

            navigate('/dashboard', { state: { fromCheckout: true } });
          } catch (err) {
            console.error("Error saving purchase:", err);
            toast.error("Payment received but could not save record. Contact support with your payment ID: " + response.razorpay_payment_id);
          }
        },
      });
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Could not open payment gateway. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-20 min-h-screen bg-parchment flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-parchment-dark rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-mutedgray" />
          </div>
          <h1 className="font-display text-2xl text-ink mb-2">Your Cart is Empty</h1>
          <p className="text-mutedgray mb-6">Browse our marketplace to add notes and bundles</p>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 px-6 py-3 bg-burgundy text-parchment rounded-xl font-ui font-medium hover:bg-burgundy-light transition-colors"
          >
            Browse Notes
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-32 min-h-screen bg-parchment">
      <div className="section-container">
        <div className="mb-8">
          <h1 className="font-display text-4xl text-ink font-bold mb-2">My Cart</h1>
          <div className="flex items-center gap-2">
            <div className="h-1 w-12 bg-gold truncate" />
            <p className="text-sm font-ui text-mutedgray uppercase tracking-widest">
              {items.length} Premium {items.length === 1 ? 'Selection' : 'Selections'}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-4">
              {items.map((item) => {
                const isNote = item.type === 'note';
                const isBundle = item.type === 'bundle';
                const isTest = item.type === 'test';
                const isAudio = item.type === 'audio';
                const itemData = item.item;
                
                let title = '';
                let category = '';

                if (isNote) {
                  title = (itemData as any).title;
                  category = (itemData as any).category;
                } else if (isBundle) {
                  title = (itemData as any).name;
                  category = `${(itemData as any).noteIds?.length || 'Multiple'} subjects`;
                } else if (isTest) {
                  title = (itemData as any).title || 'Subject Mock Test';
                  category = 'Mastery Add-on';
                } else if (isAudio) {
                  title = (itemData as any).title || 'Audio Summary';
                  category = 'Mastery Add-on';
                }
                
                const pages = isNote ? (itemData as any).totalPages : null;

                return (
                  <div key={item.id} className="bg-white rounded-[2rem] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100 flex gap-5 group">
                    <div className="w-24 h-24 bg-parchment rounded-2xl flex items-center justify-center shrink-0 border border-gold/10 group-hover:border-gold/30 transition-colors text-ink">
                      {isNote && <FileText className="w-10 h-10 text-burgundy/40" />}
                      {isBundle && <Package className="w-10 h-10 text-gold/40" />}
                      {isTest && <Zap className="w-10 h-10 text-amber-500/40" />}
                      {isAudio && <Volume2 className="w-10 h-10 text-indigo-400/40" />}
                    </div>

                    <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
                      <div className="flex justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[10px] font-ui font-black text-gold uppercase tracking-widest mb-1">{category}</p>
                          <h3 className="font-display text-lg font-bold text-ink leading-tight truncate-2-lines">{title}</h3>
                          {pages && (
                            <p className="text-[11px] font-ui text-slate-400 mt-1 flex items-center gap-1">
                              <FileText className="w-3 h-3 shrink-0" />
                              {pages} pages · Instant PDF
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label="Remove item from cart"
                          className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-baseline gap-2">
                          <span className="font-display text-xl font-bold text-gold">₹{itemData.price}</span>
                          {(itemData as {originalPrice?: number}).originalPrice && (itemData as {originalPrice: number}).originalPrice > itemData.price && (
                            <span className="text-xs text-slate-300 line-through">₹{(itemData as {originalPrice: number}).originalPrice}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-ui font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-wider">
                          <Check className="w-3 h-3" /> Instant Access
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bundle upsell progress banner */}
            {(() => {
              const noteCount = items.filter(i => i.type === 'note').length;
              if (noteCount === 0) return null;

              const subtotal = getSubtotal();
              const saving15 = Math.round(subtotal * 0.15);
              const saving20 = Math.round(subtotal * 0.20);
              const currentSaving = noteCount >= 10 ? saving20 : noteCount >= 2 ? Math.round(subtotal * 0.15) : 0;

              // Progress toward next tier (capped at 10)
              const progressPct = Math.min((noteCount / 10) * 100, 100);
              const tier1Pct = (2 / 10) * 100; // 20%

              return (
                <div className="rounded-2xl border overflow-hidden border-gold/30 bg-white">
                  {/* Top strip */}
                  <div className="bg-gradient-to-r from-burgundy/5 to-gold/5 px-4 py-3 border-b border-gold/20 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-gold shrink-0" />
                      <span className="font-ui font-black text-xs uppercase tracking-widest text-ink">
                        Bundle Savings
                      </span>
                    </div>
                    {currentSaving > 0 && (
                      <span className="text-xs font-ui font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        Saving ₹{currentSaving} now
                      </span>
                    )}
                  </div>

                  <div className="px-4 py-3">
                    {/* Progress bar */}
                    <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
                      {/* Tier 1 marker at 20% */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-white/80 z-10"
                        style={{ left: `${tier1Pct}%` }}
                      />
                      {/* Fill */}
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          noteCount >= 10
                            ? 'bg-gradient-to-r from-gold to-amber-400'
                            : noteCount >= 2
                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                            : 'bg-gradient-to-r from-burgundy/60 to-burgundy'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    {/* Tier labels */}
                    <div className="flex items-center justify-between text-[10px] font-ui font-bold mb-3">
                      <span className="text-slate-400">1 note</span>
                      <span className={noteCount >= 2 ? 'text-emerald-600' : 'text-slate-400'}>
                        2+ → 15% off
                      </span>
                      <span className={noteCount >= 10 ? 'text-amber-600' : 'text-slate-400'}>
                        10+ → 20% off
                      </span>
                    </div>

                    {/* Message */}
                    {noteCount < 2 && (
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-ui text-sm text-ink">
                          Add <span className="font-bold text-burgundy">1 more note</span> → unlock{' '}
                          <span className="font-bold text-emerald-600">15% off</span>
                          {subtotal > 0 && (
                            <span className="text-slate-400"> (save ₹{saving15})</span>
                          )}
                        </p>
                        <Link
                          to="/marketplace"
                          className="shrink-0 px-3 py-1.5 bg-gold text-ink rounded-lg font-ui text-xs font-bold hover:bg-gold-light transition-all"
                        >
                          Browse →
                        </Link>
                      </div>
                    )}
                    {noteCount >= 2 && noteCount < 10 && (
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-ui text-sm text-ink">
                          <span className="font-bold text-emerald-600">15% discount active!</span>{' '}
                          Add <span className="font-bold text-burgundy">{10 - noteCount} more</span> → unlock{' '}
                          <span className="font-bold text-amber-600">20% off</span>
                          {subtotal > 0 && (
                            <span className="text-slate-400"> (save ₹{saving20 - currentSaving} extra)</span>
                          )}
                        </p>
                        <Link
                          to="/marketplace"
                          className="shrink-0 px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-ui text-xs font-bold hover:bg-emerald-700 transition-all"
                        >
                          Add More →
                        </Link>
                      </div>
                    )}
                    {noteCount >= 10 && (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                        <p className="font-ui text-sm font-bold text-amber-700">
                          Maximum 20% discount unlocked! You're saving ₹{saving20}.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-between pt-2">
              <Link
                to="/marketplace"
                className="text-xs font-ui font-bold text-ink hover:text-gold flex items-center gap-2 transition-colors uppercase tracking-widest"
              >
                <ArrowRight className="w-4 h-4 rotate-180" /> Continue Shopping
              </Link>
              {!confirmClear ? (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="text-xs font-ui font-bold text-slate-400 hover:text-rose-500 flex items-center gap-2 transition-colors uppercase tracking-widest"
                >
                  <Trash2 className="w-4 h-4" /> Clear All
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-ui text-slate-500">Sure?</span>
                  <button
                    onClick={() => { clearCart(); setConfirmClear(false); }}
                    className="text-xs font-ui font-bold text-rose-600 uppercase tracking-widest"
                  >Yes, clear</button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="text-xs font-ui font-bold text-slate-400 uppercase tracking-widest"
                  >Cancel</button>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 sticky top-28">
              <h2 className="font-display text-2xl font-bold text-ink mb-8">Summary</h2>

              <div className="mb-8">
                <CouponInput onApply={handleApplyCoupon} onRemove={removeCoupon} appliedCode={couponCode} discountAmount={discountAmount} />
              </div>

              {/* Savings celebration banner */}
              {discountAmount > 0 && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl mb-6">
                  <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                  <p className="font-ui text-sm font-bold text-emerald-700">
                    You're saving ₹{discountAmount}! 🎉
                  </p>
                </div>
              )}

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-ui">Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                  <span className="font-display font-bold text-ink">₹{getSubtotal()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-sm text-emerald-600">
                    <span className="flex items-center gap-2 font-ui">
                      <div className="w-5 h-5 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Tag className="w-3 h-3" />
                      </div>
                      Discount Applied
                    </span>
                    <span className="font-display font-bold">-₹{discountAmount}</span>
                  </div>
                )}
                <div className="border-t border-parchment pt-6 mt-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-ui font-black text-ink/30 uppercase tracking-[0.2em] mb-1">Total Payable</p>
                      <span className="font-display text-4xl font-bold text-gold">₹{totalWithGST}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full py-5 bg-burgundy text-parchment rounded-2xl font-ui font-black uppercase tracking-[0.2em] text-xs hover:bg-burgundy-light transition-all flex items-center justify-center gap-3 shadow-xl shadow-burgundy/20 active:scale-95 disabled:opacity-60 disabled:shadow-none"
              >
                {isProcessing
                  ? <><Loader2 className="w-5 h-5 animate-spin" />Securing Payment...</>
                  : <>Pay Securely <ArrowRight className="w-5 h-5" /></>
                }
              </button>

              <div className="mt-8 pt-8 border-t border-parchment flex flex-col gap-4">
                <div className="flex items-center justify-center gap-6">
                  <div className="flex flex-col items-center gap-1.5 text-slate-500">
                    <Shield className="w-5 h-5" />
                    <span className="text-[8px] font-ui font-black uppercase tracking-widest">SSL Encrypted</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 text-slate-500">
                    <Check className="w-5 h-5" />
                    <span className="text-[8px] font-ui font-black uppercase tracking-widest">Verified Seller</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 text-slate-500">
                    <Zap className="w-5 h-5" />
                    <span className="text-[8px] font-ui font-black uppercase tracking-widest">Instant Access</span>
                  </div>
                </div>
                {!currentUser && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm font-ui text-amber-800 leading-relaxed">
                      <Link to="/login" className="font-bold underline underline-offset-2">Log in</Link> to complete your purchase.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Checkout Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 p-4 pb-8 z-40 shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[9px] font-ui font-black text-ink/30 uppercase tracking-widest">Total Payable</p>
            <span className="font-display text-2xl font-bold text-gold">₹{totalWithGST}</span>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-ui font-black text-emerald-600 uppercase tracking-widest">
              {discountAmount > 0 ? `Saved ₹${discountAmount}!` : 'Ready to unlock'}
            </p>
          </div>
        </div>
        <button
          onClick={handleCheckout}
          disabled={isProcessing}
          className="w-full py-4 bg-burgundy text-parchment rounded-2xl font-ui font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-lg shadow-burgundy/10 active:scale-95 disabled:opacity-60"
        >
          {isProcessing ? 'Processing...' : 'Checkout Now'}
        </button>
      </div>
    </div>
  );
}
