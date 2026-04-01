import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ADMIN_ROLES, ROLE_PERMISSIONS } from '../../constants/adminRoles';
import { useAdminStore } from '../../stores/adminStore';

/**
 * Temporary hardcoded super admins until `admin_users` table is active.
 * We inherit from the existing VITE_ADMIN_EMAILS architecture to ensure Zero Regression.
 */
const FALLBACK_ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || 'adityakuwad2003@gmail.com')
  .split(',')
  .map((e: string) => e.trim().toLowerCase());

export function useAdminAuth() {
  const { currentUser, loading: authLoading } = useAuth();
  const setAdminUser = useAdminStore((s) => s.setAdminUser);
  const adminRole = useAdminStore((s) => s.adminRole);

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    const verifyAdmin = async () => {
      setLoading(true);
      if (!currentUser) {
        setIsAdmin(false);
        setAdminUser(null, null);
        setLoading(false);
        return;
      }

      const email = (currentUser.email || '').toLowerCase();
      const isFallbackAdmin = FALLBACK_ADMIN_EMAILS.includes(email);

      // Phase 1: We treat any existing admin as a SUPER_ADMIN.
      // Phase 5 will fetch actual roles from Firestore `admin_users`.
      if (isFallbackAdmin) {
        setIsAdmin(true);
        setAdminUser(currentUser, ADMIN_ROLES.SUPER_ADMIN);
      } else {
        setIsAdmin(false);
        setAdminUser(null, null);
      }

      setLoading(false);
    };

    verifyAdmin();
  }, [currentUser, authLoading, setAdminUser]);

  const hasPermission = (module: string) => {
    if (!adminRole) return false;
    const permissions = ROLE_PERMISSIONS[adminRole];
    if (permissions.includes('*')) return true;
    return permissions.includes(module);
  };

  return {
    user: currentUser,
    role: adminRole,
    loading: loading || authLoading,
    isAdmin,
    hasPermission,
  };
}
