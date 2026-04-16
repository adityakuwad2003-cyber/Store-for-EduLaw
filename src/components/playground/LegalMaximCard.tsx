import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, RefreshCw, Copy, Check, Bookmark, BookMarked } from 'lucide-react';
import { useMaximDaily } from '../../hooks/useDailyContent';
import { useBookmarks } from '../../hooks/useBookmarks';
import { generateMaximStoryCard } from '../../lib/playgroundCanvas';
import { IG_GRADIENT, shareFile } from '../../lib/playgroundShare';


export function LegalMaximCard() {
  const maxim = useMaximDaily();
  const [flipped, setFlipped] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toggle, isBookmarked } = useBookmarks();

  const handleCopy = useCallback(() => {
    const text = `"${maxim.maxim}"\n(${maxim.origin})\n\nMeaning: ${maxim.meaning}\n\nUsage: ${maxim.usage}\n\nMemory Hook: ${maxim.memoryHook}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [maxim]);

  const handleShare = async () => {
    setBusy(true);
    try {
      const blob = await generateMaximStoryCard(maxim);
      if (blob) await shareFile(new File([blob], 'edulaw-legal-maxim.png', { type: 'image/png' }), maxim.maxim);
    } catch (_) {}
    finally { setBusy(false); }
  };

  return (
    <div className="bg-white border border-ink/10 rounded-3xl overflow-hidden shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-ink/5">
        <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
          <Lightbulb className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <p className="font-ui font-black text-sm text-ink">Legal Maxim of the Day</p>
          <p className="text-[10px] font-ui text-mutedgray">{maxim.origin} · click card to flip</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 flex flex-col gap-4">
        <div className="cursor-pointer [perspective:800px]" onClick={() => setFlipped(v => !v)}>
          <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: 'spring', damping: 15, stiffness: 80 }}
            className="relative preserve-3d min-h-[100px]"
          >
            <div className="backface-hidden bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-5 flex items-center justify-center min-h-[120px]">
              <p className="font-display text-lg text-ink text-center italic leading-snug">"{maxim.maxim}"</p>
            </div>
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white border border-ink/10 rounded-2xl p-5 flex items-center justify-center overflow-y-auto hide-scrollbar">
              <p className="font-ui text-sm font-bold text-ink/70 text-center leading-relaxed">{maxim.meaning}</p>
            </div>
          </motion.div>
        </div>

        <div>
          <p className="text-[10px] font-ui font-black text-ink/40 uppercase tracking-widest mb-1.5">Usage in Law</p>
          <p className="font-body text-sm text-ink/75 leading-relaxed">{maxim.usage}</p>
        </div>

        <div className="bg-gold/5 border border-gold/15 rounded-2xl p-4">
          <p className="text-[10px] font-ui font-black text-gold uppercase tracking-widest mb-1.5">Memory Hook</p>
          <p className="font-body text-sm text-ink/80 leading-relaxed italic text-balance">"{maxim.memoryHook}"</p>
        </div>

        {/* Utility row: Copy + Bookmark */}
        <div className="flex items-center justify-end gap-1 -mb-1">
          <button onClick={handleCopy} title="Copy to clipboard" className="p-2 rounded-xl hover:bg-ink/5 transition-colors flex items-center gap-1.5 text-[11px] font-ui text-ink/50">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={() => toggle(maxim.id)} title={isBookmarked(maxim.id) ? 'Remove bookmark' : 'Bookmark'} className="p-2 rounded-xl hover:bg-ink/5 transition-colors flex items-center gap-1.5 text-[11px] font-ui text-ink/50">
            {isBookmarked(maxim.id) ? <BookMarked className="w-4 h-4 text-burgundy" /> : <Bookmark className="w-4 h-4" />}
            {isBookmarked(maxim.id) ? 'Saved' : 'Save'}
          </button>
        </div>

        {/* Share button */}
        <button
          onClick={handleShare}
          disabled={busy}
          style={{ background: IG_GRADIENT }}
          className="mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-ui font-black uppercase tracking-widest text-[11px] text-white disabled:opacity-50 active:scale-95 transition-transform"
        >
          {busy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>📱</span>}
          {busy ? 'Generating…' : 'Share as IG Story'}
        </button>
      </div>
    </div>
  );
}
