import { motion } from 'framer-motion';
import { ArrowRight, FileText, Scale, Search, MessageCircle, Clock, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { legalServices } from '@/data/notes';

const iconMap: Record<string, React.ElementType> = {
  'drafting': FileText,
  'notice': Scale,
  'review': Search,
  'consultation': MessageCircle,
};

export function LegalServices() {
  return (
    <section className="py-20 bg-parchment-dark">
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12"
        >
          <div>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-burgundy/10 text-burgundy rounded-full text-sm font-ui font-medium mb-4">
              <Scale className="w-4 h-4" />
              Professional Services
            </span>
            <h2 className="font-display text-3xl lg:text-4xl text-ink mb-4">
              Legal <span className="text-burgundy">Services</span>
            </h2>
            <p className="font-body text-mutedgray max-w-lg">
              Need professional legal assistance? Our team of qualified advocates is here to help with drafting, notices, and consultations.
            </p>
          </div>
          <Link
            to="/legal-services"
            className="inline-flex items-center gap-2 text-burgundy font-ui font-medium hover:underline"
          >
            View all services
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {legalServices.map((service, index) => {
            const Icon = iconMap[service.id] || FileText;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-card hover:shadow-xl transition-all hover:-translate-y-1"
              >
                {/* Icon */}
                <div className="w-12 h-12 bg-burgundy/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-burgundy" />
                </div>

                {/* Content */}
                <h3 className="font-display text-lg text-ink mb-2">
                  {service.name}
                </h3>
                <p className="font-body text-sm text-mutedgray mb-4">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {service.features.slice(0, 2).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-mutedgray">
                      <Check className="w-3.5 h-3.5 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-parchment-dark">
                  <div className="flex items-center gap-1 text-sm text-mutedgray">
                    <Clock className="w-4 h-4" />
                    {service.turnaroundTime}
                  </div>
                  <span className="font-display text-gold">{service.price}</span>
                </div>

                <Link
                  to={`/legal-services?service=${service.id}`}
                  className="w-full mt-4 py-2.5 bg-burgundy text-parchment rounded-lg font-ui font-medium text-sm hover:bg-burgundy-light transition-colors text-center block"
                >
                  Book Now
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
