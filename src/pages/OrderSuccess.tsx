import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2, ArrowRight,
  ShieldCheck, MessageCircle, FileText, ExternalLink, Receipt
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { downloadInvoicePdf, buildInvoiceFromPurchase } from '@/lib/generateInvoicePdf';

export default function OrderSuccess() {
  const location  = useLocation();
  const { currentUser } = useAuth();
  const [orderData, setOrderData] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (location.state?.fromCheckout) {
      setOrderData(location.state.orderInfo || {});
    }
  }, [location]);

  const handleDownloadInvoice = () => {
    if (!orderData?.invoiceNumber) return;
    setDownloading(true);
    try {
      const invoice = buildInvoiceFromPurchase({
        invoiceNumber:       orderData.invoiceNumber,
        invoiceDate:         new Date(),
        buyerName:           orderData.buyerName || currentUser?.displayName || 'Customer',
        buyerEmail:          orderData.buyerEmail || currentUser?.email || '',
        cartItems:           (orderData.items || []).map((i: any) => ({ title: i.title, price: i.price })),
        couponDiscount:      orderData.couponDiscount || 0,
        razorpay_payment_id: orderData.orderId || '',
      });
      downloadInvoicePdf(invoice);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      <SEO title="Order Successful — EduLaw" description="Your purchase was successful. Access your notes from your dashboard." />

      <main className="pt-32 pb-24">
        <div className="section-container px-6">
          <div className="max-w-4xl mx-auto">

            {/* Success Header */}
            <div className="text-center mb-16">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-4xl md:text-5xl text-ink font-bold mb-4"
              >
                Purchase Successful!
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-ui text-lg text-slate-500 max-w-xl mx-auto"
              >
                Your notes are ready. Access and download them anytime from your dashboard.
              </motion.p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Order Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
                    <div>
                      <p className="text-[10px] font-ui font-black text-slate-400 uppercase tracking-widest mb-1">Payment ID</p>
                      <h3 className="font-ui text-sm font-bold text-ink">{orderData?.orderId || '—'}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-ui font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full font-ui text-[10px] font-black uppercase tracking-wider">Completed</span>
                    </div>
                  </div>

                  {/* Items purchased */}
                  <h4 className="font-ui text-[11px] font-black text-ink uppercase tracking-wider mb-4">Items Purchased</h4>
                  <div className="space-y-3 mb-8">
                    {(orderData?.items || []).length > 0
                      ? orderData.items.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-parchment/30 rounded-2xl border border-parchment-dark/30">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100">
                              <FileText className="w-5 h-5 text-burgundy/60" />
                            </div>
                            <span className="font-display font-bold text-ink text-sm">{item.title}</span>
                          </div>
                          <span className="font-display text-sm text-gold font-bold">₹{item.price}</span>
                        </div>
                      ))
                      : (
                        <div className="p-4 bg-parchment/30 rounded-2xl border border-parchment-dark/30 text-sm text-slate-400 font-ui">
                          View your purchases in the dashboard.
                        </div>
                      )
                    }
                  </div>

                  {/* GST Invoice download */}
                  {orderData?.invoiceNumber && (
                    <div className="p-5 bg-gold/5 rounded-2xl border border-gold/20 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-ui font-bold text-ink text-sm mb-0.5 flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-gold" />
                          GST Invoice Ready
                        </p>
                        <p className="font-ui text-xs text-slate-500">
                          Invoice No: <span className="font-bold text-ink">{orderData.invoiceNumber}</span>
                        </p>
                      </div>
                      <button
                        onClick={handleDownloadInvoice}
                        disabled={downloading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-burgundy text-white rounded-xl font-ui text-xs font-bold hover:bg-burgundy/90 transition-all shadow shadow-burgundy/20 disabled:opacity-60 shrink-0"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        {downloading ? 'Generating…' : 'Download Invoice'}
                      </button>
                    </div>
                  )}

                  <div className="mt-6 p-6 bg-slate-50 rounded-3xl flex items-start gap-4">
                    <ShieldCheck className="w-6 h-6 text-gold shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-ui font-bold text-ink text-sm mb-1">Lifetime Access Guaranteed</h5>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Download your notes anytime from your{' '}
                        <Link to="/dashboard" className="text-burgundy underline">Purchases Dashboard</Link>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-ink text-white rounded-[2.5rem] p-8 shadow-xl shadow-ink/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 -rotate-45 translate-x-1/2 -translate-y-1/2" />
                  <h3 className="font-display text-xl font-bold mb-4 relative z-10">What's Next?</h3>
                  <div className="space-y-6 relative z-10">
                    {[
                      "Go to your Dashboard to download your notes.",
                      "Use the search and filters to find what you need quickly.",
                      "Consult an advocate if you need specific legal advice.",
                    ].map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center shrink-0 font-ui font-black text-xs">{i + 1}</div>
                        <p className="text-xs text-slate-300 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h4 className="font-display font-bold text-ink mb-2">Need Assistance?</h4>
                    <p className="text-xs text-slate-500 mb-6">Our support team is ready to help.</p>
                    <a
                      href="https://wa.me/919876543210"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-ui text-xs font-bold hover:bg-emerald-700 transition-all w-full justify-center"
                    >
                      <ExternalLink className="w-4 h-4" /> Message Support
                    </a>
                  </div>
                </div>

                <Link
                  to="/marketplace"
                  className="flex items-center justify-center gap-2 w-full py-4 font-ui text-xs font-black uppercase tracking-widest text-slate-400 hover:text-burgundy transition-all"
                >
                  Return to Store <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
