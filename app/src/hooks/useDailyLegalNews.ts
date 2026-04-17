import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface LegalNewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  court: string;
  summary: string;
  publishedAt: string;
  dateString: string;
  category: string;
  isAI: boolean;
}

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function useDailyLegalNews() {
  const [items, setItems]     = useState<LegalNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchNews() {
      try {
        setLoading(true);
        setError(null);

        const today = todayString();
        // Single where clause — no composite index needed.
        // At most ~60 docs exist at any time (cron keeps 3 days × 20 items).
        // Filter dateString and sort client-side.
        const q = query(
          collection(db, 'playground_content'),
          where('contentType', '==', 'daily_news'),
        );
        const snap = await getDocs(q);
        if (cancelled) return;

        const all = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<LegalNewsItem, 'id'>) }));

        // Prefer today, fall back to most-recent available date
        let filtered = all.filter(d => d.dateString === today);
        if (filtered.length === 0) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          filtered = all.filter(d => d.dateString === yesterday.toISOString().split('T')[0]);
        }
        if (filtered.length === 0 && all.length > 0) {
          // Use whatever is newest
          const latest = all.reduce((a, b) => (a.dateString > b.dateString ? a : b)).dateString;
          filtered = all.filter(d => d.dateString === latest);
        }

        if (!cancelled) {
          setItems(filtered.sort((a, b) => a.court.localeCompare(b.court)));
        }
      } catch (err) {
        if (!cancelled) setError('Could not load news. Please try again later.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchNews();
    return () => { cancelled = true; };
  }, []);

  const sc = items.filter(i => i.court === 'Supreme Court');
  const hc = items.filter(i => i.court === 'High Court');

  return { items, sc, hc, loading, error };
}
