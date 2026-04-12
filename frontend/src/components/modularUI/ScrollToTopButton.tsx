import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Iconify from "./IconsMock";
import { useSettings } from "../../hooks/context/SettingsContext";



export default function ScrollToTopButton({ heroId }: { heroId: string }) {
  const [visible, setVisible] = useState(false);
  const { theme } = useSettings()
  const isDark = theme === "dark"

  useEffect(() => {
    const heroEl = document.getElementById(heroId);
    if (!heroEl) return;

    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px" }
    );
    obs.observe(heroEl);
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToHero = () => {
    const hero = document.getElementById(heroId);
    if (hero) hero.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollToHero}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full shadow-lg cursor-pointer border-none outline-none"
          style={{
            background: "#f59e0b",
            boxShadow: "0 4px 24px rgba(245,158,11,0.45)",
          }}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.12, boxShadow: "0 6px 32px rgba(245,158,11,0.6)" }}
          whileTap={{ scale: 0.94 }}
          aria-label="Volver al inicio"
        >
          <Iconify Size={26} IconString="solar:arrow-up-bold-duotone" Color={isDark ? "#05070b" : "#fff"}/>
        </motion.button>
      )}
    </AnimatePresence>
  );
}