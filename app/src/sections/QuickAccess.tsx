import { motion } from 'framer-motion';
import { Sparkles, Package, Crown, Scale, ArrowRight } from 'lucide-react';

const links = [
  { 
    title: 'Featured Notes', 
    subtitle: 'Expert Curated',
    icon: Sparkles, 
    href: '#featured-notes',
    color: 'text-gold'
  },
  { 
    title: 'Bundle Offers', 
    subtitle: 'Maximum Savings',
    icon: Package, 
    href: '#bundles',
    color: 'text-burgundy-light'
  },
  { 
    title: 'Subscriptions', 
    subtitle: 'Unlimited Access',
    icon: Crown, 
    href: '#subscriptions',
    color: 'text-gold'
  },
  { 
    title: 'Legal Services', 
    subtitle: 'Professional Help',
    icon: Scale, 
    href: '#legal-services',
    color: 'text-burgundy-light'
  },
];

export function QuickAccess() {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-ink py-10 relative overflow-hidden border-y border-white/5">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-burgundy/10 to-transparent pointer-events-none" />
      
      <div className="section-container relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {links.map((link, index) => (
            <motion.a
              key={index}
              href={link.href}
              onClick={(e) => scrollToSection(e, link.href)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-gold/30 hover:bg-white/10 transition-all duration-300 shadow-2xl"
            >
              <div className="flex flex-col items-center lg:items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-ink/50 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-gold/50 transition-all duration-500 shadow-lg`}>
                  <link.icon className={`w-6 h-6 ${link.color}`} strokeWidth={1.5} />
                </div>
                
                <div className="text-center lg:text-left">
                  <h3 className="font-display text-lg text-parchment group-hover:text-gold transition-colors">
                    {link.title}
                  </h3>
                  <p className="font-ui text-[10px] uppercase tracking-widest text-parchment/40 font-bold mt-1">
                    {link.subtitle}
                  </p>
                </div>

                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 hidden lg:block">
                  <ArrowRight className="w-4 h-4 text-gold" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
