import { motion } from "framer-motion";
import { useSettings } from "../../hooks/context/SettingsContext";
// import imageWithOutBackground from "../../assets/ImagenSinFondo.png"

const textVariants = {
  hidden: { 
    opacity: 0, 
    y: 30, 
    filter: "blur(10px)" 
  },
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

export default function WhoWeAre() {
  const { theme } = useSettings();
  const isDark = theme === "dark";

  return (
    <section 
    id="Quiénessomos"
      className={`relative flex flex-col md:flex-row items-center justify-between w-full min-h-[80vh] px-8 py-20 gap-12 overflow-hidden transition-colors duration-500 ${
        isDark ? "bg-[#05070b]" : "bg-[#f4f4ef]"
      }`}
    >
      <motion.div 
        className="relative flex justify-center items-center w-full md:w-1/2"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }} 
        variants={textVariants}
        custom={0}
      >
        <div className="relative w-32 h-32 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full bg-linear-to-tr from-orange-500 to-orange-400 shadow-2xl">
          <img
            src=""//{/* imageWithOutBackground */}
            alt=""
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[110%] max-w-none transform hover:scale-105 transition-transform duration-500"
            style={{ 
                maskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)' 
            }}
          />
        </div>
      </motion.div>

      <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-6">
        <motion.h1
          className={`text-5xl font-black sm:text-6xl lg:text-7xl leading-tight ${
            isDark ? "text-white" : "text-slate-900"
          }`}
          variants={textVariants}
          custom={1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
        >
          ¿Quiénes <span className="text-orange-500">somos?</span>
        </motion.h1>
        
        <motion.p 
          className={`text-lg max-w-xl ${isDark ? "text-slate-400" : "text-slate-600"}`}
          variants={textVariants}
          custom={2}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
        >
          En Cuadernos X Un Mañana recolectamos cuadernos usados al final de cada año escolar y les damos una segunda vida. Estas páginas rescatadas se convierten en nuevos cuadernos que donamos a estudiantes que no cuentan con los recursos para comprarlos.
        </motion.p>
      </div>
    </section>
  );
}