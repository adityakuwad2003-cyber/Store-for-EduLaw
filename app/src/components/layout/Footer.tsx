import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';

// Real brand SVG logos
const InstagramLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <defs>
      <radialGradient id="ig-grad-footer" cx="30%" cy="107%" r="150%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </radialGradient>
    </defs>
    <path fill="url(#ig-grad-footer)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const TelegramLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true" fill="white">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const WhatsAppLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 175.216 175.552" className="w-5 h-5" fill="white" aria-hidden="true">
    <path d="M148.5 26.7C132 10.2 110.2 0.9 87.1 0.9c-47.1 0-85.4 38.3-85.4 85.4 0 15 3.9 29.7 11.4 42.6L0.9 174.6l47.5-12.5c12.4 6.8 26.4 10.3 40.7 10.3h0c47.1 0 85.4-38.3 85.4-85.4 0-22.8-8.9-44.2-26-60.3zM87.1 160.3c-12.8 0-25.3-3.4-36.2-9.9l-2.6-1.5-26.9 7.1 7.2-26.3-1.7-2.7c-7.1-11.3-10.8-24.3-10.8-37.7 0-39 31.7-70.7 70.7-70.7 18.9 0 36.6 7.4 49.9 20.7 13.3 13.3 20.7 31 20.7 49.9-0.1 39-31.8 71.1-70.3 71.1zm38.8-52.9c-2.1-1.1-12.5-6.2-14.5-6.9-1.9-0.7-3.3-1.1-4.7 1.1-1.4 2.1-5.4 6.9-6.6 8.3-1.2 1.4-2.4 1.6-4.5 0.5-2.1-1.1-8.9-3.3-17-10.5-6.3-5.6-10.5-12.5-11.7-14.6-1.2-2.1-0.1-3.2 0.9-4.3 0.9-0.9 2.1-2.4 3.2-3.6 1.1-1.2 1.4-2.1 2.1-3.5 0.7-1.4 0.4-2.6-0.2-3.6-0.5-1.1-4.7-11.3-6.4-15.5-1.7-4.1-3.4-3.5-4.7-3.6-1.2-0.1-2.6-0.1-4-0.1-1.4 0-3.6 0.5-5.5 2.6-1.9 2.1-7.2 7-7.2 17.1 0 10.1 7.4 19.8 8.4 21.2 1.1 1.4 14.5 22.1 35.1 31 4.9 2.1 8.7 3.4 11.7 4.3 4.9 1.6 9.4 1.4 12.9 0.8 3.9-0.6 12.1-5 13.8-9.7 1.7-4.8 1.7-8.9 1.2-9.7-0.5-0.9-1.8-1.4-3.9-2.5z"/>
  </svg>
);

const socialLinks = [
  { name: 'Instagram', component: InstagramLogo, href: 'https://instagram.com/theedulaw', bg: 'hover:bg-pink-500' },
  { name: 'Telegram', component: TelegramLogo, href: 'https://t.me/theedulaw', bg: 'hover:bg-[#2CA5E0]' },
  { name: 'WhatsApp', component: WhatsAppLogo, href: 'https://wa.me/917756040198?text=Hi%20EduLaw%20Support!', bg: 'hover:bg-[#25D366]' },
];

export function Footer() {
  return (
    <footer className="bg-ink text-parchment relative overflow-hidden border-t border-gold/10">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-burgundy rounded-full blur-3xl" />
      </div>

      <div className="section-container py-12 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0">
                <img 
                  src="/images/edulaw-logo.png" 
                  alt="The EduLaw Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-display text-xl sm:text-2xl">
                  The Edu<span className="text-gold">Law</span>
                </span>
                <p className="text-[10px] text-parchment/50 font-ui tracking-wider uppercase">India's Premium Legal Notes Shop</p>
              </div>
            </Link>
            <p className="text-parchment/70 font-body mb-6 text-sm sm:text-base max-w-sm leading-relaxed">
              India's most trusted legal education and news platform based in Pune. We provide expertly crafted study materials for law students and judiciary aspirants across the country.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <a href="mailto:support@theedulaw.in" className="flex items-center gap-2 text-parchment/70 hover:text-gold transition-colors">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <span className="font-ui text-sm">support@theedulaw.in</span>
              </a>
              <div className="flex items-start gap-2 text-parchment/70">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-1" />
                <span className="font-ui text-sm leading-relaxed">
                  Pune, Maharashtra, India<br />
                  <span className="text-xs opacity-60">Corporate Headquarters</span>
                </span>
              </div>
            </div>

            {/* Social Links — Real brand logos */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ${social.bg} transition-all`}
                  aria-label={social.name}
                >
                  <social.component />
                </a>
              ))}
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="font-display text-lg mb-4 text-gold">Shop Categories</h3>
            <ul className="space-y-2">
              <li><Link to="/category/criminal-law" className="font-ui text-sm text-parchment/70 hover:text-gold transition-colors">Criminal Law</Link></li>
              <li><Link to="/category/civil-law" className="font-ui text-sm text-parchment/70 hover:text-gold transition-colors">Civil Law</Link></li>
              <li><Link to="/category/corporate-law" className="font-ui text-sm text-parchment/70 hover:text-gold transition-colors">Corporate Law</Link></li>
              <li><Link to="/category/constitutional-law" className="font-ui text-sm text-parchment/70 hover:text-gold transition-colors">Constitution</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-display text-lg mb-4 text-gold">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy-policy" className="font-ui text-sm text-parchment/70 hover:text-gold transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="font-ui text-sm text-parchment/70 hover:text-gold transition-colors">Terms of Service</Link></li>
              <li><Link to="/refund-policy" className="font-ui text-sm text-parchment/70 hover:text-gold transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-display text-lg mb-4 text-gold">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/dashboard" className="font-ui text-sm text-parchment/70 hover:text-gold transition-colors">My Library</Link></li>
              <li><a href="mailto:support@theedulaw.in" className="font-ui text-sm text-parchment/70 hover:text-gold transition-colors">Get Help</a></li>
              <li>
                <a
                  href="https://wa.me/917756040198?text=Hi%20EduLaw%20Support!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-ui text-sm text-parchment/70 hover:text-[#25D366] transition-colors"
                >
                  WhatsApp Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="font-ui text-xs sm:text-sm text-parchment/50">
              © The EduLaw, Pune, Maharashtra, India. All materials are copyrighted and for educational use only.
            </p>
            <p className="font-ui text-xs text-parchment/40 mt-1">GSTIN: 27EFLPK0704R1ZY</p>
            <p className="font-ui text-xs text-parchment/40 mt-1">
              Grievance Officer: Siddhant Kuwad —{' '}
              <a href="mailto:instituteedulaw@gmail.com" className="underline hover:text-parchment transition-colors">
                instituteedulaw@gmail.com
              </a>{' '}
              (responds within 48 hours)
            </p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/privacy-policy" className="font-ui text-xs sm:text-sm text-parchment/50 hover:text-parchment transition-colors">Privacy</Link>
            <Link to="/terms-of-service" className="font-ui text-xs sm:text-sm text-parchment/50 hover:text-parchment transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
