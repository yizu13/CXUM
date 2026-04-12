import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CXUMLOGO from "../../assets/LogoCXUM.png";
import { useSettings } from "../../hooks/context/SettingsContext";
import { useAnimation } from "../../hooks/context/AnimationContext";
import Iconify from "../modularUI/IconsMock";
import DefaultButton from "../modularUI/GeneralButton";
import { NAV_LINKS } from "../../types/NavBarLinks";
import NavBarDropDown from "../modularUI/NavBarDropDown";
import { useNavigate } from "react-router-dom";
import x from "../../assets/xStilizada.png";
import { InfoCards } from "../../types/NavBarLinks";
import { useLocation } from "react-router-dom";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

// ─ Mobile Menu ──────────────────────────────────────────────────────────────
function MobileMenu({
  open,
  onClose,
  isDark,
  navigate,
}: {
  open: boolean;
  onClose: () => void;
  isDark: boolean;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const location = useLocation();
  const bg      = isDark ? "#0a0c12" : "#ffffff";
  const border  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const text    = isDark ? "rgba(255,255,255,0.7)" : "#334155";
  const textSub = isDark ? "rgba(255,255,255,0.35)" : "#94a3b8";

  function scrollTo(link: string, path: string) {
    onClose();
    if (path !== location.pathname) {
      navigate(path);
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: "instant" });
      setTimeout(() => {
        const el = document.querySelector(link);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 800);
    } else {
      const el = document.querySelector(link);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-9998 bg-black/50 backdrop-blur-sm"
          />
          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 bottom-0 z-9999 w-[85vw] max-w-sm flex flex-col"
            style={{ background: bg, borderLeft: `1px solid ${border}` }}
          >
            {/* Top bar */}
            <div className="shrink-0 flex items-center justify-between px-5 pt-6 pb-4" style={{ borderBottom: `1px solid ${border}` }}>
              <div className="flex items-center gap-2">
                <img src={CXUMLOGO} width={32} height={32} alt="Logo" className="rounded-full" />
                <span className="font-black text-sm" style={{ color: isDark ? "#fff" : "#0f172a" }}>CXUM</span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", color: text }}
              >
                <Iconify IconString="solar:close-circle-bold-duotone" Size={20} />
              </button>
            </div>

            {/* Nav links with SimpleBar */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <SimpleBar style={{ height: "100%", maxHeight: "100%" }}>
                <div className="px-4 py-4 space-y-1">
                  {InfoCards.map((card, i) => (
                    <div key={i}>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] px-3 py-2 mt-2" style={{ color: "#f59e0b" }}>
                        {NAV_LINKS[i]}
                      </p>
                      {card.sections.map((section, si) => (
                        <div key={si}>
                          {section.cards.map((c, ci) => (
                            <button
                              key={ci}
                              onClick={() => scrollTo(c.link, c.path)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all active:scale-[0.98]"
                              style={{ color: text }}
                              onMouseEnter={e => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)")}
                              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            >
                              <Iconify IconString={c.IconsString || ""} Size={20} Style={{ color: "#f59e0b", flexShrink: 0 }} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{c.cardTitle}</p>
                                {"CardSubtitle" in c && c.CardSubtitle && (
                                  <p className="text-xs truncate" style={{ color: textSub }}>{c.CardSubtitle}</p>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </SimpleBar>
            </div>

            {/* Bottom actions */}
            <div className="shrink-0 px-4 pb-8 pt-4 space-y-3" style={{ borderTop: `1px solid ${border}` }}>
              <button
                onClick={() => { onClose(); navigate("/Contacto"); }}
                className="w-full py-3 rounded-2xl text-sm font-black text-white active:scale-[0.98] transition-transform"
                style={{ background: "linear-gradient(135deg, #fc3d3d, #f97316)", boxShadow: "0 4px 20px rgba(252,61,61,0.3)" }}
              >
                Donar Ahora
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function NavBar() {
  const [phase, setPhase] = useState(0);
  const { theme, setTheme } = useSettings();
  const { setNavReady } = useAnimation();
  const navigate = useNavigate();
  const [iconHover, setIconHover] = useState([false, false, false, false]);
  const [flag, setFlag] = useState(false);
  const [show, setShow] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [cardWidth, setCardWidth] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!show || !contentRef.current) return;

    const measure = () => {
      if (contentRef.current) {
        setCardWidth(contentRef.current.getBoundingClientRect().width);
      }
    };

    measure(); 

    const observer = new ResizeObserver(measure);
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [show, activeIndex]); 

  useEffect(() => {
    if (!iconHover.find((n) => n) && !flag) {
      const timer = setTimeout(() => {
        setShow(false);
        setActiveIndex(null);
      }, 200);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(true);
  }, [flag, iconHover]);

  const isDark = theme === "dark";

  const glassStyles = {
    container: isDark
      ? "bg-[#0a0c12]/80 border-white/[0.08] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.05]"
      : "bg-white/80 border-black/[0.05] shadow-[0_15px_35px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.01]",
    container2: isDark
      ? "bg-[#0a0c12]/80 border-white/[0.08] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.05] backdrop-blur-md"
      : "bg-white/80 border-black/[0.05] shadow-[0_15px_35px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.01] backdrop-blur-md",
    text: isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900",
    themeBtn: isDark
      ? "bg-white/[0.05] border-white/10 text-amber-400 hover:bg-white/10"
      : "bg-black/[0.03] border-black/5 text-blue-600 hover:bg-black/[0.08]",
  };

  return (
    <>
      {/* Mobile menu - fuera del contenedor principal */}
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isDark={isDark}
        navigate={navigate}
      />

      <div className="fixed top-0 left-0 right-0 z-100 flex justify-center items-center px-4 sm:px-6 pt-6 sm:pt-8 pointer-events-none font-outfit flex-col">

      <div className="relative flex items-center w-full max-w-280">
        {phase >= 1 && (
          <motion.div
            initial={{ width: 52, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            onAnimationComplete={() =>
              setTimeout(() => {
                setPhase(2);
                setTimeout(() => setNavReady(true), 350);
              }, 100)
            }
            className={`absolute -left-2 top-1/2 -translate-y-1/2 z-1
                       h-16 rounded-full pointer-events-auto
                       flex items-center border backdrop-blur-xl
                       transition-all duration-700
                       ${glassStyles.container}`}
            style={{ paddingLeft: 74, paddingRight: 14 }}
          >
            <div className="flex-1 flex items-center">
              {phase >= 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: -8 }}
                  className="flex items-center shrink-0 tracking-tight select-none"
                >
                  <span className={`text-[1.05rem] font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    Cuadernos
                  </span>
                  <span className="ml-1.5 mr-1 font-black mt-0.5">
                    <img src={x} width={20} height={20} alt="X" />
                  </span>
                  <span className={`text-[1.05rem] font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Un Mañana
                  </span>
                </motion.div>
              )}
            </div>

            {phase >= 2 && (
              <motion.nav initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hidden md:flex items-center gap-8">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 + 0.1 }}
                    className="flex flex-nowrap items-center cursor-pointer"
                    onMouseEnter={() => {
                      setIconHover((h) => h.map((v, idx) => (idx === i ? true : v)));
                      setActiveIndex(i);
                    }}
                    onMouseLeave={() => {
                      setIconHover((h) => h.map((v, idx) => (idx === i ? false : v)));
                    }}
                  >
                    <motion.a
                      className={`text-[0.92rem] font-semibold px-2 py-1 rounded-md transition-all duration-300 tracking-[0.05em]
                      ${isDark
                        ? (iconHover[i] || (flag && activeIndex === i)) ? "text-white" : "text-slate-400"
                        : (iconHover[i] || (flag && activeIndex === i)) ? "text-slate-900" : "text-slate-500"}`}
                    >
                      {link}
                    </motion.a>
                    <motion.div
                      animate={{ rotate: (iconHover[i] || (flag && activeIndex === i)) ? 180 : 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                      <Iconify
                        IconString="iconamoon:arrow-up-2-light"
                        Size={18}
                        Style={{
                          color: isDark
                            ? (iconHover[i] || (flag && activeIndex === i)) ? "#f2f2f3" : "#8595ac"
                            : (iconHover[i] || (flag && activeIndex === i)) ? "#2b3243" : "#8190a5",
                          transition: "color 0.3s ease",
                        }}
                      />
                    </motion.div>
                  </motion.div>
                ))}
              </motion.nav>
            )}

            <div className="flex-1 flex justify-end items-center gap-3">
              {phase >= 2 && (
                <>
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border
                               transition-all duration-300 cursor-pointer shadow-sm
                               ${glassStyles.themeBtn}`}
                  >
                    {isDark ? (
                      <Iconify IconString="solar:sun-fog-bold-duotone" Size={20} />
                    ) : (
                      <Iconify IconString="duo-icons:moon-stars" Size={20} />
                    )}
                  </motion.button>
                  {/* Donar — solo desktop */}
                  <div className="hidden md:block">
                    <DefaultButton textString="Donar Ahora" onClick={() => navigate("/Contacto")} color="#fc3d3d"/>
                  </div>
                  {/* Hamburguesa — solo móvil */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMobileMenuOpen(true)}
                    className={`md:hidden flex items-center justify-center w-10 h-10 rounded-full border
                               transition-all duration-300 cursor-pointer shadow-sm
                               ${glassStyles.themeBtn}`}
                  >
                    <Iconify IconString="solar:hamburger-menu-bold" Size={20} />
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ x: "50vw", rotate: -90 }}
          animate={{ x: 0, rotate: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          onAnimationComplete={() => setTimeout(() => setPhase(1), 150)}
          className={`relative z-10 shrink-0 pointer-events-auto
                     w-12 h-12 rounded-full flex items-center justify-center
                     ${isDark ? "ring-2 ring-white/5" : "ring-2 ring-white"}`}
        >
          <img src={CXUMLOGO} width={40} height={40} alt="Logo" className="rounded-full object-contain" />
        </motion.div>
      </div>
      <NavBarDropDown show={show} cardWidth={cardWidth} 
        setFlag={setFlag} contentRef={(el) => {contentRef.current = el;}} activeIndex={activeIndex} glassStyles={glassStyles}/>
      </div>
    </>
  );
}