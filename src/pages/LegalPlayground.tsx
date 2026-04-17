import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Brain, Newspaper, Layers,
  BookOpen,
  Zap, Gavel, ArrowUpRight,
  Trophy, ShoppingBag, Scale, FileText
} from 'lucide-react';
import { SEO } from '@/components/SEO';

const PLAYGROUND_TOOLS = [
  {
    id: 'quiz',
    title: 'Daily Legal Quiz',
    description: 'Test your knowledge with 5 fresh questions every day. Compete with peers and master legal concepts.',
    icon: Brain,
    path: '/legal-playground/quiz',
    color: 'bg-burgundy/10 text-burgundy',
    hoverColor: 'hover:border-burgundy/30',
    size: 'lg', // Spans 2 columns on desktop
    tag: 'Interactive'
  },
  {
    id: 'blogs',
    title: 'Legal Blogs',
    description: 'Bite-sized analysis of high-impact legal developments and news simplified.',
    icon: Newspaper,
    path: '/legal-hub',
    color: 'bg-gold/10 text-[#7a5c1e]',
    hoverColor: 'hover:border-gold/30',
    size: 'md',
    tag: 'Read'
  },
  {
    id: 'flashcards',
    title: 'Interactive Flashcards',
    description: 'Master legal doctrines and definitions with bite-sized knowledge cards.',
    icon: Layers,
    path: '/legal-hub', // They are currently in the hub, or I can deep link if I add id
    color: 'bg-purple-50 text-purple-700',
    hoverColor: 'hover:border-purple-300',
    size: 'sm',
    tag: 'Study'
  },
  {
    id: 'lexicon',
    title: 'Legal Glossary',
    description: 'A comprehensive dictionary of legal terms and maxims for law practitioners.',
    icon: BookOpen,
    path: '/legal-hub',
    color: 'bg-indigo-50 text-indigo-700',
    hoverColor: 'hover:border-indigo-300',
    size: 'sm',
    tag: 'Glossary'
  },
  {
    id: 'case-law',
    title: 'Landmark Judgements',
    description: 'Bite-sized summaries of the cases that shaped Indian Law. Essential for exams.',
    icon: Gavel,
    path: '/legal-playground/case-law',
    color: 'bg-blue-50 text-blue-700',
    hoverColor: 'hover:border-blue-300',
    size: 'md',
    tag: 'Deep Dive'
  }
];

