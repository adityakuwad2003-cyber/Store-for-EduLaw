import type { Category, Bundle, SubscriptionPlan, LegalService, Testimonial, FAQ } from '@/types';



export const categories: Category[] = [
  { id: "1", name: "Criminal Law", slug: "criminal-law", icon: "Scale", color: "#DC2626", description: "IPC, BNS, Criminal offenses and procedures", noteCount: 6 },
  { id: "2", name: "Constitutional Law", slug: "constitutional-law", icon: "Landmark", color: "#7C3AED", description: "Constitution of India, fundamental rights", noteCount: 2 },
  { id: "3", name: "Civil Law", slug: "civil-law", icon: "FileText", color: "#059669", description: "Torts, CPC, Property laws", noteCount: 5 },
  { id: "4", name: "Corporate Law", slug: "corporate-law", icon: "Building2", color: "#2563EB", description: "Company law, Contracts, IPR", noteCount: 9 },
  { id: "5", name: "Family Law", slug: "family-law", icon: "Users", color: "#DB2777", description: "Hindu and Muslim personal laws", noteCount: 2 },
  { id: "6", name: "Special Acts", slug: "special-acts", icon: "Gavel", color: "#EA580C", description: "NDPS, POCSO, Environmental laws", noteCount: 6 },
  { id: "7", name: "Public Law", slug: "public-law", icon: "Shield", color: "#0891B2", description: "Administrative law, RTI, Consumer protection", noteCount: 4 },
  { id: "8", name: "Foundation", slug: "foundation", icon: "BookOpen", color: "#4B5563", description: "Jurisprudence, Sociology, Political Science", noteCount: 5 },
  { id: "9", name: "Evidence", slug: "evidence", icon: "Search", color: "#7C2D12", description: "Indian Evidence Act and BSA", noteCount: 1 },
  { id: "10", name: "Criminal Procedure", slug: "criminal-procedure", icon: "ClipboardList", color: "#991B1B", description: "CrPC and BNSS procedures", noteCount: 8 },
  { id: "11", name: "Drafting", slug: "drafting", icon: "PenTool", color: "#065F46", description: "Legal drafting and conveyancing", noteCount: 1 },
  { id: "12", name: "ADR", slug: "adr", icon: "Handshake", color: "#4338CA", description: "Arbitration and conciliation", noteCount: 1 },
  { id: "13", name: "Procedural", slug: "procedural", icon: "Scroll", color: "#92400E", description: "Stamp and registration laws", noteCount: 1 },
  { id: "14", name: "International Law", slug: "international-law", icon: "Globe", color: "#1E40AF", description: "Public international law", noteCount: 1 },
];

