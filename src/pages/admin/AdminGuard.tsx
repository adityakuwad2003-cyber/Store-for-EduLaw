import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/admin/useAdminAuth';
import { Loader2 } from 'lucide-react';

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading, isAdmin } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
        <p className="text-parchment/60 font-ui text-sm animate-pulse">Authenticating secure session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    // If logged in, but not an admin, redirect to public homepage
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}
