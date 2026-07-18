import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSettings } from "../../hooks/context/SettingsContext";
import NavBar from "../layout/NavBar";
import Footer from "../layout/Footer";
import Iconify from "../modularUI/IconsMock";
import LogoCXUM from "../../assets/LogoCXUM.png";
import type { DonationForm } from "../../platform/donations/types";
import { getPublicDonationForms } from "../../platform/APIs/donations";

export default function PublicDonationFormsPage() {
  const { theme } = useSettings();
  const isDark = theme === "dark";
  const [forms, setForms] = useState<DonationForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadForms = useCallback(() => {
    getPublicDonationForms()
      .then((data) => {
        setForms(data.forms.filter((form) => form.status === "published"));
        setError("");
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "No se pudieron cargar los formularios.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const visibleForms = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return forms;
    return forms.filter((form) => `${form.title} ${form.description}`.toLowerCase().includes(term));
  }, [forms, search]);

  const pageBg = isDark ? "#05070b" : "#f7fafc";
  const text = isDark ? "#fff" : "#0f172a";
  const muted = isDark ? "rgba(255,255,255,0.52)" : "#64748b";
  const card = {
    background: isDark ? "rgba(255,255,255,0.035)" : "#ffffff",
    borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
  };

  return (
    <div style={{ background: pageBg, minHeight: "100vh" }}>
      <NavBar />
      <main className="pt-32 sm:pt-36 pb-16">
        <section className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <img src={LogoCXUM} alt="Cuadernos X Un Manana" className="w-20 h-20 object-contain mx-auto mb-4" />
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black mb-5"
              style={{ color: "#f59e0b", borderColor: "rgba(245,158,11,0.28)", background: "rgba(245,158,11,0.1)" }}>
              <Iconify IconString="solar:file-text-bold-duotone" Size={16} />
              Donaciones activas
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight" style={{ color: text }}>
              Elige una forma de apoyar
            </h1>
            <p className="mt-4 text-sm sm:text-base max-w-2xl mx-auto" style={{ color: muted }}>
              Formularios publicos de Cuadernos X Un Manana para registrar aportes, coordinar entregas y medir impacto.
            </p>
          </motion.div>

          {!loading && !error && forms.length > 0 && (
            <label className="relative block mb-4">
              <Iconify IconString="solar:magnifer-linear" Size={18} Style={{ color: muted, position: "absolute", left: 14, top: 13 }} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar una campana de donacion"
                className="w-full rounded-2xl border py-3 pl-11 pr-4 text-sm outline-none"
                style={{ ...card, color: text }}
              />
            </label>
          )}

          <div className="grid gap-3">
            {loading && (
              <div className="rounded-2xl border p-6 text-center text-sm font-bold" style={{ ...card, color: muted }}>
                Cargando formularios...
              </div>
            )}
            {!loading && error && (
              <div className="rounded-2xl border p-6 text-center" style={{ ...card, color: "#ef4444" }}>
                <p className="text-sm font-bold">{error}</p>
                <button type="button" onClick={() => { setLoading(true); loadForms(); }} className="mt-4 px-4 py-2 rounded-xl text-xs font-black text-white" style={{ background: "#ef4444" }}>
                  Reintentar
                </button>
              </div>
            )}
            {!loading && !error && forms.length === 0 && (
              <div className="rounded-2xl border p-6 text-center text-sm font-bold" style={{ ...card, color: muted }}>
                No hay formularios publicados en este momento.
              </div>
            )}
            {!loading && !error && forms.length > 0 && visibleForms.length === 0 && (
              <div className="rounded-2xl border p-6 text-center text-sm font-bold" style={{ ...card, color: muted }}>
                No encontramos formularios con esa busqueda.
              </div>
            )}
            {visibleForms.map((form, index) => {
              return (
                <motion.div
                  key={form.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <Link
                    to={`/formularios/${form.slug}`}
                    className="group flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border p-4 sm:p-5 transition-all"
                    style={card}
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(245,158,11,0.14)", border: "1px solid rgba(245,158,11,0.24)" }}>
                      <Iconify IconString="solar:clipboard-heart-bold-duotone" Size={24} Style={{ color: "#f59e0b" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h2 className="font-black text-lg" style={{ color: text }}>{form.title}</h2>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                          style={{ color: "#22c55e", background: "rgba(34,197,94,0.12)" }}>
                          Publicado
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: muted }}>{form.description}</p>
                    </div>
                    <div className="grid grid-cols-2 sm:flex sm:flex-col gap-2 sm:text-right">
                      <span className="text-xs font-bold" style={{ color: muted }}>{form.fields.length} campos</span>
                      <span className="text-sm font-black" style={{ color: text }}>{form.mode === "guided" ? "Guiado" : "Plano"}</span>
                    </div>
                    <div className="hidden sm:flex w-9 h-9 rounded-xl items-center justify-center"
                      style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.05)" }}>
                      <Iconify IconString="solar:alt-arrow-right-linear" Size={18} Style={{ color: muted }} />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