export const LegalPlayground: React.FC = () => {
  return (
    <div className="min-h-screen bg-parchment pb-24">
      <SEO 
        title="Legal Playground | EduLaw"
        description="A modular legal learning hub with daily quizzes, landmark judgements, news updates, and interactive flashcards."
      />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="section-container px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-burgundy/10 text-burgundy rounded-full font-ui text-[11px] font-black uppercase tracking-[0.2em] mb-6"
          >
            <Zap className="w-3.5 h-3.5 fill-burgundy" /> The Legal Playground
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-6xl text-ink mb-6 leading-tight"
          >
            Your Daily <span className="text-burgundy">Legal Arsenal.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto font-body text-ink/60 text-base sm:text-lg leading-relaxed"
          >
            Everything you need to master the law, from daily news to landmark judgements, 
            organized in a single powerful dashboard.
          </motion.p>
        </div>
      </section>

      {/* Quick Path Pills */}
      <section className="section-container px-4 mb-10 -mt-4">
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { label: 'Full Notes', icon: ShoppingBag, route: '/marketplace', cls: 'bg-burgundy/10 text-burgundy border-burgundy/20 hover:bg-burgundy/20' },
            { label: 'Mock Tests',     icon: Trophy,      route: '/mock-tests',     cls: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
            { label: 'Legal Templates',icon: FileText,    route: '/templates',      cls: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' },
            { label: 'Expert Help',    icon: Scale,       route: '/legal-services', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
          ].map(({ label, icon: Icon, route, cls }) => (
            <Link
              key={route}
              to={route}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border font-ui text-xs font-bold hover:scale-105 transition-all ${cls}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              <ArrowUpRight className="w-3 h-3 opacity-50" />
            </Link>
          ))}
        </div>
      </section>

      {/* Bento Grid */}
      <section className="section-container px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[280px]">
          {PLAYGROUND_TOOLS.map((tool, idx) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className={`
                group relative flex flex-col bg-white border border-ink/10 rounded-[2.5rem] p-8 
                transition-all duration-500 overflow-hidden cursor-pointer
                ${tool.hoverColor} hover:shadow-2xl hover:-translate-y-1
                ${tool.size === 'lg' ? 'md:col-span-2' : ''}
              `}
            >
              <Link to={tool.path} className="absolute inset-0 z-30" aria-label={`Open ${tool.title}`} />
              
              <div className="relative z-20 h-full flex flex-col">
                <div className="flex items-start justify-between mb-auto">
                  <div className={`p-4 rounded-2xl ${tool.color} transition-transform group-hover:scale-110 duration-500`}>
                    <tool.icon className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 bg-ink/5 text-ink/40 rounded-full text-[10px] font-black uppercase tracking-widest group-hover:bg-burgundy group-hover:text-white transition-colors duration-300">
                    {tool.tag}
                  </span>
                </div>
                
                <div className="mt-8">
                  <h3 className="font-display text-2xl text-ink mb-3 flex items-center gap-2 group-hover:text-burgundy transition-colors">
                    {tool.title}
                    <ArrowUpRight className="w-5 h-5 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300" />
                  </h3>
                  <p className="font-body text-sm text-ink/50 leading-relaxed line-clamp-2 sm:line-clamp-none">
                    {tool.description}
                  </p>
                </div>
              </div>
              
              {/* Decorative Background Pattern */}
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                <tool.icon className="w-32 h-32" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Cross-Sell Section */}
      <section className="mt-20 section-container px-4">
        <div className="bg-ink rounded-[3rem] p-8 sm:p-12 overflow-hidden relative">
          <div className="absolute inset-0 bg-gold/5 pointer-events-none" />
          <div className="relative z-10">
            <div className="text-center mb-10">
              <h2 className="font-display text-2xl sm:text-3xl text-parchment mb-3">Ready to go further?</h2>
              <p className="font-body text-parchment/60 text-sm sm:text-base max-w-md mx-auto">
                The playground sharpens your knowledge. These tools help you apply it.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: ShoppingBag,
                  iconCls: 'bg-burgundy/20 text-burgundy',
                  borderCls: 'border-burgundy/20 hover:border-burgundy/40',
                  title: 'Notes Marketplace',
                  desc: '500+ curated study notes. Buy exactly what you need.',
                  route: '/marketplace',
                  cta: 'Browse Notes',
                },
                {
                  icon: Trophy,
                  iconCls: 'bg-gold/20 text-[#c9a84c]',
                  borderCls: 'border-gold/20 hover:border-gold/40',
                  title: 'Mock Tests',
                  desc: 'MCQs based on real exam patterns. Track your progress.',
                  route: '/mock-tests',
                  cta: 'Take a Test',
                },
                {
                  icon: FileText,
                  iconCls: 'bg-indigo-500/20 text-indigo-300',
                  borderCls: 'border-indigo-500/20 hover:border-indigo-400/40',
                  title: 'Legal Templates',
                  desc: 'Court-ready petitions, agreements & notice templates.',
                  route: '/templates',
                  cta: 'View Templates',
                },
                {
                  icon: Scale,
                  iconCls: 'bg-emerald-500/20 text-emerald-400',
                  borderCls: 'border-emerald-500/20 hover:border-emerald-400/40',
                  title: 'Expert Legal Help',
                  desc: 'Vetted advocates for consultations & document drafting.',
                  route: '/legal-services',
                  cta: 'Get Help',
                },
              ].map(({ icon: Icon, iconCls, borderCls, title, desc, route, cta }) => (
                <Link
                  key={route}
                  to={route}
                  className={`group flex flex-col p-6 bg-white/5 border rounded-[1.5rem] transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 ${borderCls}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${iconCls}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-display text-base text-white mb-2">{title}</h4>
                  <p className="font-body text-xs text-parchment/50 leading-relaxed mb-4 flex-1">{desc}</p>
                  <span className="font-ui text-[11px] font-black uppercase tracking-widest text-parchment/40 group-hover:text-gold transition-colors flex items-center gap-1">
                    {cta} <ArrowUpRight className="w-3 h-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LegalPlayground;
