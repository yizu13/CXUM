import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSettings } from "../../hooks/context/SettingsContext";
import Iconify from "../modularUI/IconsMock";
import CXUMLOGO from "../../assets/logcxum.png";

const FOOTER_SECTIONS = [
  {
    title: "Navegación",
    links: [
      { label: "Inicio", href: "/", isRoute: true },
      { label: "Nuestro Trabajo", href: "/#NuestroTrabajo", isRoute: false },
      { label: "Nuestro Impacto", href: "/#NuestroImpacto", isRoute: false },
      { label: "¿Quiénes somos?", href: "/#Quiénessomos", isRoute: false },
      { label: "Nuestro Equipo", href: "/#NuestroEquipo", isRoute: false },
    ],
  },
  {
    title: "Recursos",
    links: [
      { label: "Noticias Recientes", href: "/#NoticiasRecientes", isRoute: false },
      { label: "Mapa de Centros", href: "/#CollectionMap", isRoute: false },
      { label: "Misión & Visión", href: "/#MisionVision", isRoute: false },
    ],
  },
  {
    title: "Organización",
    links: [
      { label: "Contáctanos", href: "/contacto", isRoute: true },
      { label: "Ser Voluntario", href: "/contacto", isRoute: true },
      { label: "Ser Centro de Acopio", href: "/contacto", isRoute: true },
      { label: "Donar", href: "/contacto", isRoute: true },
    ],
  },
];

const SOCIAL_LINKS = [
  { icon: "mdi:instagram", href: "https://www.instagram.com/cuadernosxmanana/", label: "Instagram" },
//  { icon: "mdi:facebook", href: "#", label: "Facebook" },
  { icon: "mdi:linkedin", href: "https://www.linkedin.com/company/cuadernos-x-un-ma%C3%B1ana/?originalSubdomain=do", label: "LinkedIn" },
//  { icon: "mdi:whatsapp", href: "#", label: "WhatsApp" },
];

export default function Footer() {
  const { theme } = useSettings();
  const isDark = theme === "dark";

  const bg = isDark ? "bg-[#05070b]" : "bg-[#f0f4f8]";
  const border = isDark ? "border-white/[0.07]" : "border-black/[0.07]";
  const textSecondary = isDark ? "text-white/40" : "text-slate-500";
  const linkHover = isDark ? "hover:text-white" : "hover:text-slate-900";

  const scrollToSection = (href: string) => {
    const hash = href.split("#")[1];
    if (hash) {
      const el = document.getElementById(hash) || document.querySelector(`#${hash}`);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className={`w-full border-t ${bg} ${border}`}>
      <div className="max-w-6xl mx-auto px-6 md:px-16 lg:px-24 py-16">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">

          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="flex items-center gap-3">
                <img 
                  src={CXUMLOGO} 
                  alt="CXUM Logo" 
                  className="w-82 h-auto -mb-5 -mt-5 -ml-15 object-contain" 
                />
            </div>

            <p className={`text-sm leading-relaxed max-w-xs ${textSecondary}`}>
              Transformamos vidas a través del voluntariado, la educación y el
              compromiso con el medio ambiente en República Dominicana.
            </p>

            <div className="flex gap-2 flex-wrap">
              {SOCIAL_LINKS.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  target="_blanck"
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-300
                    ${isDark
                      ? "border-white/10 bg-white/4 text-white/50 hover:bg-white/10 hover:text-white hover:border-amber-500/40"
                      : "border-black/[0.07] bg-white text-slate-400 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300"
                    }`}
                >
                  <Iconify IconString={s.icon} Size={17} />
                </motion.a>
              ))}
            </div>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className="flex flex-col gap-4">
              <span
                className="text-xs font-bold tracking-[0.2em] uppercase"
                style={{ color: "#f59e0b" }}
              >
                {section.title}
              </span>
              <ul className="flex flex-col gap-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.isRoute ? (
                      <Link
                        to={link.href}
                        className={`text-sm font-medium transition-all duration-200 ${textSecondary} ${linkHover}`}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <button
                        onClick={() => scrollToSection(link.href)}
                        className={`text-sm font-medium transition-all duration-200 bg-transparent border-none outline-none cursor-pointer
                          ${textSecondary} ${linkHover}`}
                      >
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={`w-full h-px ${isDark ? "bg-white/[0.07]" : "bg-black/[0.07]"} mb-8`} />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className={`text-xs ${textSecondary}`}>
            © {new Date().getFullYear()} Cuadernos X Un Mañana. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs ${textSecondary}`}>Hecho por</span>
            <span className={`text-xs font-bold ${textSecondary}`}><a href="https://jesusalexhernandez.com/" target="_blanck">Jesús Hernández de los Santos</a></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
