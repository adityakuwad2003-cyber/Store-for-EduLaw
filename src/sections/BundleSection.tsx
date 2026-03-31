import { motion } from 'framer-motion';
import { ArrowRight, Package, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BundleCard } from '@/components/ui/BundleCard';
import { bundles } from '@/data/notes';

export function BundleSection() {
  return (
    <section className="py-16 bg-parchment-dark">
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-burgundy/10 text-burgundy rounded-full text-sm font-ui font-medium mb-4">
            <Package className="w-4 h-4" />
            Save More
          </span>
          <h2 className="font-display text-3xl lg:text-4xl text-ink mb-4">
            Bundle Offers — <span className="text-burgundy">Save More, Study More</span>
          </h2>
          <p className="font-body text-mutedgray">
            Get multiple subjects at discounted prices. The more you buy, the more you save!
          </p>
        </motion.div>

        {/* Bundles Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {bundles.slice(0, 3).map((bundle, index) => (
            <BundleCard key={bundle.id} bundle={bundle} index={index} />
          ))}
        </div>

        {/* Custom Bundle CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-burgundy to-burgundy-light rounded-2xl p-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-gold" />
            <span className="text-gold font-ui font-medium">Custom Bundle Builder</span>
          </div>
          <h3 className="font-display text-2xl text-parchment mb-2">
            Build Your Own Bundle
          </h3>
          <p className="text-parchment/80 font-body mb-6 max-w-md mx-auto">
            Pick any subjects you want and get automatic discounts based on quantity
          </p>
          <Link
            to="/bundles"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-ink rounded-xl font-ui font-semibold hover:bg-gold-light transition-colors"
          >
            Create Custom Bundle
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Link
            to="/bundles"
            className="inline-flex items-center gap-2 text-burgundy font-ui font-medium hover:underline"
          >
            View all bundle offers
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
