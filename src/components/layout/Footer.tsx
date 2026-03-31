import { Link } from 'react-router-dom';
import { Instagram, Send, MessageCircle, Mail, Phone, MapPin, Shield } from 'lucide-react';

const footerLinks = {
  marketplace: [
    { name: 'All Notes', href: '/marketplace' },
    { name: 'New Arrivals', href: '/marketplace?filter=new' },
    { name: 'Featured', href: '/marketplace?filter=featured' },
    { name: 'Bundles', href: '/bundles' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Careers', href: '/careers' },
    { name: 'Blog', href: '/blog' },
  ],
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'FAQs', href: '/faqs' },
    { name: 'Refund Policy', href: '/refund' },
    { name: 'Terms of Service', href: '/terms' },
  ],
};

const socialLinks = [
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/edulaw' },
  { name: 'Telegram', icon: Send, href: 'https://t.me/edulaw' },
  { name: 'WhatsApp', icon: MessageCircle, href: 'https://wa.me/edulaw' },
];

export function Footer() {
  return (
    <footer className="bg-ink text-parchment relative overflow-hidden">
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
                  alt="EduLaw" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-display text-2xl">
                  Edu<span className="text-[#C9A84C]">Law</span>
                </span>
                <p className="text-[10px] text-parchment/50 font-ui tracking-wider uppercase">Legal Notes Marketplace</p>
              </div>
            </Link>
            <p className="text-parchment/70 font-body mb-6 max-w-sm">
              India's premier legal notes marketplace. Quality study materials for law students, crafted by legal experts.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 mb-6">
              <a href="mailto:support@edulaw.in" className="flex items-center gap-2 text-parchment/70 hover:text-[#C9A84C] transition-colors">
                <Mail className="w-4 h-4" />
                <span className="font-ui text-sm">support@edulaw.in</span>
              </a>
              <a href="tel:+919876543210" className="flex items-center gap-2 text-parchment/70 hover:text-[#C9A84C] transition-colors">
                <Phone className="w-4 h-4" />
                <span className="font-ui text-sm">+91 98765 43210</span>
              </a>
              <div className="flex items-center gap-2 text-parchment/70">
                <MapPin className="w-4 h-4" />
                <span className="font-ui text-sm">New Delhi, India</span>
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
            <h3 className="font-display text-lg mb-4 text-[#C9A84C]">Marketplace</h3>
            <ul className="space-y-2">
              {footerLinks.marketplace.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="font-ui text-sm text-parchment/70 hover:text-[#C9A84C] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-display text-lg mb-4 text-[#C9A84C]">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="font-ui text-sm text-parchment/70 hover:text-[#C9A84C] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-display text-lg mb-4 text-[#C9A84C]">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="font-ui text-sm text-parchment/70 hover:text-[#C9A84C] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-ui text-sm text-parchment/50">
            © {new Date().getFullYear()} EduLaw. All rights reserved.
          </p>
          
          {/* Razorpay Badge */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="font-ui text-xs text-parchment/70">Secured by Razorpay</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/privacy" className="font-ui text-sm text-parchment/50 hover:text-parchment transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="font-ui text-sm text-parchment/50 hover:text-parchment transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
