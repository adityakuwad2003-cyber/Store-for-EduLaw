import { motion } from 'framer-motion';
import { BookOpen, Users, IndianRupee, Star } from 'lucide-react';

const stats = [
  { icon: BookOpen, value: '46+', label: 'Subjects Covered', color: 'bg-blue-500' },
  { icon: Users, value: '10,000+', label: 'Happy Students', color: 'bg-green-500' },
  { icon: IndianRupee, value: '₹199', label: 'Per Note', color: 'bg-gold' },
  { icon: Star, value: '4.9★', label: 'User Rating', color: 'bg-burgundy' },
];

export function StatsStrip() {
  return (
    <section className="py-8 bg-ink">
      <div className="section-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl ${stat.color} bg-opacity-20 flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color === 'bg-gold' ? 'text-gold' : stat.color === 'bg-burgundy' ? 'text-burgundy-light' : 'text-white'}`} />
              </div>
              <div>
                <p className="font-display text-2xl lg:text-3xl text-parchment">{stat.value}</p>
                <p className="font-ui text-sm text-parchment/60">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
