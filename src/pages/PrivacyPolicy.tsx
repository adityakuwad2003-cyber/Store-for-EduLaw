import { SEO } from '@/components/SEO';

export function PrivacyPolicy() {
  return (
    <div className="pt-32 pb-20 bg-parchment">
      <SEO 
        title="Privacy Policy | The EduLaw Store"
        description="Official privacy policy for The EduLaw Store. Learn how we protect your personal and payment data."
        canonical="/privacy-policy"
      />
      <div className="section-container max-w-4xl">
        <h1 className="font-display text-4xl text-ink mb-8 text-center">Privacy <span className="text-gold">Policy</span></h1>
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-parchment-dark prose prose-slate max-w-none">
          <p className="text-mutedgray mb-6">Last updated: April 1, 2024</p>
          
          <h2 className="text-2xl font-display text-ink mt-8 mb-4">1. Information We Collect</h2>
          <p className="text-mutedgray">We collect information you provide directly to us, such as when you create an account, purchase notes, or communicate with us. This includes your name, email address, and purchase history.</p>

          <h2 className="text-2xl font-display text-ink mt-8 mb-4">2. How We Use Information</h2>
          <p className="text-mutedgray">We use the information we collect to provide, maintain, and improve our services, process transactions, and send you technical notices and support messages.</p>

          <h2 className="text-2xl font-display text-ink mt-8 mb-4">3. Data Security</h2>
          <p className="text-mutedgray">We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access. All payments are processed through secure gateways (Razorpay).</p>

          <h2 className="text-2xl font-display text-ink mt-8 mb-4">4. Cookies</h2>
          <p className="text-mutedgray">We use cookies to enhance your experience on our site, remember your cart items, and analyze our traffic.</p>
        </div>
      </div>
    </div>
  );
}
