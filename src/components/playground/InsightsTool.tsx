import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Newspaper, ArrowRight, Share2, Check } from 'lucide-react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// --- Types ---
interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: 'published' | 'draft';
  featuredImage?: string;
  excerpt?: string;
  readTime?: string;
  createdAt?: any;
}

const FIXED_BLOG_CATEGORIES = [
  'Landmark Judgements',
  'AI & Tech Developments',
  'Criminal Law',
  'War & Geopolitics',
  'Legal Updates',
  'Case Studies',
  'News',
];

function slugifyCategory(cat: string) {
  return cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/** ─── Article Card ─── */
function ArticleCard({ article }: { article: Article }) {
  const [copied, setCopied] = useState(false);

  const handleLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareData = {
      title: article.title,
      url: `${window.location.origin}/blog/${article.slug}`
    };
    if (navigator.share) {
      try { 
        await navigator.share(shareData);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (_) {}
    } else {
      navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="group bg-white border border-ink/10 rounded-2xl overflow-hidden hover:border-gold/30 hover:shadow-xl transition-all h-full flex flex-col"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={article.featuredImage || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800'}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          alt={article.title}
        />
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <span className="px-2.5 py-1 bg-burgundy/90 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
            {article.category}
          </span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-3">
        <h4 className="font-display text-lg text-ink line-clamp-2 leading-snug group-hover:text-burgundy transition-colors">
          {article.title}
        </h4>
        <p className="font-body text-xs text-ink/60 line-clamp-3 leading-relaxed">
          {article.excerpt}
        </p>

        <div className="mt-auto pt-4 flex items-center justify-between gap-3 border-t border-ink/5">
          <Link
            to={`/blog/${article.slug}`}
            className="flex items-center gap-1.5 text-[11px] font-ui font-black text-burgundy uppercase tracking-widest hover:translate-x-1 transition-transform"
          >
            Read Full <ArrowRight className="w-3 h-3" />
          </Link>

          <button
            onClick={handleLink}
            className="p-2 bg-ink/5 hover:bg-gold/10 hover:text-gold rounded-xl transition-all"
            title="Share article"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Share2 className="w-3.5 h-3.5 text-ink/30" />}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export const InsightsTool: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticles() {
      setLoading(true);
      try {
        const q = query(collection(db, 'blog_articles'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Article[];
        setArticles(data.filter(a => a.status === 'published'));
      } catch (err) {
        console.error('Insights articles error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadArticles();
  }, []);

  const articlesByCategory: Record<string, Article[]> = {};
  for (const a of articles) {
    const cat = FIXED_BLOG_CATEGORIES.includes(a.category) ? a.category : 'Other Insights';
    if (!articlesByCategory[cat]) articlesByCategory[cat] = [];
    articlesByCategory[cat].push(a);
  }

  const activeCategories = [
    ...FIXED_BLOG_CATEGORIES.filter(c => (articlesByCategory[c]?.length ?? 0) > 0),
    ...(articlesByCategory['Other Insights']?.length ? ['Other Insights'] : []),
  ];

  return (
    <div className="flex flex-col gap-10">
      <header>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/20 text-[#7a5c1e] rounded-full font-ui text-[10px] font-black uppercase tracking-widest mb-4">
          <Newspaper className="w-3 h-3" /> Knowledge Deep Dives
        </div>
        <h2 className="font-display text-3xl sm:text-4xl text-ink">Legal Insights</h2>
        <p className="font-body text-ink/60 mt-2 text-sm sm:text-base">In-depth analysis of landmark laws and current events</p>
      </header>

      <div className="grid lg:grid-cols-12 gap-10">
        <aside className="lg:col-span-3">
          <div className="sticky top-28 space-y-8">
            <nav className="flex flex-col gap-1.5">
              <p className="text-[10px] font-ui font-black text-ink/30 uppercase tracking-widest mb-2 px-4">Categories</p>
              {activeCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => document.getElementById(`blog-cat-${slugifyCategory(cat)}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="group flex items-center justify-between px-4 py-3 rounded-xl font-ui text-sm font-bold text-ink/60 hover:text-burgundy hover:bg-burgundy/5 transition-all text-left"
                >
                  <span className="truncate">{cat}</span>
                  <span className="px-2 py-0.5 bg-ink/5 text-ink/40 group-hover:bg-burgundy/10 group-hover:text-burgundy rounded-full text-[10px] transition-colors">
                    {articlesByCategory[cat]?.length || 0}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <main className="lg:col-span-9 space-y-16">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[4/3] bg-white/60 rounded-2xl animate-pulse" />)}
            </div>
          ) : activeCategories.length === 0 ? (
            <div className="text-center py-20 bg-white/40 rounded-3xl border border-dashed border-ink/10">
              <p className="font-ui text-sm text-ink/40">New insights being published soon.</p>
            </div>
          ) : (
            activeCategories.map(cat => (
              <div key={cat} id={`blog-cat-${slugifyCategory(cat)}`} className="scroll-mt-32">
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="font-display text-xl text-ink pr-4 whitespace-nowrap">{cat}</h3>
                  <div className="h-px bg-gold/20 flex-1" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {(articlesByCategory[cat] ?? []).map(article => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
};

export default InsightsTool;
