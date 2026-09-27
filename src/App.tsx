import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import PortfolioPage from './pages/PortfolioPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import CategoriesPage from './pages/CategoriesPage';
import CategoryDetailPage from './pages/CategoryDetailPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#0a192f] text-[#e2e8f0] selection:bg-amber-500/25 selection:text-amber-100">
          <Navbar />

          <Routes>
            {/* Public Portfolio */}
            <Route
              path="/"
              element={
                <>
                  <PortfolioPage />
                  <Footer />
                </>
              }
            />

            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Dashboard */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Categories Overview */}
            <Route
              path="/categories"
              element={
                <ProtectedRoute requireAdmin>
                  <CategoriesPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Category Details */}
            <Route
              path="/categories/:id"
              element={
                <ProtectedRoute requireAdmin>
                  <CategoryDetailPage />
                </ProtectedRoute>
              }
            />
          </Routes>

          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                background: '#112240',
                color: '#e2e8f0',
                border: '1px solid #233554',
              },
              success: {
                iconTheme: { primary: '#14b8a6', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