export const bundles: Bundle[] = [
  // BNSS COMPLETE BUNDLE (All 8 Volumes)
  {
    id: "bnss-complete",
    name: "BNSS Complete Series (All 8 Volumes)",
    slug: "bnss-complete-series",
    description: "Get all 8 volumes of BNSS 2023 — complete coverage of every section from preliminary provisions to special procedures and schedules.",
    noteIds: [3, 47, 48, 49, 50, 51, 52, 53],
    price: 999,
    originalPrice: 1592,
    isActive: true,
    tag: "Best Value",
    savingsPercent: 37,
    bundleType: 'curated',
    includes: ['BNSS Vol 1 — Preliminary, Arrest & Bail', 'BNSS Vol 2 — FIR, Investigation & Evidence', 'BNSS Vol 3 — Charge & Magistrate Trial', 'BNSS Vol 4 — Sessions Trial & Witnesses', 'BNSS Vol 5 — Appeals & Revision', 'BNSS Vol 6 — Execution of Sentences', 'BNSS Vol 7 — Miscellaneous Provisions', 'BNSS Vol 8 — Special Procedures & Schedules']
  },
  // QUANTITY BUNDLES (Pick Your Own)
  { 
    id: "b3", 
    name: "Starter Pack", 
    slug: "starter-pack",
    description: "Perfect for beginners - pick any 3 subjects of your choice",
    noteIds: [], 
    price: 450, 
    originalPrice: 597, 
    isActive: true,
    tag: "Popular",
    savingsPercent: 25,
    bundleType: 'quantity'
  },
  { 
    id: "b5", 
    name: "Core Bundle", 
    slug: "core-bundle",
    description: "Essential subjects for law students - any 5 subjects",
    noteIds: [], 
    price: 750, 
    originalPrice: 995, 
    isActive: true,
    tag: "Best Value",
    savingsPercent: 25,
    bundleType: 'quantity'
  },
  { 
    id: "b10", 
    name: "Half Library", 
    slug: "half-library",
    description: "Comprehensive coverage - any 10 subjects",
    noteIds: [], 
    price: 1300, 
    originalPrice: 1990, 
    isActive: true,
    tag: "Save 35%",
    savingsPercent: 35,
    bundleType: 'quantity'
  },
  { 
    id: "b20", 
    name: "Pro Bundle", 
    slug: "pro-bundle",
    description: "Advanced preparation - any 20 subjects",
    noteIds: [], 
    price: 2000, 
    originalPrice: 3980, 
    isActive: true,
    tag: "Save 50%",
    savingsPercent: 50,
    bundleType: 'quantity'
  },
  { 
    id: "b36", 
    name: "Complete Library", 
    slug: "complete-library",
    description: "Almost everything - any 36 subjects",
    noteIds: [], 
    price: 3000, 
    originalPrice: 7164, 
    isActive: true,
    tag: "Save 58%",
    savingsPercent: 58,
    bundleType: 'quantity'
  },
  { 
    id: "b46", 
    name: "Ultimate Pack — ALL NOTES", 
    slug: "ultimate-pack",
    description: "Get access to all 46 subjects - the complete EduLaw library",
    noteIds: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46], 
    price: 3500, 
    originalPrice: 9154, 
    isActive: true,
    tag: "Best Deal 🏆",
    savingsPercent: 62,
    bundleType: 'quantity'
  },
  
  // CURATED BUNDLES (Pre-selected)
  { 
    id: "cb-new-criminal", 
    name: "New Criminal Laws Pack", 
    slug: "new-criminal-laws-pack",
    description: "Complete coverage of BNS, BSA, BNSS - the three new criminal laws",
    noteIds: [1, 2, 3, 4], 
    price: 599, 
    originalPrice: 796, 
    isActive: true,
    tag: "New Laws 🔥",
    savingsPercent: 25,
    bundleType: 'curated'
  },
  { 
    id: "cb-judiciary", 
    name: "Judiciary Prep Pack", 
    slug: "judiciary-prep-pack",
    description: "Essential subjects for judicial services examination - Constitution, CPC, CrPC, Evidence",
    noteIds: [5, 6, 10, 14, 16, 41], 
    price: 899, 
    originalPrice: 1194, 
    isActive: true,
    tag: "Judiciary 🎯",
    savingsPercent: 25,
    bundleType: 'curated'
  },
  { 
    id: "cb-corporate", 
    name: "Corporate Law Pack", 
    slug: "corporate-law-pack",
    description: "Complete corporate law coverage - Contracts, Company Law, IPR, IBC",
    noteIds: [19, 21, 22, 23, 24, 25, 26, 27], 
    price: 1099, 
    originalPrice: 1592, 
    isActive: true,
    tag: "Corporate 💼",
    savingsPercent: 31,
    bundleType: 'curated'
  },
  { 
    id: "cb-litigation", 
    name: "Litigation Master Pack", 
    slug: "litigation-master-pack",
    description: "For aspiring litigators - CPC, CrPC, Evidence, Torts, Drafting",
    noteIds: [10, 14, 16, 9, 37, 38], 
    price: 899, 
    originalPrice: 1194, 
    isActive: true,
    tag: "Litigation ⚖️",
    savingsPercent: 25,
    bundleType: 'curated'
  },
  { 
    id: "cb-semester-1", 
    name: "Semester 1 Essentials", 
    slug: "semester-1-essentials",
    description: "First semester must-haves - Jurisprudence, Contract, Tort, Constitution Part 1",
    noteIds: [41, 19, 9, 5], 
    price: 599, 
    originalPrice: 796, 
    isActive: true,
    tag: "1st Year 📚",
    savingsPercent: 25,
    bundleType: 'curated'
  },
  { 
    id: "cb-semester-3", 
    name: "Semester 3 Essentials", 
    slug: "semester-3-essentials",
    description: "Third semester core subjects - CPC, CrPC, Family Law, Constitution Part 2",
    noteIds: [10, 14, 7, 8, 6], 
    price: 749, 
    originalPrice: 995, 
    isActive: true,
    tag: "3rd Year 📖",
    savingsPercent: 25,
    bundleType: 'curated'
  },
  { 
    id: "cb-special-acts", 
    name: "Special Acts Bundle", 
    slug: "special-acts-bundle",
    description: "Important special legislations - NDPS, POCSO, Environmental, Labour, Cyber Law",
    noteIds: [17, 18, 32, 33, 34], 
    price: 699, 
    originalPrice: 995, 
    isActive: true,
    tag: "Special Acts ⚡",
    savingsPercent: 30,
    bundleType: 'curated'
  },
  
  // COMBO BUNDLES (Notes + Mock Tests + Templates)
  { 
    id: "combo-criminal-pro", 
    name: "Criminal Law Pro Combo", 
    slug: "criminal-law-pro-combo",
    description: "BNS + BNSS notes + 2 Mock Tests + Legal Notice Templates",
    noteIds: [1, 3], 
    price: 499, 
    originalPrice: 796, 
    isActive: true,
    tag: "Combo 🎁",
    savingsPercent: 37,
    bundleType: 'combo',
    includes: ['BNS Notes', 'BNSS Notes', '2 Mock Tests', 'Legal Notice Templates']
  },
  { 
    id: "combo-corporate-pro", 
    name: "Corporate Starter Combo", 
    slug: "corporate-starter-combo",
    description: "Company Law + Contract Act + NDA Template + Partnership Deed",
    noteIds: [19, 21], 
    price: 349, 
    originalPrice: 597, 
    isActive: true,
    tag: "Starter Combo 🚀",
    savingsPercent: 42,
    bundleType: 'combo',
    includes: ['Company Law Notes', 'Contract Act Notes', 'NDA Template', 'Partnership Deed']
  },
  
  // INSTITUTIONAL BUNDLES
  { 
    id: "inst-basic", 
    name: "College Basic License", 
    slug: "college-basic-license",
    description: "Institutional license for up to 100 students - all 46 notes",
    noteIds: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46], 
    price: 15000, 
    originalPrice: 25000, 
    isActive: true,
    tag: "Institutional 🏛️",
    savingsPercent: 40,
    bundleType: 'institutional'
  },
];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "monthly",
    name: "Monthly",
    price: 499,
    period: "month",
    features: [
      "Unlimited in-browser access to all 46 notes",
      "Download any 5 notes per month (watermarked)",
      "Early access to new notes",
      "10% discount on legal services",
      "Priority support",
    ],
    downloadsPerMonth: 5,
    serviceDiscount: 10,
  },
  {
    id: "annual",
    name: "Annual",
    price: 3999,
    period: "year",
    monthlyEquivalent: 333,
    savings: 1989,
    badge: "Save 33%",
    features: [
      "Everything in Monthly",
      "Download any 8 notes per month",
      "20% discount on legal services",
      "Free legal consultation (1/quarter)",
      "Dedicated account manager",
    ],
    downloadsPerMonth: 8,
    serviceDiscount: 20,
  }
];

