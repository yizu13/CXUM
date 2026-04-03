import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useSettings } from "../../hooks/context/SettingsContext";
import NavBar from "../layout/NavBar";
import Footer from "../layout/Footer";
import Iconify from "../modularUI/IconsMock";
import { VOLUNTEER_MEMBERS, type VolunteerMember } from "../../types/EnumsVolunteers";
import { VolunteerFormSection } from "../FormComponents";

// ─────────────────────────────────────────────────────────────────────────────
//  AvatarCard
// ─────────────────────────────────────────────────────────────────────────────
interface AvatarCardProps {
  member: VolunteerMember;
  isDark: boolean;
  textPrimary: string;
}

function AvatarCard({ member, isDark, textPrimary }: AvatarCardProps) {
  const [imgError, setImgError] = useState(false);
  const isLarge  = member.size === "large";
  const isMedium = member.size === "medium";
  const hasImage = !!member.imageUrl && !imgError;

  return (
    <div
      className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center
        overflow-hidden border transition-all duration-300 relative group/card
        ${isDark ? "border-white/[0.07]" : "border-black/5"}`}
      style={{
        background: hasImage
          ? "transparent"
          : isDark
            ? `linear-gradient(135deg, ${member.color}18, ${member.color}08)`
            : `linear-gradient(135deg, ${member.color}22, ${member.color}0a)`,
      }}
    >
      {hasImage && (
        <img
          src={member.imageUrl}
          alt={member.name}
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {hasImage && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)",
          }}
        />
      )}

      {!hasImage && (
        <div
          className={`${isLarge ? "w-16 h-16 text-xl" : isMedium ? "w-12 h-12 text-base" : "w-8 h-8 text-xs"}
            rounded-full flex items-center justify-center font-black text-white shrink-0 relative z-10`}
          style={{
            background: `linear-gradient(135deg, ${member.color}, ${member.color}bb)`,
            boxShadow: `0 4px 16px ${member.color}55`,
          }}
        >
          {member.initials}
        </div>
      )}

      {(isLarge || isMedium) && (
        <div className={`relative z-10 text-center px-2 ${hasImage ? "absolute bottom-2" : "mt-2"}`}>
          <p className={`font-bold text-xs leading-tight ${hasImage ? "text-white" : textPrimary}`}>
            {member.name}
          </p>
          <p className="text-xs mt-0.5" style={{ color: hasImage ? "#fcd34d" : member.color }}>
            {member.role}
          </p>
        </div>
      )}

      {!isLarge && !isMedium && (
        <div
          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg
            text-xs font-semibold whitespace-nowrap opacity-0 group-hover/card:opacity-100
            transition-all duration-200 pointer-events-none z-30
            ${isDark ? "bg-zinc-800 text-white" : "bg-white text-slate-800 shadow-lg"}`}
        >
          {member.name}
        </div>
      )}

      {!hasImage && (
        <div
          className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 rounded-2xl"
          style={{ background: `linear-gradient(135deg, ${member.color}15 0%, transparent 60%)` }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────────────────────────────────────
export default function VolunteersPage() {
  const { theme } = useSettings();
  const isDark = theme === "dark";

  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setInView(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] as const },
    },
  });

  const scrollToForm = () => {
    const el = document.getElementById("form");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const bg            = isDark ? "bg-[#05070b]"                        : "bg-[#f8fafc]";
  const cardBg        = isDark ? "bg-white/[0.03] border-white/[0.07]" : "bg-white/80 border-black/[0.06]";
  const textPrimary   = isDark ? "text-white"                          : "text-slate-900";
  const textSecondary = isDark ? "text-white/45"                       : "text-slate-500";

  return (
    <>
      <NavBar />
      <section
        id="voluntarios"
        ref={sectionRef}
        className={`min-h-screen w-full ${bg} pt-36 pb-24 px-6 md:px-16 lg:px-24`}
      >
        <div className="max-w-6xl mx-auto flex flex-col gap-24">

          {/* ── Hero: grid de voluntarios ── */}
          <div className="flex flex-col items-center gap-12">

            {/* Header */}
            <div className="flex flex-col items-center text-center gap-4">
              <motion.span
                variants={fadeUp(0)} initial="hidden" animate={inView ? "visible" : "hidden"}
                className="text-xs font-bold tracking-[0.25em] uppercase"
                style={{ color: "#f59e0b" }}
              >
                Nuestra Comunidad
              </motion.span>

              <motion.h1
                variants={fadeUp(0.08)} initial="hidden" animate={inView ? "visible" : "hidden"}
                className={`font-black leading-tight tracking-tight ${textPrimary}`}
                style={{ fontSize: "clamp(2.2rem, 5.5vw, 4rem)" }}
              >
                Estos ya forman{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, #fb923c)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  parte de nuestro equipo
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp(0.16)} initial="hidden" animate={inView ? "visible" : "hidden"}
                className={`max-w-lg text-base leading-relaxed ${textSecondary}`}
              >
                Más de 200 personas comprometidas con el cambio. Cada uno aporta
                su talento, tiempo y corazón para construir una mejor comunidad.
              </motion.p>

              <motion.div
                className="h-0.5 rounded-full mt-1"
                style={{ backgroundColor: "#f59e0b" }}
                initial={{ width: 0, opacity: 0 }}
                animate={inView ? { width: 56, opacity: 1 } : { width: 0, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            {/* CTA button */}
            <motion.button
              onClick={scrollToForm}
              className="gap-2 font-bold z-50 flex items-center justify-center rounded-full shadow-lg cursor-pointer border-none outline-none px-6 py-2.5"
              style={{
                background: "#f59e0b",
                boxShadow: "0 4px 24px rgba(245,158,11,0.2)",
              }}
              initial={{ opacity: 0, scale: 0.6, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.07, boxShadow: "0 6px 32px rgba(245,158,11,0.6)" }}
              whileTap={{ scale: 0.94 }}
            >
              <Iconify Size={22} IconString="duo-icons:folder-open" />
              Quiero unirme ya
            </motion.button>

            {/* Avatar grid */}
            <motion.div
              variants={fadeUp(0.2)} initial="hidden" animate={inView ? "visible" : "hidden"}
              className="w-full"
            >
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 auto-rows-auto">
                {VOLUNTEER_MEMBERS.map((member, i) => {
                  const isLarge  = member.size === "large";
                  const isMedium = member.size === "medium";
                  const span     = isLarge ? "col-span-2 row-span-2" : isMedium ? "col-span-2" : "col-span-1";

                  return (
                    <motion.div
                      key={member.id}
                      className={`${span} relative cursor-default`}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.5, delay: 0.25 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{ scale: 1.06, zIndex: 10 }}
                    >
                      <AvatarCard member={member} isDark={isDark} textPrimary={textPrimary} />
                    </motion.div>
                  );
                })}

                {/* +185 tile */}
                <motion.div
                  className="col-span-2 row-span-2"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.5, delay: 0.25 + VOLUNTEER_MEMBERS.length * 0.04 }}
                >
                  <div
                    className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center border gap-2 ${cardBg}`}
                    style={{
                      background: isDark
                        ? "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,146,60,0.06))"
                        : "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,146,60,0.05))",
                      borderColor: isDark ? "rgba(245,158,11,0.2)" : "rgba(245,158,11,0.25)",
                    }}
                  >
                    <span className="text-3xl font-black" style={{ color: "#f59e0b" }}>+185</span>
                    <span className={`text-xs font-semibold text-center leading-tight px-2 ${textSecondary}`}>
                      más voluntarios
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Scroll hint */}
            <motion.div
              variants={fadeUp(0.35)} initial="hidden" animate={inView ? "visible" : "hidden"}
              className="flex flex-col items-center gap-3 text-center"
            >
              <div className={`flex items-center gap-3 text-sm font-semibold ${textSecondary}`}>
                <div className={`h-px w-16 ${isDark ? "bg-white/10" : "bg-black/10"}`} />
                ¿Quieres ser parte de él también?
                <div className={`h-px w-16 ${isDark ? "bg-white/10" : "bg-black/10"}`} />
              </div>
              <Iconify IconString="solar:arrow-down-bold-duotone" Size={28} Style={{ color: "#f59e0b" }} />
            </motion.div>
          </div>

          {/* ── Formulario ── */}
          <motion.div
            id="form"
            variants={fadeUp(0.1)} initial="hidden" animate={inView ? "visible" : "hidden"}
            className="flex flex-col gap-4"
          >
            {/* Section header */}
            <div className="flex flex-col items-center text-center gap-3 mb-4">
              <span
                className="text-xs font-bold tracking-[0.25em] uppercase"
                style={{ color: "#f59e0b" }}
              >
                Únete
              </span>
              <h2
                className={`font-black leading-tight ${textPrimary}`}
                style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}
              >
                Regístrate como Voluntario
              </h2>
              <p className={`max-w-md text-sm leading-relaxed ${textSecondary}`}>
                Completa el formulario y un miembro del equipo se pondrá en contacto
                contigo para coordinar tu incorporación.
              </p>
            </div>

            {/* Formulario funcional con validación */}
            <VolunteerFormSection />
          </motion.div>

        </div>
      </section>
      <Footer />
    </>
  );
}
