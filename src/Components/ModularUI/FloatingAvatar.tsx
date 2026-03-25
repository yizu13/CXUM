import { useEffect, useRef, useState } from "react";
import type { AVATARS } from "../../types/EnumHero";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";

export default function FloatingAvatar({
  avatar,
  mouse,
  isDark,
  visible,
  enterDelay,
}: {
  avatar: (typeof AVATARS)[0];
  mouse: { x: number; y: number };
  isDark: boolean;
  visible: boolean;
  enterDelay: number;
}) {
  const [floatY, setFloatY] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = (ts - startRef.current) / 1000;
      const y =
        Math.sin(elapsed * avatar.floatSpeed + avatar.floatOffset) *
        avatar.floatAmp;
      setFloatY(y);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [avatar.floatSpeed, avatar.floatOffset, avatar.floatAmp]);

  const mouseOffsetX = (mouse.x - 0.5) * avatar.speed * window.innerWidth;
  const mouseOffsetY = (mouse.y - 0.5) * avatar.speed * window.innerHeight;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute pointer-events-none mt-5"
          style={{ left: `${avatar.x}%`, top: `${avatar.y}%` }}
          initial={{ opacity: 0, scale: 0.6, filter: "blur(12px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{
            duration: 0.7,
            delay: enterDelay,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <div
            style={{
              transform: `translate(calc(-50% + ${mouseOffsetX}px), calc(-50% + ${mouseOffsetY + floatY}px))`,
              transition: "transform 0.18s cubic-bezier(0.25,0.46,0.45,0.94)",
              willChange: "transform",
            }}
          >
            <img
              src={avatar.src}
              alt={avatar.label}
              draggable={false}
              className={`h-14 w-14 rounded-full object-cover select-none border-2 shadow-xl ${
                isDark
                  ? "border-white/10 bg-white/5 shadow-black/40"
                  : "border-black/8 bg-white shadow-black/15"
              }`}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}