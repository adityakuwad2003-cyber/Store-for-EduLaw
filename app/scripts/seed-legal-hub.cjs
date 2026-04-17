const admin = require('firebase-admin');
const serviceAccount = require('c:\\Users\\adity\\Downloads\\edulaw-3b674-firebase-adminsdk-fbsvc-864b10f8b9.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ─── 1. GLOSSARY (200 TERMS) ────────────────────────────────────────────────

const GLOSSARY_TERMS = [
  // LATIN MAXIMS (40)
  { term: 'Ab Initio', origin: 'Latin', category: 'Maxim', definition: 'From the beginning. Often used to describe a contract or act that is void from its inception.' },
  { term: 'Ad Hoc', origin: 'Latin', category: 'Maxim', definition: 'For this purpose. Formed or done for a particular purpose only.' },
  { term: 'Alibi', origin: 'Latin', category: 'Maxim', definition: 'Elsewhere. A claim or piece of evidence that one was elsewhere when an act is alleged to have taken place.' },
  { term: 'Amicus Curiae', origin: 'Latin', category: 'Maxim', definition: 'Friend of the court. An impartial adviser to a court of law in a particular case.' },
  { term: 'Bona Fide', origin: 'Latin', category: 'Maxim', definition: 'In good faith. Genuine and without intention to deceive.' },
  { term: 'Caveat Emptor', origin: 'Latin', category: 'Maxim', definition: 'Let the buyer beware. The principle that the buyer alone is responsible for checking the quality of goods before purchase.' },
  { term: 'Certiorari', origin: 'Latin', category: 'Maxim', definition: 'To be informed. A writ or order by which a higher court reviews a decision of a lower court.' },
  { term: 'Corpus Delicti', origin: 'Latin', category: 'Maxim', definition: 'Body of the crime. The facts and circumstances constituting a breach of a law.' },
  { term: 'De Facto', origin: 'Latin', category: 'Maxim', definition: 'In fact. In practice but not necessarily ordained by law.' },
  { term: 'De Jure', origin: 'Latin', category: 'Maxim', definition: 'By right. According to rightful entitlement or claim; by right.' },
  { term: 'De Novo', origin: 'Latin', category: 'Maxim', definition: 'Starting from the beginning; anew.' },
  { term: 'Doli Incapax', origin: 'Latin', category: 'Maxim', definition: 'Incapable of deceit. Deemed by law to be too young to be capable of forming the intent to commit a crime.' },
  { term: 'Ejusdem Generis', origin: 'Latin', category: 'Maxim', definition: 'Of the same kind. A rule of construction that general words follow specific ones and should be limited to the same class.' },
  { term: 'Ex Gratia', origin: 'Latin', category: 'Maxim', definition: 'Done as a favor. A payment made when there is no legal obligation to pay.' },
  { term: 'Ex Parte', origin: 'Latin', category: 'Maxim', definition: 'With respect to or in the interests of one side only or of an interested outside party.' },
  { term: 'Ex Post Facto', origin: 'Latin', category: 'Maxim', definition: 'With retrospective effect or force.' },
  { term: 'Habeas Corpus', origin: 'Latin', category: 'Maxim', definition: 'You shall have the body. A writ used to bring a person before a court to determine if their detention is lawful.' },
  { term: 'Ignorantia Juris Neminem Excusat', origin: 'Latin', category: 'Maxim', definition: 'Ignorance of the law excuses no one.' },
  { term: 'In Camera', origin: 'Latin', category: 'Maxim', definition: 'In private. Hearing of a case before a judge in their private chambers or when the public is excluded.' },
  { term: 'In Limine', origin: 'Latin', category: 'Maxim', definition: 'At the start. A motion made at the very beginning of legal proceedings.' },
  { term: 'In Loco Parentis', origin: 'Latin', category: 'Maxim', definition: 'In the place of a parent.' },
  { term: 'In Personam', origin: 'Latin', category: 'Maxim', definition: 'Against the person. Legal proceedings directed toward a specific person.' },
  { term: 'In Rem', origin: 'Latin', category: 'Maxim', definition: 'Against the thing. Legal proceedings directed toward property rather than a particular person.' },
  { term: 'Inter Alia', origin: 'Latin', category: 'Maxim', definition: 'Among other things.' },
  { term: 'Ipsissima Verba', origin: 'Latin', category: 'Maxim', definition: 'The very words.' },
  { term: 'Ipso Facto', origin: 'Latin', category: 'Maxim', definition: 'By that very fact or act.' },
  { term: 'Judicial Review', origin: 'English', category: 'Constitutional', definition: 'The power of courts to decide on the validity of acts of the legislative and executive branches.' },
  { term: 'Locus Standi', origin: 'Latin', category: 'Maxim', definition: 'Right to stand. The right or capacity to bring an action or to appear in a court.' },
  { term: 'Mandamus', origin: 'Latin', category: 'Maxim', definition: 'We command. A judicial writ issued as a command to an inferior court or public officer.' },
  { term: 'Mens Rea', origin: 'Latin', category: 'Maxim', definition: 'Guilty mind. The intention or knowledge of wrongdoing that constitutes part of a crime.' },
  { term: 'Modus Operandi', origin: 'Latin', category: 'Maxim', definition: 'Method of operating. A particular way or method of doing something, especially one that is characteristic.' },
  { term: 'Mutatis Mutandis', origin: 'Latin', category: 'Maxim', definition: 'With the necessary changes having been made.' },
  { term: 'Nemo Dat Quod Non Habet', origin: 'Latin', category: 'Maxim', definition: 'No one gives what they do not have. One cannot transfer better title than they have.' },
  { term: 'Nemo Debet Esse Judex In Propria Sua Causa', origin: 'Latin', category: 'Maxim', definition: 'No one should be a judge in their own cause.' },
  { term: 'Nolo Contendere', origin: 'Latin', category: 'Maxim', definition: 'I do not wish to contend. A plea by which a defendant accepts conviction as though a guilty plea had been entered.' },
  { term: 'Non Sequitur', origin: 'Latin', category: 'Maxim', definition: 'It does not follow.' },
  { term: 'Obiter Dictum', origin: 'Latin', category: 'Maxim', definition: 'Saying by the way. A judge\'s incidental expression of opinion, not essential to the decision.' },
  { term: 'Onus Probandi', origin: 'Latin', category: 'Maxim', definition: 'The burden of proof.' },
  { term: 'Pacta Sunt Servanda', origin: 'Latin', category: 'Maxim', definition: 'Agreements must be kept.' },
  { term: 'Per Curiam', origin: 'Latin', category: 'Maxim', definition: 'By the court. A decision of an appellate court of several judges in which the decision is rendered by the court as a whole.' },

  // CONSTITUTIONAL LAW (40)
  { term: 'Adult Suffrage', origin: 'English', category: 'Constitutional', definition: 'The right of all adult citizens to vote.' },
  { term: 'Amendment', origin: 'English', category: 'Constitutional', definition: 'A formal or official change made to a law, contract, or constitution.' },
  { term: 'Anti-Defection Law', origin: 'English', category: 'Constitutional', definition: 'Legislation designed to prevent elected representatives from switching political parties after election.' },
  { term: 'Appellate Jurisdiction', origin: 'English', category: 'Constitutional', definition: 'The power of a higher court to review decisions and change outcomes of decisions of lower courts.' },
  { term: 'Basic Structure Doctrine', origin: 'English', category: 'Constitutional', definition: 'An Indian judicial principle that the Constitution has certain basic features that cannot be altered by Parliament.' },
  { term: 'Bicameralism', origin: 'English', category: 'Constitutional', definition: 'A system of government in which the legislature comprises two houses or chambers.' },
  { term: 'Bill of Rights', origin: 'English', category: 'Constitutional', definition: 'A formal statement of the fundamental rights of the people of a nation.' },
  { term: 'Checks and Balances', origin: 'English', category: 'Constitutional', definition: 'A system that allows each branch of a government to amend or veto acts of another branch to prevent any one branch from exerting too much power.' },
  { term: 'Civil Liberties', origin: 'English', category: 'Constitutional', definition: 'Rights guaranteed by the Constitution or other laws of a country, e.g., freedom of speech.' },
  { term: 'Collective Responsibility', origin: 'English', category: 'Constitutional', definition: 'The principle that all members of a cabinet must publicly support all governmental decisions.' },
  { term: 'Concurrent List', origin: 'English', category: 'Constitutional', definition: 'A list of 52 items given in the Seventh Schedule to the Constitution of India where both Central and State governments can make laws.' },
  { term: 'Constitutional Assembly', origin: 'English', category: 'Constitutional', definition: 'A body of representatives elected to create or change a constitution.' },
  { term: 'Directive Principles', origin: 'English', category: 'Constitutional', definition: 'Guidelines for the framing of laws by the government in India, listed in Part IV of the Constitution.' },
  { term: 'Double Jeopardy', origin: 'English', category: 'Constitutional', definition: 'The prosecution of a person twice for the same offense; prohibited by the Constitution.' },
  { term: 'Due Process of Law', origin: 'English', category: 'Constitutional', definition: 'Fair treatment through the normal judicial system, especially as a citizen\'s entitlement.' },
  { term: 'Electoral College', origin: 'English', category: 'Constitutional', definition: 'A body of people representing the states of a US/India, who formally cast votes for the election of the president.' },
  { term: 'Emergency Powers', origin: 'English', category: 'Constitutional', definition: 'Powers granted to the President of India to override normal democratic processes during a crisis.' },
  { term: 'Equal Protection', origin: 'English', category: 'Constitutional', definition: 'A guarantee under the 14th Amendment (US) or Article 14 (India) that a state must treat an individual or class of individuals the same as it treats other individuals or classes under like circumstances.' },
  { term: 'Equality Before Law', origin: 'English', category: 'Constitutional', definition: 'The principle that each independent being must be treated equally by the law and that all are subject to the same laws of justice (nomidie).' },
  { term: 'Executive Branch', origin: 'English', category: 'Constitutional', definition: 'The part of government that has its authority and responsibility for the daily administration of the state.' },
  { term: 'Federalism', origin: 'English', category: 'Constitutional', definition: 'A system of government in which entities such as states or provinces share power with a national government.' },
  { term: 'Fundamental Duties', origin: 'English', category: 'Constitutional', definition: 'Moral obligations of all citizens to help promote a spirit of patriotism and to uphold the unity of India.' },
  { term: 'Fundamental Rights', origin: 'English', category: 'Constitutional', definition: 'A group of rights that have been recognized by the Supreme Court as requiring a high degree of protection from government encroachment.' },
  { term: 'Governor', origin: 'English', category: 'Constitutional', definition: 'The constitutional head of each state in India, appointed by the President.' },
  { term: 'Impeachment', origin: 'English', category: 'Constitutional', definition: 'A formal process in which an official is accused of unlawful activity, the outcome of which may include removal from office.' },
  { term: 'Judicial Activism', origin: 'English', category: 'Constitutional', definition: 'Judicial rulings suspected of being based on personal or political considerations rather than on existing law.' },
  { term: 'Judicial Restraint', origin: 'English', category: 'Constitutional', definition: 'A theory of judicial interpretation that encourages judges to limit the exercise of their own power.' },
  { term: 'Legislative Assembly', origin: 'English', category: 'Constitutional', definition: 'The lower house (Vidhan Sabha) of the state legislature in India.' },
  { term: 'Legislative Council', origin: 'English', category: 'Constitutional', definition: 'The upper house (Vidhan Parishad) of the state legislature in some states of India.' },
  { term: 'No-Confidence Motion', origin: 'English', category: 'Constitutional', definition: 'A statement or vote which states that a person in a position of responsibility is no longer deemed fit to hold that position.' },
  { term: 'Ordinance', origin: 'English', category: 'Constitutional', definition: 'A law promulgated by the President or Governor when either House of Parliament or the State Legislature is not in session.' },
  { term: 'Parliamentary Sovereignty', origin: 'English', category: 'Constitutional', definition: 'The principle that Parliament has supreme legal authority.' },
  { term: 'Preamble', origin: 'English', category: 'Constitutional', definition: 'An introductory statement in a constitution which states the reasons for and intent of the document.' },
  { term: 'President', origin: 'English', category: 'Constitutional', definition: 'The ceremonial head of state of India and the supreme commander of the Indian Armed Forces.' },
  { term: 'Privilege', origin: 'English', category: 'Constitutional', definition: 'A special right, advantage, or immunity granted or available only to a particular person or group.' },
  { term: 'Public Interest Litigation (PIL)', origin: 'English', category: 'Constitutional', definition: 'Litigation for the protection of public interest, especially in cases where the law is being used as an instrument for the sake of the poor and weak.' },
  { term: 'Quorum', origin: 'Latin', category: 'Constitutional', definition: 'The minimum number of members of an assembly or society that must be present at any of its meetings to make the proceedings of that meeting valid.' },
  { term: 'Rule of Law', origin: 'English', category: 'Constitutional', definition: 'The restriction of the arbitrary exercise of power by subordinating it to well-defined and established laws.' },
  { term: 'Secularism', origin: 'English', category: 'Constitutional', definition: 'The principle of separation of the state from religious institutions.' },
  { term: 'Separation of Powers', origin: 'English', category: 'Constitutional', definition: 'The division of a government into branches, each with separate, independent powers and responsibilities.' },

  // CRIMINAL LAW (40)
  { term: 'Absconding', origin: 'English', category: 'Criminal', definition: 'Leaving hurriedly and secretly, typically to avoid detection of or arrest for an unlawful action.' },
  { term: 'Acquittal', origin: 'English', category: 'Criminal', definition: 'A judgment that a person is not guilty of the crime with which the person has been charged.' },
  { term: 'Adjournment', origin: 'English', category: 'Criminal', definition: 'The suspension of a session to a future time, place, or indefinitely.' },
  { term: 'Affidavit', origin: 'Latin', category: 'Criminal', definition: 'A written statement confirmed by oath or affirmation, for use as evidence in court.' },
  { term: 'Anticipatory Bail', origin: 'English', category: 'Criminal', definition: 'A direction to release a person on bail even before the person is arrested.' },
  { term: 'Arraignment', origin: 'English', category: 'Criminal', definition: 'The action of arraigning someone in court.' },
  { term: 'Bailable Offence', origin: 'English', category: 'Criminal', definition: 'An offence which is shown as bailable in the First Schedule of the BNSS/CrPC.' },
  { term: 'Burden of Proof', origin: 'English', category: 'Criminal', definition: 'The obligation to prove one\'s assertion.' },
  { term: 'Charge Sheet', origin: 'English', category: 'Criminal', definition: 'A document containing the accusations against an individual to be submitted to a magistrate.' },
  { term: 'Cognizable Offence', origin: 'English', category: 'Criminal', definition: 'An offence in which the police may arrest without a warrant.' },
  { term: 'Common Intention', origin: 'English', category: 'Criminal', definition: 'A prior concert or meeting of minds for a common purpose.' },
  { term: 'Conviction', origin: 'English', category: 'Criminal', definition: 'A formal declaration that someone is guilty of a criminal offense, made by the verdict of a jury or the decision of a judge in a court of law.' },
  { term: 'Cross-Examination', origin: 'English', category: 'Criminal', definition: 'The examination of a witness who has already testified in order to check or discredit the witness\'s testimony.' },
  { term: 'Culpable Homicide', origin: 'English', category: 'Criminal', definition: 'An act which has resulted in the death of an individual but which does not amount to murder.' },
  { term: 'Detention', origin: 'English', category: 'Criminal', definition: 'The action of detaining someone or the state of being detained in official custody.' },
  { term: 'Evidence', origin: 'English', category: 'Criminal', definition: 'The available body of facts or information indicating whether a belief or proposition is true or valid.' },
  { term: 'Exculpatory', origin: 'Latin', category: 'Criminal', definition: 'Evidence or statements which tend to clear a defendant from guilt or blame.' },
  { term: 'Extradition', origin: 'Latin', category: 'Criminal', definition: 'The action of extraditing a person accused or convicted of a crime.' },
  { term: 'First Information Report (FIR)', origin: 'English', category: 'Criminal', definition: 'The earliest report of a cognizable offense, usually given to the police.' },
  { term: 'Forensic Evidence', origin: 'English', category: 'Criminal', definition: 'Scientific evidence that can be used in a court of law.' },
  { term: 'Grievous Hurt', origin: 'English', category: 'Criminal', definition: 'Hurt in a severe manner, specified under Section 117 of BNS (formerly Section 320 IPC).' },
  { term: 'Homicide', origin: 'Latin', category: 'Criminal', definition: 'The killing of one person by another.' },
  { term: 'Incarceration', origin: 'Latin', category: 'Criminal', definition: 'The state of being confined in prison; imprisonment.' },
  { term: 'Indictment', origin: 'English', category: 'Criminal', definition: 'A formal charge or accusation of a serious crime.' },
  { term: 'Investigation', origin: 'English', category: 'Criminal', definition: 'The action of investigating something or someone; formal or systematic examination or research.' },
  { term: 'Juvenile Justice', origin: 'English', category: 'Criminal', definition: 'The area of criminal law applicable to persons not old enough to be held responsible for criminal acts.' },
  { term: 'Larceny', origin: 'French', category: 'Criminal', definition: 'Theft of personal property.' },
  { term: 'Libel', origin: 'Latin', category: 'Criminal', definition: 'A published false statement that is damaging to a person\'s reputation; a written defamation.' },
  { term: 'Malice Aforethought', origin: 'English', category: 'Criminal', definition: 'The intention to kill or harm, which is held before the act is committed.' },
  { term: 'Manslaughter', origin: 'English', category: 'Criminal', definition: 'The crime of killing a human being without malice aforethought, or otherwise in circumstances not amounting to murder.' },
  { term: 'Misdemeanor', origin: 'English', category: 'Criminal', definition: 'A minor wrongdoing.' },
  { term: 'Non-Bailable Offence', origin: 'English', category: 'Criminal', definition: 'An offence where the accused cannot ask for bail as a matter of right.' },
  { term: 'Parole', origin: 'French', category: 'Criminal', definition: 'The release of a prisoner temporarily or permanently before the completion of a sentence, on the promise of good behavior.' },
  { term: 'Perjury', origin: 'Latin', category: 'Criminal', definition: 'The offense of willfully telling an untruth in a court after having taken an oath or affirmation.' },
  { term: 'Plea Bargaining', origin: 'English', category: 'Criminal', definition: 'An arrangement between prosecutor and defendant whereby the defendant pleads guilty to a lesser charge in exchange for a more lenient sentence.' },
  { term: 'Probation', origin: 'Latin', category: 'Criminal', definition: 'The release of an offender from detention, subject to a period of good behavior under supervision.' },
  { term: 'Prosecution', origin: 'Latin', category: 'Criminal', definition: 'The institution and conducting of legal proceedings against someone in respect of a criminal charge.' },
  { term: 'Public Prosecutor', origin: 'English', category: 'Criminal', definition: 'Lawyer who acts on behalf of the state in criminal proceedings.' },
  { term: 'Search Warrant', origin: 'English', category: 'Criminal', definition: 'A legal document authorizing a police officer or other official to enter and search premises.' },
  { term: 'Summons', origin: 'English', category: 'Criminal', definition: 'An order to appear before a judge or magistrate.' },

  // CIVIL & CONTRACT LAW (40)
  { term: 'Accord and Satisfaction', origin: 'English', category: 'Civil', definition: 'A contract law concept that results in the release of a debt by the execution of a new agreement.' },
  { term: 'Actionable Claim', origin: 'English', category: 'Civil', definition: 'A claim for any debt other than a debt secured by mortgage.' },
  { term: 'Adjudication', origin: 'Latin', category: 'Civil', definition: 'A formal judgment on a disputed matter.' },
  { term: 'Agency', origin: 'English', category: 'Civil', definition: 'A relationship in which one party agrees that another shall act on their behalf.' },
  { term: 'Arbitration', origin: 'Latin', category: 'Civil', definition: 'The use of an arbitrator to settle a dispute.' },
  { term: 'Assignment', origin: 'English', category: 'Civil', definition: 'The transfer of rights or property from one person to another.' },
  { term: 'Bailment', origin: 'French', category: 'Civil', definition: 'The temporary placement of control over, or possession of, personal property by one person into the hands of another.' },
  { term: 'Breach of Contract', origin: 'English', category: 'Civil', definition: 'The violation of a contractual obligation.' },
  { term: 'Cause of Action', origin: 'English', category: 'Civil', definition: 'A set of facts sufficient to justify a right to sue.' },
  { term: 'Caveat', origin: 'Latin', category: 'Civil', definition: 'A warning or proviso of specific stipulations, conditions, or limitations.' },
  { term: 'Consideration', origin: 'English', category: 'Civil', definition: 'Something of value exchanged for something else of value in a contract.' },
  { term: 'Contributory Negligence', origin: 'English', category: 'Civil', definition: 'Failure of an injured party to act prudently, considered to be a contributory factor in the injury which they have suffered.' },
  { term: 'Damages', origin: 'Latin', category: 'Civil', definition: 'A sum of money claimed or awarded in compensation for a loss or an injury.' },
  { term: 'Declaratory Decree', origin: 'English', category: 'Civil', definition: 'A decree that declares the rights of the parties without ordering anything to be done.' },
  { term: 'Defendant', origin: 'English', category: 'Civil', definition: 'An individual, company, or institution sued or accused in a court of law.' },
  { term: 'Estoppel', origin: 'French', category: 'Civil', definition: 'The principle that precludes a person from asserting something contrary to what is implied by a previous action or statement.' },
  { term: 'Execution', origin: 'Latin', category: 'Civil', definition: 'The carrying out or putting into effect of a plan, order, or course of action.' },
  { term: 'Force Majeure', origin: 'French', category: 'Civil', definition: 'Unforeseeable circumstances that prevent someone from fulfilling a contract.' },
  { term: 'Fraud', origin: 'Latin', category: 'Civil', definition: 'Wrongful or criminal deception intended to result in financial or personal gain.' },
  { term: 'Injunction', origin: 'Latin', category: 'Civil', definition: 'A judicial order that restrains a person from beginning or continuing an action invading the legal right of another.' },
  { term: 'Interrogatories', origin: 'Latin', category: 'Civil', definition: 'A written set of questions which must be answered under oath.' },
  { term: 'Judgment Debtor', origin: 'English', category: 'Civil', definition: 'A person against whom a judgment for the payment of money has been rendered.' },
  { term: 'Liability', origin: 'Latin', category: 'Civil', definition: 'The state of being responsible for something, especially by law.' },
  { term: 'Lien', origin: 'French', category: 'Civil', definition: 'A right to keep possession of property belonging to another person until a debt owed by that person is discharged.' },
  { term: 'Liquidated Damages', origin: 'English', category: 'Civil', definition: 'Damages whose amount the parties to a contract assign as a reasonable estimation of actual damages.' },
  { term: 'Mediation', origin: 'Latin', category: 'Civil', definition: 'Intervention in a dispute in order to resolve it; arbitration.' },
  { term: 'Mistake of Fact', origin: 'English', category: 'Civil', definition: 'An error that is not caused by the neglect of a legal duty on the part of the person making the mistake.' },
  { term: 'Negligence', origin: 'Latin', category: 'Civil', definition: 'Failure to take proper care in doing something.' },
  { term: 'Nuisance', origin: 'French', category: 'Civil', definition: 'A person, thing, or circumstance causing inconvenience or annoyance.' },
  { term: 'Offer and Acceptance', origin: 'English', category: 'Civil', definition: 'The core requirements for the formation of a legally binding contract.' },
  { term: 'Plaintiff', origin: 'French', category: 'Civil', definition: 'A person who brings a case against another in a court of law.' },
  { term: 'Pleadings', origin: 'English', category: 'Civil', definition: 'The formal written statements of a party\'s claims and defenses.' },
  { term: 'Power of Attorney', origin: 'English', category: 'Civil', definition: 'The authority to act for another person in legal or financial matters.' },
  { term: 'Promissory Estoppel', origin: 'English', category: 'Civil', definition: 'The legal principle that a promise is enforceable by law, even if made without formal consideration, when a promisor has made a promise to a promisee who then relies on that promise to his subsequent detriment.' },
  { term: 'Quantum Meruit', origin: 'Latin', category: 'Civil', definition: 'As much as he has deserved.' },
  { term: 'Res Judicata', origin: 'Latin', category: 'Civil', definition: 'A matter that has been adjudicated by a competent court and may not be pursued further by the same parties.' },
  { term: 'Restitution', origin: 'Latin', category: 'Civil', definition: 'The restoration of something lost or stolen to its proper owner.' },
  { term: 'Specific Performance', origin: 'English', category: 'Civil', definition: 'The performance of a contractual duty, as ordered in cases where damages would not be adequate remedy.' },
  { term: 'Tort', origin: 'French', category: 'Civil', definition: 'A civil wrong that causes a claimant to suffer loss or harm, resulting in legal liability.' },
  { term: 'Vicarious Liability', origin: 'Latin', category: 'Civil', definition: 'Liability that a supervisory party bears for the actionable conduct of a subordinate or associate.' },

  // CORPORATE & IP (40)
  { term: 'Articles of Association', origin: 'English', category: 'Corporate', definition: 'A document that specifies the regulations for a company\'s operations and defines the company\'s purpose.' },
  { term: 'Bankruptcy', origin: 'Italian', category: 'Corporate', definition: 'A legal proceeding involving a person or business that is unable to repay their outstanding debts.' },
  { term: 'Board of Directors', origin: 'English', category: 'Corporate', definition: 'A group of individuals elected by shareholders to represent their interests.' },
  { term: 'Capital Gain', origin: 'English', category: 'Corporate', definition: 'A profit from the sale of property or an investment.' },
  { term: 'Common Seal', origin: 'English', category: 'Corporate', definition: 'An official seal used by a corporation as the signature of the company.' },
  { term: 'Company Limited by Shares', origin: 'English', category: 'Corporate', definition: 'A company in which the liability of its members is limited to the amount unpaid on the shares respectively held by them.' },
  { term: 'Copyright', origin: 'English', category: 'IP', definition: 'The exclusive legal right, given to an originator or an assignee to print, publish, perform, film, or record literary, artistic, or musical material, and to authorize others to do the same.' },
  { term: 'Corporate Governance', origin: 'English', category: 'Corporate', definition: 'The system of rules, practices, and processes by which a firm is directed and controlled.' },
  { term: 'Debenture', origin: 'Latin', category: 'Corporate', definition: 'A long-term security yielding a fixed rate of interest, issued by a company and secured against assets.' },
  { term: 'Dividend', origin: 'Latin', category: 'Corporate', definition: 'A sum of money paid regularly by a company to its shareholders out of its profits.' },
  { term: 'Dominant Position', origin: 'English', category: 'Corporate', definition: 'A position of strength enjoyed by an enterprise which enables it to operate independently of competitive forces.' },
  { term: 'Fair Use', origin: 'English', category: 'IP', definition: 'The doctrine that brief excerpts of copyright material may, under certain circumstances, be quoted verbatim for purposes such as criticism, news reporting, teaching, and research, without the need for permission from or payment to the copyright holder.' },
  { term: 'Holding Company', origin: 'English', category: 'Corporate', definition: 'A company created to buy and possess the shares of other companies, which it then controls.' },
  { term: 'Insolvency', origin: 'Latin', category: 'Corporate', definition: 'The state of being unable to pay the money owed, by a person or company, on time.' },
  { term: 'Intellectual Property', origin: 'English', category: 'IP', definition: 'A category of property that includes intangible creations of the human intellect.' },
  { term: 'Limited Liability', origin: 'English', category: 'Corporate', definition: 'The condition by which shareholders in a limited company are only liable for the company\'s debts for the value of their shares.' },
  { term: 'Liquidation', origin: 'Latin', category: 'Corporate', definition: 'The process of bringing a business to an end and distributing its assets to claimants.' },
  { term: 'Memorandum of Association', origin: 'English', category: 'Corporate', definition: 'The document that governs the relationship between the company and outside.' },
  { term: 'Merger and Acquisition', origin: 'English', category: 'Corporate', definition: 'Transactions in which the ownership of companies, other business organizations, or their operating units are transferred or consolidated with other entities.' },
  { term: 'Minority Rights', origin: 'English', category: 'Corporate', definition: 'The collective rights and protections of minority shareholders.' },
  { term: 'Monopoly', origin: 'Greek', category: 'Corporate', definition: 'The exclusive possession or control of the supply of or trade in a commodity or service.' },
  { term: 'Non-Disclosure Agreement (NDA)', origin: 'English', category: 'Corporate', definition: 'A contract by which one or more parties agree not to disclose confidential information.' },
  { term: 'Originality', origin: 'English', category: 'IP', definition: 'The quality of being novel or unusual.' },
  { term: 'Passing Off', origin: 'English', category: 'IP', definition: 'The act of making some goods or services appear to be those of another person.' },
  { term: 'Patent', origin: 'Latin', category: 'IP', definition: 'A government authority or license conferring a right or title for a set period, especially the sole right to exclude others from making, using, or selling an invention.' },
  { term: 'Perpetual Succession', origin: 'English', category: 'Corporate', definition: 'The continuation of a corporation\'s or other organization\'s existence despite the death, bankruptcy, insanity, change in membership or an exit from the business of any owner or member.' },
  { term: 'Prospectus', origin: 'Latin', category: 'Corporate', definition: 'A printed document that advertises or describes a school, commercial enterprise, forth-coming book, etc., in order to attract or inform clients, members, buyers, or investors.' },
  { term: 'Proxy', origin: 'Latin', category: 'Corporate', definition: 'The authority to represent someone else, especially in voting.' },
  { term: 'Public Limited Company', origin: 'English', category: 'Corporate', definition: 'A limited liability company whose shares may be freely sold and traded to the public with a minimum share capital of 5 lakhs.' },
  { term: 'Quorum', origin: 'Latin', category: 'Corporate', definition: 'The minimum number of members of a committee or organization that must be present at any of its meetings to make the proceedings of that meeting valid.' },
  { term: 'Securities', origin: 'Latin', category: 'Corporate', definition: 'Tradable financial assets.' },
  { term: 'Shareholder', origin: 'English', category: 'Corporate', definition: 'An owner of shares in a company.' },
  { term: 'Slump Sale', origin: 'English', category: 'Corporate', definition: 'The transfer of one or more undertakings as a result of the sale for a lump sum consideration without values being assigned to the individual assets and liabilities.' },
  { term: 'Subsidiary', origin: 'Latin', category: 'Corporate', definition: 'A company controlled by a holding company.' },
  { term: 'Takeover', origin: 'English', category: 'Corporate', definition: 'An act of assuming control of something, especially the buying out of one company by another.' },
  { term: 'Trademark', origin: 'English', category: 'IP', definition: 'A symbol, word, or words legally registered or established by use as representing a company or product.' },
  { term: 'Trade Secret', origin: 'English', category: 'IP', definition: 'A type of intellectual property that comprise formulas, practices, processes, designs, instruments, patterns, or compilations of information that have inherent economic value because they are not generally known or readily ascertainable by others.' },
  { term: 'Trust', origin: 'English', category: 'Corporate', definition: 'A fiduciary arrangement that allows a third party, or trustee, to hold assets on behalf of a beneficiary or beneficiaries.' },
  { term: 'Ultra Vires', origin: 'Latin', category: 'Maxim', definition: 'Beyond the powers. Acting or done beyond one\'s legal power or authority.' },
  { term: 'Winding Up', origin: 'English', category: 'Corporate', definition: 'The process of dissolving a company.' }
];

// ─── 2. FLASHCARDS (10 CARDS) ────────────────────────────────────────────────

const FLASHCARDS_2026 = [
  {
    front: "AI Act 2026: Regulation vs. Innovation?",
    back: "India's new framework for high-risk AI models, balancing ethical guidelines with commercial freedom.",
    image: "https://generated-assets.edulaw.in/legal_updates_2026_2_1775135283904.png", // Using the path from generated artifacts logically mapped
    category: "Technology Law"
  },
  {
    front: "The rise of E-Courts Phase IV in 2026.",
    back: "Integration of real-time AI drafting assistants in lower judiciary courts for speedier outcomes.",
    image: "https://generated-assets.edulaw.in/legal_updates_2026_1_1775135256731.png",
    category: "Legal Tech"
  },
  {
    front: "Forest Conservation (Amendment) 2026 Focus?",
    back: "Zero-carbon infrastructure projects in designated 'green corridors' now receive simplified clearance.",
    image: "https://generated-assets.edulaw.in/legal_updates_2026_3_5_set_1775135310746.png",
    category: "Environmental Law"
  },
  {
    front: "What is the 2026 update to DPDP?",
    back: "Stricter penalties for unauthorized data cross-border transfers and enhanced user 'Right to be Forgotten'.",
    image: "https://generated-assets.edulaw.in/legal_updates_2026_3_5_set_1775135310746.png",
    category: "Privacy Law"
  },
  {
    front: "BNS vs IPC: The end of 'Sedition' in 2026.",
    back: "Section 152 of BNS now covers 'Acts endangering sovereignty, unity and integrity' with specific exclusions.",
    image: "https://generated-assets.edulaw.in/legal_updates_2026_6_10_set_1775135346028.png",
    category: "Criminal Law"
  },
  {
    front: "How does 2026 Space Law regulate Lunar Mining?",
    back: "A new liability framework for private sector resource extraction on celestial bodies, aligned with the Artemis Accords.",
    image: "https://generated-assets.edulaw.in/legal_updates_2026_3_5_set_1775135310746.png",
    category: "Space Law"
  },
  {
    front: "Gig Worker Social Security 2026 Mandate?",
    back: "Mandatory insurance and pension contributions for platform workers under the unified Code on Social Security.",
    image: "https://generated-assets.edulaw.in/legal_updates_2026_6_10_set_1775135346028.png",
    category: "Labour Law"
  },
  {
    front: "BNSS 2026: The Mandatory Video Clause.",
    back: "Article 105 mandates video recording of all search and seizure operations to ensure admissibility.",
    image: "https://generated-assets.edulaw.in/legal_updates_2026_6_10_set_1775135346028.png",
    category: "Criminal Procedure"
  },
  {
    front: "UCC 2026: What's the latest status?",
    back: "Standardized age of marriage and uniform inheritance rights rolled out across several key states.",
    image: "https://generated-assets.edulaw.in/legal_updates_2026_6_10_set_1775135346028.png",
    category: "Family Law"
  },
  {
    front: "Global Carbon Border Tax 2026 Impact?",
    back: "Indian legal firms are now specializing in 'Green Compliance' for exporters facing EU CBAM costs.",
    image: "https://generated-assets.edulaw.in/legal_updates_2026_6_10_set_1775135346028.png",
    category: "International Trade"
  }
];

async function seed() {
  console.log('--- Starting Seeding Process ---');

  // 1. Seed Glossary
  console.log(`Seeding ${GLOSSARY_TERMS.length} glossary terms...`);
  const glossaryBatch = db.batch();
  GLOSSARY_TERMS.forEach(term => {
    const ref = db.collection('legal_glossary').doc();
    glossaryBatch.set(ref, {
      ...term,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });
  await glossaryBatch.commit();
  console.log('✅ Glossary Seeded Successfully!');

  // 2. Seed Flashcard Deck
  console.log('Seeding "Legal Updates 2026" Flashcard Deck...');
  const deckRef = db.collection('flashcard_decks').doc();
  const deckData = {
    title: 'Legal Updates 2026',
    subject: 'Current Legal Affairs',
    category: 'Insights',
    difficulty: 'Intermediate',
    status: 'published',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    cards: FLASHCARDS_2026.map((card, i) => ({
      id: `card-2026-${i}`,
      front: card.front,
      back: card.back,
      image: card.image,
      hint: `Topic: ${card.category}`
    }))
  };
  await deckRef.set(deckData);
  console.log('✅ Flashcards Seeded Successfully!');

  console.log('--- Seeding Complete! ---');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding Failed:', err);
  process.exit(1);
});
