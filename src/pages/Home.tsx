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

export function Home() {
  return (
    <div className="overflow-hidden">
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
