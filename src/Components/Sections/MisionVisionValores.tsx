import { useRef} from "react";
import { motion, useInView } from "motion/react";
import { useSettings } from "../../hooks/context/SettingsContext";
import Iconify from "../ModularUI/IconsMock";
import visionImage from "../../assets/VisionCard.jpg"
import misionImage from "../../assets/misionCard.jpg"
import globalExpantion from "../../assets/ExpansionGlobal.jpg"

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(10px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      delay: i * 0.09,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
  exit: {
    opacity: 0,
    y: -16,
    filter: "blur(8px)",
    transition: { duration: 0.4, ease: [0.76, 0, 0.24, 1] as const },
  },
};



export default function MisionVisionValores() {
  const { theme } = useSettings();
  const isDark = theme === "dark";
  const ref = useRef<HTMLDivElement | null>(null);


  const section = useInView(ref, { amount : 0.1});

  const bg = isDark ? "bg-[#05070b]" : "bg-[#f4f4ef]";
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSub = isDark ? "text-white/50" : "text-slate-500";
  const textBody = isDark ? "text-white/60" : "text-slate-600";

  const cardLight = isDark
    ? "bg-white/[0.04] border border-white/[0.08]"
    : "bg-white border border-slate-200/70";
  const cardDark = isDark
    ? "bg-[#1a2a1a] border border-white/[0.06]"
    : "bg-[#2d4a2d] border border-transparent";
  const cardAccent = isDark
    ? "bg-orange-500/15 border border-orange-500/20"
    : "bg-orange-50 border border-orange-200/60";

  return (
    <section
      id="MisionVision"
      ref={ref}
      className={`w-full ${bg} transition-colors duration-500 px-6 md:px-12 lg:px-20 py-24`}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-10">

        <div className="flex flex-col gap-2">
          <motion.h2
            className={`text-4xl md:text-5xl font-black leading-tight tracking-tight ${textPrimary}`}
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={section ? "visible" : "exit"}
          >
            Nuestra <span className="text-orange-500">Visión</span> y Propósito
          </motion.h2>
          <motion.p
            className={`max-w-sm text-sm leading-relaxed ${textSub}`}
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate={section ? "visible" : "exit"}
          >
            No solo miramos el próximo año; miramos el próximo siglo de impacto educativo y ambiental.
          </motion.p>
        </div>

        {/* ── BENTO GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 grid-rows-[auto] gap-4">

          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate={section ? "visible" : "exit"}
            className={`md:col-span-7 relative rounded-2xl overflow-hidden min-h-65 flex flex-col justify-end p-7 ${cardLight}`}
          >
            <span className="text-2xl absolute right-5 top-5 z-20">
                <Iconify IconString="solar:flag-bold-duotone" Size={56} Style={{color: isDark ? "white" : "#ff6900"}}/>
              </span> 
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: isDark
                  ? "radial-gradient(circle at 30% 40%, rgba(249,115,22,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(249,115,22,0.05) 0%, transparent 50%)"
                  : "radial-gradient(circle at 30% 40%, rgba(249,115,22,0.06) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(249,115,22,0.04) 0%, transparent 50%)",
              }}
            />
            <div className="absolute inset-0 overflow-hidden opacity-20">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`absolute top-0 bottom-0 w-px ${isDark ? "bg-white/20" : "bg-slate-300"}`}
                  style={{ left: `${(i + 1) * 12.5}%` }}
                />
              ))}
            </div>

            <div className="relative z-10 flex flex-col gap-2">             
              <h3 className={`text-xl md:text-2xl font-black ${textPrimary}`}>
              Misión
              </h3>
              <p className={`text-sm leading-relaxed max-w-md ${textBody}`}>
                Transformar la percepción del cuaderno usado, reconociéndolo como un objeto valioso, capaz de generar un impacto positivo en el medio ambiente, la educación y, por ende, en la economía del país.
              </p>
            </div>
            <img src={misionImage} className="absolute inset-0 w-full h-full object-cover opacity-40 z-0"/>
          </motion.div>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate={section ? "visible" : "exit"}
            className={`md:col-span-5 relative rounded-2xl overflow-hidden min-h-65 flex flex-col justify-between p-7 ${cardDark}`}
          >
            <div className="flex justify-between items-start">
              <span />
              <span className="text-2xl">
                <Iconify IconString="solar:eye-bold-duotone" Size={56} Style={{color: "white"}}/>
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-black text-white z-10">
                Visión
              </h3>
              <p className="text-sm leading-relaxed text-white z-10">
                Ser la organización líder en impacto social y ambiental en República Dominicana, reconocida por transformar vidas y crear oportunidades sostenibles que permitan a cada persona alcanzar su máximo potencial.
              </p>
            </div>
            <img src={visionImage} className=" absolute inset-0 w-full h-full object-cover z-0 opacity-20"/>
          </motion.div>

          {/* ROW 2 — col 1-4: Valor 1 pequeño */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate={section ? "visible" : "exit"}
            className={`md:col-span-4 relative rounded-2xl overflow-hidden min-h-45 flex flex-col justify-between p-6 ${cardAccent}`}
          >
            <span className="text-2xl"><Iconify IconString="solar:leaf-bold-duotone" Size={32} Style={{color: "#ff6900"}}/></span>
            <div className="flex flex-col gap-1">
              <h2 className={` font-black ${textPrimary}`}>
                Operaciones sin <span className="text-orange-500">huella de carbono</span> para 2030
              </h2>
              <p className={`text-xs leading-relaxed ${textBody}`}>
                Transformamos toda nuestra logística hacia vehículos eléctricos y alimentamos nuestros centros de acopio con energía 100% renovable.
              </p>
            </div>
          </motion.div>

          <motion.div
            custom={5}
            variants={fadeUp}
            initial="hidden"
            animate={section ? "visible" : "exit"}
            className={`md:col-span-8 relative rounded-2xl overflow-hidden min-h-45 flex flex-col md:flex-row gap-0 ${cardLight}`}
          >
            <div className="flex-1 flex flex-col justify-center gap-2 p-6 z-10">
              <h3 className={`text-lg md:text-xl font-black text-white`}>
                Expansión <span className="text-orange-500">Global</span>
              </h3>
              <p className={`text-xs leading-relaxed max-w-xs text-white`}>
                Llevamos el modelo Cuadernos X Un Mañana a economías emergentes del Sudeste Asiático y Sudamérica para combatir el desperdicio escolar urbano.
              </p>
            </div>
            <div
              className="w-full md:w-44 shrink-0 min-h-30 md:min-h-0 rounded-b-2xl md:rounded-b-none md:rounded-r-2xl overflow-hidden"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, #1a3a5c 0%, #0d1f35 40%, #06101e 100%)",
              }}
            >
                <img src={globalExpantion} className="absolute inset-0 w-full h-full object-cover z-0"/>
            </div>
          </motion.div>

          <motion.div
            custom={6}
            variants={fadeUp}
            initial="hidden"
            animate={section ? "visible" : "exit"}
            className={`md:col-span-3 relative rounded-2xl overflow-hidden min-h-40 flex flex-col justify-between p-6 ${cardLight}`}
          >
            <span className="text-xl">♻️</span>
            <div className="flex flex-col gap-1">
              <h3 className={`text-sm font-black ${textPrimary}`}>Sostenibilidad</h3>
              <p className={`text-xs leading-relaxed ${textBody}`}>
                Cada cuaderno rescatado es un paso hacia un planeta más sano.
              </p>
            </div>
          </motion.div>

          <motion.div
            custom={7}
            variants={fadeUp}
            initial="hidden"
            animate={section ? "visible" : "exit"}
            className={`md:col-span-3 relative rounded-2xl overflow-hidden min-h-40 flex flex-col justify-between p-6 ${cardAccent}`}
          >
            <span className="text-xl">🤝</span>
            <div className="flex flex-col gap-1">
              <h3 className={`text-sm font-black ${textPrimary}`}>Solidaridad</h3>
              <p className={`text-xs leading-relaxed ${textBody}`}>
                Juntos construimos un futuro más justo para todos.
              </p>
            </div>
          </motion.div>

          <motion.div
            custom={8}
            variants={fadeUp}
            initial="hidden"
            animate={section ? "visible" : "exit"}
            className={`md:col-span-6 relative rounded-2xl overflow-hidden min-h-40 flex flex-col justify-between p-6 ${cardLight}`}
          >
            <span
              className={`absolute right-4 bottom-0 font-black leading-none select-none ${
                isDark ? "text-white/5" : "text-slate-900/5"
              }`}
              style={{ fontSize: "7rem" }}
            >
              01
            </span>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xs font-black">01</span>
              <span className={`text-xs font-bold uppercase tracking-widest text-orange-500`}>Objetivo principal</span>
            </div>
            <div className="relative z-10 flex flex-col gap-1">
              <h3 className={`text-lg font-black ${textPrimary}`}>Recolección Masiva Nacional</h3>
              <p className={`text-xs leading-relaxed max-w-sm ${textBody}`}>
                Ampliar la red de centros de acopio en toda la República Dominicana para rescatar cuadernos al cierre de cada año escolar.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
