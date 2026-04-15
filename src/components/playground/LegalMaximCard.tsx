import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, RefreshCw, Copy, Check, Bookmark, BookMarked } from 'lucide-react';
import { useMaximDaily } from '../../hooks/useDailyContent';
import { useBookmarks } from '../../hooks/useBookmarks';
import type { LegalMaxim } from '../../data/playground/maximsData';
import {
  IG_GRADIENT, rrPath, wrapTextCanvas, drawBadge, drawDivider,
  drawBaseBackground, shareFile,
} from '../../lib/playgroundShare';

async function generateMaximStoryCard(maxim: LegalMaxim): Promise<Blob | null> {
  const W = 1080, H = 1920, PAD = 72;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const raw = canvas.getContext('2d');
  if (!raw) return null;
  const ctx: CanvasRenderingContext2D = raw;

  let Y = await drawBaseBackground(ctx, W, H);

  // Badge
  drawBadge(ctx, 'LEGAL MAXIM', W / 2, Y + 28);
  Y += 76;

  // Origin pill
  ctx.font = 'bold 24px Arial, sans-serif';
  const ow = ctx.measureText(maxim.origin).width + 40;
  ctx.fillStyle = 'rgba(201,168,76,0.18)';
  rrPath(ctx, W / 2 - ow / 2, Y - 28, ow, 50, 25);
  ctx.fill();
  ctx.fillStyle = '#C9A84C';
  ctx.textAlign = 'center';
  ctx.fillText(maxim.origin, W / 2, Y);
  Y += 64;

  // Maxim text (gold italic Georgia)
  ctx.fillStyle = '#C9A84C';
  ctx.font = 'italic bold 56px Georgia, serif';
  Y = wrapTextCanvas(ctx, `\u201C${maxim.maxim}\u201D`, PAD, Y + 16, W - PAD * 2, 78, 'center') + 40;

  // Divider
  drawDivider(ctx, W, Y, PAD);
  Y += 56;

  // MEANING label
  ctx.fillStyle = '#C9A84C';
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('MEANING', PAD, Y);
  Y += 50;

  // Meaning text
  ctx.fillStyle = '#0D0D0D';
  ctx.font = '40px Arial, sans-serif';
  Y = wrapTextCanvas(ctx, maxim.meaning, PAD, Y, W - PAD * 2, 62) + 44;

  // Divider
  drawDivider(ctx, W, Y, PAD);
  Y += 56;

  // USAGE IN LAW label
  ctx.fillStyle = '#C9A84C';
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('USAGE IN LAW', PAD, Y);
  Y += 50;

  // Usage text
  ctx.fillStyle = 'rgba(13,13,13,0.70)';
  ctx.font = '36px Arial, sans-serif';
  Y = wrapTextCanvas(ctx, maxim.usage, PAD, Y, W - PAD * 2, 56) + 44;

  // Memory hook box (dynamic positioning)
  const hookTop = Math.min(Y, H - 340);
  const hookH = 170;
  ctx.fillStyle = 'rgba(201,168,76,0.12)';
  rrPath(ctx, PAD, hookTop, W - PAD * 2, hookH, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(201,168,76,0.35)';
  ctx.lineWidth = 1;
  rrPath(ctx, PAD, hookTop, W - PAD * 2, hookH, 20);
  ctx.stroke();
  ctx.fillStyle = '#C9A84C';
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('\uD83D\uDCA1  MEMORY HOOK', PAD + 28, hookTop + 42);
  ctx.fillStyle = 'rgba(13,13,13,0.70)';
  ctx.font = 'italic 30px Georgia, serif';
  Y = wrapTextCanvas(ctx, maxim.memoryHook, PAD + 28, hookTop + 90, W - PAD * 2 - 56, 44) + 20;

  // CTA
  ctx.fillStyle = 'rgba(13,13,13,0.35)';
  ctx.font = '26px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Explore more at theedulaw.in', W / 2, Math.min(Y, H - 90));

  return new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b), 'image/png'));
}

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
