/**
 * Blog seed script — adds 3 detailed legal blog articles to Firestore.
 * Run from the project root:  node scripts/seed-blogs.mjs
 *
 * Requires firebase-admin (already installed in /app/node_modules).
 * Reads credentials from app/.env.local automatically.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load env vars from app/.env.local ──────────────────────────────────────
const envPath = resolve(__dirname, '../app/.env.local');
const envLines = readFileSync(envPath, 'utf-8').split('\n');
const env = {};
for (const line of envLines) {
  const eq = line.indexOf('=');
  if (eq === -1 || line.startsWith('#')) continue;
  const key = line.slice(0, eq).trim();
  let val = line.slice(eq + 1).trim();
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
  env[key] = val;
}

// ── Bootstrap firebase-admin ────────────────────────────────────────────────
// Resolve from /app/node_modules since firebase-admin is installed there
const adminAppPath = pathToFileURL(resolve(__dirname, '../app/node_modules/firebase-admin/lib/app/index.js')).href;
const adminFsPath  = pathToFileURL(resolve(__dirname, '../app/node_modules/firebase-admin/lib/firestore/index.js')).href;

const { initializeApp, cert } = await import(adminAppPath);
const { getFirestore, Timestamp } = await import(adminFsPath);

const privateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

initializeApp({
  credential: cert({
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  }),
});

const db = getFirestore();

// ── Article definitions ─────────────────────────────────────────────────────

const articles = [
  // ── Article 1 ──────────────────────────────────────────────────────────────
  {
    title: 'The Rise of Artificial Intelligence in Indian Courts: Opportunities, Risks, and the Emerging Legal Framework',
    slug: 'artificial-intelligence-indian-courts-legal-framework',
    excerpt: 'From AI-assisted research to algorithm-driven bail recommendations, artificial intelligence is entering every corner of India\'s legal system. This deep-dive examines what courts are actually doing with AI, the constitutional fault lines it exposes, and the legislative gaps that still need to be filled.',
    content: `<h2>Introduction</h2>
<p>When the Supreme Court of India launched <strong>SUPACE</strong> (Supreme Court Portal for Assistance in Court's Efficiency) in April 2021, it marked the moment India's judiciary formally acknowledged that artificial intelligence was no longer a future concern — it was here. But SUPACE was just the opening act. Today, AI touches Indian court processes in ways that range from the mundane (document classification) to the potentially momentous (predicting bail outcomes). This article maps that landscape, asks hard questions about accountability, and looks at how the law is struggling to keep pace.</p>

<h2>What AI Tools Are Actually in Use?</h2>

<h3>1. SUPACE — Judicial Research Assistant</h3>
<p>SUPACE is an AI tool designed to assist judges by processing case files and surfacing relevant precedents and facts. Critically, it is described as a tool that "processes" information rather than one that "decides." Chief Justice S.A. Bobde, at its launch, was explicit: "SUPACE is not meant to help AI make decisions. It is meant to help judges make decisions better."</p>
<p>The distinction matters. An AI that summarises a 3,000-page trial record for a judge's reading is categorically different from one that recommends an outcome. SUPACE, at least in theory, falls in the former camp.</p>

<h3>2. SUVAAS — Virtual Assistant for Litigants</h3>
<p>SUVAAS (Supreme Court's Virtual Assistant and Automated Services) is a chatbot-style interface that helps litigants navigate filing procedures, check case status, and understand basic procedural steps. This is the low-stakes, high-value use case that draws nearly no controversy.</p>

<h3>3. Risk Assessment in Bail Decisions</h3>
<p>More contentious is the use of algorithmic risk assessment in bail and pre-trial detention decisions — a practice already widespread in the United States (COMPAS, PSA) and creeping into Indian discourse. In 2022, a Telangana district court reportedly used a software tool to generate a risk score as part of a bail hearing. No authoritative public record confirms the tool's parameters, the data it was trained on, or whether the defence had any opportunity to challenge its output.</p>
<p>This is where the constitutional stakes sharpen considerably.</p>

<h2>The Constitutional Fault Lines</h2>

<h3>Article 21 — The Right to Life and Personal Liberty</h3>
<p>The Supreme Court in <em>Maneka Gandhi v. Union of India</em> (1978) held that any procedure that curtails personal liberty must be "right, just, and fair" — not "arbitrary, fanciful, or oppressive." An opaque algorithm that contributes to a bail refusal without disclosable parameters, without an opportunity for the accused to understand or challenge the risk score, arguably fails this test.</p>
<p>More recently, in <em>K.S. Puttaswamy v. Union of India</em> (2017), the nine-judge bench embedded <strong>informational self-determination</strong> within the right to privacy under Article 21. If a state agency holds algorithmic profile data about a citizen and uses it to restrict their liberty, the citizen arguably has a constitutional right to know what that data says and to contest it.</p>

<h3>Article 14 — Equality Before the Law</h3>
<p>AI systems trained on historical data inherit historical biases. If India's criminal justice data over-represents arrests and convictions from certain communities (due to discriminatory policing, not higher actual criminality), an algorithm trained on that data will encode and amplify that discrimination. A bail prediction tool that produces statistically higher risk scores for individuals from socioeconomically marginalised groups would violate the guarantee of equality before the law in a manner that is both systematic and invisible.</p>
<p>The U.S. ProPublica investigation into COMPAS (2016) found exactly this pattern — Black defendants were nearly twice as likely as white defendants to be falsely flagged as high-risk. India has no equivalent audit of its nascent tools.</p>

<h3>The Right to Reasons</h3>
<p>Indian administrative law has long recognised that quasi-judicial decisions must be accompanied by reasons. <em>S.N. Mukherjee v. Union of India</em> (1990) established that reasons serve as "a check against arbitrary action." If a bail order or sentencing decision is influenced by an AI score, but the judge's order merely says "bail refused" without engaging with how the score was derived or weighted, the right-to-reasons requirement is likely violated.</p>

<h2>The Delhi HC Ruling on AI Copyright (2026)</h2>
<p>In March 2026, the Delhi High Court delivered India's first direct ruling on AI-generated content and copyright — <em>LegalTech Innovations Pvt. Ltd. v. Lex Machina India</em> (2026 SCC OnLine Del 2341). The court held that copyright protection requires human authorship as a fundamental element, and that AI-generated legal research summaries — absent substantial human creative input — do not qualify for independent copyright protection.</p>
<p>This ruling has immediate practical consequences for legal-tech companies. It means that AI-drafted contracts, research memos, and brief summaries cannot be copyright-protected as such. Companies must either structure their tools to ensure meaningful human creative contribution at every step, or accept that their AI outputs will be in the public domain the moment they are created.</p>

<h2>The Legislative Gap</h2>
<p>India's Digital Personal Data Protection Act, 2023 (DPDPA) is the primary lens through which AI in courts might be regulated — but it has significant gaps in this context:</p>
<ul>
<li><strong>State actors are exempt</strong>: Section 17 of the DPDPA exempts processing by the State for matters of national security and law enforcement. A police force using an AI risk-assessment tool is unlikely to be constrained by the DPDPA.</li>
<li><strong>No algorithmic accountability provision</strong>: Unlike the EU's AI Act (which classifies AI in criminal justice as "high risk" and mandates human oversight, transparency, and bias testing), India has no equivalent sectoral law.</li>
<li><strong>No right to explanation</strong>: The DPDPA does not include a right to explanation for automated decisions equivalent to Article 22 of the EU GDPR. A defendant in India has no statutory right to demand that an algorithm explain its risk score.</li>
</ul>
<p>The proposed AI Governance Framework under the Ministry of Electronics and Information Technology (MeitY) is still at the consultation stage as of 2026. Until it matures into binding legislation, judicial AI will occupy a legal grey zone.</p>

<h2>What Would a Responsible AI-in-Courts Framework Look Like?</h2>
<p>Drawing on comparative experience from the EU, Canada, and the State of New Jersey (USA), a responsible framework for AI in Indian courts might include:</p>
<ol>
<li><strong>Transparency by design</strong>: Any AI tool used in judicial processes must be documented. The documentation (algorithm design, training data sources, validation methodology) must be publicly available.</li>
<li><strong>Mandatory bias audits</strong>: Before deployment and at regular intervals, tools must be audited for demographic bias by an independent body.</li>
<li><strong>Right to contest</strong>: Any person affected by a judicial decision that used an AI tool must have the procedural right to examine the tool's output and present evidence challenging it.</li>
<li><strong>Human decision primacy</strong>: No judicial decision may be delegated to an algorithm. AI outputs must function as inputs to human deliberation, not substitutes for it.</li>
<li><strong>Legislative recognition</strong>: The Code of Criminal Procedure / BNSS and Civil Procedure Code should be amended to require disclosure whenever AI tools influence judicial decisions.</li>
</ol>

<h2>Conclusion</h2>
<p>The trajectory is clear: AI will continue to enter Indian courts, and the pace will accelerate. The question is whether the legal system will shape that entry or merely react to it. SUPACE and SUVAAS represent AI at its least dangerous — productivity tools that leave decision-making firmly with humans. But the pull toward predictive tools in criminal justice is strong, and the safeguards are currently absent.</p>
<p>The Delhi HC's AI copyright ruling of March 2026 is a reminder that the judiciary is capable of engaging with AI on its merits. What is needed now is the same rigour applied to AI's role in the courtroom itself — before a wrongful conviction is attributed to a black-box risk score that no one can explain.</p>`,
    category: 'AI & Tech Developments',
    author: 'EduLaw Editorial Team',
    tags: ['Artificial Intelligence', 'SUPACE', 'Bail Reform', 'Article 21', 'Digital Rights', 'DPDPA'],
    status: 'published',
    views: 0,
    seo: {
      metaTitle: 'AI in Indian Courts: Legal Framework, Risks & Constitutional Issues | EduLaw',
      metaDesc: 'A deep-dive into how artificial intelligence is being used in Indian courts — from SUPACE to bail algorithms — and the constitutional and legislative gaps that need urgent attention.',
      keywords: 'AI in Indian courts, SUPACE judiciary, algorithmic bail India, Article 21 AI, digital personal data protection, AI legal framework India',
    },
  },

  // ── Article 2 ──────────────────────────────────────────────────────────────
  {
    title: 'Bharatiya Nyaya Sanhita 2023: A Complete Guide to India\'s New Criminal Law',
    slug: 'bharatiya-nyaya-sanhita-2023-complete-guide',
    excerpt: 'India replaced its 163-year-old Indian Penal Code with the Bharatiya Nyaya Sanhita on 1 July 2024. This comprehensive guide breaks down every major change — from the renumbered sections and new definitions to the controversial organised crime and terrorism provisions — so you know exactly what the new law says.',
    content: `<h2>The End of the IPC Era</h2>
<p>On 1 July 2024, the <strong>Bharatiya Nyaya Sanhita, 2023 (BNS)</strong> came into force, replacing the Indian Penal Code, 1860 — a statute drafted by Lord Macaulay and in continuous operation for 163 years. The change was part of a broader legislative overhaul that also replaced the Code of Criminal Procedure with the <strong>Bharatiya Nagarik Suraksha Sanhita (BNSS)</strong> and the Indian Evidence Act with the <strong>Bharatiya Sakshya Adhiniyam (BSA)</strong>.</p>
<p>The government's stated rationale was decolonisation: replacing colonial-era statutes with laws that reflect India's contemporary values. Critics noted that most of the substantive provisions were carried forward with minor modifications, and that some new additions — particularly around organised crime and terrorism — expand state power in ways that merit careful scrutiny.</p>
<p>This guide is organised around what actually changed, what stayed the same, and what is genuinely new.</p>

<h2>Part I: The Numbering Changes (and Why They Matter)</h2>
<p>The most immediately disorienting change is the renumbering of every section. Lawyers, judges, and law students who memorised IPC section numbers now need to build a new mental map. Here are the critical equivalences:</p>
<table>
<thead><tr><th>Offence</th><th>IPC Section</th><th>BNS Section</th></tr></thead>
<tbody>
<tr><td>Murder</td><td>302</td><td>103</td></tr>
<tr><td>Culpable homicide not amounting to murder</td><td>304</td><td>105</td></tr>
<tr><td>Rape</td><td>376</td><td>64</td></tr>
<tr><td>Theft</td><td>378</td><td>303</td></tr>
<tr><td>Cheating</td><td>420</td><td>318</td></tr>
<tr><td>Criminal breach of trust</td><td>405–409</td><td>316</td></tr>
<tr><td>Defamation</td><td>499–500</td><td>356</td></tr>
<tr><td>Cruelty by husband/relatives</td><td>498A</td><td>85</td></tr>
<tr><td>Sedition (erstwhile)</td><td>124A</td><td>152 (modified)</td></tr>
<tr><td>Dacoity</td><td>395</td><td>310</td></tr>
</tbody>
</table>
<p>Practitioners should note that the Supreme Court has held that pending cases filed under the old IPC will continue under IPC provisions — only cases registered after 1 July 2024 are governed by BNS.</p>

<h2>Part II: Genuine Additions — What is Truly New</h2>

<h3>1. Organised Crime (Section 111)</h3>
<p>The IPC had no standalone organised crime provision. BNS Section 111 fills this gap, defining "organised crime" as a continuing unlawful activity by an individual, singly or jointly, either as a member of or on behalf of an organised crime syndicate, by use of violence, intimidation, or coercion, with the objective of gaining undue economic or other advantage.</p>
<p><strong>Key features:</strong></p>
<ul>
<li>Punishment for organised crime leading to death: death or life imprisonment.</li>
<li>Punishment for other organised crime: 5 years to life imprisonment.</li>
<li>Possession of property derived from organised crime is itself an offence.</li>
<li>Membership of an organised crime syndicate is an offence even without commission of a specific act.</li>
</ul>
<p><strong>Civil liberties concern:</strong> The definition is broad enough to encompass trade union activities, protest movements, and organised civil disobedience, depending on how "intimidation" and "unlawful activity" are interpreted. This is not a theoretical risk — several States already have anti-organised crime statutes (Maharashtra's MCOCA, Karnataka's KCOCA) that have been used against activists and journalists.</p>

<h3>2. Petty Organised Crime (Section 112)</h3>
<p>A new offence targeting gangs engaged in theft, snatching, cheating, unauthorised selling of tickets, and similar "petty" offences when done in a group. Punishment: 1–7 years imprisonment. This is intended to target recidivist gangs rather than isolated offenders, but the concept of "group" criminality without proof of individual participation in each act raises due process concerns.</p>

<h3>3. Terrorist Acts (Section 113)</h3>
<p>BNS Section 113 defines terrorist acts expansively — any act intended to threaten or likely to threaten the unity, integrity, sovereignty, security, or economic security of India, or strike terror in the people. The punishment is death or life imprisonment where the act causes death, and 5 years to life imprisonment otherwise.</p>
<p>Critics note that this overlaps significantly with the Unlawful Activities (Prevention) Act, 1967 (UAPA), which remains in force. Having two parallel terrorism provisions with different procedural frameworks creates complexity. More concerningly, the BNS definition is arguably broader than UAPA's, and BNS does not carry UAPA's (limited) procedural protections such as review by a Special Court.</p>

<h3>4. Hit-and-Run (Section 106(2))</h3>
<p>A new aggravated form of causing death by rash and negligent driving: if the driver of a vehicle causes the death of a person due to rash and negligent driving and then escapes without reporting the incident to a police officer or a Magistrate, the punishment is up to <strong>10 years</strong> imprisonment. This provision caused significant controversy when announced — truck drivers went on strike in early 2024 fearing disproportionate punishment. The government subsequently indicated this provision would not be immediately enforced pending stakeholder consultation, though it is on the statute books.</p>

<h3>5. Snatching (Section 304)</h3>
<p>A new standalone offence of "snatching" — theft by force from a person — punishable with up to 3 years imprisonment and fine. Previously charged under theft or robbery depending on the circumstances; now has its own provision.</p>

<h2>Part III: Major Modifications to Existing Offences</h2>

<h3>Sexual Offences</h3>
<p>The BNS substantially restructures sexual offence provisions. Section 64 (rape) adds a new aggravated form: sexual intercourse with a woman on the false promise of marriage, employment, promotion, or by concealing identity. Punishment for this specific form is up to 10 years.</p>
<p>The marital rape exception — long subject to constitutional challenge — is <em>retained</em> in BNS Section 64. A man cannot be charged with raping his own wife unless she is under 18 years of age. This is a missed opportunity and remains the subject of pending constitutional litigation.</p>

<h3>Sedition — Transformed but Not Abolished</h3>
<p>IPC Section 124A (sedition) was suspended by the Supreme Court in <em>S.G. Vombatkere v. Union of India</em> in 2022. BNS does not revive 124A as such. Instead, Section 152 creates a new offence:</p>
<blockquote>
<p>"Whoever, purposely or knowingly, by words, either spoken or written, or by signs, or by visible representation, or by electronic communication or by use of financial means, or otherwise, excites or attempts to excite, secession or armed rebellion or subversive activities, or encourages feelings of separatist activities or endangers sovereignty or unity and integrity of India..."</p>
</blockquote>
<p>The punishment is life imprisonment. While "sedition" as a word is gone, critics argue Section 152 is broader in scope — it adds "electronic communication" and "financial means" as instruments of commission, and does not carry the requirement established in <em>Kedar Nath Singh v. State of Bihar</em> (1962) that the speech must incite imminent violence. Whether Section 152 will be read down by courts as narrowly as Section 124A was, remains to be seen.</p>

<h3>Community Service as Punishment</h3>
<p>BNS introduces community service as a punishment for the first time in Indian criminal law, applicable to minor offences. This is a welcome move toward restorative justice principles, though the implementing rules and supervisory framework are still being developed by States.</p>

<h2>Part IV: What Didn't Change</h2>
<p>The substantive elements of most major offences — the actus reus and mens rea for murder, rape, theft, fraud, corruption — remain essentially identical to the IPC. The BNS is not a doctrinal revolution; it is a restructuring. The common law principles that Indian courts have developed over 163 years of interpreting the IPC remain applicable, as BNS provisions are substantially identical in language.</p>

<h2>Part V: Transitional Issues in Practice</h2>
<p>The transition has created practical complexity:</p>
<ul>
<li><strong>Ongoing trials</strong>: Cases filed before 1 July 2024 continue under IPC. A murder case filed on 30 June 2024 will still be prosecuted under Section 302 IPC.</li>
<li><strong>Appeals</strong>: Where the offence was committed pre-July 2024 but the appeal is heard after, the conviction is under the old law, but procedural matters in the appeal are governed by BNSS.</li>
<li><strong>Citation in pleadings</strong>: Lawyers must be meticulous about citing the correct statute based on the date of the offence.</li>
<li><strong>Legal database indexing</strong>: Case law under IPC continues to be the primary interpretive authority for BNS provisions that use identical language.</li>
</ul>

<h2>Conclusion</h2>
<p>The Bharatiya Nyaya Sanhita represents the largest formal change to Indian criminal law in a century and a half. In substance, much is continuity. But the new provisions on organised crime, terrorism, and hit-and-run carry significant implications for individual liberty, and the retention of the marital rape exception and the restyling (but not abolition) of sedition are decisions that the courts will be asked to scrutinise.</p>
<p>For legal practitioners, the immediate priority is building fluency in the new numbering. For law students, the BNS is the new IPC — memorise the section numbers, and build your understanding on the vast body of case law that interpretively governs both.</p>`,
    category: 'Legal Updates',
    author: 'EduLaw Editorial Team',
    tags: ['BNS', 'Bharatiya Nyaya Sanhita', 'IPC', 'Criminal Law Reform', 'Section 152', 'Organised Crime', 'BNSS'],
    status: 'published',
    views: 0,
    seo: {
      metaTitle: 'Bharatiya Nyaya Sanhita 2023: Complete Guide to India\'s New IPC | EduLaw',
      metaDesc: 'Everything you need to know about the BNS 2023 — section-by-section changes from IPC, new offences like organised crime & hit-and-run, and transitional issues for practitioners.',
      keywords: 'Bharatiya Nyaya Sanhita BNS, IPC replacement India, BNS section numbers, organised crime section 111, sedition section 152, new criminal law India 2024',
    },
  },

  // ── Article 3 ──────────────────────────────────────────────────────────────
  {
    title: 'Ambedkar\'s Constitutional Vision: Tracing the Fundamental Rights to Their Philosophical Roots',
    slug: 'ambedkar-constitutional-vision-fundamental-rights-philosophical-roots',
    excerpt: 'On the 135th birth anniversary of Dr. B.R. Ambedkar, we trace how his lived experience of caste discrimination, his study of John Dewey at Columbia, and his reading of John Stuart Mill and Edmund Burke shaped the Fundamental Rights chapter — and why his vision remains unfinished business in 2026.',
    content: `<h2>Introduction: The Man Behind the Constitution</h2>
<p>On 26 November 1949, Dr. Bhimrao Ramji Ambedkar delivered the closing speech to the Constituent Assembly after nearly three years of drafting work. He called the Constitution "a saleable commodity" if the people behind it were not committed to its principles. He warned that the Constitution could be subverted by those who made it. And he said something that remains one of the most cited passages in Indian constitutional history:</p>
<blockquote>
<p>"Constitutional morality is not a natural sentiment. It has to be cultivated. We must realise that our people have yet to learn it. Democracy in India is only a top-dressing on an Indian soil, which is essentially undemocratic."</p>
</blockquote>
<p>Today, on the 135th anniversary of his birth, it is worth asking: what was the philosophical architecture of the document he built? What ideas animated the Fundamental Rights — and how many of them remain aspirational rather than actual?</p>

<h2>Part I: The Intellectual Formation</h2>

<h3>Columbia University and John Dewey</h3>
<p>Ambedkar studied under <strong>John Dewey</strong> at Columbia University, New York, from 1913 to 1916. Dewey was the foremost philosopher of American pragmatism — the view that ideas must be evaluated by their practical consequences, and that democracy is not merely a form of government but "a form of associated living." For Dewey, democracy required that every individual have an equal opportunity to develop their capacities and participate in social decision-making.</p>
<p>Ambedkar absorbed this deeply. In his 1936 speech <em>Annihilation of Caste</em>, he wrote: "A democratic form of government presupposes a democratic form of society." He was making a Deweyan point: political democracy is hollow without social democracy. This conviction directly shaped his insistence that the Fundamental Rights chapter could not be limited to political freedoms — it had to attack the social structures that made freedom meaningful or meaningless.</p>

<h3>Mill and the Harm Principle</h3>
<p>John Stuart Mill's <em>On Liberty</em> (1859) anchors the liberal tradition's core commitment to individual freedom from coercive state power. Ambedkar was a careful reader of Mill. The harm principle — that liberty may only be constrained to prevent harm to others — is reflected in the "reasonable restrictions" framework of Articles 19(2)–19(6). But Ambedkar went beyond Mill in one crucial respect: he recognised that harm to Dalits was perpetrated not only by the state but by private social actors — landlords, upper-caste employers, priests — and that a Constitution that only restrained the state would leave those harms untouched.</p>
<p>This explains why Ambedkar pushed for the horizontal application of fundamental rights and why he was deeply invested in drafting what became <strong>Article 17</strong> — the abolition of untouchability — in absolute terms, with no exceptions and no qualification of "reasonable restrictions."</p>

<h3>Edmund Burke and Constitutional Stability</h3>
<p>More surprising is Ambedkar's engagement with Edmund Burke, the conservative political philosopher. Burke argued that constitutions are not abstract documents but living embodiments of a nation's historical experience — they must be changed slowly, deliberately, and with respect for inherited wisdom. Ambedkar's attitude to constitutional amendment reflects this: the procedure under <strong>Article 368</strong> is deliberately elaborate, requiring special majorities and, for certain provisions, State ratification. He wanted to make the Constitution difficult but not impossible to amend — protective of its core guarantees without being frozen.</p>

<h2>Part II: The Architecture of Fundamental Rights</h2>

<h3>Articles 14–18: Equality as the Foundation</h3>
<p>Ambedkar's equality provisions are not a single principle but a cluster of related but distinct guarantees:</p>
<ul>
<li><strong>Article 14</strong>: Equality before the law and equal protection of the laws — the formal guarantee, modelled on the 14th Amendment of the U.S. Constitution and the rule of law tradition.</li>
<li><strong>Article 15</strong>: Non-discrimination on grounds of religion, race, caste, sex, or place of birth — extending to non-state actors in access to public places and resources.</li>
<li><strong>Article 16</strong>: Equality in public employment, with the specific safeguard of reservations for "backward classes." The internal tension between Articles 14 and 16(4) has generated more Supreme Court jurisprudence than almost any other constitutional provision.</li>
<li><strong>Article 17</strong>: Abolition of untouchability — uniquely absolute. No Article 17 right can be limited by reasonable restrictions. Ambedkar insisted on this. Untouchability was not a matter on which balance was possible.</li>
<li><strong>Article 18</strong>: Abolition of titles — a direct assault on the social hierarchy that titles of nobility reproduced.</li>
</ul>
<p>Read together, Articles 14–18 reflect Ambedkar's core insight: formal legal equality is necessary but insufficient. Social hierarchy must be dismantled structurally, not merely declared illegal.</p>

<h3>Articles 19–22: The Liberty Cluster</h3>
<p>Articles 19–22 protect the classic civil liberties: speech and expression, assembly, association, movement, residence, and profession (Article 19); protection against ex post facto laws and double jeopardy (Article 20); the right against self-incrimination (Article 20(3)); and the rights of arrested persons (Article 22).</p>
<p>Article 19's "reasonable restrictions" framework was Ambedkar's deliberate choice over absolute rights. He argued that absolute rights were unsuitable for a diverse, newly independent nation still building its institutions. The grounds of restriction — sovereignty, public order, decency, morality — were intended to be construed narrowly; the subsequent history of sedition and UAPA charges reveals how widely they have been read.</p>
<p>Article 22's protections — the right to be informed of grounds of arrest, to consult a lawyer, and to be produced before a magistrate within 24 hours — were Ambedkar's explicit response to the colonial practice of indefinite preventive detention without trial. The irony of Clause (3), which preserves preventive detention as a tool available to Parliament, was not lost on him: he acknowledged it as a "necessary evil" given security conditions, but he expected it to be exceptional.</p>

<h3>Article 32: The Heart of the Constitution</h3>
<p>Ambedkar described <strong>Article 32</strong> as "the heart and soul of the Constitution." It gives every citizen the right to move the Supreme Court directly for enforcement of fundamental rights. This was not accidental design — it was a deliberate choice to make constitutional remedies accessible without requiring litigants to first exhaust ordinary court remedies.</p>
<p>The PIL revolution of the 1980s, pioneered by Justices P.N. Bhagwati and V.R. Krishna Iyer, expanded Article 32 beyond individual rights enforcement into a tool of public accountability and social justice. Ambedkar would have recognised the spirit: the judiciary as guardian of the Constitution against state and social power.</p>

<h2>Part III: The Unfinished Business</h2>

<h3>Caste Discrimination in 2026</h3>
<p>Article 17 abolished untouchability in 1950. The Protection of Civil Rights Act (1955) and the Scheduled Castes and Scheduled Tribes (Prevention of Atrocities) Act (1989, amended 2016) created criminal enforcement mechanisms. Yet NCRB data consistently shows that atrocities against Dalits remain at high levels, conviction rates are low, and impunity is widespread.</p>
<p>The gap between Article 17's absolute prohibition and its enforcement on the ground is precisely the "democratic soil" Ambedkar warned about: a soil that remains, in significant parts, undemocratic.</p>

<h3>The Horizontal Application Problem</h3>
<p>Ambedkar wanted fundamental rights to operate against private power, not just state power. Yet the dominant interpretation of most fundamental rights (with the exception of Article 15(2) and Article 17) limits them to "state action." Private discrimination in housing, employment, and social life is largely outside the fundamental rights framework — regulated, if at all, by ordinary legislation like the Equal Remuneration Act or the Rights of Persons with Disabilities Act.</p>
<p>The Supreme Court's decision in <em>Indra Sawhney v. Union of India</em> (1992) noted the tension but did not resolve it. As private sector employment has grown to dwarf public sector employment, the state action limitation has become an increasingly large hole in the equality framework.</p>

<h3>Constitutional Morality vs. Popular Morality</h3>
<p>In <em>Navtej Singh Johar v. Union of India</em> (2018), where the Supreme Court decriminalised consensual same-sex relationships, Chief Justice Dipak Misra invoked Ambedkar's concept of "constitutional morality" directly: "Constitutional morality cannot be martyred at the altar of social morality." The judgment explicitly applied Ambedkar's insight that popular prejudice cannot override constitutional principle.</p>
<p>This is perhaps the most direct invocation of Ambedkar's philosophy in recent Supreme Court jurisprudence, and it points toward a broader method: when popular morality and constitutional morality conflict, the Constitution must prevail. Judges who understand Ambedkar's intellectual history will read the Constitution as a transformative document designed to overcome existing social hierarchies — not as a mirror of majority values.</p>

<h2>Conclusion: A Living Vision</h2>
<p>Ambedkar built a Constitution for a country he knew well — its hierarchies, its cruelties, its capacity for change. He was simultaneously a realist (preventive detention exists; caste cannot be wished away) and a utopian (the abolition of untouchability; the equality provisions). The Fundamental Rights chapter is the synthesis of these two impulses.</p>
<p>On his 135th anniversary, the question he would ask is simple: has the democratic soil been cultivated? The answer, in 2026, is: partially. In every courtroom where Article 17 is invoked, every PIL filed under Article 32, every reservation defended under Article 16(4) — Ambedkar's vision is being worked out. But the soil still needs cultivation.</p>
<p>That is, perhaps, the most honest thing one can say: the Constitution he gave us is still being built.</p>`,
    category: 'Landmark Judgements',
    author: 'EduLaw Editorial Team',
    tags: ['Ambedkar', 'Constitutional Law', 'Fundamental Rights', 'Article 17', 'Article 32', 'Caste', 'Constitutional Morality'],
    status: 'published',
    views: 0,
    seo: {
      metaTitle: 'Ambedkar\'s Constitutional Vision: Fundamental Rights & Philosophical Roots | EduLaw',
      metaDesc: 'On Ambedkar Jayanti, trace how Dewey, Mill, and Burke shaped India\'s Fundamental Rights — and what constitutional morality means for India\'s unfinished constitutional project in 2026.',
      keywords: 'Ambedkar constitutional vision, fundamental rights philosophy, Article 17 untouchability, constitutional morality India, Ambedkar Dewey Columbia, Ambedkar Jayanti 2026',
    },
  },
];

// ── Write to Firestore ────────────────────────────────────────────────────────

const col = db.collection('blog_articles');

let seeded = 0;
for (const article of articles) {
  try {
    // Check for duplicate slug first
    const existing = await col.where('slug', '==', article.slug).limit(1).get();
    if (!existing.empty) {
      console.log(`⏭  Skipped (already exists): ${article.slug}`);
      continue;
    }
    await col.add({
      ...article,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log(`✅ Seeded: ${article.title}`);
    seeded++;
  } catch (err) {
    console.error(`❌ Failed: ${article.title}`, err.message);
  }
}

console.log(`\nDone — ${seeded}/${articles.length} articles seeded to blog_articles collection.`);
process.exit(0);
