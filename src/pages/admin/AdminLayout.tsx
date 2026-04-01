import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/admin/Sidebar';
import { TopBar } from '../../components/admin/TopBar';
import { useAdminStore } from '../../stores/adminStore';

export default function AdminLayout() {
  const { sidebarCollapsed } = useAdminStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink via-[#1a0a0f] to-[#2d1020] text-parchment flex font-sans">
      <Sidebar />
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <TopBar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
