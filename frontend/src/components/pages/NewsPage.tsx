import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../../hooks/context/SettingsContext";
import { useSEO } from "../../hooks/useSEO";
import NavBar from "../layout/NavBar";
import Footer from "../layout/Footer";
import Iconify from "../modularUI/IconsMock";
import type { NewsItem } from "../../types/newsSection";
import { useNoticias } from "../../hooks/useNoticias";

// ─── Helpers ─────────────────────────────────────────────────────────────────
// ALL_CATEGORIES se calcula dinámicamente desde los datos de la API

// ─── Featured Hero Card ───────────────────────────────────────────────────────
function HeroCard({ news }: { news: NewsItem; isDark: boolean }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      onClick={() => navigate(`/Noticias/${news.slug}`)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -4 }}
      className="relative rounded-3xl overflow-hidden cursor-pointer"
      style={{ height: "clamp(280px, 55vw, 480px)" }}
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.img
        src={news.image}
        alt={news.title}
        className="absolute inset-0 w-full h-full object-cover"
        animate={{ scale: hovered ? 1.05 : 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        draggable={false}
      />

      {/* Gradiente */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
        }}
      />

      {/* Badge DESTACADO */}
      <div className="absolute top-5 left-5 flex items-center gap-2">
        <span
          className="text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest"
          style={{ background: "#f59e0b", color: "#fff" }}
        >
          Destacado
        </span>
        <span
          className="text-xs font-bold px-3 py-1.5 rounded-full"
          style={{ background: news.categoryColor, color: "#fff" }}
        >
          {news.category}
        </span>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-7 flex flex-col gap-3">
        <div className="flex items-center gap-3 text-white/55 text-xs">
          <span className="flex items-center gap-1">
            <Iconify Size={13} IconString="solar:calendar-bold-duotone" />
            {news.date}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Iconify Size={13} IconString="solar:clock-circle-bold-duotone" />
            {news.readTime} min lectura
          </span>
        </div>

        <h2
          className="text-white font-black leading-tight"
          style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}
        >
          {news.title}
        </h2>

        <p className="text-white/65 text-sm leading-relaxed max-w-2xl line-clamp-2">
          {news.description}
        </p>

        <div className="flex items-center justify-between mt-1">
          <span className="text-white/50 text-xs font-semibold">{news.author}</span>
          <motion.span
            className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full"
            style={{ background: "rgba(245,158,11,0.9)", color: "#fff" }}
            animate={{ x: hovered ? 3 : 0 }}
            transition={{ duration: 0.2 }}
          >
            Leer noticia <Iconify Size={14} IconString="solar:arrow-right-line-duotone" />
          </motion.span>
        </div>
      </div>
    </motion.article>
  );
}

