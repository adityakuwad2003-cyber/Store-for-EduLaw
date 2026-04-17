import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { testimonials } from '@/data/notes';

export function Testimonials() {
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
            What Our <span className="text-burgundy">Students Say</span>
          </h2>
          <p className="font-body text-mutedgray">
            Join thousands of satisfied law students who trust EduLaw for their exam preparation
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-card hover:shadow-xl transition-shadow relative"
            >
              {/* Quote Icon */}
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-gold rounded-full flex items-center justify-center">
                <Quote className="w-4 h-4 text-ink" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>

              {/* Quote */}
              <p className="font-body text-sm text-ink mb-6 line-clamp-4">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-parchment-dark">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-burgundy to-burgundy-light flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-white font-display font-bold text-sm">
                    {testimonial.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-ui font-bold text-ink text-sm leading-tight">{testimonial.name}</p>
                  <p className="font-ui text-[11px] text-mutedgray mt-0.5">{testimonial.college}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { value: '4.9/5', label: 'Average Rating' },
            { value: '10,000+', label: 'Happy Students' },
            { value: '46', label: 'Subjects Covered' },
            { value: '50,000+', label: 'Notes Downloaded' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <p className="font-display text-3xl text-burgundy">{stat.value}</p>
              <p className="font-ui text-sm text-mutedgray">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
