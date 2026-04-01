import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: 'website' | 'product' | 'article';
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
}

export function SEO({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage = 'https://store.theedulaw.in/logo.png', // Default store logo
  twitterCard = 'summary_large_image',
}: SEOProps) {
  const siteName = 'The EduLaw Store';
  const fullTitle = `${title} | ${siteName}`;
  const url = canonical ? `https://store.theedulaw.in${canonical}` : 'https://store.theedulaw.in';

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
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* India Specific */}
      <link rel="alternate" hrefLang="en-IN" href={url} />
    </Helmet>
  );
}