export const legalServices: LegalService[] = [
  { 
    id: "drafting", 
    name: "Document Drafting", 
    price: "₹999+", 
    icon: "FileText", 
    description: "Agreements, MOUs, contracts, affidavits drafted by qualified lawyers",
    features: ["Custom drafted documents", "2 revision rounds", "48-hour delivery", "Legal review included"],
    turnaroundTime: "48 hours"
  },
  { 
    id: "notice", 
    name: "Legal Notice", 
    price: "₹1,499+", 
    icon: "Scale", 
    description: "Demand notices, cease & desist, property disputes",
    features: ["Expert drafted notice", "Legal strategy advice", "Response handling", "Court filing support"],
    turnaroundTime: "24 hours"
  },
  { 
    id: "review", 
    name: "Contract Review", 
    price: "₹1,999+", 
    icon: "Search", 
    description: "Line-by-line contract analysis with risk flagging",
    features: ["Comprehensive analysis", "Risk identification", "Amendment suggestions", "Negotiation tips"],
    turnaroundTime: "72 hours"
  },
  { 
    id: "consultation", 
    name: "Legal Consultation", 
    price: "₹599/30 min", 
    icon: "MessageCircle", 
    description: "Video call with advocate — any legal matter",
    features: ["Expert advocate", "Video consultation", "Written summary", "Follow-up questions"],
    turnaroundTime: "Same day"
  },
];

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Aditya Singh",
    college: "ILS Law College, Pune",
    avatar: "",
    quote: "The comparison tables between CrPC and BNSS are a lifesaver. Transitioning to the new criminal laws was daunting, but these notes made the conceptual shifts incredibly clear for my semester exams.",
    rating: 5
  },
  {
    id: 2,
    name: "Megha Iyer",
    college: "NALSAR, Hyderabad",
    avatar: "",
    quote: "I used the Corporate Law bundle for my internship prep. The way complex concepts like Mergers and Acquisitions are broken down into flowcharts is brilliant. Worth every rupee for the quality provided.",
    rating: 5
  },
  {
    id: 3,
    name: "Sandeep Reddy",
    college: "Osmania University, Hyderabad",
    avatar: "",
    quote: "Finding quality notes for personal laws in English was tough until I found EduLaw. Their Hindu Law notes are precisely what a student needs for both theory and competitive exams like Judiciary.",
    rating: 5
  },
  {
    id: 4,
    name: "Tanvi Gupta",
    college: "National Law University, Jodhpur",
    avatar: "",
    quote: "The Constitutional Law Landmark Judgment summaries are pure gold. They saved me weeks of research time during my CLAT PG preparation. The indexing is perfect for quick last-minute revisions.",
    rating: 5
  },
  {
    id: 5,
    name: "Vikram Deshmukh",
    college: "Symbiosis Law School, Noida",
    avatar: "",
    quote: "I appreciate the focus on the BNS 2023 updates. Most textbooks are still catching up, but EduLaw had the integrated notes ready which helped me stay ahead in my Criminal Law honors paper.",
    rating: 5
  },
  {
    id: 6,
    name: "Ishaan Chatterjee",
    college: "WBNUJS, Kolkata",
    avatar: "",
    quote: "The drafting templates for legal notices and petitions are very professional. As a final-year student, having these practical resources alongside theoretical notes is a massive advantage for internships.",
    rating: 5
  },
  {
    id: 7,
    name: "Riya Bansal",
    college: "Amity Law School, Delhi",
    avatar: "",
    quote: "The AI Study Plan Generator is a unique feature that actually works. It helped me structure my 2-week revision for Evidence Law perfectly. No more panic before the final exams!",
    rating: 5
  },
  {
    id: 8,
    name: "Harish Kumar",
    college: "Faculty of Law, University of Delhi",
    avatar: "",
    quote: "For Delhi Judiciary aspirants, the focus on local laws and procedural codes here is unmatched. The notes are concise, updated, and follow the exact pattern needed for the mains examination.",
    rating: 5
  },
];

