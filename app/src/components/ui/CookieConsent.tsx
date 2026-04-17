import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-md z-[100]"
        >
          <div className="bg-ink border border-gold/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl bg-ink/95">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-gold" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-lg text-parchment">Cookies & Privacy</h3>
                  <button 
                    onClick={() => setIsVisible(false)}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors text-parchment/40 hover:text-parchment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="font-ui text-sm text-parchment/60 leading-relaxed mb-6">
                  We use cookies to enhance your experience and analyze our traffic. 
                  By clicking "Accept", you consent to our use of cookies as per our 
                  <Link to="/privacy-policy" className="text-gold hover:underline mx-1">Privacy Policy</Link>.
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleDecline}
                    className="px-4 py-2.5 rounded-xl border border-gold/10 text-parchment/60 font-ui font-medium text-sm hover:bg-white/5 transition-all text-center"
                  >
                    Manage Settings
                  </button>
                  <button
                    onClick={handleAccept}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold to-gold-light text-ink font-ui font-bold text-sm hover:shadow-lg hover:shadow-gold/20 transition-all text-center"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
