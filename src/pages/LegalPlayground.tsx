import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Brain, BookOpen, Newspaper,
  ChevronRight, ChevronLeft, Calendar,
  ArrowRight, X, User,
  ChevronDown, ChevronUp, Layers, Zap,
  Scale, Clock, RefreshCw,
  CheckCircle2, XCircle, HelpCircle, FileText,
  Gavel, Lightbulb,
  BookMarked, Bookmark, Award,
  Share2, ShoppingBag, GraduationCap,
  Copy, Check, ExternalLink,
} from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { SEO } from '@/components/SEO';
import { glossaryData } from '@/data/glossaryData';
import { ExpandableCard } from '@/components/ui/expandable-card';
import type { Article, LegalNews } from '@/pages/LegalHub';
import { drawBaseBackground, drawBadge, drawDivider } from '@/lib/playgroundShare';
import { DailyLegalNews } from '@/components/playground/DailyLegalNews';

// ─── Types (local) ──────────────────────────────────────────────────────────
interface Flashcard { id: string; front: string; back: string; hint?: string; image?: string; }
interface FlashcardDeck {
  id: string; title: string; subject: string; category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Expert';
  cards: Flashcard[]; status: string;
}

// ─── Style maps ─────────────────────────────────────────────────────────────
const originStyle: Record<string, string> = {
  Latin:   'bg-gold/10 text-[#7a5c1e]',
  French:  'bg-blue-50 text-blue-700',
  English: 'bg-slate-100 text-slate-600',
  Other:   'bg-purple-50 text-purple-700',
};

const difficultyStyle: Record<string, string> = {
  Beginner:     'bg-green-100 text-green-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Expert:       'bg-red-100 text-red-700',
};

// ─── Case Law of the Day ─────────────────────────────────────────────────────
interface CaseLaw {
  id: string;
  name: string;
  citation: string;
  court: string;
  year: number;
  subject: string;
  ratio: string;
  significance: string;
}

const CASE_LAW_POOL: CaseLaw[] = [
  { id: 'cl-1', name: 'Kesavananda Bharati v. State of Kerala', citation: 'AIR 1973 SC 1461', court: 'Supreme Court of India', year: 1973, subject: 'Constitutional Law', ratio: 'Parliament has unlimited power to amend the Constitution but cannot alter its basic structure or essential features.', significance: 'Established the Basic Structure Doctrine — the most influential constitutional ruling in Indian history, protecting the core identity of the Constitution.' },
  { id: 'cl-2', name: 'Maneka Gandhi v. Union of India', citation: 'AIR 1978 SC 597', court: 'Supreme Court of India', year: 1978, subject: 'Fundamental Rights', ratio: 'Article 21 must be read alongside Articles 14 and 19; any law depriving personal liberty must be fair, just, and reasonable.', significance: 'Expanded Article 21 from a narrow procedural guarantee to a substantive right to life with dignity.' },
  { id: 'cl-3', name: 'Vishaka v. State of Rajasthan', citation: 'AIR 1997 SC 3011', court: 'Supreme Court of India', year: 1997, subject: 'Labour & Gender Law', ratio: 'Sexual harassment at the workplace violates Articles 14, 19, and 21. Employers have a constitutional duty to prevent it.', significance: 'Led to the Vishaka Guidelines, the precursor to the POSH Act, 2013, defining workplace sexual harassment in India for the first time.' },
  { id: 'cl-4', name: 'SR Bommai v. Union of India', citation: 'AIR 1994 SC 1918', court: 'Supreme Court of India', year: 1994, subject: 'Constitutional Law', ratio: 'Presidential proclamation under Article 356 is subject to judicial review. Floor test is the only legitimate measure of majority.', significance: 'Curtailed the misuse of President\'s Rule and reinforced federalism and secularism as basic features of the Constitution.' },
  { id: 'cl-5', name: 'Mohd. Ahmed Khan v. Shah Bano Begum', citation: 'AIR 1985 SC 945', court: 'Supreme Court of India', year: 1985, subject: 'Family Law', ratio: 'A Muslim husband has a legal obligation under Section 125 CrPC to pay maintenance to his divorced wife beyond the iddat period.', significance: 'Sparked the Shah Bano controversy and led to the Muslim Women (Protection of Rights on Divorce) Act, 1986.' },
  { id: 'cl-6', name: 'Puttaswamy (Retd.) v. Union of India', citation: '(2017) 10 SCC 1', court: 'Supreme Court of India', year: 2017, subject: 'Fundamental Rights', ratio: 'Privacy is a fundamental right under Article 21, inherent in the concept of life and personal liberty.', significance: '9-judge bench unanimously recognised the right to privacy, overruling ADM Jabalpur on this point and forming the basis for data protection law.' },
  { id: 'cl-7', name: 'Navtej Singh Johar v. Union of India', citation: 'AIR 2018 SC 4321', court: 'Supreme Court of India', year: 2018, subject: 'Criminal Law / Rights', ratio: 'Section 377 IPC, in so far as it criminalises consensual sexual acts between adults, is unconstitutional as it violates Articles 14, 15, 19, and 21.', significance: 'Decriminalised homosexuality in India, recognising LGBTQ+ persons as entitled to equal citizenship.' },
  { id: 'cl-8', name: 'Shayara Bano v. Union of India', citation: '(2017) 9 SCC 1', court: 'Supreme Court of India', year: 2017, subject: 'Family Law', ratio: 'The practice of triple talaq (talaq-e-biddat) is manifestly arbitrary and violates Article 14 of the Constitution.', significance: 'Struck down instant triple talaq, paving the way for the Muslim Women (Protection of Rights on Marriage) Act, 2019.' },
  { id: 'cl-9', name: 'Shreya Singhal v. Union of India', citation: 'AIR 2015 SC 1523', court: 'Supreme Court of India', year: 2015, subject: 'Constitutional Law / IT', ratio: 'Section 66A of the IT Act imposes unreasonable restrictions on free speech online and is unconstitutional under Article 19(2).', significance: 'Landmark ruling on digital free speech, striking down the vaguely worded provision used to arrest citizens for online posts.' },
  { id: 'cl-10', name: 'MC Mehta v. Union of India (Oleum Gas Leak)', citation: 'AIR 1987 SC 1086', court: 'Supreme Court of India', year: 1987, subject: 'Environmental Law', ratio: 'An enterprise engaged in a hazardous activity is absolutely liable for any harm caused, without exception — extending Rylands v. Fletcher.', significance: 'Introduced the Absolute Liability rule in India, holding industries strictly responsible for industrial disasters irrespective of fault.' },
  { id: 'cl-11', name: 'Bachan Singh v. State of Punjab', citation: 'AIR 1980 SC 898', court: 'Supreme Court of India', year: 1980, subject: 'Criminal Law', ratio: 'The death penalty is constitutional but must be imposed only in the "rarest of rare" cases when the alternative is unquestionably foreclosed.', significance: 'Established the "rarest of rare" doctrine that still governs capital sentencing in India.' },
  { id: 'cl-12', name: 'Olga Tellis v. Bombay Municipal Corporation', citation: 'AIR 1986 SC 180', court: 'Supreme Court of India', year: 1985, subject: 'Fundamental Rights', ratio: 'The right to livelihood is a component of the right to life under Article 21; eviction without notice or alternative violates this right.', significance: 'Recognised the rights of pavement dwellers, expanding Article 21 to cover socioeconomic entitlements.' },
  { id: 'cl-13', name: 'Minerva Mills Ltd. v. Union of India', citation: 'AIR 1980 SC 1789', court: 'Supreme Court of India', year: 1980, subject: 'Constitutional Law', ratio: 'The 42nd Amendment that gave Parliament absolute amending power was unconstitutional as it destroyed the balance between Fundamental Rights and DPSPs.', significance: 'Reinforced the Basic Structure doctrine post-Emergency, restoring judicial review of constitutional amendments.' },
  { id: 'cl-14', name: 'Common Cause (A Regd. Society) v. Union of India', citation: '(2018) 5 SCC 1', court: 'Supreme Court of India', year: 2018, subject: 'Right to Life', ratio: 'The right to die with dignity is an intrinsic part of Article 21; passive euthanasia and advance medical directives are legally valid.', significance: 'Permitted the withdrawal of life support and advance directives (living wills), recognising dignified death as a constitutional right.' },
  { id: 'cl-15', name: 'Indian Young Lawyers Association v. State of Kerala (Sabarimala)', citation: '(2019) 11 SCC 1', court: 'Supreme Court of India', year: 2018, subject: 'Religion & Gender', ratio: 'Excluding women of menstruating age from Sabarimala temple violates Articles 14, 15, 17, and 25.', significance: 'A deeply contested 4:1 majority ruling on the intersection of religious freedom, gender equality, and the right to worship.' },
  { id: 'cl-16', name: 'ADM Jabalpur v. Shivkant Shukla (Habeas Corpus case)', citation: 'AIR 1976 SC 1207', court: 'Supreme Court of India', year: 1976, subject: 'Constitutional Law', ratio: 'During a proclaimed Emergency, no person has the locus standi to move a High Court for habeas corpus challenging detention.', significance: 'The most controversial ruling in Indian judicial history — overruled in spirit by Puttaswamy (2017), widely considered a grave failure of constitutional duty.' },
  { id: 'cl-17', name: 'Lalita Kumari v. Government of Uttar Pradesh', citation: '(2014) 2 SCC 1', court: 'Supreme Court of India', year: 2014, subject: 'Criminal Procedure', ratio: 'Registration of FIR under Section 154 CrPC is mandatory when the information discloses a cognisable offence; police have no discretion.', significance: 'Removed police discretion to refuse FIR registration, protecting victims\' right to access criminal justice.' },
  { id: 'cl-18', name: 'Indira Nehru Gandhi v. Raj Narain', citation: 'AIR 1975 SC 2299', court: 'Supreme Court of India', year: 1975, subject: 'Constitutional Law', ratio: 'Free and fair elections are a basic feature of the Constitution; Parliament cannot retrospectively validate a corrupt election practice.', significance: 'Allahabad HC had set aside Indira Gandhi\'s election. This ruling ultimately triggered the Emergency, and strengthened the Basic Structure doctrine.' },
  { id: 'cl-19', name: 'Romesh Thapar v. State of Madras', citation: 'AIR 1950 SC 124', court: 'Supreme Court of India', year: 1950, subject: 'Freedom of Speech', ratio: 'Restrictions on free speech can only be upheld if they fall within the specific grounds listed in Article 19(2); "public order" was not then a valid ground.', significance: 'One of the first Supreme Court cases on free speech, directly leading to the First Constitutional Amendment adding "public order" to Article 19(2).' },
  { id: 'cl-20', name: 'State of Madras v. VG Row', citation: 'AIR 1952 SC 196', court: 'Supreme Court of India', year: 1952, subject: 'Fundamental Rights', ratio: 'Restrictions under Article 19 must be reasonable both in nature and in the procedure prescribed for imposing them.', significance: 'Established the proportionality test for restrictions on fundamental rights, used in almost every Article 19 challenge thereafter.' },
  { id: 'cl-21', name: 'DK Basu v. State of West Bengal', citation: 'AIR 1997 SC 610', court: 'Supreme Court of India', year: 1997, subject: 'Criminal Procedure', ratio: 'Custodial torture violates Article 21. Specific procedural safeguards must be followed during arrest and detention.', significance: 'Issued binding guidelines on arrest procedures, now partially codified in the BNSS (formerly CrPC), to prevent custodial deaths.' },
  { id: 'cl-22', name: 'MC Mehta v. Union of India (Taj Trapezium)', citation: 'AIR 1997 SC 734', court: 'Supreme Court of India', year: 1997, subject: 'Environmental Law', ratio: 'The Precautionary Principle and Polluter Pays Principle are part of Indian environmental law.', significance: 'Ordered relocation of polluting industries from the Taj Mahal\'s vicinity, embedding international environmental principles into domestic law.' },
  { id: 'cl-23', name: 'National Legal Services Authority v. Union of India', citation: '(2014) 5 SCC 438', court: 'Supreme Court of India', year: 2014, subject: 'Gender / Rights', ratio: 'Transgender persons have the right to self-identify their gender. They are entitled to reservation as a socially and educationally backward class.', significance: 'Recognised a third gender category under Indian law, directing the government to provide social entitlements to the transgender community.' },
  { id: 'cl-24', name: 'Arnesh Kumar v. State of Bihar', citation: '(2014) 8 SCC 273', court: 'Supreme Court of India', year: 2014, subject: 'Criminal Procedure', ratio: 'Arrest in cases of offences punishable with fewer than 7 years is not automatic; police must apply their mind under Section 41 CrPC before arresting.', significance: 'Addressed arbitrary arrests under Section 498A IPC, issuing a checklist that magistrates must follow before authorising police custody.' },
  { id: 'cl-25', name: 'Golaknath v. State of Punjab', citation: 'AIR 1967 SC 1643', court: 'Supreme Court of India', year: 1967, subject: 'Constitutional Law', ratio: 'Parliament has no power to amend Part III of the Constitution so as to take away or abridge fundamental rights.', significance: 'Triggered a constitutional crisis and led to the 24th Amendment. Overruled by Kesavananda Bharati, but laid the groundwork for the Basic Structure doctrine.' },
  { id: 'cl-26', name: 'Joseph Shine v. Union of India', citation: '(2019) 3 SCC 39', court: 'Supreme Court of India', year: 2018, subject: 'Criminal Law', ratio: 'Section 497 IPC (adultery) is unconstitutional. It treats a woman as property of her husband and violates Articles 14, 15, and 21.', significance: 'Decriminalised adultery in India while affirming that the law reflected archaic patriarchal notions incompatible with constitutional morality.' },
  { id: 'cl-27', name: 'P. Rathinam v. Union of India', citation: 'AIR 1994 SC 1844', court: 'Supreme Court of India', year: 1994, subject: 'Right to Life', ratio: 'Section 309 IPC (attempt to commit suicide) is unconstitutional as it penalises a person already in distress.', significance: 'Later overruled by Gian Kaur (1996) but its logic resurfaced in Common Cause (2018). Led to the Mental Healthcare Act decriminalising suicide attempts.' },
  { id: 'cl-28', name: 'Siddharam Satlingappa Mhetre v. State of Maharashtra', citation: '(2011) 1 SCC 694', court: 'Supreme Court of India', year: 2010, subject: 'Criminal Procedure', ratio: 'Anticipatory bail under Section 438 CrPC is a substantive right; courts must liberally grant it to protect individual liberty against abuse of process.', significance: 'A definitive ruling on the scope of anticipatory bail, listing factors courts must consider — widely cited in bail jurisprudence.' },
  { id: 'cl-29', name: 'Hussainara Khatoon v. State of Bihar', citation: 'AIR 1979 SC 1360', court: 'Supreme Court of India', year: 1979, subject: 'Criminal Procedure', ratio: 'Prolonged pre-trial detention is a violation of the right to speedy trial under Article 21; undertrial prisoners cannot be held longer than the maximum sentence for the offence.', significance: 'Led to the release of thousands of Bihar undertrials and gave birth to the concept of "speedy trial" as a fundamental right in India.' },
  { id: 'cl-30', name: 'Mithu v. State of Punjab', citation: 'AIR 1983 SC 473', court: 'Supreme Court of India', year: 1983, subject: 'Criminal Law', ratio: 'Section 303 IPC (mandatory death sentence for murder by a life convict) is unconstitutional as it deprives the court of judicial discretion.', significance: 'Struck down mandatory death penalty, reinforcing that sentencing must involve judicial discretion and consideration of individual circumstances.' },
  { id: 'cl-31', name: 'Aruna Ramchandra Shanbaug v. Union of India', citation: '(2011) 4 SCC 454', court: 'Supreme Court of India', year: 2011, subject: 'Right to Life', ratio: 'Passive euthanasia — withdrawal of life-sustaining treatment with the informed consent of the patient or next-of-kin — is permissible under Article 21, subject to High Court approval.', significance: 'India\'s first ruling permitting passive euthanasia. Laid the groundwork for Common Cause (2018) which expanded the right to dignified death to include living wills and advance directives.' },
  { id: 'cl-32', name: 'Lily Thomas v. Union of India', citation: '(2013) 7 SCC 653', court: 'Supreme Court of India', year: 2013, subject: 'Constitutional Law / Elections', ratio: 'Section 8(4) of the Representation of the People Act, which allowed convicted MPs/MLAs to continue in office pending appeal, is unconstitutional as it creates an arbitrary distinction.', significance: 'Landmark electoral reform ruling — a sitting legislator convicted and sentenced to two or more years\' imprisonment is immediately disqualified, with no protection for pending appeals.' },
  { id: 'cl-33', name: 'State of Punjab v. Baldev Singh', citation: 'AIR 1999 SC 2378', court: 'Supreme Court of India', year: 1999, subject: 'Criminal Law / NDPS', ratio: 'A search and seizure conducted under the NDPS Act without following the mandatory procedure of Section 50 — offering the accused a search before a gazetted officer or Magistrate — vitiates the prosecution.', significance: 'Established that procedural safeguards in the NDPS Act are sacrosanct; non-compliance creates a reasonable doubt and entitles the accused to acquittal regardless of evidence recovered.' },
  { id: 'cl-34', name: 'Vineeta Sharma v. Rakesh Sharma', citation: '(2020) 9 SCC 1', court: 'Supreme Court of India', year: 2020, subject: 'Family Law', ratio: 'A daughter is a coparcener by birth under the Hindu Succession (Amendment) Act, 2005, with the same rights and liabilities as a son — and this applies even if the father died before the 2005 amendment.', significance: 'Settled the debate on daughters\' coparcenary rights in HUF property. The right exists by birth regardless of the father\'s death before the amendment — a landmark stride for gender-equal inheritance in India.' },
  { id: 'cl-35', name: 'Indore Development Authority v. Manoharlal', citation: '(2020) 8 SCC 129', court: 'Supreme Court of India', year: 2020, subject: 'Property Law / Land Acquisition', ratio: 'Under the Right to Fair Compensation and Transparency in Land Acquisition Act, 2013, the lapse provision under Section 24(2) is triggered only if neither compensation is paid NOR possession is taken — not upon non-payment alone.', significance: 'Full bench decision overruling a series of High Court judgments that had stalled public infrastructure projects. Clarified that land acquisition proceedings do not lapse unless both payment and possession have been withheld.' },
];

/** Deterministic daily seed — same 3 cases for all users on a given calendar day */
function getDailyCaseLaws(): CaseLaw[] {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const seed = today.getFullYear() * 1000 + dayOfYear;

  const pool = [...CASE_LAW_POOL];
  const selected: CaseLaw[] = [];
  let s = seed;
  for (let i = 0; i < 3; i++) {
    // Linear congruential generator for a repeatable shuffle
    s = Math.imul(s, 1664525) + 1013904223;
    const idx = Math.abs(s) % pool.length;
    selected.push(pool.splice(idx, 1)[0]);
  }
  return selected;
}

/** Returns { hours, minutes, seconds } until midnight (next refresh) */
function useCountdownToMidnight() {
  const getRemaining = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();
    return {
      hours:   Math.floor(diff / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };
  const [remaining, setRemaining] = useState(getRemaining);
  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(id);
  }, []);
  return remaining;
}

const subjectColors: Record<string, string> = {
  'Constitutional Law': 'bg-burgundy/10 text-burgundy',
  'Fundamental Rights': 'bg-purple-100 text-purple-700',
  'Criminal Law':       'bg-red-100 text-red-700',
  'Criminal Procedure': 'bg-orange-100 text-orange-700',
  'Family Law':         'bg-pink-100 text-pink-700',
  'Environmental Law':  'bg-green-100 text-green-700',
  'Labour & Gender Law':'bg-teal-100 text-teal-700',
  'Right to Life':      'bg-blue-100 text-blue-700',
  'Gender / Rights':    'bg-indigo-100 text-indigo-700',
  'Religion & Gender':  'bg-amber-100 text-amber-700',
  'Constitutional Law / IT': 'bg-cyan-100 text-cyan-700',
  'Constitutional Law / Rights': 'bg-rose-100 text-rose-700',
  'Freedom of Speech':  'bg-sky-100 text-sky-700',
};

