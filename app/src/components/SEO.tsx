import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  ogType?: 'website' | 'product' | 'article';
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  googleSiteVerification?: string;
  structuredData?: object | object[];
  /** Pass true for private/user-only pages (cart, dashboard, login) */
  noindex?: boolean;
}

export function SEO({
  title,
  description = "India's Premiere Legal Study Store. Buy Law Notes, Legal Drafts, and Exam Prep Materials.",
  canonical,
  ogType = 'website',
  ogImage = '/logo.png', // Relative path from public folder
  twitterCard = 'summary_large_image',
  googleSiteVerification = 'R_4h3YlP8rBf-A9mF8kX5A6B4C3D2E1F0G9H8I7J6K5', // Default placeholder or user provided
  structuredData,
  noindex = false,
}: SEOProps) {
  const siteName = 'The EduLaw Store';
  const fullTitle = `${title} | ${siteName}`;
  const baseUrl = 'https://www.store.theedulaw.in';
  
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
      <meta name="robots" content={noindex ? 'noindex, follow' : 'index, follow'} />
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="Pune, Maharashtra, India" />
      {googleSiteVerification && (
        <meta name="google-site-verification" content={googleSiteVerification} />
      )}

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
      
      {/* Performance Resource Hints */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://firestore.googleapis.com" />
      <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />

      {/* India Specific */}
      <link rel="alternate" hrefLang="en-IN" href={url} />

      {/* JSON-LD Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(structuredData) ? structuredData : [structuredData])}
        </script>
      )}
    </Helmet>
  );
}
