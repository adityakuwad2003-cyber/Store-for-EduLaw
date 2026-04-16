import type { CaseLaw } from '../data/playground/caseLaws';
import { 
  drawBaseBackground, drawBadge, wrapTextCanvas, 
  drawDivider, rrPath 
} from './playgroundShare';

/** 1080x1920 Instagram Story card for Constitution Article */
export async function generateConstitutionStoryCard(article: {
  article: string; title: string; plainLanguage: string; keyPoint: string; relatedCase: string;
}): Promise<Blob | null> {
  const W = 1080, H = 1920, PAD = 72;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const raw = canvas.getContext('2d');
  if (!raw) return null;
  const ctx: CanvasRenderingContext2D = raw;
  let Y = await drawBaseBackground(ctx, W, H);

  drawBadge(ctx, 'ARTICLE OF THE DAY', W / 2, Y + 28); Y += 84;

  ctx.fillStyle = '#C9A84C'; ctx.font = 'bold 80px Georgia, serif';
  ctx.textAlign = 'center'; ctx.fillText(article.article, W / 2, Y + 68); Y += 120;

  ctx.fillStyle = '#0D0D0D'; ctx.font = 'bold 54px Georgia, serif';
  Y = wrapTextCanvas(ctx, article.title, PAD, Y, W - PAD * 2, 72, 'center') + 48;

  drawDivider(ctx, W, Y, PAD); Y += 60;
  ctx.fillStyle = '#C9A84C'; ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'left'; ctx.fillText('IN PLAIN LANGUAGE', PAD, Y); Y += 52;
  ctx.fillStyle = '#0D0D0D'; ctx.font = '38px Arial, sans-serif';
  Y = wrapTextCanvas(ctx, article.plainLanguage, PAD, Y, W - PAD * 2, 60) + 48;

  drawDivider(ctx, W, Y, PAD); Y += 60;
  ctx.fillStyle = '#C9A84C'; ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'left'; ctx.fillText('KEY POINT', PAD, Y); Y += 52;
  ctx.fillStyle = '#C9A84C'; ctx.font = '36px Arial, sans-serif';
  Y = wrapTextCanvas(ctx, article.keyPoint, PAD, Y, W - PAD * 2, 56) + 36;

  ctx.fillStyle = 'rgba(13,13,13,0.50)'; ctx.font = 'italic 30px Georgia, serif';
  Y = wrapTextCanvas(ctx, article.relatedCase, PAD, Y, W - PAD * 2, 46) + 24;

  ctx.fillStyle = 'rgba(13,13,13,0.35)'; ctx.font = '26px Arial, sans-serif';
  ctx.textAlign = 'center'; ctx.fillText('Explore more at theedulaw.in', W / 2, Math.min(Y + 60, H - 90));
  return new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b), 'image/png'));
}