// ─── Daily Quiz ──────────────────────────────────────────────────────────────
interface QuizQuestion { id: string; q: string; options: string[]; correct: number; explanation: string; subject: string; }
const QUIZ_POOL: QuizQuestion[] = [
  { id: 'qz-1', q: 'Which case established the "Basic Structure" doctrine?', options: ['Golaknath v. State of Punjab', 'Kesavananda Bharati v. State of Kerala', 'Minerva Mills v. Union of India', 'SR Bommai v. Union of India'], correct: 1, explanation: 'Kesavananda Bharati (1973) — a 13-judge bench held that Parliament cannot amend the basic structure of the Constitution.', subject: 'Constitutional Law' },
  { id: 'qz-2', q: 'Section 300 of the Indian Penal Code defines:', options: ['Culpable homicide', 'Murder', 'Grievous hurt', 'Abetment'], correct: 1, explanation: 'Section 300 IPC defines murder as culpable homicide amounting to murder, listing four clauses that elevate the offence.', subject: 'Criminal Law' },
  { id: 'qz-3', q: 'Which Article of the Constitution provides for the Right to Equality?', options: ['Article 19', 'Article 21', 'Article 14', 'Article 32'], correct: 2, explanation: 'Article 14 guarantees equality before the law and equal protection of laws to all persons within the territory of India.', subject: 'Constitutional Law' },
  { id: 'qz-4', q: 'The doctrine of "res judicata" is embodied in which section of CPC?', options: ['Section 9', 'Section 11', 'Section 20', 'Section 80'], correct: 1, explanation: 'Section 11 CPC bars a second suit on the same cause of action between the same parties once a final decision has been rendered.', subject: 'Civil Procedure' },
  { id: 'qz-5', q: 'A contract without consideration is:', options: ['Voidable', 'Valid', 'Void', 'Illegal'], correct: 2, explanation: 'Under Section 25 of the Indian Contract Act, 1872, an agreement without consideration is void, subject to exceptions like natural love and affection.', subject: 'Contract Law' },
  { id: 'qz-6', q: '"Audi alteram partem" means:', options: ['Act in good faith', 'Hear the other side', 'No one can be a judge in his own cause', 'Let justice be done'], correct: 1, explanation: 'Audi alteram partem (Latin) is a foundational principle of natural justice meaning every party must be given an opportunity to be heard.', subject: 'Administrative Law' },
  { id: 'qz-7', q: 'Under the Transfer of Property Act, a "mortgage by conditional sale" is defined in:', options: ['Section 58(b)', 'Section 58(c)', 'Section 58(d)', 'Section 60'], correct: 1, explanation: 'Section 58(c) TPA defines mortgage by conditional sale — where the mortgagor ostensibly sells property with a condition for re-transfer on repayment.', subject: 'Property Law' },
  { id: 'qz-8', q: 'Who can file a Public Interest Litigation (PIL) in India?', options: ['Only the aggrieved party', 'Any citizen acting in public interest', 'Only a lawyer', 'Only the State'], correct: 1, explanation: 'Any citizen can file a PIL under Articles 32 or 226. The Supreme Court expanded this to allow letters and postcards to be treated as PILs.', subject: 'Constitutional Law' },
  { id: 'qz-9', q: 'The "Polluter Pays" principle in Indian environmental law was affirmed in:', options: ['Vellore Citizens Welfare Forum v. UOI', 'MC Mehta v. UOI (Oleum)', 'Indian Council for Enviro-Legal Action v. UOI', 'All of the above'], correct: 3, explanation: 'The Polluter Pays and Precautionary Principles were adopted in multiple SC judgments including Vellore Citizens (1996) and Indian Council for Enviro-Legal Action (1996).', subject: 'Environmental Law' },
  { id: 'qz-10', q: 'An "anticipatory breach" of contract occurs when:', options: ['One party refuses to perform before the due date', 'Both parties mutually agree to end the contract', 'Performance becomes impossible', 'One party demands more time'], correct: 0, explanation: 'Anticipatory breach under Section 39 of the Contract Act occurs when a party renounces the contract before the time for performance arrives.', subject: 'Contract Law' },
  { id: 'qz-11', q: 'Which Schedule of the Constitution contains the Fundamental Duties?', options: ['Sixth Schedule', 'Seventh Schedule', 'Fourth Schedule', 'Eleventh Schedule'], correct: 1, explanation: 'The Fundamental Duties were inserted by the 42nd Amendment (1976) as Article 51A. They are part of Part IVA — not a Schedule.', subject: 'Constitutional Law' },
  { id: 'qz-12', q: 'The right to speedy trial was recognised as a Fundamental Right in:', options: ['Hussainara Khatoon v. State of Bihar', 'DK Basu v. State of WB', 'Maneka Gandhi v. UOI', 'Arnesh Kumar v. State of Bihar'], correct: 0, explanation: 'In Hussainara Khatoon (1979), the Supreme Court held that the right to speedy trial is implicit in the right to life under Article 21.', subject: 'Criminal Procedure' },
  { id: 'qz-13', q: 'Under BNS 2023 (which replaced IPC), what is the new section number for murder?', options: ['Section 101', 'Section 103', 'Section 302', 'Section 100'], correct: 1, explanation: 'Section 103 of the Bharatiya Nyaya Sanhita, 2023 replaces Section 300/302 IPC and defines and punishes murder.', subject: 'Criminal Law' },
  { id: 'qz-14', q: '"Nemo debet esse judex in propria causa" means:', options: ['Hear the other side', 'No one shall be a judge in his own cause', 'Ignorance of law is no excuse', 'Let the decision stand'], correct: 1, explanation: 'This is the second pillar of natural justice — the rule against bias — meaning a decision-maker must be impartial and free of personal interest.', subject: 'Administrative Law' },
  { id: 'qz-15', q: 'A "decree" under Order XX CPC is:', options: ['A formal expression of adjudication determining the rights of parties', 'Any interlocutory order', 'A judgment of acquittal', 'A summons to a witness'], correct: 0, explanation: 'Section 2(2) CPC defines a "decree" as the formal expression of an adjudication conclusively determining the rights of the parties with regard to all or any of the matters in controversy.', subject: 'Civil Procedure' },
  { id: 'qz-16', q: 'Under Section 138 of the Negotiable Instruments Act, a cheque bounce complaint must be filed within how many days of the cause of action arising?', options: ['15 days', '30 days', '60 days', '90 days'], correct: 1, explanation: 'The payee must file the complaint within 30 days of the cause of action arising — i.e., within 30 days of the drawer\'s failure to pay within 15 days of receiving the demand notice.', subject: 'Commercial Law' },
  { id: 'qz-17', q: 'The Protection of Children from Sexual Offences (POCSO) Act, 2012 defines a "child" as a person below the age of:', options: ['14 years', '16 years', '18 years', '21 years'], correct: 2, explanation: 'Section 2(d) of the POCSO Act defines a "child" as any person below the age of 18 years. The Act applies to all sexual offences committed against persons below this age.', subject: 'Criminal Law' },
  { id: 'qz-18', q: 'Under the Limitation Act, 1963, the general period of limitation for suits not specifically covered by other articles is:', options: ['1 year', '3 years', '6 years', '12 years'], correct: 1, explanation: 'Article 113 of the Limitation Act, 1963 provides a residual limitation period of 3 years for suits not specifically covered by other articles.', subject: 'Civil Procedure' },
];

function getDailyQuiz(): QuizQuestion[] {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const seed = today.getFullYear() * 1000 + dayOfYear + 7; // offset from case law seed
  const pool = [...QUIZ_POOL];
  const selected: QuizQuestion[] = [];
  let s = seed;
  for (let i = 0; i < 5; i++) {
    s = Math.imul(s, 1664525) + 1013904223;
    const idx = Math.abs(s) % pool.length;
    selected.push(pool.splice(idx, 1)[0]);
  }
  return selected;
}

// ─── Constitution Article of the Day ─────────────────────────────────────────
interface ConstitutionArticle { id: string; article: string; title: string; part: string; plainLanguage: string; keyPoint: string; relatedCase: string; }
const CONSTITUTION_POOL: ConstitutionArticle[] = [
  { id: 'ca-1', article: 'Article 14', title: 'Right to Equality', part: 'Part III — Fundamental Rights', plainLanguage: 'The State cannot treat people unequally unless there is a reasonable and intelligible classification with a rational nexus to the law\'s objective. Every person — citizen or not — is equal before the law.', keyPoint: 'Applies to both citizens and non-citizens. Prohibits arbitrary state action through the doctrine of "reasonable classification".', relatedCase: 'EP Royappa v. State of Tamil Nadu (1974) — expanded Article 14 to cover arbitrariness.' },
  { id: 'ca-2', article: 'Article 21', title: 'Protection of Life and Personal Liberty', part: 'Part III — Fundamental Rights', plainLanguage: 'No person shall be deprived of their life or personal liberty except according to a procedure established by law — and that procedure must be fair, just, and reasonable.', keyPoint: 'The most expansive fundamental right — has been interpreted to include right to privacy, livelihood, health, education, and dignified death.', relatedCase: 'Maneka Gandhi v. UOI (1978) — procedure must be fair, just, and reasonable, not merely prescribed by law.' },
  { id: 'ca-3', article: 'Article 19', title: 'Freedom of Speech and Expression', part: 'Part III — Fundamental Rights', plainLanguage: 'All citizens have the right to freedom of speech, peaceful assembly, movement, residence, and profession. These rights can be restricted only on specific grounds like sovereignty, security, public order, decency, or morality.', keyPoint: 'Available only to citizens. Subject to reasonable restrictions under Article 19(2)–(6). Freedom of press flows from Article 19(1)(a).', relatedCase: 'Shreya Singhal v. UOI (2015) — struck down S.66A IT Act as an unreasonable restriction on online speech.' },
  { id: 'ca-4', article: 'Article 32', title: 'Right to Constitutional Remedies', part: 'Part III — Fundamental Rights', plainLanguage: 'Any person whose fundamental rights have been violated can directly approach the Supreme Court. The SC can issue writs — habeas corpus, mandamus, prohibition, quo warranto, and certiorari.', keyPoint: 'Dr BR Ambedkar called this the "heart and soul" of the Constitution. The right itself cannot be suspended except during a proclaimed Emergency.', relatedCase: 'Romesh Thappar v. State of Madras (1950) — established that the SC under Article 32 is the guarantor of fundamental rights.' },
  { id: 'ca-5', article: 'Article 356', title: 'Provisions in Case of Failure of Constitutional Machinery in States', part: 'Part XVIII — Emergency Provisions', plainLanguage: 'If the President is satisfied (on Governor\'s report or otherwise) that the government of a state cannot be carried on in accordance with the Constitution, the President may assume the functions of that state.', keyPoint: 'Popularly called "President\'s Rule" or "Article 356 Rule". Has been misused historically — the SR Bommai case imposed judicial checks on its imposition.', relatedCase: 'SR Bommai v. UOI (1994) — imposition is subject to judicial review; majority must be tested on the floor of the House.' },
  { id: 'ca-6', article: 'Article 226', title: 'Power of High Courts to Issue Writs', part: 'Part VI — The States', plainLanguage: 'High Courts have the power to issue writs not only for enforcement of fundamental rights (like the SC under Article 32), but also for any other purpose — making their writ jurisdiction broader than the Supreme Court\'s.', keyPoint: 'Unlike Article 32, HC writ jurisdiction extends beyond fundamental rights to legal rights generally. Can be exercised even against private bodies performing public functions.', relatedCase: 'Bandhua Mukti Morcha v. UOI (1984) — High Courts can exercise writ jurisdiction for enforcement of legal rights.' },
  { id: 'ca-7', article: 'Article 51A', title: 'Fundamental Duties', part: 'Part IVA — Fundamental Duties', plainLanguage: 'Every citizen of India has 11 fundamental duties — including abiding by the Constitution, cherishing the national flag, promoting harmony, protecting the environment, and developing scientific temper.', keyPoint: 'Added by 42nd Amendment (1976). Not enforceable by courts directly, but courts use them to interpret other laws and to uphold their validity.', relatedCase: 'MC Mehta v. UOI (1988) — SC directed environmental education in schools citing Article 51A(g) duty to protect the environment.' },
  { id: 'ca-8', article: 'Article 368', title: 'Power of Parliament to Amend the Constitution', part: 'Part XX — Amendment of the Constitution', plainLanguage: 'Parliament may amend any provision of the Constitution by a special majority (two-thirds of members present and voting + majority of total membership). Some provisions also require ratification by half the state legislatures.', keyPoint: 'The Basic Structure doctrine (Kesavananda Bharati) acts as a judicial limit on this power. Parliament cannot use Article 368 to destroy the identity of the Constitution.', relatedCase: 'Kesavananda Bharati v. State of Kerala (1973) — Parliament\'s amending power under Article 368 is subject to the basic structure.' },
  { id: 'ca-9', article: 'Article 39B & 39C', title: 'Directive Principles — Material Resources & Concentration of Wealth', part: 'Part IV — Directive Principles of State Policy', plainLanguage: 'The State must ensure that ownership and control of material resources are distributed to subserve the common good (39B), and that the economic system does not result in concentration of wealth to the common detriment (39C).', keyPoint: 'These DPSPs gave rise to decades of conflict between property rights (Part III) and socialist goals (Part IV) — central to landmark cases on bank nationalisation and land reform.', relatedCase: 'State of Karnataka v. Ranganatha Reddy (1977) — Justice Krishna Iyer\'s minority view on the sweep of Article 39B.' },
  { id: 'ca-10', article: 'Article 300A', title: 'Right to Property (Constitutional Right)', part: 'Part XII — Finance, Property, Contracts & Suits', plainLanguage: 'No person shall be deprived of property save by authority of law. The right to property is now a constitutional right — not a fundamental right — after the 44th Amendment (1978).', keyPoint: 'The 44th Amendment removed Article 19(1)(f) and Article 31 (fundamental right to property). Article 300A remains as a constitutional right, enforceable by HC under Article 226 but not under Article 32.', relatedCase: 'Jilubhai Nanbhai Khachar v. State of Gujarat (1995) — property can only be acquired by authority of law, not executive action.' },
  { id: 'ca-11', article: 'Article 44', title: 'Uniform Civil Code', part: 'Part IV — Directive Principles of State Policy', plainLanguage: 'The State shall endeavour to secure for citizens a Uniform Civil Code throughout the territory of India — a common set of personal laws governing marriage, divorce, inheritance, and adoption for all citizens regardless of religion.', keyPoint: 'A non-justiciable DPSP — courts cannot compel Parliament to enact the UCC. Yet the Supreme Court has repeatedly urged its implementation in cases involving personal law reform. It remains one of India\'s most debated constitutional aspirations.', relatedCase: 'Mohd. Ahmed Khan v. Shah Bano (1985) — SC directed Parliament towards a UCC; Sarla Mudgal v. UOI (1995) — reiterated urgency of a common code for all religions.' },
  { id: 'ca-12', article: 'Article 124', title: 'Establishment and Constitution of the Supreme Court', part: 'Part V — The Union', plainLanguage: 'The Supreme Court of India shall consist of the Chief Justice and such number of judges as Parliament may prescribe by law. Every Judge is appointed by the President after consultation with the CJI and such other judges as the President deems necessary.', keyPoint: 'The "consultation" requirement led to the Three Judges Cases which established the collegium system — making the judiciary largely self-appointing. The National Judicial Appointments Commission (NJAC) Act was struck down in 2015 for violating judicial independence.', relatedCase: 'Supreme Court Advocates-on-Record Association v. UOI (1993) — "consultation" means "concurrence"; collegium has primacy. NJAC Case (2015) — NJAC struck down as unconstitutional.' },
  { id: 'ca-13', article: 'Article 311', title: 'Dismissal, Removal or Reduction in Rank of Civil Servants', part: 'Part XIV — Services Under the Union and the States', plainLanguage: 'No civil servant shall be dismissed or removed by an authority subordinate to the appointing authority. No such dismissal shall be made unless the person has been given a reasonable opportunity to show cause against the proposed action.', keyPoint: 'A critical service law provision protecting government employees from arbitrary dismissal. However, it allows three exceptions to the hearing requirement: conviction, impracticability, or where it is not reasonably practicable to hold an inquiry in the interest of State security.', relatedCase: 'Union of India v. Tulsiram Patel (1985) — SC interpreted the scope of exceptions under Article 311(2); reaffirmed that the principles of natural justice must govern civil service dismissals.' },
];

function getDailyConstitutionArticle(): ConstitutionArticle {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const seed = today.getFullYear() * 1000 + dayOfYear + 13;
  let s = Math.imul(seed, 1664525) + 1013904223;
  return CONSTITUTION_POOL[Math.abs(s) % CONSTITUTION_POOL.length];
}

// ─── Legal Maxim of the Day ───────────────────────────────────────────────────
interface LegalMaxim { id: string; maxim: string; origin: string; meaning: string; usage: string; memoryHook: string; }
const MAXIM_POOL: LegalMaxim[] = [
  { id: 'mx-1', maxim: 'Actus non facit reum nisi mens sit rea', origin: 'Latin', meaning: 'An act does not make a person guilty unless the mind is also guilty.', usage: 'The foundational principle of criminal law — both a guilty act (actus reus) and guilty mind (mens rea) must co-exist for criminal liability.', memoryHook: '"No crime without a criminal mind" — this is why accident and insanity can be defences.' },
  { id: 'mx-2', maxim: 'Audi alteram partem', origin: 'Latin', meaning: 'Hear the other side.', usage: 'A pillar of natural justice — no person should be condemned unheard. Every party must have an opportunity to present their case before an adverse order is passed.', memoryHook: 'Even God heard Adam\'s side before pronouncing judgment — this principle is that ancient.' },
  { id: 'mx-3', maxim: 'Nemo debet esse judex in propria causa', origin: 'Latin', meaning: 'No one should be a judge in their own cause.', usage: 'The rule against bias in administrative and judicial proceedings. A decision-maker with a personal interest in the outcome must recuse themselves.', memoryHook: 'A football referee cannot also play for one of the teams.' },
  { id: 'mx-4', maxim: 'Res ipsa loquitur', origin: 'Latin', meaning: 'The thing speaks for itself.', usage: 'In negligence law, when an accident could not have occurred without negligence, the facts themselves raise an inference of negligence — the burden shifts to the defendant.', memoryHook: 'A scalpel found inside a patient after surgery — the facts need no further explanation.' },
  { id: 'mx-5', maxim: 'Ubi jus ibi remedium', origin: 'Latin', meaning: 'Where there is a right, there is a remedy.', usage: 'Every legal right must have a corresponding remedy. No court should leave a legal wrong without redress. The foundation for the writ jurisdiction under Articles 32 and 226.', memoryHook: 'A right without enforcement is no right at all.' },
  { id: 'mx-6', maxim: 'Ignorantia juris non excusat', origin: 'Latin', meaning: 'Ignorance of the law is no excuse.', usage: 'Every person is presumed to know the law. Claiming ignorance of a legal rule is not a valid defence in criminal or civil proceedings.', memoryHook: 'You cannot tell a traffic officer "I didn\'t know the light was red" — the law presumes you knew.' },
  { id: 'mx-7', maxim: 'Ex turpi causa non oritur actio', origin: 'Latin', meaning: 'No action arises from a base cause.', usage: 'A person cannot seek relief from a court if their claim arises from their own illegal or immoral act. Courts will not assist wrongdoers to profit from their own wrongdoing.', memoryHook: 'A thief cannot sue someone for stealing what the thief had already stolen.' },
  { id: 'mx-8', maxim: 'Salus populi suprema lex', origin: 'Latin', meaning: 'The welfare of the people is the supreme law.', usage: 'Used to justify the State\'s police powers — public health, safety, morals, and welfare can override individual rights. Frequently cited in PILs and environmental cases.', memoryHook: 'Why lockdowns during COVID were constitutionally valid — public welfare overrides private liberty in extremis.' },
  { id: 'mx-9', maxim: 'Nemo bis punitur pro eodem delicto', origin: 'Latin', meaning: 'No one should be punished twice for the same offence.', usage: 'The doctrine of double jeopardy, embodied in Article 20(2) of the Constitution and Section 300 CrPC/Section 337 BNSS. Protects acquitted or convicted persons from being tried again for the same offence.', memoryHook: 'Once the trial ends — win or lose — you cannot be put through it again for the same act.' },
  { id: 'mx-10', maxim: 'Delegatus non potest delegare', origin: 'Latin', meaning: 'A delegate cannot further delegate.', usage: 'In administrative law, an authority to whom power has been delegated cannot re-delegate it to another unless expressly authorised. Ensures accountability in the exercise of public functions.', memoryHook: 'If your boss gave you a task, you cannot pass it to someone else unless your boss allows it.' },
  { id: 'mx-11', maxim: 'In pari delicto potior est conditio possidentis', origin: 'Latin', meaning: 'Where both parties are equally at fault, the position of the one in possession is stronger.', usage: 'In contract law, when both parties are equally blameworthy (in pari delicto), the court will leave them as they are — no restitution is granted.', memoryHook: 'Two equally guilty parties cancel each other out — the court walks away.' },
  { id: 'mx-12', maxim: 'Pacta sunt servanda', origin: 'Latin', meaning: 'Agreements must be kept.', usage: 'The cornerstone of contract law — parties are bound by their agreements. Also foundational in public international law — states must honour their treaty obligations.', memoryHook: 'A deal is a deal. Period.' },
  { id: 'mx-13', maxim: 'Volenti non fit injuria', origin: 'Latin', meaning: 'To a willing person, no injury is done.', usage: 'A complete defence in tort law — if a claimant voluntarily consents to a risk of harm, they cannot later sue for that harm. Applies in sport, hazardous activities, and some employment contexts.', memoryHook: 'If you sign up to play contact rugby, you cannot sue another player for a fair tackle.' },
  { id: 'mx-14', maxim: 'Suppressio veri, suggestio falsi', origin: 'Latin', meaning: 'Suppression of truth is equivalent to suggestion of falsehood.', usage: 'Applied in contract and misrepresentation law — a half-truth or deliberate omission that creates a false impression is as actionable as an outright lie. Particularly relevant in insurance uberrimae fidei.', memoryHook: 'Hiding a known defect when selling a house is just as bad as lying about it.' },
  { id: 'mx-15', maxim: 'Qui facit per alium, facit per se', origin: 'Latin', meaning: 'He who acts through another acts himself.', usage: 'The foundation of vicarious liability — an employer is responsible for the acts of their employee done in the course of employment. Also relevant to agency law.', memoryHook: 'If you hire someone to do your dirty work, the law treats it as if you did it yourself.' },
];

