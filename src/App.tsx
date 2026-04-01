import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { Toaster } from '@/components/ui/sonner';

import { lazy, Suspense } from 'react';

// Lazy load admin components to prevent bloating the public bundle
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));
const AdminGuard = lazy(() => import('@/pages/admin/AdminGuard'));
const Overview = lazy(() => import('@/pages/admin/Overview'));
const NotesManager = lazy(() => import('@/pages/admin/products/NotesManager'));

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-parchment">
        <Navbar />
        <main>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-ink">
              <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin"></div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/notes/:slug" element={<NoteDetail />} />
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
              
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <AdminGuard>
                    <AdminLayout />
                  </AdminGuard>
                }
              >
                <Route index element={<Overview />} />
                <Route path="notes" element={<NotesManager />} />
              </Route>
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;
