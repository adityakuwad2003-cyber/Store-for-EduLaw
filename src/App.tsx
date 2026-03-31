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
import { Admin } from '@/pages/Admin';
import { Login } from '@/pages/Login';
import MockTests from '@/pages/MockTests';
import TemplatesStore from '@/pages/TemplatesStore';
import CommunityForum from '@/pages/CommunityForum';
import ReferralProgram from '@/pages/ReferralProgram';
import CollegeLicensing from '@/pages/CollegeLicensing';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-parchment">
        <Navbar />
        <main>
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
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;
