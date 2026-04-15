import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookMarked, Bookmark, ChevronRight, RefreshCw, Copy, Check } from 'lucide-react';
import { useConstitutionDaily } from '../../hooks/useDailyContent';
import { useBookmarks } from '../../hooks/useBookmarks';
import {
  IG_GRADIENT, wrapTextCanvas, drawBadge, drawDivider,
  drawBaseBackground, shareFile,
} from '../../lib/playgroundShare';

async function generateConstitutionStoryCard(article: {
  article: string; title: string; plainLanguage: string; keyPoint: string; relatedCase: string;
}): Promise<Blob | null> {
  const W = 1080, H = 1920, PAD = 72;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const raw = canvas.getContext('2d');
  if (!raw) return null;
  const ctx: CanvasRenderingContext2D = raw;
  let Y = await drawBaseBackground(ctx, W, H);

  drawBadge(ctx, 'ARTICLE OF THE DAY', W / 2, Y + 28); Y += 76;

  ctx.fillStyle = '#C9A84C'; ctx.font = 'bold 80px Georgia, serif';
  ctx.textAlign = 'center'; ctx.fillText(article.article, W / 2, Y + 70); Y += 116;

  ctx.fillStyle = '#0D0D0D'; ctx.font = 'bold 54px Georgia, serif';
  Y = wrapTextCanvas(ctx, article.title, PAD, Y, W - PAD * 2, 72, 'center') + 36;

  drawDivider(ctx, W, Y, PAD); Y += 56;
  ctx.fillStyle = '#C9A84C'; ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'left'; ctx.fillText('IN PLAIN LANGUAGE', PAD, Y); Y += 50;
  ctx.fillStyle = '#0D0D0D'; ctx.font = '38px Arial, sans-serif';
  Y = wrapTextCanvas(ctx, article.plainLanguage, PAD, Y, W - PAD * 2, 60) + 40;

  drawDivider(ctx, W, Y, PAD); Y += 56;
  ctx.fillStyle = '#C9A84C'; ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'left'; ctx.fillText('KEY POINT', PAD, Y); Y += 50;
  ctx.fillStyle = '#C9A84C'; ctx.font = '36px Arial, sans-serif';
  Y = wrapTextCanvas(ctx, article.keyPoint, PAD, Y, W - PAD * 2, 56) + 32;

  ctx.fillStyle = 'rgba(13,13,13,0.50)'; ctx.font = 'italic 28px Georgia, serif';
  Y = wrapTextCanvas(ctx, article.relatedCase, PAD, Y, W - PAD * 2, 44) + 24;

  ctx.fillStyle = 'rgba(13,13,13,0.35)'; ctx.font = '26px Arial, sans-serif';
  ctx.textAlign = 'center'; ctx.fillText('Explore more at theedulaw.in', W / 2, Math.min(Y + 40, H - 90));

  return new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b), 'image/png'));
}

export function ConstitutionArticleCard() {
  const article = useConstitutionDaily();
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toggle, isBookmarked } = useBookmarks();

  const handleCopy = useCallback(() => {
    const text = `${article.article} — ${article.title}\n${article.part}\n\nPlain Language: ${article.plainLanguage}\n\nKey Point: ${article.keyPoint}\n\nRelated Case: ${article.relatedCase}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [article]);

  const handleShare = async () => {
    setBusy(true);
    try {
      const blob = await generateConstitutionStoryCard(article);
      if (blob) await shareFile(new File([blob], 'edulaw-constitution-article.png', { type: 'image/png' }), article.title);
    } catch (_) {}
    finally { setBusy(false); }
  };

  return (
    <div className="bg-white border border-ink/10 rounded-3xl overflow-hidden shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-ink/5">
        <div className="w-9 h-9 rounded-xl bg-burgundy/10 flex items-center justify-center shrink-0">
          <BookMarked className="w-5 h-5 text-burgundy" />
        </div>
        <div>
          <p className="font-ui font-black text-sm text-ink">Constitution Article of the Day</p>
          <p className="text-[10px] font-ui text-mutedgray">{article.part}</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 flex flex-col gap-4">
        <div>
          <span className="text-[10px] font-ui font-black text-burgundy uppercase tracking-[0.2em]">{article.article}</span>
          <h3 className="font-display text-xl text-ink mt-1 text-balance">{article.title}</h3>
        </div>

        <div className="bg-parchment/60 rounded-2xl p-4">
          <p className="text-[10px] font-ui font-black text-ink/40 uppercase tracking-widest mb-2">Plain Language</p>
          <p className="font-body text-sm text-ink/80 leading-relaxed">{article.plainLanguage}</p>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-3">
              <div className="bg-gold/5 border border-gold/15 rounded-2xl p-4 mt-3">
                <p className="text-[10px] font-ui font-black text-gold uppercase tracking-widest mb-2">Key Point to Remember</p>
                <p className="font-body text-sm text-ink/80 leading-relaxed">{article.keyPoint}</p>
              </div>
              <div className="border border-ink/8 rounded-2xl p-4">
                <p className="text-[10px] font-ui font-black text-ink/40 uppercase tracking-widest mb-2">Related Case</p>
                <p className="font-body text-sm text-ink/70 leading-relaxed italic">{article.relatedCase}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <button onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-2 text-xs font-ui font-bold text-burgundy hover:text-burgundy-light transition-colors"
            >
              {expanded ? 'Show less' : 'Key point & case'} <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>
            <div className="flex items-center gap-1">
              <button onClick={handleCopy} title="Copy to clipboard" className="p-2 rounded-xl hover:bg-ink/5 transition-colors">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-ink/35" />}
              </button>
              <button onClick={() => toggle(article.id)} title={isBookmarked(article.id) ? 'Remove bookmark' : 'Bookmark'} className="p-2 rounded-xl hover:bg-ink/5 transition-colors">
                {isBookmarked(article.id) ? <BookMarked className="w-4 h-4 text-burgundy" /> : <Bookmark className="w-4 h-4 text-ink/35" />}
              </button>
            </div>
          </div>
          <button
            onClick={handleShare}
            disabled={busy}
            style={{ background: IG_GRADIENT }}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl font-ui text-[11px] font-black text-white disabled:opacity-50 active:scale-95 transition-transform"
          >
            {busy ? <RefreshCw className="w-3 h-3 animate-spin" /> : <span>📱</span>}
            {busy ? 'Generating…' : 'Share Story'}
          </button>
        </div>
      </div>
    </div>
  );
}