function getDailyMaxim(): LegalMaxim {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const seed = today.getFullYear() * 1000 + dayOfYear + 19;
  let s = Math.imul(seed, 1664525) + 1013904223;
  return MAXIM_POOL[Math.abs(s) % MAXIM_POOL.length];
}

// ─── Daily Judgment Digest ───────────────────────────────────────────────────
interface JudgmentDigest { id: string; title: string; court: string; date: string; citation: string; facts: string; issue: string; held: string; impact: string; subject: string; }

const DIGEST_POOL: JudgmentDigest[] = [
  { id: 'wd-1', title: 'SC on Bail Conditions Must Not Be Onerous', court: 'Supreme Court of India', date: 'Mar 2026', citation: '2026 SCC OnLine SC 312', facts: 'The accused, a daily-wage worker, was granted bail but the conditions required a surety of ₹5 lakh — effectively keeping him in jail despite the grant.', issue: 'Whether bail conditions that are impossible to fulfil amount to a denial of bail itself.', held: 'Bail conditions that are disproportionate to the accused\'s means amount to a refusal of bail. Courts must tailor conditions to the accused\'s socioeconomic reality.', impact: 'Reiterates the SC\'s consistent position that bail is the rule, jail the exception. Directly applies to sessions and magistrate courts nationwide.', subject: 'Criminal Procedure' },
  { id: 'wd-2', title: 'HC: WhatsApp Forward Cannot Be Sole Basis for Sedition Charge', court: 'Bombay High Court', date: 'Mar 2026', citation: '2026 SCC OnLine Bom 441', facts: 'The petitioner forwarded a WhatsApp message critical of government policy. An FIR was registered under Section 152 BNS (erstwhile Section 124A IPC — sedition).', issue: 'Whether a single forward of political content without any incitement to violence amounts to sedition.', held: 'Mere forwarding of political criticism without any call to violence does not satisfy the threshold for sedition. The FIR was quashed.', impact: 'Important check on the misuse of sedition provisions in the digital age. Applies the SC\'s guidelines from S.G. Vombatkere v. UOI (2022) to new BNS.', subject: 'Constitutional Law' },
  { id: 'wd-3', title: 'SC: Insurance Company Cannot Repudiate Claim for Delayed Intimation Alone', court: 'Supreme Court of India', date: 'Feb 2026', citation: '2026 SCC OnLine SC 287', facts: 'Insured\'s vehicle was stolen. The insurer repudiated the claim on the sole ground that the police complaint was filed two days after the theft, in breach of policy conditions.', issue: 'Whether a procedural delay in intimation, without evidence of prejudice to the insurer, justifies repudiation of a genuine claim.', held: 'Delay in intimation per se does not entitle an insurer to repudiate a claim; the insurer must show actual prejudice caused by the delay.', impact: 'Major relief for policyholders. Consistently followed by National and State Consumer Commissions.', subject: 'Insurance Law' },
  { id: 'wd-4', title: 'SC Strikes Down Arbitrary Cancellation of OBC Certificate', court: 'Supreme Court of India', date: 'Feb 2026', citation: '2026 SCC OnLine SC 251', facts: 'A caste certificate held for 20+ years was cancelled by authorities without giving the certificate holder any opportunity to be heard.', issue: 'Whether cancellation of a caste certificate without notice and hearing violates natural justice.', held: 'Cancellation without affording a hearing is void. Authorities must follow audi alteram partem even when withdrawing certificates of identity or status.', impact: 'Reinforces procedural fairness in administrative action affecting civil rights. Applies across all State governments.', subject: 'Administrative Law' },
  { id: 'wd-5', title: 'HC: Consensual Adult Relationship Not "Live-In" Absent Mutual Intention', court: 'Allahabad High Court', date: 'Jan 2026', citation: '2026 SCC OnLine All 89', facts: 'A woman sought protection claiming she and the petitioner were in a live-in relationship. The man denied any domestic relationship.', issue: 'What constitutes a "live-in relationship" entitled to protection under the Domestic Violence Act, 2005.', held: 'A live-in relationship under the PWDVA requires a "relationship in the nature of marriage" — cohabitation, mutual commitment, and social recognition. Casual or short-term associations do not qualify.', impact: 'Clarifies the threshold for DV Act protection, frequently litigated in family courts.', subject: 'Family Law' },
  { id: 'wd-6', title: 'SC: FIR Cannot Be Filed for Mere Breach of Contract', court: 'Supreme Court of India', date: 'Jan 2026', citation: '2026 SCC OnLine SC 178', facts: 'A business dispute arose between two parties over non-payment. Instead of a civil suit, the aggrieved party filed an FIR for cheating under Section 318 BNS.', issue: 'Whether a pure civil dispute dressed as a criminal complaint constitutes an abuse of process.', held: 'Criminal law cannot be used as a tool to pressurise parties in civil or commercial disputes. The FIR was quashed as an abuse of the process of court.', impact: 'Reinforces the line between civil and criminal liability in commercial matters, protecting businesses from coercive misuse of criminal process.', subject: 'Criminal Law' },
  { id: 'wd-7', title: 'SC on Mandatory Biometric Authentication for Welfare Schemes', court: 'Supreme Court of India', date: 'Dec 2025', citation: '2025 SCC OnLine SC 3421', facts: 'Several beneficiaries of government food and pension schemes were excluded due to Aadhaar authentication failures at PDS outlets.', issue: 'Whether denial of statutory welfare entitlements due to biometric failure violates the right to food and life under Article 21.', held: 'Technological failure cannot be a ground to deny constitutional entitlements. States must provide manual override options for those excluded by biometric errors.', impact: 'Significant for the 100+ crore Indians enrolled in Aadhaar-linked welfare — courts will not allow technology gaps to erode fundamental rights.', subject: 'Constitutional Law' },
  { id: 'wd-8', title: 'Delhi HC: Employer Cannot Withhold Full and Final Settlement Indefinitely', court: 'Delhi High Court', date: 'Dec 2025', citation: '2025 SCC OnLine Del 8812', facts: 'An employee resigned and was not paid F&F settlement for over 14 months. The employer cited pending clearances as justification.', issue: 'Whether an employer can indefinitely delay F&F settlement pending unresolved internal clearances.', held: 'F&F settlement must be paid within a reasonable time after separation. Arbitrary delay constitutes illegal withholding of wages under the Payment of Wages Act.', impact: 'Directly applicable in employment disputes. Labour courts and High Courts will take a dim view of employers weaponising F&F delays.', subject: 'Labour Law' },
  { id: 'wd-9', title: 'SC: Dying Declaration Alone Sufficient for Conviction if Credible', court: 'Supreme Court of India', date: 'Nov 2025', citation: '2025 SCC OnLine SC 3189', facts: 'The accused was convicted for murder on the basis of a dying declaration recorded by the Magistrate. No other eyewitness was produced.', issue: 'Whether a conviction can be sustained solely on the basis of a dying declaration without corroboration.', held: 'A credible and reliable dying declaration, recorded by a Magistrate and free from tutoring, can form the sole basis of conviction — no corroboration is mandatory.', impact: 'Reaffirms the evidentiary weight of dying declarations under Section 32(1) of the Indian Evidence Act / Section 26 BSA in dowry death and homicide cases.', subject: 'Evidence Law' },
  { id: 'wd-10', title: 'SC: Landlord Cannot Evict Tenant Without Following Due Process Under Rent Act', court: 'Supreme Court of India', date: 'Nov 2025', citation: '2025 SCC OnLine SC 2998', facts: 'A landlord forcibly locked out the tenant from a commercial premises claiming non-payment of rent, bypassing the rent controller.', issue: 'Whether a landlord can resort to self-help eviction bypassing the rent control court.', held: 'Self-help eviction is illegal. Even where rent is in arrears, the landlord must approach the Rent Controller and follow due process. Forcible dispossession is actionable.', impact: 'Protects tenants (both residential and commercial) across all states with rent control legislation from arbitrary lockouts.', subject: 'Property Law' },
  { id: 'wd-11', title: 'SC on Child Custody: Welfare of Child is the Paramount Consideration', court: 'Supreme Court of India', date: 'Oct 2025', citation: '2025 SCC OnLine SC 2741', facts: 'Parents in a contested divorce battle sought custody. The father was wealthier; the mother had been the primary caregiver.', issue: 'Whether financial capacity or primary caregiving history should determine custody.', held: 'The welfare of the child is the paramount and overriding consideration — neither wealth nor gender creates a presumptive entitlement to custody.', impact: 'Frequently cited in family court custody disputes. The "welfare principle" is now the settled standard across all Indian family courts.', subject: 'Family Law' },
  { id: 'wd-12', title: 'Bombay HC: Fundamental Right to Shelter Includes Temporary Transit Accommodation', court: 'Bombay High Court', date: 'Oct 2025', citation: '2025 SCC OnLine Bom 6234', facts: 'Slum dwellers were displaced for an infrastructure project but not provided transit accommodation before demolition.', issue: 'Whether the right to shelter under Article 21 requires the State to provide transit accommodation before eviction.', held: 'The right to shelter, as part of Article 21, requires the State to ensure transit accommodation before demolishing dwellings, even for development projects.', impact: 'Strengthens the rights of slum dwellers and displaced communities against large-scale infrastructure-driven evictions.', subject: 'Fundamental Rights' },
  { id: 'wd-13', title: 'SC: Section 498A FIR Against Distant Relatives Requires Specific Allegations', court: 'Supreme Court of India', date: 'Sep 2025', citation: '2025 SCC OnLine SC 2501', facts: 'An FIR under Section 498A IPC (now Section 85 BNS) was filed against 11 relatives of the husband, including cousins and distant aunts, with omnibus allegations.', issue: 'Whether an FIR with blanket allegations against all family members is sustainable.', held: 'Omnibus allegations without specific role attribution to each accused are not sustainable. FIRs against distant relatives under Section 85 BNS must specify individual acts.', impact: 'Prevents misuse of matrimonial cruelty provisions to harass entire families. Follows the line established in Arnesh Kumar (2014).', subject: 'Criminal Law' },
  { id: 'wd-14', title: 'SC: Cheque Bounce — Presumption Under Section 139 NI Act is Rebuttable', court: 'Supreme Court of India', date: 'Sep 2025', citation: '2025 SCC OnLine SC 2389', facts: 'Accused claimed the cheque was given as a security deposit, not for a legally enforceable debt. The trial court convicted without considering this defence.', issue: 'What is the standard required of an accused to rebut the presumption under Section 139 of the Negotiable Instruments Act?', held: 'The accused need only raise a probable defence — not prove innocence beyond reasonable doubt. Courts must examine the defence evidence before convicting.', impact: 'Crucial for the millions of Section 138 NI Act cases pending in Indian courts — clarifies the evidentiary standard for accused persons.', subject: 'Commercial Law' },
  { id: 'wd-15', title: 'SC: Candidate Cannot Be Disqualified for Not Disclosing Minor Childhood Offence', court: 'Supreme Court of India', date: 'Aug 2025', citation: '2025 SCC OnLine SC 2102', facts: 'A police constable\'s appointment was cancelled because he had not disclosed a minor theft case from when he was 14 years old, which had been compounded.', issue: 'Whether non-disclosure of a juvenile offence that was compounded justifies dismissal from service.', held: 'Childhood offences that have been compounded or where the accused was a minor need not be disclosed in service applications. Suppression of such facts is not fraudulent concealment.', impact: 'Protects candidates from disproportionate consequences for minor past histories, particularly relevant for government employment and police recruitment.', subject: 'Service Law' },
  { id: 'wd-16', title: 'SC: Surrogacy Regulations Under New Act — Single Persons Excluded', court: 'Supreme Court of India', date: 'Apr 2026', citation: '2026 SCC OnLine SC 498', facts: 'A single woman challenged the Surrogacy (Regulation) Act, 2021 on the ground that it excluded single persons from commissioning surrogacy, permitting only married heterosexual couples and close relatives.', issue: 'Whether excluding single persons from surrogacy violates Articles 14, 15, and 21 of the Constitution.', held: 'The matter was referred to a larger bench given its constitutional significance. An interim order directed the government to frame inclusive guidelines for exceptional humanitarian cases pending the final decision.', impact: 'Significant for reproductive rights jurisprudence in India. Raises questions about the interplay between statutory exclusions and constitutional rights to family life.', subject: 'Family Law' },
  { id: 'wd-17', title: 'SC: Climate Inaction by State Violates Right to Healthy Environment Under Article 21', court: 'Supreme Court of India', date: 'Apr 2026', citation: '2026 SCC OnLine SC 521', facts: 'A PIL was filed challenging the State\'s failure to implement its own climate action plan, resulting in hazardous air quality levels in a metropolitan city for over 200 days in a year.', issue: 'Whether a citizen has an enforceable constitutional right to a clean and healthy environment, and whether state inaction breaches this right.', held: 'The right to a clean environment and to breathe clean air is an integral part of the right to life under Article 21. Persistent failure to implement statutory climate commitments constitutes a constitutional violation.', impact: 'Landmark recognition of "climate rights" as justiciable under Article 21. Sets a precedent for citizens to enforce environmental obligations directly against State governments.', subject: 'Environmental Law' },
  { id: 'wd-18', title: 'Delhi HC: AI-Generated Legal Documents Do Not Qualify for Independent Copyright', court: 'Delhi High Court', date: 'Mar 2026', citation: '2026 SCC OnLine Del 2341', facts: 'A legal tech company\'s AI-generated research summary was reproduced by a rival firm. The original company sought copyright protection under the Copyright Act, 1957.', issue: 'Whether AI-generated content — produced without direct human authorship — qualifies for copyright protection under Indian law.', held: 'Copyright protection requires human authorship as a fundamental element. AI-generated content, absent substantial human creative input, does not qualify for independent copyright protection.', impact: 'First Indian judicial ruling directly addressing AI copyright. Likely to prompt legislative reform and shapes how legal tech companies structure their IP protection strategies.', subject: 'Intellectual Property' },
];

/** Pick 5 digest entries deterministically per day */
function getDailyDigest(): JudgmentDigest[] {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const seed = today.getFullYear() * 1000 + dayOfYear + 31;
  const pool = [...DIGEST_POOL];
  const selected: JudgmentDigest[] = [];
  let s = seed;
  for (let i = 0; i < 5; i++) {
    s = Math.imul(s, 1664525) + 1013904223;
    selected.push(pool.splice(Math.abs(s) % pool.length, 1)[0]);
  }
  return selected;
}

// ─── Web Share / Clipboard helper ───────────────────────────────────────────
/** Shares via Web Share API; falls back to clipboard copy. Returns true if handled. */
async function shareContent(title: string, path: string): Promise<boolean> {
  const url = path.startsWith('http') ? path : `https://store.theedulaw.in${path}`;
  const text = `Check out "${title}" on EduLaw — India's #1 legal study platform for law students.`;
  try {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ title, url, text });
      return true;
    } else if (navigator?.clipboard) {
      await navigator.clipboard.writeText(url);
      return true;
    }
  } catch (_) { /* user cancelled or unsupported */ }
  return false;
}

// ─── Canvas helpers ───────────────────────────────────────────────────────────
/** Rounded-rectangle path (quadratic bezier, no roundRect API needed) */
function rrPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  const R = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + R, y);
  ctx.lineTo(x + w - R, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + R);
  ctx.lineTo(x + w, y + h - R);
  ctx.quadraticCurveTo(x + w, y + h, x + w - R, y + h);
  ctx.lineTo(x + R, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - R);
  ctx.lineTo(x, y + R);
  ctx.quadraticCurveTo(x, y, x + R, y);
  ctx.closePath();
}

/** Word-wrap canvas text. Returns the Y position after the last line. */
function wrapTextCanvas(
  ctx: CanvasRenderingContext2D,
  text: string, x: number, y: number,
  maxW: number, lineH: number,
  align: CanvasTextAlign = 'left',
): number {
  ctx.textAlign = align;
  const drawX = align === 'center' ? x + maxW / 2 : x;
  const words = text.split(' ');
  let line = '';
  let cy = y;
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxW && line !== '') {
      ctx.fillText(line.trim(), drawX, cy);
      line = word + ' ';
      cy += lineH;
    } else {
      line = test;
    }
  }
  if (line.trim()) { ctx.fillText(line.trim(), drawX, cy); cy += lineH; }
  return cy;
}

