import { Link } from 'react-router-dom';
import { Instagram, Send, MessageCircle, Mail, MapPin, Shield } from 'lucide-react';

const socialLinks = [
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/theedulaw' },
  { name: 'Telegram', icon: Send, href: 'https://t.me/theedulaw' },
  { name: 'WhatsApp', icon: MessageCircle, href: 'https://wa.me/919876543210?text=Hi%20EduLaw%20Support!' },
];

export function Footer() {
  return (
    <footer className="bg-ink text-parchment relative overflow-hidden border-t border-gold/10">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A84C] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#6B1E2E] rounded-full blur-3xl" />
      </div>

      <div className="section-container py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14">
                <img 
                  src="/images/edulaw-logo.png" 
                  alt="The EduLaw Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-display text-2xl">
                  The Edu<span className="text-[#C9A84C]">Law</span>
                </span>
                <p className="text-[10px] text-parchment/50 font-ui tracking-wider uppercase">India's Premium Legal Notes Shop</p>
              </div>
            </Link>
            <p className="text-parchment/70 font-body mb-6 max-w-sm">
              India's most trusted legal education and news platform based in Pune. We provide expertly crafted study materials for law students and judiciary aspirants across the country.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <a href="mailto:support@theedulaw.in" className="flex items-center gap-2 text-parchment/70 hover:text-[#C9A84C] transition-colors">
                <Mail className="w-4 h-4 text-gold" />
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

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-[#C9A84C] hover:text-ink transition-all"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="font-display text-lg mb-4 text-[#C9A84C]">Shop Categories</h3>
            <ul className="space-y-2">
              <li key="criminal"><Link to="/category/criminal-law" className="font-ui text-sm text-parchment/70 hover:text-[#C9A84C] transition-colors">Criminal Law</Link></li>
              <li key="civil"><Link to="/category/civil-law" className="font-ui text-sm text-parchment/70 hover:text-[#C9A84C] transition-colors">Civil Law</Link></li>
              <li key="corp"><Link to="/category/corporate-law" className="font-ui text-sm text-parchment/70 hover:text-[#C9A84C] transition-colors">Corporate Law</Link></li>
              <li key="consti"><Link to="/category/constitutional-law" className="font-ui text-sm text-parchment/70 hover:text-[#C9A84C] transition-colors">Constitution</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-display text-lg mb-4 text-[#C9A84C]">Legal</h3>
            <ul className="space-y-2">
              <li key="privacy"><Link to="/privacy-policy" className="font-ui text-sm text-parchment/70 hover:text-[#C9A84C] transition-colors">Privacy Policy</Link></li>
              <li key="terms"><Link to="/terms-of-service" className="font-ui text-sm text-parchment/70 hover:text-[#C9A84C] transition-colors">Terms of Service</Link></li>
              <li key="refund"><Link to="/refund-policy" className="font-ui text-sm text-parchment/70 hover:text-[#C9A84C] transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-display text-lg mb-4 text-[#C9A84C]">Support</h3>
            <ul className="space-y-2">
              <li key="dashboard"><Link to="/dashboard" className="font-ui text-sm text-parchment/70 hover:text-[#C9A84C] transition-colors">My Library</Link></li>
              <li key="help"><a href="mailto:support@theedulaw.in" className="font-ui text-sm text-parchment/70 hover:text-[#C9A84C] transition-colors">Get Help</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-ui text-sm text-parchment/50">
            © {new Date().getFullYear()} The EduLaw — Pune, India. All materials are copyrighted and for educational use only.
          </p>
          
          {/* Razorpay Badge */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="font-ui text-xs text-parchment/70 font-medium">Secured by Razorpay</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="font-ui text-sm text-parchment/50 hover:text-parchment transition-colors">
              Privacy
            </Link>
            <Link to="/terms-of-service" className="font-ui text-sm text-parchment/50 hover:text-parchment transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
