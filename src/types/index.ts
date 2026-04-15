export interface Note {
  id: number | string;
  title: string;
  slug: string;
  description: string;
  category: string;
  subjectCode?: string;
  price: number;
  originalPrice?: number;
  previewPages?: number;
  totalPages: number;
  thumbnailUrl?: string;
  pdfUrl?: string;
  fileKey?: string;
  fileKeys?: { name: string; key: string }[];
  samplePdfKey?: string;    // R2 key for the partial/sample PDF
  previewImageKey?: string; // R2 key for the admin-uploaded preview image
  previewImageKeys?: string[]; // Multiple R2 keys for preview images
  isFeatured: boolean;
  isNew: boolean;
  language?: 'English' | 'Hindi' | 'Both';
  tableOfContents?: string[];
  contentFeatures?: string[]; // Bullet points for marketplace
  featuredSections?: { title: string; content: string }[]; // Special highlights
  publicDescription?: string; // Rich text description for marketplace
  audioSummaryUrl?: string;   // Mastery Bundle - AI Audio Summary
  audioSummaryUrlEnglish?: string;
  audioSummaryUrlHindi?: string;
  audioSummaryKeyEnglish?: string; // Stored MP3 key (R2)
  audioSummaryKeyHindi?: string;   // Stored MP3 key (R2)
  infographicKey?: string;         // Stored PDF/PNG key (R2)
  quizData?: string;               // Stringified JSON containing NotebookLM quiz questions
  createdAt?: string;
  hasGst?: boolean;
  gstRate?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  noteCount: number;
}

export interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string;
  noteIds: (string | number)[];
  price: number;
  originalPrice: number;
  isActive: boolean;
  tag?: string;
  savingsPercent: number;
  bundleType?: 'quantity' | 'curated' | 'combo' | 'institutional';
  includes?: string[];
  audioSummaryKeyEnglish?: string; // Stored MP3 key (R2)
  audioSummaryKeyHindi?: string;   // Stored MP3 key (R2)
  infographicKey?: string;         // Stored PDF/PNG key (R2)
  quizData?: string;               // Stringified JSON containing NotebookLM quiz questions
  hasGst?: boolean;
  gstRate?: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  monthlyEquivalent?: number;
  savings?: number;
  badge?: string;
  features: string[];
  downloadsPerMonth: number;
  serviceDiscount: number;
}

export interface LegalService {
  id: string;
  name: string;
  price: string;
  icon: string;
  description: string;
  features: string[];
  turnaroundTime: string;
}

export interface Testimonial {
  id: number;
  name: string;
  college: string;
  avatar: string;
  quote: string;
  rating: number;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export interface AudioSummaryAddon {
  id: string;
  noteId: string | number;
  title: string;
  price: number;
}

export interface CartItem {
  id: string;
  type: 'note' | 'bundle' | 'test' | 'audio';
  item: Note | Bundle | MockTest | AudioSummaryAddon;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  subscriptionStatus: 'none' | 'monthly' | 'annual';
  subscriptionEndDate?: string;
  downloadQuotaRemaining: number;
  createdAt: string;
}

export interface Purchase {
  id: string;
  userId: string;
  noteId?: number;
  bundleId?: string;
  amountPaid: number;
  couponUsed?: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  purchasedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'flat' | 'percent';
  discountValue: number;
  minOrder: number;
  maxUses: number;
  usesCount: number;
  validUntil: string;
  applicableTo: 'all' | 'bundles' | 'subscription' | 'notes';
  isActive: boolean;
}

// Mock Test & MCQ Types
export interface MockTest {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  subjectCode: string;
  totalQuestions: number;
  duration: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  price: number;
  isFree: boolean;
  isFeatured: boolean;
  questions: MCQQuestion[];
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  section?: string;
}

export interface TestAttempt {
  id: string;
  testId: string;
  userId: string;
  startedAt: string;
  completedAt?: string;
  score?: number;
  answers: Record<string, number>;
  timeTaken: number;
}

// Referral Program Types
export interface ReferralProgram {
  id: string;
  referrerId: string;
  referralCode: string;
  totalReferrals: number;
  successfulReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  referredUsers: ReferredUser[];
}

export interface ReferredUser {
  id: string;
  name: string;
  joinedAt: string;
  purchaseAmount: number;
  commissionEarned: number;
  status: 'pending' | 'completed';
}

// Legal Template Types
export interface LegalTemplate {
  id: string;
  title: string;
  slug: string;
  description: string;
  benefits?: string[];
  features?: string[];
  category: string;
  price: number;
  originalPrice?: number;
  format: 'pdf' | 'docx' | 'both';
  isFeatured: boolean;
  downloads: number;
  previewUrl?: string;
  tags: string[];
}

// Community Forum Types
export interface ForumTopic {
  id: string;
  title: string;
  slug: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  category: string;
  tags: string[];
  createdAt: string;
  replies: ForumReply[];
  upvotes: number;
  views: number;
  isSolved: boolean;
}

export interface ForumReply {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  upvotes: number;
  isAccepted: boolean;
}

// Type guard for authorAvatar
export function hasAuthorAvatar(reply: ForumReply): reply is ForumReply & { authorAvatar: string } {
  return reply.authorAvatar !== undefined && reply.authorAvatar !== '';
}

// College Licensing Types
export interface CollegeLicense {
  id: string;
  collegeName: string;
  collegeCode: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  studentCount: number;
  planType: 'basic' | 'standard' | 'premium';
  startDate: string;
  endDate: string;
  amount: number;
  features: string[];
  isActive: boolean;
}

// Certificate Types
export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  courseName: string;
  completionDate: string;
  certificateNumber: string;
  template: string;
  downloadUrl?: string;
}

// Progress Tracking Types
export interface UserProgress {
  userId: string;
  subjectProgress: SubjectProgress[];
  overallProgress: number;
  totalHoursSpent: number;
  streakDays: number;
  lastActivity: string;
}

export interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  completionPercent: number;
  pagesRead: number;
  totalPages: number;
  timeSpent: number;
  lastAccessed: string;
}

// Flash Sale Types
export interface FlashSale {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  discountPercent: number;
  applicableItems: string[];
  maxUses: number;
  usesCount: number;
  isActive: boolean;
}

// Bookmark & Highlight Types
export interface Bookmark {
  id: string;
  userId: string;
  noteId: string;
  pageNumber: number;
  content: string;
  createdAt: string;
  color: string;
}

export interface Highlight {
  id: string;
  userId: string;
  noteId: string;
  pageNumber: number;
  text: string;
  startOffset: number;
  endOffset: number;
  color: 'yellow' | 'green' | 'blue' | 'pink';
  note?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  noteId: string;
  userId: string;
  userName: string;
  userInitial: string;
  rating: number; // 1-5
  text: string;
  userAffiliation?: string;
  createdAt: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  origin: 'Latin' | 'English' | 'French' | 'Other';
  definition: string;
  category: string;
  usageExample?: string;
}
