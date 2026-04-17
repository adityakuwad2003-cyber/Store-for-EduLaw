export type PaymentType = 'instant' | 'quote';

export interface ServiceTier {
  label: string;        // e.g. "Standard Advocate (30 min)"
  price: number;        // ₹ amount; 0 means quote-only
  turnaround: string;   // e.g. "Same Day"
  isQuoteOnly?: boolean; // If true, Pay Now is disabled — Send Inquiry only
}

export interface LegalService {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;          // Default/base starting price
  priceLabel: string;     // Display label e.g. "Starting ₹399"
  paymentType: PaymentType;
  turnaroundTime: string;
  icon: string;
  features: string[];
  tiers: ServiceTier[];   // Dynamic pricing tiers shown in booking form
}

export const servicesData: LegalService[] = [
  {
    id: 'consultation',
    name: '1-on-1 Legal Consultation',
    shortDescription: '30-min expert call — starting ₹399',
    description:
      'Get immediate clarity on your legal standing. Our advocates analyse your situation and deliver actionable next steps over a Google Meet call. Choose your advocate level below.',
    price: 399,
    priceLabel: 'Starting ₹399',
    paymentType: 'instant',
    turnaroundTime: 'Same Day',
    icon: 'MessageCircle',
    features: [
      '30-Minute Video Call',
      'Actionable Legal Roadmap',
      'Fully Confidential',
      'Post-call Written Summary',
      'Pro/Max subscribers: 1-2 free calls/month',
    ],
    tiers: [
      { label: 'Standard Advocate — 30 min',      price: 399,   turnaround: 'Same Day' },
      { label: 'Senior Advocate — 30 min',         price: 799,   turnaround: 'Same Day' },
      { label: 'HC / SC Specialist — 30 min',      price: 1499,  turnaround: 'Same Day' },
    ],
  },
  {
    id: 'legal-notice',
    name: 'Legal Notice (Draft & Send)',
    shortDescription: 'Standard notices — starting ₹799',
    description:
      'A hard-hitting Legal Notice drafted on Advocate Letterhead and dispatched via Registered Post / Speed Post. Select the type of notice to get an instant price.',
    price: 799,
    priceLabel: 'Starting ₹799',
    paymentType: 'instant',
    turnaroundTime: '48 Hours',
    icon: 'Scale',
    features: [
      'Drafted by Expert Advocates',
      'Sent via Registered Post / Speed Post',
      'Digital Copy via Email',
      '1 Round of Free Revisions',
      'Standard: 48h · Urgent: 24h',
    ],
    tiers: [
      { label: 'Standard Notice — 48h',            price: 799,   turnaround: '48 Hours' },
      { label: 'Urgent Notice — 24h',              price: 1299,  turnaround: '24 Hours' },
      { label: 'Complex / Contested Notice',        price: 1499,  turnaround: '48-72 Hours' },
    ],
  },
  {
    id: 'contract-review',
    name: 'Contract Review & Redlining',
    shortDescription: 'Protect yourself before signing — from ₹999',
    description:
      'Line-by-line clause analysis with red-flags highlighted and suggested edits. Price is based on document length and complexity.',
    price: 999,
    priceLabel: 'Starting ₹999',
    paymentType: 'instant',
    turnaroundTime: '48 Hours',
    icon: 'Search',
    features: [
      'Comprehensive Clause Analysis',
      'Red-flagging of Unfair Terms',
      'Suggested Edits & Redlining',
      '15-Min Explainer Call Included',
      'Covers Employment, NDA, Lease & more',
    ],
    tiers: [
      { label: 'Up to 10 pages — 48h',             price: 999,   turnaround: '48 Hours' },
      { label: '10–30 pages — 48h',                price: 1999,  turnaround: '48 Hours' },
      { label: 'Enterprise / Complex — custom',     price: 0,     turnaround: 'Custom', isQuoteOnly: true },
    ],
  },
  {
    id: 'document-drafting',
    name: 'Custom Document Drafting',
    shortDescription: 'Agreements, Affidavits, Deeds — from ₹499',
    description:
      'Need a legally binding document tailored to your situation? Select the complexity tier below. We send a fixed quote before you pay for custom work.',
    price: 499,
    priceLabel: 'From ₹499',
    paymentType: 'quote',
    turnaroundTime: '2-4 Days',
    icon: 'FileEdit',
    features: [
      'Standard templates from ₹499',
      'Custom drafting from ₹1,499',
      'Complex / multi-party from ₹2,499',
      'Fixed quote before payment',
      'Multiple revision rounds included',
    ],
    tiers: [
      { label: 'Standard Template (rent agreement, affidavit, basic NDA)', price: 499,  turnaround: '2-3 Days' },
      { label: 'Custom Drafting (employment contract, MOU, partnership)',   price: 1499, turnaround: '3-4 Days' },
      { label: 'Complex / Multi-party (M&A, joint venture, enterprise)',    price: 0,    turnaround: 'Custom',  isQuoteOnly: true },
    ],
  },
];
