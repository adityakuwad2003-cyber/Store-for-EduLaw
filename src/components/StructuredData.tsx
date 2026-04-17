interface StructuredDataProps {
  data: object;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script type="application/ld+json">
      {JSON.stringify(data)}
    </script>
  );
}

// Helper to generate Organization Schema
export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "The EduLaw",
  "url": "https://store.theedulaw.in",
  "logo": "https://store.theedulaw.in/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-7756040198",
    "contactType": "customer service",
    "areaServed": "IN",
    "availableLanguage": ["English", "Hindi"]
  },
  "sameAs": [
    "https://www.facebook.com/theedulaw",
    "https://www.instagram.com/theedulaw",
    "https://in.linkedin.com/company/the-edu-law"
  ]
});

// Helper to generate WebSite schema with SearchAction
export const getWebSiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "The EduLaw Store",
  "url": "https://store.theedulaw.in",
  "description": "India's premier legal education store — law notes, mock tests, templates and more.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://store.theedulaw.in/marketplace?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
});

// Helper to generate Article schema for blog posts
export const getArticleSchema = (article: any, slug: string) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": article.title,
  "description": article.excerpt || article.title,
  "url": `https://store.theedulaw.in/blog/${slug}`,
  "datePublished": article.createdAt
    ? (typeof article.createdAt.toDate === 'function'
        ? article.createdAt.toDate().toISOString()
        : new Date(article.createdAt).toISOString())
    : new Date().toISOString(),
  "author": {
    "@type": "Organization",
    "name": "The EduLaw",
    "url": "https://store.theedulaw.in"
  },
  "publisher": {
    "@type": "Organization",
    "name": "The EduLaw",
    "logo": {
      "@type": "ImageObject",
      "url": "https://store.theedulaw.in/logo.png"
    }
  },
  "image": article.coverImage || "https://store.theedulaw.in/logo.png",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `https://store.theedulaw.in/blog/${slug}`
  }
});

// Helper to generate BreadcrumbList schema
export const getBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "name": item.name,
    "item": item.url,
  })),
});

// Helper to generate Product Schema
export const getProductSchema = (note: any) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": note.title,
  "description": note.description,
  "image": `https://store.theedulaw.in${note.thumbnailUrl}`,
  "brand": {
    "@type": "Brand",
    "name": "The EduLaw"
  },
  "offers": {
    "@type": "Offer",
    "url": `https://store.theedulaw.in/product/${note.slug}`,
    "priceCurrency": "INR",
    "price": note.price,
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "The EduLaw"
    }
  }
});
