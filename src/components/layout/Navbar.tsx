import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, User, ChevronDown, LogOut, FileText, Store, Layers, Crown, Scale, ShieldCheck, Search, Gavel, Newspaper, Briefcase } from 'lucide-react';
import { useCartStore } from '@/store';
import { useAuth } from '@/contexts/AuthContext';
import { UniversalSearch } from '@/components/ui/UniversalSearch';

// v2.1.2 - Force update for Find Judgments visibility
// v2.1.3 - Force refresh & prominence
const navLinks = [
  { name: 'Case Law Finder', href: '/judgement-finder', icon: Gavel, isNew: true },
  { name: 'Marketplace', href: '/marketplace', icon: Store },
  { name: 'Live News', href: '/legal-news', icon: Newspaper },
  { name: 'Bundles', href: '/bundles', icon: Layers },
  { name: 'Subscription', href: '/subscription', icon: Crown },
  { name: 'Services', href: '/legal-services', icon: Scale },
  { name: 'VakilConnect', href: '/vakil-connect', icon: Briefcase, isNew: true },
  { name: 'Templates', href: '/templates', icon: FileText },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const { getTotalItems } = useCartStore();
  const { currentUser, logout, isPro, isMax } = useAuth();
  
  const isAuthenticated = !!currentUser;
  const isAdmin = !!(currentUser?.email &&
    (import.meta.env.VITE_ADMIN_EMAILS || 'adityakuwad2003@gmail.com')
      .split(',')
      .map((e: string) => e.trim().toLowerCase())
      .includes(currentUser.email.toLowerCase())
  );

  const cartItemCount = getTotalItems();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Cmd/Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <UniversalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <header
        className={`fixed top-0 left-0 right-0 z-[7000] transition-all duration-300 ${
          isScrolled
            ? 'bg-parchment/95 shadow-md'
            : 'bg-parchment/80'
        }`}
        style={isScrolled ? {
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        } : undefined}
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
                  Edu<span className="text-burgundy">Law</span>
                </span>
                <span className="text-[10px] text-mutedgray font-ui tracking-wider uppercase">Legal Notes Marketplace</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-3 flex-wrap justify-center flex-1 px-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg relative font-ui font-medium text-[13px] transition-colors group ${
                      isActive ? 'text-burgundy bg-burgundy/5' : 'text-ink hover:text-burgundy hover:bg-parchment-dark/30'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="whitespace-nowrap">{link.name}</span>
                    {link.isNew && (
                      <span className="ml-1 px-1.5 py-0.5 bg-gold text-ink text-[8px] font-black uppercase tracking-tighter rounded-full leading-none">NEW</span>
                    )}
                    <span className={`absolute -bottom-1 left-0 h-0.5 bg-gold transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`} />
                  </Link>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Open search"
                title="Search (Ctrl+K)"
                className="flex items-center gap-2 p-2 sm:p-2.5 hover:bg-burgundy/10 rounded-xl transition-all text-ink hover:text-burgundy"
              >
                <Search className="w-5 h-5" />
                <span className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 font-ui border border-slate-200 rounded-md px-1.5 py-0.5 bg-white/60">
                  <kbd className="font-mono">⌘K</kbd>
                </span>
              </button>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 sm:p-2.5 hover:bg-burgundy/10 rounded-xl transition-all duration-300 group"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="w-5 h-5 text-ink group-hover:text-burgundy transition-colors" />
                {cartItemCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-burgundy text-parchment text-xs font-ui font-medium rounded-full flex items-center justify-center shadow-lg"
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
                    className="flex items-center gap-2 p-2 hover:bg-burgundy/10 rounded-xl transition-colors"
                    aria-label="User menu"
                  >
                    <div className="relative">
                      {currentUser?.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt="Profile"
                          className="w-8 h-8 rounded-full border border-parchment-dark object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-burgundy to-burgundy-light flex items-center justify-center">
                          <User className="w-4 h-4 text-parchment" />
                        </div>
                      )}
                      {(isPro || isMax) && (
                        <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center shadow-sm ${isMax ? 'bg-gold' : 'bg-burgundy'}`}>
                          <Crown className="w-2.5 h-2.5 text-white" />
                        </span>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-mutedgray hidden lg:block" />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-parchment-dark overflow-hidden z-50"
                      >
                        <div className="p-3 border-b border-parchment-dark bg-gradient-to-r from-burgundy/5 to-transparent">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-ui font-medium text-ink truncate">{currentUser?.displayName || 'Student'}</p>
                            {(isPro || isMax) && (
                              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shrink-0 ${isMax ? 'bg-gold/20 text-gold' : 'bg-burgundy/15 text-burgundy'}`}>
                                <Crown className="w-2.5 h-2.5" />
                                {isMax ? 'Max' : 'Pro'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-mutedgray truncate">{currentUser?.email || 'No email provided'}</p>
                        </div>
                        <Link
                          to="/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-ui text-ink hover:bg-burgundy/5 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Dashboard
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
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
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-ui text-red-600 hover:bg-red-50 transition-colors border-t border-parchment-dark"
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
                  className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-burgundy to-burgundy-light text-parchment rounded-xl font-ui font-medium text-sm hover:shadow-lg hover:shadow-burgundy/20 transition-all"
                >
                  <User className="w-4 h-4" />
                  Login
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 sm:p-2.5 hover:bg-burgundy/10 rounded-xl transition-colors"
                aria-label="Toggle mobile menu"
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
              className="lg:hidden bg-parchment border-t border-parchment-dark overflow-hidden"
            >
              <div className="section-container py-4 space-y-4 max-h-[80vh] overflow-y-auto">
                {/* Mobile Search */}
                <button
                  onClick={() => { setIsMobileMenuOpen(false); setIsSearchOpen(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-ui font-medium text-ink bg-white border border-parchment-dark hover:border-burgundy/30 transition-colors"
                >
                  <Search className="w-4 h-4 text-mutedgray" />
                  <span className="text-mutedgray">Search anything...</span>
                </button>

                <div className="space-y-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.name}
                        to={link.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-ui font-medium transition-colors min-h-[48px] ${
                          location.pathname === link.href 
                            ? 'bg-gradient-to-r from-burgundy to-burgundy-light text-parchment' 
                            : 'text-ink hover:bg-burgundy/10'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="flex-1">{link.name}</span>
                        {link.isNew && (
                          <span className="ml-auto px-1.5 py-0.5 bg-gold text-ink text-[8px] font-black uppercase rounded-full">NEW</span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {!isAuthenticated && (
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-burgundy to-burgundy-light text-parchment rounded-xl font-ui font-medium min-h-[48px]"
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
    </>
  );
}
