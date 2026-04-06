import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "../../platform/components/AuthContext";
import { useSettings } from "../../hooks/context/SettingsContext";
import { FormManaged, RHFTextField, RHFSelect } from "../../components/FormComponents";
import {
  centroSchema,
  centroDefaultValues,
  type CentroFormValues,
} from "../../components/FormComponents/schemas";
import Iconify from "../../components/modularUI/IconsMock";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Centro {
  id: string;
  nombre: string;
  direccion: string;
  municipio: string;
  telefono: string;
  horario: string;
  responsable: string;
  estado: "activo" | "inactivo" | "lleno";
  capacidad: number;
  ocupacion: number;
  tipo: "alimentos" | "ropa" | "medicamentos" | "general";
  createdAt: string;
}

const TIPO_LABELS = {
  alimentos: "Alimentos",
  ropa: "Ropa",
  medicamentos: "Medicamentos",
  general: "General",
};
const TIPO_ICONS = {
  alimentos: "solar:chef-hat-bold-duotone",
  ropa: "solar:t-shirt-bold-duotone",
  medicamentos: "solar:medical-kit-bold-duotone",
  general: "solar:box-bold-duotone",
};
const TIPO_COLORS = {
  alimentos: "#f59e0b",
  ropa: "#8b5cf6",
  medicamentos: "#10b981",
  general: "#3b82f6",
};
const ESTADO_CONFIG = {
  activo:   { label: "Activo",   color: "#22c55e", bg: "rgba(34,197,94,0.12)"   },
  inactivo: { label: "Inactivo", color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  lleno:    { label: "Lleno",    color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
};

const MOCK_CENTROS: Centro[] = [
  { id: "1", nombre: "Centro Norte CXUM", direccion: "Av. Principal 123, Sector Norte", municipio: "Santo Domingo Norte", telefono: "809-555-0101", horario: "8:00am – 5:00pm", responsable: "María González", estado: "activo", capacidad: 500, ocupacion: 320, tipo: "general", createdAt: "2024-01-15" },
  { id: "2", nombre: "Punto de Acopio Este", direccion: "Calle 5 #45, Los Jardines", municipio: "Santo Domingo Este", telefono: "809-555-0202", horario: "7:00am – 4:00pm", responsable: "Carlos Peña", estado: "lleno", capacidad: 300, ocupacion: 300, tipo: "alimentos", createdAt: "2024-02-08" },
  { id: "3", nombre: "Centro Médico CXUM Oeste", direccion: "Blvd. 30 de Mayo Km 3", municipio: "Santo Domingo Oeste", telefono: "809-555-0303", horario: "9:00am – 6:00pm", responsable: "Ana Reyes", estado: "activo", capacidad: 200, ocupacion: 75, tipo: "medicamentos", createdAt: "2024-03-20" },
  { id: "4", nombre: "Almacén Textil Centro", direccion: "Calle El Conde #12", municipio: "Distrito Nacional", telefono: "809-555-0404", horario: "8:00am – 3:00pm", responsable: "Luis Martínez", estado: "inactivo", capacidad: 400, ocupacion: 0, tipo: "ropa", createdAt: "2024-04-10" },
];

// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  color,
  isDark,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  isDark: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-5 border flex items-center gap-4"
      style={{
        background: isDark ? "rgba(255,255,255,0.025)" : "#ffffff",
        borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
        boxShadow: isDark ? "none" : "0 1px 6px rgba(0,0,0,0.06)",
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}
      >
        <Iconify Size={20} IconString={icon} Style={{ color }} />
      </div>
      <div>
        <p className="text-xs font-medium" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#64748b" }}>{label}</p>
        <p className="font-black text-xl" style={{ color: isDark ? "#fff" : "#0f172a" }}>{value}</p>
      </div>
    </div>
  );
}

// ── CentroCard ────────────────────────────────────────────────────────────────
function CentroCard({
  centro,
  canEdit,
  onEdit,
  onDelete,
  isDark,
}: {
  centro: Centro;
  canEdit: boolean;
  onEdit: (c: Centro) => void;
  onDelete: (id: string) => void;
  isDark: boolean;
}) {
  const pct = Math.round((centro.ocupacion / centro.capacidad) * 100);
  const tipoColor = TIPO_COLORS[centro.tipo];
  const estadoCfg = ESTADO_CONFIG[centro.estado];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="rounded-2xl p-5 border group transition-all duration-200"
      style={{
        background: isDark ? "rgba(255,255,255,0.025)" : "#ffffff",
        borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
        boxShadow: isDark ? "none" : "0 1px 6px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${tipoColor}18`, border: `1px solid ${tipoColor}30` }}
          >
            <Iconify Size={18} IconString={TIPO_ICONS[centro.tipo]} Style={{ color: tipoColor }} />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight" style={{ color: isDark ? "#fff" : "#0f172a" }}>{centro.nombre}</p>
            <p className="text-xs mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#64748b" }}>{centro.municipio}</p>
          </div>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: estadoCfg.bg, color: estadoCfg.color }}>
          {estadoCfg.label}
        </span>
      </div>

      <div className="space-y-1.5 mb-4">
        {[
          { icon: "solar:map-point-linear", text: centro.direccion },
          { icon: "solar:clock-circle-linear", text: centro.horario },
          { icon: "solar:user-linear", text: centro.responsable },
          { icon: "solar:phone-linear", text: centro.telefono },
        ].map((item) => (
          <div key={item.icon} className="flex items-center gap-2 text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#64748b" }}>
            <Iconify Size={12} IconString={item.icon} Style={{ color: "currentColor", flexShrink: 0 }} />
            <span className="truncate">{item.text}</span>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#64748b" }}>Ocupación</span>
          <span className="font-bold" style={{ color: isDark ? "#fff" : "#0f172a" }}>
            {centro.ocupacion}/{centro.capacidad} ({pct}%)
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.07)" : "#e2e8f0" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background: pct >= 100 ? "#ef4444" : pct >= 75 ? "#f59e0b" : "#22c55e",
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: `${tipoColor}15`, color: tipoColor }}>
          {TIPO_LABELS[centro.tipo]}
        </span>
        {canEdit && (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(centro)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f59e0b")}
              onMouseLeave={(e) => (e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.4)" : "#94a3b8")}
            >
              <Iconify Size={14} IconString="solar:pen-2-bold-duotone" Style={{ color: "currentColor" }} />
            </button>
            <button
              onClick={() => onDelete(centro.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={(e) => (e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.4)" : "#94a3b8")}
            >
              <Iconify Size={14} IconString="solar:trash-bin-trash-bold-duotone" Style={{ color: "currentColor" }} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Modal con RHF ─────────────────────────────────────────────────────────────
function CentroModal({
  centro,
  onClose,
  onSave,
  isDark,
}: {
  centro: Partial<Centro> | null;
  onClose: () => void;
  onSave: (data: CentroFormValues & { id?: string }) => void;
  isDark: boolean;
}) {
  const methods = useForm<CentroFormValues>({
    resolver: yupResolver(centroSchema),
    defaultValues: centro?.id
      ? {
          nombre:      centro.nombre      ?? "",
          tipo:        (centro.tipo       ?? "general") as CentroFormValues["tipo"],
          estado:      (centro.estado     ?? "activo")  as CentroFormValues["estado"],
          direccion:   centro.direccion   ?? "",
          municipio:   centro.municipio   ?? "",
          telefono:    centro.telefono    ?? "",
          horario:     centro.horario     ?? "",
          responsable: centro.responsable ?? "",
          capacidad:   centro.capacidad   ?? 200,
          ocupacion:   centro.ocupacion   ?? 0,
        }
      : centroDefaultValues,
  });

  const handleSubmit = (data: CentroFormValues) => {
    onSave({ ...data, id: centro?.id });
  };

  const overlayStyle = { background: "rgba(0,0,0,0.72)", backdropFilter: "blur(10px)" };
  const modalBg = isDark ? "#0f1117" : "#ffffff";
  const modalBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={overlayStyle}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg rounded-3xl p-6 border max-h-[90vh] overflow-y-auto"
        style={{ background: modalBg, borderColor: modalBorder, boxShadow: "0 24px 80px rgba(0,0,0,0.35)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-black text-lg" style={{ color: isDark ? "#fff" : "#0f172a" }}>
              {centro?.id ? "Editar Centro" : "Nuevo Centro de Acopio"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#64748b" }}>
              Completa los datos del centro de acopio
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8" }}
          >
            <Iconify Size={18} IconString="solar:close-circle-bold-duotone" Style={{ color: "currentColor" }} />
          </button>
        </div>

        <FormManaged methods={methods} onSubmit={handleSubmit} className="space-y-4">
          <RHFTextField<CentroFormValues>
            name="nombre"
            label="Nombre del Centro"
            placeholder="Centro de Acopio CXUM..."
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <RHFSelect<CentroFormValues>
              name="tipo"
              label="Tipo"
              required
              options={Object.entries(TIPO_LABELS).map(([k, v]) => ({ value: k, label: v }))}
            />
            <RHFSelect<CentroFormValues>
              name="estado"
              label="Estado"
              required
              options={Object.entries(ESTADO_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))}
            />
          </div>

          <RHFTextField<CentroFormValues>
            name="direccion"
            label="Dirección"
            placeholder="Av. Principal #123..."
            required
          />

          <RHFTextField<CentroFormValues>
            name="municipio"
            label="Municipio"
            placeholder="Santo Domingo Norte..."
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <RHFTextField<CentroFormValues>
              name="telefono"
              label="Teléfono"
              placeholder="809-555-0000"
              required
            />
            <RHFTextField<CentroFormValues>
              name="horario"
              label="Horario"
              placeholder="8:00am – 5:00pm"
              required
            />
          </div>

          <RHFTextField<CentroFormValues>
            name="responsable"
            label="Responsable"
            placeholder="Nombre del responsable"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <RHFTextField<CentroFormValues>
              name="capacidad"
              label="Capacidad Total"
              type="number"
              required
            />
            <RHFTextField<CentroFormValues>
              name="ocupacion"
              label="Ocupación Actual"
              type="number"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border text-sm font-bold transition-colors"
              style={{
                color: isDark ? "rgba(255,255,255,0.4)" : "#64748b",
                borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-black text-white"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #fb923c)",
                boxShadow: "0 4px 20px rgba(245,158,11,0.35)",
              }}
            >
              {centro?.id ? "Guardar Cambios" : "Crear Centro"}
            </button>
          </div>
        </FormManaged>
      </motion.div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminCentrosPage() {
  const { hasPermission } = useAuth();
  const { theme } = useSettings();
  const isDark = theme === "dark";
  const canEdit = hasPermission("canManageCenters");

  const [centros, setCentros] = useState<Centro[]>(MOCK_CENTROS);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [filterTipo, setFilterTipo] = useState<string>("todos");
  const [modal, setModal] = useState<{ open: boolean; centro: Partial<Centro> | null }>({
    open: false,
    centro: null,
  });

  const filtered = centros.filter((c) => {
    const matchSearch =
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.municipio.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filterEstado === "todos" || c.estado === filterEstado;
    const matchTipo = filterTipo === "todos" || c.tipo === filterTipo;
    return matchSearch && matchEstado && matchTipo;
  });

  const handleSave = (data: CentroFormValues & { id?: string }) => {
    if (data.id) {
      setCentros((prev) =>
        prev.map((c) => (c.id === data.id ? { ...c, ...data } as Centro : c))
      );
    } else {
      setCentros((prev) => [
        {
          ...data,
          id: Date.now().toString(),
          createdAt: new Date().toISOString().split("T")[0],
        } as Centro,
        ...prev,
      ]);
    }
    setModal({ open: false, centro: null });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Eliminar este centro de acopio?")) {
      setCentros((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const activos = centros.filter((c) => c.estado === "activo").length;
  const totalCap = centros.reduce((a, b) => a + b.capacidad, 0);
  const totalOcup = centros.reduce((a, b) => a + b.ocupacion, 0);

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
          <h1
            className="font-black text-2xl tracking-tight"
            style={{ color: isDark ? "#fff" : "#0f172a" }}
          >
            Centros de Acopio
          </h1>
          <p className="text-sm mt-1" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#64748b" }}>
            Administra los puntos de recolección y distribución
          </p>
        </div>
        {canEdit && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setModal({ open: true, centro: null })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black text-white"
            style={{
              background: "linear-gradient(135deg, #f59e0b, #fb923c)",
              boxShadow: "0 4px 20px rgba(245,158,11,0.3)",
            }}
          >
            <Iconify Size={16} IconString="solar:add-circle-bold-duotone" Style={{ color: "#fff" }} />
            Nuevo Centro
          </motion.button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total de Centros"  value={centros.length}                                      icon="solar:map-point-bold-duotone"    color="#f59e0b" isDark={isDark} />
        <StatCard label="Centros Activos"   value={activos}                                             icon="solar:check-circle-bold-duotone" color="#22c55e" isDark={isDark} />
        <StatCard label="Capacidad Total"   value={totalCap.toLocaleString()}                           icon="solar:box-bold-duotone"          color="#3b82f6" isDark={isDark} />
        <StatCard label="Ocupación Global"  value={totalCap > 0 ? `${Math.round((totalOcup / totalCap) * 100)}%` : "0%"} icon="solar:chart-bold-duotone" color="#8b5cf6" isDark={isDark} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Iconify Size={16} IconString="solar:magnifier-linear" Style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }} />
          </span>
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-amber-500/30"
            placeholder="Buscar centros..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: "2.25rem" }}
          />
        </div>
        <select
          className="px-3 py-2.5 rounded-xl border text-sm font-semibold outline-none"
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          style={inputStyle}
        >
          <option value="todos">Todos los estados</option>
          {Object.entries(ESTADO_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select
          className="px-3 py-2.5 rounded-xl border text-sm font-semibold outline-none"
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value)}
          style={inputStyle}
        >
          <option value="todos">Todos los tipos</option>
          {Object.entries(TIPO_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <p className="text-lg font-black" style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#cbd5e1" }}>
              Sin resultados
            </p>
            <p className="text-sm mt-1" style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#cbd5e1" }}>
              Prueba con otro término de búsqueda
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <CentroCard
                key={c.id}
                centro={c}
                canEdit={canEdit}
                onEdit={(c) => setModal({ open: true, centro: c })}
                onDelete={handleDelete}
                isDark={isDark}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {modal.open && (
          <CentroModal
            centro={modal.centro}
            onClose={() => setModal({ open: false, centro: null })}
            onSave={handleSave}
            isDark={isDark}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
