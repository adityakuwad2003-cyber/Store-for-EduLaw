import { useState } from 'react';
import { Check, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { subscriptionPlans } from '@/data/notes';
import { SEO } from '@/components/SEO';

export function Subscription() {
  const [isAnnual, setIsAnnual] = useState(false);
  const plan = isAnnual ? subscriptionPlans[1] : subscriptionPlans[0];

  return (
    <div className="pt-24 pb-20 min-h-screen bg-parchment">
      <SEO 
        title="Unlimited Legal Learning Subscription — EduLaw Pro"
        description="Get unlimited access to India's most comprehensive legal library. Subscribe to EduLaw Pro for monthly downloads and premium legal services."
        canonical="/subscription"
      />
      {/* Hero */}
      <div className="bg-ink py-16">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold/20 rounded-full mb-6">
              <Crown className="w-4 h-4 text-gold" />
              <span className="font-ui text-sm text-gold">Premium Access</span>
            </span>
            <h1 className="font-display text-4xl lg:text-5xl text-parchment mb-4">
              Unlimited Legal <span className="text-gold">Knowledge</span>
            </h1>
            <p className="font-body text-lg text-parchment/70">
              Get unlimited access to all notes, monthly downloads, and exclusive benefits with our subscription plans.
            </p>
          </div>
        </div>
      </div>

      <div className="section-container py-16">
        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`font-ui font-medium ${!isAnnual ? 'text-ink' : 'text-mutedgray'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            title={`Switch to ${isAnnual ? 'Monthly' : 'Annual'} billing`}
            className={`relative w-16 h-8 rounded-full transition-colors ${
              isAnnual ? 'bg-burgundy' : 'bg-parchment-dark'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                isAnnual ? 'translate-x-9' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`font-ui font-medium ${isAnnual ? 'text-ink' : 'text-mutedgray'}`}>
            Annual
          </span>
          {isAnnual && (
            <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-ui">
              Save 33%
            </span>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Monthly Card */}
          <div className={`bg-white rounded-2xl p-8 shadow-card ${!isAnnual ? 'ring-2 ring-burgundy' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-xl text-ink">Monthly</h3>
                <p className="text-sm text-mutedgray">Billed monthly</p>
              </div>
              {!isAnnual && (
                <span className="px-3 py-1 bg-burgundy/10 text-burgundy rounded-full text-sm font-ui">
                  Selected
                </span>
              )}
            </div>
            <div className="mb-6">
              <span className="font-display text-4xl text-ink">₹499</span>
              <span className="text-mutedgray">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {subscriptionPlans[0].features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-mutedgray">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setIsAnnual(false)}
              className={`w-full py-3 rounded-xl font-ui font-medium transition-colors ${
                !isAnnual 
                  ? 'bg-burgundy text-parchment' 
                  : 'bg-parchment-dark text-ink hover:bg-parchment'
              }`}
            >
              Choose Monthly
            </button>
          </div>

          {/* Annual Card */}
          <div className={`bg-white rounded-2xl p-8 shadow-card ${isAnnual ? 'ring-2 ring-burgundy' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-xl text-ink">Annual</h3>
                <p className="text-sm text-mutedgray">Billed annually</p>
              </div>
              {isAnnual && (
                <span className="px-3 py-1 bg-burgundy/10 text-burgundy rounded-full text-sm font-ui">
                  Selected
                </span>
              )}
            </div>
            <div className="mb-6">
              <span className="font-display text-4xl text-ink">₹3,999</span>
              <span className="text-mutedgray">/year</span>
              <p className="text-sm text-green-600 mt-1">
                Just ₹333/month — Save ₹1,989
              </p>
            </div>
            <ul className="space-y-3 mb-8">
              {subscriptionPlans[1].features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-mutedgray">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setIsAnnual(true)}
              className={`w-full py-3 rounded-xl font-ui font-medium transition-colors ${
                isAnnual 
                  ? 'bg-burgundy text-parchment' 
                  : 'bg-parchment-dark text-ink hover:bg-parchment'
              }`}
            >
              Choose Annual
            </button>
          </div>
        </div>

        {/* Coming Soon Banner */}
        <div className="max-w-4xl mx-auto mb-16 px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden bg-gradient-to-br from-ink to-[#1a1a1a] rounded-[2.5rem] p-8 sm:p-12 border border-gold/20 shadow-2xl group text-center md:text-left"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-gold/10 transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-burgundy/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-burgundy/10 transition-colors duration-700" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gold/10 border border-gold/20 flex items-center justify-center relative">
                  <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-gold animate-pulse" />
                  <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gold text-ink text-[8px] font-black uppercase tracking-widest rounded-md shadow-lg">
                    SOON
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="font-display text-2xl sm:text-3xl text-parchment mb-3">
                  The <span className="text-gold">Ultimate</span> Legal Edge
                </h3>
                <p className="font-ui text-sm sm:text-base text-parchment/60 leading-relaxed max-w-xl mx-auto md:mx-0">
                  We are finalising our premium subscription infrastructure to provide you with seamless 
                  access to over <span className="text-parchment font-bold">46+ Dynamic Modules</span>, 
                  Expert Insights, and Priority Legal Support.
                </p>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-ui font-black text-parchment/40 uppercase tracking-widest">Integrating Razorpay</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                    <span className="text-[10px] font-ui font-black text-parchment/40 uppercase tracking-widest">Final Testing phase</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Selected Plan CTA */}
        <div className="bg-gradient-to-r from-burgundy to-burgundy-light rounded-2xl p-8 text-center max-w-2xl mx-auto">
          <h3 className="font-display text-2xl text-parchment mb-2">
            {isAnnual ? 'Annual' : 'Monthly'} Plan Selected
          </h3>
          <p className="text-parchment/70 mb-6">
            {isAnnual 
              ? 'Get the best value with our annual subscription' 
              : 'Flexible monthly billing, cancel anytime'}
          </p>
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="font-display text-3xl text-gold">₹{plan.price}</span>
            <span className="text-parchment/60">/{plan.period}</span>
          </div>
          <button className="px-8 py-4 bg-gold text-ink rounded-xl font-ui font-semibold hover:bg-gold-light transition-colors">
            Start Subscription
          </button>
          <p className="text-parchment/50 text-sm mt-4">
            Cancel anytime. No hidden fees. Secure payment via Razorpay.
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="font-display text-2xl text-ink mb-8 text-center">
            Subscription FAQ
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'What happens after I subscribe?',
                a: 'You\'ll get immediate access to all 46 notes in your browser. You can download up to your monthly quota of watermarked PDFs.'
              },
              {
                q: 'Can I cancel my subscription?',
                a: 'Yes, you can cancel anytime. Your access will continue until the end of your billing period.'
              },
              {
                q: 'What happens to my downloads if I cancel?',
                a: 'Your downloaded PDFs remain accessible. However, you won\'t be able to download new notes without an active subscription.'
              },
              {
                q: 'Do downloads roll over to the next month?',
                a: 'No, your download quota resets at the start of each billing cycle. Unused downloads don\'t carry over.'
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-ui font-medium text-ink mb-2">{faq.q}</h3>
                <p className="text-sm text-mutedgray">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