export const faqs: FAQ[] = [
  {
    id: 1,
    question: "What is included in the free preview?",
    answer: "Every note comes with a 4-page free preview. You can view the introduction, table of contents, and first few pages to assess the quality before purchasing."
  },
  {
    id: 2,
    question: "How does the watermark work?",
    answer: "Downloaded PDFs include a personalized watermark with your name and phone number, along with the EduLaw logo. This prevents unauthorized sharing while ensuring you have access to your purchased content."
  },
  {
    id: 3,
    question: "Can I get a refund?",
    answer: "Due to the digital nature of our products, we don't offer refunds once the PDF has been downloaded. However, if you haven't downloaded the file, contact us within 24 hours for assistance."
  },
  {
    id: 4,
    question: "How does the subscription work?",
    answer: "Our subscription gives you unlimited in-browser access to all 46 notes and a monthly download quota (5 for monthly plan, 8 for annual). Downloads reset at the start of each billing cycle."
  },
  {
    id: 5,
    question: "Are the notes updated with recent amendments?",
    answer: "Yes! We regularly update our notes to include recent amendments, new case laws, and changes in legislation. Subscribers get early access to updated notes."
  },
  {
    id: 6,
    question: "Can I share my purchased notes?",
    answer: "Purchased notes are for personal use only. The personalized watermark helps protect against unauthorized sharing. Group purchases or institutional licenses are available - contact us for details."
  },
  {
    id: 7,
    question: "What payment methods are accepted?",
    answer: "We accept all major credit/debit cards, UPI, net banking, and wallets through our secure Razorpay payment gateway. All transactions are encrypted and secure."
  },
  {
    id: 8,
    question: "How do I access my purchased notes?",
    answer: "After purchase, all your notes are available in your dashboard under 'My Notes'. You can read them online anytime or download the watermarked PDF for offline access."
  },
];










export const getCategoryColor = (categoryName: string): string => {
  const category = categories.find(c => c.name === categoryName);
  return category?.color || '#6B7280';
};

// ============================================
// MOCK TESTS & MCQ MODULE
// ============================================

