import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ProductPage from './pages/ProductPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import Garansi from './pages/Garansi';
import TOS from './pages/TOS';
import CaraOrder from './pages/CaraOrder';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import ErrorPage from './pages/ErrorPage';
import FloatingButtons from './components/FloatingButtons';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/service/:id" element={<ProductPage />} />
        <Route path="/checkout/success" element={<PaymentSuccessPage />} />
        <Route path="/garansi" element={<Garansi />} />
        <Route path="/tos" element={<TOS />} />
        <Route path="/cara" element={<CaraOrder />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <FloatingButtons />
    </>
  );
}

export default App;
