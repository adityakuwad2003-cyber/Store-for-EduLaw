/**
 * Shared canvas utilities for Legal Playground Instagram Story generators.
 * Used by sub-components (ConstitutionArticleCard, LegalMaximCard, QuizOfTheDay).
 */

export const IG_GRADIENT =
  'linear-gradient(135deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)';

/** Rounded-rectangle path — no roundRect API needed */
export function rrPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  const R = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + R, y);
  ctx.lineTo(x + w - R, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + R);
  ctx.lineTo(x + w, y + h - R);
  ctx.quadraticCurveTo(x + w, y + h, x + w - R, y + h);
  ctx.lineTo(x + R, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - R);
  ctx.lineTo(x, y + R);
  ctx.quadraticCurveTo(x, y, x + R, y);
  ctx.closePath();
}

/** Word-wrap text on canvas. Returns the Y position after the last line. */
export function wrapTextCanvas(
  ctx: CanvasRenderingContext2D,
  text: string, x: number, y: number,
  maxW: number, lineH: number,
  align: CanvasTextAlign = 'left',
): number {
  ctx.textAlign = align;
  const drawX = align === 'center' ? x + maxW / 2 : x;
  const words = text.split(' ');
  let line = '';
  let cy = y;
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxW && line !== '') {
      ctx.fillText(line.trim(), drawX, cy);
      line = word + ' ';
      cy += lineH;
    } else {
      line = test;
    }
  }
  if (line.trim()) { ctx.fillText(line.trim(), drawX, cy); cy += lineH; }
  return cy;
}

/** Load a cross-origin image for canvas. Returns null on failure. */
export async function loadCanvasImage(src: string): Promise<HTMLImageElement | null> {
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  } catch {
    return null;
  }
}

/** Share a File via Web Share API; falls back to download. */
export async function shareFile(file: File, title: string): Promise<void> {
  const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title } as ShareData);
  } else {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url; a.download = file.name;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

/** Draw a gold pill badge centered at (cx, baselineY). */
export function drawBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  baselineY: number,
  bgColor = 'rgba(107,30,46,0.08)',
  textColor = '#6B1E2E',
) {
  ctx.font = 'bold 26px Arial, sans-serif';
  const tw = ctx.measureText(text).width;
  const bh = 52, bw = tw + 52, r = 26;
  rrPath(ctx, cx - bw / 2, baselineY - bh / 2 - 6, bw, bh, r);
  ctx.fillStyle = bgColor;
  ctx.fill();
  ctx.strokeStyle = 'rgba(107,30,46,0.20)';
  ctx.lineWidth = 1.5;
  rrPath(ctx, cx - bw / 2, baselineY - bh / 2 - 6, bw, bh, r);
  ctx.stroke();
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.fillText(text, cx, baselineY);
}

/** Draw a faded gold horizontal divider line. */
export function drawDivider(
  ctx: CanvasRenderingContext2D,
  W: number, y: number, PAD: number,
) {
  const dg = ctx.createLinearGradient(PAD, 0, W - PAD, 0);
  dg.addColorStop(0, 'rgba(201,168,76,0)');
  dg.addColorStop(0.5, 'rgba(201,168,76,0.28)');
  dg.addColorStop(1, 'rgba(201,168,76,0)');
  ctx.strokeStyle = dg;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(W - PAD, y);
  ctx.stroke();
}

/**
 * Draws the standard EduLaw dark background, gold accent bars, logo, EDULAW text,
 * tagline, and divider. Returns the Y coordinate where content should start.
 */
export async function drawBaseBackground(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
): Promise<number> {
  // Off-white background
  ctx.fillStyle = '#F8F8F6';
  ctx.fillRect(0, 0, W, H);

  // Subtle warm tint overlay (top-left)
  const g1 = ctx.createRadialGradient(W * 0.1, H * 0.05, 0, W * 0.1, H * 0.05, W * 0.8);
  g1.addColorStop(0, 'rgba(201,168,76,0.06)');
  g1.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);

  // Subtle burgundy tint (bottom-right)
  const g2 = ctx.createRadialGradient(W * 0.9, H * 0.95, 0, W * 0.9, H * 0.95, W * 0.6);
  g2.addColorStop(0, 'rgba(107,30,46,0.04)');
  g2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);

  // Gold gradient for accent bars
  const gold = ctx.createLinearGradient(0, 0, W, 0);
  gold.addColorStop(0, '#C9A84C');
  gold.addColorStop(0.5, '#E8C97A');
  gold.addColorStop(1, '#C9A84C');

  // Accent bars
  ctx.fillStyle = gold; ctx.fillRect(0, 0, W, 14);
  ctx.fillStyle = gold; ctx.fillRect(0, H - 14, W, 14);

  // Logo
  let Y = 56;
  const logo = await loadCanvasImage('/images/edulaw-logo.png');
  if (logo) {
    const S = 110;
    ctx.drawImage(logo, W / 2 - S / 2, Y, S, S);
    Y += S + 16;
  } else {
    Y += 24;
  }

  // EDULAW
  ctx.fillStyle = '#6B1E2E';
  ctx.font = 'bold 52px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('EDULAW', W / 2, Y + 42);
  Y += 74;

  // Tagline
  ctx.fillStyle = 'rgba(107,30,46,0.50)';
  ctx.font = '26px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('\u2696  theedulaw.in', W / 2, Y + 8);
  Y += 52;

  // Divider
  drawDivider(ctx, W, Y, 80);
  Y += 44;

  return Y;
}