// ─── Compact list row (columna lateral) ──────────────────────────────────────
function SideCard({ news, index, isDark }: { news: NewsItem; index: number; isDark: boolean }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      onClick={() => navigate(`/Noticias/${news.slug}`)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`flex gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
        isDark
          ? hovered ? "bg-white/5" : "bg-white/2"
          : hovered ? "bg-black/4" : "bg-transparent"
      }`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden">
        <motion.img
          src={news.image}
          alt={news.title}
          className="w-full h-full object-cover"
          animate={{ scale: hovered ? 1.08 : 1 }}
          transition={{ duration: 0.4 }}
        />
        <span
          className="absolute top-1.5 left-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none"
          style={{ background: news.categoryColor, color: "#fff" }}
        >
          {news.category}
        </span>
      </div>

      <div className="flex flex-col gap-1 min-w-0">
        <span
          className="text-[10px] font-medium"
          style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#94a3b8" }}
        >
          {news.date}
        </span>
        <h4
          className={`font-bold text-sm leading-snug line-clamp-2 ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          {news.title}
        </h4>
        <div className="flex items-center gap-2 mt-auto">
          <span
            className="text-[10px] font-semibold"
            style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}
          >
            {news.author}
          </span>
          <span style={{ color: isDark ? "rgba(255,255,255,0.15)" : "#cbd5e1" }}>·</span>
          <span
            className="flex items-center gap-0.5 text-[10px]"
            style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}
          >
            <Iconify Size={10} IconString="solar:clock-circle-bold-duotone" />
            {news.readTime} min
          </span>
        </div>
      </div>
    </motion.article>
  );
}

// ─── Standard Grid Card ───────────────────────────────────────────────────────
function GridCard({ news, index, isDark }: { news: NewsItem; index: number; isDark: boolean }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      onClick={() => navigate(`/Noticias/${news.slug}`)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -5 }}
      className={`flex flex-col rounded-2xl overflow-hidden cursor-pointer ${
        isDark ? "bg-white/3" : "bg-white"
      }`}
      style={{
        boxShadow: isDark
          ? "0 0 0 1px rgba(255,255,255,0.06)"
          : "0 2px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)",
      }}
      initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative overflow-hidden" style={{ height: 190 }}>
        <motion.img
          src={news.image}
          alt={news.title}
          className="w-full h-full object-cover"
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.5 }}
          draggable={false}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 60%)" }}
        />
        <span
          className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: news.categoryColor, color: "#fff" }}
        >
          {news.category}
        </span>
      </div>

      <div className="flex flex-col gap-2.5 p-5 flex-1">
        <div
          className="flex items-center gap-2 text-[11px]"
          style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#94a3b8" }}
        >
          <span className="flex items-center gap-1">
            <Iconify Size={12} IconString="solar:calendar-bold-duotone" />
            {news.date}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Iconify Size={12} IconString="solar:clock-circle-bold-duotone" />
            {news.readTime} min
          </span>
        </div>

        <h3
          className={`font-bold leading-snug text-[0.95rem] ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          {news.title}
        </h3>

        <p
          className={`text-xs leading-relaxed flex-1 line-clamp-3 ${
            isDark ? "text-white/40" : "text-slate-500"
          }`}
        >
          {news.description}
        </p>

        <div
          className="flex items-center justify-between pt-3 border-t"
          style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }}
        >
          <span
            className="text-[11px] font-semibold"
            style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#94a3b8" }}
          >
            {news.author}
          </span>
          <motion.span
            className="flex items-center gap-1 text-[11px] font-bold"
            style={{ color: "#f59e0b" }}
            animate={{ x: hovered ? 3 : 0 }}
            transition={{ duration: 0.2 }}
          >
            Leer más <Iconify Size={12} IconString="solar:arrow-right-line-duotone" />
          </motion.span>
        </div>
      </div>
    </motion.article>
  );
}

