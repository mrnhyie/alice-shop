import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';

import Landing from './pages/Landing';
import Store from './pages/Store';
import Checkout from './pages/Checkout';
import CustomerLogin from './pages/CustomerLogin';
import CustomerRegister from './pages/CustomerRegister';
import ProductDetail from './pages/ProductDetail';
import CustomerMessages from './pages/CustomerMessages';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminAnalytics from './pages/admin/Analytics';
import AdminCustomers from './pages/admin/Customers';
import AdminMarketing from './pages/admin/Marketing';
import AdminSettings from './pages/admin/Settings';
import AdminSecurity from './pages/admin/Security';

// ── Auth guard: redirects to /admin/login if not authenticated ────────────────
function RequireAuth() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <AuthProvider>
      <CustomerAuthProvider>
        <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Public ── */}
            <Route path="/" element={<Landing />} />
            <Route path="/store" element={<Store />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<CustomerLogin />} />
            <Route path="/register" element={<CustomerRegister />} />
            <Route path="/messages" element={<CustomerMessages />} />

            {/* ── Admin login (public) ── */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* ── Protected admin area ── */}
            <Route path="/admin" element={<RequireAuth />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard"  element={<Dashboard />} />
                <Route path="products"   element={<AdminProducts />} />
                <Route path="orders"     element={<AdminOrders />} />
                <Route path="analytics"  element={<AdminAnalytics />} />
                <Route path="customers"  element={<AdminCustomers />} />
                <Route path="marketing"  element={<AdminMarketing />} />
                <Route path="settings"   element={<AdminSettings />} />
                <Route path="security"   element={<AdminSecurity />} />
              </Route>
            </Route>

            {/* ── Catch-all ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        </CartProvider>
      </CustomerAuthProvider>
    </AuthProvider>
  );
}
