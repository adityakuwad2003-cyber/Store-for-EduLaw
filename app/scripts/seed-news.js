import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config();

const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
  console.error("❌ Missing Firebase environment variables (PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY)");
  process.exit(1);
}

const app = getApps().length === 0 ? initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  }),
}) : getApps()[0];

const db = getFirestore(app);

const today = new Date().toISOString().split('T')[0];

const SAMPLE_NEWS = [
  // ─── SUPREME COURT (15) ───────────────────────────────────────────────────
  {
    title: "SC Upholds Sanctity of Electoral Process, Declares Periodic Audits Essential",
    court: "Supreme Court",
    category: "Constitutional Law",
    summary: "The Supreme Court, in a landmark ruling, emphasized that free and fair elections are part of the basic structure of the Constitution. The bench directed the Election Commission to implement real-time audit trails for electronic voting. This judgment reinforces the 'public trust' doctrine in democratic institutions. Law students should study this alongside the Kuldip Nayar and ADR precedents.",
  },
  {
    title: "Bail is the Rule, Jail is Exception: SC Grants Relief to Academician",
    court: "Supreme Court",
    category: "Criminal Law",
    summary: "Reiterating the fundamental principle of personal liberty under Article 21, the Supreme Court granted bail to a professor held under UAPA. The court noted that prolonged incarceration without trial violates the right to a speedy trial. The ruling clarifies 'reasonable grounds' for belief of innocence under Section 43D(5). Significant for aspirants tracking the evolution of anti-terror laws.",
  },
  {
    title: "SC Clarifies Doctrine of Legitimate Expectation in Government Contracts",
    court: "Supreme Court",
    category: "Commercial Law",
    summary: "The Court held that while legitimate expectation is a ground for judicial review, it cannot override public interest. The government has the right to alter policy if it acts fairly and without malice. This case settles the conflict between administrative discretion and contractual stability. Essential for understanding Section 70 of the Indian Contract Act in public law contexts.",
  },
  {
    title: "Environment Over Profit: SC Orders Shutdown of Polluting Units in Eco-Sensitive Zone",
    court: "Supreme Court",
    category: "Environmental Law",
    summary: "Applying the 'Precautionary Principle' and 'Polluter Pays Principle', the SC directed the closure of four stone crushing units near the Aravalli range. The court observed that the right to a clean environment is a facet of the right to life. This strengthens the jurisprudence on sustainable development. A must-read for MCQ topics on environmental law statutes.",
  },
  {
    title: "CJI Bench: High Courts Cannot Delay Stay Applications beyond 6 Months",
    court: "Supreme Court",
    category: "General",
    summary: "In a move to curb judicial delays, the CJI-led bench ruled that interim stay orders passed by trial or high courts must be revisited within six months. If not extended by a speaking order, the stay will automatically expire. This aims to speed up civil litigation. Crucial for procedural law subjects like CPC and Limitation Act.",
  },
  {
    title: "SC Recognizes 'Right to be Forgotten' as Part of Privacy Jurisprudence",
    court: "Supreme Court",
    category: "Constitutional Law",
    summary: "The Court directed search engines to de-list a decade-old acquittal order that was causing reputational harm to the petitioner. The ruling expands the scope of the K.S. Puttaswamy judgment on privacy. It balances the right to information with the individual's right to dignity. Highly relevant for contemporary constitutional debates.",
  },
  {
    title: "Insolvency & Bankruptcy Code: SC Rules on Treatment of Regulatory Dues",
    court: "Supreme Court",
    category: "Corporate Law",
    summary: "The SC clarified that regulatory dues (like SEBI fines) do not have priority over secured creditors' claims under the IBC waterfall mechanism. This protects the interests of financial institutions during liquidation. The judgment provides clarity on Section 53 of the IBC. Important for corporate law and insolvency exams.",
  },
  {
    title: "SC on Domestic Violence: Shared Household Right Not Dependent on Ownership",
    court: "Supreme Court",
    category: "Family Law",
    summary: "Expanding the definition of 'shared household', the court ruled that a woman can claim residency rights even if the property belongs to her in-laws. The ruling aims to prevent homelessness of victims of domestic abuse. It interprets Section 17 of the PWDV Act broadly. Key for personal law and gender justice topics.",
  },
  {
    title: "Arbitration: SC Reaffirms Limited Scope of Interference in Foreign Awards",
    court: "Supreme Court",
    category: "Commercial Law",
    summary: "The Court held that Indian courts cannot review the merits of a foreign award under the guise of investigating 'public policy' violations. This promotes India as an arbitration-friendly destination. It strictly interprets Section 48 of the Arbitration and Conciliation Act. Vital for international commercial arbitration modules.",
  },
  {
    title: "SC Directs States to Ensure Universal Minimum Wages for Tea Garden Workers",
    court: "Supreme Court",
    category: "Labour Law",
    summary: "Noting the pathetic conditions of plantation workers, the SC ordered state governments to fix and enforce minimum wages within three months. The court invoked Article 23 against forced labour (underpayment). This is a significant blow to the informal wage structure in the northeast. Relevant for Directive Principles of State Policy.",
  },
  {
    title: "Hate Speech: SC Mandates Suo Motu FIRs across all States/UTs",
    court: "Supreme Court",
    category: "Criminal Law",
    summary: "The Court expanded its previous order, making it mandatory for police to register FIRs against hate speech without waiting for a formal complaint. Failure to do so would attract contempt of court. The bench emphasized India's secular fabric. Important for understanding public order and free speech limits.",
  },
  {
    title: "SC on Land Acquisition: Lapse under Section 24 of 2013 Act Clarified",
    court: "Supreme Court",
    category: "Property Law",
    summary: "The Court ruled that land acquisition does not lapse if the government has deposited the compensation in the treasury, even if the owners refuse to accept it. This landmark ruling settles a long-standing dispute over retrospective application. Essential for property law and administrative law students.",
  },
  {
    title: "Digital Evidence: SC Waives Mandatory 65B Certificate for Direct Evidence",
    court: "Supreme Court",
    category: "General",
    summary: "The Court held that if the original device is produced in court, a certificate under Section 65B of the Evidence Act is not required. This simplifies the admission of WhatsApp messages and emails during trials. This clarification is a major update to the law of evidence in India.",
  },
  {
    title: "SC Upholds Reservation in Promotions for Persons with Disabilities",
    court: "Supreme Court",
    category: "Constitutional Law",
    summary: "The Court ruled that the 1995 and 2016 Acts mandate reservation in promotions for PwDs, irrespective of whether the post was filled via direct recruitment or promotion. It rejected the argument that it would affect 'efficiency' under Article 335. A significant win for inclusive administrative policy.",
  },
  {
    title: "Plea for Same-Sex Marriage: SC Refers Matter to Constitution Bench",
    court: "Supreme Court",
    category: "Family Law",
    summary: "Given the significant constitutional questions regarding the Special Marriage Act and personal laws, the SC has referred the petitions for legal recognition of same-sex marriages to a 5-judge bench. This will determine the future of civil rights for the LGBTQ+ community in India. A major case for Article 14-15 jurisprudence.",
  },

  // ─── HIGH COURTS (15) ──────────────────────────────────────────────────────
  {
    title: "Delhi HC: Maintenance to Wife Cannot be Denied based on Educational Qualification",
    court: "High Court",
    category: "Family Law",
    summary: "The Delhi High Court held that just because a wife is well-educated does not mean she is not entitled to maintenance if she is not actually earning. The husband must provide a lifestyle similar to what she enjoyed during the marriage. This clarifies Section 125 CrPC application. Significant for family law aspirants.",
  },
  {
    title: "Bombay HC Quashes IT Notice Issued to dead person, cites Jurisdictional Error",
    court: "High Court",
    category: "Tax Law",
    summary: "The Court ruled that a notice issued under Section 148 of the IT Act against a deceased person is void ab initio. The revenue cannot argue that it was a procedural irregularity curable under Section 292B. This protects legal heirs from arbitrary tax demands. Essential for tax law students.",
  },
  {
    title: "Allahabad HC: Religious Conversion only for Marriage is Not Valid in Law",
    court: "High Court",
    category: "Constitutional Law",
    summary: "Reiterating its stance on 'love jihad' laws, the court observed that conversion must be based on genuine change of heart and faith, not just to facilitate a marriage contract. The ruling touches upon the right to choose a partner versus state regulation of conversion. A controversial but important precedent for UP-specific exams.",
  },
  {
    title: "Madras HC: Temple Lands Can be Acquired for Public Projects, but Compensation is Sacred",
    court: "High Court",
    category: "Property Law",
    summary: "The Court held that 'God is a perpetual minor' and the state must act as a guardian. While temple land can be used for highways, the compensation must be used only for temple restoration or Vedic schools. It warns against diversion of religious funds by the HR&CE department. Unique property law context.",
  },
  {
    title: "Karnataka HC: IT Sector Employees entitled to Overtime Pay under Shops Act",
    court: "High Court",
    category: "Labour Law",
    summary: "The Court clarified that the exemption granted to IT companies from certain provisions of the Karnataka Shops and Commercial Establishments Act does not include the right to deny overtime. Employees working beyond 9 hours are entitled to double pay. A major victory for tech workers under labour statutes.",
  },
  {
    title: "Gujarat HC Upholds Ban on Non-Veg Food Stalls on Main Roads",
    court: "High Court",
    category: "General",
    summary: "The Court ruled that municipal corporations have the power to regulate street vending in public interest. It held that the right to carry on trade (Art 19(1)(g)) is not absolute and can be restricted for traffic flow and public hygiene. This highlights the 'reasonable restrictions' doctrine in administrative law.",
  },
  {
    title: "Calcutta HC: Post-Poll Violence Victims Entitled to Interim Compensation",
    court: "High Court",
    category: "Constitutional Law",
    summary: "The Court directed the state government to immediately release funds for victims of political violence. It noted that the state failed in its primary duty to protect citizens' lives and property. This case is a study in 'Constitutional Tort' and state liability for inaction.",
  },
  {
    title: "Kerala HC: Transgender Persons Eligible for NCC Entry in accordance with Identity",
    court: "High Court",
    category: "Constitutional Law",
    summary: "The Court struck down a provision in the NCC Act that excluded transgender persons. It held that the state cannot deny opportunity based on gender identity. This is a step toward making the armed and paramilitary wings more inclusive. Key for equality jurisprudence.",
  },
  {
    title: "Punjab & Haryana HC: Live-in Couples entitled to Police Protection, Marriage not Pre-requisite",
    court: "High Court",
    category: "Family Law",
    summary: "Opposing several of its own previous single-bench rulings, the HC held that moral policing by the state is unacceptable. Even if the couple is not married, their life and liberty must be protected under Article 21. This reflects the changing social fabric and the court's role as a protector of rights.",
  },
  {
    title: "Delhi HC: Copyright Infringement in AI Training Needs Urgent Legislative Review",
    court: "High Court",
    category: "Commercial Law",
    summary: "While hearing a plea by music labels against an AI startup, the HC noted that the Current Copyright Act is ill-equipped to handle 'fair use' in the age of generative models. It issued notices to the Ministry of Law and Justice. A cutting-edge topic for IPR and Technology law students.",
  },
  {
    title: "Rajasthan HC: Child Marriage Prohibition Act Overrides Personal Laws",
    court: "High Court",
    category: "Family Law",
    summary: "The Court ruled that the prohibition of child marriage is a secular law that applies to all citizens regardless of religion. It nullified a marriage involve a minor girl despite arguments based on Muslim Personal Law. This supports the move toward a more uniform application of social welfare laws.",
  },
  {
    title: "Patna HC Quashes 65% Caste Reservation increase, cites 50% Ceiling Breach",
    court: "High Court",
    category: "Constitutional Law",
    summary: "The Court struck down the state's move to increase reservation for BCs and STs, noting that the Indra Sawhney cap of 50% cannot be breached without 'extraordinary circumstances'. The court found the state's data insufficient to justify the hike. Crucial for reservation and Article 16 discussions.",
  },
  {
    title: "MP HC: Virtual Hearings a Permanent Right, cannot be limited by Physical Benches",
    court: "High Court",
    category: "General",
    summary: "The High Court ruled that providing a hybrid hearing option is part of 'Access to Justice'. It directed all subordinate courts to provide video conferencing facilities for outstation advocates. This is a major structural change in the Indian judiciary's functioning.",
  },
  {
    title: "Telangana HC: Bank Frauds need Immediate 'Red Flag' Notice to Account Holders",
    court: "High Court",
    category: "Corporate Law",
    summary: "The Court held that RBI circulars require banks to follow principles of natural justice before declaring an account as 'Fraud'. The account holder must be given a chance to represent their case. This prevents arbitrary blacklisting of businesses by lended institutions.",
  },
  {
    title: "Delhi HC Orders Unprecedented ₹50 Crore damages in Trademark Counterfeit Case",
    court: "High Court",
    category: "Commercial Law",
    summary: "In a suit filed by a global luxury brand, the HC awarded massive punitive damages to deter large-scale counterfeiting operations in Delhi markets. This is one of the highest awards in Indian IPR history. It sets a strong precedent for brand protection and original manufacturers.",
  },

  // ─── TRIBUNALS (10) ────────────────────────────────────────────────────────
  {
    title: "NCLAT: Homebuyers' Insolvency Plea must be Project-Specific, not Corporate-Wide",
    court: "Tribunal",
    category: "Corporate Law",
    summary: "The NCLAT reaffirmed that CIRP initiated by homebuyers must be confined to the specific project in default. This prevents the collapse of a developer's healthy projects due to delays in one. A balanced approach to 'Project-wise Insolvency' jurisprudence under the IBC. Important for real estate law students.",
  },
  {
    title: "NGT Orders ₹10 Crore Fine on Municipality for untreated sewage in Mahan River",
    court: "Tribunal",
    category: "Environmental Law",
    summary: "Applying the 'Polluter Pays Principle', the NGT Bhopal bench fined the local body for groundwater contamination. It directed the implementation of a 24/7 Monitoring App and GIS mapping of sewers. The Tribunal emphasized that water quality data must be in the public domain. Key for environmental law MCQs.",
  },
  {
    title: "ITAT Bangalore: IBM entitled to ₹903 Crore Deduction for ESOP Remuneration",
    court: "Tribunal",
    category: "Tax Law",
    summary: "The ITAT ruled that costs incurred by a company for Employee Stock Option Plans (ESOP) are deductible business expenses under Section 37(1). It viewed ESOPs as employee remuneration rather than a capital loss. A major tax relief for MNCs and the Indian tech sector.",
  },
  {
    title: "SAT: SEBI cannot impose Penalties for Technical Lapses without Proof of Intent",
    court: "Tribunal",
    category: "Corporate Law",
    summary: "The Securities Appellate Tribunal set aside a penalty on a broking firm, holding that 'mens rea' or malicious intent must be considered in market manipulation cases. Mere technical non-compliance does not always warrant maximum fines. A crucial ruling for securities law and financial market regulations.",
  },
  {
    title: "TDSAT: Digital News Platforms not under the same Licensing Regime as TV Channels",
    court: "Tribunal",
    category: "General",
    summary: "The Telecom Disputes Settlement and Appellate Tribunal clarified that the current broadcast laws do not extend to internet-only news platforms. This prevents overlapping regulation by the I&B Ministry. It protects the operational freedom of digital-first media companies.",
  },
  {
    title: "CESTAT: No Service Tax on Export of Software Services to Parent Companies",
    court: "Tribunal",
    category: "Tax Law",
    summary: "The Customs, Excise and Service Tax Appellate Tribunal held that software development for a foreign parent entity qualifies as 'Export of Service'. Therefore, it is exempt from the zero-rated tax regime. This provides clarity on the 'place of provision' rules for cross-border IT consulting.",
  },
  {
    title: "CAT Principal Bench: Disciplinary Proceedings cannot continue after Superannuation",
    court: "Tribunal",
    category: "General",
    summary: "The Central Administrative Tribunal ruled that unless there is a specific rule permitting it, the government cannot continue an inquiry against a retired officer once they have ceased to be in service. This protects the pensionary benefits of retired civil servants from indefinite delays. Key for service law.",
  },
  {
    title: "NGT: Parallel Litigation in High Courts Bars Tribunal from Entertaining Same Plea",
    court: "Tribunal",
    category: "Environmental Law",
    summary: "The NGT disposed of a tree-felling petition because the same matter was pending before the MP High Court. This prevents the wastage of judicial resources and conflicting orders. It reinforces the hierarchy and jurisdictional boundaries between statutory tribunals and constitutional courts.",
  },
  {
    title: "ITAT Delhi: Bogus Share Application Money addition quashed for lack of Money Trail",
    court: "Tribunal",
    category: "Tax Law",
    summary: "The ITAT deleted a ₹25 crore addition under Section 68, noting that the revenue failed to prove that the investor NBFC was a shell company. Since the source of funds was identified and the investor was a registered entity, the 'onus' on the taxpayer was discharged. A significant win for private equity funding.",
  },
  {
    title: "NCLT Mumbai: Reliance Capital Resolution Plan approved with 99% Creditor Vote",
    court: "Tribunal",
    category: "Corporate Law",
    summary: "The NCLT Mumbai bench gave a green signal to the acquisition bid by the Hinduja group. This marks the end of one of the longest-running financial service insolvency cases in India. It demonstrates the IBC's effectiveness in resolving complex financial defaults. Excellent case study for corporate law.",
  },

  // ─── CURRENT AFFAIRS (10) ──────────────────────────────────────────────────
  {
    title: "Law Commission considers reducing Age of Consent for Adolescent relationships",
    court: "Current Affairs",
    category: "Criminal Law",
    summary: "The 22nd Law Commission is reportedly discussing a proposal to lower the age of consent from 18 to 16 for consensual relationships, to avoid criminalizing young adults under POCSO. This is a response to several High Court observations on the 'harshness' of the current law. A major legislative debate in training.",
  },
  {
    title: "Parliamentary Panel Recommends National Judicial Commission for Appointments",
    court: "Current Affairs",
    category: "Constitutional Law",
    summary: "A standing committee on Law and Justice has suggested revisiting the NJAC (National Judicial Appointments Commission) to bring more transparency to the Collegium system. This reignites the debate on judicial independence versus executive oversight in judge appointments. Highly relevant for General Studies and Law papers.",
  },
  {
    title: "India's New Criminal Laws (BNS, BNSS, BSA) officially come into force",
    court: "Current Affairs",
    category: "General",
    summary: "The transition from IPC, CrPC, and Evidence Act to the Bharatiya Nyaya Sanhita and others is now complete. The legal fraternity is undergoing massive retraining. The new laws emphasize digital forensics and mandatory video recording of searches. The biggest procedural shift since 1973. Must-know for all law graduates.",
  },
  {
    title: "Bar Council of India allows Foreign Law Firms to open Offices in India",
    court: "Current Affairs",
    category: "Corporate Law",
    summary: "In a historic move, the BCI has notified rules allowing foreign advocates and firms to practice international law and arbitration in India on a reciprocal basis. This is expected to boost cross-border M&A and make India a global hub for legal services. A paradigm shift for the Indian legal market.",
  },
  {
    title: "Ministry of IT notifies New Data Protection Board under DPDP Act 2023",
    court: "Current Affairs",
    category: "General",
    summary: "The Government has established the oversight body that will handle grievances and penalties related to data breaches. Companies now face fines up to ₹250 crore for non-compliance. This marks the beginning of India's robust data privacy regime. Essential for understanding the Digital Personal Data Protection Act.",
  },
  {
    title: "Government introduces Bill to Regulate Inter-State River Water Disputes",
    court: "Current Affairs",
    category: "Environmental Law",
    summary: "The proposed Bill aims to create a permanent tribunal for all river disputes, replacing the currently slow ad-hoc system (like Cauvery/Krishna tribunals). The goal is to settle conflicts within two years. This touches upon federalism and the Seventh Schedule entries on water. Key for constitutional law.",
  },
  {
    title: "UCC Draft ready for National Consultation, Uttarakhand Model as Baseline",
    court: "Current Affairs",
    category: "Family Law",
    summary: "The Uniform Civil Code debate has gained momentum with the Centre preparing a draft that takes cues from the Uttarakhand UCC Act. It focuses on equal inheritance and ban on polygamy. Tribal areas may be exempted. The most significant social reform proposal in decades. Article 44 context is vital.",
  },
  {
    title: "India ranks among Top 5 in Global Arbitration Index for the first time",
    court: "Current Affairs",
    category: "Commercial Law",
    summary: "Following judicial reforms and the setting up of the India International Arbitration Centre (IIAC), India has seen a massive jump in international trust. Legal experts attribute this to 'minimal court intervention' policies. It highlights India's progress toward becoming an Alternative Dispute Resolution hub.",
  },
  {
    title: "Supreme Court E-Committee launches Multi-Lingual High Court Judgment Portal",
    court: "Current Affairs",
    category: "General",
    summary: "Judgments from all 25 High Courts are now available in regional languages like Hindi, Marathi, and Tamil. This move aims to bridge the language barrier for common litigants. It is powered by AI translation tools developed by the Supreme Court's technology team. A win for 'Access to Justice'.",
  },
  {
    title: "RBI issues guidelines for 'Legal Entity Identifier' for cross-border transactions",
    court: "Current Affairs",
    category: "Corporate Law",
    summary: "To curb money laundering and track high-value financial flows, the RBI has made LEI mandatory for all entities involved in major exports/imports. This aligns Indian banking standards with global G20 norms. Crucial for students of banking and financial regulations.",
  }
];

async function seed() {
  console.log("🌱 Starting seed of 50 legal news items...");
  const col = db.collection('playground_content');
  const batch = db.batch();

  for (const item of SAMPLE_NEWS) {
    const docRef = col.doc();
    batch.set(docRef, {
      ...item,
      source: 'EduLaw Digest',
      url: '#',
      publishedAt: new Date().toISOString(),
      dateString: today,
      contentType: 'daily_news',
      createdAt: new Date(),
      type: 'news'
    });
  }

  try {
    await batch.commit();
    console.log(`✅ Successfully seeded ${SAMPLE_NEWS.length} items to Firebase!`);
  } catch (err) {
    console.error("❌ Seed failed:", err);
  } finally {
    process.exit();
  }
}

seed();
