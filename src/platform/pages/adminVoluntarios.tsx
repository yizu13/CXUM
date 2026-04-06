import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { useSettings } from "../../hooks/context/SettingsContext";
import { FormManaged, RHFTextField, RHFSelect } from "../../components/FormComponents";
import {
  voluntarioEditSchema,
  type VoluntarioEditFormValues,
} from "../../components/FormComponents/schemas";
import { ROLE_LABELS, ROLE_COLORS } from "../../platform/components/auth";
import type { UserRole } from "../../platform/components/auth";
import Iconify from "../../components/modularUI/IconsMock";
import { getAllUsers } from "../APIs/modifyRole";
import { useAuth } from "../components/AuthContextComps";


// ── Types ─────────────────────────────────────────────────────────────────────
interface Voluntario {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "activo" | "pendiente" | "suspendido";
  municipio: string;
  telefono: string;
  joinedAt: string;
}

type SolicitudStatus = "pendiente" | "aprobada" | "rechazada";
interface Solicitud {
  id: string;
  voluntarioId: string;
  nombre: string;
  email: string;
  tipo: "registro" | "cambio_rol";
  rolSolicitado: UserRole;
  mensaje: string;
  fecha: string;
  status: SolicitudStatus;
}

const MOCK_VOLUNTARIOS: Voluntario[] = [
  { id: "1", name: "María González",  email: "maria@cxum.org",  role: "colaborador",   status: "activo",     municipio: "SDN", telefono: "809-555-0101", joinedAt: "2024-01-15" },
  { id: "2", name: "Carlos Peña",     email: "carlos@cxum.org", role: "escritor",      status: "activo",     municipio: "SDE", telefono: "809-555-0202", joinedAt: "2024-02-08" },
  { id: "3", name: "Ana Reyes",       email: "ana@cxum.org",    role: "voluntario",    status: "pendiente",  municipio: "SDO", telefono: "809-555-0303", joinedAt: "2024-03-20" },
  { id: "4", name: "Luis Martínez",   email: "luis@cxum.org",   role: "voluntario",    status: "suspendido", municipio: "DN",  telefono: "809-555-0404", joinedAt: "2024-04-10" },
  { id: "5", name: "Sofía Herrera",   email: "sofia@cxum.org",  role: "administradores", status: "activo",     municipio: "DN",  telefono: "809-555-0505", joinedAt: "2023-12-01" },
  { id: "6", name: "Pedro Álvarez",   email: "pedro@cxum.org",  role: "escritor",      status: "activo",     municipio: "SDE", telefono: "809-555-0606", joinedAt: "2024-05-22" },
];

const MOCK_SOLICITUDES: Solicitud[] = [
  { id: "s1", voluntarioId: "3", nombre: "Ana Reyes",     email: "ana@cxum.org",    tipo: "registro",   rolSolicitado: "voluntario",  mensaje: "Quiero apoyar en actividades de distribución.",               fecha: "2024-03-20", status: "pendiente" },
  { id: "s2", voluntarioId: "6", nombre: "Pedro Álvarez", email: "pedro@cxum.org",  tipo: "cambio_rol", rolSolicitado: "colaborador", mensaje: "Tengo experiencia previa en coordinación logística.",          fecha: "2024-05-30", status: "pendiente" },
  { id: "s3", voluntarioId: "2", nombre: "Carlos Peña",   email: "carlos@cxum.org", tipo: "cambio_rol", rolSolicitado: "colaborador", mensaje: "Llevo 6 meses contribuyendo con noticias y redacción.",       fecha: "2024-06-01", status: "aprobada"  },
];

