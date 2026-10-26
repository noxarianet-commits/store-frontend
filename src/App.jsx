import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import api from './api';
import LandingPage from './pages/LandingPage';
import ProductPage from './pages/ProductPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import Garansi from './pages/Garansi';
import TOS from './pages/TOS';
import CaraOrder from './pages/CaraOrder';
import WebsiteOrderPage from './pages/WebsiteOrderPage';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import FAQPage from './pages/FAQPage';
import ErrorPage from './pages/ErrorPage';
import FloatingButtons from './components/FloatingButtons';
import ScrollToTop from './components/ScrollToTop';
import AnimatedBackground from './components/AnimatedBackground';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UserDashboardPage from './pages/UserDashboardPage';
import TicketListPage from './pages/TicketListPage';
import TicketCreatePage from './pages/TicketCreatePage';
import TicketDetailPage from './pages/TicketDetailPage';

function App() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        if (res.data) setSettings(res.data);
      })
      .catch(err => {
        console.warn('App settings load error:', err?.message);
      });
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ScrollToTop />
        <AnimatedBackground />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/service/:id" element={<ProductPage />} />
          <Route path="/checkout/success" element={<PaymentSuccessPage />} />
          <Route path="/garansi" element={<Garansi />} />
          <Route path="/tos" element={<TOS />} />
          <Route path="/cara" element={<CaraOrder />} />
          <Route path="/website-order" element={<WebsiteOrderPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/verify" element={<VerifyEmailPage />} />
          <Route path="/auth/lupa-password" element={<ForgotPasswordPage />} />
          <Route path="/dashboard" element={<UserDashboardPage />} />
          <Route path="/ticket" element={<TicketListPage />} />
          <Route path="/ticket/new" element={<TicketCreatePage />} />
          <Route path="/ticket/:ticketNumber" element={<TicketDetailPage />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <FloatingButtons settings={settings} />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
