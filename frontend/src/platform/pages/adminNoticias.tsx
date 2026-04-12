import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSettings } from "../../hooks/context/SettingsContext";
import { FormManaged, RHFTextField, RHFTextArea, RHFSelect, RHFImageUpload } from "../../components/FormComponents";
import {
  noticiaSchema,
  noticiaDefaultValues,
  type NoticiaFormValues,
} from "../../components/FormComponents/schemas";
import Iconify from "../../components/modularUI/IconsMock";
import AdminButton from "../components/AdminButton";
import FilterSelect from "../../components/modularUI/FilterSelect";
import { getNoticiasAdmin, createNoticia, updateNoticia, deleteNoticia } from "../APIs/noticias";
import type { Noticia } from "../APIs/noticias";
import { useAuth } from "../components/AuthContextComps";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

// ── Types re-exported from API ────────────────────────────────────────────────

const CATEGORIA_CONFIG = {
  emergencia:   { label: "Emergencia",   color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
  voluntariado: { label: "Voluntariado", color: "#3b82f6", bg: "rgba(59,130,246,0.12)"  },
  donaciones:   { label: "Donaciones",   color: "#22c55e", bg: "rgba(34,197,94,0.12)"   },
  evento:       { label: "Evento",       color: "#8b5cf6", bg: "rgba(139,92,246,0.12)"  },
  general:      { label: "General",      color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
};

const ESTADO_CONFIG = {
  borrador:  { label: "Borrador",  color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
  publicado: { label: "Publicado", color: "#22c55e", bg: "rgba(34,197,94,0.12)"   },
  archivado: { label: "Archivado", color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function TabButton({
  active,
  onClick,
  children,
  isDark,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="relative px-4 py-2 text-sm font-bold transition-colors"
      style={{ color: active ? "#f59e0b" : isDark ? "rgba(255,255,255,0.35)" : "#94a3b8" }}
    >
      {children}
      {active && (
        <motion.div
          layoutId="newsTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
          style={{ background: "#f59e0b" }}
        />
      )}
    </button>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────────
function NoticiaPreview({ n, onClose }: { n: Noticia; onClose: () => void }) {
  const catCfg = CATEGORIA_CONFIG[n.categoria];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(14px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        className="w-full max-w-2xl rounded-3xl border overflow-hidden"
        style={{ background: "#0f1117", borderColor: "rgba(255,255,255,0.1)", boxShadow: "0 32px 100px rgba(0,0,0,0.5)", maxHeight: "90vh" }}
      >
        <SimpleBar style={{ maxHeight: "90vh" }}>
          <div className="relative h-52 overflow-hidden">
          <img src={n.portada} alt={n.titulo} className="w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(15,17,23,0.95) 100%)" }}
          />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-xl"
              style={{ background: catCfg.bg, color: catCfg.color, backdropFilter: "blur(8px)" }}
            >
              {catCfg.label}
            </span>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-xl"
              style={{ background: "rgba(245,158,11,0.2)", color: "#f59e0b", backdropFilter: "blur(8px)" }}
            >
              Vista Previa
            </span>
          </div>
          <AdminButton
            variant="ghost"
            size="sm"
            icon="solar:close-circle-bold-duotone"
            onClick={onClose}
            forceDark={true}
            className="absolute top-4 right-4 !rounded-xl"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
          />
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-white font-black text-xl leading-tight">{n.titulo}</h1>
          </div>
        </div>

        <div
          className="px-6 py-4 flex items-center gap-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-xs"
            style={{ background: "rgba(245,158,11,0.2)" }}
          >
            {n.autor.charAt(0)}
          </div>
          <div>
            <p className="text-white text-sm font-bold">{n.autor}</p>
            <p className="text-white/30 text-xs">{n.fechaPublicacion}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            {n.tags.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-lg text-xs font-medium" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                #{t}
              </span>
            ))}
          </div>
        </div>

        <div className="px-6 pt-5 pb-2">
          <p className="text-white/60 text-sm leading-relaxed font-medium italic">{n.resumen}</p>
        </div>
        <div className="px-6 pb-8">
          <p className="text-white/70 text-sm leading-relaxed mt-3">{n.contenido}</p>
        </div>
        </SimpleBar>
      </motion.div>
    </div>
  );
}

// ── Editor Modal con RHF ──────────────────────────────────────────────────────
function NoticiaEditor({
  n,
  onClose,
  onSave,
  isDark,
}: {
  n: Partial<Noticia> | null;
  onClose: () => void;
  onSave: (data: NoticiaFormValues & { id?: string }) => void;
  isDark: boolean;
}) {
  const [saving, setSaving] = useState(false);
  
  const methods = useForm<NoticiaFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(noticiaSchema) as any,
    defaultValues: n?.id
      ? {
          titulo:    n.titulo    ?? "",
          categoria: (n.categoria ?? "general") as NoticiaFormValues["categoria"],
          estado:    (n.estado   ?? "borrador") as NoticiaFormValues["estado"],
          autor:     n.autor     ?? "",
          portada:   n.portada   ?? "",
          resumen:   n.resumen   ?? "",
          contenido: n.contenido ?? "",
          tags:      (n.tags     ?? []).join(", "),
        }
      : noticiaDefaultValues,
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const portadaValue = methods.watch("portada");

  const handleSubmit = async (data: NoticiaFormValues) => {
    if (saving) return;
    setSaving(true);
    try {
      await onSave({ ...data, id: n?.id });
    } finally {
      setSaving(false);
    }
  };

  const modalBg = isDark ? "#0f1117" : "#ffffff";
  const modalBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(10px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl rounded-3xl border overflow-hidden"
        style={{ background: modalBg, borderColor: modalBorder, boxShadow: "0 24px 80px rgba(0,0,0,0.4)", maxHeight: "90vh" }}
      >
        <SimpleBar style={{ maxHeight: "90vh" }}>
          <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-black text-lg" style={{ color: isDark ? "#fff" : "#0f172a" }}>
              {n?.id ? "Editar Noticia" : "Nueva Noticia"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#64748b" }}>
              Completa los campos de la noticia
            </p>
          </div>
          <AdminButton
            variant="ghost"
            size="sm"
            icon="solar:close-circle-bold-duotone"
            onClick={onClose}
          />
        </div>

        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <FormManaged methods={methods as any} onSubmit={handleSubmit} className="space-y-4">
          <RHFTextField<NoticiaFormValues>
            name="titulo"
            label="Título"
            placeholder="Título de la noticia..."
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <RHFSelect<NoticiaFormValues>
              name="categoria"
              label="Categoría"
              required
              options={Object.entries(CATEGORIA_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))}
            />
            <RHFSelect<NoticiaFormValues>
              name="estado"
              label="Estado"
              required
              options={Object.entries(ESTADO_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))}
            />
          </div>

          <RHFTextField<NoticiaFormValues>
            name="autor"
            label="Autor"
            placeholder="Nombre del autor"
            required
          />

          <RHFImageUpload<NoticiaFormValues>
            name="portada"
            label="Imagen de Portada"
            helperText="Sube una imagen o pega una URL (JPG, PNG, WEBP, GIF - máx 5MB)"
            required
          />

          <RHFTextArea<NoticiaFormValues>
            name="resumen"
            label="Resumen"
            placeholder="Breve descripción de la noticia..."
            rows={2}
            required
          />

          <RHFTextArea<NoticiaFormValues>
            name="contenido"
            label="Contenido"
            placeholder="Contenido completo de la noticia..."
            rows={6}
            required
          />

          <RHFTextField<NoticiaFormValues>
            name="tags"
            label="Tags"
            placeholder="voluntariado, emergencia, sdn  (separados por coma)"
            helperText="Separa los tags con comas"
          />

          <div className="flex gap-3 pt-2">
            <AdminButton
              type="button"
              variant="ghost"
              fullWidth
              disabled={saving}
              onClick={onClose}
            >
              Cancelar
            </AdminButton>
            <AdminButton
              type="submit"
              variant="primary"
              fullWidth
              loading={saving}
              loadingText="Guardando..."
            >
              {n?.id ? "Guardar Cambios" : "Crear Noticia"}
            </AdminButton>
          </div>
        </FormManaged>
          </div>
        </SimpleBar>
      </motion.div>
    </div>
  );
}

// ── Stats Section ─────────────────────────────────────────────────────────────
function EstadisticasTab({ noticias, isDark }: { noticias: Noticia[]; isDark: boolean }) {
  const publicadas = noticias.filter((n) => n.estado === "publicado");
  const totalVistas = publicadas.reduce((a, b) => a + b.vistas, 0);
  const totalLikes = publicadas.reduce((a, b) => a + b.likes, 0);
  const totalComp = publicadas.reduce((a, b) => a + b.compartidos, 0);
  const topNoticias = [...publicadas].sort((a, b) => b.vistas - a.vistas).slice(0, 4);
  const byCategoria = Object.entries(CATEGORIA_CONFIG)
    .map(([k, v]) => ({ categoria: k, label: v.label, color: v.color, count: noticias.filter((n) => n.categoria === k).length }))
    .filter((c) => c.count > 0);

  const cardStyle = {
    background: isDark ? "rgba(255,255,255,0.025)" : "#ffffff",
    borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    boxShadow: isDark ? "none" : "0 1px 6px rgba(0,0,0,0.06)",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Noticias Publicadas", value: publicadas.length, icon: "solar:document-bold-duotone",  color: "#22c55e" },
          { label: "Vistas Totales",      value: totalVistas.toLocaleString(), icon: "solar:eye-bold-duotone", color: "#3b82f6" },
          { label: "Likes Totales",       value: totalLikes, icon: "solar:heart-bold-duotone", color: "#ef4444" },
          { label: "Compartidos",         value: totalComp,  icon: "solar:share-bold-duotone", color: "#8b5cf6" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5 border flex items-center gap-4" style={cardStyle}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>
              <Iconify Size={20} IconString={s.icon} Style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#64748b" }}>{s.label}</p>
              <p className="font-black text-xl" style={{ color: isDark ? "#fff" : "#0f172a" }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl p-5 border" style={cardStyle}>
          <h3 className="font-black text-base mb-4" style={{ color: isDark ? "#fff" : "#0f172a" }}>Noticias más vistas</h3>
          <div className="space-y-4">
            {topNoticias.map((n, i) => {
              const maxVistas = topNoticias[0]?.vistas || 1;
              const catCfg = CATEGORIA_CONFIG[n.categoria];
              return (
                <div key={n.id} className="flex items-center gap-3">
                  <span className="font-black text-xs w-4 text-right" style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#cbd5e1" }}>{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold truncate max-w-[60%]" style={{ color: isDark ? "#fff" : "#0f172a" }}>{n.titulo}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: catCfg.bg, color: catCfg.color }}>{catCfg.label}</span>
                        <span className="text-xs font-bold" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#64748b" }}>{n.vistas.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0" }}>
                      <div className="h-full rounded-full" style={{ width: `${(n.vistas / maxVistas) * 100}%`, background: "linear-gradient(90deg, #f59e0b, #fb923c)" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl p-5 border" style={cardStyle}>
          <h3 className="font-black text-base mb-4" style={{ color: isDark ? "#fff" : "#0f172a" }}>Por Categoría</h3>
          <div className="space-y-3">
            {byCategoria.map((c) => (
              <div key={c.categoria}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold" style={{ color: c.color }}>{c.label}</span>
                  <span className="text-xs font-bold" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#64748b" }}>{c.count}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0" }}>
                  <div className="h-full rounded-full" style={{ width: `${(c.count / noticias.length) * 100}%`, background: c.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminNoticiasPage() {
  const { hasPermission } = useAuth();
  const { theme } = useSettings();
  const isDark = theme === "dark";
  const canManage = hasPermission("canManageNews");

  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"noticias" | "estadisticas">("noticias");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("todos");
  const [filterEst, setFilterEst] = useState<string>("todos");
  const [editor, setEditor] = useState<{ open: boolean; n: Partial<Noticia> | null }>({ open: false, n: null });
  const [preview, setPreview] = useState<Noticia | null>(null);

  const fetchNoticias = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getNoticiasAdmin();
      setNoticias(res.noticias);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNoticias(); }, [fetchNoticias]);

  const filtered = noticias.filter((n) => {
    const matchS = n.titulo.toLowerCase().includes(search.toLowerCase()) || n.autor.toLowerCase().includes(search.toLowerCase());
    const matchC = filterCat === "todos" || n.categoria === filterCat;
    const matchE = filterEst === "todos" || n.estado === filterEst;
    return matchS && matchC && matchE;
  });

  const handleSave = async (data: NoticiaFormValues & { id?: string }) => {
    try {
      if (data.id) {
        await updateNoticia(data.id, data);
      } else {
        await createNoticia(data);
      }
      await fetchNoticias();
      setEditor({ open: false, n: null });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Eliminar esta noticia?")) {
      try {
        await deleteNoticia(id);
        setNoticias((prev) => prev.filter((n) => n.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const cardStyle = {
    background: isDark ? "rgba(255,255,255,0.025)" : "#ffffff",
    borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    boxShadow: isDark ? "none" : "0 1px 6px rgba(0,0,0,0.06)",
  };

  const inputStyle = {
    background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
    borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)",
    color: isDark ? "rgba(255,255,255,0.7)" : "#334155",
  } as React.CSSProperties;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-black text-2xl tracking-tight" style={{ color: isDark ? "#fff" : "#0f172a" }}>
            Noticias
          </h1>
          <p className="text-sm mt-1" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#64748b" }}>
            Gestión y estadísticas del contenido publicado
          </p>
        </div>
        {canManage && tab === "noticias" && (
          <AdminButton
            variant="primary"
            icon="solar:add-circle-bold-duotone"
            onClick={() => setEditor({ open: true, n: null })}
          >
            Nueva Noticia
          </AdminButton>
        )}
      </div>

      {/* Tabs */}
      <div
        className="flex items-center border-b mb-6"
        style={{ borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)" }}
      >
        <TabButton active={tab === "noticias"} onClick={() => setTab("noticias")} isDark={isDark}>
          Noticias
        </TabButton>
        <TabButton active={tab === "estadisticas"} onClick={() => setTab("estadisticas")} isDark={isDark}>
          Estadísticas
        </TabButton>
      </div>

      <AnimatePresence mode="wait">
        {tab === "estadisticas" && (
          <EstadisticasTab key="stats" noticias={noticias} isDark={isDark} />
        )}

        {tab === "noticias" && (
          <motion.div key="noticias" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Iconify Size={16} IconString="solar:magnifier-linear" Style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }} />
                </span>
                <input
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                  placeholder="Buscar noticias..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={inputStyle}
                />
              </div>
              
              <FilterSelect
                value={filterCat}
                onChange={setFilterCat}
                placeholder="Todas las categorías"
                icon="solar:tag-bold-duotone"
                options={Object.entries(CATEGORIA_CONFIG).map(([k, v]) => ({
                  value: k,
                  label: v.label,
                  color: v.color,
                }))}
              />
              
              <FilterSelect
                value={filterEst}
                onChange={setFilterEst}
                placeholder="Todos los estados"
                icon="solar:eye-bold-duotone"
                options={Object.entries(ESTADO_CONFIG).map(([k, v]) => ({
                  value: k,
                  label: v.label,
                  color: v.color,
                }))}
              />
            </div>

            {/* Grid */}
            {loading ? (
              <div className="text-center py-20">
                <p className="text-sm font-medium" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}>Cargando noticias...</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((n) => {
                  const catCfg = CATEGORIA_CONFIG[n.categoria];
                  const estCfg = ESTADO_CONFIG[n.estado];
                  return (
                    <motion.div
                      key={n.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      className="rounded-2xl border overflow-hidden group transition-all"
                      style={cardStyle}
                    >
                      <div className="relative h-36 overflow-hidden">
                        <img
                          src={n.portada}
                          alt={n.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div
                          className="absolute inset-0"
                          style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(10,12,17,0.65) 100%)" }}
                        />
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-lg" style={{ background: catCfg.bg, color: catCfg.color, backdropFilter: "blur(8px)" }}>
                            {catCfg.label}
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-lg" style={{ background: estCfg.bg, color: estCfg.color, backdropFilter: "blur(8px)" }}>
                            {estCfg.label}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <p className="font-bold text-sm leading-snug line-clamp-2 mb-1.5" style={{ color: isDark ? "#fff" : "#0f172a" }}>
                          {n.titulo}
                        </p>
                        <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#64748b" }}>
                          {n.resumen}
                        </p>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-5 h-5 rounded-lg flex items-center justify-center font-black text-white text-[9px]"
                              style={{ background: "rgba(245,158,11,0.2)" }}
                            >
                              {n.autor.charAt(0)}
                            </div>
                            <span className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#64748b" }}>{n.autor}</span>
                          </div>
                          <span className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.25)" : "#94a3b8" }}>{n.fechaPublicacion}</span>
                        </div>

                        {n.estado === "publicado" && (
                          <div
                            className="flex items-center gap-3 mb-3 pt-3 border-t"
                            style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}
                          >
                            {[
                              { icon: "solar:eye-linear", val: n.vistas.toLocaleString() },
                              { icon: "solar:heart-linear", val: n.likes },
                              { icon: "solar:share-linear", val: n.compartidos },
                            ].map((s) => (
                              <div key={s.icon} className="flex items-center gap-1 text-xs" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}>
                                <Iconify Size={12} IconString={s.icon} Style={{ color: "currentColor" }} />
                                {s.val}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <AdminButton
                            size="sm"
                            variant="ghost"
                            icon="solar:eye-bold-duotone"
                            onClick={() => setPreview(n)}
                          >
                            Preview
                          </AdminButton>
                          {canManage && (
                            <>
                              <AdminButton
                                size="sm"
                                variant="ghost"
                                icon="solar:pen-2-bold-duotone"
                                onClick={() => setEditor({ open: true, n })}
                                className="!text-amber-500 !border-amber-500/25"
                              >
                                Editar
                              </AdminButton>
                              <AdminButton
                                size="sm"
                                variant="danger"
                                icon="solar:trash-bin-trash-bold-duotone"
                                onClick={() => handleDelete(n.id)}
                                className="ml-auto"
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-lg font-black" style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#cbd5e1" }}>
                  Sin resultados
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {editor.open && (
          <NoticiaEditor
            key="editor"
            n={editor.n}
            onClose={() => setEditor({ open: false, n: null })}
            onSave={handleSave}
            isDark={isDark}
          />
        )}
        {preview && (
          <NoticiaPreview key="preview" n={preview} onClose={() => setPreview(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
