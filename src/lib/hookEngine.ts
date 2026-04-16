/**
 * EduLaw Hook Engine
 * Generic keyword-matching engine for high-conversion purchase hooks in news feeds.
 */

export interface PromoHook {
  id: string;
  topic: string;
  keywords: string[];
  cta: string;
  description: string;
  link: string;
  label: string;
  bgClass: string;
  icon: string;
}

export const PROMO_HOOKS: PromoHook[] = [
  {
    id: 'h-divorce',
    topic: 'Matrimonial Law',
    keywords: ['divorce', 'alimony', 'maintenance', 'marriage', 'husband', 'wife', 'matrimonial'],
    cta: 'Need Expert Legal Help with Divorce?',
    description: 'Get matched with top family law advocates for an easy mutual consent process.',
    label: 'Mutual Divorce Service',
    link: '/legal-services?s=mutual-divorce',
    bgClass: 'bg-rose-50 border-rose-100 text-rose-900',
    icon: '💕'
  },
  {
    id: 'h-property',
    topic: 'Property Law',
    keywords: ['property', 'land', 'real estate', 'encroachment', 'partition', 'possession', 'tenant', 'eviction'],
    cta: 'Buying or Disputing Property?',
    description: 'Avoid legal traps with our physical property verification and title search services.',
    label: 'Property Verification Service',
    link: '/legal-services?s=property-verification',
    bgClass: 'bg-emerald-50 border-emerald-100 text-emerald-900',
    icon: '🏠'
  },
  {
    id: 'h-startup',
    topic: 'Business Law',
    keywords: ['startup', 'company', 'incorporation', 'partnership', 'director', 'shareholder', 'business', 'registration'],
    cta: 'Starting a New Business?',
    description: 'From Private Limited to LLP — we handle all the paperwork while you build.',
    label: 'Company Registration Service',
    link: '/legal-services?s=company-registration',
    bgClass: 'bg-blue-50 border-blue-100 text-blue-900',
    icon: '🚀'
  },
  {
    id: 'h-trademark',
    topic: 'Intellectual Property',
    keywords: ['trademark', 'patent', 'copyright', 'ipr', 'infringement', 'brand', 'logo'],
    cta: 'Protect Your Brand Identity',
    description: 'Register your logo and brand name to ensure exclusive legal protection.',
    label: 'Trademark Registration',
    link: '/legal-services?s=trademark-registration',
    bgClass: 'bg-indigo-50 border-indigo-100 text-indigo-900',
    icon: '🛡️'
  },
  {
    id: 'h-criminal',
    topic: 'Criminal Law',
    keywords: ['fir', 'arrest', 'bail', 'criminal', 'police', 'investigation', 'ipc', 'crpc', 'bnss', 'offence'],
    cta: 'Master Criminal Law for Exams',
    description: 'Comprehensive notes on IPC, CrPC, and the new BNSS laws — simplified for students.',
    label: 'Get Criminal Law Notes',
    link: '/marketplace?q=criminal+law',
    bgClass: 'bg-red-50 border-red-100 text-red-900',
    icon: '⚖️'
  },
  {
    id: 'h-contract',
    topic: 'Contracts & Templates',
    keywords: ['contract', 'agreement', 'breach', 'indemnity', 'clauses', 'legal notice', 'drafting'],
    cta: 'Draft Professional Agreements',
    description: 'Zero-risk, lawyer-drafted templates for every personal and professional need.',
    label: 'Browse Legal Templates',
    link: '/templates',
    bgClass: 'bg-amber-50 border-amber-100 text-amber-900',
    icon: '📝'
  },
  {
     id: 'h-consti',
     topic: 'Constitutional Law',
     keywords: ['constitution', 'article', 'fundamental rights', 'parliament', 'supreme court', 'judiciary', 'preamble'],
     cta: 'Ace Constitutional Law Exams',
     description: 'Detailed summaries of landmark cases and all important constitutional articles.',
     label: 'Get Constitution Notes',
     link: '/marketplace?q=constitution',
     bgClass: 'bg-burgundy/5 border-burgundy/10 text-burgundy',
     icon: '🇮🇳'
  }
];

/**
 * Matches a news item against the hook library and returns the first relevant hook.
 */
export function getRecommendedHook(text: string): PromoHook | null {
  const lowerText = text.toLowerCase();
  
  // Find the first hook that has a matching keyword
  const match = PROMO_HOOKS.find(hook => 
    hook.keywords.some(keyword => lowerText.includes(keyword))
  );
  
  return match || null;
}
