import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Gavel, Calendar, Copy, Check, Bookmark, BookMarked, RefreshCw } from 'lucide-react';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useDigestDaily } from '../../hooks/useDailyContent';
import type { JudgmentDigest } from '../../data/playground/judgmentDigests';
import {
  IG_GRADIENT, wrapTextCanvas, drawBadge, drawDivider,
  drawBaseBackground, shareFile,
} from '../../lib/playgroundShare';

// ─── IG Story Generator ───────────────────────────────────────────────────────
async function generateDigestStoryCard(item: JudgmentDigest): Promise<Blob | null> {
  const W = 1080, H = 1920, PAD = 80;
  const FOOTER_TOP = H - 140;

  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const raw = canvas.getContext('2d');
  if (!raw) return null;
  const ctx = raw as CanvasRenderingContext2D;

  // ── Background / logo / EDULAW wordmark ─────────────────────────────────────
  let Y = await drawBaseBackground(ctx, W, H);

  // Gold gradient for bottom bar (matches news card)
  const topBar = ctx.createLinearGradient(0, 0, W, 0);
  topBar.addColorStop(0, '#6B1E2E');
  topBar.addColorStop(0.5, '#C9A84C');
  topBar.addColorStop(1, '#6B1E2E');

  // ── Badge ──────────────────────────────────────────────────────────────────
  if (Y < FOOTER_TOP - 76) {
    drawBadge(ctx, 'JUDGMENT DIGEST', W / 2, Y + 28);
    Y += 80;
  }

  // ── Court pill ─────────────────────────────────────────────────────────────
  if (Y < FOOTER_TOP - 60) {
    const isSC = item.court.toLowerCase().includes('supreme');
    const pillColor = isSC ? '#6B1E2E' : '#0D7377';
    ctx.fillStyle = pillColor;
    const pillW = 420, pillH = 48, pillR = 24;
    ctx.beginPath();
    ctx.roundRect(W / 2 - pillW / 2, Y, pillW, pillH, pillR);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.textAlign = 'center';
    const courtLabel = item.court.length > 32 ? item.court.slice(0, 31) + '…' : item.court;
    ctx.fillText(courtLabel.toUpperCase(), W / 2, Y + 31);
    Y += 68;
  }

  // ── Subject chip ───────────────────────────────────────────────────────────
  if (Y < FOOTER_TOP - 52 && item.subject) {
    ctx.font = 'bold 20px Arial, sans-serif';
    const chipW = Math.min(ctx.measureText(item.subject).width + 48, W - PAD * 2);
    ctx.fillStyle = 'rgba(201,168,76,0.18)';
    ctx.beginPath();
    ctx.roundRect(W / 2 - chipW / 2, Y, chipW, 40, 20);
    ctx.fill();
    ctx.fillStyle = '#9A7A20';
    ctx.textAlign = 'center';
    ctx.fillText(item.subject, W / 2, Y + 26);
    Y += 60;
  }

  drawDivider(ctx, W, Y, PAD);
  Y += 40;

  // ── Headline ───────────────────────────────────────────────────────────────
  if (Y < FOOTER_TOP - 80) {
    ctx.fillStyle = '#1A1A1A';
    ctx.font = 'bold 46px Georgia, serif';
    ctx.textAlign = 'center';
    const maxHeadlineH = 3 * 62;
    const headlineBottom = wrapTextCanvas(ctx, item.title, PAD, Y, W - PAD * 2, 62, 'center');
    Y = Math.min(headlineBottom, Y + maxHeadlineH) + 24;
  }

  // Small meta row: date · citation
  if (Y < FOOTER_TOP - 40 && (item.date || item.citation)) {
    ctx.fillStyle = 'rgba(107,30,46,0.70)';
    ctx.font = '22px Arial, sans-serif';
    ctx.textAlign = 'center';
    const meta = [item.date, item.citation].filter(Boolean).join('  ·  ');
    ctx.fillText(meta, W / 2, Y);
    Y += 32;
  }

  drawDivider(ctx, W, Y, PAD);
  Y += 40;

  // ── Four sections: Facts · Issue · Held · Impact ───────────────────────────
  const sections: { label: string; text: string; priority: number }[] = [
    { label: 'FACTS',  text: item.facts,  priority: 2 },
    { label: 'ISSUE',  text: item.issue,  priority: 3 },
    { label: 'HELD',   text: item.held,   priority: 1 }, // highest priority — keep last to drop
    { label: 'IMPACT', text: item.impact, priority: 4 }, // lowest priority — drop first
  ];
  // Sort by priority ascending (1 is most important, keep) — but render in original order.
  // Compute available space, then greedy-fit.

  const labelFont = 'bold 24px Arial, sans-serif';
  const bodyFont = '34px Arial, sans-serif';
  const labelH = 38;
  const bodyLineH = 52;
  const blockGap = 32;

  // Estimate and trim body text per section to fit remaining space
  ctx.font = bodyFont;
  const charPerLine = Math.floor((W - PAD * 2) / (34 * 0.52));

  function measureBlock(text: string, remainingH: number): { trimmed: string; h: number } {
    if (remainingH < labelH + bodyLineH) return { trimmed: '', h: 0 };
    const bodyMaxH = remainingH - labelH - 10;
    const maxLines = Math.max(1, Math.floor(bodyMaxH / bodyLineH));
    const maxChars = maxLines * charPerLine;
    const trimmed = text.length > maxChars ? text.slice(0, maxChars - 1) + '…' : text;
    // Estimate lines via char count (rough but safe)
    const estLines = Math.max(1, Math.ceil(trimmed.length / charPerLine));
    return { trimmed, h: labelH + estLines * bodyLineH };
  }

  // Determine which sections can fit, dropping lowest priority ones if needed
  const available = FOOTER_TOP - Y - 20;
  let remaining = available;
  const toRender: { label: string; text: string }[] = [];
  const order = [...sections].sort((a, b) => a.priority - b.priority);
  for (const s of order) {
    if (!s.text) continue;
    const { trimmed, h } = measureBlock(s.text, remaining);
    if (h === 0) continue;
    toRender.push({ label: s.label, text: trimmed });
    remaining -= (h + blockGap);
    if (remaining < labelH + bodyLineH) break;
  }
  // Restore original Facts→Issue→Held→Impact order
  const renderOrder: { label: string; text: string }[] = [];
  for (const s of sections) {
    const match = toRender.find(r => r.label === s.label);
    if (match) renderOrder.push(match);
  }

  for (const block of renderOrder) {
    // Label
    ctx.fillStyle = '#C9A84C';
    ctx.font = labelFont;
    ctx.textAlign = 'left';
    ctx.fillText(block.label, PAD, Y);
    Y += labelH;
    // Body
    ctx.fillStyle = 'rgba(26,26,26,0.82)';
    ctx.font = bodyFont;
    Y = wrapTextCanvas(ctx, block.text, PAD, Y, W - PAD * 2, bodyLineH);
    Y += blockGap;
    if (Y > FOOTER_TOP - 20) break;
  }

  // ── Footer band (same soft burgundy as news card) ──────────────────────────
  const footerGrad = ctx.createLinearGradient(0, FOOTER_TOP - 30, 0, H);
  footerGrad.addColorStop(0, 'rgba(249,247,242,0)');
  footerGrad.addColorStop(0.4, 'rgba(107,30,46,0.55)');
  footerGrad.addColorStop(1, 'rgba(107,30,46,0.75)');
  ctx.fillStyle = footerGrad;
  ctx.fillRect(0, FOOTER_TOP - 30, W, H - FOOTER_TOP + 30);

  ctx.fillStyle = topBar;
  ctx.fillRect(0, H - 18, W, 18);

  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  ctx.font = 'bold 28px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('EduLaw Judgment Digest', W / 2, FOOTER_TOP + 42);
  ctx.fillStyle = 'rgba(232,201,122,0.95)';
  ctx.font = '22px Arial, sans-serif';
  ctx.fillText(dateStr, W / 2, FOOTER_TOP + 72);
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.font = '20px Arial, sans-serif';
  ctx.fillText('theedulaw.in/legal-playground', W / 2, FOOTER_TOP + 100);

  return new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b), 'image/png'));
}

