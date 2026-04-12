import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "../../hooks/context/SettingsContext";
import KarlaFaxas from "../../assets/KarlaFaxas.jpg";
import PedroOlavarrieta from "../../assets/PedroOlavarrieta.jpeg";
import AngelicaRoa from "../../assets/AngelicaRoa.png";
import jomi from "../../assets/jomi.png";
import DarlynContreras from "../../assets/DarlynConteras.png";
import pendiente from "../../assets/pendiente.png";

const TEAM_MEMBERS = [
  {
    name: "Karla Faxas",
    role: "Fundadora y Gerente de Marketing",
    src: KarlaFaxas,
  },
  {
    name: "Pedro Olavarrieta",
    role: "Director de Marketing y Estrategia Operativa",
    src: PedroOlavarrieta,
  },
  {
    name: "Angélica Roa",
    role: "Coordinadora de Voluntariado",
    src: AngelicaRoa,
  },
  {
    name: "Josmeiry Torres",
    role: "Gerente de Posts y Comunicaciones",
    src: jomi,
  },
  {
    name: "Darlyn Contreras",
    role: "Operaciones TI",
    src: DarlynContreras,
  },
  {
    name: "Sury Rodríguez",
    role: "Subdirectora de Marketing",
    src: pendiente,
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
      ease: [0.16, 1, 0.3, 1] as const,
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
      className={`relative w-full min-h-screen px-4 sm:px-6 py-20 sm:py-28 overflow-hidden transition-colors duration-500 ${
        isDark ? "bg-[#05070b]" : "bg-[#f4f4ef]"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(249,115,22,0.15) 0%, transparent 70%)"
            : "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(249,115,22,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mb-12 sm:mb-20 flex flex-col items-center text-center">
        <motion.h2
          className={`font-black leading-tight tracking-tighter ${
            isDark ? "text-white" : "text-slate-900"
          }`}
          style={{ fontSize: "clamp(2.2rem, 8vw, 7rem)" }}
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

      {/* Desktop: panel de hover */}
      <div className="hidden md:flex relative z-10 mx-auto items-center justify-center">
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
                  cursor: "default",
                  borderRadius: "28px",
                  zIndex: isHovered ? 20 : 1,
                }}
              >
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

                <div className="relative w-full h-full overflow-hidden rounded-[28px] shadow-2xl">
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

                  <div
                    className={`absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-orange-500/20 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                  />

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

      {/* Mobile: grid de tarjetas */}
      <div className="md:hidden relative z-10 grid grid-cols-2 gap-4 max-w-lg mx-auto">
        {TEAM_MEMBERS.map((member, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-2xl overflow-hidden shadow-lg"
            style={{ aspectRatio: "3/4" }}
          >
            <img
              src={member.src}
              alt={member.name}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: "center 20%" }}
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)" }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-orange-400 text-[9px] font-black uppercase tracking-widest leading-tight mb-0.5">
                {member.role}
              </p>
              <p className="text-white text-sm font-black leading-tight">{member.name}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 mx-auto mt-16 sm:mt-24 flex max-w-xs items-center gap-6 opacity-30">
        <div className={`h-px flex-1 ${isDark ? "bg-white" : "bg-black"}`} />
        <div className="h-2 w-2 rounded-full bg-orange-500" />
        <div className={`h-px flex-1 ${isDark ? "bg-white" : "bg-black"}`} />
      </div>
    </section>
  );
}