import { useState } from 'react';
import { Check, Crown } from 'lucide-react';
import { subscriptionPlans } from '@/data/notes';

export function Subscription() {
  const [isAnnual, setIsAnnual] = useState(false);
  const plan = isAnnual ? subscriptionPlans[1] : subscriptionPlans[0];

  return (
    <div className="pt-20 min-h-screen bg-parchment">
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
