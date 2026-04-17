// ─── MCQ Booklets Data ──────────────────────────────────────────────────────
// 3 booklets × 30 questions each — Companies Act | CLAT Prep | Judiciary

export interface MCQOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface MCQQuestion {
  id: number;
  question: string;
  options: MCQOption[];
  correct: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface MCQBooklet {
  id: string;
  title: string;
  subtitle: string;
  subject: string;
  totalQuestions: number;
  duration: number; // minutes
  difficulty: 'Beginner' | 'Intermediate' | 'Expert';
  colorFrom: string;
  colorTo: string;
  icon: string;
  questions: MCQQuestion[];
  // Premium paper fields (optional — free booklets leave these undefined)
  isPremium?: boolean;
  price?: number;              // INR; 0 = currently free
  totalMarks?: number;
  passMarks?: number;
  paperInstructions?: string[];
  examType?: string;
}

// ─── BOOKLET 1: COMPANIES ACT 2013 ──────────────────────────────────────────

const companiesActQuestions: MCQQuestion[] = [
  {
    id: 1,
    question: 'Under the Companies Act 2013, what is the minimum number of members required to form a public company?',
    options: [
      { id: 'A', text: '2 members' },
      { id: 'B', text: '5 members' },
      { id: 'C', text: '7 members' },
      { id: 'D', text: '10 members' },
    ],
    correct: 'C',
    explanation: 'Section 3(1)(a) of the Companies Act 2013 requires a minimum of 7 members to form a public company, while a private company requires only 2 members.',
  },
  {
    id: 2,
    question: 'Which section of the Companies Act 2013 deals with the concept of "Lifting of Corporate Veil"?',
    options: [
      { id: 'A', text: 'Section 7' },
      { id: 'B', text: 'Section 34' },
      { id: 'C', text: 'Section 339' },
      { id: 'D', text: 'There is no explicit section; it is a judicial doctrine' },
    ],
    correct: 'D',
    explanation: 'Lifting the corporate veil is primarily a judicial doctrine developed through case law (e.g., Salomon v Salomon). While the Act contains specific piercing provisions (Sections 339, 7, etc.), there is no single section codifying the general doctrine.',
  },
  {
    id: 3,
    question: 'What is the maximum number of directors a public company can have under the Companies Act 2013 without shareholder approval?',
    options: [
      { id: 'A', text: '10 directors' },
      { id: 'B', text: '12 directors' },
      { id: 'C', text: '15 directors' },
      { id: 'D', text: '20 directors' },
    ],
    correct: 'C',
    explanation: 'Section 149(1) of the Companies Act 2013 permits a maximum of 15 directors on a board. A company may appoint more than 15 directors only after passing a special resolution.',
  },
  {
    id: 4,
    question: 'Under which section is the concept of "One Person Company (OPC)" introduced in the Companies Act 2013?',
    options: [
      { id: 'A', text: 'Section 2(62)' },
      { id: 'B', text: 'Section 2(68)' },
      { id: 'C', text: 'Section 3(1)(c)' },
      { id: 'D', text: 'Section 12' },
    ],
    correct: 'C',
    explanation: 'One Person Company was introduced under Section 3(1)(c) of the Companies Act 2013, permitting a single person to form a company. Section 2(62) defines OPC.',
  },
  {
    id: 5,
    question: 'Who appoints the first auditor of a company under the Companies Act 2013?',
    options: [
      { id: 'A', text: 'The Registrar of Companies' },
      { id: 'B', text: 'The Board of Directors within 30 days of incorporation' },
      { id: 'C', text: 'The shareholders at the AGM' },
      { id: 'D', text: 'The Central Government' },
    ],
    correct: 'B',
    explanation: 'Section 139(6) provides that the first auditor shall be appointed by the Board of Directors within 30 days of registration of the company. If the Board fails, members shall appoint within 90 days.',
  },
  {
    id: 6,
    question: 'What is the term of office of an Independent Director under the Companies Act 2013?',
    options: [
      { id: 'A', text: '3 consecutive years, renewable once' },
      { id: 'B', text: '5 consecutive years, renewable once' },
      { id: 'C', text: '5 consecutive years, not renewable' },
      { id: 'D', text: '2 years, renewable twice' },
    ],
    correct: 'B',
    explanation: 'Section 149(10) of the Companies Act 2013 provides that an Independent Director holds office for up to 5 consecutive years and is eligible for re-appointment for another 5 years by special resolution, after which a 3-year cooling-off period is required.',
  },
  {
    id: 7,
    question: 'The doctrine of "Ultra Vires" in company law means:',
    options: [
      { id: 'A', text: 'An act done by a director without board approval' },
      { id: 'B', text: 'An act beyond the powers conferred by the Memorandum of Association' },
      { id: 'C', text: 'An act done against the interests of minority shareholders' },
      { id: 'D', text: 'An act done in violation of the Articles of Association' },
    ],
    correct: 'B',
    explanation: 'The Ultra Vires doctrine (established in Ashbury Railway Carriage Co. v Riche) holds that any act beyond the objects clause of the Memorandum of Association is void and cannot be ratified even by all shareholders.',
  },
  {
    id: 8,
    question: 'Under the Companies Act 2013, Corporate Social Responsibility (CSR) is mandated under which section?',
    options: [
      { id: 'A', text: 'Section 125' },
      { id: 'B', text: 'Section 135' },
      { id: 'C', text: 'Section 166' },
      { id: 'D', text: 'Section 188' },
    ],
    correct: 'B',
    explanation: 'Section 135 of the Companies Act 2013 mandates CSR for companies meeting certain financial thresholds (net worth ≥ ₹500 Cr, turnover ≥ ₹1000 Cr, or net profit ≥ ₹5 Cr), requiring them to spend 2% of average net profit on CSR activities.',
  },
  {
    id: 9,
    question: 'Which of the following is NOT a ground for winding up a company by the NCLT under Section 271 of the Companies Act 2013?',
    options: [
      { id: 'A', text: 'The company is unable to pay its debts' },
      { id: 'B', text: 'The company has passed a special resolution for winding up' },
      { id: 'C', text: 'Conduct of affairs in a fraudulent manner' },
      { id: 'D', text: 'The company has not held its AGM for two consecutive years' },
    ],
    correct: 'D',
    explanation: 'The grounds for NCLT winding up under Section 271 include: inability to pay debts, special resolution, just and equitable grounds, fraudulent conduct, and default in filing financial statements. Failure to hold AGM alone is not a direct winding-up ground.',
  },
  {
    id: 10,
    question: '"Prospectus" under the Companies Act 2013 is defined under which section?',
    options: [
      { id: 'A', text: 'Section 2(70)' },
      { id: 'B', text: 'Section 2(36)' },
      { id: 'C', text: 'Section 23' },
      { id: 'D', text: 'Section 26' },
    ],
    correct: 'A',
    explanation: 'Section 2(70) of the Companies Act 2013 defines "prospectus" as any document described or issued as a prospectus, or any notice/circular/advertisement inviting offers from the public for subscription or purchase of securities.',
  },
  {
    id: 11,
    question: 'What is the quorum for a Board Meeting under the Companies Act 2013?',
    options: [
      { id: 'A', text: '1/3 of total strength or 2 directors, whichever is higher' },
      { id: 'B', text: '1/2 of total strength or 2 directors, whichever is higher' },
      { id: 'C', text: '1/3 of total strength or 3 directors, whichever is higher' },
      { id: 'D', text: '2 directors in all cases' },
    ],
    correct: 'A',
    explanation: 'Section 174(1) of the Companies Act 2013 provides that the quorum for a board meeting shall be one-third of its total strength or two directors, whichever is higher.',
  },
  {
    id: 12,
    question: 'Which tribunal handles insolvency proceedings for companies under the Insolvency and Bankruptcy Code 2016?',
    options: [
      { id: 'A', text: 'High Court' },
      { id: 'B', text: 'Company Law Board' },
      { id: 'C', text: 'National Company Law Tribunal (NCLT)' },
      { id: 'D', text: 'Debt Recovery Tribunal (DRT)' },
    ],
    correct: 'C',
    explanation: 'Under the Insolvency and Bankruptcy Code 2016, the National Company Law Tribunal (NCLT) is the adjudicating authority for insolvency resolution and liquidation of corporate persons.',
  },
  {
    id: 13,
    question: 'The "Memorandum of Association" of a company is primarily governed by which sections of the Companies Act 2013?',
    options: [
      { id: 'A', text: 'Sections 4 and 5' },
      { id: 'B', text: 'Sections 3 and 4' },
      { id: 'C', text: 'Sections 4 and 10' },
      { id: 'D', text: 'Sections 2 and 4' },
    ],
    correct: 'A',
    explanation: 'Section 4 of the Companies Act 2013 governs the Memorandum of Association (contents, alteration), while Section 5 governs the Articles of Association.',
  },
  {
    id: 14,
    question: 'A company is said to be a "holding company" of another if it:',
    options: [
      { id: 'A', text: 'Owns more than 10% of its paid-up share capital' },
      { id: 'B', text: 'Controls the composition of its Board of Directors or controls more than half the voting power' },
      { id: 'C', text: 'Owns all the shares of the other company' },
      { id: 'D', text: 'Has the same registered office as the other company' },
    ],
    correct: 'B',
    explanation: 'Under Section 2(46) of the Companies Act 2013, a "holding company" means a company that controls the composition of the Board of Directors or controls more than half the total share capital of another company.',
  },
  {
    id: 15,
    question: 'Under the Companies Act 2013, the annual general meeting (AGM) must be held within how many months from the close of the financial year?',
    options: [
      { id: 'A', text: '3 months' },
      { id: 'B', text: '4 months' },
      { id: 'C', text: '6 months' },
      { id: 'D', text: '9 months' },
    ],
    correct: 'C',
    explanation: 'Section 96 of the Companies Act 2013 provides that the AGM must be held within 6 months from the date of closing of the financial year (except for the first AGM, which may be held within 9 months).',
  },
  {
    id: 16,
    question: 'What is the minimum paid-up share capital required for a private company under the Companies Act 2013 (post-2015 amendment)?',
    options: [
      { id: 'A', text: '₹1 lakh' },
      { id: 'B', text: '₹5 lakh' },
      { id: 'C', text: '₹10 lakh' },
      { id: 'D', text: 'No minimum prescribed' },
    ],
    correct: 'D',
    explanation: 'After the Companies (Amendment) Act 2015, the requirement for minimum paid-up share capital (₹1 lakh for private, ₹5 lakh for public) was removed. There is currently no statutory minimum paid-up share capital in India.',
  },
  {
    id: 17,
    question: 'Who is a "Key Managerial Personnel (KMP)" under the Companies Act 2013?',
    options: [
      { id: 'A', text: 'CEO, CFO, Company Secretary, and Whole-time Director' },
      { id: 'B', text: 'Chairman and Managing Director only' },
      { id: 'C', text: 'All employees earning more than ₹10 lakh per annum' },
      { id: 'D', text: 'All directors of the company' },
    ],
    correct: 'A',
    explanation: 'Section 2(51) of the Companies Act 2013 defines KMP to include: CEO/Managing Director/Manager, Company Secretary, Whole-time Director, Chief Financial Officer, and such other officer as the Board may decide.',
  },
  {
    id: 18,
    question: 'Under Section 185 of the Companies Act 2013, a company is restricted from:',
    options: [
      { id: 'A', text: 'Paying dividends to shareholders' },
      { id: 'B', text: 'Advancing loans to directors (with certain exceptions)' },
      { id: 'C', text: 'Issuing debentures to the public' },
      { id: 'D', text: 'Entering into contracts with subsidiaries' },
    ],
    correct: 'B',
    explanation: 'Section 185 restricts a company from directly or indirectly advancing loans to its directors, or giving guarantees or security in connection with any loan taken by the directors or their relatives, subject to certain exceptions.',
  },
  {
    id: 19,
    question: 'The "Green Shoe Option" in securities law refers to:',
    options: [
      { id: 'A', text: 'Eco-friendly investment products' },
      { id: 'B', text: 'An over-allotment option allowing underwriters to issue additional shares' },
      { id: 'C', text: 'Priority allocation of shares to employees' },
      { id: 'D', text: 'A type of convertible debenture' },
    ],
    correct: 'B',
    explanation: 'The Green Shoe Option (also called over-allotment option) allows underwriters to sell more shares than originally planned during an IPO to stabilize the issue price. It is named after Green Shoe Manufacturing, the first company to use this provision.',
  },
  {
    id: 20,
    question: 'Under which provision can a company buy back its own shares?',
    options: [
      { id: 'A', text: 'Section 67' },
      { id: 'B', text: 'Section 68' },
      { id: 'C', text: 'Section 77' },
      { id: 'D', text: 'Section 56' },
    ],
    correct: 'B',
    explanation: 'Section 68 of the Companies Act 2013 governs buy-back of securities. A company may buy back up to 25% of paid-up capital and free reserves through a special resolution, subject to certain conditions.',
  },
  {
    id: 21,
    question: 'A "debenture" under the Companies Act 2013 is defined under:',
    options: [
      { id: 'A', text: 'Section 2(30)' },
      { id: 'B', text: 'Section 2(31)' },
      { id: 'C', text: 'Section 2(40)' },
      { id: 'D', text: 'Section 2(51)' },
    ],
    correct: 'A',
    explanation: 'Section 2(30) of the Companies Act 2013 defines "debenture" to include debenture stock, bonds or any other instrument of a company evidencing a debt, whether constituting a charge on the assets of the company or not.',
  },
  {
    id: 22,
    question: 'Which court has jurisdiction to try offences under the Companies Act 2013?',
    options: [
      { id: 'A', text: 'High Court only' },
      { id: 'B', text: 'Special Court or Sessions Court' },
      { id: 'C', text: 'District Court' },
      { id: 'D', text: 'Executive Magistrate' },
    ],
    correct: 'B',
    explanation: 'Section 435 of the Companies Act 2013 provides that the Central Government may establish Special Courts for speedy trial of offences under the Act. In the absence of a Special Court, a Sessions Court may try such offences.',
  },
  {
    id: 23,
    question: 'The concept of "Oppression and Mismanagement" in company law is covered under which sections?',
    options: [
      { id: 'A', text: 'Sections 241 and 242' },
      { id: 'B', text: 'Sections 210 and 212' },
      { id: 'C', text: 'Sections 270 and 271' },
      { id: 'D', text: 'Sections 213 and 214' },
    ],
    correct: 'A',
    explanation: 'Sections 241 and 242 of the Companies Act 2013 deal with prevention of oppression and mismanagement. Any member may apply to NCLT if the affairs are being conducted in a manner prejudicial to public interest or oppressive to any member.',
  },
  {
    id: 24,
    question: 'Under the Companies Act 2013, a "small company" is defined as one having paid-up share capital not exceeding:',
    options: [
      { id: 'A', text: '₹50 lakhs' },
      { id: 'B', text: '₹2 crores' },
      { id: 'C', text: '₹4 crores' },
      { id: 'D', text: '₹10 crores' },
    ],
    correct: 'C',
    explanation: 'After the Companies (Amendment) Act 2020, a "small company" under Section 2(85) means a company with paid-up share capital not exceeding ₹4 crores or turnover not exceeding ₹40 crores.',
  },
  {
    id: 25,
    question: 'In which landmark case did the Supreme Court of India uphold the constitutional validity of the Companies Act\'s provision on beneficial ownership disclosure?',
    options: [
      { id: 'A', text: 'Tata Consultancy Services v. State of AP' },
      { id: 'B', text: 'Zee Entertainment Enterprises Ltd. v. Gajendra Mirchandani' },
      { id: 'C', text: 'Vodafone International Holdings v. Union of India' },
      { id: 'D', text: 'SEBI v. Sahara India Real Estate' },
    ],
    correct: 'D',
    explanation: 'SEBI v. Sahara India Real Estate (2012) was a landmark case where the Supreme Court held that Sahara had violated provisions relating to public offerings and ordered refund of ₹24,000 crore to investors, strengthening corporate disclosure norms.',
  },
  {
    id: 26,
    question: 'The "Doctrine of Indoor Management" (Turquand\'s Rule) protects:',
    options: [
      { id: 'A', text: 'Directors from shareholders\' suits' },
      { id: 'B', text: 'Outsiders dealing with a company from internal irregularities' },
      { id: 'C', text: 'The company from fraudulent directors' },
      { id: 'D', text: 'Minority shareholders from oppression' },
    ],
    correct: 'B',
    explanation: 'The Doctrine of Indoor Management (Royal British Bank v. Turquand, 1856) protects bona fide outsiders from internal procedural irregularities. An outsider is entitled to assume that all internal formalities have been complied with.',
  },
  {
    id: 27,
    question: 'Which of the following transactions requires approval by special resolution under the Companies Act 2013?',
    options: [
      { id: 'A', text: 'Appointment of a new director' },
      { id: 'B', text: 'Alteration of the objects clause of the Memorandum' },
      { id: 'C', text: 'Approval of financial statements' },
      { id: 'D', text: 'Declaration of final dividend' },
    ],
    correct: 'B',
    explanation: 'Under Section 13 of the Companies Act 2013, alteration of the Memorandum of Association requires a special resolution (passed by 3/4th majority). Routine matters like director appointment, approving accounts, and dividends require ordinary resolutions.',
  },
  {
    id: 28,
    question: 'The SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015 primarily aim at:',
    options: [
      { id: 'A', text: 'Regulating foreign portfolio investors' },
      { id: 'B', text: 'Ensuring timely disclosure by listed entities to stock exchanges' },
      { id: 'C', text: 'Governing mutual fund operations' },
      { id: 'D', text: 'Controlling insider trading' },
    ],
    correct: 'B',
    explanation: 'SEBI (LODR) Regulations 2015 govern the obligations of listed companies towards stock exchanges, shareholders, and other stakeholders, with emphasis on timely, adequate, and accurate disclosure of information.',
  },
  {
    id: 29,
    question: 'Under which section of the Companies Act 2013 is a Director\'s Identification Number (DIN) required?',
    options: [
      { id: 'A', text: 'Section 152' },
      { id: 'B', text: 'Section 153' },
      { id: 'C', text: 'Section 156' },
      { id: 'D', text: 'Section 158' },
    ],
    correct: 'B',
    explanation: 'Section 153 of the Companies Act 2013 provides that every individual intending to be appointed as a director shall make an application for allotment of a Director Identification Number (DIN) to the Central Government.',
  },
  {
    id: 30,
    question: 'A "Nidhi Company" under the Companies Act 2013 primarily operates for:',
    options: [
      { id: 'A', text: 'Foreign exchange dealings' },
      { id: 'B', text: 'Cultivating habit of thrift and savings among its members' },
      { id: 'C', text: 'Infrastructure project financing' },
      { id: 'D', text: 'Government securities trading' },
    ],
    correct: 'B',
    explanation: 'Section 406 of the Companies Act 2013 defines Nidhi as a company incorporated for cultivating the habit of thrift and savings amongst its members and receiving deposits from, and lending to, its members only.',
  },
];

// ─── BOOKLET 2: CLAT PREP ───────────────────────────────────────────────────

const clatQuestions: MCQQuestion[] = [
  {
    id: 1,
    question: 'The Preamble of the Indian Constitution was amended by which Constitutional Amendment Act?',
    options: [
      { id: 'A', text: '24th Amendment Act, 1971' },
      { id: 'B', text: '42nd Amendment Act, 1976' },
      { id: 'C', text: '44th Amendment Act, 1978' },
      { id: 'D', text: '46th Amendment Act, 1982' },
    ],
    correct: 'B',
    explanation: 'The 42nd Constitutional Amendment Act, 1976 (during Emergency under Indira Gandhi) amended the Preamble by adding the words "Socialist", "Secular", and changing "unity of the nation" to "unity and integrity of the nation".',
  },
  {
    id: 2,
    question: 'Which of the following writs is used to release a person from unlawful detention?',
    options: [
      { id: 'A', text: 'Mandamus' },
      { id: 'B', text: 'Quo Warranto' },
      { id: 'C', text: 'Habeas Corpus' },
      { id: 'D', text: 'Certiorari' },
    ],
    correct: 'C',
    explanation: '"Habeas Corpus" (Latin: "you may have the body") is a writ issued to produce a detained person before a court to examine the lawfulness of detention. It is a safeguard against illegal imprisonment and is available under Articles 32 and 226.',
  },
  {
    id: 3,
    question: 'In a passage on negligence, P is driving at 120 km/h in a 60 km/h zone and hits Q\'s parked car. Applying the principle of res ipsa loquitur, who bears the burden of proof?',
    options: [
      { id: 'A', text: 'Q must prove P\'s negligence conclusively' },
      { id: 'B', text: 'P must explain how the accident occurred without negligence on his part' },
      { id: 'C', text: 'Both parties share equal burden' },
      { id: 'D', text: 'The burden lies with the insurance company' },
    ],
    correct: 'B',
    explanation: 'Res ipsa loquitur (the thing speaks for itself) shifts the evidential burden to the defendant when: (1) the incident normally would not occur without negligence, (2) the defendant had control, and (3) the plaintiff did not contribute. Speeding at 120 km/h clearly shifts burden to P.',
  },
  {
    id: 4,
    question: 'Which Article of the Indian Constitution guarantees the "Right to Equality before Law"?',
    options: [
      { id: 'A', text: 'Article 13' },
      { id: 'B', text: 'Article 14' },
      { id: 'C', text: 'Article 15' },
      { id: 'D', text: 'Article 16' },
    ],
    correct: 'B',
    explanation: 'Article 14 guarantees equality before law and equal protection of laws. Article 15 prohibits discrimination on grounds of religion, race, caste, sex, or place of birth. Article 16 guarantees equality of opportunity in public employment.',
  },
  {
    id: 5,
    question: 'The concept of "Basic Structure" of the Constitution was propounded in which landmark case?',
    options: [
      { id: 'A', text: 'Golaknath v. State of Punjab (1967)' },
      { id: 'B', text: 'Kesavananda Bharati v. State of Kerala (1973)' },
      { id: 'C', text: 'Minerva Mills v. Union of India (1980)' },
      { id: 'D', text: 'Maneka Gandhi v. Union of India (1978)' },
    ],
    correct: 'B',
    explanation: 'In Kesavananda Bharati v. State of Kerala (1973), the Supreme Court (13-judge bench) by a 7-6 majority held that while Parliament can amend any part of the Constitution under Article 368, it cannot alter its "basic structure".',
  },
  {
    id: 6,
    question: 'Legal Principle: A master is vicariously liable for torts committed by his servant acting in the course of employment. Application: A taxi driver, while on duty, runs over a pedestrian while taking a detour to visit his friend. Is the taxi company liable?',
    options: [
      { id: 'A', text: 'Yes, because the driver was on duty at the time' },
      { id: 'B', text: 'No, because the detour is outside the course of employment' },
      { id: 'C', text: 'Yes, if the company owned the taxi' },
      { id: 'D', text: 'No, because tort liability requires direct action by the employer' },
    ],
    correct: 'B',
    explanation: 'Under vicarious liability, an employer is only liable for acts done in the "course of employment." A personal detour (going to visit a friend) is a frolic of the servant\'s own, taking the act outside the scope of employment. Hence the company is not liable.',
  },
  {
    id: 7,
    question: 'Which Article of the Constitution deals with the "Right to Life and Personal Liberty"?',
    options: [
      { id: 'A', text: 'Article 19' },
      { id: 'B', text: 'Article 20' },
      { id: 'C', text: 'Article 21' },
      { id: 'D', text: 'Article 22' },
    ],
    correct: 'C',
    explanation: 'Article 21 provides that no person shall be deprived of life or personal liberty except according to procedure established by law. After Maneka Gandhi v. UOI (1978), this procedure must also be fair, just, and reasonable.',
  },
  {
    id: 8,
    question: 'In CLAT, if 2/5 of a class passed with distinction and 1/3 of the remaining failed, what fraction of the total class neither failed nor passed with distinction?',
    options: [
      { id: 'A', text: '2/5' },
      { id: 'B', text: '2/3' },
      { id: 'C', text: '4/15' },
      { id: 'D', text: '2/15' },
    ],
    correct: 'A',
    explanation: 'Remaining after distinction = 3/5. Failed among remaining = 1/3 × 3/5 = 1/5. Passed without distinction = 3/5 – 1/5 = 2/5. So 2/5 of the total class passed without distinction (neither failed nor got distinction).',
  },
  {
    id: 9,
    question: 'The Directive Principles of State Policy (DPSP) are contained in which Part of the Constitution?',
    options: [
      { id: 'A', text: 'Part III (Articles 12–35)' },
      { id: 'B', text: 'Part IV (Articles 36–51)' },
      { id: 'C', text: 'Part IVA (Article 51A)' },
      { id: 'D', text: 'Part V (Articles 52–151)' },
    ],
    correct: 'B',
    explanation: 'DPSPs are in Part IV (Articles 36–51). Part III covers Fundamental Rights. Part IVA (Article 51A) contains Fundamental Duties added by the 42nd Amendment. DPSPs are non-justiciable but fundamental in governance.',
  },
  {
    id: 10,
    question: 'Principle: Ignorance of law is not an excuse (Ignorantia juris non excusat). Fact: X, a foreign national new to India, parks his car in a no-parking zone, claiming ignorance of the local rule. Can X avoid the fine?',
    options: [
      { id: 'A', text: 'Yes, because he is a foreigner and unaware' },
      { id: 'B', text: 'No, because the principle applies to everyone regardless of nationality' },
      { id: 'C', text: 'Yes, if he has been in India for less than 30 days' },
      { id: 'D', text: 'Depends on whether the rule was published in the Official Gazette' },
    ],
    correct: 'B',
    explanation: 'The maxim Ignorantia juris non excusat applies universally. Once a law is published, everyone is presumed to know it. X cannot avoid the fine by claiming ignorance, regardless of his nationality or duration of stay.',
  },
  {
    id: 11,
    question: 'Which of the following is NOT a Fundamental Right under the Indian Constitution?',
    options: [
      { id: 'A', text: 'Right to Constitutional Remedies (Article 32)' },
      { id: 'B', text: 'Right to Education (Article 21A)' },
      { id: 'C', text: 'Right to Work (Article 41)' },
      { id: 'D', text: 'Right against Exploitation (Article 23)' },
    ],
    correct: 'C',
    explanation: 'Article 41 (Right to Work) is a Directive Principle of State Policy (non-justiciable), not a Fundamental Right. Articles 32, 21A, and 23 are enforceable Fundamental Rights under Part III of the Constitution.',
  },
  {
    id: 12,
    question: 'The Indian Parliament passed the Digital Personal Data Protection Act in which year?',
    options: [
      { id: 'A', text: '2021' },
      { id: 'B', text: '2022' },
      { id: 'C', text: '2023' },
      { id: 'D', text: '2024' },
    ],
    correct: 'C',
    explanation: 'The Digital Personal Data Protection Act (DPDPA) was passed by the Indian Parliament on August 9, 2023 and received Presidential assent on August 11, 2023. It governs the processing of digital personal data in India.',
  },
  {
    id: 13,
    question: 'Six people A, B, C, D, E, F sit in a row. A and B must sit together and C and D must not sit together. How many valid arrangements exist?',
    options: [
      { id: 'A', text: '96' },
      { id: 'B', text: '144' },
      { id: 'C', text: '192' },
      { id: 'D', text: '240' },
    ],
    correct: 'B',
    explanation: 'Treating AB as one unit: 5 units can arrange in 5! = 120 ways; AB internally in 2! = 2 ways = 240 total. Now subtract those where CD are also together: treat AB and CD as units → 4! × 2 × 2 = 96. Answer = 240 – 96 = 144.',
  },
  {
    id: 14,
    question: 'The right to freedom of religion under the Indian Constitution covers:',
    options: [
      { id: 'A', text: 'Only Indian citizens' },
      { id: 'B', text: 'All persons (citizens and non-citizens)' },
      { id: 'C', text: 'Only Hindus and Muslims' },
      { id: 'D', text: 'Only majority religion' },
    ],
    correct: 'B',
    explanation: 'Articles 25 and 26 use the word "persons" (not "citizens"), making the right to freedom of religion available to all persons residing in India, including foreigners. However, Article 25(1) grants this subject to public order, morality, and health.',
  },
  {
    id: 15,
    question: 'Which amendment added "Fundamental Duties" to the Indian Constitution?',
    options: [
      { id: 'A', text: '40th Amendment' },
      { id: 'B', text: '42nd Amendment' },
      { id: 'C', text: '44th Amendment' },
      { id: 'D', text: '86th Amendment' },
    ],
    correct: 'B',
    explanation: 'The 42nd Constitutional Amendment Act, 1976 inserted Article 51A into the Constitution, adding 10 Fundamental Duties. The 86th Amendment Act, 2002 added the 11th Fundamental Duty (to provide opportunities for education to children).',
  },
  {
    id: 16,
    question: 'In a contract, "consideration" means:',
    options: [
      { id: 'A', text: 'The subject matter of the contract' },
      { id: 'B', text: 'Something given or promised in exchange for a promise' },
      { id: 'C', text: 'The mental element of the agreement' },
      { id: 'D', text: 'The written terms of the contract' },
    ],
    correct: 'B',
    explanation: 'Under Section 2(d) of the Indian Contract Act, 1872, "consideration" is when at the desire of the promisor, the promisee has done, abstained, or promised to do something. It is the "price" for which the promise is bought — it must be lawful and real.',
  },
  {
    id: 17,
    question: 'The Bharatiya Nyaya Sanhita (BNS) 2023 replaced which earlier law?',
    options: [
      { id: 'A', text: 'Indian Evidence Act, 1872' },
      { id: 'B', text: 'Code of Criminal Procedure, 1973' },
      { id: 'C', text: 'Indian Penal Code, 1860' },
      { id: 'D', text: 'Prevention of Corruption Act, 1988' },
    ],
    correct: 'C',
    explanation: 'The Bharatiya Nyaya Sanhita (BNS) 2023 replaced the Indian Penal Code (IPC) 1860. Similarly, Bharatiya Nagarik Suraksha Sanhita (BNSS) replaced CrPC, and Bharatiya Sakshya Adhiniyam (BSA) replaced the Indian Evidence Act.',
  },
  {
    id: 18,
    question: 'Ratio decidendi in a judgment means:',
    options: [
      { id: 'A', text: 'The final order of the court' },
      { id: 'B', text: 'The binding legal principle upon which a decision is based' },
      { id: 'C', text: 'Obiter remarks made by the judge' },
      { id: 'D', text: 'Facts of the case as found by the judge' },
    ],
    correct: 'B',
    explanation: '"Ratio decidendi" (reason for deciding) is the binding legal rule or principle on which the court\'s decision is based. It binds lower courts under the doctrine of precedent (stare decisis). Obiter dicta are non-binding side remarks.',
  },
  {
    id: 19,
    question: 'The International Court of Justice (ICJ) is located in:',
    options: [
      { id: 'A', text: 'Geneva, Switzerland' },
      { id: 'B', text: 'Brussels, Belgium' },
      { id: 'C', text: 'The Hague, Netherlands' },
      { id: 'D', text: 'New York, USA' },
    ],
    correct: 'C',
    explanation: 'The International Court of Justice (ICJ), the principal judicial organ of the United Nations, is located at the Peace Palace in The Hague, Netherlands. It resolves legal disputes between states and gives advisory opinions.',
  },
  {
    id: 20,
    question: 'The "ejusdem generis" rule of statutory interpretation means:',
    options: [
      { id: 'A', text: 'A statute should be read as a whole' },
      { id: 'B', text: 'Where general words follow specific ones, the general words are limited to the same category' },
      { id: 'C', text: 'Ambiguous words should be interpreted against the author' },
      { id: 'D', text: 'The literal meaning of the statute prevails always' },
    ],
    correct: 'B',
    explanation: 'Ejusdem generis (of the same kind) holds that where a general term follows specific terms, the general term is restricted to the same genus as the specific terms. E.g., "vehicles, cycles, carts, and other conveyances" — "other conveyances" means land-based transport only.',
  },
  {
    id: 21,
    question: 'Under the Indian Contract Act, 1872, a contract with a minor is:',
    options: [
      { id: 'A', text: 'Voidable at the minor\'s option' },
      { id: 'B', text: 'Valid if ratified upon attaining majority' },
      { id: 'C', text: 'Void ab initio (void from the beginning)' },
      { id: 'D', text: 'Enforceable if the minor provided consideration' },
    ],
    correct: 'C',
    explanation: 'In Mohori Bibee v. Dhurmodas Ghosh (1903), the Privy Council held that a contract with a minor is void ab initio (void from the very beginning) under the Indian Contract Act. It cannot be ratified upon attaining majority as there was never a contract.',
  },
  {
    id: 22,
    question: 'The Supreme Court in Navtej Singh Johar v. Union of India (2018) held that:',
    options: [
      { id: 'A', text: 'Euthanasia is a fundamental right' },
      { id: 'B', text: 'Section 377 of IPC (consensual same-sex acts between adults) is unconstitutional' },
      { id: 'C', text: 'Triple Talaq is unconstitutional' },
      { id: 'D', text: 'Privacy is not a fundamental right' },
    ],
    correct: 'B',
    explanation: 'In Navtej Singh Johar v. UOI (2018), a 5-judge bench unanimously decriminalized consensual same-sex acts by reading down Section 377 IPC. The court held that criminalizing consensual adult same-sex relations violated Articles 14, 15, 19, and 21.',
  },
  {
    id: 23,
    question: 'The Latin maxim "Nemo judex in causa sua" means:',
    options: [
      { id: 'A', text: 'Let the other side be heard' },
      { id: 'B', text: 'No one shall be a judge in his own cause' },
      { id: 'C', text: 'The act of God intervening' },
      { id: 'D', text: 'Justice delayed is justice denied' },
    ],
    correct: 'B',
    explanation: '"Nemo judex in causa sua" (no man a judge in his own cause) is the first rule of natural justice — rule against bias. A judge with a direct interest in the case must recuse himself. The other rule is "audi alteram partem" (hear the other side).',
  },
  {
    id: 24,
    question: 'Which Schedule of the Indian Constitution contains the Oath of Office for the President?',
    options: [
      { id: 'A', text: 'First Schedule' },
      { id: 'B', text: 'Second Schedule' },
      { id: 'C', text: 'Third Schedule' },
      { id: 'D', text: 'Fourth Schedule' },
    ],
    correct: 'C',
    explanation: 'The Third Schedule contains the forms of oaths or affirmations for constitutional offices including the President, Vice-President, Union Ministers, Members of Parliament, Judges of the Supreme Court and High Courts, etc.',
  },
  {
    id: 25,
    question: 'The "Golden Rule" of statutory interpretation allows a court to:',
    options: [
      { id: 'A', text: 'Interpret words literally without exception' },
      { id: 'B', text: 'Modify the literal meaning to avoid absurd or repugnant results' },
      { id: 'C', text: 'Import the purpose of the Act to fill gaps' },
      { id: 'D', text: 'Override the statute if it conflicts with equity' },
    ],
    correct: 'B',
    explanation: 'The Golden Rule (Becke v. Smith, 1836) is a modification of the Literal Rule: where literal interpretation produces absurd, repugnant, or inconsistent results, courts may modify the meaning to avoid such absurdity, while remaining close to the literal text.',
  },
  {
    id: 26,
    question: 'The UN Sustainable Development Goal (SDG) 16 specifically aims at:',
    options: [
      { id: 'A', text: 'Climate action' },
      { id: 'B', text: 'Peace, justice, and strong institutions' },
      { id: 'C', text: 'Quality education' },
      { id: 'D', text: 'Zero hunger' },
    ],
    correct: 'B',
    explanation: 'SDG 16 (Peace, Justice and Strong Institutions) aims to promote peaceful and inclusive societies, provide access to justice for all, and build effective, accountable, and inclusive institutions at all levels.',
  },
  {
    id: 27,
    question: 'If all roses are flowers and some flowers fade quickly, which conclusion NECESSARILY follows?',
    options: [
      { id: 'A', text: 'All roses fade quickly' },
      { id: 'B', text: 'Some roses fade quickly' },
      { id: 'C', text: 'No roses fade quickly' },
      { id: 'D', text: 'None of the above necessarily follows' },
    ],
    correct: 'D',
    explanation: 'From "All roses are flowers" and "Some flowers fade quickly," we CANNOT conclude that any rose specifically fades quickly. The "some flowers" may be entirely non-rose flowers. So no definitive conclusion about roses and fading can be drawn.',
  },
  {
    id: 28,
    question: 'Which Article of the Constitution empowers the Parliament to amend the Constitution?',
    options: [
      { id: 'A', text: 'Article 245' },
      { id: 'B', text: 'Article 356' },
      { id: 'C', text: 'Article 368' },
      { id: 'D', text: 'Article 370' },
    ],
    correct: 'C',
    explanation: 'Article 368 empowers Parliament to amend any provision of the Constitution by introducing a Bill in either House. Some amendments require a simple majority, some require a special majority (2/3 present and voting + absolute majority), and some also require state ratification.',
  },
  {
    id: 29,
    question: 'The International Criminal Court (ICC) was established by:',
    options: [
      { id: 'A', text: 'Vienna Convention, 1969' },
      { id: 'B', text: 'Rome Statute, 1998' },
      { id: 'C', text: 'Geneva Convention, 1949' },
      { id: 'D', text: 'UN Charter, 1945' },
    ],
    correct: 'B',
    explanation: 'The International Criminal Court (ICC) was established by the Rome Statute, adopted on July 17, 1998 and entered into force on July 1, 2002. It has jurisdiction over genocide, crimes against humanity, war crimes, and the crime of aggression.',
  },
  {
    id: 30,
    question: 'In the context of property law, "easement" means:',
    options: [
      { id: 'A', text: 'Full ownership of land' },
      { id: 'B', text: 'A right to use another\'s land for a specific purpose' },
      { id: 'C', text: 'Transfer of property through succession' },
      { id: 'D', text: 'Mortgage of immovable property' },
    ],
    correct: 'B',
    explanation: 'Under the Indian Easements Act, 1882, an easement is a right which the owner or occupier of land possesses over another\'s land to do something on it (e.g., right of way) or prevent something from being done on it (e.g., right to light and air).',
  },
];

// ─── BOOKLET 3: JUDICIARY PREP ──────────────────────────────────────────────

const judiciaryQuestions: MCQQuestion[] = [
  {
    id: 1,
    question: 'Under the Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023, what is the maximum period for which a person can be detained in police custody?',
    options: [
      { id: 'A', text: '15 days' },
      { id: 'B', text: '24 hours' },
      { id: 'C', text: '40 days in total, extendable to 60 days in serious offences' },
      { id: 'D', text: '15 days initially, with extensions up to 60/90 days for judicial custody' },
    ],
    correct: 'D',
    explanation: 'Under BNSS 2023 (replacing CrPC), police custody is limited to 15 days with magistrate\'s order. Judicial custody can extend to 60 days (for offences with <10 years imprisonment) or 90 days (for offences with ≥10 years imprisonment or death) before bail becomes a right.',
  },
  {
    id: 2,
    question: 'Which of the following is the correct test for determining "insanity" as a defence under the Bharatiya Nyaya Sanhita (BNS) 2023?',
    options: [
      { id: 'A', text: 'Durham Rule — the act was a product of mental disease' },
      { id: 'B', text: 'M\'Naghten Rule — the accused did not know the nature or wrongfulness of the act' },
      { id: 'C', text: 'Irresistible Impulse Test' },
      { id: 'D', text: 'Substantial Capacity Test (ALI Model Penal Code)' },
    ],
    correct: 'B',
    explanation: 'Section 22 of BNS 2023 (mirroring Section 84 IPC) codifies the M\'Naghten Rules: an accused is not criminally responsible if, due to unsoundness of mind, they did not know the nature of the act, or did not know that what they were doing was wrong.',
  },
  {
    id: 3,
    question: 'In civil procedure under the CPC, "res judicata" prevents:',
    options: [
      { id: 'A', text: 'Filing an appeal against a judgment' },
      { id: 'B', text: 'Re-litigation of issues already finally decided between the same parties' },
      { id: 'C', text: 'Transfer of cases between courts' },
      { id: 'D', text: 'Attachment of judgment debtor\'s property' },
    ],
    correct: 'B',
    explanation: 'Section 11 of the CPC codifies res judicata — "a matter adjudicated." Once a court of competent jurisdiction has finally decided a matter between the same parties on the same subject matter, neither party can raise it again in any subsequent suit.',
  },
  {
    id: 4,
    question: 'What is "Section 164 BNSS" (formerly Section 164 CrPC) used for?',
    options: [
      { id: 'A', text: 'Recording of confessions and statements by a Magistrate' },
      { id: 'B', text: 'Issuing search warrants' },
      { id: 'C', text: 'Framing of charges by the Sessions Court' },
      { id: 'D', text: 'Granting of bail in non-bailable offences' },
    ],
    correct: 'A',
    explanation: 'Section 183 BNSS 2023 (formerly Section 164 CrPC) empowers a Magistrate to record confessions and statements of any person. Confessions must be voluntary, and the Magistrate must warn the accused they are not bound to confess. Such confessions carry evidentiary value.',
  },
  {
    id: 5,
    question: 'Under which provision of the Constitution are the High Courts given power of judicial review?',
    options: [
      { id: 'A', text: 'Article 32' },
      { id: 'B', text: 'Article 136' },
      { id: 'C', text: 'Article 226' },
      { id: 'D', text: 'Article 227' },
    ],
    correct: 'C',
    explanation: 'Article 226 grants High Courts the power to issue writs (Habeas Corpus, Mandamus, Certiorari, Prohibition, Quo Warranto) for enforcement of fundamental rights AND for any other purpose. Article 32 grants a similar power exclusively to the Supreme Court for fundamental rights.',
  },
  {
    id: 6,
    question: 'The "Examination-in-chief," "Cross-examination," and "Re-examination" of witnesses are governed by which sections of the Bharatiya Sakshya Adhiniyam (BSA) 2023?',
    options: [
      { id: 'A', text: 'Sections 130–136' },
      { id: 'B', text: 'Sections 136–138' },
      { id: 'C', text: 'Sections 137–139' },
      { id: 'D', text: 'Sections 113–117' },
    ],
    correct: 'C',
    explanation: 'Sections 137 (examination-in-chief), 138 (cross-examination), and 139 (re-examination) of the Indian Evidence Act 1872 (now mirrored in BSA 2023) define these stages. Cross-examination can cover any matter; re-examination is restricted to matters arising in cross-examination.',
  },
  {
    id: 7,
    question: 'Which is the correct order of burden of proof in criminal cases?',
    options: [
      { id: 'A', text: 'Accused must prove innocence beyond reasonable doubt' },
      { id: 'B', text: 'Prosecution must prove guilt beyond reasonable doubt; accused must disprove on balance of probabilities when raising a defence' },
      { id: 'C', text: 'Both prosecution and accused share equal burden' },
      { id: 'D', text: 'The court independently investigates and determines facts' },
    ],
    correct: 'B',
    explanation: 'The golden rule is that prosecution bears the burden of proving guilt beyond reasonable doubt. However, when an accused pleads a specific exception (e.g., self-defence, insanity), they bear the burden of proving it on a balance of probabilities (Section 105, Evidence Act).',
  },
  {
    id: 8,
    question: 'Under the Civil Procedure Code, the plaint is rejected under Order VII Rule 11 if:',
    options: [
      { id: 'A', text: 'The defendant fails to appear' },
      { id: 'B', text: 'The suit is barred by limitation, does not disclose a cause of action, or is undervalued' },
      { id: 'C', text: 'There is a defect in summons' },
      { id: 'D', text: 'The plaintiff withdraws the suit' },
    ],
    correct: 'B',
    explanation: 'Order VII Rule 11 CPC provides for rejection of plaint where: (a) it fails to disclose a cause of action, (b) the relief claimed is undervalued and not corrected, (c) the suit appears barred by any law including limitation, or (d) it is not filed in duplicate.',
  },
  {
    id: 9,
    question: 'A Sessions Court acquits an accused. The State wants to appeal. Under BNSS 2023, the State should appeal to:',
    options: [
      { id: 'A', text: 'The Supreme Court under Article 136' },
      { id: 'B', text: 'The High Court under Section 419 BNSS' },
      { id: 'C', text: 'Another Sessions Court' },
      { id: 'D', text: 'The National Court of Appeal' },
    ],
    correct: 'B',
    explanation: 'Under Section 419 BNSS 2023 (formerly Section 378 CrPC), when an accused is acquitted by a court of session, the State Government may direct the Public Prosecutor to prefer an appeal to the High Court.',
  },
  {
    id: 10,
    question: 'What does "interlocutory injunction" mean in civil procedure?',
    options: [
      { id: 'A', text: 'A permanent prohibition ordered after full trial' },
      { id: 'B', text: 'A temporary restraining order granted pending final disposal of the suit' },
      { id: 'C', text: 'An injunction granted in criminal matters only' },
      { id: 'D', text: 'A mandatory order compelling a party to perform an act' },
    ],
    correct: 'B',
    explanation: 'An interlocutory injunction (Order 39, Rule 1 & 2, CPC) is a temporary injunction granted to preserve the status quo pending the final disposal of the suit. The three tests are: (1) prima facie case, (2) balance of convenience, (3) irreparable harm if not granted.',
  },
  {
    id: 11,
    question: 'Which of the following is NOT a "bailable offence" under the Bharatiya Nyaya Sanhita 2023?',
    options: [
      { id: 'A', text: 'Causing simple hurt' },
      { id: 'B', text: 'Cheating involving property worth ₹200' },
      { id: 'C', text: 'Murder' },
      { id: 'D', text: 'Mischief causing damage up to ₹1,000' },
    ],
    correct: 'C',
    explanation: 'Murder (Section 101 BNS 2023, formerly Section 302 IPC) is a non-bailable and cognizable offence. The First Schedule of BNSS classifies offences as bailable/non-bailable. Murder, rape, robbery, and dacoity are classic non-bailable offences.',
  },
  {
    id: 12,
    question: 'The principle of "audi alteram partem" (hear the other side) is a part of:',
    options: [
      { id: 'A', text: 'Substantive due process' },
      { id: 'B', text: 'Natural justice' },
      { id: 'C', text: 'Res judicata' },
      { id: 'D', text: 'Stare decisis' },
    ],
    correct: 'B',
    explanation: '"Audi alteram partem" is the second rule of natural justice — no person should be condemned without being given a fair opportunity to be heard. The first rule is "nemo judex in causa sua" (no bias). Natural justice is the minimum procedural fairness required in adjudication.',
  },
  {
    id: 13,
    question: 'Under the Specific Relief Act 1963, specific performance of a contract cannot be granted when:',
    options: [
      { id: 'A', text: 'The contract involves sale of land' },
      { id: 'B', text: 'The contract is determinable in its nature or involves personal services' },
      { id: 'C', text: 'The defendant is a government body' },
      { id: 'D', text: 'The plaintiff is a corporation' },
    ],
    correct: 'B',
    explanation: 'Section 14 of the Specific Relief Act (as amended in 2018) lists contracts that cannot be specifically enforced, including contracts that are determinable (cancellable at will), contracts involving personal services, and contracts where performance would require constant supervision.',
  },
  {
    id: 14,
    question: 'The doctrine of "promissory estoppel" in Indian law was prominently established in:',
    options: [
      { id: 'A', text: 'Union of India v. Anglo Afghan Agencies (1968)' },
      { id: 'B', text: 'Central London Property Trust v. High Trees House (1947)' },
      { id: 'C', text: 'Motilal Padampat Sugar Mills v. State of UP (1979)' },
      { id: 'D', text: 'Both A and C' },
    ],
    correct: 'D',
    explanation: 'Promissory estoppel in India was developed through both Union of India v. Anglo Afghan Agencies (1968) and Motilal Padampat Sugar Mills v. State of UP (1979), where the Supreme Court held the government bound by its promise even without consideration, to prevent injustice.',
  },
  {
    id: 15,
    question: 'Under the Constitution of India, who has the power to grant pardon, reprieve, respite, or remission of punishment?',
    options: [
      { id: 'A', text: 'Only the Supreme Court' },
      { id: 'B', text: 'President (Article 72) and Governor (Article 161)' },
      { id: 'C', text: 'The Home Ministry' },
      { id: 'D', text: 'The Law Minister' },
    ],
    correct: 'B',
    explanation: 'Article 72 empowers the President to grant pardon, reprieve, respite, remission, commutation, or suspension of sentence in federal matters. Article 161 grants similar powers to the Governor for state offences. The President\'s power extends to death sentences; the Governor\'s does not.',
  },
  {
    id: 16,
    question: 'In Hindu law, "coparcenary" refers to:',
    options: [
      { id: 'A', text: 'Any property inherited by a Hindu' },
      { id: 'B', text: 'A body of persons who acquire a right by birth in joint family property' },
      { id: 'C', text: 'Separate property of a Hindu individual' },
      { id: 'D', text: 'Property received as gift or bequest' },
    ],
    correct: 'B',
    explanation: 'A coparcenary under Hindu Mitakshara law consists of the holder and the three generations below him who acquire an interest in the joint family property by birth. After the Hindu Succession (Amendment) Act 2005, daughters are also coparceners by birth.',
  },
  {
    id: 17,
    question: 'Under the Indian Evidence Act/BSA 2023, a "dying declaration" is admissible because:',
    options: [
      { id: 'A', text: 'The victim is the best witness to their own murder' },
      { id: 'B', text: 'Nemo moriturus praesumitur mentire — a dying person is presumed not to lie' },
      { id: 'C', text: 'It corroborates police investigation' },
      { id: 'D', text: 'It is the only available evidence' },
    ],
    correct: 'B',
    explanation: 'The admissibility of dying declarations (Section 32(1) Evidence Act / Section 26 BSA 2023) rests on the maxim "nemo moriturus praesumitur mentire" — a dying person would not meet their maker with a lie on their lips. No corroboration is required; it can be the sole basis for conviction.',
  },
  {
    id: 18,
    question: 'The "Vishakha Guidelines" issued by the Supreme Court in 1997 addressed:',
    options: [
      { id: 'A', text: 'Reservation in government jobs' },
      { id: 'B', text: 'Sexual harassment of women at workplace, before the POSH Act 2013' },
      { id: 'C', text: 'Custody of children in divorce cases' },
      { id: 'D', text: 'Dowry prohibition' },
    ],
    correct: 'B',
    explanation: 'In Vishakha v. State of Rajasthan (1997), the Supreme Court laid down binding guidelines to protect women from sexual harassment at the workplace, as a legislative vacuum existed. These remained in force until the Sexual Harassment of Women at Workplace (POSH) Act 2013 was enacted.',
  },
  {
    id: 19,
    question: 'A "cognizable offence" under BNSS 2023 is one in which police can:',
    options: [
      { id: 'A', text: 'Arrest only with a Magistrate\'s warrant' },
      { id: 'B', text: 'Arrest without warrant and investigate without prior Magistrate permission' },
      { id: 'C', text: 'Conduct only a preliminary enquiry' },
      { id: 'D', text: 'File a charge sheet directly without investigation' },
    ],
    correct: 'B',
    explanation: 'A "cognizable offence" under Section 2(1)(e) BNSS 2023 (formerly Section 2(c) CrPC) is one in which police can arrest without warrant, investigate, and search without prior Magistrate\'s order. Non-cognizable offences require prior court permission for investigation.',
  },
  {
    id: 20,
    question: 'Under Section 125 CrPC (now Section 144 BNSS 2023), maintenance can be claimed by:',
    options: [
      { id: 'A', text: 'Wives only' },
      { id: 'B', text: 'Wives, children (including illegitimate), and parents' },
      { id: 'C', text: 'Wives and minor children only' },
      { id: 'D', text: 'Any family member' },
    ],
    correct: 'B',
    explanation: 'Section 125 CrPC (Section 144 BNSS) provides for maintenance to: (1) wife unable to maintain herself, (2) legitimate and illegitimate minor children, (3) legitimate/illegitimate children (even major if disabled), and (4) parents unable to maintain themselves.',
  },
  {
    id: 21,
    question: 'Which landmark judgment expanded Article 21\'s scope to include "right to privacy" as a fundamental right?',
    options: [
      { id: 'A', text: 'Maneka Gandhi v. Union of India (1978)' },
      { id: 'B', text: 'K.S. Puttaswamy v. Union of India (2017)' },
      { id: 'C', text: 'Olga Tellis v. Bombay Municipal Corporation (1985)' },
      { id: 'D', text: 'Unni Krishnan v. State of AP (1993)' },
    ],
    correct: 'B',
    explanation: 'In Justice K.S. Puttaswamy (Retd.) v. Union of India (2017), a 9-judge constitutional bench unanimously held that privacy is a fundamental right under Article 21 of the Constitution, overruling earlier judgments in M.P. Sharma (1954) and Kharak Singh (1962).',
  },
  {
    id: 22,
    question: 'The principle of "double jeopardy" is guaranteed under which Article of the Indian Constitution?',
    options: [
      { id: 'A', text: 'Article 20(1)' },
      { id: 'B', text: 'Article 20(2)' },
      { id: 'C', text: 'Article 20(3)' },
      { id: 'D', text: 'Article 22(1)' },
    ],
    correct: 'B',
    explanation: 'Article 20(2) provides that no person shall be prosecuted and punished for the same offence more than once (double jeopardy). Article 20(1) prohibits ex-post facto laws; Article 20(3) protects against self-incrimination; Article 22(1) guarantees right to legal representation upon arrest.',
  },
  {
    id: 23,
    question: 'Under the Transfer of Property Act 1882, "mortgage by deposit of title deeds" (equitable mortgage) is recognized under:',
    options: [
      { id: 'A', text: 'Section 58(a)' },
      { id: 'B', text: 'Section 58(b)' },
      { id: 'C', text: 'Section 58(f)' },
      { id: 'D', text: 'Section 100' },
    ],
    correct: 'C',
    explanation: 'Section 58(f) of the Transfer of Property Act defines "mortgage by deposit of title deeds" (equitable mortgage), where the mortgagor delivers to the creditor documents of title with intent to create a security. This is available only in Kolkata, Mumbai, Chennai, and notified towns.',
  },
  {
    id: 24,
    question: 'In the law of torts, "strict liability" was propounded in which case?',
    options: [
      { id: 'A', text: 'Donoghue v. Stevenson (1932)' },
      { id: 'B', text: 'Rylands v. Fletcher (1868)' },
      { id: 'C', text: 'Bolton v. Stone (1951)' },
      { id: 'D', text: 'Blyth v. Birmingham Waterworks (1856)' },
    ],
    correct: 'B',
    explanation: 'Rylands v. Fletcher (1868) established the rule of strict liability: if a person brings onto their land something likely to do mischief if it escapes, they are prima facie answerable for all the damage naturally caused by its escape. The rule was modified to "absolute liability" by the Supreme Court in MC Mehta v. UOI (1987).',
  },
  {
    id: 25,
    question: 'What is "Lok Adalat" and under which Act is it established?',
    options: [
      { id: 'A', text: 'A criminal court — Code of Criminal Procedure, 1973' },
      { id: 'B', text: 'An alternative dispute resolution forum — Legal Services Authorities Act, 1987' },
      { id: 'C', text: 'A family court — Family Courts Act, 1984' },
      { id: 'D', text: 'A consumer court — Consumer Protection Act, 2019' },
    ],
    correct: 'B',
    explanation: 'Lok Adalats are established under the Legal Services Authorities Act, 1987. They provide an alternative dispute resolution mechanism where cases are settled through conciliation. Awards of Lok Adalats are final, binding, and deemed decrees of civil courts — no appeal lies and no court fees are charged.',
  },
  {
    id: 26,
    question: 'Under the Constitution, the Supreme Court\'s original jurisdiction under Article 131 covers disputes:',
    options: [
      { id: 'A', text: 'Between any two private parties involving a constitutional question' },
      { id: 'B', text: 'Between the Union and one or more States, or between States inter se' },
      { id: 'C', text: 'All election disputes' },
      { id: 'D', text: 'All fundamental rights violations' },
    ],
    correct: 'B',
    explanation: 'Article 131 grants the Supreme Court exclusive original jurisdiction in disputes between: (1) the Union and one or more States, (2) the Union and States on one side and one or more States on the other, or (3) two or more States, involving a legal right.',
  },
  {
    id: 27,
    question: 'Under the Prevention of Corruption Act 1988 (as amended in 2018), which new provision was introduced?',
    options: [
      { id: 'A', text: 'Liability of commercial organisations for bribery' },
      { id: 'B', text: 'Setting up of a special police force' },
      { id: 'C', text: 'Life imprisonment for all corruption offences' },
      { id: 'D', text: 'A whistleblower protection regime' },
    ],
    correct: 'A',
    explanation: 'The Prevention of Corruption (Amendment) Act 2018 introduced Section 9, creating criminal liability for commercial organisations that bribe or cause bribery of public servants. It also shifted the burden to the accused to prove that the demand was not a gratification.',
  },
  {
    id: 28,
    question: 'In Hindu Succession, the amended Section 6 (after 2005) grants daughters:',
    options: [
      { id: 'A', text: 'Only rights in self-acquired property of the father' },
      { id: 'B', text: 'Equal coparcenary rights by birth in joint family property' },
      { id: 'C', text: 'Rights in property only if the father died after 2005' },
      { id: 'D', text: 'Rights equal to a son only if unmarried' },
    ],
    correct: 'B',
    explanation: 'After Vineeta Sharma v. Rakesh Sharma (2020), the Supreme Court clarified that the 2005 amendment is retrospective — daughters are coparceners by birth irrespective of whether the father was alive on the date of the amendment. They have the same rights and liabilities as sons.',
  },
  {
    id: 29,
    question: 'The "Creamy Layer" exclusion in OBC reservation was established in:',
    options: [
      { id: 'A', text: 'State of Madras v. Champakam Dorairajan (1951)' },
      { id: 'B', text: 'Indra Sawhney v. Union of India (1992) (Mandal Commission Case)' },
      { id: 'C', text: 'M. Nagaraj v. Union of India (2006)' },
      { id: 'D', text: 'Ashok Kumar Thakur v. Union of India (2008)' },
    ],
    correct: 'B',
    explanation: 'In Indra Sawhney v. UOI (1992), the 9-judge bench upheld 27% OBC reservation but introduced the "creamy layer" concept — economically and socially advanced members of OBCs should be excluded from reservation benefits. It also fixed a 50% ceiling on reservations (subject to extraordinary circumstances).',
  },
  {
    id: 30,
    question: 'Under the Arbitration and Conciliation Act 1996 (as amended in 2019), an arbitral award can be challenged under:',
    options: [
      { id: 'A', text: 'Section 34 within 3 months of receipt (extendable by 30 days)' },
      { id: 'B', text: 'Section 37 as a first appeal as a matter of right' },
      { id: 'C', text: 'Section 48 in enforcement of foreign awards' },
      { id: 'D', text: 'All of the above, depending on the type of award' },
    ],
    correct: 'A',
    explanation: 'An arbitral award made in India can be challenged under Section 34 of the Arbitration Act within 3 months of receipt (plus 30 days with sufficient cause). Grounds are limited: patent illegality, violation of public policy, etc. Section 37 covers appeals from Section 34 orders, not the award directly.',
  },
];

// ─── EXPORT ─────────────────────────────────────────────────────────────────

export const mcqBooklets: MCQBooklet[] = [
  {
    id: 'companies-act',
    title: 'Companies Act 2013',
    subtitle: 'Corporate Law & Governance',
    subject: 'Corporate Law',
    totalQuestions: 30,
    duration: 45,
    difficulty: 'Expert',
    colorFrom: '#6B1E2E',
    colorTo: '#8B2E42',
    icon: '🏛️',
    questions: companiesActQuestions,
  },
  {
    id: 'clat-prep',
    title: 'CLAT Preparation',
    subtitle: 'Legal Reasoning, GK & Comprehension',
    subject: 'CLAT / LLM Entrance',
    totalQuestions: 30,
    duration: 45,
    difficulty: 'Intermediate',
    colorFrom: '#C9A84C',
    colorTo: '#b8922a',
    icon: '⚖️',
    questions: clatQuestions,
  },
  {
    id: 'judiciary',
    title: 'Judiciary Exam Prep',
    subtitle: 'Civil & Criminal Law Essentials',
    subject: 'Judicial Services',
    totalQuestions: 30,
    duration: 45,
    difficulty: 'Expert',
    colorFrom: '#1e3a5f',
    colorTo: '#2d5a8e',
    icon: '🔨',
    questions: judiciaryQuestions,
  },
];
