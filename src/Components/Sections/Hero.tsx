import { useMemo } from "react";
import { useSettings } from "../../hooks/context/SettingsContext";

export default function Hero() {
  const { theme } = useSettings();
  const isDark = theme === "dark";

  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const rows = 6;

  const repeatedWords = useMemo(() => {
    return Array.from({ length: 4 }, () => palabrasRelacionadas).flat();
  }, [palabrasRelacionadas]);

  return (
    <section
      className={`relative left-1/2 h-screen w-screen -translate-x-1/2 overflow-hidden ${
        isDark ? "bg-[#05070b]" : "bg-[#f8fafc]"
      }`}
    >
      <div className="absolute inset-0 flex flex-col justify-evenly px-6 py-10">
        {Array.from({ length: rows }).map((_, rowIndex) => {
          const goesLeft = rowIndex % 2 === 0;

          return (
            <div key={rowIndex} className="relative w-full overflow-hidden">
              <div
                className={`flex w-max items-center whitespace-nowrap ${
                    goesLeft ? "animate-marquee-left" : "animate-marquee-right"
                }`}
                style={{
                    gap: "3.5rem",
                    animationDuration: "2000s",
                }}
                >
                
                {[...repeatedWords, ...repeatedWords].map((item, index) => (
                  <span
                    key={`${rowIndex}-${item}-${index}`}
                    className={`shrink-0 select-none font-black uppercase leading-none tracking-[-0.05em] ${
                      isDark ? "text-white/10" : "text-slate-950/8"
                    }`}
                    style={{
                      fontSize: "clamp(4rem, 7vw, 7.5rem)",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className={`pointer-events-none absolute inset-0 ${
          isDark
            ? "bg-[radial-gradient(circle_at_center,transparent_40%,rgba(5,7,11,0.18)_72%,rgba(5,7,11,0.55)_100%)]"
            : "bg-[radial-gradient(circle_at_center,transparent_40%,rgba(248,250,252,0.16)_72%,rgba(248,250,252,0.45)_100%)]"
        }`}
      />
    </section>
  );
}