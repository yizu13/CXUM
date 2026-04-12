import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { STATS } from "../../types/EnumsOurImpact";


export default function StatCard({
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