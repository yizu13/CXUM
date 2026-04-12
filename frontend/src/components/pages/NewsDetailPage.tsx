import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSettings } from "../../hooks/context/SettingsContext";
import NavBar from "../layout/NavBar";
import Footer from "../layout/Footer";
import Iconify from "../modularUI/IconsMock";
import type { NewsItem } from "../../types/newsSection";
import { useNoticia, useNoticias } from "../../hooks/useNoticias";

// ─── Related Card ─────────────────────────────────────────────────────────────
function RelatedCard({
  news,
  isDark,
  index,
}: {
  news: NewsItem;
  isDark: boolean;
  index: number;
}) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      onClick={() => navigate(`/Noticias/${news.slug}`)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -4 }}
      className={`flex flex-col rounded-2xl overflow-hidden cursor-pointer ${
        isDark ? "bg-white/[0.03]" : "bg-white"
      }`}
      style={{
        boxShadow: isDark
          ? "0 0 0 1px rgba(255,255,255,0.06)"
          : "0 2px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)",
      }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative overflow-hidden" style={{ height: 160 }}>
        <motion.img
          src={news.image}
          alt={news.title}
          className="w-full h-full object-cover"
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.5 }}
          draggable={false}
        />
        <span
          className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full"
          style={{ background: news.categoryColor, color: "#fff" }}
        >
          {news.category}
        </span>
      </div>
      <div className="flex flex-col gap-2 p-4 flex-1">
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
        <motion.span
          className="flex items-center gap-1 text-[11px] font-bold mt-auto"
          style={{ color: "#f59e0b" }}
          animate={{ x: hovered ? 3 : 0 }}
          transition={{ duration: 0.2 }}
        >
          Leer más <Iconify Size={11} IconString="solar:arrow-right-line-duotone" />
        </motion.span>
      </div>
    </motion.article>
  );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({
  icon,
  label,
  isDark,
}: {
  icon: string;
  label: string;
  isDark: boolean;
}) {
  return (
    <span
      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
      style={{
        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
        color: isDark ? "rgba(255,255,255,0.5)" : "#64748b",
      }}
    >
      <Iconify Size={13} IconString={icon} />
      {label}
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { theme } = useSettings();
  const isDark = theme === "dark";

  const [inView, setInView] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const { item: news, loading, notFound } = useNoticia(slug ?? "");
  const { items: allNews } = useNoticias();

  // Noticias relacionadas: misma categoría, excluyendo la actual (máx 3)
  const related = allNews.filter(
    (n) => n.slug !== slug && n.category === news?.category
  ).slice(0, 3);

  const relatedFilled =
    related.length >= 3
      ? related
      : [
          ...related,
          ...allNews.filter(
            (n) => n.slug !== slug && !related.find((r) => r.id === n.id)
          ).slice(0, 3 - related.length),
        ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const t = setTimeout(() => setInView(true), 60);
    return () => clearTimeout(t);
  }, [slug]);

  if (loading) {
    return (
      <>
        <NavBar />
        <section className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#05070b]" : "bg-[#f8fafc]"}`}>
          <p className={`text-sm font-medium ${isDark ? "text-white/30" : "text-slate-400"}`}>Cargando...</p>
        </section>
        <Footer />
      </>
    );
  }

  // ── 404 interno ──────────────────────────────────────────────────────────────
  if (notFound || !news) {
    return (
      <>
        <NavBar />
        <section
          className={`min-h-screen flex flex-col items-center justify-center gap-6 ${
            isDark ? "bg-[#05070b]" : "bg-[#f8fafc]"
          }`}
        >
          <Iconify
            IconString="solar:document-text-bold-duotone"
            Size={64}
            Style={{ color: isDark ? "rgba(255,255,255,0.12)" : "#cbd5e1" }}
          />
          <h2 className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
            Noticia no encontrada
          </h2>
          <p className={`text-sm ${isDark ? "text-white/40" : "text-slate-500"}`}>
            El artículo que buscas no existe o fue eliminado.
          </p>
          <button
            onClick={() => navigate("/Noticias")}
            className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-full"
            style={{ background: "linear-gradient(135deg, #f59e0b, #fb923c)", color: "#fff" }}
          >
            <Iconify Size={14} IconString="solar:arrow-left-line-duotone" />
            Volver a noticias
          </button>
        </section>
        <Footer />
      </>
    );
  }

  // ── Colores adaptativos ───────────────────────────────────────────────────────
  const bg          = isDark ? "bg-[#05070b]"              : "bg-[#f8fafc]";
  const textPrimary = isDark ? "text-white"                : "text-slate-900";
  const textMuted   = isDark ? "text-white/45"             : "text-slate-500";
  const divider     = isDark ? "rgba(255,255,255,0.07)"    : "rgba(0,0,0,0.07)";
  const cardBg      = isDark ? "rgba(255,255,255,0.03)"    : "#fff";

  const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 22, filter: "blur(8px)" },
    visible: {
      opacity: 1, y: 0, filter: "blur(0px)",
      transition: { duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] as const },
    },
  });

  return (
    <>
      <NavBar />

      <main className={`min-h-screen ${bg} pt-28 pb-28 px-5 md:px-12 lg:px-20`}>
        <div className="max-w-4xl mx-auto flex flex-col gap-10">

          {/* ── Breadcrumb / Back ── */}
          <motion.button
            variants={fadeUp(0)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            onClick={() => navigate("/Noticias")}
            className="flex items-center gap-2 text-xs font-bold w-fit group"
            style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8" }}
          >
            <motion.span
              className="flex items-center"
              whileHover={{ x: -3 }}
              transition={{ duration: 0.2 }}
            >
              <Iconify Size={15} IconString="solar:arrow-left-line-duotone" />
            </motion.span>
            <span className="group-hover:underline">Sala de Prensa</span>
            <span style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#cbd5e1" }}>/</span>
            <span
              className="truncate max-w-[180px] sm:max-w-xs"
              style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#475569" }}
            >
              {news.title}
            </span>
          </motion.button>

          {/* ── Category badge ── */}
          <motion.div
            variants={fadeUp(0.05)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="flex flex-wrap items-center gap-2"
          >
            <span
              className="text-xs font-black px-3 py-1.5 rounded-full"
              style={{ background: news.categoryColor, color: "#fff" }}
            >
              {news.category}
            </span>
            <span
              className="text-[10px] font-bold tracking-[0.2em] uppercase"
              style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}
            >
              Sala de Prensa · CXUM
            </span>
          </motion.div>

          {/* ── Título ── */}
          <motion.h1
            variants={fadeUp(0.1)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className={`font-black leading-tight tracking-tight ${textPrimary}`}
            style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)" }}
          >
            {news.title}
          </motion.h1>

          {/* ── Meta strip (sin vistas) ── */}
          <motion.div
            variants={fadeUp(0.15)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="flex flex-wrap items-center gap-2"
          >
            <StatPill icon="solar:calendar-bold-duotone" label={news.date} isDark={isDark} />
            <StatPill
              icon="solar:clock-circle-bold-duotone"
              label={`${news.readTime} min de lectura`}
              isDark={isDark}
            />
            <StatPill icon="solar:user-bold-duotone" label={news.author} isDark={isDark} />
          </motion.div>

          {/* ── Hero image ── */}
          <motion.div
            ref={heroRef}
            variants={fadeUp(0.2)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="relative rounded-3xl overflow-hidden w-full"
            style={{ height: "clamp(240px, 45vw, 500px)" }}
          >
            <img
              src={news.image}
              alt={news.title}
              className="w-full h-full object-cover"
              draggable={false}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: isDark
                  ? "linear-gradient(to bottom, transparent 60%, rgba(5,7,11,0.6) 100%)"
                  : "linear-gradient(to bottom, transparent 70%, rgba(0,0,0,0.08) 100%)",
              }}
            />
          </motion.div>

          {/* ── Artículo ── */}
          <motion.article
            variants={fadeUp(0.27)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="rounded-3xl p-7 md:p-10 flex flex-col gap-7"
            style={{
              background: cardBg,
              boxShadow: isDark
                ? "0 0 0 1px rgba(255,255,255,0.06)"
                : "0 2px 32px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
            }}
          >
            {/* Lead */}
            <p
              className={`text-base md:text-lg leading-relaxed font-semibold border-l-4 pl-5 ${textPrimary}`}
              style={{ borderColor: news.categoryColor }}
            >
              {news.description}
            </p>

            <div className="h-px w-full" style={{ background: divider }} />

            {/* Cuerpo del artículo */}
            <div className={`flex flex-col gap-5 text-sm md:text-[0.95rem] leading-relaxed ${textMuted}`}>
              <p>
                La iniciativa impulsada por la Fundación CXUM continúa marcando una diferencia
                significativa en las comunidades más vulnerables del país. En esta ocasión,
                el equipo de voluntarios coordinó esfuerzos durante semanas para garantizar
                que cada detalle del proyecto en materia de{" "}
                <strong className={textPrimary}>{news.category.toLowerCase()}</strong>{" "}
                llegara a quienes más lo necesitan.
              </p>

              <p>
                Gracias al compromiso de <strong className={textPrimary}>{news.author}</strong> y
                de los colaboradores de la organización, fue posible articular alianzas
                estratégicas con empresas locales, instituciones educativas y organismos
                gubernamentales, multiplicando así el impacto de cada acción.
              </p>

              <p>
                El evento, celebrado el{" "}
                <strong className={textPrimary}>{news.date}</strong>, reunió a decenas de
                personas que donaron su tiempo y recursos. Los asistentes destacaron la
                organización del evento y la calidad del trabajo realizado por el equipo
                de CXUM, subrayando que iniciativas como esta son fundamentales para
                construir una sociedad más justa e inclusiva.
              </p>

              {/* Cita destacada */}
              <blockquote
                className="rounded-2xl px-6 py-5 my-2"
                style={{
                  background: isDark ? `${news.categoryColor}18` : `${news.categoryColor}12`,
                  borderLeft: `4px solid ${news.categoryColor}`,
                }}
              >
                <p className={`text-base font-semibold italic ${textPrimary}`}>
                  "Cada acción que tomamos hoy es una semilla que germina en el futuro de
                  nuestra comunidad. Seguiremos trabajando sin descanso."
                </p>
                <span className="text-xs font-bold mt-2 block" style={{ color: news.categoryColor }}>
                  — {news.author}, Fundación CXUM
                </span>
              </blockquote>

              <p>
                Si deseas conocer más sobre cómo puedes contribuir, visita nuestra sección
                de voluntarios o contáctanos directamente a través de los canales oficiales.
                Juntos, podemos construir una comunidad más fuerte y solidaria.
              </p>
            </div>

            <div className="h-px w-full" style={{ background: divider }} />

            {/* Footer del artículo */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm"
                  style={{ background: `linear-gradient(135deg, ${news.categoryColor}, #fb923c)` }}
                >
                  {news.author.charAt(0)}
                </div>
                <div>
                  <p className={`text-sm font-bold ${textPrimary}`}>{news.author}</p>
                  <p className="text-[11px]" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}>
                    Colaborador · Fundación CXUM
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/Noticias")}
                className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border transition-all duration-200 hover:scale-105"
                style={{
                  borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                  color: isDark ? "rgba(255,255,255,0.6)" : "#475569",
                }}
              >
                <Iconify Size={13} IconString="solar:arrow-left-line-duotone" />
                Todas las noticias
              </button>
            </div>
          </motion.article>

          {/* ── Noticias relacionadas ── */}
          {relatedFilled.length > 0 && (
            <motion.section
              variants={fadeUp(0.35)}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center gap-4">
                <div className="h-px flex-1" style={{ background: divider }} />
                <span
                  className="text-[10px] font-black tracking-[0.25em] uppercase shrink-0"
                  style={{ color: isDark ? "rgba(255,255,255,0.25)" : "#94a3b8" }}
                >
                  También te puede interesar
                </span>
                <div className="h-px flex-1" style={{ background: divider }} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {relatedFilled.map((r, i) => (
                  <RelatedCard key={r.id} news={r} isDark={isDark} index={i} />
                ))}
              </div>
            </motion.section>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
