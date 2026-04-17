import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Note } from '@/types';

// ── Brand palette ─────────────────────────────────────────────────────────────
const B = {
  navy:    '#1A365D',
  navyDk:  '#0d1f3c',
  navyMid: '#142a4f',
  crimson: '#8B1538',
  gold:    '#D4AF37',
  offWhite:'#FAF9F6',
  charcoal:'#2D3748',
  slate:   '#4A5568',
  pale:    '#EDF2F7',
};

// ── Category colours ──────────────────────────────────────────────────────────
const CAT: Record<string, { bg: string; text: string; border: string }> = {
  'Criminal Law':       { bg:'#FEF2F2', text:'#DC2626', border:'#FCA5A5' },
  'Constitutional Law': { bg:'#F5F3FF', text:'#7C3AED', border:'#C4B5FD' },
  'Civil Law':          { bg:'#F0FDF4', text:'#059669', border:'#6EE7B7' },
  'Corporate Law':      { bg:'#EFF6FF', text:'#2563EB', border:'#93C5FD' },
  'Family Law':         { bg:'#FDF2F8', text:'#DB2777', border:'#F9A8D4' },
  'Special Acts':       { bg:'#FFF7ED', text:'#EA580C', border:'#FDC9A5' },
  'Public Law':         { bg:'#F0F9FF', text:'#0891B2', border:'#7DD3FC' },
  'Foundation':         { bg:'#F9FAFB', text:'#4B5563', border:'#D1D5DB' },
  'Evidence':           { bg:'#FFF7ED', text:'#7C2D12', border:'#FCA5A5' },
  'Criminal Procedure': { bg:'#FEF2F2', text:'#991B1B', border:'#FECACA' },
  'Drafting':           { bg:'#F0FDF4', text:'#065F46', border:'#6EE7B7' },
  'ADR':                { bg:'#EEF2FF', text:'#4338CA', border:'#C7D2FE' },
  'International Law':  { bg:'#EFF6FF', text:'#1E40AF', border:'#BFDBFE' },
};
const catColor = (c: string) => CAT[c] ?? { bg:'#F9FAFB', text:'#6B7280', border:'#E5E7EB' };

// ── Canvas helpers ────────────────────────────────────────────────────────────
function rr(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y); ctx.quadraticCurveTo(x + w, y,     x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad); ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h); ctx.quadraticCurveTo(x,     y + h, x,     y + h - rad);
  ctx.lineTo(x, y + rad); ctx.quadraticCurveTo(x,     y,     x + rad, y);
  ctx.closePath();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; }
    else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

// Letter-spaced centred text
function spacedCenter(
  ctx: CanvasRenderingContext2D,
  text: string, cx: number, y: number, sp: number,
) {
  let total = 0;
  for (const ch of text) total += ctx.measureText(ch).width + sp;
  total -= sp;
  let x = cx - total / 2;
  for (const ch of text) { ctx.fillText(ch, x, y); x += ctx.measureText(ch).width + sp; }
}

const noShadow = (ctx: CanvasRenderingContext2D) => {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
};

// ── Load fonts + logo ─────────────────────────────────────────────────────────
async function loadAssets(): Promise<HTMLImageElement> {
  if (!document.getElementById('el-story-fonts')) {
    const link = document.createElement('link');
    link.id   = 'el-story-fonts';
    link.rel  = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,400&family=Montserrat:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(link);
  }

  const [logo] = await Promise.all([
    new Promise<HTMLImageElement>((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = '/images/edulaw-logo.png';
    }),
    Promise.race([
      Promise.all([
        document.fonts.load("800 48px 'Playfair Display'"),
        document.fonts.load("700 24px 'Montserrat'"),
      ]),
      new Promise(r => setTimeout(r, 2500)),
    ]),
  ]);
  return logo;
}

