import Marquee from "react-fast-marquee";
import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSettings } from "../../hooks/context/SettingsContext";
import { useAnimation } from "../../hooks/context/AnimationContext";
import DefaultButton from "../ModularUI/GeneralButton";
import avatar1 from "../../assets/imagen1.png"
import avatar2 from "../../assets/imagen2.png"
import avatar3 from "../../assets/imagen3.png"
import avatar4 from "../../assets/imagen4.png"
import avatar5 from "../../assets/imagen5.png"
import avatar6 from "../../assets/imagen6.png"
import avatar7 from "../../assets/imagen7.png"
import avatar8 from "../../assets/imagen8.png"

const palabrasRelacionadas = [
  "reciclaje", "educación", "cuadernos", "donación", "sostenibilidad",
  "voluntariado", "papel", "recolección", "reutilización", "impacto",
  "comunidad", "estudiantes", "escuelas", "solidaridad", "esperanza",
  "aprendizaje", "transformación", "hojas", "acopio", "clasificación",
  "entrega", "medioambiente", "reciclado", "útiles", "niñez", "juventud",
  "inclusión", "apoyo", "conciencia", "responsabilidad", "acceso", "futuro",
  "oportunidades", "fundación", "emprendimiento", "alianza", "campaña",
  "reusar", "creatividad", "servicio", "cambio", "recursos", "vulnerabilidad",
  "cartón", "ecoeducación", "generosidad", "liderazgo", "propósito",
  "innovación", "República Dominicana",
];
const ROWS = 6;

const AVATARS = [
  { x: 26,  y: 16,  speed: 0.022, floatAmp: 7,  floatSpeed: 1.1, floatOffset: 0,    src: avatar1,  label: "Avatar 1" },
  { x: 9,   y: 42,  speed: 0.038, floatAmp: 10, floatSpeed: 0.8, floatOffset: 1.2,  src: avatar2,    label: "Avatar 2" },
  { x: 13,  y: 76,  speed: 0.018, floatAmp: 6,  floatSpeed: 1.4, floatOffset: 2.4,  src: avatar3,    label: "Avatar 3" },
  { x: 24,  y: 58,  speed: 0.030, floatAmp: 9,  floatSpeed: 0.9, floatOffset: 0.6,  src: avatar4,  label: "Avatar 4" },
  { x: 76,  y: 13,  speed: 0.034, floatAmp: 8,  floatSpeed: 1.2, floatOffset: 3.0,  src: avatar5,   label: "Avatar 5" },
  { x: 91,  y: 38,  speed: 0.024, floatAmp: 11, floatSpeed: 0.7, floatOffset: 1.8,  src: avatar6,label: "Avatar 6" },
  { x: 87,  y: 70,  speed: 0.042, floatAmp: 7,  floatSpeed: 1.3, floatOffset: 0.9,  src: avatar7,    label: "Avatar 7" },
  { x: 73,  y: 83,  speed: 0.020, floatAmp: 9,  floatSpeed: 1.0, floatOffset: 2.1,  src: avatar8,   label: "Avatar 8" },
];

function FloatingAvatar({
  avatar,
  mouse,
  isDark,
  visible,
  enterDelay,
}: {
  avatar: typeof AVATARS[0];
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
      const y = Math.sin(elapsed * avatar.floatSpeed + avatar.floatOffset) * avatar.floatAmp;
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
          className="absolute pointer-events-none"
          style={{ left: `${avatar.x}%`, top: `${avatar.y}%` }}
          initial={{ opacity: 0, scale: 0.6, filter: "blur(12px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.7, delay: enterDelay, ease: [0.16, 1, 0.3, 1] }}
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

export default function Hero() {
  const { theme } = useSettings();
  const { navReady } = useAnimation();
  const isDark = theme === "dark";
  const sectionRef = useRef<HTMLElement>(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMouse({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    el.addEventListener("mousemove", handleMouseMove);
    return () => el.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  const wordColor = isDark ? "text-white/10" : "text-slate-950/[0.08]";

  const heroVariants = {
    hidden: { opacity: 0, filter: "blur(18px)", scale: 0.97 },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.7, delay: 0.15 + i * 0.1, ease: [0.16, 1, 0.3, 1] as const },
    }),
  };

  return (
    <section
      ref={sectionRef}
      className={`relative h-screen w-full overflow-hidden ${
        isDark ? "bg-[#05070b]" : "bg-[#f8fafc]"
      }`}
    >
      <motion.div
        className="absolute inset-0 flex flex-col justify-evenly"
        variants={heroVariants}
        initial="hidden"
        animate={navReady ? "visible" : "hidden"}
      >
        {Array.from({ length: ROWS }).map((_, rowIndex) => {
          const direction = rowIndex % 2 === 0 ? "left" : "right";
          return (
            <Marquee
              key={rowIndex}
              direction={direction}
              speed={35}
              gradient={false}
              pauseOnHover={false}
              style={{ overflow: "hidden" }}
            >
              {palabrasRelacionadas.map((word) => (
                <span
                  key={word}
                  className={`select-none font-black uppercase leading-none tracking-[-0.05em] ${wordColor}`}
                  style={{ fontSize: "clamp(4rem, 7vw, 7.5rem)", marginRight: "3.5rem" }}
                >
                  {word}
                </span>
              ))}
            </Marquee>
          );
        })}
      </motion.div>

      {AVATARS.map((avatar, i) => (
        <FloatingAvatar
          key={i}
          avatar={avatar}
          mouse={mouse}
          isDark={isDark}
          visible={navReady}
          enterDelay={i * 0.07}
        />
      ))}

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <div className="relative flex flex-col items-center gap-5 text-center">

          <div
            className="pointer-events-none absolute"
            style={{
              inset: "-80px -120px",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              maskImage:
                "radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, rgba(0,0,0,0.6) 50%, transparent 80%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, rgba(0,0,0,0.6) 50%, transparent 80%)",
            }}
          />

          <motion.h1
            className={`relative z-10 max-w-7xl text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl cursor-default ${
              isDark ? "text-white" : "text-slate-950"
            }`}
            custom={1}
            variants={textVariants}
            initial="hidden"
            animate={navReady ? "visible" : "hidden"}
          >
            Construyendo oportunidades
            <br />
            <span className={`cursor-default ${isDark ? "text-white/70" : "text-slate-950/70"}`}>
              hoy para un mañana mejor
            </span>
          </motion.h1>

          <motion.p
            className={`relative z-10 max-w-md text-base leading-relaxed cursor-default ${
              isDark ? "text-white/40" : "text-slate-700/70"
            }`}
            custom={2}
            variants={textVariants}
            initial="hidden"
            animate={navReady ? "visible" : "hidden"}
          >
            Transformamos vidas a través del voluntariado, la educación y el compromiso con el medio ambiente en República Dominicana.
          </motion.p>

          <motion.div
            className="relative z-10 mt-2 flex gap-3"
            custom={3}
            variants={textVariants}
            initial="hidden"
            animate={navReady ? "visible" : "hidden"}
          >
            <DefaultButton textString="Donar Ahora"/>
            <DefaultButton textString="Quiero Ser Voluntario" inverted/>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
