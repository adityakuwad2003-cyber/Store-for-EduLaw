import { motion } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { faqs } from '@/data/notes';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-parchment-dark">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left - Header */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:sticky lg:top-24"
          >
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-burgundy/10 text-burgundy rounded-full text-sm font-ui font-medium mb-4">
              <HelpCircle className="w-4 h-4" />
              Got Questions?
            </span>
            <h2 className="font-display text-3xl lg:text-4xl text-ink mb-4">
              Frequently Asked <span className="text-burgundy">Questions</span>
            </h2>
            <p className="font-body text-mutedgray mb-6">
              Find answers to common questions about EduLaw notes, subscriptions, and services.
            </p>
            <p className="font-ui text-sm text-mutedgray">
              Can't find what you're looking for?{' '}
              <a href="mailto:support@edulaw.in" className="text-burgundy hover:underline">
                Contact our support team
              </a>
            </p>
          </motion.div>

          {/* Right - Accordion */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-parchment/50 transition-colors"
                >
                  <span className="font-ui font-medium text-ink pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-mutedgray flex-shrink-0 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === index ? 'auto' : 0,
                    opacity: openIndex === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5">
                    <p className="font-body text-sm text-mutedgray">{faq.answer}</p>
                  </div>
                </motion.div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
