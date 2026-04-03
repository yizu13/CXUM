import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "../components/pages/LandingPage";
import ContactPage from "../components/pages/ContactPage";
import VolunteersPage from "../components/pages/VolunteersPage";
import NewsPage from "../components/pages/NewsPage";
import NotFoundPage from "../components/pages/NotFoundPage";
import ScrollToTop from "../hooks/ScrollToTop";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/Contacto" element={<ContactPage />} />
        <Route path="/Voluntarios" element={<VolunteersPage />} />
        <Route path="/Noticias" element={<NewsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
