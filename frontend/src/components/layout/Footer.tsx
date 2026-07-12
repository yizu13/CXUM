import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSettings } from "../../hooks/context/SettingsContext";
import Iconify from "../modularUI/IconsMock";
import CXUMLOGO from "../../assets/logcxum.png";
import { useLanguage } from "../../i18n/LanguageContext";

const FOOTER_SECTIONS = [
  {
    links: [
      { href: "/", isRoute: true },
      { href: "/#NuestroTrabajo", isRoute: false },
      { href: "/#NuestroImpacto", isRoute: false },
      { href: "/#Quiénessomos", isRoute: false },
      { href: "/#equipo", isRoute: false },
    ],
  },
  {
    links: [
      { href: "/#NoticiasRecientes", isRoute: false },
      { href: "/#PuntosDeEntrega", isRoute: false },
      { href: "/#MisionVision", isRoute: false },
    ],
  },
  {
    links: [
      { href: "/Contacto", isRoute: true },
      { href: "/Voluntarios", isRoute: true },
      { href: "/Contacto", isRoute: true },
      { href: "/Contacto", isRoute: true },
    ],
  },
];

const SOCIAL_LINKS = [
  { icon: "mdi:instagram", href: "https://www.instagram.com/cuadernosxmanana/", label: "Instagram" },
  { icon: "mdi:linkedin", href: "https://www.linkedin.com/company/cuadernos-x-un-ma%C3%B1ana/?originalSubdomain=do", label: "LinkedIn" },
];

export default function Footer() {
  const { theme } = useSettings();
  const { t } = useLanguage();
  const isDark = theme === "dark";
  const footer = t("footer");

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-16 lg:px-24 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 mb-10 sm:mb-14">
          <div className="col-span-2 lg:col-span-2 flex flex-col gap-4 sm:gap-5">
            <div className="flex items-center gap-3">
              <img
                src={CXUMLOGO}
                alt="CXUM Logo"
                className="w-56 sm:w-82 h-auto -mb-3 sm:-mb-5 -mt-3 sm:-mt-5 -ml-5 sm:-ml-15 object-contain"
              />
            </div>

            <p className={`text-sm leading-relaxed max-w-xs ${textSecondary}`}>
              {footer.description}
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

          {FOOTER_SECTIONS.map((section, sectionIndex) => (
            <div key={footer.sections[sectionIndex].title} className="flex flex-col gap-4">
              <span
                className="text-xs font-bold tracking-[0.2em] uppercase"
                style={{ color: "#f59e0b" }}
              >
                {footer.sections[sectionIndex].title}
              </span>
              <ul className="flex flex-col gap-2.5">
                {section.links.map((link, linkIndex) => (
                  <li key={`${sectionIndex}-${linkIndex}`}>
                    {link.isRoute ? (
                      <Link
                        to={link.href}
                        className={`text-sm font-medium transition-all duration-200 ${textSecondary} ${linkHover}`}
                      >
                        {footer.sections[sectionIndex].links[linkIndex]}
                      </Link>
                    ) : (
                      <button
                        onClick={() => scrollToSection(link.href)}
                        className={`text-sm font-medium transition-all duration-200 bg-transparent border-none outline-none cursor-pointer
                          ${textSecondary} ${linkHover}`}
                      >
                        {footer.sections[sectionIndex].links[linkIndex]}
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
            © {new Date().getFullYear()} Cuadernos X Un Mañana. {footer.rights}
          </p>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs ${textSecondary}`}>{footer.madeBy}</span>
            <span className={`text-xs font-bold ${textSecondary}`}>
              <a href="https://jesusalexhernandez.com/" target="_blanck">
                Jesús Hernández de los Santos
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