export default function NewsPage() {
  const { theme } = useSettings();
  const isDark = theme === "dark";
  const { items: NEWS_BY_DATE, loading } = useNoticias();
  useSEO();

  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [searchQuery, setSearchQuery] = useState("");

  const ALL_CATEGORIES = ["Todas", ...Array.from(new Set(NEWS_BY_DATE.map((n) => n.category)))];

  useEffect(() => {
    const timer = setTimeout(() => setInView(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const filtered = NEWS_BY_DATE.filter((n) => {
    const matchCat = activeCategory === "Todas" || n.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      n.title.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q) ||
      n.author.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const featured = filtered[0];
  const sideNews = filtered.slice(1, 4);
  const gridNews = filtered.slice(4);

  const bg            = isDark ? "bg-[#05070b]"   : "bg-[#f8fafc]";
  const textPrimary   = isDark ? "text-white"      : "text-slate-900";
  const textSecondary = isDark ? "text-white/45"   : "text-slate-500";
  const chipBase      = "px-4 py-2 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer";

  const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 24, filter: "blur(10px)" },
    visible: {
      opacity: 1, y: 0, filter: "blur(0px)",
      transition: { duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] as const },
    },
  });

  return (
    <>
      <NavBar />
      <section
        id="noticias"
        ref={sectionRef}
        className={`min-h-screen w-full ${bg} pt-28 sm:pt-36 pb-20 sm:pb-28 px-4 sm:px-6 md:px-16 lg:px-24`}
      >
        <div className="max-w-6xl mx-auto flex flex-col gap-14">

          <div className="flex flex-col items-center text-center gap-4">
            <motion.span
              variants={fadeUp(0)} initial="hidden" animate={inView ? "visible" : "hidden"}
              className="text-xs font-bold tracking-[0.25em] uppercase"
              style={{ color: "#f59e0b" }}
            >
              Sala de Prensa
            </motion.span>

            <motion.h1
              variants={fadeUp(0.07)} initial="hidden" animate={inView ? "visible" : "hidden"}
              className={`font-black leading-tight tracking-tight ${textPrimary}`}
              style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)" }}
            >
              Todas las{" "}
              <span style={{
                background: "linear-gradient(135deg, #f59e0b, #fb923c)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Noticias
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp(0.14)} initial="hidden" animate={inView ? "visible" : "hidden"}
              className={`max-w-md text-base leading-relaxed ${textSecondary}`}
            >
              Mantente al día con el impacto real de nuestra comunidad,
              de más reciente a más antiguo.
            </motion.p>

            <motion.div
              className="h-0.5 rounded-full"
              style={{ backgroundColor: "#f59e0b" }}
              initial={{ width: 0, opacity: 0 }}
              animate={inView ? { width: 56, opacity: 1 } : { width: 0, opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          <motion.div
            variants={fadeUp(0.18)} initial="hidden" animate={inView ? "visible" : "hidden"}
            className="flex flex-col gap-4"
          >
            <div className="relative max-w-md mx-auto w-full">
              <Iconify
                IconString="solar:magnifer-bold-duotone"
                Size={18}
                Style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                placeholder="Buscar noticias…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm font-medium outline-none
                  transition-all duration-300 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60
                  ${isDark
                    ? "bg-white/4 border-white/8 text-white placeholder:text-white/25"
                    : "bg-white border-black/[0.07] text-slate-800 placeholder:text-slate-400"
                  }`}
              />
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {ALL_CATEGORIES.map((cat) => {
                const active = cat === activeCategory;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={chipBase}
                    style={{
                      background: active
                        ? "linear-gradient(135deg, #f59e0b, #fb923c)"
                        : isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)",
                      borderColor: active
                        ? "transparent"
                        : isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.07)",
                      color: active
                        ? "#fff"
                        : isDark ? "rgba(255,255,255,0.6)" : "#475569",
                      boxShadow: active ? "0 4px 12px rgba(245,158,11,0.3)" : "none",
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-24">
                <p className={`text-sm font-medium ${isDark ? "text-white/30" : "text-slate-400"}`}>Cargando noticias...</p>
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 py-24"
              >
                <Iconify IconString="solar:document-text-bold-duotone" Size={52} Style={{ color: isDark ? "rgba(255,255,255,0.15)" : "#cbd5e1" }} />
                <p className={`text-base font-semibold ${textSecondary}`}>No se encontraron noticias</p>
                <button
                  onClick={() => { setActiveCategory("Todas"); setSearchQuery(""); }}
                  className="text-sm font-bold underline cursor-pointer bg-transparent border-none"
                  style={{ color: "#f59e0b" }}
                >
                  Limpiar filtros
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-12"
              >
                {featured && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <HeroCard news={featured} isDark={isDark} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p
                        className="text-[10px] font-black tracking-[0.2em] uppercase mb-3 px-2 mt-2 lg:mt-0"
                        style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}
                      >
                        Más noticias recientes
                      </p>
                      {sideNews.map((n, i) => (
                        <SideCard key={n.id} news={n} index={i} isDark={isDark} />
                      ))}
                    </div>
                  </div>
                )}

                {gridNews.length > 0 && (
                  <div className="flex items-center gap-4">
                    <div className={`flex-1 h-px ${isDark ? "bg-white/6" : "bg-black/5"}`} />
                    <span
                      className="text-[10px] font-black tracking-[0.2em] uppercase shrink-0"
                      style={{ color: isDark ? "rgba(255,255,255,0.25)" : "#94a3b8" }}
                    >
                      Archivo
                    </span>
                    <div className={`flex-1 h-px ${isDark ? "bg-white/6" : "bg-black/5"}`} />
                  </div>
                )}

                {gridNews.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gridNews.map((n, i) => (
                      <GridCard key={n.id} news={n} index={i} isDark={isDark} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {filtered.length > 0 && (
            <motion.p
              className={`text-center text-xs ${textSecondary}`}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.8 }}
            >
              Mostrando{" "}
              <span className="font-bold" style={{ color: "#f59e0b" }}>
                {filtered.length}
              </span>{" "}
              {filtered.length === 1 ? "noticia" : "noticias"}
              {activeCategory !== "Todas" && ` en "${activeCategory}"`}
            </motion.p>
          )}

        </div>
      </section>
      <Footer />
    </>
  );
}
