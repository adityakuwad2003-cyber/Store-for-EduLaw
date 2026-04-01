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
    "telephone": "+91-XXXXXXXXXX",
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
