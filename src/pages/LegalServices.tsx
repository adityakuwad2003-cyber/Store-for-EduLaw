import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Scale, Search, MessageCircle, FileEdit, ArrowRight,
  Shield, Check, User, Mail, Phone, ChevronLeft, Loader2, IndianRupee,
  Clock, Zap, Star, ShieldCheck, HelpCircle,
  CheckCircle2, PlayCircle, Lock, MessageSquare, X,
} from 'lucide-react';
import { servicesData, type LegalService } from '../data/servicesData';
import { SEO } from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { createRazorpayCheckout } from '../lib/razorpay';
import { TrustBadges } from '../components/ui/TrustBadges';
import { Navbar as Header } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

const WHATSAPP_NUMBER = '917028926065';

const ICON_MAP: Record<string, React.ElementType> = {
  MessageCircle, Scale, Search, FileEdit, FileText
};

const RETAINER_PLANS = [
  {
    id: 'startup-retainer',
    name: 'Startup Counsel',
    price: 4999,
    billed: 'monthly',
    description: 'Perfect for early-stage startups needing ongoing legal support for contracts and compliance.',
    features: [
      '3 Contract Reviews / month',
      '1 Custom Drafting / month',
      'Unlimited Q&A via Email',
      'Discounted Litigation Fees'
    ],
    highlight: false
  },
  {
    id: 'private-advocate',
    name: 'Private Advocate',
    price: 9999,
    billed: 'monthly',
    description: 'A dedicated legal partner for HNIs and growing businesses. Priority response and expert drafting.',
    features: [
      'Unlimited Consultations',
      'Dedicated Relationship Manager',
      'Complex Transaction Advisory',
      'Personal Data Monitoring'
    ],
    highlight: true
  }
];

const TESTIMONIALS = [
  {
    name: "Arjun Mehta",
    role: "Founder, TechFlow",
    content: "The contract review was incredibly thorough. They found three clauses that could have cost us lakhs. Truly professional.",
    rating: 5
  },
  {
    name: "Sneha Kapoor",
    role: "Proprietor",
    content: "I needed a Legal Notice sent urgently. EduLaw handled it within 24 hours. The process was completely digital and stress-free.",
    rating: 5
  }
];

const STEPS = [
  { title: "Pick a Service", desc: "Select the legal help you need from our vetted service list.", icon: Search },
  { title: "Share Details", desc: "Fill out a quick brief. Your data is encrypted and confidential.", icon: FileEdit },
  { title: "Expert Action", desc: "A qualified advocate starts working on your case immediately.", icon: Scale },
  { title: "Final Delivery", desc: "Get your documents or advice delivered right to your dashboard.", icon: CheckCircle2 },
];

