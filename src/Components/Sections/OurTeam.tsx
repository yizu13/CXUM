import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "../../hooks/context/SettingsContext";

// ─────────────────────────────────────────────────────────────
//  EQUIPO — Edita los datos aquí
// ─────────────────────────────────────────────────────────────
const TEAM_MEMBERS = [
  {
    name: "Karla Faxas",
    role: "Presidenta de la Fundación",
    src: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&h=1200&fit=crop", // Reemplazar con tu local
  },
  {
    name: "Marco Valerio",
    role: "Vicepresidente",
    src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1200&fit=crop",
  },
  {
    name: "Ana Martínez",
    role: "Coordinadora de Voluntariado",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1200&fit=crop",
  },
  {
    name: "Luis Sánchez",
    role: "Director de Logística",
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1200&fit=crop",
  },
  {
    name: "Elena Gómez",
    role: "Relaciones Públicas",
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1200&fit=crop",
  },
  {
    name: "David Ruiz",
    role: "Tesorero",
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=1200&fit=crop",
  },
];

const titleVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      delay: i * 0.1,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export default function OurTeam() {
  const { theme } = useSettings();
  const isDark = theme === "dark";
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section
      id="equipo"
      className={`relative w-full min-h-screen px-6 py-28 overflow-hidden transition-colors duration-500 ${
        isDark ? "bg-[#05070b]" : "bg-[#f4f4ef]"
      }`}
    >
      {/* Fondo decorativo: Resplandor radial superior */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(249,115,22,0.15) 0%, transparent 70%)"
            : "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(249,115,22,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Encabezado */}
      <div className="relative z-10 mb-20 flex flex-col items-center text-center">
        <motion.p
          className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-orange-500"
          custom={0}
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
        >
          Nuestra Esencia
        </motion.p>

        <motion.h2
          className={`text-5xl font-black leading-tight sm:text-6xl lg:text-7xl tracking-tighter ${
            isDark ? "text-white" : "text-slate-900"
          }`}
          custom={1}
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
        >
          Las personas <span className="text-orange-500">detrás</span>
          <br />
          del cambio
        </motion.h2>
      </div>

      {/* ── CONTENEDOR DEL ACORDEÓN ── */}
      <div className="relative z-10 mx-auto flex items-center justify-center">
        <motion.div
          className="flex items-stretch justify-center gap-4 w-full"
          style={{ maxWidth: "1250px", height: "650px" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {TEAM_MEMBERS.map((member, index) => {
            const isHovered = hoveredIndex === index;
            const someoneHovered = hoveredIndex !== null;

            return (
              <motion.div
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                variants={{
                  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
                  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
                }}
                style={{
                  position: "relative",
                  flexGrow: isHovered ? 5 : 1,
                  flexBasis: isHovered ? "450px" : someoneHovered ? "70px" : "180px",
                  transition: "all 0.7s cubic-bezier(0.2, 1, 0.2, 1)",
                  cursor: "pointer",
                  borderRadius: "28px",
                  zIndex: isHovered ? 20 : 1,
                }}
              >
                {/* ── EFECTO DE BLUR / GLOW EXTERIOR ── */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute -inset-6 pointer-events-none"
                      style={{
                        background: "radial-gradient(circle, rgba(249,115,22,0.25) 0%, transparent 70%)",
                        filter: "blur(35px)",
                        zIndex: -1,
                      }}
                    />
                  )}
                </AnimatePresence>

                {/* CONTENEDOR DE IMAGEN (Clip) */}
                <div className="relative w-full h-full overflow-hidden rounded-[28px] shadow-2xl">
                  {/* Imagen */}
                  <motion.img
                    src={member.src}
                    alt={member.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{
                      objectPosition: "center 20%",
                      filter: someoneHovered && !isHovered 
                        ? "grayscale(0.4) brightness(0.4) blur(2px)" 
                        : "grayscale(0) brightness(1) blur(0px)",
                      scale: isHovered ? 1.05 : 1.1,
                      transition: "all 0.8s cubic-bezier(0.2, 1, 0.2, 1)",
                    }}
                  />

                  {/* Overlays de degradado */}
                  <div
                    className={`absolute inset-0 transition-opacity duration-700 ${
                      isHovered ? "opacity-100" : "opacity-60"
                    }`}
                    style={{
                      background: isHovered
                        ? "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)"
                        : "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
                    }}
                  />

                  {/* Resplandor naranja en la base al hacer hover */}
                  <div 
                    className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-orange-500/20 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                  />

                  {/* CONTENIDO TEXTUAL (Solo visible al expandir) */}
                  <div
                    className="absolute bottom-0 left-0 w-full p-8 transition-all duration-500"
                    style={{
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered ? "translateY(0)" : "translateY(30px)",
                      pointerEvents: "none",
                    }}
                  >
                    <p className="text-orange-400 text-xs font-black uppercase tracking-[0.2em] mb-2">
                      {member.role}
                    </p>
                    <h3 className="text-white text-4xl font-black leading-[0.9] tracking-tighter">
                      {member.name.split(" ")[0]} <br />
                      <span className="text-white/80">{member.name.split(" ")[1]}</span>
                    </h3>
                  </div>

                  {/* NOMBRE VERTICAL (Estado colapsado) */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
                      someoneHovered ? "opacity-0" : "opacity-100"
                    }`}
                  >
                    <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-[10px] [writing-mode:vertical-lr] rotate-180">
                      {member.name}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Separador decorativo final */}
      <div className="relative z-10 mx-auto mt-24 flex max-w-xs items-center gap-6 opacity-30">
        <div className={`h-[1px] flex-1 ${isDark ? "bg-white" : "bg-black"}`} />
        <div className="h-2 w-2 rounded-full bg-orange-500" />
        <div className={`h-[1px] flex-1 ${isDark ? "bg-white" : "bg-black"}`} />
      </div>
    </section>
  );
}