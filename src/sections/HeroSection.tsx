import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles, BookOpen, Scale, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SearchBar } from '@/components/ui/SearchBar';
import { 
  ScalesOfJustice3D, 
  LawBooks3D, 
  Gavel3D, 
  LegalScroll3D,
  DocumentCard3D,
  LaurelWreath 
} from '@/components/ui/LegalSVGs';

const floatingCards = [
  { title: 'BNS Notes', subtitle: 'Criminal Law', delay: 0, icon: Scale },
  { title: 'Constitution', subtitle: 'Part I & II', delay: 0.5, icon: BookOpen },
  { title: 'Company Law', subtitle: 'Corporate', delay: 1, icon: GraduationCap },
  { title: 'CPC Notes', subtitle: 'Civil Procedure', delay: 1.5, icon: BookOpen },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen pt-20 lg:pt-24 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-parchment">
        {/* Gradient overlays */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-full h-full" 
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(201, 168, 76, 0.15) 0%, transparent 40%),
                radial-gradient(circle at 80% 20%, rgba(107, 30, 46, 0.1) 0%, transparent 35%),
                radial-gradient(circle at 60% 80%, rgba(201, 168, 76, 0.1) 0%, transparent 45%)
              `,
            }}
          />
        </div>
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(107, 30, 46, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(107, 30, 46, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Floating 3D Elements - Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated Gavel */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 0.15, x: 0 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute top-20 right-10 w-32 h-32"
        >
          <Gavel3D className="w-full h-full" />
        </motion.div>
        
        {/* Law Books */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 0.1, y: 0 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-32 left-10 w-28 h-28"
        >
          <LawBooks3D className="w-full h-full" />
        </motion.div>
        
        {/* Legal Scroll */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.12, scale: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="absolute top-1/3 right-1/4 w-24 h-28"
        >
          <LegalScroll3D className="w-full h-full" />
        </motion.div>
      </div>

      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[calc(100vh-6rem)] py-12">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6B1E2E]/10 to-[#C9A84C]/10 rounded-full mb-6 border border-[#6B1E2E]/20"
            >
              <Sparkles className="w-4 h-4 text-[#C9A84C]" />
              <span className="font-ui text-sm text-[#6B1E2E]">India's #1 Legal Notes Platform</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl text-ink leading-tight mb-6"
            >
              Master Every Law.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#6B1E2E] to-[#8B2E42]">
                Own Every Note.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="font-body text-lg text-mutedgray mb-8"
            >
              India's most comprehensive legal notes marketplace — crafted for law students, 
              LLB, LLM, CLAT PG, Judiciary, and practising advocates.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <SearchBar variant="hero" />
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-ink rounded-xl font-ui font-semibold hover:shadow-lg hover:shadow-[#C9A84C]/30 transition-all hover:scale-105"
              >
                Browse Notes
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-2 px-6 py-3.5 border-2 border-[#6B1E2E] text-[#6B1E2E] rounded-xl font-ui font-semibold hover:bg-[#6B1E2E] hover:text-parchment transition-all"
              >
                <Play className="w-4 h-4" />
                Start Free Preview
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-6 mt-8 pt-8 border-t border-parchment-dark"
            >
              <div>
                <p className="font-display text-2xl text-[#C9A84C]">46+</p>
                <p className="font-ui text-sm text-mutedgray">Subjects</p>
              </div>
              <div className="w-px h-10 bg-parchment-dark" />
              <div>
                <p className="font-display text-2xl text-[#C9A84C]">10K+</p>
                <p className="font-ui text-sm text-mutedgray">Students</p>
              </div>
              <div className="w-px h-10 bg-parchment-dark" />
              <div>
                <p className="font-display text-2xl text-[#C9A84C]">4.9★</p>
                <p className="font-ui text-sm text-mutedgray">Rating</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - 3D Visual Elements */}
          <div className="hidden lg:block relative h-[500px]">
            {/* Central Scales of Justice */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotateY: -30 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-72 z-20"
              style={{ perspective: '1000px' }}
            >
              <motion.div
                animate={{ 
                  rotateY: [0, 10, 0, -10, 0],
                  rotateX: [0, 5, 0, -5, 0]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <ScalesOfJustice3D className="w-full h-full drop-shadow-2xl" />
              </motion.div>
            </motion.div>

            {/* Floating Document Cards */}
            {floatingCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  y: [0, -20, 0],
                  rotateZ: [-2, 2, -2]
                }}
                transition={{ 
                  opacity: { delay: card.delay + 0.3, duration: 0.5 },
                  scale: { delay: card.delay + 0.3, duration: 0.5 },
                  y: { delay: card.delay + 0.8, duration: 4, repeat: Infinity, ease: "easeInOut" },
                  rotateZ: { delay: card.delay + 0.8, duration: 5, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute w-44"
                style={{
                  top: `${15 + (index % 2) * 35}%`,
                  left: `${5 + (index % 3) * 30}%`,
                  transform: `rotate(${-8 + index * 4}deg)`,
                  zIndex: 10 - index
                }}
              >
                <DocumentCard3D 
                  title={card.title} 
                  subtitle={card.subtitle} 
                  delay={card.delay}
                />
              </motion.div>
            ))}

            {/* Decorative glow effects */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 -z-10"
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#C9A84C]/30 to-[#6B1E2E]/20 blur-3xl" />
            </motion.div>

            {/* Laurel wreath decoration */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 1, duration: 1 }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48"
            >
              <LaurelWreath className="w-full" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-parchment to-transparent pointer-events-none" />
    </section>
  );
}
