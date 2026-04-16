import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Scale, Gavel, ExternalLink, BookOpen, Calendar, Tag, Share2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SEO } from '@/components/SEO';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';

interface NewsItem {
  id: string;
  title: string;
  court: string;
  summary: string;
  category: string;
  source: string;
  url: string;
  dateString: string;
  publishedAt: string;
  contentType: string;
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function truncate(text: string, max: number): string {
  if (!text) return '';
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}

export default function LegalNewsArticle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<NewsItem | null | undefined>(undefined);

  useEffect(() => {
    if (!id) { setItem(null); return; }
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'playground_content', id));
        if (!cancelled) {
          if (snap.exists() && snap.data().contentType === 'daily_news') {
            setItem({ id: snap.id, ...snap.data() } as NewsItem);
          } else {
            setItem(null);
          }
        }
      } catch (err) {
        console.error('LegalNewsArticle fetch error:', err);
        if (!cancelled) setItem(null);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (item === undefined) {
    return (
      <div className="pt-24 min-h-screen bg-parchment flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-burgundy border-t-transparent animate-spin" />
      </div>
    );
  }

  // ─── 404 ──────────────────────────────────────────────────────────────────
  if (!item) {
    return (
      <div className="pt-24 min-h-screen bg-parchment flex flex-col items-center justify-center gap-4 px-4 text-center">
        <Gavel className="w-16 h-16 text-mutedgray opacity-20" />
        <h1 className="font-display text-2xl text-ink">Article Not Found</h1>
        <p className="font-body text-mutedgray text-sm max-w-sm">
          This news item may have been removed or is no longer available. 
          New articles are added every morning.
        </p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 border border-ink/15 rounded-xl font-ui text-sm text-ink hover:bg-parchment-dark transition-colors"
          >
            Go Back
          </button>
          <Link
            to="/legal-news"
            className="px-5 py-2.5 bg-burgundy text-parchment rounded-xl font-ui text-sm font-semibold hover:bg-burgundy/90 transition-colors"
          >
            All Legal News
          </Link>
        </div>
      </div>
    );
  }

  const isSC = item.court === 'Supreme Court';
  const articleUrl = `https://store.theedulaw.in/legal-news/${item.id}`;
  const metaDescription = truncate(item.summary, 155) || `${item.court} update on ${item.category} — ${formatDate(item.dateString)}`;

  // JSON-LD NewsArticle schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.title,
    description: metaDescription,
    url: articleUrl,
    datePublished: item.dateString,
    dateModified: item.dateString,
    author: {
      '@type': 'Organization',
      name: 'EduLaw',
      url: 'https://store.theedulaw.in',
    },
    publisher: {
      '@type': 'Organization',
      name: 'The EduLaw Store',
      url: 'https://store.theedulaw.in',
      logo: {
        '@type': 'ImageObject',
        url: 'https://store.theedulaw.in/logo.png',
      },
    },
    about: [
      { '@type': 'Thing', name: item.court },
      { '@type': 'Thing', name: item.category },
      { '@type': 'Thing', name: 'Indian Law' },
    ],
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://store.theedulaw.in' },
        { '@type': 'ListItem', position: 2, name: 'Legal Playground', item: 'https://store.theedulaw.in/legal-playground' },
        { '@type': 'ListItem', position: 3, name: 'Legal News', item: 'https://store.theedulaw.in/legal-news' },
        { '@type': 'ListItem', position: 4, name: item.title, item: articleUrl },
      ],
    },
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: item.title, text: metaDescription, url: articleUrl });
    } else {
      await navigator.clipboard.writeText(articleUrl);
      toast.success('Link copied!');
    }
  };

  return (
    <div className="min-h-screen bg-parchment">
      <SEO
        title={item.title}
        description={metaDescription}
        canonical={`/legal-news/${item.id}`}
        ogType="article"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <meta property="article:published_time" content={item.dateString} />
        <meta property="article:section" content={item.category} />
        <meta property="article:tag" content={item.court} />
        <meta property="article:tag" content={item.category} />
        <meta property="article:tag" content="Indian Law" />
        <meta name="keywords" content={`${item.court} judgment, ${item.category} news India, Indian judiciary update, EduLaw legal news, ${item.category.toLowerCase()} law update`} />
      </Helmet>

      {/* Top strip */}
      <div className="pt-20 pb-5 border-b border-ink/10 bg-parchment/95">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-ui text-mutedgray mb-5 flex-wrap">
            <Link to="/" className="hover:text-ink transition-colors">Home</Link>
            <span>/</span>
            <Link to="/legal-playground" className="hover:text-ink transition-colors">Legal Playground</Link>
            <span>/</span>
            <Link to="/legal-news" className="hover:text-ink transition-colors">Legal News</Link>
            <span>/</span>
            <span className="text-ink/60 line-clamp-1 max-w-[160px]">{item.title}</span>
          </nav>

          {/* Back link */}
          <Link
            to="/legal-news"
            className="inline-flex items-center gap-2 text-sm font-ui text-mutedgray hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All Legal News
          </Link>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-5">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${isSC ? 'bg-burgundy/10 text-burgundy' : 'bg-teal-100 text-teal-700'}`}>
              {isSC ? <Scale className="w-3 h-3" /> : <Gavel className="w-3 h-3" />}
              {item.court}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 text-gold rounded-full text-xs font-bold">
              <Tag className="w-3 h-3" />
              {item.category}
            </span>
            <span className="inline-flex items-center gap-1.5 ml-auto text-xs font-ui text-mutedgray">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(item.dateString)}
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-ink leading-tight mb-8">
            {item.title}
          </h1>

          {/* Summary body */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-ink/8 mb-8">
            <p className="font-body text-ink/80 leading-relaxed text-base sm:text-lg whitespace-pre-line">
              {item.summary}
            </p>
          </div>

          {/* Source link */}
          {item.url && item.url !== '#' && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-ink/15 rounded-xl font-ui text-sm text-ink hover:bg-parchment-dark transition-colors mb-8"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Read original source
            </a>
          )}

          {/* Share + actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-8 border-t border-ink/10">
            <button
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-ink text-parchment rounded-xl font-ui text-sm font-semibold hover:bg-ink/90 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share this update
            </button>
            <Link
              to="/legal-news"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-ink/15 rounded-xl font-ui text-sm text-ink hover:bg-parchment-dark transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              More legal news
            </Link>
            <Link
              to="/legal-playground#legal-news"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-burgundy text-parchment rounded-xl font-ui text-sm font-semibold hover:bg-burgundy/90 transition-colors sm:ml-auto"
            >
              All of Legal Playground →
            </Link>
          </div>

          </div>
        </motion.div>
      </article>
    </div>
  );
}
