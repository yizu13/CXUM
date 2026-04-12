import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Iconify from "../modularUI/IconsMock";
import { useSettings } from "../../hooks/context/SettingsContext";

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "¿Qué es Cuadernos X un Mañana?",
    answer: "Somos una iniciativa social que recolecta cuadernos y útiles escolares usados o nuevos, los clasifica y reutiliza para entregarlos a estudiantes de comunidades vulnerables en República Dominicana. Nuestro objetivo es garantizar que ningún niño se quede sin materiales para estudiar."
  },
  {
    question: "¿Cómo puedo donar cuadernos o útiles escolares?",
    answer: "Puedes llevar tus donaciones a cualquiera de nuestros centros de acopio ubicados en diferentes puntos del país. Consulta el mapa de centros de acopio en nuestra página para encontrar el más cercano a ti. Aceptamos cuadernos usados con hojas en blanco, cuadernos nuevos, lápices, bolígrafos y otros útiles escolares."
  },
  {
    question: "¿Puedo ser voluntario aunque no tenga experiencia?",
    answer: "¡Por supuesto! No necesitas experiencia previa para ser voluntario. Te capacitamos en todo lo necesario: clasificación de materiales, logística de entregas y coordinación de eventos. Lo más importante es tu compromiso y ganas de ayudar a construir un mejor futuro para nuestra comunidad."
  },
  {
    question: "¿Mi empresa o institución puede convertirse en centro de acopio?",
    answer: "Sí, empresas, escuelas, universidades y organizaciones pueden ser centros de acopio. Solo necesitas un espacio para colocar una caja de recolección y compromiso para coordinar con nuestro equipo. Contáctanos a través del formulario y te explicamos el proceso completo."
  },
  {
    question: "¿A quiénes benefician las donaciones?",
    answer: "Nuestras entregas llegan a estudiantes de escuelas públicas en comunidades de escasos recursos en toda República Dominicana. Trabajamos directamente con centros educativos y organizaciones comunitarias para identificar a los estudiantes que más necesitan apoyo."
  },
  {
    question: "¿Cómo garantizan que las donaciones lleguen a quien las necesita?",
    answer: "Trabajamos con alianzas estratégicas con escuelas, organizaciones comunitarias y autoridades locales. Cada entrega es documentada y coordinada directamente con los centros educativos. Publicamos actualizaciones regulares de nuestras actividades en la sección de noticias."
  },
  {
    question: "¿Qué tipo de cuadernos aceptan?",
    answer: "Aceptamos cuadernos usados que tengan hojas en blanco aprovechables, cuadernos nuevos sin usar, libretas, blocks de dibujo y cualquier material escolar en buen estado. Los cuadernos muy deteriorados son reciclados de forma responsable."
  },
  {
    question: "¿Cuál es el impacto de la iniciativa?",
    answer: "Desde nuestro inicio, hemos entregado miles de cuadernos y útiles escolares a estudiantes en todo el país. Cada año aumentamos nuestro alcance gracias al apoyo de voluntarios, centros de acopio y donantes. Consulta nuestra sección de impacto para ver las cifras actualizadas."
  }
];

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { theme } = useSettings();
  const isDark = theme === "dark";

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="preguntas-frecuentes"
      className="py-20 px-4 transition-colors duration-500"
      style={{ background: isDark ? "#05070b" : "#f8fafc" }}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: isDark ? "#fff" : "#111827" }}
          >
            Preguntas Frecuentes
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#4b5563" }}
          >
            Resolvemos tus dudas sobre cómo participar, donar y ser parte del cambio
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="rounded-2xl overflow-hidden transition-all"
              style={{
                background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
                boxShadow: isDark ? "none" : "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors"
                style={{
                  background: openIndex === index
                    ? isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)"
                    : "transparent",
                }}
              >
                <h3
                  className="text-base font-semibold pr-4 leading-snug"
                  style={{ color: isDark ? "#fff" : "#111827" }}
                >
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="shrink-0"
                >
                  <Iconify
                    IconString="solar:alt-arrow-down-bold"
                    Size={18}
                    Style={{ color: isDark ? "#f97316" : "#dc2626" }}
                  />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="px-6 pb-5 text-sm leading-relaxed"
                      style={{
                        color: isDark ? "rgba(255,255,255,0.5)" : "#374151",
                        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                        paddingTop: "1rem",
                      }}
                    >
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="mb-4" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#6b7280" }}>
            ¿No encontraste la respuesta que buscabas?
          </p>
          <a
            href="/Contacto"
            className="inline-block px-8 py-3 font-semibold rounded-xl transition-all hover:scale-105"
            style={{
              background: isDark ? "rgba(249,115,22,0.15)" : "#dc2626",
              color: isDark ? "#f97316" : "#fff",
              border: isDark ? "1px solid rgba(249,115,22,0.3)" : "none",
              boxShadow: isDark ? "none" : "0 4px 14px rgba(220,38,38,0.3)",
            }}
          >
            Contáctanos
          </a>
        </motion.div>
      </div>

      {/* FAQPage Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        })}
      </script>
    </section>
  );
}
