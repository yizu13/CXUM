import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Iconify from "../modularUI/IconsMock";
import { useSettings } from "../../hooks/context/SettingsContext";
import { useLanguage } from "../../i18n/LanguageContext";

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { theme } = useSettings();
  const { t } = useLanguage();
  const isDark = theme === "dark";
  const faqText = t("faq");
  const faqs = faqText.items;

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
            {faqText.title}
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#4b5563" }}
          >
            {faqText.subtitle}
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.question}
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
            {faqText.notFoundQuestion}
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
            {faqText.contact}
          </a>
        </motion.div>
      </div>

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map((faq) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer,
            },
          })),
        })}
      </script>
    </section>
  );
}
