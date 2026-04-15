import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Store, Layers, FileQuestion, Crown, ArrowRight } from 'lucide-react';

const navCards = [
  {
    icon: Store,
    title: 'Marketplace',
    desc: '46+ legal subjects',
    href: '/marketplace',
    bg: 'from-burgundy via-[#7D2236] to-burgundy-light',
    glow: 'hover:shadow-burgundy/30',
    iconRing: 'bg-white/15 ring-1 ring-white/20',
    tag: '46+ Notes',
    tagBg: 'bg-white/15 text-white/90',
    textColor: 'text-white',
    subColor: 'text-white/65',
    arrowColor: 'text-white/50 group-hover:text-white',
  },
  {
    icon: Layers,
    title: 'Bundle Builder',
    desc: 'Save up to 20%',
    href: '/bundles',
    bg: 'from-[#B8933F] via-gold to-[#DDB95F]',
    glow: 'hover:shadow-[#C9A84C]/40',
    iconRing: 'bg-ink/10 ring-1 ring-[#1C1C1E]/15',
    tag: 'Best Value',
    tagBg: 'bg-ink/10 text-ink/80',
    textColor: 'text-ink',
    subColor: 'text-ink/60',
    arrowColor: 'text-ink/40 group-hover:text-ink',
  },
  {
    icon: FileQuestion,
    title: 'Mock Tests',
    desc: 'Test your knowledge',
    href: '/mock-tests',
    bg: 'from-[#1A3A6B] via-[#1E4480] to-[#2B5EA7]',
    glow: 'hover:shadow-[#1A3A6B]/30',
    iconRing: 'bg-white/15 ring-1 ring-white/20',
    tag: 'Free Access',
    tagBg: 'bg-white/15 text-white/90',
    textColor: 'text-white',
    subColor: 'text-white/65',
    arrowColor: 'text-white/50 group-hover:text-white',
  },
  {
    icon: Crown,
    title: 'Subscriptions',
    desc: 'All-access passes',
    href: '/subscription',
    bg: 'from-[#2D1B5E] via-[#3D2577] to-[#4E2F8F]',
    glow: 'hover:shadow-[#2D1B5E]/30',
    iconRing: 'bg-white/15 ring-1 ring-white/20',
    tag: 'Unlimited',
    tagBg: 'bg-white/15 text-white/90',
    textColor: 'text-white',
    subColor: 'text-white/65',
    arrowColor: 'text-white/50 group-hover:text-white',
  },
];

export function StatsStrip() {
  return (
    <section className="py-6 sm:py-8 bg-gradient-to-b from-parchment-dark to-parchment">
      <div className="section-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {navCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                to={card.href}
                className={`group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-br ${card.bg} ${card.glow} hover:shadow-xl shadow-lg transition-all duration-300 h-full min-h-[130px] sm:min-h-[150px] overflow-hidden`}
              >
                {/* Shimmer overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none rounded-2xl" />

                {/* Top row: icon + tag */}
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${card.iconRing} flex items-center justify-center`}>
                    <card.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.textColor}`} />
                  </div>
                  <span className={`${card.tagBg} text-[9px] sm:text-[10px] font-ui font-black uppercase tracking-widest px-2 py-0.5 rounded-full`}>
                    {card.tag}
                  </span>
                </div>

                {/* Bottom row: title + desc + arrow */}
                <div className="mt-4">
                  <h3 className={`font-display text-base sm:text-lg leading-tight ${card.textColor} font-bold`}>
                    {card.title}
                  </h3>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className={`font-ui text-xs ${card.subColor}`}>{card.desc}</p>
                    <ArrowRight className={`w-4 h-4 transition-all duration-200 ${card.arrowColor} group-hover:translate-x-1`} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
