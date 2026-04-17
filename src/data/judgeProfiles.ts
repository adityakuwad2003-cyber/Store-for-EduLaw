export interface JudgeProfile {
  id:           string;
  name:         string;
  years:        string;
  philosophy:   string;
  landmarkCase: string;
  caseNote:     string;
  areas:        string[];
  badge?:       string;
}

export const JUDGE_PROFILES: JudgeProfile[] = [
  {
    id: 'dyc',
    name: 'Justice D.Y. Chandrachud',
    years: '2016–2024 (50th CJI)',
    philosophy: 'Substantive equality — law must account for structural disadvantage, not merely formal sameness.',
    landmarkCase: 'K.S. Puttaswamy v. Union of India (2017)',
    caseNote: 'Led the unanimous 9-judge bench that declared privacy a fundamental right under Article 21, reshaping digital rights jurisprudence.',
    areas: ['Constitutional Law', 'Fundamental Rights', 'Privacy', 'Gender', 'Digital Rights', 'Criminal Law'],
    badge: 'CJI',
  },
  {
    id: 'yvc',
    name: 'Justice Y.V. Chandrachud',
    years: '1978–1985 (16th CJI)',
    philosophy: 'Personal liberty is supreme; the state must justify every curtailment with precision.',
    landmarkCase: 'Maneka Gandhi v. Union of India (1978)',
    caseNote: 'Expanded Article 21 to require any procedure depriving personal liberty be fair, just, and reasonable — transforming it from a procedural to a substantive guarantee.',
    areas: ['Fundamental Rights', 'Constitutional Law', 'Criminal Procedure', 'Bail'],
    badge: 'CJI',
  },
  {
    id: 'vki',
    name: 'Justice V.R. Krishna Iyer',
    years: '1973–1980',
    philosophy: 'Law must serve the poor — bail, sentencing, and procedure must not favour the wealthy over the vulnerable.',
    landmarkCase: 'Motiram v. State of M.P. (1978)',
    caseNote: 'Established that bail surety conditions must be within the accused\'s financial means — making onerous bail amounts tantamount to a denial of bail.',
    areas: ['Criminal Law', 'Criminal Procedure', 'Bail', 'Prisoner Rights', 'Evidence Law'],
  },
  {
    id: 'pnb',
    name: 'Justice P.N. Bhagwati',
    years: '1973–1986 (17th CJI)',
    philosophy: 'Access to justice is a fundamental right — courts must reach citizens, not wait for them to arrive.',
    landmarkCase: 'S.P. Gupta v. Union of India (1982)',
    caseNote: 'Pioneered Public Interest Litigation, allowing any public-spirited citizen to approach the Supreme Court for constitutional redress on behalf of the marginalized.',
    areas: ['Constitutional Law', 'Fundamental Rights', 'PIL', 'Administrative Law', 'Property Law'],
    badge: 'PIL Pioneer',
  },
  {
    id: 'hrk',
    name: 'Justice H.R. Khanna',
    years: '1971–1977',
    philosophy: 'No emergency can suspend the rule of law — the Constitution\'s soul survives even authoritarian excess.',
    landmarkCase: 'ADM Jabalpur v. Shivkant Shukla (1976)',
    caseNote: 'Sole dissenter in the Habeas Corpus case during the Emergency, holding that no authority can deprive a person of life and liberty without legal authority — a dissent history vindicated.',
    areas: ['Constitutional Law', 'Fundamental Rights', 'Rule of Law', 'Criminal Procedure'],
    badge: 'Dissent Icon',
  },
  {
    id: 'bnk',
    name: 'Justice B.N. Kirpal',
    years: '1999–2002 (32nd CJI)',
    philosophy: 'Environmental protection is a non-negotiable constitutional duty — development cannot be permitted to destroy the commons.',
    landmarkCase: 'TN Godavarman Thirumulpad v. Union of India (1995–ongoing)',
    caseNote: 'Shaped forest conservation law through a continuous mandamus, holding all forests — not just reserved ones — subject to the Forest Conservation Act, 1980.',
    areas: ['Environmental Law', 'Forest Law', 'Property Law', 'Administrative Law'],
  },
  {
    id: 'rfn',
    name: 'Justice R.F. Nariman',
    years: '2014–2021',
    philosophy: 'Clear legal text must be applied as written — ambiguity is not a licence for judicial legislating.',
    landmarkCase: 'Shayara Bano v. Union of India (2017)',
    caseNote: 'Held the practice of triple talaq (talaq-e-biddat) manifestly arbitrary and void under Article 14, ending an oppressive practice through constitutional scrutiny.',
    areas: ['Family Law', 'Constitutional Law', 'Arbitration', 'Commercial Law'],
  },
  {
    id: 'im',
    name: 'Justice Indu Malhotra',
    years: '2018–2021',
    philosophy: 'Constitutional morality must not override sincere religious conscience without a compelling state interest.',
    landmarkCase: 'Indian Young Lawyers Assn. v. State of Kerala (Sabarimala, 2018)',
    caseNote: 'Sole dissenter in Sabarimala — argued that entry restrictions on women of menstruating age constituted an essential religious practice beyond judicial adjudication.',
    areas: ['Family Law', 'Religion & Gender', 'Constitutional Law', 'Commercial Law'],
    badge: 'Dissent Icon',
  },
];

// ── Act → subject area mapping ────────────────────────────────────────────────
const ACT_AREA_MAP: Record<string, string[]> = {
  ipc:   ['Criminal Law', 'Bail'],
  bns:   ['Criminal Law', 'Bail'],
  crpc:  ['Criminal Procedure', 'Bail', 'Prisoner Rights'],
  bnss:  ['Criminal Procedure', 'Bail', 'Criminal Law'],
  iea:   ['Evidence Law', 'Criminal Law'],
  bsa:   ['Evidence Law', 'Criminal Law'],
  ca:    ['Commercial Law', 'Arbitration', 'Constitutional Law'],
  const: ['Constitutional Law', 'Fundamental Rights', 'PIL'],
  cpc:   ['Property Law', 'Administrative Law', 'Constitutional Law'],
};

export function getJudgesForAct(actId: string): JudgeProfile[] {
  const targetAreas = ACT_AREA_MAP[actId] ?? ['Constitutional Law'];
  const matched = JUDGE_PROFILES.filter(j =>
    j.areas.some(area => targetAreas.includes(area))
  );
  return matched.slice(0, 3);
}

// Extract judge names from a block of text (e.g. Serper snippets)
export function extractJudgeNames(text: string): string[] {
  const matches = text.match(/Justice\s+[A-Z][a-z]+(?:\s+[A-Z][a-z.]+)*/g) ?? [];
  const unique = [...new Set(matches.map(m => m.trim()))];
  return unique.slice(0, 3);
}

// Match extracted judge names against profiles
export function matchJudgeProfiles(names: string[]): JudgeProfile[] {
  return names
    .map(name => JUDGE_PROFILES.find(p => p.name.toLowerCase().includes(name.toLowerCase().replace('Justice ', ''))))
    .filter((p): p is JudgeProfile => p !== undefined);
}
