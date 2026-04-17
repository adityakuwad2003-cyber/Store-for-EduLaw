import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Newspaper, Calendar,
  User, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { SEO } from '@/components/SEO';
import { ExpandableCard } from '@/components/ui/expandable-card';

// ─── Types ─────────────────────────────────────────────────────────────────
export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  category: string;
  author: string;
  tags: string[];
  status: 'published' | 'draft' | 'archived';
  views: number;
  seo?: {
    metaTitle: string;
    metaDesc: string;
    keywords: string;
  };
  createdAt: any;
  updatedAt?: any;
}

// ─── Fixed blog categories ──────────────────────────────────────────────────
const FIXED_BLOG_CATEGORIES = [
  'Landmark Judgements',
  'AI & Tech Developments',
  'Criminal Law',
  'War & Geopolitics',
  'Legal Updates',
  'Case Studies',
  'News',
];

// ─── Helpers ───────────────────────────────────────────────────────────────
function slugifyCategory(cat: string) {
  return cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

// ─── Main Page Component ───────────────────────────────────────────────────
export default function LegalHub() {
  // Articles state
  const [articles, setArticles]               = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);

  // Load articles from Firestore
  useEffect(() => {
    async function loadArticles() {
      setArticlesLoading(true);
      try {
        const q = query(collection(db, 'blog_articles'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const fbData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Article[];
        setArticles(fbData.filter(a => a.status === 'published'));
      } catch (err) {
        console.error('Firestore articles error:', err);
      } finally {
        setArticlesLoading(false);
      }
    }
    loadArticles();
  }, []);

  // Build categorised articles map
  const articlesByCategory: Record<string, Article[]> = {};
  for (const article of articles) {
    const cat = FIXED_BLOG_CATEGORIES.includes(article.category)
      ? article.category
      : 'Other Insights';
    if (!articlesByCategory[cat]) articlesByCategory[cat] = [];
    articlesByCategory[cat].push(article);
  }
  const activeBlogCategories = [
    ...FIXED_BLOG_CATEGORIES.filter(c => (articlesByCategory[c]?.length ?? 0) > 0),
    ...(articlesByCategory['Other Insights']?.length ? ['Other Insights'] : []),
  ];

  // Section refs for smooth-scroll jump links
  const blogsRef      = useRef<HTMLElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-parchment pt-20">
      <SEO
        title="Legal Blogs & Insights — Law Analysis, Judgements & News"
        description="Daily legal insights, landmark judgements simplified, and critical law analysis for Indian law students and practitioners. Updated every weekday."
        canonical="/legal-hub"
      />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative py-12 sm:py-20 border-b border-ink/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gold/5 -skew-x-12 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-burgundy/5 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none" />

        <div className="section-container relative z-10 px-4">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-gold/20 text-[#7a5c1e] rounded-full font-ui text-[10px] font-black uppercase tracking-widest mb-6"
            >
              <Newspaper className="w-3 h-3" /> Legal Blogs
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl text-ink leading-[1.1] mb-6"
            >
              Legal <span className="text-burgundy italic">Blogs & Insights.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-body text-base sm:text-lg text-ink/70 leading-relaxed mb-10 max-w-2xl"
            >
              A curated space for Indian law students. Whether it's the latest high court judgment or a tricky core concept, we simplify the complex.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2 sm:gap-4"
            >
              {[
                { label: 'Legal Blogs',  icon: Newspaper, ref: blogsRef },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.ref)}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-ui text-sm font-bold bg-white/50 text-ink/60 hover:bg-white hover:text-ink border border-ink/5 transition-all"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 1 — BLOGS
      ══════════════════════════════════════════════════════════════════ */}
      <section ref={blogsRef} id="blogs" className="py-16 sm:py-20 border-b border-ink/10 scroll-mt-20">
        <div className="section-container px-4">
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Left Sidebar: Categories */}
            <aside className="lg:col-span-3">
              <div className="sticky top-28 space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/20 text-[#7a5c1e] rounded-full font-ui text-[10px] font-black uppercase tracking-widest mb-4">
                    <Newspaper className="w-3 h-3" /> Area of Knowledge
                  </div>
                  <h2 className="font-display text-3xl text-ink">Legal Insights</h2>
                </div>

                <nav className="flex flex-col gap-1.5">
                  {activeBlogCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        document
                          .getElementById(`blog-cat-${slugifyCategory(cat)}`)
                          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="group flex items-center justify-between px-4 py-3 rounded-xl font-ui text-sm font-bold text-ink/60 hover:text-burgundy hover:bg-burgundy/5 transition-all text-left"
                    >
                      <span className="truncate">{cat}</span>
                      <span className="px-2 py-0.5 bg-ink/5 text-ink/40 group-hover:bg-burgundy/10 group-hover:text-burgundy rounded-full text-[10px] transition-colors">
                        {articlesByCategory[cat]?.length || 0}
                      </span>
                    </button>
                  ))}
                  {activeBlogCategories.length === 0 && !articlesLoading && (
                    <p className="text-xs text-mutedgray italic px-4">New highlights being published soon...</p>
                  )}
                </nav>
              </div>
            </aside>

            {/* Main Content: Article Cards grouped by category */}
            <div className="lg:col-span-9 space-y-20">
              {articlesLoading ? (
                <div className="space-y-12">
                  {[1, 2].map(i => (
                    <div key={i} className="animate-pulse space-y-4">
                      <div className="h-64 bg-white/60 rounded-3xl" />
                      <div className="h-8 bg-white/60 w-3/4 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {activeBlogCategories.map((cat) => (
                    <div 
                      key={cat} 
                      id={`blog-cat-${slugifyCategory(cat)}`} 
                      className="scroll-mt-28"
                    >
                      <div className="flex items-center gap-4 mb-8">
                        <div className="h-px bg-gold/20 flex-1 hidden sm:block" />
                        <h3 className="font-display text-xl sm:text-2xl text-ink px-4 bg-parchment relative z-10">{cat}</h3>
                        <div className="h-px bg-gold/20 flex-1 hidden sm:block" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {(articlesByCategory[cat] ?? []).map((article) => (
                          <ArticleCard key={article.id} article={article} />
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ───────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-12 bg-ink text-parchment">
        <div className="section-container text-center px-4">
          <p className="font-display text-xl sm:text-2xl mb-2">Deepen Your Legal Knowledge</p>
          <p className="font-ui text-sm text-parchment/60 mb-6">
            Explore our full notes library, mock tests, and subscription plans.
          </p>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-gold text-ink rounded-xl font-ui font-black text-sm hover:bg-gold-light transition-all shadow-lg shadow-gold/20"
          >
            Browse Notes Library <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// ─── Article Card ──────────────────────────────────────────────────────────
function ArticleCard({ article }: { article: Article }) {
  return (
    <ExpandableCard
      title={article.title}
      description={article.category}
      src={article.featuredImage || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800'}
      className="h-full"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4 text-xs font-ui font-bold text-gold uppercase tracking-widest pb-6 border-b border-gold/10">
          <span className="flex items-center gap-2"><Calendar size={14} /> {article.createdAt?.toDate ? format(article.createdAt.toDate(), 'MMM d, yyyy') : 'Recently'}</span>
          <span className="w-1 h-1 rounded-full bg-gold/30" />
          <span className="flex items-center gap-2"><User size={14} /> {article.author || 'EduLaw Editor'}</span>
        </div>
        
        <div 
          className="prose prose-slate max-w-none text-ink/80 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: article.content }} 
        />

        <div className="pt-10 flex justify-center">
            <Link 
              to={`/blog/${article.slug}`}
              className="px-8 py-3 bg-burgundy text-white rounded-xl font-ui font-black uppercase tracking-widest text-xs hover:bg-burgundy-light transition-all shadow-lg active:scale-95"
            >
              Open Full Reading Mode
            </Link>
        </div>
      </div>
    </ExpandableCard>
  );
}