/** Generates a 1080×1920 (9:16) Instagram Story card for a judgment digest entry */
async function generateDigestStoryCard(digest: JudgmentDigest): Promise<Blob | null> {
  const W = 1080, H = 1920, PAD = 72;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const rawCtx = canvas.getContext('2d');
  if (!rawCtx) return null;
  // Assign to non-nullable type so TypeScript narrowing works inside closures
  const ctx: CanvasRenderingContext2D = rawCtx;

  // ── Background ──────────────────────────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, W * 0.4, H);
  bgGrad.addColorStop(0, '#180b0e');
  bgGrad.addColorStop(1, '#0d0508');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Burgundy radial glow (top-left)
  const glow1 = ctx.createRadialGradient(W * 0.15, H * 0.17, 0, W * 0.15, H * 0.17, W * 0.9);
  glow1.addColorStop(0, 'rgba(107,30,46,0.38)');
  glow1.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, W, H);

  // Gold radial glow (bottom-right)
  const glow2 = ctx.createRadialGradient(W * 0.85, H * 0.75, 0, W * 0.85, H * 0.75, W * 0.55);
  glow2.addColorStop(0, 'rgba(201,168,76,0.08)');
  glow2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  // Reusable gold gradient
  const goldGrad = ctx.createLinearGradient(0, 0, W, 0);
  goldGrad.addColorStop(0, '#C9A84C');
  goldGrad.addColorStop(0.5, '#E8C97A');
  goldGrad.addColorStop(1, '#C9A84C');

  // ── Top accent bar ──────────────────────────────────────────────────────
  ctx.fillStyle = goldGrad;
  ctx.fillRect(0, 0, W, 12);

  // ── Branding ────────────────────────────────────────────────────────────
  let Y = 108;

  ctx.fillStyle = '#C9A84C';
  ctx.font = 'bold 58px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('EDULAW', W / 2, Y);
  Y += 64;

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '30px Arial, sans-serif';
  ctx.fillText('DAILY JUDGMENT DIGEST', W / 2, Y);
  Y += 76;

  // Date pill
  ctx.font = 'bold 28px Arial, sans-serif';
  const dW = ctx.measureText(digest.date).width + 52;
  ctx.fillStyle = 'rgba(201,168,76,0.18)';
  rrPath(ctx, W / 2 - dW / 2, Y - 38, dW, 56, 28);
  ctx.fill();
  ctx.strokeStyle = 'rgba(201,168,76,0.45)';
  ctx.lineWidth = 1.5;
  rrPath(ctx, W / 2 - dW / 2, Y - 38, dW, 56, 28);
  ctx.stroke();
  ctx.fillStyle = '#C9A84C';
  ctx.textAlign = 'center';
  ctx.fillText(digest.date, W / 2, Y);
  Y += 72;

  // Divider
  ctx.strokeStyle = 'rgba(201,168,76,0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(PAD, Y); ctx.lineTo(W - PAD, Y); ctx.stroke();
  Y += 44;

  // Subject badge
  ctx.font = 'bold 25px Arial, sans-serif';
  const subText = digest.subject.toUpperCase();
  const subBadgeW = ctx.measureText(subText).width + 44;
  ctx.fillStyle = 'rgba(107,30,46,0.65)';
  rrPath(ctx, PAD, Y - 36, subBadgeW, 50, 12);
  ctx.fill();
  ctx.fillStyle = '#ff9aae';
  ctx.textAlign = 'left';
  ctx.fillText(subText, PAD + 22, Y);
  Y += 58;

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 58px Georgia, serif';
  Y = wrapTextCanvas(ctx, digest.title, PAD, Y, W - PAD * 2, 76) + 16;

  // Court + citation
  ctx.fillStyle = 'rgba(201,168,76,0.65)';
  ctx.font = '30px Arial, sans-serif';
  Y = wrapTextCanvas(ctx, `${digest.court}  ·  ${digest.citation}`, PAD, Y, W - PAD * 2, 44) + 44;

  // ── Section box (HELD & IMPACT) ─────────────────────────────────────────
  function sectionBox(label: string, text: string, accent: string, startY: number): number {
    const bx = PAD, bw = W - PAD * 2, innerW = bw - 60;
    ctx.font = '32px Arial, sans-serif';
    const words2 = text.split(' ');
    let lines = 1, cur2 = '';
    for (const w2 of words2) {
      const t2 = cur2 + w2 + ' ';
      if (ctx.measureText(t2).width > innerW && cur2) { lines++; cur2 = w2 + ' '; }
      else { cur2 = t2; }
    }
    const boxH = 44 + 44 + lines * 52 + 44;

    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    rrPath(ctx, bx, startY, bw, boxH, 24);
    ctx.fill();

    ctx.fillStyle = accent;
    rrPath(ctx, bx, startY + 12, 6, boxH - 24, 3);
    ctx.fill();

    ctx.fillStyle = accent;
    ctx.font = 'bold 27px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, bx + 32, startY + 46);

    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.font = '32px Arial, sans-serif';
    wrapTextCanvas(ctx, text, bx + 32, startY + 90, innerW, 52);

    return startY + boxH + 24;
  }

  Y = sectionBox('HELD', digest.held, '#4ade80', Y);
  Y = sectionBox('IMPACT', digest.impact, '#C9A84C', Y);

  // ── Bottom branding ─────────────────────────────────────────────────────
  const btY = H - 175;
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(PAD, btY); ctx.lineTo(W - PAD, btY); ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '28px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Follow for daily legal updates', W / 2, btY + 52);

  ctx.fillStyle = '#C9A84C';
  ctx.font = 'bold 38px Georgia, serif';
  ctx.fillText('store.theedulaw.in', W / 2, btY + 112);

  // Bottom accent bar
  ctx.fillStyle = goldGrad;
  ctx.fillRect(0, H - 12, W, 12);

  return new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b), 'image/png'));
}

// ─── Article Instagram card helpers ──────────────────────────────────────────

/** Load a cross-origin image for canvas use. Returns null on CORS/network failure. */
async function loadCanvasImage(src: string): Promise<HTMLImageElement | null> {
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  } catch {
    return null;
  }
}