/** 1080x1920 Instagram Story card for Legal Maxim */
export async function generateMaximStoryCard(maxim: {
  maxim: string; origin: string; meaning: string; usage: string; memoryHook: string;
}): Promise<Blob | null> {
  const W = 1080, H = 1920, PAD = 72;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const raw = canvas.getContext('2d');
  if (!raw) return null;
  const ctx: CanvasRenderingContext2D = raw;
  let Y = await drawBaseBackground(ctx, W, H);

  drawBadge(ctx, 'LEGAL MAXIM', W / 2, Y + 28); Y += 84;

  ctx.font = 'bold 24px Arial, sans-serif';
  const ow = ctx.measureText(maxim.origin).width + 40;
  ctx.fillStyle = 'rgba(201,168,76,0.18)';
  rrPath(ctx, W / 2 - ow / 2, Y - 30, ow, 50, 25); ctx.fill();
  ctx.fillStyle = '#C9A84C'; ctx.textAlign = 'center';
  ctx.fillText(maxim.origin, W / 2, Y + 4); Y += 68;

  ctx.fillStyle = '#C9A84C'; ctx.font = 'italic bold 56px Georgia, serif';
  Y = wrapTextCanvas(ctx, `\u201C${maxim.maxim}\u201D`, PAD, Y + 20, W - PAD * 2, 78, 'center') + 52;

  drawDivider(ctx, W, Y, PAD); Y += 60;
  ctx.fillStyle = '#C9A84C'; ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'left'; ctx.fillText('MEANING', PAD, Y); Y += 52;
  ctx.fillStyle = '#0D0D0D'; ctx.font = '40px Arial, sans-serif';
  Y = wrapTextCanvas(ctx, maxim.meaning, PAD, Y, W - PAD * 2, 62) + 52;

  drawDivider(ctx, W, Y, PAD); Y += 60;
  ctx.fillStyle = '#C9A84C'; ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'left'; ctx.fillText('USAGE IN LAW', PAD, Y); Y += 52;
  ctx.fillStyle = 'rgba(13,13,13,0.70)'; ctx.font = '36px Arial, sans-serif';
  Y = wrapTextCanvas(ctx, maxim.usage, PAD, Y, W - PAD * 2, 56) + 48;

  const hookTop = Math.min(Y, H - 340);
  const hookH = 170;
  ctx.fillStyle = 'rgba(201,168,76,0.12)';
  rrPath(ctx, PAD, hookTop, W - PAD * 2, hookH, 20); ctx.fill();
  ctx.strokeStyle = 'rgba(201,168,76,0.35)'; ctx.lineWidth = 1;
  rrPath(ctx, PAD, hookTop, W - PAD * 2, hookH, 20); ctx.stroke();
  ctx.fillStyle = '#C9A84C'; ctx.font = 'bold 22px Arial, sans-serif';
  ctx.textAlign = 'left'; ctx.fillText('\uD83D\uDCA1  MEMORY HOOK', PAD + 28, hookTop + 44);
  ctx.fillStyle = 'rgba(13,13,13,0.70)'; ctx.font = 'italic 30px Georgia, serif';
  wrapTextCanvas(ctx, maxim.memoryHook, PAD + 28, hookTop + 94, W - PAD * 2 - 56, 46);
  Y = hookTop + hookH + 48;

  ctx.fillStyle = 'rgba(13,13,13,0.35)'; ctx.font = '26px Arial, sans-serif';
  ctx.textAlign = 'center'; ctx.fillText('Explore more at theedulaw.in', W / 2, Math.min(Y, H - 90));
  return new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b), 'image/png'));
}

/** 1080x1920 Instagram Story card for Case Law */
export async function generateCaseLawStoryCard(c: CaseLaw): Promise<Blob | null> {
  const W = 1080, H = 1920, PAD = 72;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const raw = canvas.getContext('2d');
  if (!raw) return null;
  const ctx: CanvasRenderingContext2D = raw;
  let Y = await drawBaseBackground(ctx, W, H);

  drawBadge(ctx, 'CASE LAW', W / 2, Y + 28); Y += 84;

  ctx.fillStyle = '#C9A84C'; ctx.font = 'bold 54px Georgia, serif';
  Y = wrapTextCanvas(ctx, c.name, PAD, Y + 10, W - PAD * 2, 74, 'center') + 32;

  ctx.fillStyle = 'rgba(13,13,13,0.55)'; ctx.font = '32px Arial, sans-serif';
  ctx.textAlign = 'center'; ctx.fillText(`${c.court}  ·  ${c.year}`, W / 2, Y); Y += 58;

  ctx.font = 'bold 26px Arial, sans-serif';
  const cw = ctx.measureText(c.citation).width + 48;
  ctx.fillStyle = 'rgba(201,168,76,0.15)';
  rrPath(ctx, W / 2 - cw / 2, Y - 32, cw, 56, 28); ctx.fill();
  ctx.fillStyle = '#C9A84C'; ctx.textAlign = 'center';
  ctx.fillText(c.citation, W / 2, Y + 6); Y += 72;

  drawDivider(ctx, W, Y, PAD); Y += 60;
  ctx.fillStyle = '#C9A84C'; ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'left'; ctx.fillText('RATIO DECIDENDI', PAD, Y); Y += 52;
  ctx.fillStyle = '#0D0D0D'; ctx.font = '38px Arial, sans-serif';
  Y = wrapTextCanvas(ctx, c.ratio, PAD, Y, W - PAD * 2, 58) + 48;

  drawDivider(ctx, W, Y, PAD); Y += 60;
  ctx.fillStyle = '#C9A84C'; ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'left'; ctx.fillText('SIGNIFICANCE', PAD, Y); Y += 52;
  ctx.fillStyle = 'rgba(13,13,13,0.70)'; ctx.font = '34px Arial, sans-serif';
  Y = wrapTextCanvas(ctx, c.significance, PAD, Y, W - PAD * 2, 52) + 48;

  ctx.fillStyle = 'rgba(13,13,13,0.35)'; ctx.font = '26px Arial, sans-serif';
  ctx.textAlign = 'center'; ctx.fillText('Explore more at theedulaw.in', W / 2, Math.min(Y + 60, H - 90));

  return new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b), 'image/png'));
}

