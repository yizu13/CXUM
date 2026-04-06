import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSettings } from "../../hooks/context/SettingsContext";
import { useAnimation } from "../../hooks/context/AnimationContext";
import ourWork1 from "../../assets/ourWork1.jpg";
import ourWork2 from "../../assets/ourWork2.jpg";
import ourWork3 from "../../assets/ourWork3.jpeg";

const SLIDES = [
  {
    label: "Revalorizamos",
    sub: "Recolectamos papel y cuadernos usados para darles una segunda vida.",
    src: ourWork1,
    accent: "#4ade80",
  },
  {
    label: "Donamos",
    sub: "Promovemos el acceso equitativo de la Educación.",
    src: ourWork2,
    accent: "#60a5fa",
  },
  {
    label: "Reciclamos",
    sub: "Mediante alianzas estratégicas convertimos un desperdicio en oportunidades.",
    src: ourWork3,
    accent: "#f59e0b",
  },
];

const INTERVAL = 4200;

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export default function OurWork() {
  const { theme } = useSettings();
  const { navReady } = useAnimation();
  const isDark = theme === "dark";

  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.18 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (paused || !inView || !navReady) return;
    timerRef.current = setInterval(() => {
      setDirection(1);
      setActive((prev) => mod(prev + 1, SLIDES.length));
    }, INTERVAL);
    return () => clearInterval(timerRef.current!);
  }, [paused, inView, navReady]);

  const handleClick = (i: number) => {
    clearInterval(timerRef.current!);
    clearTimeout(resumeRef.current!);
    setDirection(i > active ? 1 : -1);
    setActive(i);
    setPaused(true);
    resumeRef.current = setTimeout(() => setPaused(false), 7000);
  };

  const shouldShow = navReady && inView;

  const imgVariants = {
    enter: (dir: number) => ({
      clipPath: dir > 0 ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)",
      filter: "blur(14px) brightness(0.65) saturate(0.8)",
      scale: 1.07,
    }),
    center: {
      clipPath: "inset(0% 0% 0% 0%)",
      filter: "blur(0px) brightness(1) saturate(1)",
      scale: 1,
      transition: { duration: 0.95, ease: [0.16, 1, 0.3, 1] as const },
    },
    exit: (dir: number) => ({
      clipPath: dir > 0 ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)",
      filter: "blur(10px) brightness(0.55) saturate(0.7)",
      scale: 0.96,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] as const },
    }),
  };

  const sectionVariants = {
    hidden: {
      opacity: 0,
      y: 40,
      filter: "blur(20px)",
      transition: { duration: 0.45, ease: [0.76, 0, 0.24, 1] as const },
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const accentColor = SLIDES[active].accent;

  return (
    <motion.div
    id="NuestroTrabajo"
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden"
      variants={sectionVariants}
      initial="hidden"
      animate={shouldShow ? "visible" : "hidden"}
    >
      <motion.div
        className="absolute inset-0 z-0"
        animate={{ backgroundColor: isDark ? "#05070b" : "#0f172a" }}
        transition={{ duration: 0.6 }}
      />

      <div className="absolute inset-0 z-1">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={active}
            custom={direction}
            variants={imgVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            <img
              src={SLIDES[active].src}
              alt={SLIDES[active].label}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        className="absolute inset-0 z-2 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(5,7,11,0.92) 0%, rgba(5,7,11,0.55) 45%, rgba(5,7,11,0.08) 100%), " +
            "linear-gradient(to top, rgba(5,7,11,0.75) 0%, transparent 55%)",
        }}
      />

      <div className="relative z-10 h-full flex items-end pb-14 px-10 md:px-20">
        <div className="w-full flex flex-col gap-4 max-w-3xl">

          <div className="flex flex-col gap-0">
            {SLIDES.map((slide, i) => {
              const isActive = i === active;

              return (
                <motion.button
                  key={slide.label}
                  className="relative text-left leading-none overflow-visible cursor-pointer bg-transparent border-none p-0 outline-none"
                  onClick={() => handleClick(i)}
                  animate={{ opacity: isActive ? 1 : 0.35 }}
                  transition={{ duration: 0.35 }}
                  style={{
                    fontSize: isActive
                      ? "clamp(3.5rem, 9vw, 10rem)"
                      : "clamp(2.8rem, 7vw, 7.8rem)",
                    transition: "font-size 0.55s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease",
                  }}
                >
                  <span
                    className="block font-black uppercase tracking-[-0.04em] leading-[0.92]"
                    style={{
                      color: "transparent",
                      WebkitTextStroke: isActive
                        ? "2px rgba(255,255,255,1)"
                        : "1.5px rgba(255,255,255,0.5)",
                      transition: "-webkit-text-stroke 0.4s ease",
                    }}
                  >
                    {slide.label}
                  </span>

                  <motion.span
                    className="absolute inset-0 block font-black uppercase tracking-[-0.04em] leading-[0.92] text-white pointer-events-none"
                    animate={{
                      clipPath: isActive
                        ? "inset(0% 0% 0% 0%)"
                        : "inset(0% 100% 0% 0%)",
                    }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {slide.label}
                  </motion.span>

                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        className="absolute bottom-0 left-0 h-0.75 rounded-full"
                        style={{ backgroundColor: accentColor }}
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "100%", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                      />
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>

          <div className="overflow-hidden" style={{ height: "1.8rem" }}>
            <AnimatePresence mode="wait">
              <motion.p
                key={active}
                className="text-white/55 text-base md:text-lg font-medium leading-snug"
                initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {SLIDES[active].sub}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="flex gap-2 items-center mt-1">
            {SLIDES.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => handleClick(i)}
                className="relative rounded-full overflow-hidden cursor-pointer"
                animate={{ width: i === active ? 52 : 18 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ height: 3, background: "rgba(255,255,255,0.18)" }}
              >
                {i === active && (
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ backgroundColor: accentColor }}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    key={`${active}-${paused}`}
                    transition={{
                      duration: paused ? 0 : INTERVAL / 1000,
                      ease: "linear",
                    }}
                  />
                )}
                {i !== active && (
                  <div className="absolute inset-0 rounded-full bg-white/30" />
                )}
              </motion.button>
            ))}

         
          </div>
        </div>
      </div>
    </motion.div>

  );
}
