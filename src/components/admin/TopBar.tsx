import { useAdminStore } from '../../stores/adminStore';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Bell, Search, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TopBar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useAdminStore();
  const { logout } = useAuth();

  return (
    <header className={`h-16 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 transition-all duration-300 ${
      sidebarCollapsed ? 'ml-20' : 'ml-64'
    }`}>
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button 
          className="lg:hidden p-2 hover:bg-white/10 rounded-lg text-parchment/60 transition-colors"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment/40" />
          <input 
            type="text" 
            placeholder="Search orders, notes, users..." 
            className="pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-parchment/80 font-ui focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 w-64 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Marketplace Link */}
        <Link 
          to="/" 
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-ui text-parchment/60 hover:text-parchment transition-colors border border-white/10"
        >
          View Storefront
        </Link>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-white/10 rounded-lg text-parchment/60 hover:text-gold transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-ink"></span>
        </button>

        {/* Logout */}
        <div className="h-6 w-px bg-white/10 mx-1"></div>
        <button 
          onClick={logout}
          className="flex items-center gap-2 p-2 hover:bg-red-500/10 rounded-lg text-parchment/60 hover:text-red-400 transition-colors"
          title="Sign out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
