import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "../components/pages/LandingPage";
import ContactPage from "../components/pages/ContactPage";
import VolunteersPage from "../components/pages/VolunteersPage";
import NewsPage from "../components/pages/NewsPage";
import NewsDetailPage from "../components/pages/NewsDetailPage";
import NotFoundPage from "../components/pages/NotFoundPage";
import ScrollToTop from "../hooks/ScrollToTop";

// Platform auth pages
import LoginPage          from "../platform/pages/login";
import RegisterPage       from "../platform/pages/register";
import RestoreAccountPage from "../platform/pages/restoreAccount";
import ChangePasswordPage from "../platform/pages/changePassword";
import VerifyEmailPage    from "../platform/pages/verifyEmail";

// Platform admin pages
import AdminDashboardPage  from "../platform/pages/adminDashboard";
import AdminCentrosPage    from "../platform/pages/adminCentros";
import AdminNoticiasPage   from "../platform/pages/adminNoticias";
import AdminVoluntariosPage from "../platform/pages/adminVoluntarios";

// Layout & guards
import AdminLayout    from "../platform/components/AdminLayout";
import ProtectedRoute from "../platform/components/ProtectedRoute";
import { AuthProvider } from "../platform/components/AuthContext";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          {/* ── Sitio público ── */}
          <Route path="/"            element={<LandingPage />} />
          <Route path="/Contacto"    element={<ContactPage />} />
          <Route path="/Voluntarios" element={<VolunteersPage />} />
          <Route path="/Noticias"    element={<NewsPage />} />
          <Route path="/Noticias/:slug" element={<NewsDetailPage />} />

          {/* ── Plataforma / Auth ── */}
          <Route path="/plataforma/login"              element={<LoginPage />} />
          <Route path="/plataforma/registro"           element={<RegisterPage />} />
          <Route path="/plataforma/restaurar"          element={<RestoreAccountPage />} />
          <Route path="/plataforma/cambiar-contrasena" element={<ChangePasswordPage />} />
          <Route path="/plataforma/verificar"          element={<VerifyEmailPage />} />

          {/* ── Admin Panel (protegido) ── */}
          <Route
            path="/plataforma/admin"
            element={
             <ProtectedRoute>
                <AdminLayout />
             </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route index element={<AdminDashboardPage />} />

            {/* Centros de Acopio — visibles para todos, edición solo colaborador+ */}
            <Route
              path="centros"
              element={
                <ProtectedRoute requiredPermission="canViewCenters">
                  <AdminCentrosPage />
                </ProtectedRoute>
              }
            />

            {/* Noticias — visibles para todos los autenticados */}
            <Route
              path="noticias"
              element={
                <ProtectedRoute>
                  <AdminNoticiasPage />
                </ProtectedRoute>
              }
            />

            {/* Voluntarios — solo administradores */}
            <Route
              path="voluntarios"
              element={
               <ProtectedRoute requiredPermission="canManageUsers">
                  <AdminVoluntariosPage />
               </ProtectedRoute>
              }
            />
          </Route>

          {/* ── 404 ── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