// ── Master canvas drawing ─────────────────────────────────────────────────────
//
//  LAYOUT (all y values are FIXED — nothing is dynamic or accumulated)
//
//  S1 Brand header   y=0      h=280   navy gradient
//  S2 Card preview   y=280    h=340   offWhite
//  S3 Separator      y=620    h=40    gold accent
//  S4 Note details   y=660    h=540   offWhite
//  S5 Price          y=1200   h=260   white
//  S6 CTA            y=1460   h=240   navy gradient
//  S7 Footer         y=1700   h=220   dark navy gradient
//  ─────────────────────────────────  = 1920
//
async function drawStory(note: Note): Promise<HTMLCanvasElement> {
  const logo   = await loadAssets();
  const colors = catColor(note.category);
  const saving =
    note.originalPrice && note.originalPrice > note.price
      ? Math.round(((note.originalPrice - note.price) / note.originalPrice) * 100)
      : null;
  const rawFeatures = (note.contentFeatures ?? []).filter(Boolean);
  const fallbackFeatures = [
    `${note.totalPages}+ pages of curated content`,
    'Includes landmark case laws & judgments',
    'Structured for judicial exam preparation',
  ];
  const features = (rawFeatures.length > 0 ? rawFeatures : fallbackFeatures).slice(0, 3);
  const lang     = note.language === 'Both' ? 'English + Hindi' : (note.language ?? 'English');
  const domain   = window.location.host;

  const W = 1080, H = 1920;
  const PAD = 60;       // horizontal padding for details sections
  const cv  = document.createElement('canvas');
  cv.width  = W; cv.height = H;
  const c   = cv.getContext('2d', { alpha: false })!;

  // ── S1 BRAND HEADER (0–280) ──────────────────────────────────────────────
  {
    const g = c.createLinearGradient(0, 0, W, 280);
    g.addColorStop(0,   '#0d1f3c');
    g.addColorStop(0.5,  B.navy);
    g.addColorStop(1,   '#111827');
    c.fillStyle = g;
    c.fillRect(0, 0, W, 280);
  }
  // gold radial glow at top
  {
    const g = c.createRadialGradient(W/2, 0, 0, W/2, 0, W * 0.6);
    g.addColorStop(0, 'rgba(212,175,55,0.13)');
    g.addColorStop(1, 'rgba(212,175,55,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, 280);
  }

  // logo card — centered, y=12, 96×96 (bottom=108, clear of text below)
  const lcS = 96, lcX = (W - lcS) / 2, lcY = 12;
  c.shadowColor = 'rgba(0,0,0,0.4)'; c.shadowBlur = 32; c.shadowOffsetY = 8;
  rr(c, lcX, lcY, lcS, lcS, 18);
  c.fillStyle = B.offWhite; c.fill();
  noShadow(c);
  c.drawImage(logo, lcX + 7, lcY + 7, lcS - 14, lcS - 14);

  // "THE EDULAW"  — baseline y=168  (top of caps ≈138, logo bottom=108 → 30px gap)
  c.fillStyle = B.gold;
  c.font = "800 40px 'Playfair Display', Georgia, serif";
  c.textAlign = 'center';
  spacedCenter(c, 'THE EDULAW', W / 2, 168, 3.5);

  // tagline — y=196
  c.fillStyle = 'rgba(212,175,55,0.65)';
  c.font = "600 14px 'Montserrat', Arial, sans-serif";
  c.fillText('Master Every Law. Own Every Note.', W / 2, 196);

  // rating — y=220
  c.fillStyle = 'rgba(212,175,55,0.50)';
  c.font = "600 13px 'Montserrat', Arial, sans-serif";
  c.fillText('★★★★★  4.9  ·  50,000+ Students', W / 2, 220);

  // gold separator line — y=272
  {
    const g = c.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0,   'rgba(212,175,55,0)');
    g.addColorStop(0.5, 'rgba(212,175,55,0.4)');
    g.addColorStop(1,   'rgba(212,175,55,0)');
    c.strokeStyle = g; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(60, 272); c.lineTo(W - 60, 272); c.stroke();
  }

  // ── S2 MARKETPLACE PREVIEW (280–620) ─────────────────────────────────────
  c.fillStyle = B.offWhite;
  c.fillRect(0, 280, W, 340);

  // subtle grid overlay
  c.strokeStyle = 'rgba(26,54,93,0.04)'; c.lineWidth = 1;
  for (let x = 0; x <= W; x += 44) { c.beginPath(); c.moveTo(x, 280); c.lineTo(x, 620); c.stroke(); }
  for (let y = 280; y <= 620; y += 44) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }

  // "FROM THE MARKETPLACE" label — baseline y=312
  c.fillStyle = 'rgba(26,54,93,0.38)';
  c.font = "700 12px 'Montserrat', Arial, sans-serif";
  c.textAlign = 'center';
  spacedCenter(c, 'FROM THE MARKETPLACE', W / 2, 312, 2.5);

  // browser bar — top y=326, height 30
  const bBarY = 326;
  const browserDots: [string, number][] = [['#FF5F57', 66], ['#FFBD2E', 100], ['#28CA41', 134]];
  browserDots.forEach(([col, cx]) => {
    c.beginPath(); c.arc(cx, bBarY + 15, 9, 0, Math.PI * 2);
    c.fillStyle = col; c.fill();
  });
  rr(c, 158, bBarY, W - 200, 30, 15);
  c.fillStyle = 'white'; c.fill();
  c.strokeStyle = '#E2E8F0'; c.lineWidth = 1.5; c.stroke();
  c.fillStyle = '#A0AEC0';
  c.font = "500 12px 'Montserrat', Arial, sans-serif";
  c.textAlign = 'left';
  c.fillText(`${domain}/product/${note.slug}`, 178, bBarY + 20);

  // note card — y=368, height=240  (bottom=608, 12px margin before section end 620)
  const CX = 44, CY = 368, CW = W - 88, CH = 240;
  c.shadowColor = 'rgba(26,54,93,0.14)'; c.shadowBlur = 24; c.shadowOffsetX = 4; c.shadowOffsetY = 10;
  rr(c, CX, CY, CW, CH, 22);
  c.fillStyle = 'white'; c.fill();
  noShadow(c);

  // crimson left accent bar
  rr(c, CX, CY, 8, CH, 4); c.fillStyle = B.crimson; c.fill();

  // category badge — FIXED: top=CY+18, height=30, text baseline=CY+38
  {
    c.font = "700 15px 'Montserrat', Arial, sans-serif";
    const bW = c.measureText(note.category).width + 28;
    rr(c, CX + 20, CY + 18, bW, 30, 15);
    c.fillStyle = colors.bg; c.fill();
    c.strokeStyle = colors.border; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = colors.text; c.textAlign = 'left';
    c.fillText(note.category, CX + 34, CY + 38);
    if (note.isNew) {
      const nX = CX + 20 + bW + 10;
      const nW = c.measureText('NEW').width + 20;
      rr(c, nX, CY + 18, nW, 30, 15);
      c.fillStyle = B.gold; c.fill();
      c.fillStyle = B.navyDk;
      c.fillText('NEW', nX + 10, CY + 38);
    }
  }

  // title — max 2 lines, FIXED baselines: CY+80, CY+110
  {
    c.font = "700 26px 'Playfair Display', Georgia, serif";
    c.fillStyle = B.navy;
    const lines = wrap(c, note.title, CW - 80).slice(0, 2);
    lines.forEach((l, i) => c.fillText(l, CX + 20, CY + 80 + i * 32));
  }

  // divider — FIXED y=CY+126
  c.strokeStyle = '#EDF2F7'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(CX + 20, CY + 126); c.lineTo(CX + CW - 20, CY + 126); c.stroke();

  // price — FIXED baseline y=CY+166
  {
    c.font = "800 34px 'Playfair Display', Georgia, serif";
    c.fillStyle = B.navy;
    c.textAlign = 'left';
    c.fillText(`₹${note.price}`, CX + 20, CY + 166);
    const pW = c.measureText(`₹${note.price}`).width;

    if (note.originalPrice && note.originalPrice > note.price) {
      c.font = "500 20px 'Montserrat', Arial, sans-serif";
      c.fillStyle = '#A0AEC0';
      const opX = CX + 20 + pW + 12;
      c.fillText(`₹${note.originalPrice}`, opX, CY + 166);
      const opW = c.measureText(`₹${note.originalPrice}`).width;
      c.strokeStyle = '#A0AEC0'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(opX, CY + 152); c.lineTo(opX + opW, CY + 152); c.stroke();
    }
    if (saving) {
      c.font = "700 14px 'Montserrat', Arial, sans-serif";
      const sbW = c.measureText(`SAVE ${saving}%`).width + 20;
      rr(c, CX + CW - sbW - 20, CY + 148, sbW, 26, 7);
      c.fillStyle = B.crimson; c.fill();
      c.fillStyle = 'white'; c.textAlign = 'right';
      c.fillText(`SAVE ${saving}%`, CX + CW - 20 - 10, CY + 166);
      c.textAlign = 'left';
    }
  }

  // "Add to Cart" button — FIXED: top=CY+196, height=32
  rr(c, CX + 20, CY + 196, CW - 40, 32, 10);
  c.fillStyle = B.crimson; c.fill();
  c.fillStyle = 'white';
  c.font = "700 14px 'Montserrat', Arial, sans-serif";
  c.textAlign = 'center';
  c.fillText('Add to Cart →', CX + 20 + (CW - 40) / 2, CY + 217);
  c.textAlign = 'left';

  // ── S3 SEPARATOR (620–660) ────────────────────────────────────────────────
  {
    const g = c.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0,    B.offWhite);
    g.addColorStop(0.15, 'rgba(212,175,55,0.12)');
    g.addColorStop(0.5,  'rgba(212,175,55,0.28)');
    g.addColorStop(0.85, 'rgba(212,175,55,0.12)');
    g.addColorStop(1,    B.offWhite);
    c.fillStyle = g;
    c.fillRect(0, 620, W, 40);
  }
  // crimson lines + gold diamond centred at y=640
  c.fillStyle = B.crimson;
  c.fillRect(W / 2 - 120, 638, 72, 3);
  c.fillRect(W / 2 + 48,  638, 72, 3);
  c.save(); c.translate(W / 2, 639); c.rotate(Math.PI / 4);
  c.fillStyle = B.gold; c.fillRect(-7, -7, 14, 14); c.restore();
  // label — baseline y=646
  c.fillStyle = B.charcoal;
  c.font = "700 12px 'Montserrat', Arial, sans-serif";
  c.textAlign = 'center';
  spacedCenter(c, 'NOTE DETAILS', W / 2, 646, 3);

  // ── S4 NOTE DETAILS (660–1200) ────────────────────────────────────────────
  c.fillStyle = B.offWhite;
  c.fillRect(0, 660, W, 540);
  // navy left accent strip
  c.fillStyle = B.navy;
  c.fillRect(0, 660, 6, 540);

  // category badge — FIXED: top=682, height=36, text baseline=706
  {
    c.font = "700 17px 'Montserrat', Arial, sans-serif";
    const bW = c.measureText(note.category).width + 40;
    rr(c, PAD, 682, bW, 36, 18);
    c.fillStyle = colors.bg; c.fill();
    c.strokeStyle = colors.border; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = colors.text; c.textAlign = 'left';
    c.fillText(note.category, PAD + 20, 706);
  }

  // title — Playfair 800 52px, max 2 lines, FIXED baselines: 754, 808
  {
    c.font = "800 52px 'Playfair Display', Georgia, serif";
    c.fillStyle = B.navy;
    const lines = wrap(c, note.title, W - PAD * 2).slice(0, 2);
    lines.forEach((l, i) => c.fillText(l, PAD, 754 + i * 54));
  }

  // description — Montserrat italic 20px, max 2 lines, FIXED baselines: 848, 880
  {
    c.font = "italic 400 20px 'Montserrat', Arial, sans-serif";
    c.fillStyle = B.slate;
    const lines = wrap(c, note.description ?? '', W - PAD * 2).slice(0, 2);
    lines.forEach((l, i) => c.fillText(l, PAD, 848 + i * 32));
  }

  // gold divider — FIXED y=916
  {
    const g = c.createLinearGradient(PAD, 0, W - PAD, 0);
    g.addColorStop(0,   B.gold);
    g.addColorStop(0.5, 'rgba(212,175,55,0.3)');
    g.addColorStop(1,   'rgba(212,175,55,0)');
    c.strokeStyle = g; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(PAD, 916); c.lineTo(W - PAD, 916); c.stroke();
  }

  // feature bullets — 3 rows at FIXED y centres: 958, 1006, 1054
  const featCentres = [958, 1006, 1054];
  features.forEach((feat, i) => {
    const fy = featCentres[i];
    // crimson circle
    c.beginPath(); c.arc(PAD + 16, fy, 16, 0, Math.PI * 2);
    c.fillStyle = B.crimson; c.fill();
    // checkmark
    c.strokeStyle = 'white'; c.lineWidth = 2.5;
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath();
    c.moveTo(PAD + 9, fy);
    c.lineTo(PAD + 15, fy + 6);
    c.lineTo(PAD + 25, fy - 8);
    c.stroke();
    c.lineCap = 'butt'; c.lineJoin = 'miter';
    // text — single line only to prevent overflow
    c.fillStyle = B.charcoal;
    c.font = "600 22px 'Montserrat', Arial, sans-serif";
    c.textAlign = 'left';
    const fl = wrap(c, feat, W - PAD * 2 - 50).slice(0, 1);
    c.fillText(fl[0] ?? feat, PAD + 46, fy + 8);
  });

  // info chips — FIXED top=1098, height=40, text baseline=1123
  {
    const chips = [`${note.totalPages} pages`, lang, 'PDF format'];
    let chipX = PAD;
    c.font = "600 18px 'Montserrat', Arial, sans-serif";
    chips.forEach(chip => {
      const cW = c.measureText(chip).width + 32;
      rr(c, chipX, 1098, cW, 40, 20);
      c.fillStyle = 'white'; c.fill();
      c.strokeStyle = B.pale; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = B.slate; c.textAlign = 'left';
      c.fillText(chip, chipX + 16, 1123);
      chipX += cW + 14;
    });
  }

  // ── S5 PRICE (1200–1460) ──────────────────────────────────────────────────
  c.fillStyle = 'white';
  c.fillRect(0, 1200, W, 260);

  // gold top border — y=1201
  {
    const g = c.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0,   B.gold);
    g.addColorStop(0.5, 'rgba(212,175,55,0.5)');
    g.addColorStop(1,   B.gold);
    c.strokeStyle = g; c.lineWidth = 2;
    c.beginPath(); c.moveTo(0, 1201); c.lineTo(W, 1201); c.stroke();
  }

  // "THIS NOTE" eyebrow — FIXED y=1235
  c.fillStyle = B.slate;
  c.font = "700 13px 'Montserrat', Arial, sans-serif";
  c.textAlign = 'left';
  spacedCenter(c, 'THIS NOTE', PAD + 80, 1235, 2.5);

  // big price — baseline y=1362 (100px Playfair)
  {
    c.font = "700 44px 'Montserrat', Arial, sans-serif";
    c.fillStyle = B.navy; c.textAlign = 'left';
    c.fillText('₹', PAD, 1362);
    const rsW = c.measureText('₹').width + 4;

    c.font = "800 100px 'Playfair Display', Georgia, serif";
    c.fillText(`${note.price}`, PAD + rsW, 1362);
    const pvW = c.measureText(`${note.price}`).width;

    let afterX = PAD + rsW + pvW + 20;

    if (note.originalPrice && note.originalPrice > note.price) {
      c.font = "500 36px 'Montserrat', Arial, sans-serif";
      c.fillStyle = '#A0AEC0';
      c.fillText(`₹${note.originalPrice}`, afterX, 1362);
      const opW = c.measureText(`₹${note.originalPrice}`).width;
      c.strokeStyle = '#A0AEC0'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(afterX, 1342); c.lineTo(afterX + opW, 1342); c.stroke();
      afterX += opW + 16;
    }
    if (saving) {
      c.font = "800 20px 'Montserrat', Arial, sans-serif";
      const sbW = c.measureText(`SAVE ${saving}%`).width + 32;
      rr(c, afterX, 1318, sbW, 48, 10);
      c.fillStyle = B.crimson; c.fill();
      c.fillStyle = 'white'; c.textAlign = 'left';
      c.fillText(`SAVE ${saving}%`, afterX + 16, 1351);
    }
  }

  // perks row — FIXED y=1422
  {
    const perks = ['✓ Instant PDF', '✓ Lifetime access', '✓ Print-ready'];
    let pX = PAD;
    c.font = "600 18px 'Montserrat', Arial, sans-serif";
    perks.forEach((p, i) => {
      if (i > 0) {
        c.beginPath(); c.arc(pX + 8, 1414, 4, 0, Math.PI * 2);
        c.fillStyle = B.gold; c.fill();
        pX += 22;
      }
      c.fillStyle = B.slate; c.textAlign = 'left';
      c.fillText(p, pX, 1422);
      pX += c.measureText(p).width + 22;
    });
  }

  // ── S6 CTA (1460–1700) ────────────────────────────────────────────────────
  {
    const g = c.createLinearGradient(0, 1460, 0, 1700);
    g.addColorStop(0, B.navy); g.addColorStop(1, B.navyMid);
    c.fillStyle = g; c.fillRect(0, 1460, W, 240);
  }
  {
    const g = c.createRadialGradient(W / 2, 1460, 0, W / 2, 1460, W * 0.55);
    g.addColorStop(0, 'rgba(212,175,55,0.10)');
    g.addColorStop(1, 'rgba(212,175,55,0)');
    c.fillStyle = g; c.fillRect(0, 1460, W, 240);
  }

  // white CTA button — y=1482, height=116
  c.shadowColor = 'rgba(0,0,0,0.28)'; c.shadowBlur = 36; c.shadowOffsetY = 10;
  rr(c, 56, 1482, W - 112, 116, 22);
  c.fillStyle = 'white'; c.fill();
  noShadow(c);

  // logo inside button — x=76, y=1498, size=84
  const bLogoS = 84;
  c.save(); rr(c, 76, 1498, bLogoS, bLogoS, 14); c.clip();
  c.drawImage(logo, 76, 1498, bLogoS, bLogoS); c.restore();

  // "GET THIS NOTE →" — navy on white, left-aligned after logo
  const btnTextX = 76 + bLogoS + 20;
  c.fillStyle = B.navy;
  c.font = "800 32px 'Montserrat', Arial, sans-serif";
  c.textAlign = 'left';
  c.fillText('GET THIS NOTE  →', btnTextX, 1550);

  // sub-text inside button — SLATE on white (readable)
  c.fillStyle = B.slate;
  c.font = "500 14px 'Montserrat', Arial, sans-serif";
  c.fillText('Instant PDF  ·  Watermarked & Secure', btnTextX, 1578);

  // "TAP TO VISIT" eyebrow + link pill below the button
  c.fillStyle = 'rgba(212,175,55,0.55)';
  c.font = "700 12px 'Montserrat', Arial, sans-serif";
  c.textAlign = 'center';
  spacedCenter(c, 'TAP TO VISIT', W / 2, 1626, 2.5);

  const urlText = `${domain}/product/${note.slug}`;
  c.font = "600 18px 'Montserrat', Arial, sans-serif";
  const urlPillW = Math.min(c.measureText(urlText).width + 52, W - 112);
  const urlPillX = (W - urlPillW) / 2;
  rr(c, urlPillX, 1636, urlPillW, 46, 23);
  c.fillStyle = 'rgba(255,255,255,0.08)'; c.fill();
  c.strokeStyle = 'rgba(212,175,55,0.55)'; c.lineWidth = 1.5; c.stroke();
  c.fillStyle = 'rgba(212,175,55,0.95)';
  // underline
  const urlMetrics = c.measureText(urlText);
  c.beginPath();
  c.moveTo(W / 2 - urlMetrics.width / 2, 1672);
  c.lineTo(W / 2 + urlMetrics.width / 2, 1672);
  c.strokeStyle = 'rgba(212,175,55,0.55)'; c.lineWidth = 1;
  c.stroke();
  c.fillText(urlText, W / 2, 1668);

  // ── S7 FOOTER (1700–1920) ─────────────────────────────────────────────────
  {
    const g = c.createLinearGradient(0, 1700, 0, 1920);
    g.addColorStop(0, B.navyDk); g.addColorStop(1, '#060e1c');
    c.fillStyle = g; c.fillRect(0, 1700, W, 220);
  }
  // top gold line
  {
    const g = c.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0,   'rgba(212,175,55,0)');
    g.addColorStop(0.5, 'rgba(212,175,55,0.45)');
    g.addColorStop(1,   'rgba(212,175,55,0)');
    c.strokeStyle = g; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(40, 1701); c.lineTo(W - 40, 1701); c.stroke();
  }
  // logo card in footer — centred, y=1718, 70×70
  {
    const fS = 70, fX = (W - fS) / 2, fY = 1718;
    rr(c, fX, fY, fS, fS, 14);
    c.fillStyle = 'rgba(250,249,246,0.12)'; c.fill();
    c.strokeStyle = 'rgba(212,175,55,0.28)'; c.lineWidth = 1; c.stroke();
    c.drawImage(logo, fX + 5, fY + 5, fS - 10, fS - 10);
  }
  // "THE EDULAW" — y=1820
  c.fillStyle = B.gold;
  c.font = "700 26px 'Playfair Display', Georgia, serif";
  c.textAlign = 'center';
  spacedCenter(c, 'THE EDULAW', W / 2, 1820, 3);
  // @handle — y=1850
  c.fillStyle = 'rgba(255,255,255,0.50)';
  c.font = "500 16px 'Montserrat', Arial, sans-serif";
  c.fillText('@theedulaw  ·  ' + domain, W / 2, 1850);
  // sub — y=1876
  c.fillStyle = 'rgba(212,175,55,0.60)';
  c.font = "500 14px 'Montserrat', Arial, sans-serif";
  c.fillText('DM to order  ·  Instant PDF delivery', W / 2, 1876);
  // bottom gold line — y=1906
  c.strokeStyle = 'rgba(212,175,55,0.18)'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(40, 1906); c.lineTo(W - 40, 1906); c.stroke();

  return cv;
}

