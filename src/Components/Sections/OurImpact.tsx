import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useSettings } from "../../hooks/context/SettingsContext";

const STATS = [
  {
    label: "Cuadernos Donados",
    value: 4800,
    suffix: "+",
    description:
      "Entregamos cuadernos reciclados a niños en comunidades vulnerables de toda la República Dominicana.",
  },
  {
    label: "Familias Impactadas",
    value: 1200,
    suffix: "+",
    description:
      "Familias de bajos recursos que recibieron materiales educativos gracias a nuestra red de voluntarios.",
  },
  {
    label: "Escuelas Aliadas",
    value: 70,
    suffix: "+",
    description:
      "Centros educativos que se sumaron a nuestra misión de reciclar, donar y promover la educación.",
  },
];

function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      else setCount(target);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, target, duration]);

  return count;
}

// ─── Tarjeta de stat ──────────────────────────────────────────────────────────
function StatCard({
  stat,
  index,
  active,
  isDark,
}: {
  stat: (typeof STATS)[0];
  index: number;
  active: boolean;
  isDark: boolean;
}) {
  const count = useCountUp(stat.value, 1800 + index * 200, active);

  const formatted = count.toLocaleString("es-DO");

  return (
    <motion.div
      className={`relative flex flex-col justify-between rounded-2xl p-7 overflow-hidden border ${
        isDark
          ? "bg-white/3 border-white/[0.07]"
          : "bg-white border-black/[0.07] shadow-[0_2px_24px_rgba(0,0,0,0.06)]"
      }`}
      initial={{ opacity: 0, y: 32, filter: "blur(12px)" }}
      animate={
        active
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: 32, filter: "blur(12px)" }
      }
      transition={{
        duration: 0.7,
        delay: 0.1 + index * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ minHeight: 260 }}
    >
      <span
        className={`text-xs font-bold uppercase tracking-[0.12em] ${
          isDark ? "text-white/35" : "text-slate-400"
        }`}
      >
        {stat.label}
      </span>

      <div className="mt-auto pt-10">
        <div className="flex items-end leading-none">
          <span
            className={`font-black tabular-nums ${
              isDark ? "text-white" : "text-slate-950"
            }`}
            style={{ fontSize: "clamp(3.5rem, 6vw, 5.5rem)" }}
          >
            {formatted}
          </span>
          <span
            className="font-black mb-1 ml-1"
            style={{
              fontSize: "clamp(2.5rem, 4vw, 3.8rem)",
              color: "#f59e0b",
            }}
          >
            {stat.suffix}
          </span>
        </div>

        <p
          className={`mt-3 text-sm leading-relaxed max-w-[22ch] ${
            isDark ? "text-white/40" : "text-slate-500"
          }`}
        >
          {stat.description}
        </p>
      </div>

      <span
        className={`pointer-events-none absolute -bottom-4 -right-3 font-black select-none leading-none ${
          isDark ? "text-white/3" : "text-slate-950/4"
        }`}
        style={{ fontSize: "clamp(6rem, 14vw, 12rem)" }}
      >
        {formatted}
      </span>
    </motion.div>
  );
}

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
      className={`w-full py-24 px-6 md:px-16 lg:px-24 ${
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
