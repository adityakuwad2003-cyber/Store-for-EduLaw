import { BrowserRouter as Router, Routes, Route, useLocation, useSearchParams } from 'react-router-dom';
import { useEffect, lazy, Suspense, Component, type ReactNode, type ErrorInfo } from 'react';

class PageErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('[PageErrorBoundary]', error, info); }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] p-8 text-center">
          <div className="max-w-md">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="font-display text-2xl text-slate-900 font-bold mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-500 font-ui mb-6">
              {(this.state.error as Error).message}
            </p>
            <button
              onClick={() => { this.setState({ error: null }); window.location.href = '/marketplace'; }}
              className="px-6 py-3 bg-burgundy text-white rounded-xl font-ui font-bold text-sm"
            >
              Back to Marketplace
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { Toaster } from '@/components/ui/sonner';
import { WhatsAppFloat } from '@/components/ui/WhatsAppFloat';
import { BundleModal } from '@/components/ui/BundleModal';
import { SignInPopup } from '@/components/ui/SignInPopup';
import { ScholarAI } from '@/components/ui/ScholarAI';
import { WishlistNudge } from '@/components/ui/WishlistNudge';
import { useUIStore } from '@/store';

// Lazy-load all public pages — reduces initial JS parse time significantly
const Home = lazy(() => import('@/pages/Home').then(m => ({ default: m.Home })));
const Marketplace = lazy(() => import('@/pages/Marketplace').then(m => ({ default: m.Marketplace })));
const NoteDetail = lazy(() => import('@/pages/NoteDetail').then(m => ({ default: m.NoteDetail })));
const Bundles = lazy(() => import('@/pages/Bundles').then(m => ({ default: m.Bundles })));
const Subscription = lazy(() => import('@/pages/Subscription').then(m => ({ default: m.Subscription })));
const LegalServices = lazy(() => import('@/pages/LegalServices').then(m => ({ default: m.LegalServices })));
const Cart = lazy(() => import('@/pages/Cart').then(m => ({ default: m.Cart })));
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Login = lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })));
const MockTests = lazy(() => import('@/pages/MockTests'));
const MCQQuiz = lazy(() => import('@/pages/MCQQuiz'));
const TemplatesStore = lazy(() => import('@/pages/TemplatesStore'));
const CommunityForum = lazy(() => import('@/pages/CommunityForum'));
const ReferralProgram = lazy(() => import('@/pages/ReferralProgram'));
const CollegeLicensing = lazy(() => import('@/pages/CollegeLicensing'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const LegalHub = lazy(() => import('@/pages/LegalHub'));
const LegalPlayground = lazy(() => import('@/pages/LegalPlayground'));
const BlogArticle = lazy(() => import('@/pages/BlogArticle'));
const LegalNewsArticle = lazy(() => import('@/pages/LegalNewsArticle'));
const LegalNewsFeed = lazy(() => import('@/pages/LegalNewsFeed'));
const PlaygroundItemDetail = lazy(() => import('@/pages/PlaygroundItemDetail').then(m => ({ default: m.PlaygroundItemDetail })));
const JudgementFinder = lazy(() => import('@/pages/JudgementFinder'));
const VakilConnect = lazy(() => import('@/pages/VakilConnect'));
const VakilLawyerOnboard = lazy(() => import('@/pages/VakilLawyerOnboard'));
const VakilLawyerDashboard = lazy(() => import('@/pages/VakilLawyerDashboard'));
const VakilAdminPanel = lazy(() => import('@/pages/admin/VakilAdminPanel'));

// Playground Sub-routes
const QuizPage = lazy(() => import('@/pages/playground/QuizPage'));
const CaseLawPage = lazy(() => import('@/pages/playground/CaseLawPage'));
const DigestPage = lazy(() => import('@/pages/playground/DigestPage'));
const FlashcardsPage = lazy(() => import('@/pages/playground/FlashcardsPage'));
const InsightsPage = lazy(() => import('@/pages/playground/InsightsPage'));
const LexiconPage = lazy(() => import('@/pages/playground/LexiconPage'));

const TermsOfService = lazy(() => import('@/pages/TermsOfService').then(m => ({ default: m.TermsOfService })));
const RefundPolicy = lazy(() => import('@/pages/RefundPolicy').then(m => ({ default: m.RefundPolicy })));
const OrderSuccess = lazy(() => import('@/pages/OrderSuccess'));
// Lazy load admin components
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));
const AdminGuard = lazy(() => import('@/pages/admin/AdminGuard'));
const Overview = lazy(() => import('@/pages/admin/Overview'));

