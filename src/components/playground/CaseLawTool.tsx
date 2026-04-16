import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Scale, RefreshCw, Clock, Copy, Check, 
  Bookmark, BookMarked 
} from 'lucide-react';
import type { CaseLaw } from '../../data/playground/caseLaws';
import { useCaseLawsDaily, useCountdownToMidnight } from '../../hooks/useDailyContent';
import { useBookmarks } from '../../hooks/useBookmarks';
import { IG_GRADIENT, shareFile } from '../../lib/playgroundShare';
import { generateCaseLawStoryCard } from '../../lib/playgroundCanvas';

const subjectColors: Record<string, string> = {
  'Constitutional Law': 'bg-burgundy/10 text-burgundy',
  'Fundamental Rights': 'bg-gold/20 text-gold-dark',
  'Criminal Law': 'bg-slate-900 text-white',
  'Family Law': 'bg-pink-100 text-pink-700',
  'Environmental Law': 'bg-emerald-100 text-emerald-700',
  'Labour & Gender Law': 'bg-indigo-100 text-indigo-700',
  'Criminal Procedure': 'bg-orange-100 text-orange-700',
  'Property Law': 'bg-teal-100 text-teal-700',
};

export const CaseLawTool: React.FC = () => {
  const dailyCaseLaws = useCaseLawsDaily(); 
  const countdown = useCountdownToMidnight();
  const [caseLawSharingId, setCaseLawSharingId] = useState<string | null>(null);
  const [caseLawCopiedId, setCaseLawCopiedId] = useState<string | null>(null);
  const { toggle: toggleCaseLawBookmark, isBookmarked: isCaseLawBookmarked } = useBookmarks();

  const handleCaseLawShare = async (c: CaseLaw) => {
    if (caseLawSharingId) return;
    setCaseLawSharingId(c.id);
    try {
      const blob = await generateCaseLawStoryCard(c);
      if (blob) await shareFile(new File([blob], `edulaw-caselaw-${c.id}.png`, { type: 'image/png' }), c.name);
    } catch (_) {
      console.error('Failed to share case law story');
    } finally {
      setCaseLawSharingId(null);
    }
  };

  const handleCaseLawCopy = (c: CaseLaw) => {
    const text = `${c.name}\n${c.citation} · ${c.court} · ${c.year}\n\nRatio Decidendi: ${c.ratio}\n\nWhy It Matters: ${c.significance}`;
    navigator.clipboard.writeText(text).then(() => {
      setCaseLawCopiedId(c.id);
      setTimeout(() => setCaseLawCopiedId(null), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Header logic */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-burgundy/10 text-burgundy rounded-full font-ui text-[10px] font-black uppercase tracking-widest mb-4">
            <Scale className="w-3 h-3" /> Case Law of the Day
          </div>
          <h2 className="font-display text-3xl sm:text-4xl text-ink">Today's 3 Cases</h2>
          <p className="font-body text-ink/60 mt-2 text-sm sm:text-base">Three landmark judgments, refreshed daily — same for every student, everywhere.</p>
        </div>
        {/* Countdown */}
        <div className="flex items-center gap-3 px-5 py-3 bg-white border border-ink/10 rounded-2xl shadow-sm shrink-0">
          <RefreshCw className="w-4 h-4 text-gold shrink-0" />
          <div className="text-center">
            <p className="text-[9px] font-ui font-black uppercase tracking-widest text-ink/40 mb-0.5">Next refresh in</p>
            <p className="font-display text-lg text-ink tabular-nums leading-none">
              {String(countdown.hours).padStart(2, '0')}
              <span className="text-gold animate-pulse">:</span>
              {String(countdown.minutes).padStart(2, '0')}
              <span className="text-gold animate-pulse">:</span>
              {String(countdown.seconds).padStart(2, '0')}
            </p>
          </div>
        </div>
      </div>

      {/* Case cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dailyCaseLaws.map((caselaw, idx) => (
          <motion.article
            key={caselaw.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.12 }}
            className="group relative bg-white border border-ink/10 rounded-2xl p-6 hover:border-burgundy/30 hover:shadow-xl transition-all flex flex-col gap-4"
          >
            {/* Day label */}
            <div className="absolute top-5 right-5 w-8 h-8 rounded-full bg-parchment border border-ink/10 flex items-center justify-center">
              <span className="font-display text-sm text-ink/40">{idx + 1}</span>
            </div>

            {/* Subject badge */}
            <span className={`self-start px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${subjectColors[caselaw.subject] ?? 'bg-slate-100 text-slate-600'}`}>
              {caselaw.subject}
            </span>

            {/* Case name */}
            <div>
              <h3 className="font-display text-lg text-ink leading-snug group-hover:text-burgundy transition-colors mb-1">
                {caselaw.name}
              </h3>
              <div className="flex items-center gap-2 text-[11px] font-ui text-mutedgray">
                <Clock className="w-3 h-3 shrink-0" />
                <span>{caselaw.court} · {caselaw.year}</span>
              </div>
              <div className="mt-1 text-[10px] font-ui text-ink/40 font-medium">{caselaw.citation}</div>
            </div>

            {/* Ratio */}
            <div className="flex-1">
              <p className="text-[10px] font-ui font-black text-gold uppercase tracking-widest mb-1.5">Ratio Decidendi</p>
              <p className="font-body text-sm text-ink/80 leading-relaxed">{caselaw.ratio}</p>
            </div>

            {/* Significance */}
            <div className="pt-4 border-t border-ink/5">
              <p className="text-[10px] font-ui font-black text-ink/40 uppercase tracking-widest mb-1.5">Why It Matters</p>
              <p className="font-body text-xs text-ink/60 leading-relaxed">{caselaw.significance}</p>
            </div>

            {/* Utility row: Copy + Bookmark + Share */}
            <div className="flex items-center gap-1.5 mt-1">
              <button
                onClick={() => handleCaseLawCopy(caselaw)}
                title="Copy to clipboard"
                className="flex items-center gap-1 px-2.5 py-2 rounded-xl border border-ink/10 hover:bg-ink/5 transition-colors font-ui text-[10px] text-ink/50"
              >
                {caseLawCopiedId === caselaw.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                {caseLawCopiedId === caselaw.id ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={() => toggleCaseLawBookmark(caselaw.id)}
                title={isCaseLawBookmarked(caselaw.id) ? 'Remove bookmark' : 'Bookmark'}
                className="flex items-center gap-1 px-2.5 py-2 rounded-xl border border-ink/10 hover:bg-ink/5 transition-colors font-ui text-[10px] text-ink/50"
              >
                {isCaseLawBookmarked(caselaw.id) ? <BookMarked className="w-3 h-3 text-burgundy" /> : <Bookmark className="w-3 h-3" />}
                {isCaseLawBookmarked(caselaw.id) ? 'Saved' : 'Save'}
              </button>
              <button
                onClick={() => handleCaseLawShare(caselaw)}
                disabled={caseLawSharingId !== null}
                style={{ background: IG_GRADIENT }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-ui font-black uppercase tracking-widest text-[10px] text-white disabled:opacity-50 active:scale-95 transition-transform"
              >
                {caseLawSharingId === caselaw.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <span>📱</span>}
                {caseLawSharingId === caselaw.id ? 'Generating…' : 'Share Story'}
              </button>

              <Link
                to={`/playground-item/${caselaw.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gold text-gold font-ui font-black uppercase tracking-widest text-[10px] hover:bg-gold/5 transition-all"
              >
                Details
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
};

export default CaseLawTool;
