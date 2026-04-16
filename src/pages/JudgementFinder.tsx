import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  Search, Gavel, Scale, Book, 
  ExternalLink, ArrowRight, History,
  Info, ChevronDown, Filter,
  BookOpen, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── Constants ──────────────────────────────────────────────────────────────
const MAJOR_ACTS = [
  { id: 'ipc', name: 'Indian Penal Code (IPC)', year: 1860, sections: 511 },
  // Future acts can be added here
];

const ACT_METADATA: Record<string, any> = {
  'ipc': {
    title: 'Indian Penal Code',
    sections: 511,
    description: 'The official criminal code of India, covering substantive aspects of criminal law.',
    linkPattern: (s: string) => `https://indiankanoon.org/search/?formInput=act: indian penal code section: ${s}`,
    sccPattern: (s: string) => `https://www.scconline.com/search?q=IPC+Section+${s}`,
    escrPattern: (s: string) => `https://main.sci.gov.in/pdfview/index.php?act=ipc&section=${s}` // Conceptual
  }
};

type SearchState = 'idle' | 'searching' | 'results';

// ─── Main Component ───────────────────────────────────────────────────────────
export default function JudgementFinder() {
  const [act, setAct] = useState(MAJOR_ACTS[0]);
  const [section, setSection] = useState('');
  const [status, setStatus] = useState<SearchState>('idle');
  const navigate = useNavigate();

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!section) return;
    setStatus('searching');
    
    // Simulate smart analysis 
    setTimeout(() => {
      setStatus('results');
    }, 800);
  };

  const openSearch = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-parchment pt-24 pb-20">
      <Helmet>
        <title>Judgment Finder — Search Supreme & High Court Judgments | EduLaw</title>
        <meta name="description" content="Search Supreme Court and High Court judgments by Act and Section. Instant lookup for IPC, CrPC, and more." />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* ── Header ── */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-full text-gold text-xs font-black uppercase tracking-[0.25em] mb-6"
          >
            <Scale className="w-4 h-4" /> Pro Judgment Finder
          </motion.div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink leading-tight mb-6">
            Find the <span className="italic text-burgundy underline decoration-gold/30 underline-offset-8">Verdict</span>
          </h1>
          <p className="font-body text-ink/60 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Search Supreme Court and High Court judgments by Act and Section. 
            Educational discovery meets fast legal research.
          </p>
        </div>

        {/* ── Search UI ── */}
        <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] border border-ink/10 shadow-2xl relative overflow-hidden">
          {/* Decorative Pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] pointer-events-none translate-x-8 -translate-y-8">
            <BookOpen className="w-full h-full" />
          </div>

          <form onSubmit={handleSearch} className="p-8 sm:p-10 space-y-8 relative z-10">
            {/* Act Selection */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-ink/40 mb-3 ml-1">Select Act</label>
              <div className="relative">
                <select 
                  className="w-full h-14 pl-5 pr-12 bg-parchment border border-ink/10 rounded-2xl font-ui text-sm font-bold text-ink appearance-none focus:outline-none focus:border-gold/50 transition-colors cursor-pointer"
                  disabled
                >
                  <option>{act.name}</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-ink/30">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-[10px] font-ui text-gold font-bold uppercase tracking-wider ml-1">
                <Info className="w-3 h-3" />
                Only IPC is live in Pro Beta. More acts coming soon.
              </div>
            </div>

            {/* Section Input */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-ink/40 mb-3 ml-1">Section Number</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-ink/30 pointer-events-none">
                  <Filter className="w-4 h-4" />
                </div>
                <input 
                  type="text"
                  placeholder="e.g. 302, 420, 377"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full h-14 pl-12 pr-5 bg-parchment border border-ink/10 rounded-2xl font-ui text-sm font-bold text-ink placeholder:text-ink/20 focus:outline-none focus:border-gold/50 transition-colors"
                />
              </div>
            </div>

            {/* CTA */}
            <button
              type="submit"
              disabled={status === 'searching' || !section}
              className="w-full h-16 bg-ink text-parchment rounded-[1.25rem] font-ui text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-ink/90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-ink/20"
            >
              {status === 'searching' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Find Citations & Judgments
                </>
              )}
            </button>
          </form>

          {/* ── Results Experience ── */}
          <AnimatePresence>
            {status === 'results' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-ink/10 bg-parchment/30 overflow-hidden"
              >
                <div className="p-8 sm:p-10 space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display text-lg text-ink">Found Sources for Section {section}</h3>
                    <button 
                      onClick={() => setStatus('idle')}
                      className="text-[10px] font-ui font-black uppercase tracking-widest text-gold hover:underline"
                    >
                      Clear Search
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Source: Indian Kanoon */}
                    <button 
                      onClick={() => openSearch(ACT_METADATA.ipc.linkPattern(section))}
                      className="group relative bg-white border border-ink/8 rounded-[1.5rem] p-5 text-left hover:border-gold/50 transition-all hover:shadow-lg"
                    >
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-ink/30 mb-2">
                        <Scale className="w-3 h-3" /> External Library
                      </div>
                      <h4 className="font-ui font-bold text-ink text-sm mb-1 group-hover:text-gold transition-colors">Indian Kanoon</h4>
                      <p className="font-body text-[10px] text-ink/50 leading-relaxed mb-4">View full text judgments and structural analysis for Sec {section}.</p>
                      <div className="flex items-center gap-2 text-[9px] font-black text-ink uppercase tracking-widest group-hover:gap-3 transition-all">
                        Open Library <ArrowRight className="w-3 h-3" />
                      </div>
                    </button>

                    {/* Source: SCC Online */}
                    <button 
                      onClick={() => openSearch(ACT_METADATA.ipc.sccPattern(section))}
                      className="group relative bg-white border border-ink/8 rounded-[1.5rem] p-5 text-left hover:border-gold/50 transition-all hover:shadow-lg"
                    >
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-ink/30 mb-2">
                        <Book className="w-3 h-3" /> Premium Case Law
                      </div>
                      <h4 className="font-ui font-bold text-ink text-sm mb-1 group-hover:text-gold transition-colors">SCC Online</h4>
                      <p className="font-body text-[10px] text-ink/50 leading-relaxed mb-4">Search authoritative citations and case digests for Sec {section}.</p>
                      <div className="flex items-center gap-2 text-[9px] font-black text-ink uppercase tracking-widest group-hover:gap-3 transition-all">
                        Search SCC <ArrowRight className="w-3 h-3" />
                      </div>
                    </button>
                  </div>

                  {/* Smart Redirect Info */}
                  <div className="pt-4 border-t border-ink/5 flex items-start gap-3 opacity-60">
                    <History className="w-4 h-4 text-ink shrink-0" />
                    <p className="font-body text-[11px] leading-relaxed">
                      EduLaw acts as a smart wrapper to direct you to the exact section citation across multiple platforms instantly. 
                      Official government portals (eSCR) are currently being indexed.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Footer ── */}
        <div className="mt-16 text-center">
          <p className="font-body text-sm text-ink/40 max-w-sm mx-auto">
            Judgment Finder Pro is currently in beta. 
            Want to see more acts added? <button onClick={() => navigate('/contact')} className="text-gold font-bold hover:underline">Request an Act</button>
          </p>
        </div>
      </div>
    </div>
  );
}
