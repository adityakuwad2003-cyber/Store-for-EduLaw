import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const WHATSAPP_NUMBER = '917756040198';

/** Convert a URL slug like "bns-complete-notes" → "BNS Complete Notes" */
function slugToTitle(slug: string): string {
  const acronyms = new Set(['bns', 'bnss', 'bsa', 'ipc', 'crpc', 'cpc', 'iea', 'ndps', 'pocso', 'rti', 'adr', 'moa', 'aoa', 'nda', 'clat', 'aibe']);
  return slug
    .split('-')
    .map(w => acronyms.has(w.toLowerCase()) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function buildMessage(pathname: string): string {
  // Product / note page  →  name the specific product
  const productMatch = pathname.match(/^\/(product|notes)\/(.+)$/);
  if (productMatch) {
    const name = slugToTitle(productMatch[2]);
    return `Hey! I am interested in purchasing the *${name}*. Can you help me with the details?`;
  }

  // Category page  →  mention the category
  const categoryMatch = pathname.match(/^\/category\/(.+)$/);
  if (categoryMatch) {
    const cat = slugToTitle(categoryMatch[1]);
    return `Hey! I am interested in purchasing *${cat} Notes*. Can you help me pick the right ones?`;
  }

  // MCQ / mock-test page
  if (pathname.startsWith('/mock-tests')) {
    return `Hey! I am interested in the *Mock Tests & MCQ Booklets* on EduLaw. Can you tell me more?`;
  }

  // Templates page
  if (pathname.startsWith('/templates')) {
    return `Hey! I am interested in purchasing *Legal Document Templates* from EduLaw. Can you help?`;
  }

  // Bundles page
  if (pathname.startsWith('/bundles')) {
    return `Hey! I am interested in purchasing one of the *Note Bundles* on EduLaw. Which one would you recommend?`;
  }

  // Marketplace / home  →  open-ended
  return `Hey! I am interested in purchasing *Notes from EduLaw*. Can you help me find the right ones?`;
}

// Razorpay logo — icon + real text (no path-based text that renders incorrectly)
const RazorpayWordmark = () => (
  <span className="inline-flex items-center gap-[3px]" aria-label="Razorpay">
    {/* Official Razorpay flag/chevron icon mark */}
    <svg viewBox="0 0 20 24" className="h-3.5 w-auto shrink-0" fill="none" aria-hidden="true">
      <path d="M13.5 0H0l4.5 12L0 24h13.5L18 12 13.5 0z" fill="#3395FF"/>
      <path d="M4 4.5h8L9.5 11 12 4.5" fill="#072654" opacity="0.25"/>
    </svg>
    {/* Text rendered as actual characters — always correct */}
    <span
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontWeight: 800,
        fontSize: '12px',
        color: '#072654',
        letterSpacing: '-0.3px',
        lineHeight: 1,
      }}
    >
      razorpay
    </span>
  </span>
);

export function WhatsAppFloat() {
  const [hovered, setHovered] = useState(false);
  const { pathname } = useLocation();
  const message = encodeURIComponent(buildMessage(pathname));

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-[9000] flex flex-col items-end gap-2">
      {/* Razorpay trust badge — real logo, white bg so all paths visible */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl shadow-md border border-slate-100 whitespace-nowrap">
        <svg className="w-3 h-3 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span className="text-[10px] font-ui text-slate-400 leading-none">Secured by</span>
        <RazorpayWordmark />
      </div>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="bg-white text-slate-800 text-xs font-ui font-semibold px-3 py-2 rounded-xl shadow-xl border border-slate-100 whitespace-nowrap"
          >
            💬 Chat with us on WhatsApp
          </motion.div>
        )}
      </AnimatePresence>

      <motion.a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with EduLaw support on WhatsApp"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex items-center justify-center"
        style={{ backgroundColor: '#25D366' }}
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: '#25D366' }} />

        {/* Official WhatsApp SVG logo */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 175.216 175.552"
          className="w-8 h-8 sm:w-9 sm:h-9"
          fill="white"
          aria-hidden="true"
        >
          <path d="M148.5 26.7C132 10.2 110.2 0.9 87.1 0.9c-47.1 0-85.4 38.3-85.4 85.4 0 15 3.9 29.7 11.4 42.6L0.9 174.6l47.5-12.5c12.4 6.8 26.4 10.3 40.7 10.3h0c47.1 0 85.4-38.3 85.4-85.4 0-22.8-8.9-44.2-26-60.3zM87.1 160.3c-12.8 0-25.3-3.4-36.2-9.9l-2.6-1.5-26.9 7.1 7.2-26.3-1.7-2.7c-7.1-11.3-10.8-24.3-10.8-37.7 0-39 31.7-70.7 70.7-70.7 18.9 0 36.6 7.4 49.9 20.7 13.3 13.3 20.7 31 20.7 49.9-0.1 39-31.8 71.1-70.3 71.1zm38.8-52.9c-2.1-1.1-12.5-6.2-14.5-6.9-1.9-0.7-3.3-1.1-4.7 1.1-1.4 2.1-5.4 6.9-6.6 8.3-1.2 1.4-2.4 1.6-4.5 0.5-2.1-1.1-8.9-3.3-17-10.5-6.3-5.6-10.5-12.5-11.7-14.6-1.2-2.1-0.1-3.2 0.9-4.3 0.9-0.9 2.1-2.4 3.2-3.6 1.1-1.2 1.4-2.1 2.1-3.5 0.7-1.4 0.4-2.6-0.2-3.6-0.5-1.1-4.7-11.3-6.4-15.5-1.7-4.1-3.4-3.5-4.7-3.6-1.2-0.1-2.6-0.1-4-0.1-1.4 0-3.6 0.5-5.5 2.6-1.9 2.1-7.2 7-7.2 17.1 0 10.1 7.4 19.8 8.4 21.2 1.1 1.4 14.5 22.1 35.1 31 4.9 2.1 8.7 3.4 11.7 4.3 4.9 1.6 9.4 1.4 12.9 0.8 3.9-0.6 12.1-5 13.8-9.7 1.7-4.8 1.7-8.9 1.2-9.7-0.5-0.9-1.8-1.4-3.9-2.5z"/>
        </svg>
      </motion.a>
    </div>
  );
}