export const mockTests = [
  {
    id: 'mt-bns-001',
    title: 'BNS - Bharatiya Nyaya Sanhita Mock Test 1',
    slug: 'bns-mock-test-1',
    description: 'Comprehensive mock test covering all sections of BNS 2023 with detailed explanations.',
    category: 'Criminal Law',
    subjectCode: 'BNS-MCQ',
    totalQuestions: 50,
    duration: 60,
    difficulty: 'medium' as const,
    price: 99,
    isFree: false,
    isFeatured: true,
    questions: [
      {
        id: 'q1',
        question: 'Under Section 2 of BNS, which of the following is NOT a definition provided?',
        options: ['Bailable Offence', 'Non-Bailable Offence', 'Cognizable Offence', 'Civil Offence'],
        correctAnswer: 3,
        explanation: 'BNS Section 2 defines bailable, non-bailable, cognizable and non-cognizable offences. Civil offences are not defined in BNS as it deals with criminal law.',
        section: 'Section 2'
      },
      {
        id: 'q2',
        question: 'What is the maximum punishment for theft under Section 303 of BNS?',
        options: ['1 year imprisonment', '3 years imprisonment', '5 years imprisonment', '7 years imprisonment'],
        correctAnswer: 1,
        explanation: 'Section 303 of BNS provides for imprisonment up to 3 years, or fine, or both for theft.',
        section: 'Section 303'
      },
      {
        id: 'q3',
        question: 'Under Section 101 of BNS, murder is punishable with:',
        options: ['Life imprisonment only', 'Death penalty only', 'Death or life imprisonment', '10 years imprisonment'],
        correctAnswer: 2,
        explanation: 'Section 101 provides that murder shall be punished with death or imprisonment for life, and shall also be liable to fine.',
        section: 'Section 101'
      },
      {
        id: 'q4',
        question: 'Which section of BNS deals with "Criminal Conspiracy"?',
        options: ['Section 50', 'Section 61', 'Section 70', 'Section 85'],
        correctAnswer: 1,
        explanation: 'Section 61 of BNS defines and punishes criminal conspiracy.',
        section: 'Section 61'
      },
      {
        id: 'q5',
        question: 'Under BNS, the right of private defence extends to:',
        options: ['Only body', 'Only property', 'Both body and property', 'Neither body nor property'],
        correctAnswer: 2,
        explanation: 'Sections 34-44 of BNS deal with the right of private defence of body and property.',
        section: 'Sections 34-44'
      }
    ]
  },
  {
    id: 'mt-bnss-001',
    title: 'BNSS - Criminal Procedure Mock Test',
    slug: 'bnss-mock-test-1',
    description: 'Test your knowledge of BNSS procedures, bail provisions, and investigation rules.',
    category: 'Criminal Procedure',
    subjectCode: 'BNSS-MCQ',
    totalQuestions: 40,
    duration: 45,
    difficulty: 'hard' as const,
    price: 99,
    isFree: false,
    isFeatured: true,
    questions: [
      {
        id: 'q1',
        question: 'Under BNSS Section 35, who can grant sanction for prosecuting Armed Forces members?',
        options: ['State Government', 'Central Government', 'Magistrate', 'High Court'],
        correctAnswer: 1,
        explanation: 'Section 35 requires sanction from the Central Government for prosecuting Armed Forces members for acts done in discharge of official duty.',
        section: 'Section 35'
      },
      {
        id: 'q2',
        question: 'What is the time limit for investigation under BNSS for offences punishable with death?',
        options: ['60 days', '90 days', '120 days', 'No time limit'],
        correctAnswer: 1,
        explanation: 'BNSS mandates completion of investigation within 90 days for offences punishable with death or life imprisonment.',
        section: 'Section 173'
      }
    ]
  },
  {
    id: 'mt-constitution-001',
    title: 'Constitutional Law - Fundamental Rights',
    slug: 'constitution-fundamental-rights',
    description: 'MCQs on Articles 12-35 covering all fundamental rights and landmark judgments.',
    category: 'Constitutional Law',
    subjectCode: 'CON-MCQ',
    totalQuestions: 60,
    duration: 75,
    difficulty: 'medium' as const,
    price: 149,
    isFree: false,
    isFeatured: true,
    questions: []
  },
  {
    id: 'mt-contract-001',
    title: 'Indian Contract Act - Free Practice Test',
    slug: 'contract-act-free-test',
    description: 'Free practice test on offer, acceptance, consideration, and breach of contract.',
    category: 'Corporate Law',
    subjectCode: 'CONTRACT-MCQ',
    totalQuestions: 30,
    duration: 30,
    difficulty: 'easy' as const,
    price: 0,
    isFree: true,
    isFeatured: false,
    questions: []
  },
  {
    id: 'mt-judiciary-001',
    title: 'Judiciary Exam - General Knowledge',
    slug: 'judiciary-gk-test',
    description: 'General knowledge and current affairs for judiciary examination preparation.',
    category: 'Foundation',
    subjectCode: 'JUD-MCQ',
    totalQuestions: 100,
    duration: 90,
    difficulty: 'hard' as const,
    price: 199,
    isFree: false,
    isFeatured: true,
    questions: []
  }
];

// ============================================
// LEGAL TEMPLATES STORE
// ============================================

