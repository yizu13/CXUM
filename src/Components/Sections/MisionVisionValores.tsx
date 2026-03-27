import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useSettings } from "../../hooks/context/SettingsContext";

// ─── Animation helpers ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(10px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      delay: i * 0.09,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
  exit: {
    opacity: 0,
    y: -16,
    filter: "blur(8px)",
    transition: { duration: 0.4, ease: [0.76, 0, 0.24, 1] as const },
  },
};

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MisionVisionValores() {
  const { theme } = useSettings();
  const isDark = theme === "dark";

  const section = useInView(0.1);

  const bg = isDark ? "bg-[#05070b]" : "bg-[#f4f4ef]";
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSub = isDark ? "text-white/50" : "text-slate-500";
  const textBody = isDark ? "text-white/60" : "text-slate-600";

  // Card base styles
  const cardLight = isDark
    ? "bg-white/[0.04] border border-white/[0.08]"
    : "bg-white border border-slate-200/70";
  const cardDark = isDark
    ? "bg-[#1a2a1a] border border-white/[0.06]"
    : "bg-[#2d4a2d] border border-transparent";
  const cardAccent = isDark
    ? "bg-orange-500/15 border border-orange-500/20"
    : "bg-orange-50 border border-orange-200/60";

  return (
    <section
      id="MisionVision"
      ref={section.ref}
      className={`w-full ${bg} transition-colors duration-500 px-6 md:px-12 lg:px-20 py-24`}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-10">

        {/* ── Header ── */}
        <div className="flex flex-col gap-2">
          <motion.h2
            className={`text-4xl md:text-5xl font-black leading-tight tracking-tight ${textPrimary}`}
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={section.inView ? "visible" : "exit"}
          >
            Nuestra <span className="text-orange-500">Visión</span> y Propósito
          </motion.h2>
          <motion.p
            className={`max-w-sm text-sm leading-relaxed ${textSub}`}
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate={section.inView ? "visible" : "exit"}
          >
            No solo miramos el próximo año; miramos el próximo siglo de impacto educativo y ambiental.
          </motion.p>
        </div>

        {/* ── BENTO GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 grid-rows-[auto] gap-4">

          {/* ROW 1 — col 1-7: Misión (large card with bg image placeholder) */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate={section.inView ? "visible" : "exit"}
            className={`md:col-span-7 relative rounded-2xl overflow-hidden min-h-[260px] flex flex-col justify-end p-7 ${cardLight}`}
          >
            {/* Background texture / pattern */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: isDark
                  ? "radial-gradient(circle at 30% 40%, rgba(249,115,22,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(249,115,22,0.05) 0%, transparent 50%)"
                  : "radial-gradient(circle at 30% 40%, rgba(249,115,22,0.06) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(249,115,22,0.04) 0%, transparent 50%)",
              }}
            />
            {/* Vertical lines decorative */}
            <div className="absolute inset-0 overflow-hidden opacity-20">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`absolute top-0 bottom-0 w-px ${isDark ? "bg-white/20" : "bg-slate-300"}`}
                  style={{ left: `${(i + 1) * 12.5}%` }}
                />
              ))}
            </div>

            <div className="relative z-10 flex flex-col gap-2">
              <h3 className={`text-xl md:text-2xl font-black ${textPrimary}`}>
                Operaciones sin <span className="text-orange-500">huella de carbono</span> para 2030
              </h3>
              <p className={`text-sm leading-relaxed max-w-md ${textBody}`}>
                Transformamos toda nuestra logística hacia vehículos eléctricos y alimentamos nuestros centros de acopio con energía 100% renovable.
              </p>
            </div>
          </motion.div>

          {/* ROW 1 — col 8-12: Visión (dark accent card) */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate={section.inView ? "visible" : "exit"}
            className={`md:col-span-5 relative rounded-2xl overflow-hidden min-h-[260px] flex flex-col justify-between p-7 ${cardDark}`}
          >
            {/* Pin icon top right */}
            <div className="flex justify-between items-start">
              <span />
              <span className="text-2xl opacity-80">📌</span>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-black text-white">
                Visión
              </h3>
              <p className="text-sm leading-relaxed text-white/60">
                Ser la organización líder en reciclaje educativo de Latinoamérica: donde cada cuaderno usadose convierte en una oportunidad para el futuro.
              </p>
            </div>
          </motion.div>

          {/* ROW 2 — col 1-4: Valor 1 pequeño */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate={section.inView ? "visible" : "exit"}
            className={`md:col-span-4 relative rounded-2xl overflow-hidden min-h-[180px] flex flex-col justify-between p-6 ${cardAccent}`}
          >
            <span className="text-2xl">🎓</span>
            <div className="flex flex-col gap-1">
              <h3 className={`text-base font-black ${textPrimary}`}>Edu-Scraps Initiative</h3>
              <p className={`text-xs leading-relaxed ${textBody}`}>
                Distribuimos cuadernos reciclados a 1,000 escuelas sin recursos antes de 2026.
              </p>
            </div>
          </motion.div>

          {/* ROW 2 — col 5-8: Misión texto + col 9-12: Expansión con imagen */}
          <motion.div
            custom={5}
            variants={fadeUp}
            initial="hidden"
            animate={section.inView ? "visible" : "exit"}
            className={`md:col-span-8 relative rounded-2xl overflow-hidden min-h-[180px] flex flex-col md:flex-row gap-0 ${cardLight}`}
          >
            {/* Text side */}
            <div className="flex-1 flex flex-col justify-center gap-2 p-6">
              <h3 className={`text-lg md:text-xl font-black ${textPrimary}`}>
                Expansión <span className="text-orange-500">Global</span>
              </h3>
              <p className={`text-xs leading-relaxed max-w-xs ${textBody}`}>
                Llevamos el modelo Cuadernos X Un Mañana a economías emergentes del Sudeste Asiático y Sudamérica para combatir el desperdicio escolar urbano.
              </p>
            </div>
            {/* Image side */}
            <div
              className="w-full md:w-44 shrink-0 min-h-[120px] md:min-h-0 rounded-b-2xl md:rounded-b-none md:rounded-r-2xl overflow-hidden"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, #1a3a5c 0%, #0d1f35 40%, #06101e 100%)",
              }}
            >
              {/* Globe SVG placeholder */}
              <div className="w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 120 120" className="w-28 h-28 opacity-90" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="60" cy="60" r="50" stroke="#4a90d9" strokeWidth="1.5" fill="#0d2a4a"/>
                  <ellipse cx="60" cy="60" rx="25" ry="50" stroke="#4a90d9" strokeWidth="1" fill="none"/>
                  <ellipse cx="60" cy="60" rx="50" ry="20" stroke="#4a90d9" strokeWidth="1" fill="none"/>
                  <ellipse cx="60" cy="60" rx="50" ry="37" stroke="#4a90d9" strokeWidth="0.8" fill="none" opacity="0.5"/>
                  {/* Continents rough shapes */}
                  <path d="M38 38 Q45 32 55 35 Q60 38 58 46 Q52 50 44 47 Z" fill="#2d6a2d" opacity="0.8"/>
                  <path d="M62 35 Q72 30 80 36 Q85 42 82 52 Q74 56 65 50 Q60 44 62 35Z" fill="#2d6a2d" opacity="0.8"/>
                  <path d="M55 60 Q65 56 72 62 Q74 70 68 76 Q60 78 54 72 Z" fill="#2d6a2d" opacity="0.7"/>
                  <path d="M32 58 Q40 54 46 60 Q46 68 40 70 Q33 68 32 62Z" fill="#2d6a2d" opacity="0.6"/>
                  <circle cx="60" cy="60" r="50" stroke="#4a90d9" strokeWidth="1.5" fill="none" opacity="0.4"/>
                </svg>
              </div>
            </div>
          </motion.div>

          {/* ROW 3 — col 1-3: Valor Sostenibilidad pequeño */}
          <motion.div
            custom={6}
            variants={fadeUp}
            initial="hidden"
            animate={section.inView ? "visible" : "exit"}
            className={`md:col-span-3 relative rounded-2xl overflow-hidden min-h-[160px] flex flex-col justify-between p-6 ${cardLight}`}
          >
            <span className="text-xl">♻️</span>
            <div className="flex flex-col gap-1">
              <h3 className={`text-sm font-black ${textPrimary}`}>Sostenibilidad</h3>
              <p className={`text-xs leading-relaxed ${textBody}`}>
                Cada cuaderno rescatado es un paso hacia un planeta más sano.
              </p>
            </div>
          </motion.div>

          {/* ROW 3 — col 4-6: Valor Solidaridad pequeño */}
          <motion.div
            custom={7}
            variants={fadeUp}
            initial="hidden"
            animate={section.inView ? "visible" : "exit"}
            className={`md:col-span-3 relative rounded-2xl overflow-hidden min-h-[160px] flex flex-col justify-between p-6 ${cardAccent}`}
          >
            <span className="text-xl">🤝</span>
            <div className="flex flex-col gap-1">
              <h3 className={`text-sm font-black ${textPrimary}`}>Solidaridad</h3>
              <p className={`text-xs leading-relaxed ${textBody}`}>
                Juntos construimos un futuro más justo para todos.
              </p>
            </div>
          </motion.div>

          {/* ROW 3 — col 7-12: Objetivo grande */}
          <motion.div
            custom={8}
            variants={fadeUp}
            initial="hidden"
            animate={section.inView ? "visible" : "exit"}
            className={`md:col-span-6 relative rounded-2xl overflow-hidden min-h-[160px] flex flex-col justify-between p-6 ${cardLight}`}
          >
            {/* large number watermark */}
            <span
              className={`absolute right-4 bottom-0 font-black leading-none select-none ${
                isDark ? "text-white/[0.05]" : "text-slate-900/[0.05]"
              }`}
              style={{ fontSize: "7rem" }}
            >
              01
            </span>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xs font-black">01</span>
              <span className={`text-xs font-bold uppercase tracking-widest text-orange-500`}>Objetivo principal</span>
            </div>
            <div className="relative z-10 flex flex-col gap-1">
              <h3 className={`text-lg font-black ${textPrimary}`}>Recolección Masiva Nacional</h3>
              <p className={`text-xs leading-relaxed max-w-sm ${textBody}`}>
                Ampliar la red de centros de acopio en toda la República Dominicana para rescatar cuadernos al cierre de cada año escolar.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
