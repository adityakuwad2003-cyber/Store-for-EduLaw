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

          <h2 className="text-2xl font-display text-ink mt-8 mb-4">5. Data Retention</h2>
          <p className="text-mutedgray">We retain your personal data for the duration of your account plus 3 years for GST and legal compliance obligations. After this period, your data is securely deleted or anonymised.</p>

          <h2 className="text-2xl font-display text-ink mt-8 mb-4">6. Third-Party Data Processors</h2>
          <p className="text-mutedgray">We share necessary data with the following trusted processors to deliver our services:</p>
          <ul className="text-mutedgray list-disc pl-6 space-y-2 mt-2">
            <li><strong>Firebase / Google LLC</strong> — Authentication and database (<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">Privacy Policy</a>)</li>
            <li><strong>Razorpay Payments Pvt. Ltd.</strong> — Payment processing (<a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">Privacy Policy</a>)</li>
            <li><strong>Resend Inc.</strong> — Transactional and newsletter emails (<a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">Privacy Policy</a>)</li>
            <li><strong>Cloudflare Inc.</strong> — PDF storage and delivery (<a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">Privacy Policy</a>)</li>
            <li><strong>Vercel Inc.</strong> — Hosting and serverless functions (<a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">Privacy Policy</a>)</li>
          </ul>

          <h2 className="text-2xl font-display text-ink mt-8 mb-4">7. Your Rights Under DPDPA 2023</h2>
          <p className="text-mutedgray">Under the Digital Personal Data Protection Act, 2023, you have the right to:</p>
          <ul className="text-mutedgray list-disc pl-6 space-y-2 mt-2">
            <li><strong>Access</strong>: Request a copy of your personal data we hold</li>
            <li><strong>Correction</strong>: Ask us to correct inaccurate or incomplete data</li>
            <li><strong>Erasure</strong>: Request deletion of your personal data (subject to legal retention obligations)</li>
            <li><strong>Nomination</strong>: Nominate a person to exercise your rights in the event of incapacity or death</li>
          </ul>
          <p className="text-mutedgray mt-3">To exercise any of these rights, email instituteedulaw@gmail.com. We will respond within 30 days.</p>

          <h2 className="text-2xl font-display text-ink mt-8 mb-4">8. Data Breach Notification</h2>
          <p className="text-mutedgray">In the event of a personal data breach that is likely to result in high risk to your rights, we will notify you within 72 hours of becoming aware of the breach, in accordance with DPDPA 2023.</p>

          <h2 className="text-2xl font-display text-ink mt-8 mb-4">9. Lawful Basis for Processing</h2>
          <p className="text-mutedgray">We process your personal data on the following lawful bases:</p>
          <ul className="text-mutedgray list-disc pl-6 space-y-2 mt-2">
            <li><strong>Contract performance</strong>: To provide purchased notes and subscription services</li>
            <li><strong>Consent</strong>: For newsletter subscriptions and marketing communications (you may withdraw at any time)</li>
            <li><strong>Legal obligation</strong>: To maintain GST records and comply with Indian tax law</li>
          </ul>

          <h2 className="text-2xl font-display text-ink mt-8 mb-4">10. Grievance Officer</h2>
          <div className="border border-parchment-dark rounded-2xl p-6 bg-parchment mt-4">
            <p className="text-sm font-display text-ink mb-4">Grievance Officer (as required under DPDPA 2023 and E-Commerce Rules 2020)</p>
            <ul className="text-mutedgray space-y-1 text-sm">
              <li><strong>Name:</strong> Siddhant Kuwad</li>
              <li><strong>Designation:</strong> Founder / Data Protection Officer</li>
              <li><strong>Email:</strong> <a href="mailto:instituteedulaw@gmail.com" className="underline hover:text-ink">instituteedulaw@gmail.com</a></li>
              <li><strong>Response time:</strong> Within 48 hours of receipt</li>
            </ul>
            <p className="text-mutedgray text-sm mt-4">You may address grievances related to personal data processing or this Privacy Policy to the above officer.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