export const legalTemplates = [
  {
    id: 'tpl-001',
    title: 'Rent Agreement Template',
    slug: 'rent-agreement-template',
    description: 'Comprehensive residential rent agreement template compliant with current laws. Includes all essential clauses for landlord-tenant protection.',
    category: 'Property',
    price: 49,
    originalPrice: 99,
    format: 'docx' as const,
    isFeatured: true,
    downloads: 1250,
    previewUrl: '/templates/rent-agreement-preview.pdf',
    tags: ['Property', 'Rent', 'Agreement', 'Residential']
  },
  {
    id: 'tpl-002',
    title: 'Employment Contract Template',
    slug: 'employment-contract-template',
    description: 'Professional employment contract with confidentiality, non-compete, and termination clauses.',
    category: 'Corporate',
    price: 79,
    originalPrice: 149,
    format: 'docx' as const,
    isFeatured: true,
    downloads: 890,
    previewUrl: '/templates/employment-contract-preview.pdf',
    tags: ['Employment', 'HR', 'Corporate', 'Contract']
  },
  {
    id: 'tpl-003',
    title: 'Legal Notice Format Pack',
    slug: 'legal-notice-format-pack',
    description: 'Collection of 10+ legal notice formats for various purposes - recovery, defamation, property disputes.',
    category: 'Litigation',
    price: 99,
    originalPrice: 199,
    format: 'both' as const,
    isFeatured: true,
    downloads: 2100,
    previewUrl: '/templates/legal-notice-preview.pdf',
    tags: ['Notice', 'Litigation', 'Drafting', 'Recovery']
  },
  {
    id: 'tpl-004',
    title: 'Power of Attorney Template',
    slug: 'power-of-attorney-template',
    description: 'General and Special Power of Attorney templates with execution guidelines.',
    category: 'Property',
    price: 39,
    originalPrice: 79,
    format: 'docx' as const,
    isFeatured: false,
    downloads: 650,
    previewUrl: '/templates/poa-preview.pdf',
    tags: ['POA', 'Property', 'Authorization']
  },
  {
    id: 'tpl-005',
    title: 'Non-Disclosure Agreement (NDA)',
    slug: 'nda-template',
    description: 'Mutual and unilateral NDA templates for business and employment purposes.',
    category: 'Corporate',
    price: 59,
    originalPrice: 99,
    format: 'docx' as const,
    isFeatured: true,
    downloads: 1100,
    previewUrl: '/templates/nda-preview.pdf',
    tags: ['NDA', 'Confidentiality', 'Corporate', 'IP']
  },
  {
    id: 'tpl-006',
    title: 'Partnership Deed Template',
    slug: 'partnership-deed-template',
    description: 'Comprehensive partnership deed with profit sharing, capital contribution, and dissolution clauses.',
    category: 'Corporate',
    price: 69,
    originalPrice: 129,
    format: 'docx' as const,
    isFeatured: false,
    downloads: 780,
    previewUrl: '/templates/partnership-preview.pdf',
    tags: ['Partnership', 'Business', 'Deed']
  },
  {
    id: 'tpl-007',
    title: 'Will/Testament Template',
    slug: 'will-template',
    description: 'Legally valid will template with executor appointment and asset distribution clauses.',
    category: 'Family',
    price: 49,
    originalPrice: 99,
    format: 'docx' as const,
    isFeatured: false,
    downloads: 920,
    previewUrl: '/templates/will-preview.pdf',
    tags: ['Will', 'Family', 'Succession', 'Property']
  },
  {
    id: 'tpl-008',
    title: 'Sale Deed Template',
    slug: 'sale-deed-template',
    description: 'Property sale deed template with indemnity and title warranty clauses.',
    category: 'Property',
    price: 89,
    originalPrice: 149,
    format: 'docx' as const,
    isFeatured: true,
    downloads: 540,
    previewUrl: '/templates/sale-deed-preview.pdf',
    tags: ['Property', 'Sale', 'Conveyance']
  }
];

// ============================================
// COMMUNITY FORUM TOPICS
// ============================================

