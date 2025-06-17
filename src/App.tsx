import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import ConsultationPage from './pages/ConsultationPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ToolsPage from './pages/ToolsPage';
import ConsultationHistoryPage from './pages/ConsultationHistoryPage';
import FavoritesPage from './pages/FavoritesPage';
import SubscriptionPage from './pages/SubscriptionPage';
import SubscriptionSuccessPage from './pages/SubscriptionSuccessPage';
import AdminDashboard from './pages/AdminDashboard';
import AuthCallback from './pages/AuthCallback';
import AdvertiserInquiryPage from './pages/AdvertiserInquiryPage';
import AdminAdvertiserInquiriesPage from './pages/AdminAdvertiserInquiriesPage';
import AdminToolsPage from '../app/admin/tools/page';
import { AuthProvider } from './contexts/AuthContext';
import AnalyticsTracker from './components/AnalyticsTracker';

function App() {
  return (
    <AuthProvider>
      <AnalyticsTracker />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<ToolsPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/consultation" element={<ConsultationPage />} />
            <Route path="/recommendations/:id" element={<RecommendationsPage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/history" element={<ConsultationHistoryPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/subscription/success" element={<SubscriptionSuccessPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/tools" element={<AdminToolsPage />} />
            <Route path="/admin/inquiries" element={<AdminAdvertiserInquiriesPage />} />
            <Route path="/advertiser-inquiry" element={<AdvertiserInquiryPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App