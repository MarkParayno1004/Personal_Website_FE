import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import PortfolioPage from "./pages/PortfolioPage";

const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const CategoryDetailPage = lazy(() => import("./pages/CategoryDetailPage"));
const SavingsPage = lazy(() => import("./pages/SavingsPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const ForgotPasswordPage = lazy(() =>
  import("./pages/AuthFlows").then((m) => ({ default: m.ForgotPasswordPage })),
);
const ResetPasswordPage = lazy(() =>
  import("./pages/AuthFlows").then((m) => ({ default: m.ResetPasswordPage })),
);
const VerifyEmailPage = lazy(() =>
  import("./pages/AuthFlows").then((m) => ({ default: m.VerifyEmailPage })),
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#15121c] text-[#ece8f4] selection:bg-amber-500/25 selection:text-amber-100">
          <Navbar />

          <Suspense fallback={null}>
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

              {/* Email links (FRONTEND_URL/verify-email, /reset-password) and password recovery */}
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />

              {/* Account settings: any signed-in user */}
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <AccountPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Dashboard */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Savings Overview & Management */}
              <Route
                path="/savings"
                element={
                  <ProtectedRoute requireAdmin>
                    <SavingsPage />
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
          </Suspense>

          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: "12px",
                padding: "12px 16px",
                fontSize: "14px",
                background: "#1f1a2b",
                color: "#ece8f4",
                border: "1px solid #342c45",
              },
              success: {
                iconTheme: { primary: "#ffc86b", secondary: "#fff" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#fff" },
              },
            }}
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
