import { useState } from "react";
import { motion } from "motion/react";
import CXUMLOGO from "../../assets/LogoCXUM.png";

const NAV_LINKS = ["Inicio", "Plataforma", "Recursos", "Precios"];

export default function NavBar() {
  const [phase, setPhase] = useState(0);

  return (
    <div className="fixed top-0 left-0 right-0 z-100 flex justify-center items-center px-4 pt-3.5 pointer-events-none">

      <div className="relative flex items-center w-full max-w-225">

        {phase >= 1 && (
          <motion.div
            initial={{ width: 52 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.65, ease: "easeInOut" }}
            onAnimationComplete={() => setTimeout(() => setPhase(2), 120)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-1
                       h-13 rounded-full overflow-hidden pointer-events-auto
                       flex items-center justify-between
                       border border-white/8
                       bg-[rgba(10,15,30,0.92)] backdrop-blur-[18px]
                       shadow-[0_8px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]"
            style={{ paddingLeft: 60, paddingRight: 10 }}
          >
            {phase >= 2 && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col leading-tight shrink-0"
              >
                <span className="text-[0.68rem] font-semibold tracking-[0.07em] uppercase text-[#0278c0]">
                  Cuadernos{" "}
                  <span className="text-amber-400">X</span>
                  {" "}Un Mañana
                </span>
              </motion.div>
            )}

            {phase >= 2 && (
              <motion.nav
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
                className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5"
              >
                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.28 }}
                    className="text-[0.82rem] font-normal tracking-[0.02em] text-white/60
                               px-3.5 py-1.5 rounded-lg whitespace-nowrap cursor-pointer
                               no-underline transition-colors duration-200
                               hover:text-white hover:bg-white/8"
                  >
                    {link}
                  </motion.a>
                ))}
              </motion.nav>
            )}

            {phase >= 2 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="shrink-0 bg-white text-[#0a0f1e] text-[0.82rem] font-semibold
                           tracking-[0.02em] rounded-full px-5 py-2 whitespace-nowrap
                           border-none cursor-pointer
                           transition-all duration-200
                           hover:bg-[#e8f0ff] hover:scale-[1.03]"
              >
                Comenzar
              </motion.button>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ x: "55vw" }}
          animate={{ x: 0 }}
          transition={{ duration: 0.8, ease:"easeInOut" }}
          onAnimationComplete={() => setTimeout(() => setPhase(1), 180)}
          className="relative z-2 shrink-0 pointer-events-auto
                     w-12 h-12 rounded-full flex items-center justify-center
                     bg-linear-to-br from-[#0278c0] to-[#014f8a]
                     shadow-[0_0_0_3px_rgba(255,255,255,0.1),0_4px_20px_rgba(2,120,192,0.45)]"
        >
          <img
            src={CXUMLOGO}
            width={34}
            height={34}
            alt="CXUM Logo"
            className="rounded-full object-contain"
          />
        </motion.div>

      </div>
    </div>
  );
}
