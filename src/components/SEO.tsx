import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  ogType?: 'website' | 'product' | 'article';
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
}

export function SEO({
  title,
  description = "India's Premiere Legal Study Store. Buy Law Notes, Legal Drafts, and Exam Prep Materials.",
  canonical,
  ogType = 'website',
  ogImage = '/logo.png', // Relative path from public folder
  twitterCard = 'summary_large_image',
}: SEOProps) {
  const siteName = 'The EduLaw Store';
  const fullTitle = `${title} | ${siteName}`;
  const baseUrl = 'https://store.theedulaw.in';
  
  // Ensure canonical URL is absolute
  const url = canonical ? `${baseUrl}${canonical.startsWith('/') ? '' : '/'}${canonical}` : baseUrl;
  
  // Ensure ogImage is absolute
  const fullImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta name="robots" content="index, follow" />
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="Pune, Maharashtra, India" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* India Specific */}
      <link rel="alternate" hrefLang="en-IN" href={url} />
    </Helmet>
  );
}