// ── JSX live preview (540 × 960, scaled to 200×355 inside the modal) ──────────
function StoryPreview({ note }: { note: Note }) {
  const colors = catColor(note.category);
  const saving = note.originalPrice && note.originalPrice > note.price
    ? Math.round(((note.originalPrice - note.price) / note.originalPrice) * 100) : null;
  const rawFeat = (note.contentFeatures ?? []).filter(Boolean);
  const features = (rawFeat.length > 0 ? rawFeat : [
    `${note.totalPages}+ pages of curated content`,
    'Includes landmark case laws & judgments',
    'Structured for judicial exam preparation',
  ]).slice(0, 3);
  const lang = note.language === 'Both' ? 'English + Hindi' : (note.language ?? 'English');
  const domain = typeof window !== 'undefined' ? window.location.host : 'store.theedulaw.in';

  return (
    <div style={{
      width: 540, height: 960,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: "'Montserrat',Arial,sans-serif",
    }}>

      {/* ── S1 BRAND HEADER (h=140) ── */}
      <div style={{
        height: 140, flexShrink: 0,
        background: 'linear-gradient(160deg,#0d1f3c 0%,#1A365D 50%,#111827 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
        paddingBottom: 10, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 60% at 50% -10%,rgba(212,175,55,.13) 0%,transparent 70%)' }}/>
        <div style={{ position:'absolute', left:30, right:30, bottom:1, height:1, background:'linear-gradient(90deg,transparent,rgba(212,175,55,.4),transparent)' }}/>
        {/* logo — absolute at top, text stacks at bottom via flex-end */}
        <div style={{
          position:'absolute', top:8, left:'50%', transform:'translateX(-50%)',
          width:50, height:50, borderRadius:9, background:B.offWhite,
          boxShadow:'0 5px 18px rgba(0,0,0,.35)', overflow:'hidden',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <img src="/images/edulaw-logo.png" alt="EduLaw" style={{ width:43, height:43, objectFit:'contain' }}/>
        </div>
        {/* text sits at bottom — always below logo bottom (58px) */}
        <div style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:20, color:B.gold, letterSpacing:2, fontWeight:800, position:'relative', lineHeight:1 }}>THE EDULAW</div>
        <div style={{ fontSize:7, color:'rgba(212,175,55,.6)', fontWeight:600, letterSpacing:1.5, textTransform:'uppercase', position:'relative', marginTop:3 }}>Master Every Law. Own Every Note.</div>
        <div style={{ fontSize:6.5, color:'rgba(212,175,55,.5)', fontWeight:600, position:'relative', marginTop:2 }}>★★★★★  4.9 · 50,000+ Students</div>
      </div>

      {/* ── S2 MARKETPLACE PREVIEW (h=170) ── */}
      <div style={{
        height: 170, flexShrink: 0,
        background: B.offWhite,
        padding: '8px 12px 6px',
        display: 'flex', flexDirection: 'column', gap: 5,
        borderBottom: `1px solid ${B.pale}`, position: 'relative',
      }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(26,54,93,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(26,54,93,.04) 1px,transparent 1px)', backgroundSize:'22px 22px' }}/>
        <div style={{ fontSize:6.5, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'rgba(26,54,93,.38)', textAlign:'center', position:'relative' }}>From the Marketplace</div>
        {/* browser bar */}
        <div style={{ display:'flex', alignItems:'center', gap:4, position:'relative' }}>
          <div style={{ display:'flex', gap:3 }}>
            {['#FF5F57','#FFBD2E','#28CA41'].map((col,i) => (
              <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:col }}/>
            ))}
          </div>
          <div style={{ flex:1, background:'white', border:`1px solid ${B.pale}`, borderRadius:20, padding:'2px 8px', display:'flex', alignItems:'center', gap:3, overflow:'hidden' }}>
            <span style={{ fontSize:6, color:'#A0AEC0', fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{domain}/product/{note.slug}</span>
          </div>
        </div>
        {/* mini note card */}
        <div style={{
          background:'white', borderRadius:10,
          boxShadow:'0 2px 12px rgba(26,54,93,.12)',
          padding:'7px 10px 6px',
          flex:1, display:'flex', flexDirection:'column', gap:3,
          position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute', left:0, top:0, bottom:0, width:4, background:B.crimson, borderRadius:'4px 0 0 4px' }}/>
          <div style={{ display:'flex', alignItems:'center', gap:4, paddingLeft:5 }}>
            <span style={{ display:'inline-flex', padding:'2px 6px', borderRadius:20, fontSize:7, fontWeight:700, letterSpacing:.5, textTransform:'uppercase', background:colors.bg, color:colors.text, border:`1px solid ${colors.border}` }}>{note.category}</span>
            {note.isNew && <span style={{ background:B.gold, color:B.navyDk, padding:'2px 6px', borderRadius:20, fontSize:7, fontWeight:800 }}>NEW</span>}
          </div>
          <div style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:13, color:B.navy, fontWeight:700, lineHeight:1.25, paddingLeft:5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' } as React.CSSProperties}>
            {note.title}
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 5px 0', marginTop:'auto', borderTop:`1px solid ${B.pale}` }}>
            <span style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:16, color:B.navy, fontWeight:800 }}>₹{note.price}</span>
            {saving && <span style={{ background:B.crimson, color:'white', padding:'2px 6px', borderRadius:5, fontSize:7.5, fontWeight:700 }}>SAVE {saving}%</span>}
          </div>
          <div style={{ background:B.crimson, color:'white', padding:'4px 10px', borderRadius:6, fontSize:8.5, fontWeight:700, textAlign:'center', marginTop:2 }}>Add to Cart →</div>
        </div>
      </div>

      {/* ── S3 SEPARATOR (h=20) ── */}
      <div style={{
        height: 20, flexShrink: 0,
        background: 'linear-gradient(90deg,#FAF9F6 0%,rgba(212,175,55,.12) 20%,rgba(212,175,55,.28) 50%,rgba(212,175,55,.12) 80%,#FAF9F6 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
      }}>
        <div style={{ width:36, height:1.5, background:B.crimson, borderRadius:1 }}/>
        <div style={{ width:6, height:6, background:B.gold, transform:'rotate(45deg)', flexShrink:0 }}/>
        <div style={{ fontSize:6, fontWeight:700, letterSpacing:2.5, textTransform:'uppercase', color:B.charcoal }}>Note Details</div>
        <div style={{ width:6, height:6, background:B.gold, transform:'rotate(45deg)', flexShrink:0 }}/>
        <div style={{ width:36, height:1.5, background:B.crimson, borderRadius:1 }}/>
      </div>

      {/* ── S4 NOTE DETAILS (flex:1) ── */}
      <div style={{
        flex: 1, minHeight: 0,
        background: B.offWhite,
        padding: '10px 18px 8px 22px',
        display: 'flex', flexDirection: 'column', gap: 6,
        overflow: 'hidden',
        borderLeft: `3px solid ${B.navy}`,
      }}>
        {/* category */}
        <span style={{ display:'inline-flex', padding:'3px 10px', borderRadius:20, fontSize:7.5, fontWeight:700, letterSpacing:1, textTransform:'uppercase', alignSelf:'flex-start', background:colors.bg, color:colors.text, border:`1px solid ${colors.border}` }}>
          {note.category}
        </span>
        {/* title */}
        <div style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:22, color:B.navy, fontWeight:800, lineHeight:1.2, letterSpacing:-.3, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' } as React.CSSProperties}>
          {note.title}
        </div>
        {/* description */}
        <div style={{ fontStyle:'italic', fontSize:9.5, color:B.slate, lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' } as React.CSSProperties}>
          {note.description}
        </div>
        {/* gold divider */}
        <div style={{ height:1, background:`linear-gradient(90deg,${B.gold},rgba(212,175,55,.3),transparent)`, flexShrink:0 }}/>
        {/* features */}
        {features.length > 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:6, fontSize:9.5, color:B.charcoal, fontWeight:600, lineHeight:1.35 }}>
                <div style={{ width:13, height:13, background:B.crimson, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                  <svg width="8" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f}</span>
              </div>
            ))}
          </div>
        )}
        {/* chips */}
        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
          {[`${note.totalPages} pages`, lang, 'PDF'].map((l, i) => (
            <div key={i} style={{ background:'white', border:`1px solid ${B.pale}`, borderRadius:20, padding:'2px 8px', fontSize:8, color:B.slate, fontWeight:600 }}>{l}</div>
          ))}
        </div>
      </div>

      {/* ── S5 PRICE ── */}
      <div style={{ flexShrink:0, background:'white', padding:'8px 18px 6px', borderTop:`2px solid ${B.gold}`, borderBottom:`1px solid ${B.pale}` }}>
        <div style={{ fontSize:6.5, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:B.slate, marginBottom:2 }}>THIS NOTE</div>
        <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:1 }}>
            <span style={{ fontSize:16, color:B.navy, fontWeight:700 }}>₹</span>
            <span style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:42, color:B.navy, fontWeight:800, letterSpacing:-1, lineHeight:1 }}>{note.price}</span>
          </div>
          {note.originalPrice && note.originalPrice > note.price && (
            <span style={{ fontSize:15, color:'#A0AEC0', textDecoration:'line-through' }}>₹{note.originalPrice}</span>
          )}
          {saving && (
            <span style={{ background:B.crimson, color:'white', padding:'3px 8px', borderRadius:6, fontSize:8.5, fontWeight:800 }}>SAVE {saving}%</span>
          )}
        </div>
        <div style={{ fontSize:8, color:B.slate, marginTop:3 }}>✓ Instant PDF  ·  ✓ Lifetime access  ·  ✓ Print-ready</div>
      </div>

      {/* ── S6 CTA ── */}
      <div style={{ flexShrink:0, background:B.navy, padding:'8px 14px 6px', display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
        <div style={{ width:'100%', background:'white', borderRadius:9, padding:'8px 12px', display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:7, overflow:'hidden', flexShrink:0 }}>
            <img src="/images/edulaw-logo.png" alt="" style={{ width:30, height:30, objectFit:'contain' }}/>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
            <span style={{ fontSize:12, fontWeight:800, color:B.navy }}>GET THIS NOTE  →</span>
            <span style={{ fontSize:7, color:B.slate }}>Instant PDF · Watermarked & Secure</span>
          </div>
        </div>
        {/* link pill */}
        <div style={{ fontSize:6, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'rgba(212,175,55,.55)' }}>TAP TO VISIT</div>
        <div style={{ border:'1px solid rgba(212,175,55,.5)', borderRadius:20, padding:'3px 10px', fontSize:8, color:'rgba(212,175,55,.95)', fontWeight:600, textDecoration:'underline', textDecorationColor:'rgba(212,175,55,.4)', maxWidth:'100%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {domain}/product/{note.slug}
        </div>
      </div>

      {/* ── S7 FOOTER ── */}
      <div style={{
        flexShrink: 0, height: 52,
        background: 'linear-gradient(140deg,#0d1f3c,#060e1c)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 2, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', left:20, right:20, top:0, height:1, background:'linear-gradient(90deg,transparent,rgba(212,175,55,.4),transparent)' }}/>
        <div style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:12, color:B.gold, letterSpacing:3, fontWeight:700, position:'relative' }}>THE EDULAW</div>
        <div style={{ fontSize:7.5, color:'rgba(255,255,255,.5)', letterSpacing:.8, position:'relative' }}>@theedulaw · {domain}</div>
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function InstagramStoryModal({ note, onClose }: { note: Note; onClose: () => void }) {
  const [busy, setBusy]             = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const download = useCallback(async () => {
    setBusy(true);
    try {
      const canvas = await drawStory(note);
      canvas.toBlob(blob => {
        if (!blob) { toast.error('Could not generate story'); return; }
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);

        // programmatic download (works on Android & desktop)
        const a = document.createElement('a');
        a.href = url; a.download = `edulaw-story-${note.slug}.png`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 90_000);

        toast.success('Story ready — tap & hold image to save if needed');
      }, 'image/png');
    } catch (err) {
      console.error(err);
      toast.error('Could not generate story');
    } finally {
      setBusy(false);
    }
  }, [note]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 24 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col sm:flex-row max-w-2xl w-full max-h-[92dvh]"
          onClick={e => e.stopPropagation()}
        >
          {/* story preview panel */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center gap-3 p-5 bg-[#1a2744]">
            {previewUrl ? (
              <>
                <img
                  src={previewUrl} alt="Story"
                  style={{ width: 200, height: 355, objectFit: 'cover', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,.5)' }}
                />
                <p className="text-[10px] font-ui font-semibold text-[#D4AF37] text-center">
                  Tap &amp; hold image → Save to Photos
                </p>
              </>
            ) : (
              <>
                <div style={{ width: 200, height: 355, overflow: 'hidden', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,.45)', flexShrink: 0 }}>
                  <div style={{ width: 540, height: 960, transform: 'scale(0.3704)', transformOrigin: 'top left' }}>
                    <StoryPreview note={note}/>
                  </div>
                </div>
                <p className="text-[9px] font-ui text-[#D4AF37]/60 text-center">Live preview</p>
              </>
            )}
          </div>

          {/* controls panel */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col gap-5 overflow-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <defs>
                      <linearGradient id="ig3" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%"   stopColor="#f09433"/>
                        <stop offset="25%"  stopColor="#e6683c"/>
                        <stop offset="50%"  stopColor="#dc2743"/>
                        <stop offset="75%"  stopColor="#cc2366"/>
                        <stop offset="100%" stopColor="#bc1888"/>
                      </linearGradient>
                    </defs>
                    <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig3)"/>
                    <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2"/>
                    <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
                  </svg>
                  <h2 className="font-display text-xl font-bold text-ink leading-none">Instagram Story</h2>
                </div>
                <p className="text-sm font-ui text-slate-500 leading-relaxed">
                  1080 × 1920 branded story card, ready to post.
                </p>
              </div>
              <button
                onClick={onClose}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5"/>
              </button>
            </div>

            {/* note pill */}
            <div className="rounded-2xl p-4 border" style={{ background: B.offWhite, borderColor: B.pale }}>
              <p className="text-[10px] font-ui font-black uppercase tracking-widest text-slate-400 mb-1">{note.category}</p>
              <p className="font-display text-base font-bold leading-snug line-clamp-2" style={{ color: B.navy }}>{note.title}</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-display font-bold text-lg" style={{ color: B.navy }}>₹{note.price}</span>
                {note.originalPrice && note.originalPrice > note.price && (
                  <>
                    <span className="text-xs text-slate-400 line-through font-ui">₹{note.originalPrice}</span>
                    <span className="text-[10px] font-ui font-bold text-white px-1.5 py-0.5 rounded" style={{ background: B.crimson }}>
                      {Math.round(((note.originalPrice - note.price) / note.originalPrice) * 100)}% off
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* steps */}
            <div className="space-y-2.5 text-[12px] font-ui text-slate-500">
              {([
                ['1', <><strong className="text-slate-700">Download Story</strong> below</>],
                ['2', 'Android — file saves automatically to Downloads'],
                ['3', 'iPhone — tap & hold the preview → Save to Photos'],
              ] as [string, React.ReactNode][]).map(([n, t], i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-white text-[8px] font-bold" style={{ background: B.navy }}>{n}</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>

            {/* actions */}
            <div className="flex flex-col gap-3 mt-auto">
              <button
                onClick={download}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl font-ui font-bold text-sm uppercase tracking-wide transition-all shadow-lg disabled:opacity-60 disabled:cursor-default active:scale-95 text-white"
                style={{ background: busy ? B.navy : `linear-gradient(135deg,${B.navy},${B.navyMid})`, boxShadow: `0 8px 24px rgba(26,54,93,0.35)` }}
              >
                {busy
                  ? <><Loader2 className="w-4 h-4 animate-spin"/> Generating…</>
                  : <><Download className="w-4 h-4"/> {previewUrl ? 'Re-generate' : 'Download Story (1080 × 1920)'}</>
                }
              </button>
              <button onClick={onClose} className="w-full py-2.5 text-sm font-ui font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
