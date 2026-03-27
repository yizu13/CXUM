import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useSettings } from "../../hooks/context/SettingsContext";
import NavBar from "../layout/NavBar";
import Footer from "../layout/Footer";
import Iconify from "../ModularUI/IconsMock";

const CONTACT_METHODS = [
  {
    icon: "solar:phone-bold-duotone",
    label: "Teléfono",
    value: "+1 (809) 000-0000",
    sub: "Lun – Vie, 8am – 5pm",
    color: "#f59e0b",
  },
  {
    icon: "solar:letter-bold-duotone",
    label: "Correo",
    value: "contacto@cxum.org",
    sub: "Te respondemos en 24h",
    color: "#f59e0b",
  },
  {
    icon: "solar:map-point-bold-duotone",
    label: "Ubicación",
    value: "Santo Domingo, RD",
    sub: "República Dominicana",
    color: "#f59e0b",
  },
];

const SOCIAL_LINKS = [
  { icon: "mdi:instagram", label: "Instagram", href: "#" },
  { icon: "mdi:facebook", label: "Facebook", href: "#" },
  { icon: "mdi:twitter", label: "Twitter / X", href: "#" },
  { icon: "mdi:whatsapp", label: "WhatsApp", href: "#" },
];

export default function ContactPage() {
  const { theme } = useSettings();
  const isDark = theme === "dark";

  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Trigger inView immediately on mount
  useEffect(() => {
    const timer = setTimeout(() => setInView(true), 100);
    return () => clearTimeout(timer);
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

  const bg = isDark ? "bg-[#05070b]" : "bg-[#f8fafc]";
  const cardBg = isDark
    ? "bg-white/[0.03] border-white/[0.07]"
    : "bg-white/80 border-black/[0.06]";
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-white/45" : "text-slate-500";

  return (
    <>
      <NavBar />
      <section
        id="contacto"
        ref={sectionRef}
        className={`min-h-screen w-full ${bg} pt-36 pb-24 px-6 md:px-16 lg:px-24`}
      >
        <div className="max-w-6xl mx-auto flex flex-col gap-20">

          {/* ── Header ── */}
          <div className="flex flex-col items-center text-center gap-4">
            <motion.span
              variants={fadeUp(0)}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="text-xs font-bold tracking-[0.25em] uppercase"
              style={{ color: "#f59e0b" }}
            >
              Hablemos
            </motion.span>

            <motion.h1
              variants={fadeUp(0.08)}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className={`font-black leading-tight tracking-tight ${textPrimary}`}
              style={{ fontSize: "clamp(2.4rem, 6vw, 4.2rem)" }}
            >
              Contáctanos
            </motion.h1>

            <motion.p
              variants={fadeUp(0.16)}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className={`max-w-md text-base leading-relaxed ${textSecondary}`}
            >
              ¿Tienes preguntas, quieres ser voluntario o deseas apoyar nuestra
              misión? Estamos aquí para escucharte.
            </motion.p>

            <motion.div
              className="h-0.5 rounded-full mt-1"
              style={{ backgroundColor: "#f59e0b" }}
              initial={{ width: 0, opacity: 0 }}
              animate={inView ? { width: 56, opacity: 1 } : { width: 0, opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* ── Left: contact info ── */}
            <div className="flex flex-col gap-8">
              <motion.div
                variants={fadeUp(0.1)}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="flex flex-col gap-5"
              >
                {CONTACT_METHODS.map((method, i) => (
                  <motion.div
                    key={method.label}
                    variants={fadeUp(0.12 + i * 0.08)}
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                    className={`flex items-center gap-5 p-5 rounded-2xl border backdrop-blur-md transition-all duration-300
                      hover:scale-[1.02] cursor-default ${cardBg}`}
                  >
                    <div
                      className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
                      style={{ background: "rgba(245,158,11,0.12)" }}
                    >
                      <Iconify IconString={method.icon} Size={26} Style={{ color: method.color }} />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs font-semibold tracking-widest uppercase ${textSecondary}`}>
                        {method.label}
                      </span>
                      <span className={`text-base font-bold ${textPrimary}`}>{method.value}</span>
                      <span className={`text-xs ${textSecondary}`}>{method.sub}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Social links */}
              <motion.div
                variants={fadeUp(0.38)}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="flex flex-col gap-3"
              >
                <span className={`text-xs font-semibold tracking-widest uppercase ${textSecondary}`}>
                  Síguenos
                </span>
                <div className="flex gap-3 flex-wrap">
                  {SOCIAL_LINKS.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      aria-label={s.label}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-semibold
                        transition-all duration-300 hover:scale-105 ${cardBg} ${textPrimary}`}
                    >
                      <Iconify IconString={s.icon} Size={18} />
                      {s.label}
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ── Right: form UI (solo diseño) ── */}
            <motion.div
              variants={fadeUp(0.15)}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className={`flex flex-col gap-6 p-8 rounded-3xl border backdrop-blur-md ${cardBg}`}
            >
              <h2 className={`text-xl font-black ${textPrimary}`}>
                Envíanos un mensaje
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Nombre" placeholder="Tu nombre" isDark={isDark} />
                <FormField label="Apellido" placeholder="Tu apellido" isDark={isDark} />
              </div>

              <FormField label="Correo electrónico" placeholder="correo@ejemplo.com" type="email" isDark={isDark} />

              <FormField label="Asunto" placeholder="¿En qué podemos ayudarte?" isDark={isDark} />

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-semibold tracking-wider uppercase"
                  style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#64748b" }}
                >
                  Mensaje
                </label>
                <textarea
                  placeholder="Escribe tu mensaje aquí..."
                  rows={5}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium
                    resize-none outline-none transition-all duration-300
                    focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60
                    ${isDark
                      ? "bg-white/[0.04] border-white/[0.09] text-white placeholder:text-white/25"
                      : "bg-white border-black/[0.07] text-slate-800 placeholder:text-slate-400"
                    }`}
                />
              </div>

              {/* Submit button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide cursor-pointer
                  flex items-center justify-center gap-2 transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg,#f59e0b,#fb923c)",
                  color: "#fff",
                  boxShadow: "0 8px 24px rgba(245,158,11,0.35)",
                }}
              >
                <Iconify IconString="solar:plain-3-bold-duotone" Size={18} />
                Enviar Mensaje
              </motion.button>
            </motion.div>
          </div>

          {/* ── Map placeholder ── */}
          <motion.div
            variants={fadeUp(0.25)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className={`w-full h-64 rounded-3xl border flex items-center justify-center overflow-hidden relative ${cardBg}`}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: isDark
                  ? "radial-gradient(circle at 30% 50%, rgba(245,158,11,0.3) 0%, transparent 60%)"
                  : "radial-gradient(circle at 30% 50%, rgba(245,158,11,0.2) 0%, transparent 60%)",
              }}
            />
            <div className="flex flex-col items-center gap-3 relative z-10">
              <Iconify
                IconString="solar:map-point-bold-duotone"
                Size={40}
                Style={{ color: "#f59e0b" }}
              />
              <span className={`text-sm font-semibold ${textSecondary}`}>
                Santo Domingo, República Dominicana
              </span>
            </div>
          </motion.div>

        </div>
      </section>
      <Footer />
    </>
  );
}

// ── Reusable field component ──────────────────────────────────
interface FormFieldProps {
  label: string;
  placeholder: string;
  type?: string;
  isDark: boolean;
}

function FormField({ label, placeholder, type = "text", isDark }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs font-semibold tracking-wider uppercase"
        style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#64748b" }}
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none
          transition-all duration-300 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60
          ${isDark
            ? "bg-white/[0.04] border-white/[0.09] text-white placeholder:text-white/25"
            : "bg-white border-black/[0.07] text-slate-800 placeholder:text-slate-400"
          }`}
      />
    </div>
  );
}
