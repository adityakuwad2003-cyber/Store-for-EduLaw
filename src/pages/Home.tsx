import { HeroSection } from '@/sections/HeroSection';
import { StatsStrip } from '@/sections/StatsStrip';
import { CategoriesSection } from '@/sections/CategoriesSection';
import { FeaturedNotes } from '@/sections/FeaturedNotes';
import { BundleSection } from '@/sections/BundleSection';
import { SubscriptionBanner } from '@/sections/SubscriptionBanner';
import { HowItWorks } from '@/sections/HowItWorks';
import { LegalServices } from '@/sections/LegalServices';
import { Testimonials } from '@/sections/Testimonials';
import { FAQSection } from '@/sections/FAQSection';

import { SEO } from '@/components/SEO';
import { StructuredData, getOrganizationSchema } from '@/components/StructuredData';

export function Home() {
  return (
    <div className="overflow-hidden">
      <SEO 
        title="Buy Legal Study Materials, Courses & Notes"
        description="India's best legal education resources. Shop law notes, online courses, mock tests & drafts for CLAT, judiciary & LLB students. Trusted by 1L+ students."
        canonical="/"
      />
      <StructuredData data={getOrganizationSchema()} />
      <HeroSection />
      <StatsStrip />
      <CategoriesSection />
      <FeaturedNotes variant="featured" limit={8} />
      <BundleSection />
      <SubscriptionBanner />
      <HowItWorks />
      <LegalServices />
      <FeaturedNotes 
        variant="new" 
        limit={4} 
        title="New Arrivals" 
        subtitle="Latest additions to our legal library"
      />
      <Testimonials />
      <FAQSection />
    </div>
  );
}
