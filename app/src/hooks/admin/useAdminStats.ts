import { useState, useEffect, useCallback } from "react";
import { auth } from "../../lib/firebase";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  ordersToday: number;
  totalUsers: number;
  totalNotes: number;
  totalBundles: number;
  recentOrders: RecentOrder[];
}

export interface RecentOrder {
  id: string;
  title: string;
  userEmail: string;
  price: number;
  status: string;
  purchasedAt: string | null;
  razorpay_payment_id: string | null;
}

export function useAdminStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      const user = auth.currentUser;
      if (!user) {
        setError("Not authenticated");
        return;
      }
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/dashboard-stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Error ${res.status}`);
      }
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 5 minutes — the server also caches for 2 min, so
    // polling faster than this just wastes Firestore quota.
    const interval = setInterval(fetchStats, 300_000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
}
