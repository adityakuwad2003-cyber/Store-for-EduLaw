# Goal: Revamp Legal Services for Instagram Conversions

The goal is to overhaul the `/legal-services` page from a static, dummy-form page into a high-converting, mobile-first booking funnel. Since you are driving traffic from Instagram Stories, the page must have immediate visual impact, clear pricing, and frictionless booking that actually works (saving leads to a database and integrating payments if needed).

## User Review Required

> [!IMPORTANT]
> Please review the proposed **Service Tiers and Pricing** below. I can adjust the exact rupees (₹) or add/remove services based on what you actually want to offer.

> [!WARNING]
> For the checkout experience: Do you want users to just submit a **free inquiry form** (and you email them a quote), OR do you want them to **pay instantly via Razorpay** for fixed-price services like consultations? The plan below assumes a hybrid (Pay now for consults, Quote for complex drafting), but I can change this.

## Proposed Strategy & Recommendations

### 1. New Page Structure (Mobile-First for IG Traffic)
- **High-Impact Hero:** "Expert Legal Advice, Just a Tap Away." with a prominent "Book a Consultation" button.
- **Service Categories (Value-based):**
  1. **Quick Consultations:** (e.g., 15-min case evaluation, 45-min deep dive)
  2. **Drafting & Notices:** (e.g., Legal Notice, Rent Agreement, Affidavits)
  3. **Business/Startup Legal:** (e.g., Founder Agreements, NDA, Trademark Filing)
- **Trust & Social Proof:** "Handled 500+ Legal Queries", "Confidential & Encrypted", "Vetted Advocates".
- **FAQ Section:** To overcome Instagram impulse-click hesitations (e.g., "Will my data be shared?").

### 2. Proposed Pricing & Offerings
*These are placeholders, let me know your actual numbers:*
- **Basic Consultation (15 mins):** ₹499 (Instant booking)
- **Standard Legal Notice (Drafting + Dispatch):** ₹1,499 
- **Non-Disclosure Agreement (NDA):** ₹999
- **Custom Contract Drafting:** "Starts at ₹2,499" (Lead form for custom quote)
- **Trademark Registration:** ₹4,999 + Govt Fees

### 3. Making it "Actually Work" (Backend Integration)
- **Database (Firestore):** Submissions won't just `alert()`. We will create a `service_bookings` collection in your existing Firebase database. 
- **Admin Dashboard Integration:** We will add a "Service Requests" tab in your admin panel so you can manage incoming leads and update their status (Pending -> Quoted -> Completed).
- **Email Notifications:** We can use the Resend integration we built earlier to instantly email you when someone books a service from Instagram.
- **Direct Payment (Optional but Recommended):** For fixed-price services (like the ₹499 consult), we can trigger the existing Razorpay checkout portal immediately upon form submission.

---

## Proposed Changes

### Frontend (`/legal-services`)
#### [MODIFY] `src/pages/LegalServices.tsx`
- Complete redesign of the UI to be highly optimized for mobile screens (since IG traffic is mobile).
- Replace the static form with a multi-step dynamic booking wizard or clear "Select Service" cards.

#### [NEW] `src/data/servicesData.ts`
- Extract the service offerings, pricing, and descriptions into a dedicated file for easy management.

### Backend (`/admin`)
#### [NEW] `src/pages/admin/crm/ServiceRequests.tsx`
- Build a new admin tracker to view and manage incoming legal service leads from the website.

#### [MODIFY] `src/pages/admin/AdminLayout.tsx`
- Add "Legal Services" to the admin sidebar.

#### [MODIFY] `api/admin/[route].ts`
- If email receipts are needed, we can add a simple `new-service-request` email handler.

## Open Questions

1. **Pricing Model:** Do you want fixed pricing with direct Razorpay checkout for services, or just a lead capture form where you reply with a customized quote?
2. **Specific Services:** What are the top 3-4 specific legal services you want to highlight the most to your Instagram audience?
3. **Admin Panel:** Do you want me to build the Admin tracking board for these requests so you can manage them, or do you just want them sent to your email?

## Verification Plan

### Automated Tests
- Test mobile responsiveness across dimensions representing standard iOS and Android devices to ensure Instagram swipers get a perfect layout.

### Manual Verification
- Verify that a submitted service form correctly appears in the Firestore database.
- Verify that Razorpay checkout triggers (if we choose the instant-payment route) successfully.
