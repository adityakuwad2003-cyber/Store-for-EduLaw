import { SEO } from '@/components/SEO';

export function TermsOfService() {
  return (
    <div className="pt-32 pb-20 bg-parchment">
      <SEO 
        title="Terms of Service | The EduLaw Store"
        description="Official terms of service for The EduLaw Store. Rules and regulations for purchasing digital legal notes."
        canonical="/terms-of-service"
      />
      <div className="section-container max-w-4xl">
        <h1 className="font-display text-4xl text-ink mb-8 text-center">Terms of <span className="text-gold">Service</span></h1>
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-parchment-dark prose prose-slate max-w-none">
          <p className="text-mutedgray mb-6">Last updated: April 1, 2024</p>
          
          <h2 className="text-2xl font-display text-ink mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-mutedgray">By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>

          <h2 className="text-2xl font-display text-ink mt-8 mb-4">2. Digital Products</h2>
          <p className="text-mutedgray">All products sold are digital goods (PDFs). No physical shipping is required. Access is granted immediately after successful payment via Razorpay.</p>

          <h2 className="text-2xl font-display text-ink mt-8 mb-4">3. Intellectual Property</h2>
          <p className="text-mutedgray">All content (notes, drafts, courses) are the intellectual property of The EduLaw. Note redistribution, resale, or unauthorized sharing is strictly prohibited and subject to legal action under copyright laws.</p>

          <h2 className="text-2xl font-display text-ink mt-8 mb-4">4. Limitation of Liability</h2>
          <p className="text-mutedgray">The notes provided are for educational purposes and should not be considered legal advice. The EduLaw is not liable for any academic or legal outcomes based on these materials.</p>
        </div>
      </div>
    </div>
  );
}
