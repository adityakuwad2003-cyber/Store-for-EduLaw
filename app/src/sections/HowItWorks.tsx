import { motion } from 'framer-motion';
import { Search, ShoppingCart, Download, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Browse & Preview',
    description: 'Explore our library of 46+ legal subjects. Preview the first 4 pages of any note for free before purchasing.',
    color: 'bg-blue-500',
  },
  {
    icon: ShoppingCart,
    title: 'Purchase Securely',
    description: 'Add notes to cart and checkout with Razorpay. Use coupon codes for additional discounts on bundles.',
    color: 'bg-burgundy',
  },
  {
    icon: Download,
    title: 'Download Watermarked PDF',
    description: 'Get instant access to your personalized watermarked PDF. Read online or download for offline study.',
    color: 'bg-green-500',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-parchment">
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="font-display text-3xl lg:text-4xl text-ink mb-4">
            How It <span className="text-burgundy">Works</span>
          </h2>
          <p className="font-body text-mutedgray">
            Get started with EduLaw in three simple steps
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting Line - Desktop */}
          <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-500 via-burgundy to-green-500" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl p-8 shadow-card hover:shadow-xl transition-shadow text-center relative z-10">
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-ink text-parchment rounded-full flex items-center justify-center font-display text-sm">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 ${step.color} bg-opacity-10 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <step.icon className={`w-8 h-8 ${
                    step.color === 'bg-blue-500' ? 'text-blue-500' :
                    step.color === 'bg-burgundy' ? 'text-burgundy' : 'text-green-500'
                  }`} />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl text-ink mb-3">
                  {step.title}
                </h3>
                <p className="font-body text-mutedgray text-sm">
                  {step.description}
                </p>
              </div>

              {/* Arrow - Mobile */}
              {index < steps.length - 1 && (
                <div className="flex justify-center my-4 md:hidden">
                  <ArrowRight className="w-6 h-6 text-mutedgray rotate-90" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
