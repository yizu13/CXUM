import Marquee from "react-fast-marquee";
import { useRef, useEffect, useState } from "react";
import { useSettings } from "../../hooks/context/SettingsContext";

const palabrasRelacionadas = [
  "reciclaje",
  "educación",
  "cuadernos",
  "donación",
  "sostenibilidad",
  "voluntariado",
  "papel",
  "recolección",
  "reutilización",
  "impacto",
  "comunidad",
  "estudiantes",
  "escuelas",
  "solidaridad",
  "esperanza",
  "aprendizaje",
  "transformación",
  "hojas",
  "acopio",
  "clasificación",
  "entrega",
  "medioambiente",
  "reciclado",
  "útiles",
  "niñez",
  "juventud",
  "inclusión",
  "apoyo",
  "conciencia",
  "responsabilidad",
  "acceso",
  "futuro",
  "oportunidades",
  "fundación",
  "emprendimiento",
  "alianza",
  "campaña",
  "reusar",
  "creatividad",
  "servicio",
  "cambio",
  "recursos",
  "vulnerabilidad",
  "cartón",
  "ecoeducación",
  "generosidad",
  "liderazgo",
  "propósito",
  "innovación",
  "República Dominicana",
];

const ROWS = 6;

// Posiciones fijas de los avatares (% del viewport)
const AVATAR_POSITIONS = [
  { x: 27, y: 18, depth: 0.06 },
  { x: 10, y: 45, depth: 0.09 },
  { x: 14, y: 78, depth: 0.05 },
  { x: 25, y: 60, depth: 0.07 },
  { x: 75, y: 12, depth: 0.08 },
  { x: 90, y: 35, depth: 0.06 },
  { x: 88, y: 68, depth: 0.09 },
  { x: 72, y: 82, depth: 0.05 },
];

// Avatares: reemplaza estas URLs con tus imágenes reales
const AVATAR_IMGS = [
  "https://api.dicebear.com/9.x/adventurer/svg?seed=recicla",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=verde",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=papel",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=escuela",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=futuro",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=comunidad",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=ninez",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=cambio",
];

function FloatingAvatar({
  x,
  y,
  depth,
  src,
  mouse,
  isDark,
}: {
  x: number;
  y: number;
  depth: number;
  src: string;
  mouse: { x: number; y: number };
  isDark: boolean;
}) {
  const offsetX = (mouse.x - 0.5) * depth * 420;
  const offsetY = (mouse.y - 0.5) * depth * 420;

  return (
    <div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
        transition: "transform 0.12s cubic-bezier(0.25,0.46,0.45,0.94)",
        willChange: "transform",
      }}
    >
      <img
        src={src}
        alt="avatar"
        draggable={false}
        className={`h-14 w-14 rounded-full object-cover select-none border-2 shadow-xl ${
          isDark
            ? "border-white/10 bg-white/5 shadow-black/40"
            : "border-black/8 bg-white shadow-black/15"
        }`}
      />
    </div>
  );
}

export default function Hero() {
  const { theme } = useSettings();
  const isDark = theme === "dark";
  const sectionRef = useRef<HTMLElement>(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  const wordColor = isDark ? "text-white/10" : "text-slate-950/[0.08]";

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setMouse({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };
    el.addEventListener("mousemove", handleMove);
    return () => el.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`relative h-screen w-full overflow-hidden ${
        isDark ? "bg-[#05070b]" : "bg-[#f8fafc]"
      }`}
    >
      {/* Marquee de fondo */}
      <div className="absolute inset-0 flex flex-col justify-evenly">
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
      </div>

      {/* Viñeta radial */}
      <div
        className={`pointer-events-none absolute inset-0 ${
          isDark
            ? "bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,7,11,0.3)_60%,rgba(5,7,11,0.72)_100%)]"
            : "bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(248,250,252,0.28)_60%,rgba(248,250,252,0.72)_100%)]"
        }`}
      />

      {/* Blur radial central — desvanecimiento hacia los bordes */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "min(90vw, 820px)",
          height: "min(70vw, 620px)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          maskImage:
            "radial-gradient(ellipse 55% 55% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 55% 55% at 50% 50%, black 30%, transparent 100%)",
        }}
      />

      {/* Avatares flotantes reactivos al mouse */}
      {AVATAR_POSITIONS.map((pos, i) => (
        <FloatingAvatar
          key={i}
          x={pos.x}
          y={pos.y}
          depth={pos.depth}
          src={AVATAR_IMGS[i]}
          mouse={mouse}
          isDark={isDark}
        />
      ))}

      {/* Contenido central */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center">
        {/* Badge */}
        <span
          className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
            isDark
              ? "border-white/10 bg-white/5 text-white/60"
              : "border-black/10 bg-[#f0f0c8] text-black/60"
          }`}
        >
          Reciclaje con propósito
        </span>

        {/* Título */}
        <h1
          className={`max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl ${
            isDark ? "text-white" : "text-slate-950"
          }`}
        >
          Papel usado, futuro
          <br />
          <span className={isDark ? "text-white/70" : "text-slate-950/70"}>
            construido
          </span>
        </h1>

        {/* Descripción */}
        <p
          className={`max-w-md text-base leading-relaxed ${
            isDark ? "text-white/40" : "text-slate-700/70"
          }`}
        >
          Recogemos cuadernos usados y los convertimos en herramientas
          educativas para comunidades vulnerables de República Dominicana.
        </p>

        {/* CTAs */}
        <div className="pointer-events-auto mt-2 flex gap-3">
          <button
            className={`rounded-full px-7 py-3 text-sm font-semibold transition-opacity hover:opacity-80 ${
              isDark ? "bg-white text-[#05070b]" : "bg-slate-950 text-white"
            }`}
          >
            Donar ahora
          </button>
          <button
            className={`rounded-full border px-7 py-3 text-sm font-semibold transition-opacity hover:opacity-70 ${
              isDark
                ? "border-white/15 text-white/70"
                : "border-black/15 text-slate-950/70"
            }`}
          >
            Conocer más
          </button>
        </div>
      </div>
    </section>
  );
}