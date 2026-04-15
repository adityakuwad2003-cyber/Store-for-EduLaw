export type PaymentType = 'instant' | 'quote';

export interface LegalService {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  paymentType: PaymentType;
  turnaroundTime: string;
  icon: string;
  features: string[];
}

export const servicesData: LegalService[] = [
  {
    id: 'consultation',
    name: '1-on-1 Legal Consultation',
    shortDescription: '15-min case evaluation',
    description: 'Get immediate clarity on your legal standing. We will analyze your case and provide actionable next steps over a quick Google Meet call.',
    price: 499,
    paymentType: 'instant',
    turnaroundTime: '24 Hours',
    icon: 'MessageCircle',
    features: [
      '15-Minute Video Call',
      'Actionable Legal Advice',
      'Confidential Discussion',
      'Post-call Follow-up Email'
    ]
  },
  {
    id: 'legal-notice',
    name: 'Legal Notice (Draft & Send)',
    shortDescription: 'Defamation, Consumer, Cheque Bounce',
    description: 'We draft and send a hard-hitting Legal Notice on your behalf on Advocate Letterhead to secure your rights and initiate formal action.',
    price: 1499,
    paymentType: 'instant',
    turnaroundTime: '48 Hours',
    icon: 'Scale',
    features: [
      'Drafted by Expert Advocates',
      'Sent via Registered Post/Speed Post',
      'Digital Copy via Email',
      '1 Round of Free Revisions'
    ]
  },
  {
    id: 'contract-review',
    name: 'Contract Review & Redlining',
    shortDescription: 'Protect yourself before signing',
    description: 'Don\'t sign blindly. We review Employment Agreements, NDAs, or Leases to highlight red flags and suggest pro-client edits.',
    price: 1499,
    paymentType: 'instant',
    turnaroundTime: '48 Hours',
    icon: 'Search',
    features: [
      'Comprehensive Clause Analysis',
      'Identification of Unfair Terms',
      'Suggested Edits & Redlining',
      '15-Min Explainer Call'
    ]
  },
  {
    id: 'document-drafting',
    name: 'Custom Document Drafting',
    shortDescription: 'Agreements, Affidavits, Deeds',
    description: 'Need a custom Rent Agreement, Partnership Deed, or terms of service? We draft legally binding documents tailored to your specific needs.',
    price: 2499,
    paymentType: 'quote',
    turnaroundTime: '3-4 Days',
    icon: 'FileEdit',
    features: [
      'Tailor-made to your requirements',
      'Valid across India',
      'Multiple Revision Rounds',
      'Consultation included'
    ]
  }
];
