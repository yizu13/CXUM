import { useState } from "react";
import { motion } from "motion/react";
import CXUMLOGO from "../../assets/LogoCXUM.png";
import { useSettings } from "../../hooks/context/SettingsContext";
import { useAnimation } from "../../hooks/context/AnimationContext";
import Iconify from "../ModularUI/IconsMock";
import DefaultButton from "../ModularUI/GeneralButton";

const NAV_LINKS = ["Inicio", "Plataforma", "Recursos", "Precios"];

export default function NavBar() {
  const [phase, setPhase] = useState(0);
  const { theme, setTheme } = useSettings();
  const { setNavReady } = useAnimation();
  const isDark = theme === "dark";

  const glassStyles = {
    container: isDark 
      ? "bg-[#0a0c12]/80 border-white/[0.08] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.05]" 
      : "bg-white/80 border-black/[0.05] shadow-[0_15px_35px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.01]",
    text: isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900",
    button: isDark 
      ? "bg-white text-black hover:bg-slate-100" 
      : "bg-slate-950 text-white hover:bg-slate-800",
    themeBtn: isDark 
      ? "bg-white/[0.05] border-white/10 text-amber-400 hover:bg-white/10" 
      : "bg-black/[0.03] border-black/5 text-blue-600 hover:bg-black/[0.08]"
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-100 flex justify-center items-center px-6 pt-8 pointer-events-none font-outfit">
      <div className="relative flex items-center w-full max-w-280">
        
        {phase >= 1 && (
          <motion.div
            initial={{ width: 52, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            onAnimationComplete={() => setTimeout(() => { setPhase(2); setTimeout(() => setNavReady(true), 350); }, 100)}
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
                  <span className={`text-[1.05rem] font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Cuadernos
                  </span>
                  <span className="mx-1.5 text-amber-500 font-black mt-0.5">X</span>
                  <span className={`text-[1.05rem] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Un Mañana
                  </span>
                </motion.div>
              )}
            </div>

            {phase >= 2 && (
              <motion.nav
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-8" 
              >
                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 + 0.1 }}
                    className={`text-[0.82rem] font-semibold px-2 py-1 rounded-md
                               transition-all duration-300 cursor-pointer 
                               tracking-[0.05em] uppercase // Agregamos tracking y sutil
                               ${glassStyles.text}`}
                  >
                    {link}
                  </motion.a>
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
                    {isDark ? 
                      <Iconify IconString="solar:sun-fog-bold-duotone" Size={20}/> : 
                      <Iconify IconString="duo-icons:moon-stars" Size={20}/>
                    }
                  </motion.button>

                  <DefaultButton textString="Donar Ahora"/>
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
                     bg-linear-to-tr from-[#0278c0] via-[#028ce0] to-[#60a5fa]
                     shadow-[0_8px_25px_rgba(2,120,192,0.4)]
                     ${isDark ? 'ring-2 ring-white/10' : 'ring-2 ring-white'}`}
        >
          <img src={CXUMLOGO} width={28} height={28} alt="Logo" className="rounded-full object-contain" />
        </motion.div>
      </div>
    </div>
  );
}