const STATUS_CONFIG = {
  activo:     { label: "Activo",     color: "#22c55e", bg: "rgba(34,197,94,0.12)"   },
  pendiente:  { label: "Pendiente",  color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
  suspendido: { label: "Suspendido", color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
};

const SOL_STATUS_CONFIG: Record<SolicitudStatus, { label: string; color: string; bg: string }> = {
  pendiente:  { label: "Pendiente", color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
  aprobada:   { label: "Aprobada",  color: "#22c55e", bg: "rgba(34,197,94,0.12)"   },
  rechazada:  { label: "Rechazada", color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
};

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "voluntario",    label: "Voluntario"    },
  { value: "escritor",      label: "Escritor"      },
  { value: "colaborador",   label: "Colaborador"   },
  { value: "administradores", label: "Administradores" },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "activo",     label: "Activo"     },
  { value: "pendiente",  label: "Pendiente"  },
  { value: "suspendido", label: "Suspendido" },
];

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
          layoutId="tabLine"
          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
          style={{ background: "#f59e0b" }}
        />
      )}
    </button>
  );
}

// ── Edit Modal con RHF ────────────────────────────────────────────────────────
function VoluntarioModal({
  v,
  onClose,
  onSave,
  isDark,
}: {
  v: Voluntario;
  onClose: () => void;
  onSave: (updated: Voluntario) => void;
  isDark: boolean;
}) {
  const { user } = useAuth();
  const roleColor = ROLE_COLORS[v.role];

  const methods = useForm<VoluntarioEditFormValues>({
    resolver: yupResolver(voluntarioEditSchema),
    defaultValues: {
      role:      v.role,
      status:    v.status,
      telefono:  v.telefono,
      municipio: v.municipio,
    },
  });

  const handleSubmit = (data: VoluntarioEditFormValues) => {
    onSave({ ...v, ...data } as Voluntario);
    onClose();
  };

  const modalBg     = isDark ? "#0f1117" : "#ffffff";
  const modalBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md rounded-3xl p-6 border"
        style={{ background: modalBg, borderColor: modalBorder, boxShadow: "0 24px 80px rgba(0,0,0,0.35)" }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white text-lg shrink-0"
            style={{ background: `${roleColor}25`, border: `1px solid ${roleColor}40` }}
          >
            {v.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-base truncate" style={{ color: isDark ? "#fff" : "#0f172a" }}>
              {v.name}
            </p>
            <p className="text-xs truncate" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#64748b" }}>
              {v.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0"
            style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8" }}
          >
            <Iconify Size={18} IconString="solar:close-circle-bold-duotone" Style={{ color: "currentColor" }} />
          </button>
        </div>

        <FormManaged methods={methods} onSubmit={handleSubmit} className="space-y-4">
          <RHFSelect<VoluntarioEditFormValues>
            name="role"
            label="Rol"
            required
            options={ROLE_OPTIONS}
            disabled={v.email ===  user?.email}
          />
          <RHFSelect<VoluntarioEditFormValues>
            name="status"
            label="Estado"
            required
            options={STATUS_OPTIONS}
          />
          <RHFTextField<VoluntarioEditFormValues>
            name="telefono"
            label="Teléfono"
            placeholder="809-555-0000"
            required
          />
          <RHFTextField<VoluntarioEditFormValues>
            name="municipio"
            label="Municipio"
            placeholder="Santo Domingo Norte..."
            required
          />

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
              Guardar Cambios
            </button>
          </div>
        </FormManaged>
      </motion.div>
    </div>
  );
}

export default function AdminVoluntariosPage() {
  const { hasPermission, user } = useAuth();
  const { theme } = useSettings();
  const isDark = theme === "dark";
  const canManage = hasPermission("canManageUsers");

  const [tab, setTab] = useState<"voluntarios" | "solicitudes">("solicitudes");
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>(MOCK_VOLUNTARIOS);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(MOCK_SOLICITUDES);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("todos");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [editModal, setEditModal] = useState<Voluntario | null>(null);

  const filteredVols = voluntarios.filter((v) => {
    const matchS  = v.name.toLowerCase().includes(search.toLowerCase()) || v.email.toLowerCase().includes(search.toLowerCase());
    const matchR  = filterRole   === "todos" || v.role   === filterRole;
    const matchSt = filterStatus === "todos" || v.status === filterStatus;
    return matchS && matchR && matchSt;
  });

  useEffect(()=>{
    const listUsers = async () => {
      const users = await getAllUsers();
      const mapped = users.users.map((u) => ({
        id: u.username,
        name: u.name,
        email: u.email,
        role: u.groups[0],
        status: u.status === "CONFIRMED"? "activo" : "pendiente",
        municipio: u?.attributes?.municipio || "SDN",
        telefono: u?.attributes?.telefono || "809-555-0000",
        joinedAt: u?.attributes?.joinedAt || "2024-01-01",
      } as Voluntario));

      setVoluntarios(mapped);

    };

    listUsers();
  },[])

  const pendientesCount = solicitudes.filter((s) => s.status === "pendiente").length;

  const handleSolicitud = (id: string, accion: "aprobada" | "rechazada") => {
    setSolicitudes((prev) => prev.map((s) => (s.id === id ? { ...s, status: accion } : s)));
    if (accion === "aprobada") {
      const sol = solicitudes.find((s) => s.id === id);
      if (sol?.tipo === "registro") {
        setVoluntarios((prev) => prev.map((v) => v.id === sol.voluntarioId ? { ...v, status: "activo" as const } : v));
      }
      if (sol?.tipo === "cambio_rol") {
        setVoluntarios((prev) => prev.map((v) => v.id === sol.voluntarioId ? { ...v, role: sol.rolSolicitado } : v));
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

  const tableHeaderColor = isDark ? "rgba(255,255,255,0.3)" : "#94a3b8";
  const tableBorderColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)";
  const tableRowHover    = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-black text-2xl tracking-tight" style={{ color: isDark ? "#fff" : "#0f172a" }}>
          Voluntarios
        </h1>
        <p className="text-sm mt-1" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#64748b" }}>
          Gestión de usuarios, solicitudes, roles y estado
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Voluntarios",  value: voluntarios.length,                                    icon: "solar:users-group-two-rounded-bold-duotone", color: "#f59e0b" },
          { label: "Activos",            value: voluntarios.filter((v) => v.status === "activo").length, icon: "solar:check-circle-bold-duotone",           color: "#22c55e" },
          { label: "Pendientes",         value: voluntarios.filter((v) => v.status === "pendiente").length, icon: "solar:clock-circle-bold-duotone",        color: "#f59e0b" },
          { label: "Solicitudes Nuevas", value: pendientesCount,                                       icon: "solar:bell-bing-bold-duotone",               color: "#ef4444" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5 border flex items-center gap-4" style={cardStyle}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>
              <Iconify Size={20} IconString={s.icon} Style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#64748b" }}>{s.label}</p>
              <p className="font-black text-xl" style={{ color: isDark ? "#fff" : "#0f172a" }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div
        className="flex items-center border-b mb-6"
        style={{ borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)" }}
      >
        <TabButton active={tab === "solicitudes"} onClick={() => setTab("solicitudes")} isDark={isDark}>
          Solicitudes
          {pendientesCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-black" style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444" }}>
              {pendientesCount}
            </span>
          )}
        </TabButton>
        <TabButton active={tab === "voluntarios"} onClick={() => setTab("voluntarios")} isDark={isDark}>
          Voluntarios Registrados
        </TabButton>
      </div>

      {/* ── Tab: Solicitudes ── */}
      <AnimatePresence mode="wait">
        {tab === "solicitudes" && (
          <motion.div key="solicitudes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="space-y-3">
              {solicitudes.length === 0 && (
                <div className="text-center py-16">
                  <p className="font-black text-lg" style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#cbd5e1" }}>
                    Sin solicitudes
                  </p>
                </div>
              )}
              {solicitudes.map((s) => {
                const statusCfg = SOL_STATUS_CONFIG[s.status];
                const roleColor = ROLE_COLORS[s.rolSolicitado];
                return (
                  <div key={s.id} className="rounded-2xl p-5 border" style={cardStyle}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0"
                          style={{ background: `${roleColor}20`, border: `1px solid ${roleColor}35` }}
                        >
                          {s.nombre.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-sm" style={{ color: isDark ? "#fff" : "#0f172a" }}>
                              {s.nombre}
                            </p>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: `${roleColor}15`, color: roleColor }}>
                              {ROLE_LABELS[s.rolSolicitado]}
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: statusCfg.bg, color: statusCfg.color }}>
                              {statusCfg.label}
                            </span>
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#64748b" }}>
                            {s.email} · {s.tipo === "registro" ? "Nuevo registro" : "Cambio de rol"} · {s.fecha}
                          </p>
                          <p className="text-xs mt-2 max-w-lg" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#475569" }}>
                            {s.mensaje}
                          </p>
                        </div>
                      </div>

                      {canManage && s.status === "pendiente" && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleSolicitud(s.id, "rechazada")}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                            style={{ color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}
                          >
                            Rechazar
                          </button>
                          <button
                            onClick={() => handleSolicitud(s.id, "aprobada")}
                            className="px-3 py-1.5 rounded-lg text-xs font-black text-white"
                            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 2px 12px rgba(34,197,94,0.3)" }}
                          >
                            Aprobar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Tab: Voluntarios ── */}
        {tab === "voluntarios" && (
          <motion.div key="voluntarios" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-5">
              <div className="relative flex-1 min-w-[200px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Iconify Size={16} IconString="solar:magnifier-linear" Style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }} />
                </span>
                <input
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                  placeholder="Buscar voluntarios..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <select
                className="px-3 py-2.5 rounded-xl border text-sm font-semibold outline-none"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                style={inputStyle}
              >
                <option value="todos">Todos los roles</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <select
                className="px-3 py-2.5 rounded-xl border text-sm font-semibold outline-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={inputStyle}
              >
                <option value="todos">Todos los estados</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Table */}
            <div
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", background: isDark ? "rgba(255,255,255,0.02)" : "#ffffff", boxShadow: isDark ? "none" : "0 1px 6px rgba(0,0,0,0.06)" }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${tableBorderColor}` }}>
                      {["Voluntario", "Rol", "Estado", "Municipio", "Registro", ...(canManage ? ["Acciones"] : [])].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold tracking-wide" style={{ color: tableHeaderColor }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredVols.map((v) => {
                        const roleColor = ROLE_COLORS[v.role];
                        const statusCfg = STATUS_CONFIG[v.status];
                        return (
                          <motion.tr
                            key={v.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="group transition-colors"
                            style={{ borderBottom: `1px solid ${tableBorderColor}` }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = tableRowHover)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0"
                                  style={{ background: `${roleColor}20`, border: `1px solid ${roleColor}30` }}
                                >
                                  {v.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-semibold text-sm" style={{ color: isDark ? "#fff" : "#0f172a" }}>{v.name} {v.email == user?.email && "(Tú)"}</p>
                                  <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}>{v.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: `${roleColor}15`, color: roleColor }}>
                                {ROLE_LABELS[v.role]}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: statusCfg.bg, color: statusCfg.color }}>
                                {statusCfg.label}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-sm" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#475569" }}>
                              {v.municipio}
                            </td>
                            <td className="px-4 py-3.5 text-xs" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}>
                              {v.joinedAt}
                            </td>
                            {canManage && (
                              <td className="px-4 py-3.5">
                                <button
                                  onClick={() => setEditModal(v)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all opacity-0 group-hover:opacity-100"
                                  style={{ color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}
                                >
                                  <Iconify Size={12} IconString="solar:pen-2-bold-duotone" Style={{ color: "currentColor" }} />
                                  Editar
                                </button>
                              </td>
                            )}
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>

                {filteredVols.length === 0 && (
                  <div className="py-16 text-center">
                    <p className="font-black" style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#cbd5e1" }}>
                      Sin voluntarios que coincidan
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editModal && (
          <VoluntarioModal
            v={editModal}
            onClose={() => setEditModal(null)}
            onSave={(updated) => {
              setVoluntarios((prev) => prev.map((v) => v.id === updated.id ? updated : v));
              setEditModal(null);
            }}
            isDark={isDark}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
