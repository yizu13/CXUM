import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../../hooks/context/SettingsContext";
import NavBar from "../layout/NavBar";
import Footer from "../layout/Footer";
import DefaultButton from "../modularUI/GeneralButton";

export default function NotFoundPage() {
  const { theme } = useSettings();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDarkRef = useRef(isDark);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setInView(true), 120);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const blobs = [
      { x: 0.15, y: 0.3,  r: 0.28, dx: 0.00018,  dy: 0.00012,  hue: 38  },
      { x: 0.8,  y: 0.2,  r: 0.22, dx: -0.00014, dy: 0.00016,  hue: 30  },
      { x: 0.5,  y: 0.7,  r: 0.25, dx: 0.00012,  dy: -0.00018, hue: 45  },
      { x: 0.9,  y: 0.75, r: 0.2,  dx: -0.00016, dy: -0.00012, hue: 200 },
    ];

    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      blobs.forEach((b) => {
        b.x += b.dx + Math.sin(t * 0.008 + b.hue) * 0.0002;
        b.y += b.dy + Math.cos(t * 0.006 + b.hue) * 0.0002;
        if (b.x < -0.2) b.x = 1.2;
        if (b.x > 1.2)  b.x = -0.2;
        if (b.y < -0.2) b.y = 1.2;
        if (b.y > 1.2)  b.y = -0.2;
        const cx = b.x * canvas.width;
        const cy = b.y * canvas.height;
        const r  = b.r * Math.max(canvas.width, canvas.height);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        const alpha = isDarkRef.current ? 0.12 : 0.08;
        grad.addColorStop(0, `hsla(${b.hue}, 85%, 55%, ${alpha})`);
        grad.addColorStop(1, `hsla(${b.hue}, 85%, 55%, 0)`);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 32, filter: "blur(12px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
    },
  });

  const bg            = isDark ? "bg-[#05070b]"             : "bg-[#f8fafc]";
  const textPrimary   = isDark ? "text-white"               : "text-slate-900";
  const textSecondary = isDark ? "text-white/40"            : "text-slate-500";
  const cardBg        = isDark
    ? "bg-white/[0.03] border-white/[0.07]"
    : "bg-white/80 border-black/[0.06]";
  const vignetteColor = isDark ? "rgba(5,7,11,0.82)" : "rgba(248,250,252,0.82)";

  const gradDark  = "linear-gradient(140deg, rgba(255,255,255,0.6) 0%, rgba(251,191,36,0.45) 35%, rgba(245,158,11,0.3) 55%, rgba(255,255,255,0.5) 80%)";
  const gradLight = "linear-gradient(140deg, rgba(15,23,42,0.55) 0%, rgba(245,158,11,0.6) 35%, rgba(234,88,12,0.45) 60%, rgba(15,23,42,0.45) 85%)";

  return (
    <>
      <NavBar />

      <section
        className={`relative min-h-screen w-full ${bg} flex flex-col items-center justify-center overflow-hidden`}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
        />

        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          style={{ zIndex: 1 }}
        >
          <span
            className={`font-black uppercase tracking-[-0.06em] ${
              isDark ? "text-white/3" : "text-slate-950/4"
            }`}
            style={{ fontSize: "clamp(10rem, 38vw, 36rem)", lineHeight: 1 }}
          >
            404
          </span>
        </div>

        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none transition-colors duration-500"
          style={{
            zIndex: 2,
            background: `radial-gradient(ellipse 60% 58% at 50% 50%, transparent 0%, transparent 22%, ${vignetteColor} 72%)`,
          }}
        />
        <div
          className="relative flex flex-col items-center gap-8 text-center px-6 py-32"
          style={{ zIndex: 3 }}
        >
          <motion.div
            variants={fadeUp(0.08)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="relative"
            style={{ lineHeight: 1 }}
          >
            <div
              className="flex items-center gap-2"
              style={{
                opacity: isDark ? 1 : 0,
                transition: "opacity 0.4s ease",
                filter: "drop-shadow(0 8px 40px rgba(245,158,11,0.18))",
              }}
            >
              {"404".split("").map((char, i) => (
                <span
                  key={i}
                  className="font-black"
                  style={{
                    fontSize: "clamp(6rem, 22vw, 16rem)",
                    color: "transparent",
                    WebkitTextStroke: "1.5px rgba(255,255,255,0.15)",
                    background: gradDark,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 2px 14px rgba(251,191,36,0.45)) drop-shadow(0 0 4px rgba(255,255,255,0.2))",
                    animation: `lg-float ${3.2 + i * 0.3}s ease-in-out infinite`,
                    animationDelay: `${i * 0.18}s`,
                  }}
                >
                  {char}
                </span>
              ))}
            </div>

            <div
              className="absolute inset-0 flex items-center gap-2"
              style={{
                opacity: isDark ? 0 : 1,
                transition: "opacity 0.4s ease",
                filter: "drop-shadow(0 8px 40px rgba(245,158,11,0.14))",
              }}
            >
              {"404".split("").map((char, i) => (
                <span
                  key={i}
                  className="font-black"
                  style={{
                    fontSize: "clamp(6rem, 22vw, 16rem)",
                    color: "transparent",
                    WebkitTextStroke: "1.5px rgba(15,23,42,0.12)",
                    background: gradLight,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 2px 10px rgba(245,158,11,0.35))",
                    animation: `lg-float ${3.2 + i * 0.3}s ease-in-out infinite`,
                    animationDelay: `${i * 0.18}s`,
                  }}
                >
                  {char}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp(0.18)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className={`flex flex-col items-center gap-3 px-8 py-6 rounded-2xl border backdrop-blur-md max-w-md ${cardBg}`}
          >
            <h1 className={`text-xl font-black leading-tight tracking-tight ${textPrimary}`}>
              Página no encontrada
            </h1>
            <p className={`text-sm leading-relaxed text-center ${textSecondary}`}>
              La página que buscas no existe o fue movida a otra dirección.
              Regresa al inicio para seguir explorando nuestra misión.
            </p>
            <motion.div
              className="h-0.5 rounded-full"
              style={{ backgroundColor: "#f59e0b" }}
              initial={{ width: 0, opacity: 0 }}
              animate={inView ? { width: 48, opacity: 1 } : { width: 0, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </motion.div>

          <motion.div
            variants={fadeUp(0.28)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="flex flex-wrap items-center justify-center gap-3 mt-2"
          >
            <DefaultButton textString="Volver al Inicio" onClick={() => navigate("/")} />
            <DefaultButton textString="Contáctanos" inverted onClick={() => navigate("/Contacto")} />
          </motion.div>
        </div>

        <style>{`
          @keyframes lg-float {
            0%, 100% { transform: translateY(0px)   rotate(-0.4deg); }
            40%       { transform: translateY(-12px) rotate( 0.4deg); }
            70%       { transform: translateY(-6px)  rotate(-0.2deg); }
          }
        `}</style>
      </section>

      <Footer />
    </>
  );
}
