import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Newspaper, Scale, Gavel, Calendar, ArrowRight, RefreshCw } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SEO } from '@/components/SEO';
import { Helmet } from 'react-helmet-async';

interface NewsItem {
  id: string;
  title: string;
  court: string;
  summary: string;
  category: string;
  source: string;
  dateString: string;
  publishedAt: string;
  contentType: string;
}

function slugDate(dateString: string): string {
  // "2026-04-15" → "15 April 2026"
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export default function LegalNewsIndex() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const q = query(
          collection(db, 'playground_content'),
          where('contentType', '==', 'daily_news'),
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as NewsItem[];
        data.sort((a: any, b: any) => {
          const ta = a.createdAt?.toMillis?.() ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? 0;
          return tb - ta;
        });
        if (!cancelled) setItems(data);
      } catch (err) {
        console.error('LegalNewsIndex fetch error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Group by dateString, most recent first
  const byDate: Record<string, NewsItem[]> = {};
  for (const item of items) {
    const k = item.dateString ?? 'Unknown';
    (byDate[k] ||= []).push(item);
  }
  const sortedDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  // JSON-LD ItemList for Google
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'EduLaw Daily Legal News — Supreme Court & High Court Updates',
    description: 'Daily curated legal news from the Supreme Court of India and High Courts — case updates, judgments, and legal developments for law students and practitioners.',
    url: 'https://store.theedulaw.in/legal-news',
    numberOfItems: items.length,
    itemListElement: items.slice(0, 20).map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://store.theedulaw.in/legal-news/${item.id}`,
      name: item.title,
    })),
  };

  return (
    <div className="min-h-screen bg-parchment">
      <SEO
        title="Daily Legal News — Supreme Court & High Court Updates"
        description="Daily curated legal news from the Supreme Court of India and High Courts. Case updates, judgments, and legal developments for law students and practitioners."
        canonical="/legal-news"
        ogType="website"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <meta name="keywords" content="Supreme Court India news, High Court judgments, legal news today, Indian law updates, EduLaw legal digest" />
      </Helmet>

      {/* Hero */}
      <div className="pt-24 pb-12 bg-gradient-to-b from-ink to-ink/90 text-parchment">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/legal-playground#legal-news" className="text-gold/70 hover:text-gold text-sm font-ui transition-colors">
              ← Legal Playground
            </Link>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gold/20 flex items-center justify-center">
              <Newspaper className="w-6 h-6 text-gold" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-parchment leading-tight">
              Daily Legal News
            </h1>
          </div>
          <p className="font-body text-parchment/70 text-lg max-w-2xl leading-relaxed">
            Fresh Supreme Court and High Court updates — curated daily for law students, 
            advocates, and legal professionals across India.
          </p>
          {!loading && items.length > 0 && (
            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-parchment/10">
              <div className="text-center">
                <p className="font-display text-2xl text-gold">{items.length}</p>
                <p className="text-xs font-ui text-parchment/50">Total Articles</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl text-gold">{sortedDates.length}</p>
                <p className="text-xs font-ui text-parchment/50">Days Covered</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl text-gold">
                  {items.filter(i => i.court === 'Supreme Court').length}
                </p>
                <p className="text-xs font-ui text-parchment/50">SC Updates</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="w-7 h-7 text-gold/50 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24">
            <Newspaper className="w-12 h-12 text-ink/10 mx-auto mb-4" />
            <p className="font-body text-mutedgray">No news articles available yet. Check back tomorrow!</p>
            <Link
              to="/legal-playground"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-burgundy text-parchment rounded-xl font-ui text-sm font-semibold hover:bg-burgundy/90 transition-colors"
            >
              Explore Legal Playground
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {sortedDates.map((date, di) => (
              <motion.section
                key={date}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: di * 0.05 }}
                aria-labelledby={`date-${date}`}
              >
                {/* Date heading */}
                <div className="flex items-center gap-3 mb-5">
                  <Calendar className="w-4 h-4 text-gold shrink-0" />
                  <h2
                    id={`date-${date}`}
                    className="font-display text-xl text-ink"
                  >
                    {slugDate(date)}
                  </h2>
                  <div className="flex-1 h-px bg-ink/10" />
                  <span className="text-xs font-ui text-mutedgray">
                    {byDate[date].length} {byDate[date].length === 1 ? 'update' : 'updates'}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-3">
                  {byDate[date].map(item => {
                    const isSC = item.court === 'Supreme Court';
                    return (
                      <Link
                        key={item.id}
                        to={`/legal-news/${item.id}`}
                        className="group flex items-start gap-4 p-4 bg-white rounded-2xl border border-ink/6 hover:border-gold/30 hover:shadow-md transition-all"
                      >
                        {/* Court icon */}
                        <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${isSC ? 'bg-burgundy/10' : 'bg-teal-50'}`}>
                          {isSC
                            ? <Scale className="w-4 h-4 text-burgundy" />
                            : <Gavel className="w-4 h-4 text-teal-600" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Badges */}
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${isSC ? 'bg-burgundy/10 text-burgundy' : 'bg-teal-100 text-teal-700'}`}>
                              {isSC ? 'SC' : 'HC'}
                            </span>
                            <span className="text-[10px] font-bold text-mutedgray bg-parchment px-2 py-0.5 rounded-md">
                              {item.category}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="font-ui font-semibold text-ink text-sm leading-snug group-hover:text-burgundy transition-colors line-clamp-2">
                            {item.title}
                          </h3>

                          {/* Summary preview */}
                          {item.summary && (
                            <p className="text-xs font-body text-mutedgray mt-1 line-clamp-2 leading-relaxed">
                              {item.summary}
                            </p>
                          )}
                        </div>

                        <ArrowRight className="w-4 h-4 text-ink/20 group-hover:text-gold shrink-0 mt-0.5 transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              </motion.section>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {!loading && items.length > 0 && (
          <div className="mt-16 pt-10 border-t border-ink/10 text-center">
            <p className="font-body text-mutedgray text-sm mb-4">
              New articles added every morning — bookmark this page for daily legal updates.
            </p>
            <Link
              to="/legal-playground"
              className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-parchment rounded-xl font-ui font-semibold text-sm hover:bg-ink/90 transition-colors"
            >
              Explore Legal Playground <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
