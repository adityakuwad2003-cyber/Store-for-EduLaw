import { useState, useRef, useEffect } from 'react';
import { Share2, Copy, Check, MessageCircle, Send, Twitter } from 'lucide-react';
import { toast } from 'sonner';
import type { Note } from '@/types';
import { InstagramStoryModal } from './InstagramStoryModal';

interface ShareButtonProps {
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  url: string;
  category?: string;
  /** 'icon' = just the icon (for cards) | 'pill' = icon + "Share" label (for detail page) */
  variant?: 'icon' | 'pill';
  /** Pass the full note to enable the Instagram Story option */
  note?: Note;
}

export function ShareButton({
  title, description, price, originalPrice, url, category, variant = 'icon', note,
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [open]);

  const savings =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  const shortDesc = description
    ? description.replace(/<[^>]+>/g, '').slice(0, 120) + (description.length > 120 ? '...' : '')
    : '';

  // Rich text for WhatsApp — URL at end, no hashtags
  const shareTextWhatsApp = [
    `📚 *${title}*`,
    shortDesc ? `\n${shortDesc}` : '',
    '',
    category ? `✅ ${category}` : '',
    savings
      ? `💰 ₹${price} ~₹${originalPrice}~ — Save ${savings}%!`
      : `💰 ₹${price}`,
    '',
    `👉 ${url}`,
  ].filter(l => l !== undefined).join('\n');

  // Rich text for Telegram — no URL in body (Telegram prepends it from the url= param)
  const shareTextTelegram = [
    `📚 *${title}*`,
    shortDesc ? `\n${shortDesc}` : '',
    '',
    category ? `✅ ${category}` : '',
    savings
      ? `💰 ₹${price} ~₹${originalPrice}~ — Save ${savings}%!`
      : `💰 ₹${price}`,
  ].filter(l => l !== undefined).join('\n');

  // Plain text for Web Share API / copy
  const shareTextPlain = [
    `📚 ${title}`,
    shortDesc,
    '',
    category ? `✅ ${category}` : '',
    savings ? `💰 ₹${price} (was ₹${originalPrice}) — Save ${savings}%` : `💰 ₹${price}`,
    '',
    `👉 ${url}`,
  ].filter(Boolean).join('\n');

  const twitterText = [
    `📚 ${title}`,
    savings ? `💰 ₹${price} (${savings}% off)` : `💰 ₹${price}`,
  ].join(' · ');

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareTextWhatsApp)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareTextTelegram)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(url)}`;

  const handleShareClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Try native Web Share API first (works perfectly on mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareTextPlain, url });
        return; // success — don't open popover
      } catch {
        // User cancelled or browser doesn't support — fall through
      }
    }

    setOpen(o => !o);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
      setOpen(false);
    } catch {
      toast.error('Could not copy — please copy the URL manually');
    }
  };

  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div ref={ref} className="relative" onClick={stopProp}>
      {/* Trigger button */}
      <button
        onClick={handleShareClick}
        aria-label="Share this product"
        className={`flex items-center justify-center gap-1.5 rounded-xl transition-colors text-slate-400 hover:text-burgundy hover:bg-burgundy/8 active:scale-95 ${
          variant === 'icon'
            ? 'min-w-[44px] min-h-[44px]'
            : 'min-h-[44px] px-4 py-2.5 border border-slate-200 hover:border-burgundy/40 text-slate-600'
        }`}
      >
        <Share2 className="w-4 h-4 shrink-0" />
        {variant === 'pill' && (
          <span className="text-xs font-ui font-bold uppercase tracking-wide">Share</span>
        )}
      </button>

      {/* Share Popover */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-[9999] w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
          onClick={stopProp}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-[#fdf8f3] border-b border-slate-100">
            <p className="text-[10px] font-ui font-black uppercase tracking-[0.15em] text-[#9b9180]">
              Share via
            </p>
            <p className="text-xs font-ui text-slate-600 font-semibold mt-0.5 truncate">{title}</p>
          </div>

          {/* Options */}
          <div className="p-2 space-y-0.5">
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 text-slate-700 hover:text-green-800 transition-colors w-full group"
            >
              <span className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <MessageCircle className="w-4 h-4 text-white" />
              </span>
              <span className="text-sm font-ui font-semibold">WhatsApp</span>
            </a>

            {/* Telegram */}
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sky-50 text-slate-700 hover:text-sky-800 transition-colors w-full group"
            >
              <span className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <Send className="w-4 h-4 text-white" />
              </span>
              <span className="text-sm font-ui font-semibold">Telegram</span>
            </a>

            {/* Twitter / X */}
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors w-full group"
            >
              <span className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <Twitter className="w-3.5 h-3.5 text-white" />
              </span>
              <span className="text-sm font-ui font-semibold">X (Twitter)</span>
            </a>

            {/* Copy Link */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gold/10 text-slate-700 hover:text-[#7a5c1e] transition-colors w-full group"
            >
              <span className="w-7 h-7 rounded-lg bg-gold/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                {copied
                  ? <Check className="w-4 h-4 text-emerald-600" />
                  : <Copy className="w-4 h-4 text-[#7a5c1e]" />}
              </span>
              <span className="text-sm font-ui font-semibold">
                {copied ? 'Copied!' : 'Copy Link'}
              </span>
            </button>

            {/* Instagram Story — only when full note is passed */}
            {note && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); setStoryOpen(true); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-pink-50 text-slate-700 hover:text-pink-700 transition-colors w-full group"
              >
                <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform overflow-hidden" style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2"/>
                    <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
                  </svg>
                </span>
                <span className="text-sm font-ui font-semibold">Instagram Story</span>
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-[#fdf8f3] border-t border-slate-100">
            <p className="text-[9px] font-ui text-slate-400 leading-tight">
              Sharing includes: title, price{savings ? `, ${savings}% discount` : ''}, and direct link
            </p>
          </div>
        </div>
      )}

      {/* Instagram Story Modal */}
      {storyOpen && note && (
        <InstagramStoryModal note={note} onClose={() => setStoryOpen(false)} />
      )}
    </div>
  );
}
