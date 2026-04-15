import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Eye, User, Tag, BookOpen } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { SEO } from '@/components/SEO';

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

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setIsLoading(false); return; }

    async function fetchArticle() {
      try {
        const q = query(
          collection(db, 'blog_articles'),
          where('slug', '==', slug)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const doc = snap.docs[0];
          const data = { id: doc.id, ...doc.data() } as Article;
          if (data.status === 'published') {
            setArticle(data);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Fetch article error:", err);
      }
      setArticle(null);
      setIsLoading(false);
    }

    fetchArticle();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="pt-24 min-h-screen bg-parchment flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-burgundy border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="pt-24 min-h-screen bg-parchment flex flex-col items-center justify-center gap-4 px-4 text-center">
        <BookOpen className="w-16 h-16 text-mutedgray opacity-30" />
        <h1 className="font-display text-2xl text-ink">Article Not Found</h1>
        <p className="font-body text-mutedgray">This article may have been moved or is no longer available.</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 border border-parchment-dark rounded-xl font-ui text-sm text-ink hover:bg-parchment-dark transition-colors"
          >
            Go Back
          </button>
          <Link
            to="/legal-hub"
            className="px-5 py-2.5 bg-burgundy text-parchment rounded-xl font-ui text-sm hover:bg-burgundy-light transition-colors"
          >
            Browse Legal Hub
          </Link>
        </div>
      </div>
    );
  }

  const publishedDate = article.createdAt?.toDate
    ? article.createdAt.toDate()
    : article.createdAt
    ? new Date(article.createdAt)
    : new Date();

  return (
    <div className="min-h-screen bg-parchment">
      <SEO
        title={`${article.title} — The Legal Hub`}
        description={article.excerpt || article.title}
        canonical={`/blog/${slug}`}
      />

      {/* Top bar */}
      <div className="pt-20 pb-4 bg-parchment border-b border-ink/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            to="/legal-hub"
            className="inline-flex items-center gap-2 text-sm font-ui text-mutedgray hover:text-ink transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Legal Hub
          </Link>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Category badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-burgundy/10 text-burgundy rounded-full font-ui text-xs font-bold uppercase tracking-widest mb-5">
            {article.category}
          </span>

          {/* Headline */}
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink leading-tight mb-6">
            {article.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-ui text-mutedgray mb-8 pb-8 border-b border-ink/10">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {article.author || 'EduLaw Editorial'}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {format(publishedDate, 'MMMM d, yyyy')}
            </span>
            {typeof article.views === 'number' && (
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                {article.views.toLocaleString()} reads
              </span>
            )}
          </div>

          {/* Featured image */}
          {article.featuredImage && (
            <div className="mb-8 rounded-2xl overflow-hidden">
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Excerpt / lead */}
          {article.excerpt && (
            <p className="font-body text-lg text-ink/80 leading-relaxed mb-8 border-l-4 border-gold pl-5 italic">
              {article.excerpt}
            </p>
          )}

          {/* Body */}
          <div
            className="prose prose-stone prose-headings:font-display prose-headings:text-ink prose-p:font-body prose-p:text-ink/80 prose-p:leading-relaxed prose-a:text-burgundy prose-blockquote:border-l-4 prose-blockquote:border-gold prose-blockquote:font-body prose-blockquote:text-mutedgray max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content || '' }}
          />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-10 pt-8 border-t border-ink/10 flex flex-wrap gap-2">
              <Tag className="w-4 h-4 text-mutedgray mt-0.5" />
              {article.tags.map(tag => (
                <Link
                  key={tag}
                  to={`/legal-hub?q=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 bg-parchment-dark rounded-full font-ui text-xs text-mutedgray hover:text-ink hover:bg-parchment transition-all"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Back CTA */}
          <div className="mt-12 pt-8 border-t border-ink/10 flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/legal-hub"
              className="inline-flex items-center gap-2 px-6 py-3 bg-burgundy text-parchment rounded-xl font-ui font-semibold text-sm hover:bg-burgundy-light transition-all shadow-xl shadow-burgundy/20"
            >
              <BookOpen className="w-4 h-4" />
              More Legal Insights
            </Link>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 border border-parchment-dark rounded-xl font-ui text-sm text-ink hover:bg-parchment-dark transition-all"
            >
              Browse Study Notes
            </Link>
          </div>
        </motion.div>
      </article>
    </div>
  );
}
