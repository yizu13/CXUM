import Marquee from "react-fast-marquee";
import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import { useSettings } from "../../hooks/context/SettingsContext";
import { useAnimation } from "../../hooks/context/AnimationContext";
import DefaultButton from "../modularUI/GeneralButton";
import { AVATARS, palabrasRelacionadas, ROWS } from "../../types/EnumHero";
import FloatingAvatar from "../modularUI/FloatingAvatar";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const { theme } = useSettings();
  const { navReady } = useAnimation();
  const navigate = useNavigate();
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
      transition: {
        duration: 0.7,
        delay: 0.15 + i * 0.1,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    }),
  };

  return (
    <section
    id="inicio"
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
                  style={{
                    fontSize: "clamp(4rem, 7vw, 7.5rem)",
                    marginRight: "3.5rem",
                  }}
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
            className={`relative z-10 max-w-7xl font-black leading-tight tracking-tight cursor-default ${
              isDark ? "text-white" : "text-slate-950"
            }`}
            style={{ fontSize: "clamp(2rem, 6vw, 5.5rem)" }}
            custom={1}
            variants={textVariants}
            initial="hidden"
            animate={navReady ? "visible" : "hidden"}
          >
            Construyendo oportunidades,
            <br />
            <span
              className={`cursor-default ${isDark ? "text-white/70" : "text-slate-950/70"}`}
            >
              hoy para un mañana mejor
            </span>
          </motion.h1>

          <motion.p
            className={`relative z-10 max-w-md text-sm sm:text-base leading-relaxed cursor-default px-2 sm:px-0 ${
              isDark ? "text-white/40" : "text-slate-700/70"
            }`}
            custom={2}
            variants={textVariants}
            initial="hidden"
            animate={navReady ? "visible" : "hidden"}
          >
            Transformamos vidas a través del voluntariado, la educación y el
            compromiso con el medio ambiente en República Dominicana.
          </motion.p>

          <motion.div
            className="relative z-10 mt-2 flex flex-col sm:flex-row gap-3 w-full sm:w-auto px-4 sm:px-0"
            custom={3}
            variants={textVariants}
            initial="hidden"
            animate={navReady ? "visible" : "hidden"}
          >
            <DefaultButton 
              textString="Ser Centro de Acopio" 
              onClick={() => navigate("/Contacto")}
            />
            <DefaultButton 
              textString="Quiero Ser Voluntario" 
              inverted 
              onClick={() => navigate("/Voluntarios")}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
