import { motion } from 'framer-motion';
import { Check, Crown, Download, Percent, Headphones } from 'lucide-react';
import { useState } from 'react';
import { subscriptionPlans } from '@/data/notes';

export function SubscriptionBanner() {
  const [isAnnual, setIsAnnual] = useState(false);
  const plan = isAnnual ? subscriptionPlans[1] : subscriptionPlans[0];

  return (
    <section className="py-20 bg-ink relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-burgundy/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
      </div>

      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/20 rounded-full mb-6">
              <Crown className="w-4 h-4 text-gold" />
              <span className="font-ui text-sm text-gold">Premium Subscription</span>
            </div>

            <h2 className="font-display text-3xl lg:text-5xl text-parchment mb-4">
              Unlimited Legal <span className="text-gold">Knowledge</span>
            </h2>

            <p className="font-body text-lg text-parchment/70 mb-8">
              Get unlimited access to all 46 notes, monthly downloads, and exclusive discounts on legal services.
            </p>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {plan.features.slice(0, 4).map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-gold" />
                  </div>
                  <span className="font-ui text-parchment/80">{feature}</span>
                </div>
              ))}
            </div>

            {/* Toggle */}
            <div className="flex items-center gap-4 mb-6">
              <span className={`font-ui font-medium ${!isAnnual ? 'text-parchment' : 'text-parchment/50'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  isAnnual ? 'bg-gold' : 'bg-parchment/20'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                    isAnnual ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`font-ui font-medium ${isAnnual ? 'text-parchment' : 'text-parchment/50'}`}>
                Annual
              </span>
              {isAnnual && (
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-ui">
                  Save 33%
                </span>
              )}
            </div>
          </motion.div>

          {/* Right - Pricing Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
          >
            <div className="text-center mb-8">
              <p className="font-ui text-parchment/60 mb-2">
                {isAnnual ? 'Annual Plan' : 'Monthly Plan'}
              </p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="font-display text-5xl text-gold">₹{plan.price}</span>
                <span className="font-ui text-parchment/60">/{plan.period}</span>
              </div>
              {isAnnual && plan.monthlyEquivalent && (
                <p className="text-sm text-parchment/60 mt-2">
                  Just ₹{plan.monthlyEquivalent}/month
                </p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <Download className="w-5 h-5 text-gold mx-auto mb-2" />
                <p className="font-display text-xl text-parchment">{plan.downloadsPerMonth}</p>
                <p className="text-xs text-parchment/60">Downloads/mo</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <Percent className="w-5 h-5 text-gold mx-auto mb-2" />
                <p className="font-display text-xl text-parchment">{plan.serviceDiscount}%</p>
                <p className="text-xs text-parchment/60">Service Discount</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <Headphones className="w-5 h-5 text-gold mx-auto mb-2" />
                <p className="font-display text-xl text-parchment">24/7</p>
                <p className="text-xs text-parchment/60">Support</p>
              </div>
            </div>

            <button className="w-full py-4 bg-gold text-ink rounded-xl font-ui font-semibold hover:bg-gold-light transition-colors">
              Start Subscription
            </button>

            <p className="text-center text-xs text-parchment/50 mt-4">
              Cancel anytime. No hidden fees.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
