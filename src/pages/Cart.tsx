import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Trash2, ArrowRight, Package, FileText, 
  Tag, Shield, Check, AlertCircle, Loader2
} from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { useCartStore } from '@/store';
import { CouponInput } from '@/components/ui/CouponInput';
import { createRazorpayCheckout } from '@/lib/razorpay';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';

export function Cart() {
  const { items, removeItem, clearCart, couponCode, discountAmount, applyCoupon, removeCoupon, getSubtotal, getTotal } = useCartStore();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApplyCoupon = async (code: string): Promise<boolean> => {
    const validCoupons: Record<string, number> = {
      'WELCOME10': 50,
      'BUNDLE20': 100,
      'STUDENT50': 99,
    };
    if (validCoupons[code]) {
      applyCoupon(code, validCoupons[code]);
      return true;
    }
    return false;
  };

  const totalWithGST = Math.round(getTotal() * 1.18);

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
          // Payment successful — write receipts to Firebase
          try {
            for (const item of items) {
              const itemData = item.item as any;
              const productId = String(itemData.id || item.id);
              const title = itemData.title || itemData.name || 'Document';
              const fileKey = itemData.fileKey || itemData.pdfUrl || '';

              // Compound doc key: userId_productId prevents duplicates
              await setDoc(
                doc(db, 'purchases', `${currentUser.uid}_${productId}`),
                {
                  userId: currentUser.uid,
                  productId,
                  title,
                  fileKey,
                  price: itemData.price,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id || null,
                  purchasedAt: serverTimestamp(),
                }
              );
            }

            clearCart();
            toast.success("🎉 Purchase successful! Check your library for downloads.");
            navigate('/dashboard');
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
    <div className="pt-20 min-h-screen bg-parchment">
      <div className="section-container py-8">
        <div>
          <h1 className="font-display text-3xl text-ink mb-2">Shopping Cart</h1>
          <p className="text-mutedgray mb-8">{items.length} item(s) in your cart</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const isNote = item.type === 'note';
              const itemData = item.item;
              const title = isNote ? (itemData as {title: string}).title : (itemData as {name: string}).name;
              const category = isNote ? (itemData as {category: string}).category : `${(itemData as {noteIds?: number[]}).noteIds?.length || 'Multiple'} subjects`;
              
              return (
                <div key={item.id} className="bg-white rounded-xl p-4 shadow-card flex items-center gap-4">
                  <div className="w-16 h-16 bg-parchment-dark rounded-lg flex items-center justify-center flex-shrink-0">
                    {isNote ? <FileText className="w-8 h-8 text-burgundy" /> : <Package className="w-8 h-8 text-gold" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-ui font-medium text-ink truncate">{title}</h3>
                    <p className="text-sm text-mutedgray">{category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-gold">₹{itemData.price}</p>
                    {(itemData as {originalPrice?: number}).originalPrice && (itemData as {originalPrice: number}).originalPrice > itemData.price && (
                      <p className="text-sm text-mutedgray line-through">₹{(itemData as {originalPrice: number}).originalPrice}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove item from cart"
                    className="p-2 hover:bg-red-50 text-mutedgray hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}

            <button onClick={clearCart} className="text-sm text-red-500 hover:underline flex items-center gap-1">
              <Trash2 className="w-4 h-4" />
              Clear cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-card sticky top-24">
              <h2 className="font-display text-xl text-ink mb-6">Order Summary</h2>

              <div className="mb-6">
                <CouponInput onApply={handleApplyCoupon} onRemove={removeCoupon} appliedCode={couponCode} discountAmount={discountAmount} />
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-mutedgray">Subtotal</span>
                  <span className="font-ui">₹{getSubtotal()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span className="flex items-center gap-1"><Tag className="w-4 h-4" />Discount</span>
                    <span className="font-ui">-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-mutedgray">GST (18%)</span>
                  <span className="font-ui">₹{Math.round(getTotal() * 0.18)}</span>
                </div>
                <div className="border-t border-parchment-dark pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-ui font-medium text-ink">Total</span>
                    <span className="font-display text-2xl text-gold">₹{totalWithGST}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full py-4 bg-burgundy text-parchment rounded-xl font-ui font-semibold hover:bg-burgundy-light transition-colors flex items-center justify-center gap-2 mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isProcessing
                  ? <><Loader2 className="w-5 h-5 animate-spin" />Processing...</>
                  : <>Proceed to Checkout<ArrowRight className="w-5 h-5" /></>
                }
              </button>

              <div className="flex items-center justify-center gap-4 text-xs text-mutedgray">
                <span className="flex items-center gap-1"><Shield className="w-4 h-4" />Secure</span>
                <span className="flex items-center gap-1"><Check className="w-4 h-4" />Verified</span>
              </div>

              {!currentUser && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    Please <Link to="/login" className="underline">login</Link> to complete your purchase.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
