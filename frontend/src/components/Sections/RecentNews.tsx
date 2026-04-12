import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../../hooks/context/SettingsContext";
import Iconify from "../modularUI/IconsMock";
import NewsCard from "../modularUI/NewsCard";
import { useNoticias } from "../../hooks/useNoticias";

export default function RecentNews() {
  const { theme } = useSettings();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const { items, loading } = useNoticias();
  const recent = items.slice(0, 3);

  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const headVariants = {
    hidden: { opacity: 0, y: 28, filter: "blur(14px)" },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.7,
        delay: i * 0.1,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    }),
    exit: {
      opacity: 0,
      y: -20,
      filter: "blur(10px)",
      transition: { duration: 0.45, ease: [0.76, 0, 0.24, 1] as const },
    },
  };

  return (
    <section
      id="NoticiasRecientes"
      ref={sectionRef}
      className={`w-full py-28 px-6 md:px-16 lg:px-24 ${
        isDark ? "bg-[#05070b]" : "bg-[#f8fafc]"
      }`}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-14">
        <div className="flex flex-col items-center text-center gap-3">
          <motion.h2
            className={`font-black leading-tight tracking-tight ${
              isDark ? "text-white" : "text-slate-950"
            }`}
            style={{ fontSize: "clamp(2rem, 5vw, 3.6rem)" }}
            custom={0}
            variants={headVariants}
            initial="hidden"
            animate={inView ? "visible" : "exit"}
          >
            Historias que{" "}
            <span style={{ color: "#f59e0b" }}>Inspiran</span>
          </motion.h2>

          <motion.p
            className={`max-w-md text-base leading-relaxed ${
              isDark ? "text-white/45" : "text-slate-500"
            }`}
            custom={1}
            variants={headVariants}
            initial="hidden"
            animate={inView ? "visible" : "exit"}
          >
            Conoce el impacto real de nuestro trabajo y las historias de
            transformación.
          </motion.p>

          <motion.div
            className="h-0.5 rounded-full"
            style={{ backgroundColor: "#f59e0b" }}
            custom={2}
            initial={{ width: 0, opacity: 0 }}
            animate={inView ? { width: 48, opacity: 1 } : { width: 0, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="col-span-3 text-center text-sm py-8" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}>Cargando noticias...</p>
          ) : recent.map((news, i) => (
            <NewsCard key={news.id} news={news} index={i} inView={inView} isDark={isDark} />
          ))}
        </div>

        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.6, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            onClick={() => navigate("/Noticias")}
            className="group flex items-center gap-2 text-sm font-semibold cursor-pointer bg-transparent border-none outline-none"
            style={{ color: "#f59e0b" }}
          >
            Ver todas las noticias
            <motion.span
              className="inline-flex"
              animate={{ x: 0 }}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.25 }}
            >
              <Iconify Size={16} IconString="solar:arrow-right-line-duotone" />
            </motion.span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