// Catalogue
const NotesManager = lazy(() => import('@/pages/admin/products/NotesManager'));
const BundlesManager = lazy(() => import('@/pages/admin/products/BundlesManager'));
const TemplatesManager = lazy(() => import('@/pages/admin/products/TemplatesManager'));
const MockTestsManager = lazy(() => import('@/pages/admin/products/MockTestsManager'));
const NoteMCQsManager = lazy(() => import('@/pages/admin/products/NoteMCQsManager'));

// Content
const BlogManager = lazy(() => import('@/pages/admin/content/BlogManager'));
const PlaygroundManager = lazy(() => import('@/pages/admin/content/PlaygroundManager'));
const PlaygroundNewsManager = lazy(() => import('@/pages/admin/content/PlaygroundNewsManager'));
const VideoLectures = lazy(() => import('@/pages/admin/content/VideoLectures'));
const FlashcardsManager = lazy(() => import('@/pages/admin/content/FlashcardsManager'));

// Sales
const OrdersManager = lazy(() => import('@/pages/admin/sales/OrdersManager'));
const CouponManager = lazy(() => import('@/pages/admin/sales/CouponManager'));

// CRM
const SubscribersManager = lazy(() => import('@/pages/admin/crm/SubscribersManager'));
const EmailCampaigns = lazy(() => import('@/pages/admin/crm/EmailCampaigns'));
const PushNotifications = lazy(() => import('@/pages/admin/crm/PushNotifications'));
const SupportTickets = lazy(() => import('@/pages/admin/crm/SupportTickets'));
const ReferralsManager = lazy(() => import('@/pages/admin/crm/ReferralsManager'));
const ServiceRequests = lazy(() => import('@/pages/admin/crm/ServiceRequests').then(m => ({ default: m.ServiceRequests })));

// System
const RevenueAnalytics = lazy(() => import('@/pages/admin/system/RevenueAnalytics'));
const LegalGlossary = lazy(() => import('@/pages/admin/system/LegalGlossary'));
const AdminAccess = lazy(() => import('@/pages/admin/system/AdminAccess'));
const Settings = lazy(() => import('@/pages/admin/system/Settings'));
const ActivityLogs = lazy(() => import('@/pages/admin/system/ActivityLogs'));

// Spinner shared between public and admin lazy loads
const FullPageSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
  </div>
);

/**
 * Inner component — must be inside <Router> so useLocation works.
 * Hides the public Navbar + Footer when on any /admin sub-route.
 */