const subjectColors: Record<string, string> = {
  'Constitutional Law': 'bg-burgundy/10 text-burgundy',
  'Fundamental Rights': 'bg-purple-100 text-purple-700',
  'Criminal Law':       'bg-red-100 text-red-700',
  'Criminal Procedure': 'bg-orange-100 text-orange-700',
  'Family Law':         'bg-pink-100 text-pink-700',
  'Environmental Law':  'bg-green-100 text-green-700',
  'Labour & Gender Law':'bg-teal-100 text-teal-700',
  'Right to Life':      'bg-blue-100 text-blue-700',
  'Gender / Rights':    'bg-indigo-100 text-indigo-700',
  'Religion & Gender':  'bg-amber-100 text-amber-700',
  'Constitutional Law / IT': 'bg-cyan-100 text-cyan-700',
  'Constitutional Law / Rights': 'bg-rose-100 text-rose-700',
  'Freedom of Speech':  'bg-sky-100 text-sky-700',
};

export function WeeklyDigest() {
  const digests = useDigestDaily();
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const { toggle, isBookmarked } = useBookmarks();
  const j = digests[activeIdx];

  const handleCopy = useCallback(() => {
    if (!j) return;
    const text = `${j.title}\n${j.court} · ${j.date} · ${j.citation}\n\nFacts: ${j.facts}\n\nIssue: ${j.issue}\n\nHeld: ${j.held}\n\nImpact: ${j.impact}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [j]);

  const handleShare = async () => {
    if (!j) return;
    setShareBusy(true);
    try {
      const blob = await generateDigestStoryCard(j);
      if (blob) await shareFile(new File([blob], `edulaw-digest-${j.id}.png`, { type: 'image/png' }), j.title);
    } catch (_) {}
    finally { setShareBusy(false); }
  };

  if (!j) return null;

  return (
    <div className="bg-white border border-ink/10 rounded-3xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-ink/5">
        <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <p className="font-ui font-black text-sm text-ink">Daily Judgment Digest</p>
          <p className="text-[10px] font-ui text-mutedgray">{digests.length} SC &amp; HC rulings · refreshes every day</p>
        </div>
      </div>

      {/* Tab row */}
      <div className="flex gap-1 px-4 py-3 border-b border-ink/5 overflow-x-auto hide-scrollbar">
        {digests.map((item, i) => (
          <button key={item.id} onClick={() => setActiveIdx(i)}
            className={`shrink-0 px-3 py-1.5 rounded-lg font-ui text-[11px] font-bold transition-all ${activeIdx === i ? 'bg-teal-600 text-white' : 'text-ink/50 hover:bg-ink/5'}`}
          >
            {i + 1}. {item.court.toLowerCase().includes('supreme') ? 'SC' : 'HC'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-6 py-6 space-y-5">
          <div>
            <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2 ${subjectColors[j.subject] ?? 'bg-slate-100 text-slate-600'}`}>{j.subject}</span>
            <h3 className="font-display text-lg text-ink leading-snug">{j.title}</h3>
            <div className="flex flex-wrap gap-3 mt-2 text-[10px] font-ui text-mutedgray">
              <span className="flex items-center gap-1"><Gavel className="w-3 h-3" />{j.court}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{j.date}</span>
              <span>{j.citation}</span>
            </div>
          </div>

          {[
            { label: 'Facts', text: j.facts, color: 'bg-parchment/60' },
            { label: 'Issue', text: j.issue, color: 'bg-blue-50' },
            { label: 'Held', text: j.held, color: 'bg-green-50' },
            { label: 'Impact', text: j.impact, color: 'bg-gold/5 border border-gold/15' },
          ].map(({ label, text, color }) => (
            <div key={label} className={`rounded-2xl p-4 ${color}`}>
              <p className="text-[10px] font-ui font-black text-ink/40 uppercase tracking-widest mb-1.5">{label}</p>
              <p className="font-body text-sm text-ink/80 leading-relaxed">{text}</p>
            </div>
          ))}

          {/* Copy + Bookmark + Story utility row */}
          <div className="flex items-center justify-end gap-1 pt-1 flex-wrap">
            <button onClick={handleCopy} title="Copy to clipboard" className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-ink/5 transition-colors text-[11px] font-ui text-ink/50">
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={() => toggle(j.id)} title={isBookmarked(j.id) ? 'Remove bookmark' : 'Bookmark'} className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-ink/5 transition-colors text-[11px] font-ui text-ink/50">
              {isBookmarked(j.id) ? <BookMarked className="w-3.5 h-3.5 text-teal-600" /> : <Bookmark className="w-3.5 h-3.5" />}
              {isBookmarked(j.id) ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={handleShare}
              disabled={shareBusy}
              style={{ background: IG_GRADIENT }}
              className="flex items-center gap-1 px-3 py-2 rounded-xl font-ui text-[11px] font-black text-white disabled:opacity-50 active:scale-95 transition-transform"
            >
              {shareBusy ? <RefreshCw className="w-3 h-3 animate-spin" /> : <span>📱</span>}
              {shareBusy ? 'Generating…' : 'Story'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