/** 1080x1920 Instagram Story card for Daily News */
export async function generateNewsStoryCard(news: {
  title: string; court: string; summary: string; dateString: string; category: string;
}): Promise<Blob | null> {
  const W = 1080, H = 1920, PAD = 72;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const raw = canvas.getContext('2d');
  if (!raw) return null;
  const ctx: CanvasRenderingContext2D = raw;
  let Y = await drawBaseBackground(ctx, W, H);

  drawBadge(ctx, `LEGAL NEWS — ${news.court.toUpperCase()}`, W / 2, Y + 28); Y += 84;

  ctx.fillStyle = '#0D0D0D'; ctx.font = 'bold 58px Georgia, serif';
  Y = wrapTextCanvas(ctx, news.title, PAD, Y + 10, W - PAD * 2, 78, 'center') + 52;

  ctx.fillStyle = 'rgba(13,13,13,0.45)'; ctx.font = '30px Arial, sans-serif';
  ctx.textAlign = 'center'; ctx.fillText(`${news.dateString}  ·  ${news.category}`, W / 2, Y); Y += 68;

  drawDivider(ctx, W, Y, PAD); Y += 60;
  ctx.fillStyle = '#C9A84C'; ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'left'; ctx.fillText('THE SUMMARY', PAD, Y); Y += 52;
  ctx.fillStyle = '#0D0D0D'; ctx.font = '42px Arial, sans-serif';
  Y = wrapTextCanvas(ctx, news.summary, PAD, Y, W - PAD * 2, 64) + 60;

  drawDivider(ctx, W, Y, PAD); Y += 60;
  
  // EduLaw Promo at bottom
  const promoH = 140;
  const promoY = H - 320;
  ctx.fillStyle = 'rgba(201,168,76,0.1)';
  rrPath(ctx, PAD, promoY, W - PAD * 2, promoH, 16); ctx.fill();
  
  ctx.fillStyle = '#C9A84C'; ctx.font = 'bold 28px Arial, sans-serif';
  ctx.textAlign = 'center'; ctx.fillText('GET DETAILED NOTES & TEMPLATES', W/2, promoY + 60);
  ctx.font = 'italic 34px Georgia, serif'; ctx.fillStyle = '#8B1D1D';
  ctx.fillText('www.theedulaw.in', W/2, promoY + 108);

  ctx.fillStyle = 'rgba(13,13,13,0.35)'; ctx.font = '26px Arial, sans-serif';
  ctx.textAlign = 'center'; ctx.fillText('Visit Law Playground for more tools', W / 2, H - 90);

  return new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b), 'image/png'));
}
