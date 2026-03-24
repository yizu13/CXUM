import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useSettings } from "../../hooks/context/SettingsContext";
import { STATS } from "../../types/EnumsOurImpact";
import StatCard from "../ModularUI/StatsCards";

export default function OurImpact() {
  const { theme } = useSettings();
  const isDark = theme === "dark";

  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 }
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
      transition: { duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as const },
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
      ref={sectionRef}
      className={`w-full py-32 px-6 md:px-16 lg:px-24 ${
        isDark ? "bg-[#05070b]" : "bg-[#f4f4ef]"
      }`}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-14">

        <div className="flex flex-col items-center text-center gap-4">
          <motion.h2
            className={`font-black uppercase leading-none tracking-[-0.03em] ${
              isDark ? "text-white" : "text-slate-950"
            }`}
            style={{ fontSize: "clamp(2.4rem, 5.5vw, 5rem)" }}
            custom={0}
            variants={headVariants}
            initial="hidden"
            animate={inView ? "visible" : "exit"}
          >
            Nuestro{" "}
            <span style={{ color: "#f59e0b" }}>impacto</span>{" "}
            en acción
          </motion.h2>

          <motion.p
            className={`max-w-lg text-base leading-relaxed ${
              isDark ? "text-white/45" : "text-slate-500"
            }`}
            custom={1}
            variants={headVariants}
            initial="hidden"
            animate={inView ? "visible" : "exit"}
          >
            Cuadernos <span className={isDark ? "text-white/70" : "text-slate-700"}>X</span> Un Mañana recolecta, recicla y dona materiales
            educativos para que ningún niño se quede sin aprender.
          </motion.p>

          <motion.div
            className="h-0.5 rounded-full"
            style={{ backgroundColor: "#f59e0b" }}
            custom={2}
            initial={{ width: 0, opacity: 0 }}
            animate={
              inView
                ? { width: 48, opacity: 1 }
                : { width: 0, opacity: 0 }
            }
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STATS.map((stat, i) => (
            <StatCard
              key={stat.label}
              stat={stat}
              index={i}
              active={inView}
              isDark={isDark}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
