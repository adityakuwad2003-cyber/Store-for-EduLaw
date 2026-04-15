import { motion } from 'framer-motion';
import { WhatsAppLogo } from '@/components/ui/BrandLogos';

export function WhatsAppButton() {
  const phoneNumber = '917020161587';
  const message = encodeURIComponent('Hi EduLaw Support! I need some help with the notes.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-[90] flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl hover:shadow-[#25D366]/40 transition-shadow duration-300 group"
      aria-label="Contact Support on WhatsApp"
    >
      {/* Pulse Effect */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 group-hover:hidden" />
      
      <WhatsAppLogo size={32} className="relative z-10" />
      
      {/* Tooltip */}
      <div className="absolute right-full mr-4 px-3 py-1.5 bg-ink text-parchment text-xs font-ui font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-gold/20">
        Live Support
      </div>
    </motion.a>
  );
}
