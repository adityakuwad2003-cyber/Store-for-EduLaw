import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { glossaryData } from '../../data/glossaryData';

export const LexiconTool: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('All');
  const [showAll, setShowAll] = useState(false);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const filtered = glossaryData.filter(t => {
    const matchSearch = t.term.toLowerCase().includes(search.toLowerCase()) || 
                       t.definition.toLowerCase().includes(search.toLowerCase());
    const matchLetter = selectedLetter === 'All' || t.term.startsWith(selectedLetter);
    return matchSearch && matchLetter;
  });

  const displayTerms = showAll ? filtered : filtered.slice(0, 12);
  const hasMore = filtered.length > 12;

  return (
    <div className="flex flex-col gap-10 min-h-[60vh]">
      <header>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-burgundy/10 text-burgundy rounded-full font-ui text-[10px] font-black uppercase tracking-widest mb-4">
          <BookOpen className="w-3 h-3" /> Legal Lexicon
        </div>
        <h2 className="font-display text-3xl sm:text-4xl text-ink">Legal Lexicon</h2>
        <p className="font-body text-ink/60 mt-2 text-sm sm:text-base">Master the language of law with our comprehensive dictionary</p>
      </header>

      {/* Search & Filter */}
      <div className="space-y-8">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-mutedgray w-5 h-5" />
          <input
            type="search"
            placeholder="Search legal terms, maxims, or concepts..."
            value={search}
            onChange={e => { setSearch(e.target.value); setShowAll(false); }}
            className="w-full bg-white border border-ink/10 rounded-2xl pl-12 pr-6 py-4 font-ui text-sm focus:outline-none focus:border-gold shadow-sm transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => { setSelectedLetter('All'); setShowAll(false); }}
            className={`px-3 py-1.5 rounded-lg font-ui text-[11px] font-black uppercase tracking-widest transition-all ${selectedLetter === 'All' ? 'bg-burgundy text-white shadow-md' : 'bg-white border border-ink/10 text-ink/40 hover:border-burgundy/30'}`}
          >
            All
          </button>
          {alphabet.map(letter => (
            <button
              key={letter}
              onClick={() => { setSelectedLetter(letter); setShowAll(false); }}
              className={`w-8 h-8 flex items-center justify-center rounded-lg font-ui text-[11px] font-black uppercase transition-all ${selectedLetter === letter ? 'bg-burgundy text-white shadow-md' : 'bg-white border border-ink/10 text-ink/40 hover:border-burgundy/30'}`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {displayTerms.map((t, idx) => (
            <motion.div
              key={t.term}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.03 }}
              className="group bg-white border border-ink/10 rounded-2xl p-6 hover:border-gold/30 hover:shadow-xl transition-all"
            >
              <h4 className="font-display text-lg text-ink mb-2 group-hover:text-burgundy transition-colors">{t.term}</h4>
              <p className="font-body text-sm text-ink/60 leading-relaxed">{t.definition}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-white/40 rounded-3xl border border-dashed border-ink/10">
          <p className="font-ui text-sm text-ink/40 italic">No terms found matching your search.</p>
        </div>
      )}

      {hasMore && !showAll && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowAll(true)}
            className="flex items-center gap-2 px-8 py-3 bg-white border border-ink/10 rounded-2xl font-ui text-xs font-bold text-ink hover:border-gold transition-all shadow-sm"
          >
            View all {filtered.length} terms <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {showAll && hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowAll(false)}
            className="flex items-center gap-2 px-8 py-3 bg-white border border-ink/10 rounded-2xl font-ui text-xs font-bold text-ink hover:border-gold transition-all shadow-sm"
          >
             Show fewer terms <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default LexiconTool;
