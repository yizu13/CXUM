import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useSettings } from "../../hooks/context/SettingsContext";
import NavBar from "../layout/NavBar";
import Footer from "../layout/Footer";
import Iconify from "../modularUI/IconsMock";
import { VOLUNTEER_MEMBERS, type VolunteerMember } from "../../types/EnumsVolunteers";

const AREAS = [
  "Educación y Capacitación",
  "Salud Comunitaria",
  "Medio Ambiente",
  "Arte y Cultura",
  "Tecnología e Innovación",
  "Comunicaciones y Redes",
  "Logística y Operaciones",
  "Apoyo Administrativo",
];

const AVAILABILITY = ["Fines de semana", "Entre semana", "Tiempo completo", "Eventos puntuales"];

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
            background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)",
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

export default function VolunteersPage() {
  const { theme } = useSettings();
  const isDark = theme === "dark";

  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView]               = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [availability, setAvailability]   = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => setInView(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const fadeUp = (delay = 0) => ({
    hidden:  { opacity: 0, y: 40, filter: "blur(10px)" },
    visible: {
      opacity: 1, y: 0, filter: "blur(0px)",
      transition: { duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] as const },
    },
  });

  const scrollToForm = () => {
    const hero = document.getElementById("form");
    if (hero) hero.scrollIntoView({ behavior: "smooth" });
  };

  const bg            = isDark ? "bg-[#05070b]"                         : "bg-[#f8fafc]";
  const cardBg        = isDark ? "bg-white/[0.03] border-white/[0.07]"  : "bg-white/80 border-black/[0.06]";
  const textPrimary   = isDark ? "text-white"                           : "text-slate-900";
  const textSecondary = isDark ? "text-white/45"                        : "text-slate-500";
  const inputClass    = isDark
    ? "bg-white/[0.04] border-white/[0.09] text-white placeholder:text-white/25"
    : "bg-white border-black/[0.07] text-slate-800 placeholder:text-slate-400";

  return (
    <>
      <NavBar />
      <section
        id="voluntarios"
        ref={sectionRef}
        className={`min-h-screen w-full ${bg} pt-36 pb-24 px-6 md:px-16 lg:px-24`}
      >
        <div className="max-w-6xl mx-auto flex flex-col gap-24">

          <div className="flex flex-col items-center gap-12">

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
                <span style={{
                  background: "linear-gradient(135deg, #f59e0b, #fb923c)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
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

          <motion.button
          onClick={scrollToForm}
          className="bottom-6 gap-2 font-bold right-6 z-50 flex items-center justify-center rounded-full shadow-lg cursor-pointer border-none outline-none pr-4 pl-4 pt-2 pb-2"
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
           <Iconify Size={26} IconString="duo-icons:folder-open" />
          Quiero unirme ya
        </motion.button>
       
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

          <motion.div id="form"
            variants={fadeUp(0.1)} initial="hidden" animate={inView ? "visible" : "hidden"}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col items-center text-center gap-3 mb-4" >
              <span className="text-xs font-bold tracking-[0.25em] uppercase" style={{ color: "#f59e0b" }}>
                Únete
              </span>
              <h2 className={`font-black leading-tight ${textPrimary}`}
                style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>
                Regístrate como Voluntario
              </h2>
              <p className={`max-w-md text-sm leading-relaxed ${textSecondary}`}>
                Completa el formulario y un miembro del equipo se pondrá en contacto
                contigo para coordinar tu incorporación.
              </p>
            </div>

            <div className={`w-full max-w-3xl mx-auto p-8 md:p-12 rounded-3xl border backdrop-blur-md ${cardBg}`}>
              <div className="flex flex-col gap-8">

                <div className="flex flex-col gap-3">
                  <SectionLabel icon="solar:user-bold-duotone" label="Información Personal" isDark={isDark} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Nombre *"  placeholder="Tu nombre"   isDark={isDark} inputClass={inputClass} textSecondary={textSecondary} />
                    <FormField label="Apellido *" placeholder="Tu apellido" isDark={isDark} inputClass={inputClass} textSecondary={textSecondary} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Cédula / Pasaporte *" placeholder="000-0000000-0" isDark={isDark} inputClass={inputClass} textSecondary={textSecondary} />
                    <FormField label="Fecha de Nacimiento *" placeholder="" type="date" isDark={isDark} inputClass={inputClass} textSecondary={textSecondary} />
                  </div>
                  <FormField label="Dirección" placeholder="Calle, sector, ciudad" isDark={isDark} inputClass={inputClass} textSecondary={textSecondary} />
                </div>

                <Divider isDark={isDark} />

                <div className="flex flex-col gap-3">
                  <SectionLabel icon="solar:phone-bold-duotone" label="Datos de Contacto" isDark={isDark} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Correo Electrónico *" placeholder="correo@ejemplo.com" type="email" isDark={isDark} inputClass={inputClass} textSecondary={textSecondary} />
                    <FormField label="Teléfono / WhatsApp *" placeholder="+1 (809) 000-0000" type="tel" isDark={isDark} inputClass={inputClass} textSecondary={textSecondary} />
                  </div>
                  <FormField label="Redes Sociales" placeholder="@tu_usuario (Instagram, Facebook, etc.)" isDark={isDark} inputClass={inputClass} textSecondary={textSecondary} />
                </div>

                <Divider isDark={isDark} />

                <div className="flex flex-col gap-3">
                  <SectionLabel icon="solar:bag-bold-duotone" label="Perfil Profesional" isDark={isDark} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Profesión / Ocupación" placeholder="Estudiante, Ingeniero, Médico…" isDark={isDark} inputClass={inputClass} textSecondary={textSecondary} />
                    <FormField label="Nivel de Educación" placeholder="" isDark={isDark} inputClass={inputClass} textSecondary={textSecondary} isSelect
                      options={["Bachillerato", "Técnico / Tecnólogo", "Licenciatura", "Maestría / Postgrado", "Doctorado"]} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold tracking-wider uppercase"
                      style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#64748b" }}>
                      Habilidades y Experiencia
                    </label>
                    <textarea placeholder="Describe brevemente tus habilidades, experiencias previas en voluntariado o áreas de interés…"
                      rows={4}
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-medium resize-none outline-none
                        transition-all duration-300 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 ${inputClass}`}
                    />
                  </div>
                </div>

                <Divider isDark={isDark} />

                <div className="flex flex-col gap-3">
                  <SectionLabel icon="solar:star-bold-duotone" label="Áreas de Interés" isDark={isDark} />
                  <p className={`text-xs ${textSecondary}`}>Selecciona una o más áreas en las que te gustaría colaborar:</p>
                  <div className="flex flex-wrap gap-2">
                    {AREAS.map((area) => {
                      const active = selectedAreas.includes(area);
                      return (
                        <button key={area} type="button" onClick={() => toggleArea(area)}
                          className="px-3.5 py-2 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer"
                          style={{
                            background: active ? "linear-gradient(135deg, #f59e0b, #fb923c)" : isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)",
                            borderColor: active ? "transparent" : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                            color: active ? "#fff" : isDark ? "rgba(255,255,255,0.6)" : "#475569",
                            boxShadow: active ? "0 4px 12px rgba(245,158,11,0.35)" : "none",
                          }}>
                          {area}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Divider isDark={isDark} />

                <div className="flex flex-col gap-3">
                  <SectionLabel icon="solar:calendar-bold-duotone" label="Disponibilidad" isDark={isDark} />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {AVAILABILITY.map((opt) => {
                      const active = availability === opt;
                      return (
                        <button key={opt} type="button" onClick={() => setAvailability(opt)}
                          className="py-3 px-2 rounded-xl text-xs font-semibold border transition-all duration-200 text-center cursor-pointer"
                          style={{
                            background: active ? "linear-gradient(135deg, #f59e0b20, #fb923c10)" : isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)",
                            borderColor: active ? "#f59e0b" : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
                            color: active ? "#f59e0b" : isDark ? "rgba(255,255,255,0.5)" : "#64748b",
                          }}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  <FormField label="¿Horas semanales disponibles?" placeholder="Ej: 5 horas" isDark={isDark} inputClass={inputClass} textSecondary={textSecondary} />
                </div>

                <Divider isDark={isDark} />

                <div className="flex flex-col gap-3">
                  <SectionLabel icon="solar:heart-bold-duotone" label="Motivación" isDark={isDark} />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold tracking-wider uppercase"
                      style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#64748b" }}>
                      ¿Por qué quieres ser voluntario en CXUM?
                    </label>
                    <textarea placeholder="Cuéntanos qué te motiva, qué esperas aportar y qué esperas aprender…"
                      rows={4}
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-medium resize-none outline-none
                        transition-all duration-300 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 ${inputClass}`}
                    />
                  </div>
                  <FormField label="¿Cómo te enteraste de CXUM?" placeholder="" isDark={isDark} inputClass={inputClass} textSecondary={textSecondary} isSelect
                    options={["Redes Sociales", "Un amigo / familiar", "Evento presencial", "Búsqueda en internet", "Otro"]} />
                </div>

                <Divider isDark={isDark} />

                <div className="flex flex-col gap-3">
                  <SectionLabel icon="solar:shield-bold-duotone" label="Contacto de Emergencia" isDark={isDark} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Nombre Completo" placeholder="Nombre de contacto" isDark={isDark} inputClass={inputClass} textSecondary={textSecondary} />
                    <FormField label="Relación" placeholder="Madre, Padre, Hermano/a…" isDark={isDark} inputClass={inputClass} textSecondary={textSecondary} />
                  </div>
                  <FormField label="Teléfono de Emergencia" placeholder="+1 (809) 000-0000" type="tel" isDark={isDark} inputClass={inputClass} textSecondary={textSecondary} />
                </div>

                <div className="flex flex-col gap-5 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0
                      transition-all duration-200 group-hover:border-amber-500/60
                      ${isDark ? "border-white/20 bg-white/4" : "border-black/15 bg-white"}`}
                    />
                    <span className={`text-xs leading-relaxed ${textSecondary}`}>
                      Acepto los{" "}
                      <span style={{ color: "#f59e0b" }} className="underline cursor-pointer">términos y condiciones</span>
                      {" "}y autorizo el uso de mis datos para fines relacionados con el voluntariado en CXUM.
                    </span>
                  </label>

                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="button"
                    className="w-full py-4 rounded-xl font-black text-sm tracking-wider cursor-pointer
                      flex items-center justify-center gap-2.5 transition-all duration-300"
                    style={{
                      background: "linear-gradient(135deg, #f59e0b, #fb923c)",
                      color: "#fff",
                      boxShadow: "0 10px 30px rgba(245,158,11,0.4)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    <Iconify IconString="solar:heart-send-bold-duotone" Size={20} />
                    ENVIAR SOLICITUD DE VOLUNTARIADO
                  </motion.button>

                  <p className={`text-center text-xs ${textSecondary}`}>
                    Te contactaremos en un plazo de 3–5 días hábiles.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>
      <Footer />
    </>
  );
}


interface FormFieldProps {
  label: string;
  placeholder: string;
  type?: string;
  isDark: boolean;
  inputClass: string;
  textSecondary: string;
  isSelect?: boolean;
  options?: string[];
}

function FormField({ label, placeholder, type = "text", inputClass, textSecondary, isSelect, options }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold tracking-wider uppercase"
        style={{ color: textSecondary.includes("white") ? "rgba(255,255,255,0.45)" : "#64748b" }}>
        {label}
      </label>
      {isSelect ? (
        <select className={`w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none
          transition-all duration-300 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60
          appearance-none cursor-pointer ${inputClass}`}>
          <option value="" disabled>Selecciona una opción</option>
          {options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input type={type} placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none
            transition-all duration-300 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60
            ${inputClass}`}
        />
      )}
    </div>
  );
}

function SectionLabel({ icon, label, isDark }: { icon: string; label: string; isDark: boolean }) {
  return (
    <div className="flex items-center gap-2.5 mb-1">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
        style={{ background: "rgba(245,158,11,0.12)" }}>
        <Iconify IconString={icon} Size={18} Style={{ color: "#f59e0b" }} />
      </div>
      <span className={`text-sm font-black tracking-wide ${isDark ? "text-white/80" : "text-slate-700"}`}>
        {label}
      </span>
    </div>
  );
}

function Divider({ isDark }: { isDark: boolean }) {
  return <div className={`h-px w-full ${isDark ? "bg-white/6" : "bg-black/5"}`} />;
}
