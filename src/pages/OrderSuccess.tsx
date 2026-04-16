import { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, Download, ArrowRight,
  ShieldCheck, MessageCircle, FileText, ExternalLink 
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
// import confetti from 'canvas-confetti'; // Assuming it's available or we can use a simpler visual

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  useAuth(); // keep auth context alive
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);

    // In a real app, we'd fetch order details from Firebase using the ID in the URL or state
    // For now, we'll use the state passed from Cart.tsx
    if (location.state?.fromCheckout) {
      setOrderData(location.state.orderInfo || {
        orderId: `ORD-${Math.floor(Math.random() * 1000000)}`,
        items: [] 
      });
      
      // Simple confetti-like effect using framer-motion or just visual flair
    } else {
      // If accessed directly without checkout context, redirect to dashboard or home
      // navigate('/dashboard');
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      <SEO title="Order Successful — EduLaw" description="Your purchase was successful. Download your legal templates now." />

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
                Your templates are ready for download. We've also sent the access links to your email.
              </motion.p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Order Info & Downloads */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
                    <div>
                      <p className="text-[10px] font-ui font-black text-slate-400 uppercase tracking-widest mb-1">Order ID</p>
                      <h3 className="font-display text-xl font-bold text-ink">{orderData?.orderId || '#ORD-882910'}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-ui font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full font-ui text-[10px] font-black uppercase tracking-wider">Completed</span>
                    </div>
                  </div>

                  <h4 className="font-ui text-[11px] font-black text-ink uppercase tracking-wider mb-6">Your Downloads</h4>
                  <div className="space-y-4">
                    {/* Simulated download list */}
                    {[1].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-parchment/30 rounded-2xl border border-parchment-dark/30 group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-100 group-hover:border-gold/30 transition-all">
                            <FileText className="w-6 h-6 text-burgundy/60" />
                          </div>
                          <div>
                            <h5 className="font-display font-bold text-ink text-sm">Legal Template Package</h5>
                            <p className="text-xs text-slate-400">PDF + MS Word Format</p>
                          </div>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-burgundy text-white rounded-xl font-ui text-xs font-bold hover:bg-burgundy-light transition-all shadow-lg shadow-burgundy/10">
                          <Download className="w-4 h-4" /> Download
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 p-6 bg-slate-50 rounded-3xl flex items-start gap-4">
                    <ShieldCheck className="w-6 h-6 text-gold shrink-0 mt-1" />
                    <div>
                      <h5 className="font-ui font-bold text-ink text-sm mb-1">Lifetime Access Guaranteed</h5>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        You can access these downloads anytime from your <Link to="/dashboard" className="text-burgundy underline">Purchases Dashboard</Link>. Future updates to these templates are included for free.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Next Steps */}
              <div className="space-y-6">
                <div className="bg-ink text-white rounded-[2.5rem] p-8 shadow-xl shadow-ink/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 -rotate-45 translate-x-1/2 -translate-y-1/2" />
                  <h3 className="font-display text-xl font-bold mb-4 relative z-10">What's Next?</h3>
                  <div className="space-y-6 relative z-10">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center shrink-0 font-ui font-black text-xs">1</div>
                      <p className="text-xs text-slate-300 leading-relaxed">Download your templates using the buttons on the left.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center shrink-0 font-ui font-black text-xs">2</div>
                      <p className="text-xs text-slate-300 leading-relaxed">Customize the bracketed information [LIKE THIS] in the Word document.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center shrink-0 font-ui font-black text-xs">3</div>
                      <p className="text-xs text-slate-300 leading-relaxed">Consult with an advocate for specific advisory if needed.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h4 className="font-display font-bold text-ink mb-2">Need Assistance?</h4>
                    <p className="text-xs text-slate-500 mb-6">Our priority support team is ready to help you with any questions.</p>
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