function RefCapture() {
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      localStorage.setItem('pending_ref_code', ref.toUpperCase());
    }
  }, [searchParams]);
  return null;
}

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  // Standalone pages rendered without Navbar / Footer
  const isStandalone = location.pathname === '/legal-news-feed';
  const { isBundleModalOpen, bundleModalCount, bundleModalNoteId, setBundleModal } = useUIStore();

  return (
    <div className={`min-h-screen ${isAdmin ? 'bg-slate-50' : 'bg-parchment font-ui'}`}>
      <RefCapture />
      {!isAdmin && !isStandalone && <BundleModal isOpen={isBundleModalOpen} onClose={() => setBundleModal(false, 0, null)} noteCount={bundleModalCount} noteId={bundleModalNoteId} />}
      {!isAdmin && !isStandalone && <WishlistNudge />}
      {!isAdmin && !isStandalone && <Navbar />}
      <main>
        <PageErrorBoundary>
        <Suspense fallback={<FullPageSpinner />}>
          <Routes>
            {/* ── Public routes ── */}
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/category/:categorySlug" element={<Marketplace />} />
            <Route path="/notes/:slug" element={<NoteDetail />} />
            <Route path="/product/:slug" element={<NoteDetail />} />
            <Route path="/bundles" element={<Bundles />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/legal-services" element={<LegalServices />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/mock-tests" element={<MockTests />} />
            <Route path="/mock-tests/:bookletId" element={<MCQQuiz />} />
            <Route path="/templates" element={<TemplatesStore />} />
            <Route path="/community" element={<CommunityForum />} />
            <Route path="/referral" element={<ReferralProgram />} />
            <Route path="/college-licensing" element={<CollegeLicensing />} />
            <Route path="/legal-hub" element={<LegalHub />} />
            <Route path="/judgement-finder" element={<JudgementFinder />} />
            <Route path="/legal-playground">
              <Route index element={<LegalPlayground />} />
              <Route path="quiz" element={<QuizPage />} />
              <Route path="case-law" element={<CaseLawPage />} />
              <Route path="digest" element={<DigestPage />} />
              <Route path="flashcards" element={<FlashcardsPage />} />
              <Route path="insights" element={<InsightsPage />} />
              <Route path="lexicon" element={<LexiconPage />} />
            </Route>
            <Route path="/playground-item/:id" element={<PlaygroundItemDetail />} />
            <Route path="/blog/:slug" element={<BlogArticle />} />
            <Route path="/legal-news" element={<LegalNewsFeed />} />
            <Route path="/legal-news/:id" element={<LegalNewsArticle />} />
            <Route path="/legal-news-feed" element={<LegalNewsFeed />} />
            <Route path="/vakil-connect" element={<VakilConnect />} />
            <Route path="/vakil-connect/lawyer-onboard" element={<VakilLawyerOnboard />} />
            <Route path="/vakil-dashboard" element={<VakilLawyerDashboard />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/order-success" element={<OrderSuccess />} />

            {/* ── Admin Suite ── */}
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }
            >
              <Route index element={<Overview />} />

              {/* Catalogue */}
              <Route path="notes" element={<NotesManager />} />
              <Route path="bundles" element={<BundlesManager />} />
              <Route path="templates" element={<TemplatesManager />} />
              <Route path="mock-tests" element={<MockTestsManager />} />
              <Route path="note-mcqs" element={<NoteMCQsManager />} />

              {/* Content */}
              <Route path="blog" element={<BlogManager />} />
              <Route path="playground" element={<PlaygroundManager />} />
              <Route path="playground-news" element={<PlaygroundNewsManager />} />
              <Route path="video-lectures" element={<VideoLectures />} />
              <Route path="flashcards" element={<FlashcardsManager />} />

              {/* Sales */}
              <Route path="orders" element={<OrdersManager />} />
              <Route path="coupons" element={<CouponManager />} />
              <Route path="analytics" element={<RevenueAnalytics />} />

              {/* CRM */}
              <Route path="subscribers" element={<SubscribersManager />} />
              <Route path="email-campaigns" element={<EmailCampaigns />} />
              <Route path="notifications" element={<PushNotifications />} />
              <Route path="support" element={<SupportTickets />} />
              <Route path="referrals" element={<ReferralsManager />} />
              <Route path="service-requests" element={<ServiceRequests />} />

              {/* VakilConnect */}
              <Route path="vakil-connect" element={<VakilAdminPanel />} />

              {/* System */}
              <Route path="glossary" element={<LegalGlossary />} />
              <Route path="admins" element={<AdminAccess />} />
              <Route path="settings" element={<Settings />} />
              <Route path="activity" element={<ActivityLogs />} />
            </Route>
          </Routes>
        </Suspense>
        </PageErrorBoundary>
      </main>
      {!isAdmin && !isStandalone && <Footer />}
      {!isAdmin && !isStandalone && <WhatsAppFloat />}
      {!isAdmin && !isStandalone && <SignInPopup />}
      {!isAdmin && !isStandalone && (
        <div className="fixed bottom-6 right-28 z-[100]">
          <ScholarAI />
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
      <Toaster position="top-center" expand={true} richColors />
    </Router>
  );
}

export default App;
