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

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* ── Sitio público ── */}
        <Route path="/"            element={<LandingPage />} />
        <Route path="/Contacto"    element={<ContactPage />} />
        <Route path="/Voluntarios" element={<VolunteersPage />} />
        <Route path="/Noticias"    element={<NewsPage />} />
        <Route path="/Noticias/:slug" element={<NewsDetailPage />} />

        {/* ── Plataforma / Auth ── */}
        <Route path="/plataforma/login"     element={<LoginPage />} />
        <Route path="/plataforma/registro"  element={<RegisterPage />} />
        <Route path="/plataforma/restaurar" element={<RestoreAccountPage />} />

        {/* ── 404 ── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
