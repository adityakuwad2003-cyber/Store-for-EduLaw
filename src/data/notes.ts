import type { Note, Category, Bundle, SubscriptionPlan, LegalService, Testimonial, FAQ } from '@/types';

export const notesData: Note[] = [
  // New Criminal Laws
  { 
    id: 1, 
    title: "BNS Complete Notes", 
    slug: "bns-complete-notes",
    description: "Comprehensive notes on Bharatiya Nyaya Sanhita 2023 covering all sections, offenses, and punishments with case law references.",
    category: "Criminal Law", 
    subjectCode: "BNS-001",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 180,
    thumbnailUrl: "/thumbnails/bns.jpg",
    pdfUrl: "/pdfs/bns-complete.pdf",
    isFeatured: true,
    isNew: true,
    language: 'English',
    tableOfContents: ["Introduction to BNS", "General Explanations", "Punishments", "Offences Against Body", "Offences Against Property"],
    createdAt: "2024-01-15"
  },
  { 
    id: 2, 
    title: "BSA Complete Notes", 
    slug: "bsa-complete-notes",
    description: "Complete Bharatiya Sakshya Adhiniyam 2023 notes with evidence law principles, witness examination, and documentary evidence.",
    category: "Criminal Law", 
    subjectCode: "BSA-001",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 150,
    thumbnailUrl: "/thumbnails/bsa.jpg",
    pdfUrl: "/pdfs/bsa-complete.pdf",
    isFeatured: true,
    isNew: true,
    language: 'English',
    tableOfContents: ["Introduction to BSA", "Relevancy of Facts", "Admissions & Confessions", "Witness Examination", "Documentary Evidence"],
    createdAt: "2024-01-15"
  },
  {
    id: 3,
    title: "BNSS Vol 1 — Preliminary, Arrest & Bail",
    slug: "bnss-vol-1",
    description: "BNSS 2023 Volume 1 covering preliminary provisions, definitions, arrest without warrant, bail, and bond provisions (Sections 1–70).",
    category: "Criminal Law",
    subjectCode: "BNSS-001",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 90,
    thumbnailUrl: "/thumbnails/bnss.jpg",
    pdfUrl: "/pdfs/bnss-vol-1.pdf",
    fileKey: "pdfs/bnss-vol-1.pdf",
    isFeatured: true,
    isNew: true,
    language: 'English',
    tableOfContents: ["Preliminary Provisions", "Definitions", "Arrest Without Warrant", "Bail Provisions", "Bond & Surety"],
    createdAt: "2024-01-15"
  },
  {
    id: 47,
    title: "BNSS Vol 2 — FIR, Investigation & Evidence",
    slug: "bnss-vol-2",
    description: "BNSS 2023 Volume 2 covering FIR registration, police investigation, search and seizure, and admissibility of electronic evidence (Sections 71–140).",
    category: "Criminal Law",
    subjectCode: "BNSS-002",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 90,
    thumbnailUrl: "/thumbnails/bnss.jpg",
    pdfUrl: "/pdfs/bnss-vol-2.pdf",
    fileKey: "pdfs/bnss-vol-2.pdf",
    isFeatured: true,
    isNew: true,
    language: 'English',
    tableOfContents: ["FIR Registration", "Police Investigation Powers", "Search & Seizure", "Electronic Evidence", "Forensic Procedures"],
    createdAt: "2024-01-15"
  },
  {
    id: 48,
    title: "BNSS Vol 3 — Charge & Magistrate Trial",
    slug: "bnss-vol-3",
    description: "BNSS 2023 Volume 3 covering framing of charges, summary trials, trial before Magistrate, and summons cases (Sections 141–210).",
    category: "Criminal Law",
    subjectCode: "BNSS-003",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 90,
    thumbnailUrl: "/thumbnails/bnss.jpg",
    pdfUrl: "/pdfs/bnss-vol-3.pdf",
    fileKey: "pdfs/bnss-vol-3.pdf",
    isFeatured: false,
    isNew: true,
    language: 'English',
    tableOfContents: ["Framing of Charges", "Summary Trial", "Summons Cases", "Warrant Cases", "Trial Before Magistrate"],
    createdAt: "2024-01-15"
  },
  {
    id: 49,
    title: "BNSS Vol 4 — Sessions Trial & Witnesses",
    slug: "bnss-vol-4",
    description: "BNSS 2023 Volume 4 covering trial before Sessions Court, examination of witnesses, cross-examination, and judgment (Sections 211–280).",
    category: "Criminal Law",
    subjectCode: "BNSS-004",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 90,
    thumbnailUrl: "/thumbnails/bnss.jpg",
    pdfUrl: "/pdfs/bnss-vol-4.pdf",
    fileKey: "pdfs/bnss-vol-4.pdf",
    isFeatured: false,
    isNew: true,
    language: 'English',
    tableOfContents: ["Sessions Court Trial", "Examination of Witnesses", "Cross-Examination", "Judgment & Sentencing", "Plea Bargaining"],
    createdAt: "2024-01-15"
  },
  {
    id: 50,
    title: "BNSS Vol 5 — Appeals & Revision",
    slug: "bnss-vol-5",
    description: "BNSS 2023 Volume 5 covering appeal provisions, revision jurisdiction, reference to High Court, and powers of appellate courts (Sections 281–350).",
    category: "Criminal Law",
    subjectCode: "BNSS-005",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 90,
    thumbnailUrl: "/thumbnails/bnss.jpg",
    pdfUrl: "/pdfs/bnss-vol-5.pdf",
    fileKey: "pdfs/bnss-vol-5.pdf",
    isFeatured: false,
    isNew: true,
    language: 'English',
    tableOfContents: ["Right of Appeal", "Appeals to Sessions Court", "Appeals to High Court", "Revision Jurisdiction", "Reference Procedure"],
    createdAt: "2024-01-15"
  },
  {
    id: 51,
    title: "BNSS Vol 6 — Execution of Sentences",
    slug: "bnss-vol-6",
    description: "BNSS 2023 Volume 6 covering execution of death sentences, imprisonment, fines, suspension and remission of sentences (Sections 351–420).",
    category: "Criminal Law",
    subjectCode: "BNSS-006",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 90,
    thumbnailUrl: "/thumbnails/bnss.jpg",
    pdfUrl: "/pdfs/bnss-vol-6.pdf",
    fileKey: "pdfs/bnss-vol-6.pdf",
    isFeatured: false,
    isNew: true,
    language: 'English',
    tableOfContents: ["Death Sentence Execution", "Imprisonment", "Fine & Forfeiture", "Suspension of Sentence", "Remission & Commutation"],
    createdAt: "2024-01-15"
  },
  {
    id: 52,
    title: "BNSS Vol 7 — Miscellaneous Provisions",
    slug: "bnss-vol-7",
    description: "BNSS 2023 Volume 7 covering maintenance proceedings, security for keeping peace, preventive action by police, and unlawful assemblies (Sections 421–490).",
    category: "Criminal Law",
    subjectCode: "BNSS-007",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 90,
    thumbnailUrl: "/thumbnails/bnss.jpg",
    pdfUrl: "/pdfs/bnss-vol-7.pdf",
    fileKey: "pdfs/bnss-vol-7.pdf",
    isFeatured: false,
    isNew: true,
    language: 'English',
    tableOfContents: ["Maintenance Proceedings", "Security for Peace", "Preventive Action by Police", "Unlawful Assemblies", "Disputes as to Immovable Property"],
    createdAt: "2024-01-15"
  },
  {
    id: 53,
    title: "BNSS Vol 8 — Special Procedures & Schedules",
    slug: "bnss-vol-8",
    description: "BNSS 2023 Volume 8 covering special courts, designated courts, victim compensation, witness protection, and all schedules (Sections 491–531).",
    category: "Criminal Law",
    subjectCode: "BNSS-008",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 90,
    thumbnailUrl: "/thumbnails/bnss.jpg",
    pdfUrl: "/pdfs/bnss-vol-8.pdf",
    fileKey: "pdfs/bnss-vol-8.pdf",
    isFeatured: false,
    isNew: true,
    language: 'English',
    tableOfContents: ["Special Courts", "Designated Courts", "Victim Compensation", "Witness Protection Scheme", "Schedules & Forms"],
    createdAt: "2024-01-15"
  },
  { 
    id: 4, 
    title: "BNS BSA BNSS Handbook", 
    slug: "bns-bsa-bnss-handbook",
    description: "Quick reference handbook for all three new criminal laws with comparison tables and section-wise analysis.",
    category: "Criminal Law", 
    subjectCode: "BNS-BSA-BNSS",
    price: 199,
    originalPrice: 349,
    previewPages: 4,
    totalPages: 120,
    thumbnailUrl: "/thumbnails/handbook.jpg",
    pdfUrl: "/pdfs/handbook.pdf",
    isFeatured: false,
    isNew: true,
    language: 'English',
    tableOfContents: ["Comparative Analysis", "BNS Quick Reference", "BSA Quick Reference", "BNSS Quick Reference"],
    createdAt: "2024-02-01"
  },
  
  // Constitutional Law
  { 
    id: 5, 
    title: "Constitution of India Part 1", 
    slug: "constitution-part-1",
    description: "Detailed notes on Preamble, Fundamental Rights (Articles 12-35), and Directive Principles with landmark judgments.",
    category: "Constitutional Law", 
    subjectCode: "CON-001",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 160,
    thumbnailUrl: "/thumbnails/constitution-1.jpg",
    pdfUrl: "/pdfs/constitution-part-1.pdf",
    isFeatured: true,
    isNew: false,
    language: 'English',
    tableOfContents: ["Preamble", "Fundamental Rights", "Right to Equality", "Right to Freedom", "Right Against Exploitation"],
    createdAt: "2023-06-01"
  },
  { 
    id: 6, 
    title: "Constitution of India Part 2", 
    slug: "constitution-part-2",
    description: "Constitutional notes covering Union & State Governments, Judiciary, Emergency Provisions, and Amendment procedures.",
    category: "Constitutional Law", 
    subjectCode: "CON-002",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 170,
    thumbnailUrl: "/thumbnails/constitution-2.jpg",
    pdfUrl: "/pdfs/constitution-part-2.pdf",
    isFeatured: true,
    isNew: false,
    language: 'English',
    tableOfContents: ["Union Government", "State Government", "Judiciary", "Emergency Provisions", "Amendment Process"],
    createdAt: "2023-06-15"
  },
  
  // Family Law
  { 
    id: 7, 
    title: "Family Law Part 1", 
    slug: "family-law-part-1",
    description: "Hindu Law covering Marriage, Divorce, Adoption, Maintenance, and Succession under various Hindu Acts.",
    category: "Family Law", 
    subjectCode: "FAM-001",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 140,
    thumbnailUrl: "/thumbnails/family-1.jpg",
    pdfUrl: "/pdfs/family-law-part-1.pdf",
    isFeatured: false,
    isNew: false,
    language: 'English',
    tableOfContents: ["Hindu Marriage Act", "Divorce Laws", "Adoption & Maintenance", "Hindu Succession Act"],
    createdAt: "2023-07-01"
  },
  { 
    id: 8, 
    title: "Family Law Part 2", 
    slug: "family-law-part-2",
    description: "Muslim Law and other personal laws covering marriage, divorce, inheritance, and family court procedures.",
    category: "Family Law", 
    subjectCode: "FAM-002",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 130,
    thumbnailUrl: "/thumbnails/family-2.jpg",
    pdfUrl: "/pdfs/family-law-part-2.pdf",
    isFeatured: false,
    isNew: false,
    language: 'English',
    tableOfContents: ["Muslim Marriage", "Muslim Divorce", "Muslim Inheritance", "Family Courts Act"],
    createdAt: "2023-07-15"
  },
  
  // Civil Law
  { 
    id: 9, 
    title: "Law of Torts", 
    slug: "law-of-torts",
    description: "Complete tort law notes covering negligence, defamation, nuisance, trespass, and vicarious liability.",
    category: "Civil Law", 
    subjectCode: "TOR-001",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 145,
    thumbnailUrl: "/thumbnails/torts.jpg",
    pdfUrl: "/pdfs/law-of-torts.pdf",
    isFeatured: true,
    isNew: false,
    language: 'English',
    tableOfContents: ["Introduction to Torts", "Negligence", "Defamation", "Nuisance", "Vicarious Liability"],
    createdAt: "2023-05-01"
  },
  { 
    id: 10, 
    title: "CPC - Civil Procedure Code", 
    slug: "cpc",
    description: "Comprehensive CPC notes with detailed procedures, pleadings, execution, and appeals with flowcharts.",
    category: "Civil Law", 
    subjectCode: "CPC-001",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 190,
    thumbnailUrl: "/thumbnails/cpc.jpg",
    pdfUrl: "/pdfs/cpc.pdf",
    isFeatured: true,
    isNew: false,
    language: 'English',
    tableOfContents: ["Introduction to CPC", "Jurisdiction", "Pleadings", "Trial Procedure", "Execution & Appeals"],
    createdAt: "2023-04-01"
  },
  { 
    id: 11, 
    title: "Specific Relief Act", 
    slug: "specific-relief-act",
    description: "Notes on specific performance, injunctions, declaratory decrees with recent amendments and case laws.",
    category: "Civil Law", 
    subjectCode: "SRA-001",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 100,
    thumbnailUrl: "/thumbnails/sra.jpg",
    pdfUrl: "/pdfs/specific-relief-act.pdf",
    isFeatured: false,
    isNew: false,
    language: 'English',
    tableOfContents: ["Recovering Possession", "Specific Performance", "Injunctions", "Declaratory Decrees"],
    createdAt: "2023-08-01"
  },
  { 
    id: 12, 
    title: "Transfer of Property Act", 
    slug: "transfer-of-property-act",
    description: "Detailed notes on sale, mortgage, lease, gift, and exchange with registration requirements.",
    category: "Civil Law", 
    subjectCode: "TPA-001",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 155,
    thumbnailUrl: "/thumbnails/tpa.jpg",
    pdfUrl: "/pdfs/transfer-of-property-act.pdf",
    isFeatured: false,
    isNew: false,
    language: 'English',
    tableOfContents: ["Sale of Immovable Property", "Mortgages", "Leases", "Gifts & Exchanges"],
    createdAt: "2023-08-15"
  },
  { 
    id: 13, 
    title: "Indian Limitation Act", 
    slug: "indian-limitation-act",
    description: "Complete limitation act notes with period of limitation for various suits and appeals.",
    category: "Civil Law", 
    subjectCode: "LIM-001",
    price: 199,
    originalPrice: 249,
    previewPages: 4,
    totalPages: 80,
    thumbnailUrl: "/thumbnails/limitation.jpg",
    pdfUrl: "/pdfs/indian-limitation-act.pdf",
    isFeatured: false,
    isNew: false,
    language: 'English',
    tableOfContents: ["General Principles", "Computation of Period", "Limitation for Suits", "Limitation for Appeals"],
    createdAt: "2023-09-01"
  },
  
  // Criminal Procedure
  { 
    id: 14, 
    title: "CrPC - Criminal Procedure Code", 
    slug: "crpc",
    description: "Complete CrPC notes covering investigation, trial procedures, bail, and appeals with recent amendments.",
    category: "Criminal Procedure", 
    subjectCode: "CRPC-001",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 210,
    thumbnailUrl: "/thumbnails/crpc.jpg",
    pdfUrl: "/pdfs/crpc.pdf",
    isFeatured: true,
    isNew: false,
    language: 'English',
    tableOfContents: ["Introduction to CrPC", "Arrest & Bail", "Investigation", "Trials", "Appeals & Revisions"],
    createdAt: "2023-03-01"
  },
  { 
    id: 15, 
    title: "Indian Penal Code", 
    slug: "ipc",
    description: "Comprehensive IPC notes covering all chapters from general exceptions to offenses against state and property.",
    category: "Criminal Law", 
    subjectCode: "IPC-001",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 220,
    thumbnailUrl: "/thumbnails/ipc.jpg",
    pdfUrl: "/pdfs/ipc.pdf",
    isFeatured: true,
    isNew: false,
    language: 'English',
    tableOfContents: ["General Principles", "General Exceptions", "Offences Against State", "Offences Against Body", "Offences Against Property"],
    createdAt: "2023-02-01"
  },
  { 
    id: 16, 
    title: "Indian Evidence Act", 
    slug: "indian-evidence-act",
    description: "Complete evidence law notes with relevancy, admissibility, witness examination, and documentary evidence.",
    category: "Evidence", 
    subjectCode: "EVI-001",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 165,
    thumbnailUrl: "/thumbnails/evidence.jpg",
    pdfUrl: "/pdfs/indian-evidence-act.pdf",
    isFeatured: true,
    isNew: false,
    language: 'English',
    tableOfContents: ["Introduction to Evidence Act", "Relevancy of Facts", "Admissions & Confessions", "Witness Examination", "Documentary Evidence"],
    createdAt: "2023-02-15"
  },
  { 
    id: 17, 
    title: "NDPS Act", 
    slug: "ndps-act",
    description: "Narcotic Drugs and Psychotropic Substances Act notes with offences, penalties, and bail provisions.",
    category: "Special Acts", 
    subjectCode: "NDPS-001",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 95,
    thumbnailUrl: "/thumbnails/ndps.jpg",
    pdfUrl: "/pdfs/ndps-act.pdf",
    isFeatured: false,
    isNew: false,
    language: 'English',
    tableOfContents: ["Introduction to NDPS", "Offences & Penalties", "Bail Provisions", "Forfeiture of Property"],
    createdAt: "2023-10-01"
  },
  { 
    id: 18, 
    title: "POCSO Act", 
    slug: "pocso-act",
    description: "Protection of Children from Sexual Offences Act with detailed procedures and recent judgments.",
    category: "Special Acts", 
    subjectCode: "POCSO-001",
    price: 199,
    originalPrice: 249,
    previewPages: 4,
    totalPages: 85,
    thumbnailUrl: "/thumbnails/pocso.jpg",
    pdfUrl: "/pdfs/pocso-act.pdf",
    isFeatured: false,
    isNew: false,
    language: 'English',
    tableOfContents: ["Introduction to POCSO", "Sexual Offences Against Children", "Procedure", "Punishments"],
    createdAt: "2023-10-15"
  },
  
  // Corporate Law
  { 
    id: 19, 
    title: "Indian Contract Act", 
    slug: "indian-contract-act",
    description: "Complete contract law notes covering offer, acceptance, consideration, breach, and remedies.",
    category: "Corporate Law", 
    subjectCode: "CON-001",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 175,
    thumbnailUrl: "/thumbnails/contract.jpg",
    pdfUrl: "/pdfs/indian-contract-act.pdf",
    isFeatured: true,
    isNew: false,
    language: 'English',
    tableOfContents: ["Introduction to Contracts", "Offer & Acceptance", "Consideration", "Capacity to Contract", "Breach & Remedies"],
    createdAt: "2023-01-15"
  },
  { 
    id: 20, 
    title: "Sales of Goods Act", 
    slug: "sales-of-goods-act",
    description: "Detailed notes on sale of goods, conditions, warranties, transfer of property, and remedies.",
    category: "Corporate Law", 
    subjectCode: "SOG-001",
    price: 199,
    originalPrice: 249,
    previewPages: 4,
    totalPages: 90,
    thumbnailUrl: "/thumbnails/sog.jpg",
    pdfUrl: "/pdfs/sales-of-goods-act.pdf",
    isFeatured: false,
    isNew: false,
    language: 'English',
    tableOfContents: ["Formation of Contract", "Conditions & Warranties", "Transfer of Property", "Remedies"],
    createdAt: "2023-11-01"
  },
  { 
    id: 21, 
    title: "Company Law", 
    slug: "company-law",
    description: "Comprehensive Companies Act 2013 notes covering incorporation, management, meetings, and winding up.",
    category: "Corporate Law", 
    subjectCode: "COM-001",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 230,
    thumbnailUrl: "/thumbnails/company.jpg",
    pdfUrl: "/pdfs/company-law.pdf",
    isFeatured: true,
    isNew: false,
    language: 'English',
    tableOfContents: ["Introduction to Company Law", "Incorporation", "Memorandum & Articles", "Directors & Meetings", "Winding Up"],
    createdAt: "2023-01-01"
  },
  { 
    id: 22, 
    title: "Insolvency and Bankruptcy Code", 
    slug: "ibc",
    description: "IBC 2016 notes with corporate insolvency, liquidation, and personal insolvency procedures.",
    category: "Corporate Law", 
    subjectCode: "IBC-001",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 140,
    thumbnailUrl: "/thumbnails/ibc.jpg",
    pdfUrl: "/pdfs/ibc.pdf",
    isFeatured: true,
    isNew: false,
    language: 'English',
    tableOfContents: ["Introduction to IBC", "Corporate Insolvency", "Liquidation", "Personal Insolvency"],
    createdAt: "2023-11-15"
  },
  { 
    id: 23, 
    title: "IPR - Intellectual Property Rights", 
    slug: "ipr",
    description: "Complete IPR notes covering patents, trademarks, copyrights, and designs with registration procedures.",
    category: "Corporate Law", 
    subjectCode: "IPR-001",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 160,
    thumbnailUrl: "/thumbnails/ipr.jpg",
    pdfUrl: "/pdfs/ipr.pdf",
    isFeatured: true,
    isNew: false,
    language: 'English',
    tableOfContents: ["Introduction to IPR", "Patents", "Trademarks", "Copyrights", "Designs"],
    createdAt: "2023-12-01"
  },
  { 
    id: 24, 
    title: "Negotiable Instruments Act", 
    slug: "nia",
    description: "NI Act 1881 notes covering promissory notes, bills of exchange, cheques, and Section 138 offenses.",
    category: "Corporate Law", 
    subjectCode: "NIA-001",
    price: 199,
    originalPrice: 249,
    previewPages: 4,
    totalPages: 110,
    thumbnailUrl: "/thumbnails/nia.jpg",
    pdfUrl: "/pdfs/nia.pdf",
    isFeatured: false,
    isNew: false,
    language: 'English',
    tableOfContents: ["Introduction to NI Act", "Promissory Notes", "Bills of Exchange", "Cheques", "Section 138"],
    createdAt: "2023-12-15"
  },
  { 
    id: 25, 
    title: "Indian Partnership Act", 
    slug: "partnership-act",
    description: "Partnership Act 1932 notes covering formation, rights, duties, dissolution of partnership firms.",
    category: "Corporate Law", 
    subjectCode: "PAR-001",
    price: 199,
    originalPrice: 249,
    previewPages: 4,
    totalPages: 85,
    thumbnailUrl: "/thumbnails/partnership.jpg",
    pdfUrl: "/pdfs/partnership-act.pdf",
    isFeatured: false,
    isNew: false,
    language: 'English',
    tableOfContents: ["Nature of Partnership", "Formation", "Rights & Duties", "Dissolution"],
    createdAt: "2024-01-01"
  },
  { 
    id: 26, 
    title: "Merger and Acquisition", 
    slug: "merger-acquisition",
    description: "M&A law notes covering schemes, approvals, SEBI regulations, and competition law aspects.",
    category: "Corporate Law", 
    subjectCode: "MNA-001",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 125,
    thumbnailUrl: "/thumbnails/ma.jpg",
    pdfUrl: "/pdfs/merger-acquisition.pdf",
    isFeatured: false,
    isNew: true,
    language: 'English',
    tableOfContents: ["Introduction to M&A", "Schemes of Arrangement", "Approvals", "SEBI Regulations"],
    createdAt: "2024-02-15"
  },
  { 
    id: 27, 
    title: "Competition Act", 
    slug: "competition-act",
    description: "Competition Act 2002 notes covering anti-competitive agreements, abuse of dominance, and combinations.",
    category: "Corporate Law", 
    subjectCode: "COMP-001",
    price: 199,
    originalPrice: 249,
    previewPages: 4,
    totalPages: 100,
    thumbnailUrl: "/thumbnails/competition.jpg",
    pdfUrl: "/pdfs/competition-act.pdf",
    isFeatured: false,
    isNew: false,
    language: 'English',
    tableOfContents: ["Introduction to Competition Law", "Anti-Competitive Agreements", "Abuse of Dominance", "Combinations"],
    createdAt: "2024-01-15"
  },
  
  // Administrative & Public Law
  { 
    id: 28, 
    title: "Administrative Law", 
    slug: "administrative-law",
    description: "Complete administrative law notes covering delegated legislation, judicial review, and administrative tribunals.",
    category: "Public Law", 
    subjectCode: "ADM-001",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 135,
    thumbnailUrl: "/thumbnails/admin.jpg",
    pdfUrl: "/pdfs/administrative-law.pdf",
    isFeatured: false,
    isNew: false,
    language: 'English',
    tableOfContents: ["Introduction to Administrative Law", "Delegated Legislation", "Judicial Review", "Administrative Tribunals"],
    createdAt: "2023-09-15"
  },
  { 
    id: 29, 
    title: "Right to Information Act", 
    slug: "rti-act",
    description: "RTI Act 2005 notes covering information access, exemptions, appeals, and recent amendments.",
    category: "Public Law", 
    subjectCode: "RTI-001",
    price: 199,
    originalPrice: 249,
    previewPages: 4,
    totalPages: 75,
    thumbnailUrl: "/thumbnails/rti.jpg",
    pdfUrl: "/pdfs/rti-act.pdf",
    isFeatured: false,
    isNew: false,
    language: 'English',
    tableOfContents: ["Introduction to RTI", "Right to Information", "Exemptions", "Appeals"],
    createdAt: "2023-10-01"
  },
  { 
    id: 30, 
    title: "Consumer Protection Act", 
    slug: "consumer-protection-act",
    description: "Consumer Protection Act 2019 notes with consumer rights, complaint procedures, and e-commerce regulations.",
    category: "Public Law", 
    subjectCode: "CPA-001",
    price: 199,
    originalPrice: 249,
    previewPages: 4,
    totalPages: 95,
    thumbnailUrl: "/thumbnails/consumer.jpg",
    pdfUrl: "/pdfs/consumer-protection-act.pdf",
    isFeatured: false,
    isNew: false,
    language: 'English',
    tableOfContents: ["Consumer Rights", "Complaint Procedure", "Consumer Commissions", "E-Commerce Regulations"],
    createdAt: "2023-10-15"
  },
  { 
    id: 31, 
    title: "Human Rights", 
    slug: "human-rights",
    description: "Human rights law notes covering fundamental rights, international conventions, and NHRC procedures.",
    category: "Public Law", 
    subjectCode: "HR-001",
    price: 199,
    originalPrice: 249,
    previewPages: 4,
    totalPages: 105,
    thumbnailUrl: "/thumbnails/human-rights.jpg",
    pdfUrl: "/pdfs/human-rights.pdf",
    isFeatured: false,
    isNew: false,
    language: 'English',
    tableOfContents: ["Introduction to Human Rights", "Fundamental Rights", "International Conventions", "NHRC"],
    createdAt: "2023-11-01"
  },
  
  // Special & Emerging Law
  { 
    id: 32, 
    title: "Environmental Law", 
    slug: "environmental-law",
    description: "Complete environmental law notes covering pollution control, forest conservation, and international conventions.",
    category: "Special Acts", 
    subjectCode: "ENV-001",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 130,
    thumbnailUrl: "/thumbnails/environment.jpg",
    pdfUrl: "/pdfs/environmental-law.pdf",
    isFeatured: false,
    isNew: false,
    language: 'English',
    tableOfContents: ["Introduction to Environmental Law", "Pollution Control Acts", "Forest Conservation", "International Conventions"],
    createdAt: "2023-08-01"
  },
  { 
    id: 33, 
    title: "Labour Law", 
    slug: "labour-law",
    description: "Comprehensive labour law notes covering new labour codes, industrial disputes, and social security.",
    category: "Special Acts", 
    subjectCode: "LAB-001",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 185,
    thumbnailUrl: "/thumbnails/labour.jpg",
    pdfUrl: "/pdfs/labour-law.pdf",
    isFeatured: true,
    isNew: true,
    language: 'English',
    tableOfContents: ["Introduction to Labour Law", "New Labour Codes", "Industrial Disputes", "Social Security"],
    createdAt: "2024-02-01"
  },
  { 
    id: 34, 
    title: "Cyber Law", 
    slug: "cyber-law",
    description: "IT Act 2000 notes covering cyber crimes, digital signatures, e-commerce, and data protection.",
    category: "Special Acts", 
    subjectCode: "CYB-001",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 115,
    thumbnailUrl: "/thumbnails/cyber.jpg",
    pdfUrl: "/pdfs/cyber-law.pdf",
    isFeatured: true,
    isNew: false,
    language: 'English',
    tableOfContents: ["Introduction to Cyber Law", "IT Act 2000", "Cyber Crimes", "Digital Signatures", "Data Protection"],
    createdAt: "2023-07-01"
  },
  { 
    id: 35, 
    title: "Banking Law", 
    slug: "banking-law",
    description: "Banking law notes covering RBI Act, Banking Regulation Act, and negotiable instruments.",
    category: "Special Acts", 
    subjectCode: "BANK-001",
    price: 199,
    originalPrice: 249,
    previewPages: 4,
    totalPages: 105,
    thumbnailUrl: "/thumbnails/banking.jpg",
    pdfUrl: "/pdfs/banking-law.pdf",
    isFeatured: false,
    isNew: false,
    language: 'English',
    tableOfContents: ["Introduction to Banking Law", "RBI Act", "Banking Regulation Act", "Negotiable Instruments"],
    createdAt: "2023-12-01"
  },
  { 
    id: 36, 
    title: "Indian Medical Act", 
    slug: "medical-act",
    description: "Medical law notes covering medical negligence, consent, MCI regulations, and patient rights.",
    category: "Special Acts", 
    subjectCode: "MED-001",
    price: 199,
    originalPrice: 249,
    previewPages: 4,
    totalPages: 90,
    thumbnailUrl: "/thumbnails/medical.jpg",
    pdfUrl: "/pdfs/medical-act.pdf",
    isFeatured: false,
    isNew: false,
    language: 'English',
    tableOfContents: ["Introduction to Medical Law", "Medical Negligence", "Consent", "MCI Regulations"],
    createdAt: "2024-01-01"
  },
  
  // Procedural & Drafting
  { 
    id: 37, 
    title: "Legal Drafting and Conveyancing", 
    slug: "legal-drafting",
    description: "Practical drafting notes covering pleadings, deeds, agreements, and conveyancing techniques.",
    category: "Drafting", 
    subjectCode: "DRAFT-001",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 140,
    thumbnailUrl: "/thumbnails/drafting.jpg",
    pdfUrl: "/pdfs/legal-drafting.pdf",
    isFeatured: true,
    isNew: false,
    language: 'English',
    tableOfContents: ["Introduction to Drafting", "Pleadings", "Deeds", "Agreements", "Conveyancing"],
    createdAt: "2023-06-01"
  },
  { 
    id: 38, 
    title: "Arbitration and Conciliation", 
    slug: "arbitration",
    description: "Arbitration and Conciliation Act 1996 notes with arbitration procedures, awards, and enforcement.",
    category: "ADR", 
    subjectCode: "ARB-001",
    price: 199,
    originalPrice: 249,
    previewPages: 4,
    totalPages: 120,
    thumbnailUrl: "/thumbnails/arbitration.jpg",
    pdfUrl: "/pdfs/arbitration.pdf",
    isFeatured: false,
    isNew: false,
    language: 'English',
    tableOfContents: ["Introduction to ADR", "Arbitration Agreement", "Arbitral Tribunal", "Awards", "Enforcement"],
    createdAt: "2023-09-01"
  },
  { 
    id: 39, 
    title: "Indian Stamp and Registration Act", 
    slug: "stamp-registration",
    description: "Stamp Act and Registration Act notes with stamp duty, registration procedures, and effects of non-registration.",
    category: "Procedural", 
    subjectCode: "STAMP-001",
    price: 199,
    originalPrice: 249,
    previewPages: 4,
    totalPages: 95,
    thumbnailUrl: "/thumbnails/stamp.jpg",
    pdfUrl: "/pdfs/stamp-registration.pdf",
    isFeatured: false,
    isNew: false,
    language: 'English',
    tableOfContents: ["Indian Stamp Act", "Stamp Duty", "Registration Act", "Registration Procedure"],
    createdAt: "2023-11-15"
  },
  
  // International
  { 
    id: 40, 
    title: "International Law", 
    slug: "international-law",
    description: "Public international law notes covering sources, statehood, treaties, and international organizations.",
    category: "International Law", 
    subjectCode: "INT-001",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 145,
    thumbnailUrl: "/thumbnails/international.jpg",
    pdfUrl: "/pdfs/international-law.pdf",
    isFeatured: false,
    isNew: false,
    language: 'English',
    tableOfContents: ["Introduction to International Law", "Sources", "Statehood", "Treaties", "International Organizations"],
    createdAt: "2023-05-15"
  },
  
  // Foundational / Academic
  { 
    id: 41, 
    title: "Jurisprudence", 
    slug: "jurisprudence",
    description: "Legal theory notes covering schools of jurisprudence, sources of law, and legal concepts.",
    category: "Foundation", 
    subjectCode: "JUR-001",
    price: 199,
    originalPrice: 299,
    previewPages: 4,
    totalPages: 155,
    thumbnailUrl: "/thumbnails/jurisprudence.jpg",
    pdfUrl: "/pdfs/jurisprudence.pdf",
    isFeatured: true,
    isNew: false,
    language: 'English',
    tableOfContents: ["Introduction to Jurisprudence", "Schools of Jurisprudence", "Sources of Law", "Legal Concepts"],
    createdAt: "2023-04-15"
  },
  { 
    id: 42, 
    title: "Legal English", 
    slug: "legal-english",
    description: "Legal language and writing skills with vocabulary, grammar, and drafting techniques.",
    category: "Foundation", 
    subjectCode: "ENG-001",
    price: 199,
    originalPrice: 249,
    previewPages: 4,
    totalPages: 85,
    thumbnailUrl: "/thumbnails/legal-english.jpg",
    pdfUrl: "/pdfs/legal-english.pdf",
    isFeatured: false,
    isNew: false,
    language: 'English',
    tableOfContents: ["Legal Vocabulary", "Legal Grammar", "Drafting Techniques", "Legal Writing"],
    createdAt: "2023-08-15"
  },
  { 
    id: 43, 
    title: "Interpretation of Statutes", 
    slug: "interpretation-of-statutes",
    description: "Statutory interpretation notes covering rules, aids, presumptions, and maxims.",
    category: "Foundation", 
    subjectCode: "IOS-001",
    price: 199,
    originalPrice: 249,
    previewPages: 4,
    totalPages: 100,
    thumbnailUrl: "/thumbnails/ios.jpg",
    pdfUrl: "/pdfs/interpretation-of-statutes.pdf",
    isFeatured: false,
    isNew: false,
    language: 'English',
    tableOfContents: ["Introduction to Interpretation", "Rules of Interpretation", "Aids to Interpretation", "Maxims"],
    createdAt: "2023-10-01"
  },
  { 
    id: 44, 
    title: "Criminology and Penology", 
    slug: "criminology",
    description: "Criminology notes covering theories of crime, punishment theories, and prison reforms.",
    category: "Foundation", 
    subjectCode: "CRIM-001",
    price: 199,
    originalPrice: 249,
    previewPages: 4,
    totalPages: 110,
    thumbnailUrl: "/thumbnails/criminology.jpg",
    pdfUrl: "/pdfs/criminology.pdf",
    isFeatured: false,
    isNew: false,
    language: 'English',
    tableOfContents: ["Introduction to Criminology", "Theories of Crime", "Punishment Theories", "Prison Reforms"],
    createdAt: "2023-11-01"
  },
  { 
    id: 45, 
    title: "Sociology", 
    slug: "sociology",
    description: "Sociology for law students covering social institutions, change, and problems in India.",
    category: "Foundation", 
    subjectCode: "SOC-001",
    price: 199,
    originalPrice: 249,
    previewPages: 4,
    totalPages: 95,
    thumbnailUrl: "/thumbnails/sociology.jpg",
    pdfUrl: "/pdfs/sociology.pdf",
    isFeatured: false,
    isNew: false,
    language: 'English',
    tableOfContents: ["Introduction to Sociology", "Social Institutions", "Social Change", "Social Problems in India"],
    createdAt: "2023-12-01"
  },
  { 
    id: 46, 
    title: "Political Science", 
    slug: "political-science",
    description: "Political science notes covering political theory, Indian political system, and international relations.",
    category: "Foundation", 
    subjectCode: "POL-001",
    price: 199,
    originalPrice: 249,
    previewPages: 4,
    totalPages: 105,
    thumbnailUrl: "/thumbnails/political.jpg",
    pdfUrl: "/pdfs/political-science.pdf",
    isFeatured: false,
    isNew: false,
    language: 'English',
    tableOfContents: ["Political Theory", "Indian Political System", "International Relations", "Constitutionalism"],
    createdAt: "2024-01-01"
  },
];

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
    name: "Priya Sharma",
    college: "NLU Delhi",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    quote: "EduLaw notes saved me during my semester exams. The BNS, BSA, BNSS notes were incredibly comprehensive and helped me understand the new criminal laws easily.",
    rating: 5
  },
  {
    id: 2,
    name: "Rahul Verma",
    college: "GLC Mumbai",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    quote: "The bundle pricing is amazing! I got 10 subjects for just ₹1300. The notes are well-structured with case laws and recent amendments. Highly recommended!",
    rating: 5
  },
  {
    id: 3,
    name: "Ananya Patel",
    college: "NLSIU Bangalore",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    quote: "I subscribed to the annual plan and it's been worth every penny. Unlimited access to all notes and the legal services discount is a great bonus.",
    rating: 5
  },
  {
    id: 4,
    name: "Karan Malhotra",
    college: "Faculty of Law, DU",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    quote: "The PDF preview feature is fantastic. I could check the quality before buying. The Constitutional Law notes are excellent with landmark judgment summaries.",
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

export const getNoteBySlug = (slug: string): Note | undefined => {
  return notesData.find(note => note.slug === slug);
};

export const getNotesByCategory = (categorySlug: string): Note[] => {
  return notesData.filter(note => {
    const category = categories.find(c => c.slug === categorySlug);
    return category && note.category === category.name;
  });
};

export const getFeaturedNotes = (): Note[] => {
  return notesData.filter(note => note.isFeatured);
};

export const getNewNotes = (): Note[] => {
  return notesData.filter(note => note.isNew);
};

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
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    category: 'Criminal Law',
    tags: ['BNS', 'Murder', 'Culpable Homicide', 'Section 101'],
    createdAt: '2024-03-15T10:30:00Z',
    replies: [
      {
        id: 'r-001',
        content: 'Section 101 is murder with intention and planning. Section 103 is when death occurs without premeditation or under sudden provocation. Key difference is the presence of "malice aforethought".',
        authorId: 'adv-001',
        authorName: 'Adv. Priya Sharma',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
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
