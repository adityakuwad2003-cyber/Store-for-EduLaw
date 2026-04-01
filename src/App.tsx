import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Home } from '@/pages/Home';
import { Marketplace } from '@/pages/Marketplace';
import { NoteDetail } from '@/pages/NoteDetail';
import { Bundles } from '@/pages/Bundles';
import { Subscription } from '@/pages/Subscription';
import { LegalServices } from '@/pages/LegalServices';
import { Cart } from '@/pages/Cart';
import { Dashboard } from '@/pages/Dashboard';
import { Login } from '@/pages/Login';
import MockTests from '@/pages/MockTests';
import TemplatesStore from '@/pages/TemplatesStore';
import CommunityForum from '@/pages/CommunityForum';
import ReferralProgram from '@/pages/ReferralProgram';
import CollegeLicensing from '@/pages/CollegeLicensing';
import { PrivacyPolicy } from '@/pages/PrivacyPolicy';
import { TermsOfService } from '@/pages/TermsOfService';
import { RefundPolicy } from '@/pages/RefundPolicy';
import { Toaster } from '@/components/ui/sonner';

import { lazy, Suspense } from 'react';

// Lazy load admin components to keep the public bundle small
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));
const AdminGuard = lazy(() => import('@/pages/admin/AdminGuard'));
const Overview = lazy(() => import('@/pages/admin/Overview'));

// Catalogue
const NotesManager = lazy(() => import('@/pages/admin/products/NotesManager'));
const BundlesManager = lazy(() => import('@/pages/admin/products/BundlesManager'));
const TemplatesManager = lazy(() => import('@/pages/admin/products/TemplatesManager'));
const MockTestsManager = lazy(() => import('@/pages/admin/products/MockTestsManager'));

// Content
const BlogManager = lazy(() => import('@/pages/admin/content/BlogManager'));
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
function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className={`min-h-screen ${isAdmin ? 'bg-slate-50' : 'bg-parchment font-ui'}`}>
      {!isAdmin && <Navbar />}
      <main>
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
            <Route path="/templates" element={<TemplatesStore />} />
            <Route path="/community" element={<CommunityForum />} />
            <Route path="/referral" element={<ReferralProgram />} />
            <Route path="/college-licensing" element={<CollegeLicensing />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />

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

              {/* Content */}
              <Route path="blog" element={<BlogManager />} />
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

              {/* System */}
              <Route path="glossary" element={<LegalGlossary />} />
              <Route path="admins" element={<AdminAccess />} />
              <Route path="settings" element={<Settings />} />
              <Route path="activity" element={<ActivityLogs />} />
            </Route>
          </Routes>
        </Suspense>
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
      <Toaster position="top-center" expand={true} richColors />
    </Router>
  );
}

export default App;
