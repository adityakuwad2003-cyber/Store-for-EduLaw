import { 
  drawBaseBackground, 
  drawBadge, 
  drawDivider, 
  wrapTextCanvas, 
  shareFile 
} from './playgroundShare';

export interface LegalNewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  court: string;
  summary: string;
  publishedAt: string;
  dateString: string;
  category: string;
}

/** 
 * Generates a 1080x1920 (9:16) Instagram Story card for a legal news item.
 * Exactly follows the premium off-white design requested.
 */
export async function generateNewsStoryCard(item: LegalNewsItem): Promise<Blob | null> {
  const W = 1080, H = 1920, PAD = 80;
  // Reserve bottom 140px for footer band
  const FOOTER_TOP = H - 140;

  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const raw = canvas.getContext('2d');
  if (!raw) return null;
  const ctx = raw as CanvasRenderingContext2D;

  // ── Background ──────────────────────────────────────────────────────────────
  // Paper-cream base
  ctx.fillStyle = '#F9F7F2';
  ctx.fillRect(0, 0, W, H);

  // Textured radial gradient — top-left warm gold
  const g1 = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 1.1);
  g1.addColorStop(0, 'rgba(201,168,76,0.13)');
  g1.addColorStop(0.6, 'rgba(201,168,76,0.04)');
  g1.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);

  // Bottom-right burgundy glow
  const g2 = ctx.createRadialGradient(W, H, 0, W, H, W * 0.9);
  g2.addColorStop(0, 'rgba(107,30,46,0.10)');
  g2.addColorStop(0.5, 'rgba(107,30,46,0.04)');
  g2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);

  // Diagonal grain stripes (subtle texture)
  ctx.save();
  ctx.globalAlpha = 0.025;
  ctx.strokeStyle = '#6B1E2E';
  ctx.lineWidth = 1;
  for (let x = -H; x < W + H; x += 28) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + H, H); ctx.stroke();
  }
  ctx.restore();

  // Top gold accent bar (thicker, gradient)
  const topBar = ctx.createLinearGradient(0, 0, W, 0);
  topBar.addColorStop(0, '#6B1E2E');
  topBar.addColorStop(0.5, '#C9A84C');
  topBar.addColorStop(1, '#6B1E2E');
  ctx.fillStyle = topBar; ctx.fillRect(0, 0, W, 18);

  // ── Header (logo + EDULAW) ───────────────────────────────────────────────────
  let Y = await drawBaseBackground(ctx, W, H);

  // ── Badge ────────────────────────────────────────────────────────────────────
  if (Y < FOOTER_TOP - 76) {
    drawBadge(ctx, 'DAILY LEGAL UPDATE', W / 2, Y + 28);
    Y += 80;
  }

  // ── Court pill ──────────────────────────────────────────────────────────────
  if (Y < FOOTER_TOP - 60) {
    const isSC = item.court === 'Supreme Court';
    const isTribunal = item.court === 'Tribunal';
    let pillColor = '#0D7377'; // default for HC
    if (isSC) pillColor = '#6B1E2E';
    if (isTribunal) pillColor = '#6d28d9'; // purple for tribunal

    ctx.fillStyle = pillColor;
    const pillW = 340, pillH = 48, pillR = 24;
    const pillX = W / 2 - pillW / 2;
    ctx.beginPath();
    ctx.roundRect(pillX, Y, pillW, pillH, pillR);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.court.toUpperCase(), W / 2, Y + 31);
    Y += 68;
  }

  // ── Category chip ────────────────────────────────────────────────────────────
  if (Y < FOOTER_TOP - 52) {
    ctx.font = 'bold 20px Arial, sans-serif';
    const chipW = Math.min(ctx.measureText(item.category).width + 48, W - PAD * 2);
    ctx.fillStyle = 'rgba(201,168,76,0.18)';
    ctx.beginPath();
    ctx.roundRect(W / 2 - chipW / 2, Y, chipW, 40, 20);
    ctx.fill();
    ctx.fillStyle = '#9A7A20';
    ctx.textAlign = 'center';
    ctx.fillText(item.category, W / 2, Y + 26);
    Y += 60;
  }

  drawDivider(ctx, W, Y, PAD);
  Y += 52;

  // ── Headline ─────────────────────────────────────────────────────────────────
  if (Y < FOOTER_TOP - 80) {
    ctx.fillStyle = '#1A1A1A';
    ctx.font = 'bold 52px Georgia, serif';
    ctx.textAlign = 'center';
    const headlineBottom = wrapTextCanvas(ctx, item.title, PAD, Y, W - PAD * 2, 72, 'center');
    Y = headlineBottom + 40;
  }

  if (Y < FOOTER_TOP - 60) {
    drawDivider(ctx, W, Y, PAD);
    Y += 48;
  }

  // ── Summary label ────────────────────────────────────────────────────────────
  if (Y < FOOTER_TOP - 100) {
    ctx.fillStyle = '#C9A84C';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('KEY DEVELOPMENT', PAD, Y);
    Y += 52;

    const summaryMaxH = FOOTER_TOP - Y - 30;
    const lineH = 64;
    const maxLines = Math.floor(summaryMaxH / lineH);
    if (maxLines >= 1) {
      ctx.fillStyle = 'rgba(26,26,26,0.82)';
      ctx.font = '42px Arial, sans-serif';
      ctx.textAlign = 'left';
      // Truncate summary text to fit
      const charPerLine = Math.floor((W - PAD * 2) / (42 * 0.52));
      const maxChars = maxLines * charPerLine;
      const summaryText = item.summary.length > maxChars
        ? item.summary.slice(0, maxChars - 1) + '…'
        : item.summary;
      Y = wrapTextCanvas(ctx, summaryText, PAD, Y, W - PAD * 2, lineH);
    }
  }

  // ── Footer band ───────────────────────────────────────────────────────────
  const footerGrad = ctx.createLinearGradient(0, FOOTER_TOP - 30, 0, H);
  footerGrad.addColorStop(0, 'rgba(249,247,242,0)');
  footerGrad.addColorStop(0.35, 'rgba(26,16,10,0.70)');
  footerGrad.addColorStop(1, 'rgba(20,12,8,0.92)');
  ctx.fillStyle = footerGrad;
  ctx.fillRect(0, FOOTER_TOP - 30, W, H - FOOTER_TOP + 30);

  const bottomBar = ctx.createLinearGradient(0, 0, W, 0);
  bottomBar.addColorStop(0, '#C9A84C');
  bottomBar.addColorStop(0.5, '#E8C97A');
  bottomBar.addColorStop(1, '#C9A84C');
  ctx.fillStyle = bottomBar;
  ctx.fillRect(0, H - 18, W, 18);

  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  ctx.font = 'bold 28px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('EduLaw Daily Digest', W / 2, FOOTER_TOP + 42);
  ctx.fillStyle = 'rgba(232,201,122,0.95)';
  ctx.font = '22px Arial, sans-serif';
  ctx.fillText(dateStr, W / 2, FOOTER_TOP + 72);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '20px Arial, sans-serif';
  ctx.fillText('theedulaw.in/legal-news-feed', W / 2, FOOTER_TOP + 100);

  return new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b), 'image/png'));
}

/** Utility to share the generated card */
export async function shareNewsStoryAction(item: LegalNewsItem, setShareBusy: (b: boolean) => void) {
  setShareBusy(true);
  try {
    const blob = await generateNewsStoryCard(item);
    if (blob) {
      const file = new File([blob], `edulaw-news-${item.id}.png`, { type: 'image/png' });
      await shareFile(file, `EduLaw News: ${item.title}`);
    }
  } catch (err) {
    console.error('IG Story Share Error:', err);
  } finally {
    setShareBusy(false);
  }
}
