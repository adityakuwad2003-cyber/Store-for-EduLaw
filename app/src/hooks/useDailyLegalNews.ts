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
  contentType?: string;
}

function dateStringFor(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

/**
 * Fetches today's legal news (or the most recent available day).
 *
 * QUOTA-SAFE: Queries by exact dateString so each call reads only that
 * day's ~50 documents — never the entire collection.  No composite index
 * required because we filter on a single field ('dateString').
 */
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

        // Try today, yesterday, then day-before-yesterday (covers weekends / missed cron runs).
        // Each query reads at most ~50 docs (the cron's daily cap) — never the whole collection.
        const datesToTry = [
          dateStringFor(0), // today
          dateStringFor(1), // yesterday
          dateStringFor(2), // 2 days ago
        ];

        let filtered: LegalNewsItem[] = [];

        for (const dateStr of datesToTry) {
          if (filtered.length > 0) break;
          const q = query(
            collection(db, 'playground_content'),
            where('dateString', '==', dateStr),
          );
          const snap = await getDocs(q);
          if (cancelled) return;

          const docs = snap.docs
            .map(d => ({ id: d.id, ...(d.data() as Omit<LegalNewsItem, 'id'>) }))
            .filter(d => d.contentType === 'daily_news');

          if (docs.length > 0) filtered = docs;
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
