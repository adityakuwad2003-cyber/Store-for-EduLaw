import { Link, useLocation } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';
import { 
  BarChart3, BookOpen, Users,
  Settings, Layers, ShoppingCart,
  ChevronLeft, ChevronRight, ShieldCheck
} from 'lucide-react';
import { useAdminAuth } from '../../hooks/admin/useAdminAuth';

const NAV_ITEMS = [
  { group: 'Main', items: [
    { name: 'Overview', path: '/admin', icon: BarChart3, permission: '*' }
  ]},
  { group: 'Products', items: [
    { name: 'Notes', path: '/admin/notes', icon: BookOpen, permission: 'notes' },
    { name: 'Bundles', path: '/admin/bundles', icon: Layers, permission: 'bundles' },
  ]},
  { group: 'Sales', items: [
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart, permission: 'orders.view' },
  ]},
  { group: 'Users & Community', items: [
    { name: 'All Users', path: '/admin/users', icon: Users, permission: 'users' },
  ]},
  { group: 'System', items: [
    { name: 'Settings', path: '/admin/settings', icon: Settings, permission: 'super_admin' }
  ]}
];

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useAdminStore();
  const location = useLocation();
  const { user, role, hasPermission } = useAdminAuth();

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen bg-ink border-r border-white/10 flex flex-col transition-all duration-300 z-50 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-gold to-[#b8922a] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-ink" />
            </div>
            <span className="font-display text-parchment whitespace-nowrap">EduLaw Admin</span>
          </div>
        )}
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 hover:bg-white/10 rounded-lg text-parchment/60 hover:text-gold transition-colors ml-auto shrink-0"
        >
          {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {NAV_ITEMS.map((group, idx) => {
          // Filter items by permission
          const visibleItems = group.items.filter(i => hasPermission(i.permission) || i.permission === '*');
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx}>
              {!sidebarCollapsed && (
                <div className="px-3 mb-2 text-[10px] font-ui font-semibold text-parchment/40 uppercase tracking-widest">
                  {group.group}
                </div>
              )}
              <div className="space-y-1">
                {visibleItems.map(item => {
                  const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin');
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-ui transition-all ${
                        isActive 
                          ? 'bg-gold/10 text-gold border-r-2 border-gold font-medium' 
                          : 'text-parchment/60 hover:bg-white/5 hover:text-parchment'
                      }`}
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-gold' : 'text-parchment/40'}`} />
                      {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-white/10 shrink-0">
        <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-burgundy flex items-center justify-center shrink-0">
            <span className="text-gold font-display text-sm">
               {user?.email?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-ui text-parchment truncate">{user?.email}</p>
              <p className="text-[10px] text-parchment/40 uppercase tracking-wider font-semibold">{role?.replace('_', ' ') || 'Admin'}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
