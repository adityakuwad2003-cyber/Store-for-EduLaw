import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Brain, Newspaper, Layers, 
  Lightbulb, BookOpen,
  Zap, Gavel, ArrowUpRight
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
    id: 'case-law',
    title: 'Landmark Judgements',
    description: 'Bite-sized summaries of the cases that shaped Indian Law. Essential for exams.',
    icon: Gavel,
    path: '/legal-playground/case-law',
    color: 'bg-gold/10 text-[#7a5c1e]',
    hoverColor: 'hover:border-gold/30',
    size: 'md',
    tag: 'Deep Dive'
  },
  {
    id: 'digest',
    title: 'Daily Legal News',
    description: 'Stay updated with the latest from High Courts, Supreme Court, and Tribunals.',
    icon: Newspaper,
    path: '/legal-playground/digest',
    color: 'bg-blue-50 text-blue-700',
    hoverColor: 'hover:border-blue-300',
    size: 'sm',
    tag: 'Daily'
  },
  {
    id: 'flashcards',
    title: 'Knowledge Cards',
    description: 'Interactive flashcards for quick revision of complex legal subjects and definitions.',
    icon: Layers,
    path: '/legal-playground/flashcards',
    color: 'bg-purple-50 text-purple-700',
    hoverColor: 'hover:border-purple-300',
    size: 'md',
    tag: 'Study Tool'
  },
  {
    id: 'insights',
    title: 'Legal Insights',
    description: 'Detailed analysis of current legal developments, geopolitics, and landmark laws.',
    icon: Lightbulb,
    path: '/legal-playground/insights',
    color: 'bg-amber-50 text-amber-700',
    hoverColor: 'hover:border-amber-300',
    size: 'md',
    tag: 'Articles'
  },
  {
    id: 'lexicon',
    title: 'Legal Lexicon',
    description: 'A comprehensive dictionary of legal terms and maxims to master the language of law.',
    icon: BookOpen,
    path: '/legal-playground/lexicon',
    color: 'bg-indigo-50 text-indigo-700',
    hoverColor: 'hover:border-indigo-300',
    size: 'sm',
    tag: 'Glossary'
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
              <Link to={tool.path} className="absolute inset-0 z-10" aria-label={`Open ${tool.title}`} />
              
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

      {/* Footer Support */}
      <section className="mt-20 section-container px-4">
        <div className="bg-ink text-parchment rounded-[3rem] p-8 sm:p-12 text-center overflow-hidden relative">
          <div className="absolute inset-0 bg-gold/5 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="font-display text-2xl sm:text-3xl mb-4">Want more than just tools?</h2>
            <p className="font-body text-parchment/60 mb-8 max-w-xl mx-auto text-sm sm:text-base">
              Explore our curated marketplace for full subject notes, landmark judgement decks, 
              and expert legal templates.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/marketplace" className="px-8 py-4 bg-gold text-ink rounded-2xl font-ui text-sm font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-gold/20">
                Browse Marketplace
              </Link>
              <Link to="/templates" className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-ui text-sm font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                Legal Templates
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LegalPlayground;