export const forumTopics = [
  {
    id: 'ft-001',
    title: 'Difference between BNS Section 101 and Section 103 (Murder vs Culpable Homicide)',
    slug: 'bns-murder-vs-culpable-homicide',
    content: 'I am having difficulty understanding the distinction between Section 101 (Murder) and Section 103 (Culpable Homicide not amounting to Murder) under BNS. Can someone explain with examples?',
    authorId: 'user-001',
    authorName: 'Rahul Kumar',
    authorAvatar: '',
    category: 'Criminal Law',
    tags: ['BNS', 'Murder', 'Culpable Homicide', 'Section 101'],
    createdAt: '2024-03-15T10:30:00Z',
    replies: [
      {
        id: 'r-001',
        content: 'Section 101 is murder with intention and planning. Section 103 is when death occurs without premeditation or under sudden provocation. Key difference is the presence of "malice aforethought".',
        authorId: 'adv-001',
        authorName: 'Adv. Priya Sharma',
        authorAvatar: '',
        createdAt: '2024-03-15T11:00:00Z',
        upvotes: 15,
        isAccepted: true
      },
      {
        id: 'r-002',
        content: 'Also check the exceptions to Section 101 - grave and sudden provocation, self-defense exceeding limits, etc. These convert murder to culpable homicide.',
        authorId: 'user-002',
        authorName: 'Ananya Patel',
        createdAt: '2024-03-15T12:30:00Z',
        upvotes: 8,
        isAccepted: false
      }
    ],
    upvotes: 24,
    views: 342,
    isSolved: true
  },
  {
    id: 'ft-002',
    title: 'Is anticipatory bail available under BNSS for all offences?',
    slug: 'bnss-anticipatory-bail',
    content: 'I read that BNSS Section 482 has some limitations on anticipatory bail. Can someone clarify which offences are excluded?',
    authorId: 'user-003',
    authorName: 'Karan Malhotra',
    category: 'Criminal Procedure',
    tags: ['BNSS', 'Anticipatory Bail', 'Section 482'],
    createdAt: '2024-03-14T09:15:00Z',
    replies: [
      {
        id: 'r-003',
        content: 'Under BNSS Section 482(2), anticipatory bail is NOT available for offences punishable with death or imprisonment for life. This is a significant change from CrPC.',
        authorId: 'adv-002',
        authorName: 'Adv. Vikram Singh',
        createdAt: '2024-03-14T10:00:00Z',
        upvotes: 22,
        isAccepted: true
      }
    ],
    upvotes: 18,
    views: 256,
    isSolved: true
  },
  {
    id: 'ft-003',
    title: 'Best strategy for Judiciary Exam preparation?',
    slug: 'judiciary-exam-strategy',
    content: 'I am planning to appear for the Delhi Judicial Services exam next year. What should be my preparation strategy? How many hours daily?',
    authorId: 'user-004',
    authorName: 'Neha Gupta',
    category: 'Career',
    tags: ['Judiciary', 'Exam', 'Preparation', 'Strategy'],
    createdAt: '2024-03-13T14:20:00Z',
    replies: [],
    upvotes: 45,
    views: 892,
    isSolved: false
  },
  {
    id: 'ft-004',
    title: 'Difference between CPC Order 37 and Summary Suit',
    slug: 'cpc-order-37-summary-suit',
    content: 'Can someone explain the procedure for summary suits under Order 37 CPC? When can it be filed?',
    authorId: 'user-005',
    authorName: 'Arjun Reddy',
    category: 'Civil Law',
    tags: ['CPC', 'Order 37', 'Summary Suit'],
    createdAt: '2024-03-12T16:45:00Z',
    replies: [
      {
        id: 'r-004',
        content: 'Order 37 CPC deals with summary procedure for recovery of money. It can be filed for liquidated demands like bills of exchange, promissory notes, or written contracts.',
        authorId: 'adv-003',
        authorName: 'Adv. Meera Iyer',
        createdAt: '2024-03-12T17:30:00Z',
        upvotes: 12,
        isAccepted: true
      }
    ],
    upvotes: 15,
    views: 198,
    isSolved: true
  },
  {
    id: 'ft-005',
    title: 'Company Law - Difference between MOA and AOA',
    slug: 'moa-vs-aoa',
    content: 'What is the difference between Memorandum of Association and Articles of Association?',
    authorId: 'user-006',
    authorName: 'Sneha Joshi',
    category: 'Corporate Law',
    tags: ['Company Law', 'MOA', 'AOA'],
    createdAt: '2024-03-11T11:00:00Z',
    replies: [
      {
        id: 'r-005',
        content: 'MOA defines the company\'s relationship with the outside world - objects, scope, and powers. AOA contains internal rules for company management. MOA is supreme; AOA cannot contradict MOA.',
        authorId: 'user-007',
        authorName: 'Rohit Verma',
        createdAt: '2024-03-11T11:30:00Z',
        upvotes: 18,
        isAccepted: true
      }
    ],
    upvotes: 32,
    views: 445,
    isSolved: true
  }
];

// ============================================
// FLASH SALES
// ============================================

export const flashSales = [
  {
    id: 'flash-001',
    title: 'Weekend Flash Sale - 50% OFF!',
    description: 'Get 50% off on all Criminal Law notes this weekend only!',
    startTime: '2024-03-20T00:00:00Z',
    endTime: '2024-03-22T23:59:59Z',
    discountPercent: 50,
    applicableItems: ['bns-complete-notes', 'bsa-complete-notes', 'bnss-complete-notes', 'ipc', 'crpc'],
    maxUses: 100,
    usesCount: 0,
    isActive: true
  },
  {
    id: 'flash-002',
    title: 'New Criminal Laws Mega Sale',
    description: 'Special discount on BNS, BSA, BNSS bundle pack!',
    startTime: '2024-03-25T10:00:00Z',
    endTime: '2024-03-27T10:00:00Z',
    discountPercent: 40,
    applicableItems: ['bns-bsa-bnss-handbook', 'bns-complete-notes', 'bsa-complete-notes', 'bnss-complete-notes'],
    maxUses: 200,
    usesCount: 0,
    isActive: true
  }
];

// ============================================
// REFERRAL PROGRAM CONFIG
// ============================================