/** Draw an image with CSS "cover" behavior — fills the box and crops to fit. */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, w: number, h: number,
) {
  const imgAR = img.width / img.height;
  const areaAR = w / h;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;
  if (imgAR > areaAR) {
    sw = img.height * areaAR;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / areaAR;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

// ─── Article card colour tokens ──────────────────────────────────────────────
const ART_PARCHMENT   = '#FDFBF7';  // off-white background
const ART_INK         = '#1C1009';  // near-black text
const ART_GOLD        = '#C9A84C';  // gold accent
const ART_GOLD_DARK   = '#9A6B10';  // darker gold for text

/** Draw the small EduLaw logo badge in the top-right corner over the image */
function drawArticleLogoBadge(
  ctx: CanvasRenderingContext2D,
  W: number,
  PAD: number,
  imgH: number,
) {
  const label = 'EduLaw';
  ctx.font = 'bold 30px Georgia, serif';
  const tw = ctx.measureText(label).width;
  const pH = 54, pW = tw + 52, pR = 27;
  const px = W - PAD - pW, py = PAD - 6;

  // Parchment pill with gold border
  ctx.fillStyle = 'rgba(253,251,247,0.90)';
  rrPath(ctx, px, py, pW, pH, pR); ctx.fill();
  ctx.strokeStyle = 'rgba(201,168,76,0.55)';
  ctx.lineWidth = 1.5;
  rrPath(ctx, px, py, pW, pH, pR); ctx.stroke();

  // Gold text
  ctx.fillStyle = ART_GOLD_DARK;
  ctx.textAlign = 'left';
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText(label, px + 26, py + 36);

  // Subtle scale decoration left of text
  ctx.fillStyle = ART_GOLD;
  ctx.font = '22px Arial, sans-serif';
  ctx.fillText('⚖', px + 2, py + 35);

  void imgH; // suppress unused-var warning
}

/** Off-white text zone: category → title → author → excerpt (faded) → CTA */
function drawArticleTextZone(
  ctx: CanvasRenderingContext2D,
  article: Article,
  W: number,
  zoneTop: number,
  zoneBottom: number,
  PAD: number,
  isStory: boolean,
) {
  const textW = W - PAD * 2;
  let Y = zoneTop + (isStory ? 52 : 40);

  // ── Category pill ──────────────────────────────────────────────────────────
  const catText = (article.category || 'Legal Insights').toUpperCase();
  ctx.font = `bold ${isStory ? 24 : 22}px Arial, sans-serif`;
  const catPillW = ctx.measureText(catText).width + 44;
  ctx.fillStyle = 'rgba(201,168,76,0.13)';
  rrPath(ctx, PAD, Y - 32, catPillW, 48, 24); ctx.fill();
  ctx.strokeStyle = 'rgba(201,168,76,0.50)';
  ctx.lineWidth = 1.5;
  rrPath(ctx, PAD, Y - 32, catPillW, 48, 24); ctx.stroke();
  ctx.fillStyle = ART_GOLD_DARK;
  ctx.textAlign = 'left';
  ctx.fillText(catText, PAD + 22, Y);
  Y += isStory ? 62 : 52;

  // ── Title ──────────────────────────────────────────────────────────────────
  ctx.fillStyle = ART_INK;
  ctx.font = `bold ${isStory ? 54 : 44}px Georgia, serif`;
  Y = wrapTextCanvas(ctx, article.title, PAD, Y, textW, isStory ? 70 : 58) + (isStory ? 18 : 14);

  // ── Author · Date ──────────────────────────────────────────────────────────
  const rawDate = article.createdAt && typeof (article.createdAt as { toDate?: () => Date }).toDate === 'function'
    ? (article.createdAt as { toDate: () => Date }).toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';
  const meta = [article.author || 'EduLaw Editor', rawDate].filter(Boolean).join('  ·  ');
  ctx.fillStyle = 'rgba(28,16,9,0.45)';
  ctx.font = `${isStory ? 26 : 24}px Arial, sans-serif`;
  Y = wrapTextCanvas(ctx, meta, PAD, Y, textW, 40) + (isStory ? 28 : 20);

  // ── Gold divider ───────────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(201,168,76,0.30)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(PAD, Y); ctx.lineTo(W - PAD, Y); ctx.stroke();
  Y += isStory ? 36 : 28;

  // ── Article excerpt with fade-out ─────────────────────────────────────────
  const rawContent = article.excerpt ||
    (article.content || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const maxChars = isStory ? 700 : 400;
  const excerpt = rawContent.length > maxChars ? rawContent.slice(0, maxChars) : rawContent;

  const excSize   = isStory ? 30 : 26;
  const excLineH  = isStory ? 50 : 42;
  const ctaBlock  = isStory ? 150 : 110;  // height reserved for CTA at bottom
  const excerptBoxEnd = zoneBottom - ctaBlock - (isStory ? 18 : 12);
  const fadeH     = isStory ? 240 : 170;

  ctx.fillStyle = 'rgba(28,16,9,0.68)';
  ctx.font = `${excSize}px Arial, sans-serif`;

  // Clip excerpt to its box, then draw
  ctx.save();
  ctx.beginPath();
  ctx.rect(PAD, Y - 60, textW, excerptBoxEnd - Y + 60);
  ctx.clip();
  wrapTextCanvas(ctx, excerpt, PAD, Y, textW, excLineH);
  ctx.restore();

  // Parchment fade gradient over the bottom of the excerpt
  const fadeStart = excerptBoxEnd - fadeH;
  const fadeGrad  = ctx.createLinearGradient(0, fadeStart, 0, excerptBoxEnd);
  fadeGrad.addColorStop(0,   'rgba(253,251,247,0)');
  fadeGrad.addColorStop(0.55, 'rgba(253,251,247,0.82)');
  fadeGrad.addColorStop(1,   'rgba(253,251,247,1)');
  ctx.fillStyle = fadeGrad;
  ctx.fillRect(0, fadeStart, W, excerptBoxEnd - fadeStart);

  // ── CTA ───────────────────────────────────────────────────────────────────
  let ctaY = excerptBoxEnd + (isStory ? 20 : 14);
  ctx.fillStyle = 'rgba(28,16,9,0.45)';
  ctx.font = `${isStory ? 28 : 24}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('To read the full article visit', W / 2, ctaY);
  ctaY += isStory ? 48 : 38;
  ctx.fillStyle = ART_GOLD_DARK;
  ctx.font = `bold ${isStory ? 34 : 29}px Georgia, serif`;
  ctx.fillText('www.store.theedulaw.in', W / 2, ctaY);
}

/** 1080×1920 Instagram Story card for a blog article — off-white parchment */
async function generateArticleStoryCard(article: Article): Promise<Blob | null> {
  const W = 1080, H = 1920, PAD = 72, IMG_H = 800;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const rawCtx = canvas.getContext('2d');
  if (!rawCtx) return null;
  const ctx: CanvasRenderingContext2D = rawCtx;

  // ── Off-white parchment background ────────────────────────────────────────
  ctx.fillStyle = ART_PARCHMENT;
  ctx.fillRect(0, 0, W, H);

  // Subtle warm vignette from bottom
  const vignette = ctx.createRadialGradient(W * 0.5, H, 0, W * 0.5, H, H * 0.7);
  vignette.addColorStop(0, 'rgba(230,210,170,0.22)');
  vignette.addColorStop(1, 'rgba(253,251,247,0)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);

  // ── Gold accent bars ───────────────────────────────────────────────────────
  const goldGrad = ctx.createLinearGradient(0, 0, W, 0);
  goldGrad.addColorStop(0, ART_GOLD);
  goldGrad.addColorStop(0.5, '#E8C97A');
  goldGrad.addColorStop(1, ART_GOLD);
  ctx.fillStyle = goldGrad;
  ctx.fillRect(0, 0, W, 10);

  // ── Featured image ────────────────────────────────────────────────────────
  const imgSrc = article.featuredImage ||
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1080';
  const img = await loadCanvasImage(imgSrc);
  if (img) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 10, W, IMG_H - 10);
    ctx.clip();
    drawImageCover(ctx, img, 0, 10, W, IMG_H - 10);
    ctx.restore();
  }

  // Fade image into parchment at the bottom
  const fade = ctx.createLinearGradient(0, IMG_H * 0.42, 0, IMG_H);
  fade.addColorStop(0, 'rgba(253,251,247,0)');
  fade.addColorStop(1, ART_PARCHMENT);
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, W, IMG_H);

  // ── EduLaw logo badge (top-right over image) ──────────────────────────────
  drawArticleLogoBadge(ctx, W, PAD, IMG_H);

  // ── Text zone ─────────────────────────────────────────────────────────────
  drawArticleTextZone(ctx, article, W, IMG_H, H - 10, PAD, true);

  // Bottom accent bar
  ctx.fillStyle = goldGrad;
  ctx.fillRect(0, H - 10, W, 10);

  return new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b), 'image/png'));
}

/** 1080×1080 Instagram Post (square) card for a blog article — off-white parchment */
async function generateArticlePostCard(article: Article): Promise<Blob | null> {
  const W = 1080, H = 1080, PAD = 64, IMG_H = 440;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const rawCtx = canvas.getContext('2d');
  if (!rawCtx) return null;
  const ctx: CanvasRenderingContext2D = rawCtx;

  // ── Off-white parchment background ────────────────────────────────────────
  ctx.fillStyle = ART_PARCHMENT;
  ctx.fillRect(0, 0, W, H);

  const vignette = ctx.createRadialGradient(W * 0.5, H, 0, W * 0.5, H, H * 0.7);
  vignette.addColorStop(0, 'rgba(230,210,170,0.20)');
  vignette.addColorStop(1, 'rgba(253,251,247,0)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);

  // ── Gold accent bars ───────────────────────────────────────────────────────
  const goldGrad = ctx.createLinearGradient(0, 0, W, 0);
  goldGrad.addColorStop(0, ART_GOLD);
  goldGrad.addColorStop(0.5, '#E8C97A');
  goldGrad.addColorStop(1, ART_GOLD);
  ctx.fillStyle = goldGrad;
  ctx.fillRect(0, 0, W, 8);

  // ── Featured image ────────────────────────────────────────────────────────
  const imgSrc = article.featuredImage ||
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1080';
  const img = await loadCanvasImage(imgSrc);
  if (img) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 8, W, IMG_H - 8);
    ctx.clip();
    drawImageCover(ctx, img, 0, 8, W, IMG_H - 8);
    ctx.restore();
  }

  // Fade image into parchment
  const fade = ctx.createLinearGradient(0, IMG_H * 0.40, 0, IMG_H);
  fade.addColorStop(0, 'rgba(253,251,247,0)');
  fade.addColorStop(1, ART_PARCHMENT);
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, W, IMG_H);

  // ── EduLaw logo badge (top-right over image) ──────────────────────────────
  drawArticleLogoBadge(ctx, W, PAD, IMG_H);

  // ── Text zone ─────────────────────────────────────────────────────────────
  drawArticleTextZone(ctx, article, W, IMG_H, H - 8, PAD, false);

  // Bottom accent bar
  ctx.fillStyle = goldGrad;
  ctx.fillRect(0, H - 8, W, 8);

  return new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b), 'image/png'));
}

// ─── Blog categories ─────────────────────────────────────────────────────────
const FIXED_BLOG_CATEGORIES = [
  'Landmark Judgements',
  'AI & Tech Developments',
  'Criminal Law',
  'War & Geopolitics',
  'Legal Updates',
  'Case Studies',
  'News',
];

function slugifyCategory(cat: string) {
  return cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

// ─── Placeholder decks ───────────────────────────────────────────────────────
const PLACEHOLDER_DECKS: FlashcardDeck[] = [
  { id: 'ph-1', title: 'Contract Law Essentials', subject: 'Contract Law', category: 'Civil Law', difficulty: 'Beginner', status: 'coming-soon', cards: [{ id: 'ph-c1', front: 'Coming Soon', back: 'This deck is being prepared.' }] },
  { id: 'ph-2', title: 'Constitutional Fundamentals', subject: 'Constitutional Law', category: 'Public Law', difficulty: 'Intermediate', status: 'coming-soon', cards: [{ id: 'ph-c1', front: 'Coming Soon', back: 'This deck is being prepared.' }] },
  { id: 'ph-3', title: 'Criminal Law Concepts', subject: 'Criminal Law', category: 'Criminal Law', difficulty: 'Intermediate', status: 'coming-soon', cards: [{ id: 'ph-c1', front: 'Coming Soon', back: 'This deck is being prepared.' }] },
  { id: 'ph-4', title: 'Corporate Law Mastery', subject: 'Companies Act', category: 'Corporate Law', difficulty: 'Expert', status: 'coming-soon', cards: [{ id: 'ph-c1', front: 'Coming Soon', back: 'This deck is being prepared.' }] },
];

// ─── Daily news (static) ─────────────────────────────────────────────────────
const DAILY_NEWS: LegalNews[] = [
  { id: 'news-1', title: 'New Income-tax Act, 2025 Comes Into Force', summary: "The milestone shift in India's direct tax history has started. The New Act focuses on \"Ease of Compliance\" and simplifying forms.", imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80', date: 'Apr 04, 2026', source: 'Financial Express', category: 'Business & Tax', readTime: '4 min read' },
  { id: 'news-2', title: 'Jan Vishwas Bill 2026: 717 Offences Decriminalized', summary: 'Both Houses pass the landmark bill aimed at improving Ease of Doing Business by replacing minor criminal charges with penalties.', imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80', date: 'Apr 04, 2026', source: 'Press Information Bureau', category: 'Indian Law', readTime: '3 min read' },
  { id: 'news-3', title: 'SC Takes Cognizance of AI-Generated "Fake Precedents"', summary: 'Supreme Court issues notices to the AG and Solicitor General regarding the systemic risks posed by synthetic legal precedents.', imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80', date: 'Apr 04, 2026', source: 'LiveLaw', category: 'AI & Tech', readTime: '5 min read' },
  { id: 'news-4', title: 'Oil Prices Surge to $118 Amid West Asia Conflict', summary: "Escalating regional conflict pushes crude prices to multi-year highs, impacting India's trade deficit and energy security.", imageUrl: 'https://images.unsplash.com/photo-1614728523512-c9066603a11a?auto=format&fit=crop&q=80', date: 'Apr 04, 2026', source: 'Reuters / India Today', category: 'War & Geopolitics', readTime: '6 min read' },
  { id: 'news-5', title: 'Rajasthan HC: Gender Self-Identity is Intrinsic Facet of Dignity', summary: 'Court reaffirms transgender rights and personal liberty, expunging remarks that suggested new amendments dilute guarantees.', imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80', date: 'Apr 04, 2026', source: 'The Hindu', category: 'Landmark Judgments', readTime: '4 min read' },
  { id: 'news-6', title: 'SC Principles on Judicial Restraint in Contractual Bidding', summary: 'Court rules that judiciary should avoid interfering in tenders if bidding results are based on competitive merit scoring.', imageUrl: 'https://images.unsplash.com/photo-1450175804616-784f7ba7042b?auto=format&fit=crop&q=80', date: 'Apr 04, 2026', source: 'SCC Online', category: 'Business & Tax', readTime: '3 min read' },
  { id: 'news-7', title: 'India Navigates Energy Risks via Multi-Alignment Policy', summary: "Safe passage of LPG tankers through Iranian waters showcases India's diplomatic success in balancing global ties.", imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80', date: 'Apr 04, 2026', source: 'Observer Research Foundation', category: 'War & Geopolitics', readTime: '5 min read' },
  { id: 'news-8', title: 'California CPPA Cybersecurity Audits Begin', summary: 'Mandatory annual audits for large tech firms set a global standard for corporate data governance and privacy.', imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80', date: 'Apr 04, 2026', source: 'TechCrunch / Bar & Bench', category: 'AI & Tech', readTime: '4 min read' },
  { id: 'news-9', title: 'SC Upholds Income Criteria Reconsideration for OBCs', summary: 'Supreme Court directs authorities to review creamy layer status for candidates from PSUs and private organisations.', imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80', date: 'Apr 04, 2026', source: 'Times of India', category: 'Indian Law', readTime: '4 min read' },
  { id: 'news-10', title: 'US National Policy Framework for AI Released', summary: 'Guidelines advocate for federal-led regulation over state laws to ensure AI development remains competitive.', imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80', date: 'Apr 04, 2026', source: 'Wired / Global Times', category: 'AI & Tech', readTime: '5 min read' },
];

// ─── JSON-LD structured data ─────────────────────────────────────────────────
const JSON_LD_BREADCRUMB = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://store.theedulaw.in/' },
    { '@type': 'ListItem', position: 2, name: 'Legal Playground', item: 'https://store.theedulaw.in/legal-playground' },
  ],
};

const JSON_LD_LEARNING = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'EduLaw Legal Playground',
  description: 'Free interactive legal study tools for Indian law students — flashcard decks, daily legal news, landmark judgments, and a comprehensive legal glossary for LLB, LLM, CLAT, and Judiciary exam preparation.',
  url: 'https://store.theedulaw.in/legal-playground',
  provider: { '@type': 'Organization', name: 'EduLaw', url: 'https://store.theedulaw.in' },
  audience: { '@type': 'Audience', audienceType: 'Law students, LLB, LLM, CLAT PG aspirants, Judiciary exam candidates' },
  educationalLevel: 'University/Graduate',
  inLanguage: 'en-IN',
  isAccessibleForFree: true,
  keywords: 'law flashcards, legal news India, landmark judgments, legal glossary, CLAT PG, Judiciary notes, LLB study material, legal quiz, constitution article, legal maxim, weekly judgment digest, Indian legal timeline',
};

const JSON_LD_FAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is the Legal Playground free to use?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. All resources on the Legal Playground — flashcard decks, legal news updates, blog articles, and the glossary — are completely free.' },
    },
    {
      '@type': 'Question',
      name: 'What topics do the legal flashcards cover?',
      acceptedAnswer: { '@type': 'Answer', text: 'The flashcard decks cover Contract Law, Constitutional Law, Criminal Law, Corporate Law (Companies Act), and more, across Beginner to Expert difficulty levels.' },
    },
    {
      '@type': 'Question',
      name: 'How often is the legal news updated?',
      acceptedAnswer: { '@type': 'Answer', text: 'Legal news and landmark judgment summaries are updated regularly to reflect the latest Supreme Court and High Court developments in India.' },
    },
    {
      '@type': 'Question',
      name: 'Can I use EduLaw Playground for CLAT PG or Judiciary preparation?',
      acceptedAnswer: { '@type': 'Answer', text: 'Absolutely. The Legal Playground is curated specifically for LLB, LLM, CLAT PG, and Judiciary aspirants, with simplified legal concepts, case law summaries, and terminology drills.' },
    },
  ],
};

// ─── Instagram Story Generators ──────────────────────────────────────────────

async function generateConstitutionStoryCard(article: {
  article: string; title: string; plainLanguage: string; keyPoint: string; relatedCase: string;
}): Promise<Blob | null> {
  const W = 1080, H = 1920, PAD = 72;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const raw = canvas.getContext('2d');
  if (!raw) return null;
  const ctx: CanvasRenderingContext2D = raw;
  let Y = await drawBaseBackground(ctx, W, H);

  drawBadge(ctx, 'ARTICLE OF THE DAY', W / 2, Y + 28); Y += 84;

  ctx.fillStyle = '#C9A84C'; ctx.font = 'bold 80px Georgia, serif';
  ctx.textAlign = 'center'; ctx.fillText(article.article, W / 2, Y + 68); Y += 120;

  ctx.fillStyle = '#0D0D0D'; ctx.font = 'bold 54px Georgia, serif';
  Y = wrapTextCanvas(ctx, article.title, PAD, Y, W - PAD * 2, 72, 'center') + 48;

  drawDivider(ctx, W, Y, PAD); Y += 60;
  ctx.fillStyle = '#C9A84C'; ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'left'; ctx.fillText('IN PLAIN LANGUAGE', PAD, Y); Y += 52;
  ctx.fillStyle = '#0D0D0D'; ctx.font = '38px Arial, sans-serif';
  Y = wrapTextCanvas(ctx, article.plainLanguage, PAD, Y, W - PAD * 2, 60) + 48;

  drawDivider(ctx, W, Y, PAD); Y += 60;
  ctx.fillStyle = '#C9A84C'; ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'left'; ctx.fillText('KEY POINT', PAD, Y); Y += 52;
  ctx.fillStyle = '#C9A84C'; ctx.font = '36px Arial, sans-serif';
  Y = wrapTextCanvas(ctx, article.keyPoint, PAD, Y, W - PAD * 2, 56) + 36;

  ctx.fillStyle = 'rgba(13,13,13,0.50)'; ctx.font = 'italic 30px Georgia, serif';
  Y = wrapTextCanvas(ctx, article.relatedCase, PAD, Y, W - PAD * 2, 46) + 24;

  ctx.fillStyle = 'rgba(13,13,13,0.35)'; ctx.font = '26px Arial, sans-serif';
  ctx.textAlign = 'center'; ctx.fillText('Explore more at theedulaw.in', W / 2, Math.min(Y + 60, H - 90));
  return new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b), 'image/png'));
}

async function generateMaximStoryCard(maxim: {
  maxim: string; origin: string; meaning: string; usage: string; memoryHook: string;
}): Promise<Blob | null> {
  const W = 1080, H = 1920, PAD = 72;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const raw = canvas.getContext('2d');
  if (!raw) return null;
  const ctx: CanvasRenderingContext2D = raw;
  let Y = await drawBaseBackground(ctx, W, H);

  drawBadge(ctx, 'LEGAL MAXIM', W / 2, Y + 28); Y += 84;

  ctx.font = 'bold 24px Arial, sans-serif';
  const ow = ctx.measureText(maxim.origin).width + 40;
  ctx.fillStyle = 'rgba(201,168,76,0.18)';
  rrPath(ctx, W / 2 - ow / 2, Y - 30, ow, 50, 25); ctx.fill();
  ctx.fillStyle = '#C9A84C'; ctx.textAlign = 'center';
  ctx.fillText(maxim.origin, W / 2, Y + 4); Y += 68;

  ctx.fillStyle = '#C9A84C'; ctx.font = 'italic bold 56px Georgia, serif';
  Y = wrapTextCanvas(ctx, `\u201C${maxim.maxim}\u201D`, PAD, Y + 20, W - PAD * 2, 78, 'center') + 52;

  drawDivider(ctx, W, Y, PAD); Y += 60;
  ctx.fillStyle = '#C9A84C'; ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'left'; ctx.fillText('MEANING', PAD, Y); Y += 52;
  ctx.fillStyle = '#0D0D0D'; ctx.font = '40px Arial, sans-serif';
  Y = wrapTextCanvas(ctx, maxim.meaning, PAD, Y, W - PAD * 2, 62) + 52;

  drawDivider(ctx, W, Y, PAD); Y += 60;
  ctx.fillStyle = '#C9A84C'; ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'left'; ctx.fillText('USAGE IN LAW', PAD, Y); Y += 52;
  ctx.fillStyle = 'rgba(13,13,13,0.70)'; ctx.font = '36px Arial, sans-serif';
  Y = wrapTextCanvas(ctx, maxim.usage, PAD, Y, W - PAD * 2, 56) + 48;

  // Memory hook box — placed dynamically right after usage
  const hookTop = Math.min(Y, H - 340);
  const hookH = 170;
  ctx.fillStyle = 'rgba(201,168,76,0.12)';
  rrPath(ctx, PAD, hookTop, W - PAD * 2, hookH, 20); ctx.fill();
  ctx.strokeStyle = 'rgba(201,168,76,0.35)'; ctx.lineWidth = 1;
  rrPath(ctx, PAD, hookTop, W - PAD * 2, hookH, 20); ctx.stroke();
  ctx.fillStyle = '#C9A84C'; ctx.font = 'bold 22px Arial, sans-serif';
  ctx.textAlign = 'left'; ctx.fillText('\uD83D\uDCA1  MEMORY HOOK', PAD + 28, hookTop + 44);
  ctx.fillStyle = 'rgba(13,13,13,0.70)'; ctx.font = 'italic 30px Georgia, serif';
  wrapTextCanvas(ctx, maxim.memoryHook, PAD + 28, hookTop + 94, W - PAD * 2 - 56, 46);
  Y = hookTop + hookH + 48;

  ctx.fillStyle = 'rgba(13,13,13,0.35)'; ctx.font = '26px Arial, sans-serif';
  ctx.textAlign = 'center'; ctx.fillText('Explore more at theedulaw.in', W / 2, Math.min(Y, H - 90));
  return new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b), 'image/png'));
}

async function generateCaseLawStoryCard(c: CaseLaw): Promise<Blob | null> {
  const W = 1080, H = 1920, PAD = 72;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const raw = canvas.getContext('2d');
  if (!raw) return null;
  const ctx: CanvasRenderingContext2D = raw;
  let Y = await drawBaseBackground(ctx, W, H);

  drawBadge(ctx, 'CASE LAW', W / 2, Y + 28); Y += 84;

  ctx.fillStyle = '#C9A84C'; ctx.font = 'bold 54px Georgia, serif';
  Y = wrapTextCanvas(ctx, c.name, PAD, Y + 10, W - PAD * 2, 74, 'center') + 32;

  ctx.fillStyle = 'rgba(13,13,13,0.55)'; ctx.font = '32px Arial, sans-serif';
  ctx.textAlign = 'center'; ctx.fillText(`${c.court}  ·  ${c.year}`, W / 2, Y); Y += 58;

  ctx.font = 'bold 26px Arial, sans-serif';
  const cw = ctx.measureText(c.citation).width + 48;
  ctx.fillStyle = 'rgba(201,168,76,0.15)';
  rrPath(ctx, W / 2 - cw / 2, Y - 32, cw, 56, 28); ctx.fill();
  ctx.fillStyle = '#C9A84C'; ctx.textAlign = 'center';
  ctx.fillText(c.citation, W / 2, Y + 6); Y += 72;

  drawDivider(ctx, W, Y, PAD); Y += 60;
  ctx.fillStyle = '#C9A84C'; ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'left'; ctx.fillText('RATIO DECIDENDI', PAD, Y); Y += 52;
  ctx.fillStyle = '#0D0D0D'; ctx.font = '38px Arial, sans-serif';
  Y = wrapTextCanvas(ctx, c.ratio, PAD, Y, W - PAD * 2, 58) + 48;

  drawDivider(ctx, W, Y, PAD); Y += 60;
  ctx.fillStyle = '#C9A84C'; ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'left'; ctx.fillText('SIGNIFICANCE', PAD, Y); Y += 52;
  ctx.fillStyle = 'rgba(13,13,13,0.70)'; ctx.font = '36px Arial, sans-serif';
  Y = wrapTextCanvas(ctx, c.significance, PAD, Y, W - PAD * 2, 56) + 40;

  ctx.fillStyle = 'rgba(13,13,13,0.35)'; ctx.font = '26px Arial, sans-serif';
  ctx.textAlign = 'center'; ctx.fillText('Explore more at theedulaw.in', W / 2, Math.min(Y + 60, H - 90));
  return new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b), 'image/png'));
}

async function generateQuizStoryCard(score: number, total: number): Promise<Blob | null> {
  const W = 1080, H = 1920, PAD = 72;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const raw = canvas.getContext('2d');
  if (!raw) return null;
  const ctx: CanvasRenderingContext2D = raw;
  let Y = await drawBaseBackground(ctx, W, H);

  drawBadge(ctx, 'DAILY QUIZ RESULT', W / 2, Y + 28); Y += 100;

  // Score ring
  const pct = score / total;
  const cx = W / 2, cy = Y + 300, radius = 280;
  ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(13,13,13,0.08)'; ctx.lineWidth = 36; ctx.stroke();
  if (pct > 0) {
    ctx.beginPath(); ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * pct);
    const arcG = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
    arcG.addColorStop(0, '#C9A84C'); arcG.addColorStop(1, '#E8C97A');
    ctx.strokeStyle = arcG; ctx.lineWidth = 36; ctx.lineCap = 'round'; ctx.stroke();
  }
  ctx.textAlign = 'center'; ctx.font = 'bold 220px Georgia, serif';
  ctx.fillStyle = '#C9A84C'; ctx.fillText(`${score}`, cx, cy + 72);
  ctx.font = 'bold 52px Georgia, serif';
  ctx.fillStyle = 'rgba(13,13,13,0.40)'; ctx.fillText(`out of ${total}`, cx, cy + 154);
  Y = cy + radius + 72;

  const msg = pct === 1 ? '🏆 Perfect Score!' : pct >= 0.8 ? '🎯 Excellent Work!' : pct >= 0.6 ? '👍 Great Job!' : '📚 Keep Practising!';
  ctx.fillStyle = '#0D0D0D'; ctx.font = 'bold 66px Georgia, serif';
  ctx.textAlign = 'center'; ctx.fillText(msg, W / 2, Y); Y += 108;

  const barW = W - PAD * 2, barH = 26;
  ctx.fillStyle = 'rgba(13,13,13,0.08)';
  rrPath(ctx, PAD, Y, barW, barH, 13); ctx.fill();
  const fillW = Math.max(barH, pct * barW);
  const goldG = ctx.createLinearGradient(PAD, 0, PAD + fillW, 0);
  goldG.addColorStop(0, '#C9A84C'); goldG.addColorStop(1, '#E8C97A');
  ctx.fillStyle = goldG; rrPath(ctx, PAD, Y, fillW, barH, 13); ctx.fill();
  Y += 58;

  ctx.fillStyle = 'rgba(13,13,13,0.50)'; ctx.font = '36px Arial, sans-serif';
  ctx.textAlign = 'center'; ctx.fillText('questions answered correctly', W / 2, Y); Y += 108;

  drawDivider(ctx, W, Y, PAD); Y += 64;
  ctx.fillStyle = 'rgba(13,13,13,0.60)'; ctx.font = '40px Arial, sans-serif';
  ctx.textAlign = 'center'; ctx.fillText('🎓 Challenge your classmates!', W / 2, Y); Y += 68;
  ctx.fillStyle = '#C9A84C'; ctx.font = 'bold 38px Georgia, serif';
  ctx.textAlign = 'center'; ctx.fillText('theedulaw.in/legal-playground', W / 2, Y); Y += 72;

  ctx.fillStyle = 'rgba(13,13,13,0.35)'; ctx.font = '26px Arial, sans-serif';
  ctx.textAlign = 'center'; ctx.fillText('Explore more at theedulaw.in', W / 2, Math.min(Y, H - 90));
  return new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b), 'image/png'));
}

// ─── Quiz of the Day Component ───────────────────────────────────────────────
function QuizOfTheDay() {
  const questions = useMemo(() => getDailyQuiz(), []);
  const [current, setCurrent]   = useState(0);
  const [answered, setAnswered] = useState<boolean[]>(Array(questions.length).fill(false));
  const [choices, setChoices]   = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [showAll, setShowAll]   = useState(false);
  const [quizShareBusy, setQuizShareBusy] = useState(false);

  const q = questions[current];
  const isAnswered = answered[current];
  const userChoice = choices[current];
  const score = choices.filter((c, i) => c === questions[i].correct).length;

  const handleQuizShare = async () => {
    setQuizShareBusy(true);
    try {
      const blob = await generateQuizStoryCard(score, questions.length);
      if (blob) await shareFile(new File([blob], 'edulaw-daily-quiz.png', { type: 'image/png' }), `Quiz Result: ${score}/${questions.length}`);
    } catch (_) {}
    finally { setQuizShareBusy(false); }
  };

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    const newAnswered = [...answered]; newAnswered[current] = true; setAnswered(newAnswered);
    const newChoices  = [...choices];  newChoices[current]  = idx;  setChoices(newChoices);
  };

  const allDone = answered.every(Boolean);

  return (
    <div className="bg-white border border-ink/10 rounded-3xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-ink/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-gold" />
          </div>
          <div>
            <p className="font-ui font-black text-sm text-ink">Daily Quiz</p>
            <p className="text-[10px] font-ui text-mutedgray">5 questions · resets at midnight</p>
          </div>
        </div>
        {allDone && (
          <div className="px-3 py-1.5 bg-gold/10 rounded-xl text-center">
            <p className="text-[10px] font-ui text-gold font-black uppercase tracking-widest">Score</p>
            <p className="font-display text-lg text-gold leading-none">{score}/5</p>
          </div>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 px-6 py-3 border-b border-ink/5">
        {questions.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${i === current ? 'w-6' : 'w-2'} ${answered[i] ? choices[i] === questions[i].correct ? 'bg-green-400' : 'bg-red-400' : 'bg-ink/10'}`}
          />
        ))}
        <span className="ml-auto text-[10px] font-ui text-mutedgray font-bold">{current + 1} / {questions.length}</span>
      </div>

      {/* Question */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${subjectColors[q.subject] ?? 'bg-slate-100 text-slate-600'}`}>{q.subject}</span>
        </div>
        <p className="font-display text-lg text-ink leading-snug mb-5">{q.q}</p>

        <div className="space-y-2.5">
          {q.options.map((opt, i) => {
            let cls = 'border-ink/10 bg-parchment/50 text-ink/70 hover:border-gold/50 hover:bg-gold/5 cursor-pointer';
            if (isAnswered) {
              if (i === q.correct) cls = 'border-green-400 bg-green-50 text-green-800 cursor-default';
              else if (i === userChoice) cls = 'border-red-400 bg-red-50 text-red-800 cursor-default';
              else cls = 'border-ink/5 bg-white/50 text-ink/30 cursor-default';
            }
            return (
              <button key={i} onClick={() => handleSelect(i)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 font-ui text-sm font-medium transition-all flex items-center gap-3 ${cls}`}
              >
                <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-black shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
                {isAnswered && i === q.correct && <CheckCircle2 className="w-4 h-4 ml-auto text-green-500 shrink-0" />}
                {isAnswered && i === userChoice && i !== q.correct && <XCircle className="w-4 h-4 ml-auto text-red-500 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {isAnswered && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-gold/5 border border-gold/20 rounded-2xl"
          >
            <p className="text-[10px] font-ui font-black text-gold uppercase tracking-widest mb-1.5">Explanation</p>
            <p className="font-body text-sm text-ink/80 leading-relaxed">{q.explanation}</p>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-5">
          <button onClick={() => setCurrent(p => Math.max(0, p - 1))} disabled={current === 0}
            className="flex-1 py-3 border border-ink/10 rounded-xl font-ui text-xs font-bold text-ink/60 hover:bg-ink hover:text-white disabled:opacity-30 transition-all flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          {current < questions.length - 1 ? (
            <button onClick={() => setCurrent(p => p + 1)}
              className="flex-1 py-3 bg-burgundy text-white rounded-xl font-ui text-xs font-bold hover:bg-burgundy-light transition-colors flex items-center justify-center gap-2"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => setShowAll(v => !v)}
              className="flex-1 py-3 bg-gold text-ink rounded-xl font-ui text-xs font-bold hover:bg-gold/80 transition-colors flex items-center justify-center gap-2"
            >
              {showAll ? 'Hide' : 'See All'} <Award className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Marketplace CTA once all questions answered */}
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-burgundy/5 border border-burgundy/15 rounded-2xl"
          >
            <p className="text-[10px] font-ui font-black text-burgundy uppercase tracking-widest mb-1">Ready to go deeper?</p>
            <p className="font-body text-xs text-ink/65 leading-relaxed mb-3">
              Get comprehensive notes on Constitutional Law, Criminal Law, CPC, and 40+ more subjects.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleQuizShare}
                disabled={quizShareBusy}
                style={{ background: IG_GRADIENT }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-ui text-[11px] font-black text-white disabled:opacity-50 active:scale-95 transition-transform"
              >
                {quizShareBusy ? <RefreshCw className="w-3 h-3 animate-spin" /> : <span>📱</span>}
                {quizShareBusy ? 'Generating…' : 'Share Score'}
              </button>
              <Link to="/marketplace" className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-burgundy text-white rounded-xl font-ui text-[11px] font-black hover:bg-burgundy-light transition-all">
                <ShoppingBag className="w-3 h-3" /> Browse Notes
              </Link>
              <Link to="/mock-tests" className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-burgundy/30 text-burgundy rounded-xl font-ui text-[11px] font-black hover:bg-burgundy/5 transition-all">
                Mock Tests
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Constitution Article of the Day ─────────────────────────────────────────
function ConstitutionArticleCard() {
  const article = useMemo(() => getDailyConstitutionArticle(), []);
  const [expanded, setExpanded] = useState(false);
  const [artShareBusy, setArtShareBusy] = useState(false);

  const handleArtShare = async () => {
    setArtShareBusy(true);
    try {
      const blob = await generateConstitutionStoryCard(article);
      if (blob) await shareFile(new File([blob], 'edulaw-constitution-article.png', { type: 'image/png' }), article.title);
    } catch (_) {}
    finally { setArtShareBusy(false); }
  };

  return (
    <div className="bg-white border border-ink/10 rounded-3xl overflow-hidden shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-ink/5">
        <div className="w-9 h-9 rounded-xl bg-burgundy/10 flex items-center justify-center">
          <BookMarked className="w-5 h-5 text-burgundy" />
        </div>
        <div>
          <p className="font-ui font-black text-sm text-ink">Constitution Article of the Day</p>
          <p className="text-[10px] font-ui text-mutedgray">{article.part}</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 flex flex-col gap-4">
        <div>
          <span className="text-[10px] font-ui font-black text-burgundy uppercase tracking-[0.2em]">{article.article}</span>
          <h3 className="font-display text-xl text-ink mt-1">{article.title}</h3>
        </div>

        <div className="bg-parchment/60 rounded-2xl p-4">
          <p className="text-[10px] font-ui font-black text-ink/40 uppercase tracking-widest mb-2">Plain Language</p>
          <p className="font-body text-sm text-ink/80 leading-relaxed">{article.plainLanguage}</p>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-3">
              <div className="bg-gold/5 border border-gold/15 rounded-2xl p-4">
                <p className="text-[10px] font-ui font-black text-gold uppercase tracking-widest mb-2">Key Point to Remember</p>
                <p className="font-body text-sm text-ink/80 leading-relaxed">{article.keyPoint}</p>
              </div>
              <div className="border border-ink/8 rounded-2xl p-4">
                <p className="text-[10px] font-ui font-black text-ink/40 uppercase tracking-widest mb-2">Related Case</p>
                <p className="font-body text-sm text-ink/70 leading-relaxed italic">{article.relatedCase}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto flex items-center justify-between gap-3 flex-wrap">
          <button onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-2 text-xs font-ui font-bold text-burgundy hover:text-burgundy-light transition-colors"
          >
            {expanded ? 'Show less' : 'Key point & case'} <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
          <button
            onClick={handleArtShare}
            disabled={artShareBusy}
            style={{ background: IG_GRADIENT }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-ui text-[11px] font-black text-white disabled:opacity-50 active:scale-95 transition-transform"
          >
            {artShareBusy ? <RefreshCw className="w-3 h-3 animate-spin" /> : <span>📱</span>}
            {artShareBusy ? 'Generating…' : 'Share Story'}
          </button>
        </div>
        <Link
          to="/marketplace?q=constitutional+law"
          className="flex items-center gap-1.5 text-[10px] font-ui font-bold text-gold hover:text-[#7a5c1e] transition-colors mt-2"
        >
          <ShoppingBag className="w-3 h-3" /> Get Constitutional Law Notes
        </Link>
      </div>
    </div>
  );
}

// ─── Legal Maxim of the Day ───────────────────────────────────────────────────
function LegalMaximCard() {
  const maxim = useMemo(() => getDailyMaxim(), []);
  const [flipped, setFlipped] = useState(false);
  const [maximShareBusy, setMaximShareBusy] = useState(false);

  const handleMaximShare = async () => {
    setMaximShareBusy(true);
    try {
      const blob = await generateMaximStoryCard(maxim);
      if (blob) await shareFile(new File([blob], 'edulaw-legal-maxim.png', { type: 'image/png' }), maxim.maxim);
    } catch (_) {}
    finally { setMaximShareBusy(false); }
  };

  return (
    <div className="bg-white border border-ink/10 rounded-3xl overflow-hidden shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-ink/5">
        <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <p className="font-ui font-black text-sm text-ink">Legal Maxim of the Day</p>
          <p className="text-[10px] font-ui text-mutedgray">{maxim.origin} · click card to flip</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 flex flex-col gap-4">
        {/* Flip card */}
        <div className="cursor-pointer" onClick={() => setFlipped(v => !v)} style={{ perspective: '800px' }}>
          <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: 'spring', damping: 15, stiffness: 80 }}
            className="relative preserve-3d" style={{ minHeight: '100px' }}
          >
            <div className="backface-hidden bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-5 flex items-center justify-center">
              <p className="font-display text-lg text-ink text-center italic leading-snug">"{maxim.maxim}"</p>
            </div>
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white border border-ink/10 rounded-2xl p-5 flex items-center justify-center">
              <p className="font-ui text-sm font-bold text-ink/70 text-center leading-relaxed">{maxim.meaning}</p>
            </div>
          </motion.div>
        </div>

        <div>
          <p className="text-[10px] font-ui font-black text-ink/40 uppercase tracking-widest mb-1.5">Usage in Law</p>
          <p className="font-body text-sm text-ink/75 leading-relaxed">{maxim.usage}</p>
        </div>

        <div className="mt-auto bg-gold/5 border border-gold/15 rounded-2xl p-4">
          <p className="text-[10px] font-ui font-black text-gold uppercase tracking-widest mb-1.5">Memory Hook</p>
          <p className="font-body text-sm text-ink/80 leading-relaxed italic">"{maxim.memoryHook}"</p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/legal-playground/maxim/${maxim.id}`}
            className="flex-1 bg-white border border-purple-200 text-purple-600 flex items-center justify-center gap-2 py-3 rounded-2xl font-ui font-black uppercase tracking-widest text-[11px] hover:bg-purple-50 transition-all active:scale-95"
          >
            Full Review
          </Link>
          <button
            onClick={handleMaximShare}
            disabled={maximShareBusy}
            style={{ background: IG_GRADIENT }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-ui font-black uppercase tracking-widest text-[11px] text-white disabled:opacity-50 active:scale-95 transition-transform"
          >
            {maximShareBusy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>📱</span>}
            {maximShareBusy ? 'Generating…' : 'Share Story'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Weekly Judgment Digest ───────────────────────────────────────────────────
function WeeklyDigest() {
  const digests = useMemo(() => getDailyDigest(), []);
  const [activeIdx, setActiveIdx] = useState(0);
  const [storySharing, setStorySharing] = useState(false);
  const [storyDownloaded, setStoryDownloaded] = useState(false);
  const j = digests[activeIdx];

  const handleShareStory = async () => {
    setStorySharing(true);
    try {
      const blob = await generateDigestStoryCard(j);
      if (!blob) return;
      const file = new File([blob], `edulaw-judgment-${j.id}.png`, { type: 'image/png' });
      const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: j.title } as ShareData);
      } else {
        // Desktop fallback — download PNG so user can upload to Instagram manually
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `edulaw-judgment-${j.id}.png`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
        setStoryDownloaded(true);
        setTimeout(() => setStoryDownloaded(false), 3500);
      }
    } catch (_) { /* user cancelled */ }
    finally { setStorySharing(false); }
  };

  return (
    <div className="bg-white border border-ink/10 rounded-3xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-ink/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <p className="font-ui font-black text-sm text-ink">Daily Judgment Digest</p>
            <p className="text-[10px] font-ui text-mutedgray">5 SC &amp; HC rulings · refreshes every day</p>
          </div>
        </div>
        {/* Instagram Story share button */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <button
            onClick={handleShareStory}
            disabled={storySharing}
            title="Share as Instagram Story"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-ui text-[11px] font-black text-white hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}
          >
            {storySharing
              ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              : <Share2 className="w-3.5 h-3.5" />
            }
            {storySharing ? 'Generating…' : 'Story'}
          </button>
          {storyDownloaded && (
            <p className="text-[9px] font-ui text-green-600 font-bold animate-pulse">
              Saved! Upload to Instagram
            </p>
          )}
        </div>
      </div>

      {/* Tab row */}
      <div className="flex gap-1 px-4 py-3 border-b border-ink/5 overflow-x-auto hide-scrollbar">
        {digests.map((item, i) => (
          <button key={item.id} onClick={() => setActiveIdx(i)}
            className={`shrink-0 px-3 py-1.5 rounded-lg font-ui text-[11px] font-bold transition-all ${activeIdx === i ? 'bg-teal-600 text-white' : 'text-ink/50 hover:bg-ink/5'}`}
          >
            {i + 1}. {item.court.includes('Supreme') ? 'SC' : 'HC'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-6 py-6 space-y-5">
          <div>
            <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2 ${subjectColors[j.subject] ?? 'bg-slate-100 text-slate-600'}`}>{j.subject}</span>
            <h3 className="font-display text-lg text-ink leading-snug">{j.title}</h3>
            <div className="flex flex-wrap gap-3 mt-2 text-[10px] font-ui text-mutedgray">
              <span className="flex items-center gap-1"><Gavel className="w-3 h-3" />{j.court}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{j.date}</span>
              <span>{j.citation}</span>
            </div>
          </div>

          {[
            { label: 'Facts', text: j.facts, color: 'bg-parchment/60' },
            { label: 'Issue', text: j.issue, color: 'bg-blue-50' },
            { label: 'Held', text: j.held, color: 'bg-green-50' },
            { label: 'Impact', text: j.impact, color: 'bg-gold/5 border border-gold/15' },
          ].map(({ label, text, color }) => (
            <div key={label} className={`rounded-2xl p-4 ${color}`}>
              <p className="text-[10px] font-ui font-black text-ink/40 uppercase tracking-widest mb-1.5">{label}</p>
              <p className="font-body text-sm text-ink/80 leading-relaxed">{text}</p>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Sticky Section Nav ───────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'daily-tools',  label: 'Daily Tools',     icon: Zap },
  { id: 'case-law',     label: 'Case Laws',        icon: Scale },
  { id: 'digest',       label: 'Judgment Digest',  icon: FileText },
  { id: 'legal-news',   label: 'Live News',        icon: Newspaper },
  { id: 'flashcards',   label: 'Flashcards',       icon: Brain },
  { id: 'blogs',        label: 'Insights',         icon: Newspaper },
  { id: 'glossary',     label: 'Lexicon',          icon: BookOpen },
];

function StickyNav() {
  const [active, setActive] = useState('daily-tools');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Page sections" className="sticky top-[64px] z-40 bg-white/90 backdrop-blur-md border-b border-ink/8 shadow-sm">
      <div className="section-container px-4">
        <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar py-2">
          {SECTIONS.map(s => (
            <button key={s.id}
              onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-ui text-xs font-bold transition-all whitespace-nowrap ${active === s.id ? 'bg-burgundy text-white' : 'text-ink/50 hover:text-ink hover:bg-ink/5'}`}
            >
              <s.icon className="w-3.5 h-3.5" />
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

// ─── InshortsViewer (Flashcard modal) ────────────────────────────────────────
function InshortsViewer({ deck, onClose }: { deck: FlashcardDeck; onClose: () => void }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const currentCard = deck.cards[activeIdx];

  const handleNext = () => {
    if (isAnimating) return;
    if (activeIdx < deck.cards.length - 1) {
      setIsAnimating(true);
      setTimeout(() => { setActiveIdx(p => p + 1); setIsFlipped(false); setIsAnimating(false); }, 300);
    } else { onClose(); }
  };
  const handlePrev = () => {
    if (isAnimating || activeIdx === 0) return;
    setIsAnimating(true);
    setTimeout(() => { setActiveIdx(p => p - 1); setIsFlipped(false); setIsAnimating(false); }, 300);
  };
  const handleFlip = () => setIsFlipped(v => !v);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); handleFlip(); }
      if (e.code === 'ArrowRight' || e.code === 'Enter') handleNext();
      if (e.code === 'ArrowLeft') handlePrev();
      if (e.code === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIdx, isFlipped, isAnimating]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/60 backdrop-blur-md p-2 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-lg bg-parchment rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
        style={{ height: 'min(90vh, 720px)' }}
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex gap-1 px-1 pt-1 z-20">
          {deck.cards.map((_, i) => (
            <div key={i} className={`h-full rounded-full transition-all duration-500 ${i <= activeIdx ? 'bg-gold' : 'bg-ink/10'} w-full`} />
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-8 pb-4">
          <div>
            <span className="text-[10px] font-ui text-gold uppercase font-black tracking-[0.2em] mb-1 block">{deck.subject}</span>
            <h3 className="font-display text-xl text-ink leading-tight">{deck.title}</h3>
          </div>
          <button onClick={onClose} title="Close flashcard viewer" aria-label="Close flashcard viewer" className="p-4 bg-ink/5 hover:bg-ink/10 rounded-2xl text-ink/40 transition-all active:scale-90">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Card area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 relative perspective-1000">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ x: 100, opacity: 0, rotate: 5 }}
              animate={{ x: 0, opacity: 1, rotate: 0 }}
              exit={{ x: -100, opacity: 0, rotate: -5 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="w-full h-full max-h-[380px] relative cursor-pointer group"
              onClick={handleFlip}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 80 }}
                className="w-full h-full relative preserve-3d"
              >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-white border border-ink/5 rounded-[2rem] p-8 sm:p-10 flex flex-col items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.08)] group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] transition-shadow">
                  <div className="absolute top-6 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-gold/10 text-gold text-[9px] font-ui font-black uppercase tracking-widest rounded-full">Question</span>
                  </div>
                  <p className="font-display text-xl sm:text-2xl text-ink text-center leading-relaxed">{currentCard.front}</p>
                  <p className="absolute bottom-8 text-[10px] font-ui text-mutedgray flex items-center gap-2 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />Tap to reveal answer
                  </p>
                </div>
                {/* Back */}
                <div className="absolute inset-0 backface-hidden bg-[#Fdfbf7] border-2 border-gold/20 rounded-[2rem] p-8 sm:p-10 flex flex-col rotate-y-180 shadow-inner overflow-y-auto hide-scrollbar">
                  <div className="shrink-0 flex justify-center mb-6">
                    <span className="px-3 py-1 bg-burgundy/10 text-burgundy text-[9px] font-ui font-black uppercase tracking-widest rounded-full">Context & Resolution</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="font-body text-base sm:text-lg text-ink/90 text-center leading-relaxed whitespace-pre-line">{currentCard.back}</p>
                  </div>
                  {currentCard.hint && (
                    <div className="mt-6 pt-4 border-t border-gold/10 shrink-0">
                      <p className="text-[10px] font-ui text-gold/60 text-center italic leading-relaxed">Tip: {currentCard.hint}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Card stack decorations */}
          {activeIdx < deck.cards.length - 1 && (
            <div className="absolute inset-x-10 bottom-4 h-full max-h-[380px] bg-white/50 border border-ink/5 rounded-[2rem] -z-10 translate-y-3 scale-[0.96] blur-[2px]" />
          )}
          {activeIdx < deck.cards.length - 2 && (
            <div className="absolute inset-x-14 bottom-4 h-full max-h-[380px] bg-white/30 border border-ink/5 rounded-[2rem] -z-20 translate-y-6 scale-[0.92] blur-[4px]" />
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-8 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <button onClick={handlePrev} disabled={activeIdx === 0} className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border border-ink/10 rounded-2xl text-ink font-ui text-xs font-bold hover:bg-ink hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-ink transition-all active:scale-95">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button onClick={handleNext} className="flex-1 flex items-center justify-center gap-2 py-4 bg-burgundy text-parchment rounded-2xl font-ui text-xs font-bold hover:bg-burgundy-light transition-colors shadow-lg shadow-burgundy/20 active:scale-95">
              {activeIdx === deck.cards.length - 1 ? 'Finish Review' : <>Next Concept <ChevronRight className="w-4 h-4" /></>}
            </button>
          </div>
          <div className="flex items-center justify-center gap-8 pt-2">
            <div className="text-[10px] font-ui font-black text-ink/30 uppercase tracking-[0.2em]">{activeIdx + 1} of {deck.cards.length} Mastery</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Daily News Viewer ───────────────────────────────────────────────────────
function DailyNewsViewer({ news, activeIdx, setActiveIdx, onClose }: { news: LegalNews[]; activeIdx: number; setActiveIdx: (i: number) => void; onClose: () => void }) {
  const current = news[activeIdx];
  const handleNext = () => { if (activeIdx < news.length - 1) setActiveIdx(activeIdx + 1); else onClose(); };
  const handlePrev = () => { if (activeIdx > 0) setActiveIdx(activeIdx - 1); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown' || e.code === 'Space') { e.preventDefault(); handleNext(); }
      if (e.code === 'ArrowUp') { e.preventDefault(); handlePrev(); }
      if (e.code === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIdx]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/80 backdrop-blur-xl p-4 sm:p-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-parchment rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)] flex flex-col sm:h-[80vh] h-[85vh]"
      >
        {/* Progress */}
        <div className="absolute top-0 left-0 right-0 h-1 flex gap-1 px-4 pt-2 z-30">
          {news.map((_, i) => (
            <div key={i} className={`h-full rounded-full transition-all duration-500 ${i === activeIdx ? 'bg-gold w-full' : i < activeIdx ? 'bg-gold/40 w-full' : 'bg-white/20 w-full'}`} />
          ))}
        </div>

        <div className="flex-1 relative flex flex-col h-full overflow-hidden">
          {/* Image */}
          <div className="relative h-[45%] w-full">
            <AnimatePresence mode="wait">
              <motion.img
                key={current.id}
                src={current.imageUrl}
                alt={current.title}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-parchment via-transparent" />
            <div className="absolute top-8 left-8 right-8 flex items-start justify-between">
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-burgundy text-white text-[9px] font-ui font-black uppercase tracking-widest rounded-full shadow-lg">Breaking</span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[9px] font-ui font-black uppercase tracking-widest rounded-full">{current.category}</span>
              </div>
              <button onClick={onClose} title="Close news viewer" aria-label="Close news viewer" className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 bg-parchment p-8 sm:p-12 flex flex-col -mt-12 relative z-10 rounded-t-[2.5rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="flex flex-col h-full"
              >
                <div className="flex items-center gap-3 text-[10px] font-ui font-bold text-gold uppercase tracking-[0.2em] mb-4">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {current.date}</span>
                  <span className="w-1 h-1 rounded-full bg-gold/30" />
                  <span>{current.source}</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl text-ink leading-tight mb-6">{current.title}</h2>
                <p className="font-body text-base text-ink/70 leading-relaxed overflow-y-auto pr-2 custom-scrollbar">{current.summary}</p>
                <div className="mt-auto pt-8 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={handlePrev} disabled={activeIdx === 0} title="Previous story" aria-label="Previous story" className="w-12 h-12 flex items-center justify-center border border-ink/10 rounded-full text-ink disabled:opacity-20 hover:bg-ink hover:text-white transition-all">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={handleNext} title={activeIdx === news.length - 1 ? 'Close news' : 'Next story'} aria-label={activeIdx === news.length - 1 ? 'Close news' : 'Next story'} className="h-12 px-6 flex items-center justify-center bg-burgundy text-parchment rounded-full font-ui text-xs font-bold hover:bg-burgundy-light transition-colors shadow-lg shadow-burgundy/20">
                      {activeIdx === news.length - 1 ? 'Close Feed' : 'Next Story'}
                    </button>
                  </div>
                  <div className="text-[10px] font-ui font-black text-ink/30 uppercase tracking-widest">{current.readTime}</div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Deck Card ───────────────────────────────────────────────────────────────
function DeckCard({ deck, index, onOpen }: { deck: FlashcardDeck; index: number; onOpen: (d: FlashcardDeck) => void }) {
  const isPlaceholder = deck.status === 'coming-soon';
  const [deckShared, setDeckShared] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await shareContent(deck.title, '/legal-playground#flashcards');
    if (ok) { setDeckShared(true); setTimeout(() => setDeckShared(false), 2000); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      onClick={() => !isPlaceholder && onOpen(deck)}
      className={`group relative flex flex-col justify-between bg-white border border-ink/10 rounded-2xl p-5 transition-all ${isPlaceholder ? 'opacity-60 cursor-default' : 'cursor-pointer hover:border-gold/40 hover:shadow-xl hover:-translate-y-0.5'} sm:w-full w-56`}
    >
      <span className={`self-start px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest mb-3 ${difficultyStyle[deck.difficulty] ?? 'bg-slate-100 text-slate-500'}`}>{deck.difficulty}</span>
      <div className="flex-1 min-h-0">
        <h4 className="font-display text-base text-ink leading-snug line-clamp-2 group-hover:text-burgundy transition-colors mb-1">{deck.title}</h4>
        <p className="font-ui text-[11px] text-mutedgray uppercase tracking-widest">{deck.subject}</p>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-ink/5">
        <span className="flex items-center gap-1 text-[11px] font-ui text-ink/40">
          <Layers className="w-3.5 h-3.5" />{isPlaceholder ? '—' : `${deck.cards.length} cards`}
        </span>
        <div className="flex items-center gap-2">
          {!isPlaceholder && (
            <button
              onClick={handleShare}
              title="Share this deck"
              className="p-1 text-ink/20 hover:text-gold transition-colors"
            >
              {deckShared
                ? <span className="text-[9px] text-green-500 font-bold font-ui">Copied!</span>
                : <Share2 className="w-3.5 h-3.5" />
              }
            </button>
          )}
          {isPlaceholder
            ? <span className="text-[10px] font-ui text-amber-500 font-bold uppercase tracking-widest">Coming Soon</span>
            : <ChevronRight className="w-4 h-4 text-ink/30 group-hover:text-burgundy transition-colors" />
          }
        </div>
      </div>
    </motion.div>
  );
}

// ─── Article Share Button (link + IG Story + IG Post) ────────────────────────
const IG_GRADIENT = 'linear-gradient(135deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)';

async function shareFile(file: File, title: string) {
  const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title } as ShareData);
  } else {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a'); a.href = url; a.download = file.name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

function ArticleShareButton({ article }: { article: Article }) {
  const [copied, setCopied]         = useState(false);
  const [storyBusy, setStoryBusy]   = useState(false);
  const [postBusy, setPostBusy]     = useState(false);

  const handleLink = async () => {
    const ok = await shareContent(article.title, `/blog/${article.slug}`);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2500); }
  };

  const handleStory = async () => {
    setStoryBusy(true);
    try {
      const blob = await generateArticleStoryCard(article);
      if (blob) await shareFile(new File([blob], `edulaw-${article.slug}-story.png`, { type: 'image/png' }), article.title);
    } catch (_) {}
    finally { setStoryBusy(false); }
  };

  const handlePost = async () => {
    setPostBusy(true);
    try {
      const blob = await generateArticlePostCard(article);
      if (blob) await shareFile(new File([blob], `edulaw-${article.slug}-post.png`, { type: 'image/png' }), article.title);
    } catch (_) {}
    finally { setPostBusy(false); }
  };

  return (
    <div className="flex flex-wrap justify-center gap-2.5">
      {/* Share link */}
      <button
        onClick={handleLink}
        className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-ink/10 text-ink/60 rounded-xl font-ui font-black uppercase tracking-widest text-[11px] hover:border-gold hover:text-gold transition-all active:scale-95"
      >
        <Share2 className="w-3.5 h-3.5" />
        {copied ? 'Copied!' : 'Share Link'}
      </button>

      {/* IG Story */}
      <button
        onClick={handleStory}
        disabled={storyBusy}
        title="Download as Instagram Story (9:16)"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-ui font-black uppercase tracking-widest text-[11px] text-white hover:opacity-90 transition-opacity disabled:opacity-50 active:scale-95"
        style={{ background: IG_GRADIENT }}
      >
        {storyBusy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span className="text-sm">📱</span>}
        {storyBusy ? 'Generating…' : 'IG Story'}
      </button>

      {/* IG Post */}
      <button
        onClick={handlePost}
        disabled={postBusy}
        title="Download as Instagram Post (1:1)"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-ui font-black uppercase tracking-widest text-[11px] text-white hover:opacity-90 transition-opacity disabled:opacity-50 active:scale-95"
        style={{ background: IG_GRADIENT }}
      >
        {postBusy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span className="text-sm">⬜</span>}
        {postBusy ? 'Generating…' : 'IG Post'}
      </button>
    </div>
  );
}

// ─── Article Card ─────────────────────────────────────────────────────────────
function ArticleCard({ article }: { article: Article }) {
  return (
    <ExpandableCard
      title={article.title}
      description={article.category}
      src={article.featuredImage || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800'}
      className="h-full"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4 text-xs font-ui font-bold text-gold uppercase tracking-widest pb-6 border-b border-gold/10">
          <span className="flex items-center gap-2"><Calendar size={14} /> {article.createdAt?.toDate ? format(article.createdAt.toDate(), 'MMM d, yyyy') : 'Recently'}</span>
          <span className="w-1 h-1 rounded-full bg-gold/30" />
          <span className="flex items-center gap-2"><User size={14} /> {article.author || 'EduLaw Editor'}</span>
        </div>
        <div className="prose prose-slate max-w-none text-ink/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: article.content }} />
        <div className="pt-10 flex flex-wrap justify-center gap-3">
          <ArticleShareButton article={article} />
          <Link to={`/blog/${article.slug}`} className="px-8 py-3 bg-burgundy text-white rounded-xl font-ui font-black uppercase tracking-widest text-xs hover:bg-burgundy-light transition-all shadow-lg active:scale-95">
            Open Full Reading Mode
          </Link>
        </div>
      </div>
    </ExpandableCard>
  );
}

// ─── Playground Library Card (admin-added content) ───────────────────────────
const subjectBadge: Record<string, string> = {
  'Constitutional Law': 'bg-burgundy/10 text-burgundy',
  'Criminal Law': 'bg-red-100 text-red-700',
  'Criminal Procedure': 'bg-orange-100 text-orange-700',
  'Family Law': 'bg-pink-100 text-pink-700',
  'Environmental Law': 'bg-green-100 text-green-700',
  'Commercial Law': 'bg-blue-100 text-blue-700',
  'Labour Law': 'bg-teal-100 text-teal-700',
  'Property Law': 'bg-amber-100 text-amber-700',
};

function PlaygroundLibraryCard({ item }: { item: any }) {
  const [copied, setCopied] = useState(false);

  const shareText = (): string => {
    switch (item.type) {
      case 'caselaw':
        return `📚 ${item.name} (${item.year})\n${item.citation}\n\nRatio: ${item.ratio}\n\nSignificance: ${item.significance}\n\n#EduLaw #LegalStudy #IndianLaw`;
      case 'maxim':
        return `⚖️ "${item.maxim}"\n\nMeaning: ${item.meaning}\n\nUsage: ${item.usage}\n\nMemory Hook: ${item.memoryHook}\n\n#LegalMaxim #EduLaw`;
      case 'constitution':
        return `📜 ${item.article} — ${item.title}\n${item.part}\n\n${item.plainLanguage}\n\nKey Point: ${item.keyPoint}\n\n#Constitution #EduLaw`;
      case 'quiz':
        return `❓ Quiz: ${item.q}\n\nOptions:\n${item.options.map((o: string, i: number) => `${String.fromCharCode(65+i)}. ${o}`).join('\n')}\n\nAnswer: ${String.fromCharCode(65+item.correct)} — ${item.explanation}\n\n#LegalQuiz #EduLaw`;
      case 'digest':
        return `🏛️ ${item.title}\n${item.court} | ${item.date}\n\nHeld: ${item.held}\n\nImpact: ${item.impact}\n\n#JudgmentDigest #EduLaw`;
      default: return '';
    }
  };

  const handleShare = async () => {
    const text = shareText();
    if (navigator.share) {
      try { await navigator.share({ text }); return; } catch { /* fall through */ }
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const subjectColor = subjectBadge[item.subject] ?? 'bg-slate-100 text-slate-600';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 hover:shadow-card transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {item.type === 'caselaw' && <p className="font-display text-sm text-ink leading-snug">{item.name}</p>}
          {item.type === 'maxim' && <p className="font-display text-sm text-ink leading-snug italic">"{item.maxim}"</p>}
          {item.type === 'constitution' && <p className="font-display text-sm text-ink leading-snug">{item.article} — {item.title}</p>}
          {item.type === 'quiz' && <p className="font-display text-sm text-ink leading-snug">{item.q}</p>}
          {item.type === 'digest' && <p className="font-display text-sm text-ink leading-snug">{item.title}</p>}
        </div>
        {item.subject && (
          <span className={`shrink-0 text-[10px] font-ui font-bold px-2 py-0.5 rounded-full ${subjectColor}`}>
            {item.subject.split(' / ')[0]}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="text-xs font-ui text-slate-600 leading-relaxed flex-1">
        {item.type === 'caselaw' && <><p className="text-[10px] text-slate-400 mb-1">{item.citation} · {item.court}</p><p className="line-clamp-3">{item.ratio}</p></>}
        {item.type === 'maxim' && <><p className="font-semibold text-slate-700 mb-1">{item.meaning}</p><p className="line-clamp-2 text-slate-500">{item.memoryHook}</p></>}
        {item.type === 'constitution' && <><p className="text-[10px] text-slate-400 mb-1">{item.part}</p><p className="line-clamp-3">{item.plainLanguage}</p></>}
        {item.type === 'quiz' && <div className="space-y-0.5">{item.options?.map((o: string, i: number) => (<p key={i} className={i === item.correct ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>{String.fromCharCode(65+i)}. {o}{i === item.correct ? ' ✓' : ''}</p>))}</div>}
        {item.type === 'digest' && <><p className="text-[10px] text-slate-400 mb-1">{item.court} · {item.date}</p><p className="line-clamp-3">{item.held}</p></>}
      </div>

      {/* Share & View CTA */}
      <div className="flex gap-2">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-parchment border border-gold/30 text-[10px] font-ui font-semibold text-gold hover:bg-gold/10 hover:border-gold transition-all active:scale-95"
        >
          {copied
            ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Copied!</>
            : <><Share2 className="w-3.5 h-3.5" /> Share</>
          }
        </button>
        {item.type !== 'quiz' && (
          <Link
            to={`/legal-playground/${item.type === 'caselaw' ? 'case-law' : item.type}/${item.slug || item.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gold text-white text-[10px] font-ui font-bold uppercase tracking-wider hover:bg-gold-light transition-all active:scale-95 shadow-sm"
          >
            <ExternalLink className="w-3 h-3" /> View Archive
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function LegalPlayground() {
  const [articles, setArticles]               = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [decks, setDecks]                     = useState<FlashcardDeck[]>([]);
  const [decksLoading, setDecksLoading]       = useState(true);
  const [selectedDeck, setSelectedDeck]       = useState<FlashcardDeck | null>(null);
  const [glossarySearch, setGlossarySearch]   = useState('');
  const [selectedLetter, setSelectedLetter]   = useState('All');
  const [showAllTerms, setShowAllTerms]       = useState(false);
  const [newsViewerIdx, setNewsViewerIdx]     = useState<number | null>(null);
  const [pgContent, setPgContent]             = useState<any[]>([]);

  // Load admin-added playground content from Firestore
  useEffect(() => {
    async function loadPlaygroundContent() {
      try {
        const snap = await getDocs(collection(db, 'playground_content'));
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort descending by createdAt client-side (avoids needing a Firestore index)
        data.sort((a: any, b: any) => {
          const ta = a.createdAt?.toMillis?.() ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? 0;
          return tb - ta;
        });
        setPgContent(data);
      } catch (err) {
        console.error('Playground content error:', err);
      }
    }
    loadPlaygroundContent();
  }, []);

  // Load articles
  useEffect(() => {
    async function loadArticles() {
      setArticlesLoading(true);
      try {
        const q = query(collection(db, 'blog_articles'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Article[];
        setArticles(data.filter(a => a.status === 'published'));
      } catch (err) {
        console.error('Playground articles error:', err);
      } finally {
        setArticlesLoading(false);
      }
    }
    loadArticles();
  }, []);

  // Load decks
  useEffect(() => {
    async function loadDecks() {
      setDecksLoading(true);
      try {
        const q = query(collection(db, 'flashcard_decks'), orderBy('title'), limit(12));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as FlashcardDeck[];
        setDecks(data.length > 0 ? data : PLACEHOLDER_DECKS);
      } catch (err) {
        console.error('Playground decks error:', err);
        setDecks(PLACEHOLDER_DECKS);
      } finally {
        setDecksLoading(false);
      }
    }
    loadDecks();
  }, []);

  // Category grouping
  const articlesByCategory: Record<string, Article[]> = {};
  for (const a of articles) {
    const cat = FIXED_BLOG_CATEGORIES.includes(a.category) ? a.category : 'Other Insights';
    if (!articlesByCategory[cat]) articlesByCategory[cat] = [];
    articlesByCategory[cat].push(a);
  }
  const activeBlogCategories = [
    ...FIXED_BLOG_CATEGORIES.filter(c => (articlesByCategory[c]?.length ?? 0) > 0),
    ...(articlesByCategory['Other Insights']?.length ? ['Other Insights'] : []),
  ];

  // Glossary
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const filteredTerms = glossaryData.filter(t => {
    const matchSearch = t.term.toLowerCase().includes(glossarySearch.toLowerCase()) || t.definition.toLowerCase().includes(glossarySearch.toLowerCase());
    const matchLetter = selectedLetter === 'All' || t.term.startsWith(selectedLetter);
    return matchSearch && matchLetter;
  });
  const displayTerms = showAllTerms ? filteredTerms : filteredTerms.slice(0, 5);
  const hiddenCount  = filteredTerms.length - 5;

  // Daily case laws
  const dailyCaseLaws = useMemo(() => getDailyCaseLaws(), []);
  const countdown     = useCountdownToMidnight();
  const [caseLawSharingId, setCaseLawSharingId] = useState<string | null>(null);
  const [caseLawCopiedId, setCaseLawCopiedId]   = useState<string | null>(null);
  const { toggle: toggleCaseLawBookmark, isBookmarked: isCaseLawBookmarked } = useBookmarks();

  const handleCaseLawShare = async (c: CaseLaw) => {
    if (caseLawSharingId) return;
    setCaseLawSharingId(c.id);
    try {
      const blob = await generateCaseLawStoryCard(c);
      if (blob) await shareFile(new File([blob], `edulaw-caselaw-${c.id}.png`, { type: 'image/png' }), c.name);
    } catch (_) {}
    finally { setCaseLawSharingId(null); }
  };

  const handleCaseLawCopy = (c: CaseLaw) => {
    const text = `${c.name}\n${c.citation} · ${c.court} · ${c.year}\n\nRatio Decidendi: ${c.ratio}\n\nWhy It Matters: ${c.significance}`;
    navigator.clipboard.writeText(text).then(() => {
      setCaseLawCopiedId(c.id);
      setTimeout(() => setCaseLawCopiedId(null), 2000);
    });
  };

  // Section refs (kept for section rendering; hero uses id-based anchor navigation)
  const dailyRef      = useRef<HTMLElement>(null);
  const caseRef       = useRef<HTMLElement>(null);
  const flashcardsRef = useRef<HTMLElement>(null);
  const blogsRef      = useRef<HTMLElement>(null);
  const glossaryRef   = useRef<HTMLElement>(null);
  const scrollToId = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${id}`);
  };

  return (
    <div className="min-h-screen bg-parchment pt-20">
      {/* ── SEO ─────────────────────────────────────────────────────────── */}
      <SEO
        title="Legal Playground — Free Interactive Law Study Tools for Indian Students"
        description="Free daily legal quiz, constitution article of the day, legal maxims, case law digest, weekly judgment digest, Indian legal timeline, flashcard decks, and a legal glossary — built for LLB, LLM, CLAT PG &amp; Judiciary aspirants."
        canonical="/legal-playground"
        ogImage="/og-playground.png"
      />
      {/* JSON-LD Structured Data */}
      <Helmet>
        <meta name="keywords" content="legal playground, law flashcards India, legal news India, landmark judgments, legal glossary, CLAT PG preparation, judiciary notes, LLB study material, free law study tools" />
        <script type="application/ld+json">{JSON.stringify(JSON_LD_BREADCRUMB)}</script>
        <script type="application/ld+json">{JSON.stringify(JSON_LD_LEARNING)}</script>
        <script type="application/ld+json">{JSON.stringify(JSON_LD_FAQ)}</script>
      </Helmet>

      {/* ── NEWS RIBBON ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-ink/5 py-4 relative z-50">
        <div className="section-container px-4">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="px-3 py-1 bg-burgundy/10 text-burgundy rounded-full font-ui text-[9px] font-black uppercase tracking-widest shrink-0">Live Updates</div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <motion.div
                  animate={{ x: [0, -1000] }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  className="flex gap-12 whitespace-nowrap"
                >
                  {DAILY_NEWS.map((n, i) => (
                    <button key={n.id} onClick={() => setNewsViewerIdx(i)} className="text-xs font-ui font-medium text-ink/60 hover:text-burgundy transition-colors">
                      <span className="text-gold mr-2 font-bold">●</span> {n.title}
                    </button>
                  ))}
                </motion.div>
              </div>
            </div>
            <button
              onClick={() => setNewsViewerIdx(0)}
              className="flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold rounded-xl font-ui text-[10px] font-black uppercase tracking-widest hover:bg-gold hover:text-ink transition-all shadow-sm shrink-0"
            >
              Read News <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ── STICKY NAV ───────────────────────────────────────────────────── */}
      <StickyNav />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative py-12 sm:py-20 border-b border-ink/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-teal-500/5 -skew-x-12 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none" />

        <div className="section-container relative z-10 px-4">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 text-teal-700 rounded-full font-ui text-[10px] font-black uppercase tracking-widest mb-6"
            >
              <Zap className="w-3 h-3" /> Legal Playground · Free
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl text-ink leading-[1.1] mb-6"
            >
              Learn Law by <span className="text-burgundy italic">Doing.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-body text-base sm:text-lg text-ink/70 leading-relaxed mb-10 max-w-2xl"
            >
              Free interactive tools for Indian law students — flip through flashcard decks, explore landmark judgments, follow live legal updates, and drill the legal dictionary. Built for LLB, LLM, CLAT&nbsp;PG, and Judiciary aspirants.
            </motion.p>

            {/* Jump-to links */}
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              aria-label="Jump to section"
              className="flex flex-wrap gap-2 sm:gap-4"
            >
              {[
                { label: 'Daily Tools',     icon: Zap,       id: 'daily-tools' },
                { label: 'Case Laws',       icon: Scale,     id: 'case-law' },
                { label: 'Legal News',      icon: Newspaper, id: 'legal-news' },
                { label: 'Flashcards',      icon: Brain,     id: 'flashcards' },
                { label: 'Insights',        icon: Newspaper, id: 'blogs' },
                { label: 'Lexicon',         icon: BookOpen,  id: 'glossary' },
              ].map(item => (
                <a
                  key={item.label}
                  href={`#${item.id}`}
                  onClick={(e) => { e.preventDefault(); scrollToId(item.id); }}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-ui text-sm font-bold bg-white/50 text-ink/60 hover:bg-white hover:text-ink border border-ink/5 transition-all"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </a>
              ))}
            </motion.nav>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          DAILY TOOLS — Quiz · Constitution Article · Legal Maxim
      ══════════════════════════════════════════════════════════════════ */}
      <section ref={dailyRef} id="daily-tools" aria-labelledby="daily-tools-heading" className="py-16 sm:py-20 border-b border-ink/10 scroll-mt-[112px]">
        <div className="section-container px-4">
          <header className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/20 text-[#7a5c1e] rounded-full font-ui text-[10px] font-black uppercase tracking-widest mb-4">
              <Zap className="w-3 h-3" /> Daily Rotating Content
            </div>
            <h2 id="daily-tools-heading" className="font-display text-3xl sm:text-4xl text-ink">Fresh Every Day</h2>
            <p className="font-body text-ink/60 mt-2 text-sm sm:text-base">Quiz yourself, spotlight a Constitution Article, and learn a maxim — all auto-refreshed at midnight.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Quiz (spans full on mobile, 1 col on lg) */}
            <div className="lg:col-span-1">
              <QuizOfTheDay />
            </div>
            {/* Right: Article + Maxim stacked */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ConstitutionArticleCard />
              <LegalMaximCard />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 0 — CASE LAW OF THE DAY
      ══════════════════════════════════════════════════════════════════ */}
      <section ref={caseRef} id="case-law" aria-labelledby="caselaw-heading" className="py-16 sm:py-20 border-b border-ink/10 scroll-mt-[112px]">
        <div className="section-container px-4">
          {/* Heading row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-burgundy/10 text-burgundy rounded-full font-ui text-[10px] font-black uppercase tracking-widest mb-4">
                <Scale className="w-3 h-3" /> Case Law of the Day
              </div>
              <h2 id="caselaw-heading" className="font-display text-3xl sm:text-4xl text-ink">Today's 3 Cases</h2>
              <p className="font-body text-ink/60 mt-2 text-sm sm:text-base">Three landmark judgments, refreshed daily — same for every student, everywhere.</p>
            </div>
            {/* Countdown */}
            <div className="flex items-center gap-3 px-5 py-3 bg-white border border-ink/10 rounded-2xl shadow-sm shrink-0">
              <RefreshCw className="w-4 h-4 text-gold shrink-0" />
              <div className="text-center">
                <p className="text-[9px] font-ui font-black uppercase tracking-widest text-ink/40 mb-0.5">Next refresh in</p>
                <p className="font-display text-lg text-ink tabular-nums leading-none">
                  {String(countdown.hours).padStart(2, '0')}
                  <span className="text-gold animate-pulse">:</span>
                  {String(countdown.minutes).padStart(2, '0')}
                  <span className="text-gold animate-pulse">:</span>
                  {String(countdown.seconds).padStart(2, '0')}
                </p>
              </div>
            </div>
          </div>

          {/* Case cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dailyCaseLaws.map((caselaw, idx) => (
              <motion.article
                key={caselaw.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.12 }}
                className="group relative bg-white border border-ink/10 rounded-2xl p-6 hover:border-burgundy/30 hover:shadow-xl transition-all flex flex-col gap-4"
              >
                {/* Day label */}
                <div className="absolute top-5 right-5 w-8 h-8 rounded-full bg-parchment border border-ink/10 flex items-center justify-center">
                  <span className="font-display text-sm text-ink/40">{idx + 1}</span>
                </div>

                {/* Subject badge */}
                <span className={`self-start px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${subjectColors[caselaw.subject] ?? 'bg-slate-100 text-slate-600'}`}>
                  {caselaw.subject}
                </span>

                {/* Case name */}
                <div>
                  <h3 className="font-display text-lg text-ink leading-snug group-hover:text-burgundy transition-colors mb-1">
                    {caselaw.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] font-ui text-mutedgray">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>{caselaw.court} · {caselaw.year}</span>
                  </div>
                  <div className="mt-1 text-[10px] font-ui text-ink/40 font-medium">{caselaw.citation}</div>
                </div>

                {/* Ratio */}
                <div className="flex-1">
                  <p className="text-[10px] font-ui font-black text-gold uppercase tracking-widest mb-1.5">Ratio Decidendi</p>
                  <p className="font-body text-sm text-ink/80 leading-relaxed">{caselaw.ratio}</p>
                </div>

                {/* Significance */}
                <div className="pt-4 border-t border-ink/5">
                  <p className="text-[10px] font-ui font-black text-ink/40 uppercase tracking-widest mb-1.5">Why It Matters</p>
                  <p className="font-body text-xs text-ink/60 leading-relaxed">{caselaw.significance}</p>
                </div>

                {/* Utility row: Copy + Bookmark + Share */}
                <div className="flex items-center gap-1.5 mt-1">
                  <button
                    onClick={() => handleCaseLawCopy(caselaw)}
                    title="Copy to clipboard"
                    className="flex items-center gap-1 px-2.5 py-2 rounded-xl border border-ink/10 hover:bg-ink/5 transition-colors font-ui text-[10px] text-ink/50"
                  >
                    {caseLawCopiedId === caselaw.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    {caseLawCopiedId === caselaw.id ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={() => toggleCaseLawBookmark(caselaw.id)}
                    title={isCaseLawBookmarked(caselaw.id) ? 'Remove bookmark' : 'Bookmark'}
                    className="flex items-center gap-1 px-2.5 py-2 rounded-xl border border-ink/10 hover:bg-ink/5 transition-colors font-ui text-[10px] text-ink/50"
                  >
                    {isCaseLawBookmarked(caselaw.id) ? <BookMarked className="w-3 h-3 text-burgundy" /> : <Bookmark className="w-3 h-3" />}
                    {isCaseLawBookmarked(caselaw.id) ? 'Saved' : 'Save'}
                  </button>
                  <button
                    onClick={() => handleCaseLawShare(caselaw)}
                    disabled={caseLawSharingId !== null}
                    style={{ background: IG_GRADIENT }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-ui font-black uppercase tracking-widest text-[10px] text-white disabled:opacity-50 active:scale-95 transition-transform"
                  >
                    {caseLawSharingId === caselaw.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <span>📱</span>}
                    {caseLawSharingId === caselaw.id ? 'Generating…' : 'Share Story'}
                  </button>

                  <Link
                    to={`/legal-playground/case-law/${caselaw.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gold text-gold font-ui font-black uppercase tracking-widest text-[10px] hover:bg-gold/5 transition-all"
                  >
                    Details
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          WEEKLY JUDGMENT DIGEST
      ══════════════════════════════════════════════════════════════════ */}
      <section id="digest" aria-labelledby="digest-heading" className="py-16 sm:py-20 border-b border-ink/10 scroll-mt-[112px]">
        <div className="section-container px-4">
          <header className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 text-teal-700 rounded-full font-ui text-[10px] font-black uppercase tracking-widest mb-4">
              <FileText className="w-3 h-3" /> Deep Dives
            </div>
            <h2 id="digest-heading" className="font-display text-3xl sm:text-4xl text-ink">Daily Judgment Digest</h2>
            <p className="font-body text-ink/60 mt-2 text-sm sm:text-base">5 fresh SC &amp; HC rulings every day — broken into Facts → Issue → Held → Impact, the format used in moot courts and exams.</p>
          </header>
          <WeeklyDigest />

          {/* Judiciary exam prep CTA */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-5 p-6 bg-teal-50 border border-teal-200 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center shrink-0">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-display text-lg text-ink leading-tight mb-1">Preparing for Judiciary Exams?</p>
                <p className="font-body text-sm text-ink/60 leading-relaxed">
                  Structured notes on Criminal Law, CPC, Evidence Act &amp; Constitutional Law — crafted for PCS-J and HJS aspirants.
                </p>
              </div>
            </div>
            <Link
              to="/marketplace?q=judiciary"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-ui font-black text-sm hover:bg-teal-700 transition-all shadow-md whitespace-nowrap"
            >
              Explore Judiciary Bundle <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          DAILY LEGAL NEWS
      ══════════════════════════════════════════════════════════════════ */}
      <section id="legal-news" aria-labelledby="news-heading" className="py-16 sm:py-20 border-b border-ink/10 scroll-mt-[112px]">
        <div className="section-container px-4">
          <header className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded-full font-ui text-[10px] font-black uppercase tracking-widest mb-4">
              <Newspaper className="w-3 h-3" /> Live Updates
            </div>
            <h2 id="news-heading" className="font-display text-3xl sm:text-4xl text-ink">Daily Legal News</h2>
            <p className="font-body text-ink/60 mt-2 text-sm sm:text-base">
              20 SC &amp; HC updates curated daily — real headlines from LiveLaw &amp; Bar and Bench, refreshed every morning at 10:30 AM IST.
            </p>
          </header>
          <DailyLegalNews />
        </div>
      </section>

      {/* ── MARKETPLACE BRIDGE BANNER ─────────────────────────────────── */}
      <div className="bg-gradient-to-r from-burgundy to-burgundy-light text-white py-10 sm:py-12">
        <div className="section-container px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <p className="font-display text-2xl sm:text-3xl mb-1.5">
                Free is great. <span className="text-gold">Premium is better.</span>
              </p>
              <p className="font-body text-sm text-white/65">
                Detailed notes, mock tests &amp; expert analysis — everything you need to top your exams.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0 justify-center">
              <Link to="/marketplace" className="inline-flex items-center gap-2 px-5 py-3 bg-gold text-ink rounded-xl font-ui font-black text-sm hover:bg-gold/80 transition-all shadow-lg shadow-black/20">
                <ShoppingBag className="w-4 h-4" /> Browse Notes
              </Link>
              <Link to="/mock-tests" className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 text-white border border-white/20 rounded-xl font-ui font-black text-sm hover:bg-white/20 transition-all">
                Mock Tests
              </Link>
              <Link to="/subscription" className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 text-white border border-white/20 rounded-xl font-ui font-black text-sm hover:bg-white/20 transition-all">
                Subscription Plans
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 1 — KNOWLEDGE CARDS (Flashcards)
      ══════════════════════════════════════════════════════════════════ */}
      <section ref={flashcardsRef} id="flashcards" aria-labelledby="flashcards-heading" className="py-16 sm:py-20 border-b border-ink/10 scroll-mt-[112px]" style={{scrollMarginTop:'112px'}}>
        <div className="section-container px-4">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-burgundy/10 text-burgundy rounded-full font-ui text-[10px] font-black uppercase tracking-widest mb-4">
              <Brain className="w-3 h-3" /> Knowledge Cards
            </div>
            <h2 id="flashcards-heading" className="font-display text-3xl sm:text-4xl text-ink">Knowledge Cards</h2>
            <p className="font-body text-ink/60 mt-2 text-sm sm:text-base">Bite-sized legal concepts to ace your exams</p>
          </header>

          {decksLoading ? (
            <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-2">
              {[1, 2, 3, 4].map(i => <div key={i} className="shrink-0 w-56 h-44 bg-white/60 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <>
              <div className="sm:hidden flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                {decks.map((deck, idx) => <DeckCard key={deck.id} deck={deck} index={idx} onOpen={setSelectedDeck} />)}
              </div>
              <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
                {decks.map((deck, idx) => <DeckCard key={deck.id} deck={deck} index={idx} onOpen={setSelectedDeck} />)}
              </div>

              {/* Subject-level deep dive links */}
              <div className="mt-10 pt-8 border-t border-ink/8">
                <p className="font-ui text-sm text-ink/50 font-bold mb-4 text-center">Want to go deeper? Get full subject notes →</p>
                <div className="flex flex-wrap justify-center gap-2.5">
                  {[
                    { label: 'Contract Law Notes', path: '/marketplace?q=contract+law' },
                    { label: 'Constitutional Law Notes', path: '/marketplace?q=constitutional+law' },
                    { label: 'Criminal Law Notes', path: '/marketplace?q=criminal+law' },
                    { label: 'Civil Procedure Notes', path: '/marketplace?q=cpc' },
                    { label: 'Company Law Notes', path: '/marketplace?q=company+law' },
                    { label: 'View All 46+ Subjects', path: '/marketplace' },
                  ].map(item => (
                    <Link key={item.label} to={item.path}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-ink/10 rounded-xl font-ui text-xs font-bold text-ink/60 hover:border-gold hover:text-gold transition-all shadow-sm"
                    >
                      {item.label} <ArrowRight className="w-3 h-3" />
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 2 — LEGAL INSIGHTS (Articles)
      ══════════════════════════════════════════════════════════════════ */}
      <section ref={blogsRef} id="blogs" aria-labelledby="blogs-heading" className="py-16 sm:py-20 border-b border-ink/10 scroll-mt-[112px]">
        <div className="section-container px-4">
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Sidebar */}
            <aside className="lg:col-span-3">
              <div className="sticky top-28 space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/20 text-[#7a5c1e] rounded-full font-ui text-[10px] font-black uppercase tracking-widest mb-4">
                    <Newspaper className="w-3 h-3" /> Area of Knowledge
                  </div>
                  <h2 id="blogs-heading" className="font-display text-3xl text-ink">Legal Insights</h2>
                </div>
                <nav aria-label="Blog categories" className="flex flex-col gap-1.5">
                  {activeBlogCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => document.getElementById(`blog-cat-${slugifyCategory(cat)}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                      className="group flex items-center justify-between px-4 py-3 rounded-xl font-ui text-sm font-bold text-ink/60 hover:text-burgundy hover:bg-burgundy/5 transition-all text-left"
                    >
                      <span className="truncate">{cat}</span>
                      <span className="px-2 py-0.5 bg-ink/5 text-ink/40 group-hover:bg-burgundy/10 group-hover:text-burgundy rounded-full text-[10px] transition-colors">
                        {articlesByCategory[cat]?.length || 0}
                      </span>
                    </button>
                  ))}
                  {activeBlogCategories.length === 0 && !articlesLoading && (
                    <p className="text-xs text-mutedgray italic px-4">New highlights being published soon...</p>
                  )}
                </nav>
              </div>
            </aside>

            {/* Articles */}
            <div className="lg:col-span-9 space-y-20">
              {articlesLoading ? (
                <div className="space-y-12">
                  {[1, 2].map(i => (
                    <div key={i} className="animate-pulse space-y-4">
                      <div className="h-5 bg-white/60 rounded w-48" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2].map(j => <div key={j} className="w-full h-72 bg-white/40 rounded-2xl" />)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeBlogCategories.length === 0 ? (
                <div className="text-center py-24 text-mutedgray bg-white/30 rounded-3xl border border-dashed border-ink/10">
                  <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-ui text-sm">No articles published yet. Check back soon.</p>
                </div>
              ) : (
                activeBlogCategories.map(cat => (
                  <div key={cat} id={`blog-cat-${slugifyCategory(cat)}`} className="scroll-mt-[130px]">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="h-px bg-gold/20 flex-1 hidden sm:block" />
                      <h3 className="font-display text-xl sm:text-2xl text-ink px-4 bg-parchment relative z-10">{cat}</h3>
                      <div className="h-px bg-gold/20 flex-1 hidden sm:block" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {(articlesByCategory[cat] ?? []).map(article => (
                        <ArticleCard key={article.id} article={article} />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 3 — LEGAL LEXICON (Glossary)
      ══════════════════════════════════════════════════════════════════ */}
      <section ref={glossaryRef} id="glossary" aria-labelledby="glossary-heading" className="py-16 sm:py-20 scroll-mt-[112px]">
        <div className="section-container px-4">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-burgundy/10 text-burgundy rounded-full font-ui text-[10px] font-black uppercase tracking-widest mb-4">
              <BookOpen className="w-3 h-3" /> Legal Lexicon
            </div>
            <h2 id="glossary-heading" className="font-display text-3xl sm:text-4xl text-ink">Legal Lexicon</h2>
            <p className="font-body text-ink/60 mt-2 text-sm sm:text-base">Master the language of law</p>
          </header>

          {/* Search */}
          <div className="relative max-w-lg mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-mutedgray w-5 h-5" />
            <input
              type="search"
              placeholder="Search the legal dictionary..."
              aria-label="Search legal terms"
              value={glossarySearch}
              onChange={e => { setGlossarySearch(e.target.value); setShowAllTerms(false); }}
              className="w-full bg-white border border-ink/10 rounded-2xl pl-12 pr-6 py-4 font-ui text-sm focus:outline-none focus:border-gold shadow-sm transition-all"
            />
          </div>

          {/* A–Z picker */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-10" role="group" aria-label="Filter by letter">
            <button
              onClick={() => { setSelectedLetter('All'); setShowAllTerms(false); }}
              className={`px-3 py-1.5 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl font-ui text-xs font-bold transition-all ${selectedLetter === 'All' ? 'bg-gold text-ink' : 'bg-white text-ink/40 hover:text-gold'}`}
            >
              All
            </button>
            {alphabet.map(l => (
              <button
                key={l}
                onClick={() => { setSelectedLetter(l); setShowAllTerms(false); }}
                className={`w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center rounded-xl font-ui text-xs font-bold transition-all ${selectedLetter === l ? 'bg-gold text-ink' : 'bg-white text-ink/40 hover:text-gold'}`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Terms */}
          {filteredTerms.length === 0 ? (
            <div className="text-center py-16 text-mutedgray">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-ui text-sm">No glossary terms found matching your filter.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 max-w-3xl">
                {displayTerms.map((t, idx) => (
                  <motion.article
                    key={t.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="bg-white border border-ink/10 rounded-2xl px-6 py-5 hover:border-gold/30 hover:shadow-lg transition-all group"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-display text-lg text-ink group-hover:text-burgundy transition-colors">{t.term}</h3>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${originStyle[t.origin] || originStyle.Other}`}>{t.origin}</span>
                      <span className="px-2 py-0.5 bg-ink/5 text-ink/50 rounded-md text-[10px] font-ui uppercase tracking-widest">{t.category}</span>
                    </div>
                    <p className="font-body text-sm text-ink/70 leading-relaxed line-clamp-3 mb-2">{t.definition}</p>
                    {t.usageExample && (
                      <p className="text-xs text-mutedgray italic border-t border-ink/5 pt-3 mt-3 line-clamp-2">"{t.usageExample}"</p>
                    )}
                  </motion.article>
                ))}
              </div>

              {filteredTerms.length > 5 && (
                <div className="mt-8 max-w-3xl">
                  <button
                    onClick={() => setShowAllTerms(v => !v)}
                    className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-parchment border-2 border-ink/10 rounded-xl font-ui font-bold text-sm text-ink hover:border-gold/50 hover:bg-white transition-all shadow-sm"
                  >
                    {showAllTerms ? <>Show less <ChevronUp className="w-4 h-4" /></> : <>Show {hiddenCount} more {hiddenCount === 1 ? 'term' : 'terms'} <ChevronDown className="w-4 h-4" /></>}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── FOOTER CTA ───────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-ink text-parchment">
        <div className="section-container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/20 text-gold rounded-full font-ui text-[10px] font-black uppercase tracking-widest mb-6">
              <ShoppingBag className="w-3 h-3" /> EduLaw Marketplace
            </div>
            <p className="font-display text-3xl sm:text-4xl mb-5">
              You've Played. Now <span className="text-gold">Prepare.</span>
            </p>
            <p className="font-body text-base text-parchment/60 leading-relaxed mb-10 max-w-xl mx-auto">
              The Playground shows you what you need to know. The Marketplace gives you everything you need to master it — detailed notes, full-subject bundles, and mock test sets built for LLB, LLM, CLAT&nbsp;PG, and Judiciary.
            </p>

            {/* 3-column CTA grid */}
            <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
              {[
                { label: 'Notes Library', sub: '46+ subjects covered', to: '/marketplace', icon: BookOpen, highlight: true },
                { label: 'Mock Tests', sub: 'MCQ practice sets', to: '/mock-tests', icon: HelpCircle, highlight: false },
                { label: 'Subscription', sub: 'Unlimited access plans', to: '/subscription', icon: Award, highlight: false },
              ].map(item => (
                <Link key={item.label} to={item.to}
                  className={`flex flex-col items-center gap-2.5 p-6 rounded-2xl border transition-all ${item.highlight ? 'bg-gold text-ink border-gold hover:bg-gold/80' : 'bg-white/5 text-parchment border-white/10 hover:bg-white/10'}`}
                >
                  <item.icon className={`w-7 h-7 ${item.highlight ? 'text-ink' : 'text-gold'}`} />
                  <p className="font-ui font-black text-sm">{item.label}</p>
                  <p className={`text-[11px] font-ui ${item.highlight ? 'text-ink/70' : 'text-parchment/50'}`}>{item.sub}</p>
                </Link>
              ))}
            </div>

            <p className="font-ui text-[11px] text-parchment/30">
              India's most comprehensive legal notes platform · 10K+ students · 4.9★ rated
            </p>
          </div>
        </div>
      </section>

      {/* ── Playground Library (admin-added content) ─────────────────────────── */}
      {pgContent.length > 0 && (
        <section className="py-14 px-4 sm:px-6 bg-[#FDFBF7]">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-xl bg-burgundy/10 flex items-center justify-center">
                <BookMarked className="w-4 h-4 text-burgundy" />
              </div>
              <div>
                <h2 className="font-display text-2xl text-ink">Playground Library</h2>
                <p className="text-sm font-ui text-slate-500">Curated additions — tap any card to share</p>
              </div>
            </div>

            {(['caselaw', 'maxim', 'constitution', 'quiz', 'digest'] as const).map(type => {
              const typeItems = pgContent.filter(i => i.type === type);
              if (typeItems.length === 0) return null;
              const typeLabel: Record<string, string> = {
                caselaw: 'Case Laws', maxim: 'Legal Maxims', constitution: 'Constitution Articles', quiz: 'Quiz Questions', digest: 'Judgment Digests',
              };
              return (
                <div key={type} className="mb-10">
                  <h3 className="font-ui font-bold text-xs uppercase tracking-widest text-slate-400 mb-3">{typeLabel[type]}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {typeItems.map(item => (
                      <PlaygroundLibraryCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Modals */}
      <AnimatePresence>
        {selectedDeck && <InshortsViewer deck={selectedDeck} onClose={() => setSelectedDeck(null)} />}
        {newsViewerIdx !== null && (
          <DailyNewsViewer
            news={DAILY_NEWS}
            activeIdx={newsViewerIdx}
            setActiveIdx={setNewsViewerIdx}
            onClose={() => setNewsViewerIdx(null)}
          />
        )}
      </AnimatePresence>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .perspective-1000 { perspective: 1000px; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}

export default LegalPlayground;