export function LegalServices() {
  const { currentUser } = useAuth();

  const [selectedService, setSelectedService]   = useState<LegalService | null>(null);
  const [selectedTierIdx, setSelectedTierIdx]   = useState(0);
  const [isProcessing, setIsProcessing]         = useState(false);
  const [isInquiring, setIsInquiring]           = useState(false);
  const [isSuccess, setIsSuccess]               = useState(false);
  const [showInquirySuccess, setShowInquirySuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    description: '',
  });

  // Reset tier selection whenever a new service is chosen
  useEffect(() => { setSelectedTierIdx(0); }, [selectedService]);

  const currentTier   = selectedService?.tiers[selectedTierIdx];
  const currentPrice  = currentTier?.price ?? selectedService?.price ?? 0;
  const isQuoteOnly   = currentTier?.isQuoteOnly ?? selectedService?.paymentType === 'quote';

  const goBack = () => { setSelectedService(null); setIsSuccess(false); };

  // ── WhatsApp Inquiry ─────────────────────────────────────────────────────
  const handleWhatsAppInquiry = () => {
    if (!selectedService) return;
    if (!formData.name || !formData.phone) {
      toast.error('Please enter your name and phone number first');
      return;
    }
    setIsInquiring(true);
    const tier = currentTier;
    const priceText = tier && !tier.isQuoteOnly ? `₹${tier.price}` : 'Quote required';
    const message = [
      `*New Legal Service Inquiry — EduLaw*`,
      ``,
      `*Service:* ${selectedService.name}`,
      `*Tier:* ${tier?.label ?? selectedService.shortDescription}`,
      `*Amount:* ${priceText}`,
      `*Turnaround:* ${tier?.turnaround ?? selectedService.turnaroundTime}`,
      ``,
      `*Client Details*`,
      `Name: ${formData.name}`,
      `Phone: ${formData.phone}`,
      formData.email ? `Email: ${formData.email}` : '',
      ``,
      `*Requirement:*`,
      formData.description || '(No details provided yet)',
      ``,
      `_Sent via store.theedulaw.in_`,
    ].filter(l => l !== null).join('\n');

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    setTimeout(() => {
      setIsInquiring(false);
      setShowInquirySuccess(true);
    }, 800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    if (!formData.name || !formData.email || !formData.phone || !formData.description) {
      toast.error('Please fill all fields');
      return;
    }

    setIsProcessing(true);

    try {
      if (!isQuoteOnly && selectedService.paymentType === 'instant') {
        await createRazorpayCheckout({
          amount: currentPrice * 100,
          currency: 'INR',
          name: 'The EduLaw Services',
          description: `${selectedService.name} — ${currentTier?.label ?? ''}`,
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone
          },
          theme: { color: '#6B1E2E' },
          handler: async (response: any) => {
            await submitToBackend(response);
          }
        });
      } else {
        await submitToBackend();
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setTimeout(() => setIsProcessing(false), 1000);
    }
  };

  const submitToBackend = async (razorpayResponse?: any) => {
    try {
      const payload = {
        serviceId: selectedService?.id,
        serviceName: selectedService?.name,
        serviceTier: currentTier?.label ?? '',
        pricingType: isQuoteOnly ? 'quote' : selectedService?.paymentType,
        amountPaid: razorpayResponse ? currentPrice : 0,
        razorpay_payment_id: razorpayResponse?.razorpay_payment_id,
        razorpay_order_id: razorpayResponse?.razorpay_order_id,
        razorpay_signature: razorpayResponse?.razorpay_signature,
        leadName: formData.name,
        leadEmail: formData.email,
        leadPhone: formData.phone,
        leadDescription: formData.description,
      };

      const res = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Submission failed');

      setIsSuccess(true);
      setFormData({ name: '', email: '', phone: '', description: '' });
      // Keep selected service for the success screen
    } catch (err) {
      toast.error('Could not save request. If you paid, please contact support.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <SEO 
        title="Premium Legal Services & Retainers — EduLaw"
        description="Expert legal drafting, contract review, and flat-fee consultations with qualified advocates. Professional legal help for individuals and startups."
        canonical="/legal-services"
      />

      <Header />

      {isSuccess ? (
        /* --- STAGE 3: Success View --- */
        <div className="pt-40 pb-24 px-6 min-h-screen bg-[#FDFBF7]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-50 rounded-full mb-8 relative">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              <motion.div 
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-emerald-100 rounded-full -z-10 opacity-30" 
              />
            </div>
            <h1 className="font-display text-4xl lg:text-5xl text-ink font-bold mb-6">Booking Confirmed!</h1>
            <p className="font-ui text-lg text-slate-600 mb-12 max-w-lg mx-auto leading-relaxed">
              Thank you for trusting us with your legal needs. An advocate has been assigned to your request and will reach out to you within <span className="text-burgundy font-bold">4-6 hours</span> via WhatsApp or Email.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-12">
              <div className="p-6 bg-white rounded-3xl border border-slate-100 text-left">
                <p className="text-[10px] font-ui font-black text-slate-400 uppercase tracking-widest mb-2">Service ID</p>
                <p className="font-display font-bold text-ink">#ELS-{Math.floor(1000 + Math.random() * 9000)}</p>
              </div>
              <div className="p-6 bg-white rounded-3xl border border-slate-100 text-left">
                <p className="text-[10px] font-ui font-black text-slate-400 uppercase tracking-widest mb-2">Service Type</p>
                <p className="font-display font-bold text-ink">{selectedService?.name}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => { setIsSuccess(false); setSelectedService(null); }}
                className="w-full sm:w-auto px-8 py-4 bg-ink text-white rounded-2xl font-ui font-bold text-sm hover:bg-slate-800 transition-all"
              >
                Go to Dashboard
              </button>
              <a 
                href="https://wa.me/919876543210" 
                target="_blank" 
                rel="noreferrer"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white rounded-2xl font-ui font-bold text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" /> Priority Support
              </a>
            </div>
          </motion.div>
        </div>
      ) : !selectedService ? (
        <div className="pt-24 pb-20">
          {/* ── HERO ── */}
          <section className="relative pt-16 pb-24 overflow-hidden border-b border-burgundy/5">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gold/5 -skew-x-12 translate-x-1/3 pointer-events-none" />
            <div className="section-container relative z-10 px-6 text-center lg:text-left flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 max-w-2xl">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-burgundy/5 text-burgundy rounded-full font-ui text-[10px] font-black uppercase tracking-widest mb-6 border border-burgundy/10"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Confidential · Vetted Advocates
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="font-display text-5xl lg:text-7xl text-ink font-bold leading-[1.05] mb-6"
                >
                  Expert Legal Help. <br />
                  <span className="text-burgundy italic">Zero Complexity.</span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="font-ui text-lg text-slate-600 mb-10 leading-relaxed max-w-xl"
                >
                  Secure your rights without the friction. From instant consultations to complex contract drafting, our advocates deliver professional results with flat-fee transparency.
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
                >
                  <button onClick={() => document.getElementById('services-grid')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-burgundy text-white rounded-2xl font-ui font-bold text-sm shadow-xl shadow-burgundy/20 hover:bg-[#5a1926] transition-all active:scale-95">
                    Browse Services
                  </button>
                  <button className="px-8 py-4 bg-white border border-slate-200 text-ink rounded-2xl font-ui font-bold text-sm hover:border-gold transition-all flex items-center gap-2 group">
                    <PlayCircle className="w-5 h-5 text-gold" /> How it Works
                  </button>
                </motion.div>
              </div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                className="flex-1 w-full max-w-md"
              >
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-tr from-gold to-burgundy rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                  <div className="relative bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-2xl">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <Check className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-ui text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Recent Success</p>
                          <p className="font-display font-bold text-ink text-sm">Legal Notice Sent for Consumer Case</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 translate-x-4">
                        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-gold" />
                        </div>
                        <div>
                          <p className="font-ui text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Turnaround</p>
                          <p className="font-display font-bold text-ink text-sm">Contract Review in 24 Hours</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 -translate-x-2">
                        <div className="w-10 h-10 rounded-full bg-burgundy/10 flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-burgundy" />
                        </div>
                        <div>
                          <p className="font-ui text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Consultation</p>
                          <p className="font-display font-bold text-ink text-sm">Meeting Scheduled: 10:30 AM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* ── TRUST BAR ── */}
          <div className="py-12 border-b border-burgundy/5 bg-white/50">
            <div className="section-container px-6">
              <TrustBadges className="opacity-50 grayscale hover:grayscale-0 transition-all duration-700" />
            </div>
          </div>

          {/* ── HOW IT WORKS ── */}
          <section className="py-24 bg-white overflow-hidden">
            <div className="section-container px-6">
              <div className="text-center mb-16">
                <h2 className="font-display text-3xl lg:text-4xl text-ink font-bold mb-4">The EduLaw Process</h2>
                <p className="font-ui text-slate-500">How we deliver professional legal results in 4 simple steps.</p>
              </div>
              <div className="grid md:grid-cols-4 gap-8 relative">
                {/* Connector line */}
                <div className="hidden md:block absolute top-[2.5rem] left-[10%] right-[10%] h-[1px] bg-slate-100" />
                
                {STEPS.map((step, idx) => (
                  <div key={idx} className="relative z-10 text-center group">
                    <div className="w-20 h-20 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/40 group-hover:border-gold transition-all duration-300">
                      <step.icon className="w-8 h-8 text-slate-400 group-hover:text-gold transition-colors" />
                    </div>
                    <div className="absolute top-0 right-1/2 translate-x-[2.5rem] translate-y-[-0.5rem] w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center shadow-lg border-2 border-white">
                      <span className="text-[10px] font-bold text-white leading-none">{idx + 1}</span>
                    </div>
                    <h3 className="font-display text-lg text-ink font-bold mb-2">{step.title}</h3>
                    <p className="font-ui text-xs text-slate-500 leading-relaxed max-w-[200px] mx-auto">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── SERVICES GRID ── */}
          <section id="services-grid" className="py-24 bg-[#FDFBF7]">
            <div className="section-container px-6">
              <div className="flex flex-col lg:flex-row items-end justify-between gap-6 mb-12">
                <div className="max-w-2xl">
                  <h2 className="font-display text-3xl lg:text-4xl text-ink font-bold mb-4">Our Services</h2>
                  <p className="font-ui text-slate-500">Select a service to start your session. Your data is strictly encrypted and shared only with your advocate.</p>
                </div>
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                  <button className="px-4 py-2 bg-white text-ink text-xs font-bold rounded-lg shadow-sm">Standard</button>
                  <button className="px-4 py-2 text-slate-500 text-xs font-bold rounded-lg hover:text-ink">Corporate</button>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {servicesData.map((service) => {
                  const Icon = ICON_MAP[service.icon] || FileText;
                  return (
                    <motion.div
                      key={service.id}
                      whileHover={{ y: -5 }}
                      onClick={() => setSelectedService(service)}
                      className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-card hover:shadow-2xl transition-all cursor-pointer group flex flex-col h-full active:scale-[0.98]"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 group-hover:bg-gold/10 flex items-center justify-center transition-colors mb-6">
                        <Icon className="w-7 h-7 text-slate-400 group-hover:text-gold transition-colors" />
                      </div>
                      <h3 className="font-display text-xl text-ink font-bold leading-tight mb-3 group-hover:text-burgundy transition-colors">{service.name}</h3>
                      <p className="font-ui text-sm text-slate-500 line-clamp-3 mb-8 flex-1">
                        {service.shortDescription}
                      </p>
                      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                        <div>
                          <p className="text-[10px] font-ui font-black text-slate-400 uppercase tracking-widest">
                            {service.paymentType === 'instant' ? 'Starting From' : 'Custom Quote'}
                          </p>
                          <p className="font-display text-lg font-bold text-ink">
                            {service.priceLabel ?? (service.paymentType === 'instant' ? `₹${service.price}` : 'Get Quote')}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── RETAINER PLANS ── */}
          <section className="py-24 bg-white">
            <div className="section-container px-6">
              <div className="max-w-3xl mx-auto text-center mb-16">
                <h2 className="font-display text-3xl lg:text-4xl text-ink font-bold mb-4">Dedicated Advocate Support</h2>
                <p className="font-ui text-slate-500">Need ongoing legal help? Our retainer plans give you priority access to legal experts for a fixed monthly fee.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {RETAINER_PLANS.map((plan) => (
                  <div 
                    key={plan.id}
                    className={`relative p-10 rounded-[3rem] border-2 transition-all ${
                      plan.highlight 
                        ? 'border-burgundy bg-[#0A0A0B] text-white shadow-[0_20px_60px_-15px_rgba(107,30,46,0.3)]' 
                        : 'border-slate-100 bg-white text-ink shadow-xl shadow-slate-100'
                    }`}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold text-white font-ui text-[10px] font-black uppercase tracking-widest rounded-full">
                        Most Recommended
                      </div>
                    )}
                    <h3 className={`font-display text-2xl font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-ink'}`}>{plan.name}</h3>
                    <p className={`font-ui text-sm mb-8 ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{plan.description}</p>
                    
                    <div className="flex items-baseline gap-1 mb-8">
                      <span className="font-display text-4xl font-bold italic">₹{plan.price}</span>
                      <span className={`font-ui text-xs font-bold uppercase tracking-widest ${plan.highlight ? 'text-slate-500' : 'text-slate-400'}`}>/ {plan.billed}</span>
                    </div>

                    <ul className="space-y-4 mb-10">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className={`w-5 h-5 shrink-0 ${plan.highlight ? 'text-gold' : 'text-burgundy'}`} />
                          <span className="font-ui text-sm font-medium">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <button className={`w-full py-4 rounded-2xl font-ui font-bold text-sm transition-all active:scale-95 ${
                      plan.highlight 
                        ? 'bg-gold text-white hover:bg-gold-light' 
                        : 'bg-burgundy text-white hover:bg-burgundy-light'
                    }`}>
                      Get Started with {plan.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── TESTIMONIALS & TRUST ── */}
          <section className="py-24 bg-[#FDFBF7]">
            <div className="section-container px-6">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="font-display text-3xl lg:text-4xl text-ink font-bold mb-6">What our clients <br className="hidden lg:block" /> are saying</h2>
                  <p className="font-ui text-slate-600 mb-10 leading-relaxed">Join a community of thousands who trust EduLaw for their legal documentation and advisory needs. We pride ourselves on fast turnaround and 100% resolution rates.</p>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                      <div className="w-12 h-12 bg-burgundy/5 rounded-full flex items-center justify-center font-display font-bold text-burgundy">4.9</div>
                      <div>
                        <div className="flex gap-1 mb-1">
                          {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-gold fill-gold" />)}
                        </div>
                        <p className="font-ui text-xs text-slate-500 font-bold uppercase tracking-widest">Average User Rating</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                      <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center font-display font-bold text-emerald-600">99%</div>
                      <div>
                        <p className="font-ui text-sm font-bold text-ink">Customer Satisfaction Index</p>
                        <p className="font-ui text-xs text-slate-500">Based on 2,400+ reviews</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {TESTIMONIALS.map((t, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 relative"
                    >
                      <div className="flex gap-1 mb-4">
                        {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-gold fill-gold" />)}
                      </div>
                      <p className="font-ui text-base text-ink italic leading-relaxed mb-6">"{t.content}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-display font-bold text-sm text-ink">{t.name}</p>
                          <p className="font-ui text-xs text-slate-400 font-medium">{t.role}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── FAQ BRIEF ── */}
          <section className="py-24 bg-white">
            <div className="section-container px-6 max-w-4xl">
              <div className="text-center mb-16">
                <HelpCircle className="w-12 h-12 text-gold mx-auto mb-4" />
                <h2 className="font-display text-3xl text-ink font-bold mb-4">Frequently Asked Questions</h2>
                <p className="font-ui text-slate-500">Everything you need to know about our legal services.</p>
              </div>
              <div className="space-y-4">
                {[
                  { q: "Who are the advocates?", a: "We work only with vetted, qualified advocates registered with the Bar Council. Each professional goes through a strict verification process." },
                  { q: "Is my data safe?", a: "Yes. All conversations and documents are encrypted. We follow strict NDAs and attorney-client privilege is maintained." },
                  { q: "What if I'm not satisfied with the draft?", a: "Our drafting services include at least one round of revisions (varies by service) to ensure the final document meets your requirements." },
                  { q: "Can I cancel a consultation?", a: "You can reschedule or cancel up to 2 hours before the scheduled time for a full refund." }
                ].map((faq, i) => (
                  <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <h4 className="font-display font-bold text-ink mb-2">{faq.q}</h4>
                    <p className="font-ui text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : (
        /* --- STAGE 2: Booking Form (Enhanced Premium) --- */
        <div className="pt-32 pb-24 px-6 min-h-screen bg-white">
          <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-12">
            
            {/* Left Col: Order Sidebar */}
            <div className="lg:w-1/3 order-2 lg:order-1">
              <button 
                onClick={goBack}
                className="flex items-center gap-2 text-[10px] font-ui font-black text-slate-400 uppercase tracking-widest hover:text-ink transition-colors mb-8"
              >
                <ChevronLeft className="w-4 h-4" /> Back to All Services
              </button>

              <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 sticky top-32">
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm">
                  {(() => {
                    const Icon = ICON_MAP[selectedService.icon] || FileText;
                    return <Icon className="w-8 h-8 text-gold" />;
                  })()}
                </div>
                <h2 className="font-display text-2xl text-ink font-bold mb-2">{selectedService.name}</h2>
                <p className="font-ui text-xs text-slate-500 mb-8 leading-relaxed">{selectedService.shortDescription}</p>

                <div className="space-y-4 pt-8 border-t border-slate-200">
                  <div className="flex justify-between items-start">
                    <span className="font-ui text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {isQuoteOnly ? 'Pricing' : 'Selected Tier'}
                    </span>
                    <div className="text-right ml-4">
                      {currentTier ? (
                        <>
                          <p className={`font-display text-xl font-bold ${isQuoteOnly ? 'text-slate-400' : 'text-ink'}`}>
                            {isQuoteOnly ? 'Custom Quote' : `₹${currentPrice.toLocaleString('en-IN')}`}
                          </p>
                          <p className="font-ui text-[10px] text-slate-400 mt-0.5">{currentTier.turnaround}</p>
                        </>
                      ) : (
                        <span className="font-display text-xl font-bold text-ink">
                          {selectedService.priceLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-emerald-600">
                    <span className="font-ui text-xs font-bold uppercase tracking-widest">Protection</span>
                    <Lock className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-10 pt-10 border-t border-slate-200">
                  <p className="text-[10px] font-ui font-black text-slate-400 uppercase tracking-widest mb-4">Included with this service:</p>
                  <ul className="space-y-3">
                    {selectedService.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-[11px] font-ui font-bold text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-burgundy shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Col: Checkout Form */}
            <div className="lg:w-2/3 order-1 lg:order-2">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-2xl shadow-slate-200/50">
                <h3 className="font-display text-3xl text-ink font-bold mb-2">Service Registration</h3>
                <p className="font-ui text-slate-500 mb-10">Please provide your details so our advocates can reach out optimally.</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block font-ui text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl font-ui text-sm focus:bg-white focus:ring-2 focus:ring-burgundy/20 transition-all"
                          placeholder="Your official name"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block font-ui text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl font-ui text-sm focus:bg-white focus:ring-2 focus:ring-burgundy/20 transition-all"
                          placeholder="jane@techflow.com"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-ui text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mobile Number (WhatsApp Preferred)</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl font-ui text-sm focus:bg-white focus:ring-2 focus:ring-burgundy/20 transition-all"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>

                  {/* Tier Selector */}
                  {selectedService.tiers.length > 0 && (
                    <div className="space-y-2">
                      <label className="block font-ui text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Package</label>
                      <div className="space-y-2">
                        {selectedService.tiers.map((tier, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedTierIdx(idx)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
                              selectedTierIdx === idx
                                ? 'border-burgundy bg-burgundy/5'
                                : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                            }`}
                          >
                            <div>
                              <p className={`font-ui text-sm font-bold ${selectedTierIdx === idx ? 'text-burgundy' : 'text-ink'}`}>
                                {tier.label}
                              </p>
                              <p className="font-ui text-[11px] text-slate-400 mt-0.5">Turnaround: {tier.turnaround}</p>
                            </div>
                            <div className="text-right shrink-0 ml-4">
                              {tier.isQuoteOnly ? (
                                <span className="font-ui text-xs font-bold text-slate-400">Custom Quote</span>
                              ) : (
                                <span className={`font-display text-lg font-bold ${selectedTierIdx === idx ? 'text-burgundy' : 'text-ink'}`}>
                                  ₹{tier.price.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block font-ui text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Requirement Brief</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-6 bg-slate-50 border-0 rounded-3xl font-ui text-sm focus:bg-white focus:ring-2 focus:ring-burgundy/20 transition-all min-h-[160px] resize-none"
                      placeholder="Please briefly describe your legal situation or specific requirements for the document/notice..."
                      required
                    />
                  </div>

                  <div className="pt-6 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* WhatsApp Inquiry */}
                      <button
                        type="button"
                        onClick={handleWhatsAppInquiry}
                        disabled={isInquiring}
                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.5rem] font-ui font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-70"
                      >
                        {isInquiring
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                          : <><MessageSquare className="w-4 h-4" /> Send Inquiry</>
                        }
                      </button>
                      {/* Pay Now */}
                      <button
                        type="submit"
                        disabled={isProcessing || isQuoteOnly}
                        title={isQuoteOnly ? 'Send an inquiry for a custom quote' : undefined}
                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-burgundy hover:bg-[#5a1926] text-white rounded-[1.5rem] font-ui font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-burgundy/20 disabled:shadow-none"
                      >
                        {isProcessing
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                          : isQuoteOnly
                            ? 'Quote Only — Send Inquiry'
                            : `Pay Securely · ₹${currentPrice.toLocaleString('en-IN')}`
                        }
                      </button>
                    </div>
                    <div className="flex items-center justify-center gap-6 pt-1 grayscale opacity-30">
                      <Shield className="w-6 h-6" />
                      <Zap className="w-6 h-6" />
                      <IndianRupee className="w-6 h-6" />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />

      {/* ── Inquiry Success Popup ── */}
      <AnimatePresence>
        {showInquirySuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowInquirySuccess(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.25 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center relative"
            >
              <button
                onClick={() => setShowInquirySuccess(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="font-display text-xl text-ink font-bold mb-2">
                Request Submitted!
              </h3>
              <p className="font-ui text-sm text-slate-500 leading-relaxed mb-6">
                Your inquiry has been sent to our team on WhatsApp. We'll get back to you within the next <span className="font-bold text-ink">2–3 hours</span>.
              </p>
              <button
                onClick={() => setShowInquirySuccess(false)}
                className="w-full h-11 bg-ink text-white rounded-xl font-ui text-sm font-bold hover:bg-slate-800 transition-colors"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