export const referralConfig = {
  referrerReward: 100, // Rs. 100 per successful referral
  referredUserDiscount: 50, // Rs. 50 off on first purchase
  minPurchaseForReward: 199, // Minimum purchase for referrer to get reward
  maxReferralsPerMonth: 10
};

// ============================================
// COLLEGE LICENSING PLANS
// ============================================

export const collegeLicensePlans = [
  {
    id: 'college-basic',
    name: 'Basic Institutional License',
    description: 'Perfect for small law colleges with up to 100 students',
    studentCount: 100,
    price: 15000,
    period: 'year',
    features: [
      'Access to all 46 notes',
      'Up to 100 student accounts',
      'Basic analytics dashboard',
      'Email support'
    ]
  },
  {
    id: 'college-standard',
    name: 'Standard Institutional License',
    description: 'Ideal for mid-size colleges with up to 300 students',
    studentCount: 300,
    price: 35000,
    period: 'year',
    features: [
      'Access to all 46 notes + Mock Tests',
      'Up to 300 student accounts',
      'Advanced analytics dashboard',
      'Priority email & phone support',
      'Custom branding available'
    ]
  },
  {
    id: 'college-premium',
    name: 'Premium Institutional License',
    description: 'Complete solution for large institutions with unlimited access',
    studentCount: 1000,
    price: 75000,
    period: 'year',
    features: [
      'Access to all 46 notes + Mock Tests + Templates',
      'Up to 1000 student accounts',
      'Full analytics & progress tracking',
      'Dedicated account manager',
      'Custom branding',
      'API access for LMS integration'
    ]
  }
];

// ============================================
// FREE LEAD MAGNET - LEGAL ENGLISH COURSE
// ============================================

export const freeLeadMagnet = {
  id: 'legal-english-free',
  title: 'Legal English Mastery - FREE Course',
  slug: 'legal-english-free',
  description: 'Master the language of law with our comprehensive Legal English course. Perfect for law students and legal professionals.',
  thumbnailUrl: '/thumbnails/legal-english-free.jpg',
  totalLessons: 10,
  duration: '5 hours',
  lessons: [
    { id: 1, title: 'Introduction to Legal English', duration: '30 min', isFree: true },
    { id: 2, title: 'Legal Vocabulary Essentials', duration: '45 min', isFree: true },
    { id: 3, title: 'Common Latin Terms in Law', duration: '35 min', isFree: true },
    { id: 4, title: 'Drafting Legal Documents', duration: '40 min', isFree: false },
    { id: 5, title: 'Legal Correspondence', duration: '30 min', isFree: false },
    { id: 6, title: 'Courtroom Language', duration: '35 min', isFree: false },
    { id: 7, title: 'Contract Terminology', duration: '40 min', isFree: false },
    { id: 8, title: 'Case Law Reading Skills', duration: '45 min', isFree: false },
    { id: 9, title: 'Legal Writing Style', duration: '35 min', isFree: false },
    { id: 10, title: 'Final Assessment', duration: '30 min', isFree: false }
  ],
  benefits: [
    'Improve your legal writing skills',
    'Understand complex legal terminology',
    'Draft professional legal documents',
    'Communicate effectively in legal settings'
  ]
};

// ============================================
// CERTIFICATE TEMPLATES
// ============================================

export const certificateTemplates = [
  {
    id: 'cert-course-completion',
    name: 'Course Completion Certificate',
    description: 'Awarded upon completing any course or subject notes',
    template: 'standard'
  },
  {
    id: 'cert-mock-test',
    name: 'Mock Test Excellence Certificate',
    description: 'Awarded for scoring 80% or above in mock tests',
    template: 'achievement'
  },
  {
    id: 'cert-streak',
    name: 'Consistency Champion Certificate',
    description: 'Awarded for maintaining 30-day learning streak',
    template: 'streak'
  }
];

// ============================================
// HELPER FUNCTIONS FOR NEW FEATURES
// ============================================

export const getMockTestBySlug = (slug: string) => {
  return mockTests.find(test => test.slug === slug);
};

export const getFreeMockTests = () => {
  return mockTests.filter(test => test.isFree);
};

export const getFeaturedMockTests = () => {
  return mockTests.filter(test => test.isFeatured);
};

export const getTemplateBySlug = (slug: string) => {
  return legalTemplates.find(tpl => tpl.slug === slug);
};

export const getFeaturedTemplates = () => {
  return legalTemplates.filter(tpl => tpl.isFeatured);
};

export const getForumTopicBySlug = (slug: string) => {
  return forumTopics.find(topic => topic.slug === slug);
};

export const getActiveFlashSales = () => {
  const now = new Date().toISOString();
  return flashSales.filter(sale => 
    sale.isActive && 
    sale.startTime <= now && 
    sale.endTime >= now &&
    sale.usesCount < sale.maxUses
  );
};
