import Marquee from "react-fast-marquee";
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

export default function Hero() {
  const { theme } = useSettings();
  const isDark = theme === "dark";

  const wordColor = isDark ? "text-white/10" : "text-slate-950/[0.08]";

  return (
    <section
      className={`relative h-screen w-full overflow-hidden ${
        isDark ? "bg-[#05070b]" : "bg-[#f8fafc]"
      }`}
    >
      {/* Filas de marquee — sin padding lateral, sin overflow propio */}
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
      </div>

      {/* Viñeta radial para suavizar los bordes */}
      <div
        className={`pointer-events-none absolute inset-0 ${
          isDark
            ? "bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(5,7,11,0.25)_65%,rgba(5,7,11,0.65)_100%)]"
            : "bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(248,250,252,0.2)_65%,rgba(248,250,252,0.55)_100%)]"
        }`}
      />
    </section>
  );
}