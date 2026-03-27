import { motion } from "framer-motion";
import type { NEWS } from "../../types/newsSection";
import { useState } from "react";
import Iconify from "./IconsMock";

export default function NewsCard({
  news,
  index,
  inView,
  isDark,
}: {
  news: (typeof NEWS)[number];
  index: number;
  inView: boolean;
  isDark: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      className={`group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer ${
        isDark ? "bg-white/4" : "bg-white"
      }`}
      style={{
        boxShadow: isDark
          ? "0 0 0 1px rgba(255,255,255,0.06)"
          : "0 2px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)",
      }}
      initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
      animate={
        inView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: 40, filter: "blur(12px)" }
      }
      transition={{
        duration: 0.7,
        delay: index * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div className="relative overflow-hidden" style={{ height: 210 }}>
        <motion.img
          src={news.image}
          alt={news.title}
          className="w-full h-full object-cover"
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          draggable={false}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)",
          }}
        />

        <span
          className="absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full"
          style={{
            background: news.categoryColor,
            color: "#fff",
            letterSpacing: "0.03em",
          }}
        >
          {news.category}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-5 flex-1">
        <div
          className="flex items-center gap-1.5"
          style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#94a3b8" }}
        >
          <Iconify Size={13} IconString="solar:calendar-bold-duotone"/>
          <span className="text-xs font-medium">{news.date}</span>
        </div>

        <h3
          className={`font-bold leading-snug text-base ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          {news.title}
        </h3>

        <p
          className={`text-sm leading-relaxed flex-1 ${
            isDark ? "text-white/45" : "text-slate-500"
          }`}
        >
          {news.description}
        </p>
      </div>

    </motion.article>
  );
}