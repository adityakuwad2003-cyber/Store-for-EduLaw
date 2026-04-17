import { SEO } from '@/components/SEO';

export function RefundPolicy() {
  return (
    <div className="pt-32 pb-20 bg-parchment">
      <SEO 
        title="Refund & Cancellation Policy | The EduLaw Store"
        description="Official refund and cancellation policy for The EduLaw Store. Clear policies on digital product purchases."
        canonical="/refund-policy"
      />
      <div className="section-container max-w-4xl">
        <h1 className="font-display text-4xl text-ink mb-8 text-center">Refund <span className="text-gold">& Cancellation</span> Policy</h1>
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-parchment-dark prose prose-slate max-w-none">
          <p className="text-mutedgray mb-6 text-center italic">Because you're purchasing digital content, we want to be as transparent as possible about our refund policy.</p>

          <p className="text-mutedgray mb-6"><strong>Note on Cooling-Off Period:</strong> Digital products (PDF notes, study materials, subscriptions) are excluded from the 7-day cooling-off period under the Consumer Protection (E-Commerce) Rules, 2020, Section 4(f), as access to the digital content is granted immediately upon purchase confirmation.</p>

          <h2 className="text-2xl font-display text-ink mt-8 mb-4">1. Digital Item Policy</h2>
          <p className="text-mutedgray">Due to the nature of digital products, once a PDF is purchased and access is granted, we generally do not offer refunds. This is because the item cannot be 'returned' once downloaded.</p>

          <h2 className="text-2xl font-display text-ink mt-8 mb-4">2. Technical Issues</h2>
          <p className="text-mutedgray">If you experience technical issues accessing your notes, please contact us within 48 hours of purchase. We will ensure the issue is resolved promptly by providing alternative download links if needed.</p>

          <h2 className="text-2xl font-display text-ink mt-8 mb-4">3. Accidental Double Purchases</h2>
          <p className="text-mutedgray">In cases of accidental double purchases of the exact same item, we will issue a full refund for the duplicate transaction if reported within 24 hours.</p>

          <h2 className="text-2xl font-display text-ink mt-8 mb-4">4. Contact Information</h2>
          <p className="text-mutedgray text-lg mt-4">For any refund-related queries, please email us at <span className="font-display text-burgundy">support@theedulaw.in</span> or use the contact form on our main website.</p>
        </div>
      </div>
    </div>
  );
}
