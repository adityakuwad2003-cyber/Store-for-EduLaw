import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, User, ChevronDown, LogOut, FileQuestion, FileText, MessageSquare, Gift, Building2, Store, Layers, Crown, Scale, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/store';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { name: 'Marketplace', href: '/marketplace', icon: Store },
  { name: 'Bundles', href: '/bundles', icon: Layers },
  { name: 'Subscription', href: '/subscription', icon: Crown },
  { name: 'Services', href: '/legal-services', icon: Scale },
  { name: 'Mock Tests', href: '/mock-tests', icon: FileQuestion },
  { name: 'Templates', href: '/templates', icon: FileText },
  { name: 'Community', href: '/community', icon: MessageSquare },
  { name: 'Refer & Earn', href: '/referral', icon: Gift },
  { name: 'College Licensing', href: '/college-licensing', icon: Building2 },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const { getTotalItems } = useCartStore();
  const { currentUser, logout } = useAuth();
  
  const isAuthenticated = !!currentUser;
  const isAdmin = !!(currentUser?.email &&
    (import.meta.env.VITE_ADMIN_EMAILS || 'adityakuwad2003@gmail.com')
      .split(',')
      .map((e: string) => e.trim().toLowerCase())
      .includes(currentUser.email.toLowerCase())
  );

  const cartItemCount = getTotalItems();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-parchment/95 backdrop-blur-md shadow-md' 
          : 'bg-transparent'
      }`}
    >
      <div className="section-container">
        <nav className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="relative w-10 h-10 lg:w-12 lg:h-12">
              <img 
                src="/images/edulaw-logo.png" 
                alt="EduLaw" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col hidden sm:flex">
              <span className="font-display text-xl lg:text-2xl text-ink leading-tight">
                Edu<span className="text-[#6B1E2E]">Law</span>
              </span>
              <span className="text-[10px] text-mutedgray font-ui tracking-wider uppercase">Legal Notes Marketplace</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center gap-4 flex-wrap justify-center flex-1 px-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg relative font-ui font-medium text-[13px] transition-colors group ${
                    isActive ? 'text-[#6B1E2E] bg-[#6B1E2E]/5' : 'text-ink hover:text-[#6B1E2E] hover:bg-parchment-dark/30'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="whitespace-nowrap">{link.name}</span>
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#C9A84C] transition-all duration-300 ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2.5 hover:bg-[#6B1E2E]/10 rounded-xl transition-all duration-300 group"
            >
              <ShoppingCart className="w-5 h-5 text-ink group-hover:text-[#6B1E2E] transition-colors" />
              {cartItemCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-[#6B1E2E] text-parchment text-xs font-ui font-medium rounded-full flex items-center justify-center shadow-lg"
                >
                  {cartItemCount}
                </motion.span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-[#6B1E2E]/10 rounded-xl transition-colors"
                >
                  {currentUser?.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full border border-parchment-dark object-cover" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6B1E2E] to-[#8B2E42] flex items-center justify-center">
                      <User className="w-4 h-4 text-parchment" />
                    </div>
                  )}
                  <ChevronDown className="w-4 h-4 text-mutedgray hidden lg:block" />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-parchment-dark overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-parchment-dark bg-gradient-to-r from-[#6B1E2E]/5 to-transparent">
                        <p className="font-ui font-medium text-ink">{currentUser?.displayName || 'Student'}</p>
                        <p className="text-xs text-mutedgray truncate">{currentUser?.email || 'No email provided'}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-ui text-ink hover:bg-[#6B1E2E]/5 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Dashboard
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-ui text-gold hover:bg-gold/5 transition-colors border-t border-parchment-dark"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      )}                      
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-ui text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#6B1E2E] to-[#8B2E42] text-parchment rounded-xl font-ui font-medium text-sm hover:shadow-lg hover:shadow-[#6B1E2E]/20 transition-all"
              >
                <User className="w-4 h-4" />
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 hover:bg-[#6B1E2E]/10 rounded-xl transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-ink" />
              ) : (
                <Menu className="w-5 h-5 text-ink" />
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-parchment border-t border-parchment-dark"
          >
            <div className="section-container py-4 space-y-4">
              <div className="space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-ui font-medium transition-colors ${
                        location.pathname === link.href 
                          ? 'bg-gradient-to-r from-[#6B1E2E] to-[#8B2E42] text-parchment' 
                          : 'text-ink hover:bg-[#6B1E2E]/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.name}
                    </Link>
                  );
                })}
              </div>

              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-[#6B1E2E] to-[#8B2E42] text-parchment rounded-xl font-ui font-medium"
                >
                  <User className="w-4 h-4" />
                  Login / Signup
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
