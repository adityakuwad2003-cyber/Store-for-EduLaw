import { useAdminStore } from '../../stores/adminStore';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Bell, Search, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TopBar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useAdminStore();
  const { logout } = useAuth();

  return (
    <header className="h-16 bg-white/80 border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40 backdrop-blur-md">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title="Toggle sidebar"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders, notes, users..."
            title="Search admin"
            aria-label="Search admin"
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 w-64 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* View Storefront */}
        <Link
          to="/"
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors border border-slate-200"
        >
          ↗ View Storefront
        </Link>

        {/* Notifications */}
        <button
          className="relative p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold border-2 border-white"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors text-sm font-medium border border-transparent hover:border-red-200"
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
