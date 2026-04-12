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
import AdminButton from "../components/AdminButton";
import FilterSelect from "../../components/modularUI/FilterSelect";
import { getAllUsers, updateUserRole } from "../APIs/modifyRole";
import { getSolicitudes, resolverSolicitud, inviteUserToSystem } from "../APIs/solicitudes";
import type { Solicitud } from "../APIs/solicitudes";
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

// ── Modal: Incluir en sistema ─────────────────────────────────────────────────
function IncluirModal({
  solicitud,
  onClose,
  onConfirm,
  isDark,
}: {
  solicitud: Solicitud;
  onClose: () => void;
  onConfirm: (s: Solicitud) => Promise<void>;
  isDark: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ tempPassword: string } | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    setError("");
    try {
      const res = await onConfirm(solicitud);
      // @ts-expect-error res viene del padre
      setResult(res);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      // Extraer el mensaje del JSON si viene en el formato "Error 409: {...}"
      const match = msg.match(/Error \d+: (.+)/);
      if (match) {
        try {
          const parsed = JSON.parse(match[1]);
          setError(parsed.message ?? msg);
        } catch {
          setError(msg);
        }
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const modalBg     = isDark ? "#0f1117" : "#ffffff";
  const modalBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const textPrimary = isDark ? "#fff" : "#0f172a";
  const textMuted   = isDark ? "rgba(255,255,255,0.4)" : "#64748b";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md rounded-3xl p-6 border"
        style={{ background: modalBg, borderColor: modalBorder, boxShadow: "0 24px 80px rgba(0,0,0,0.35)" }}
      >
        {!result ? (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}>
                <Iconify Size={20} IconString="solar:user-plus-bold-duotone" Style={{ color: "#f59e0b" }} />
              </div>
              <div>
                <p className="font-black text-base" style={{ color: textPrimary }}>Incluir en el sistema</p>
                <p className="text-xs" style={{ color: textMuted }}>Esta acción creará una cuenta en el admin panel</p>
              </div>
              <AdminButton
              variant="ghost"
              size="sm"
                icon="solar:close-circle-bold-duotone"
            onClick={onClose}
          />
            </div>

            <div className="rounded-2xl p-4 mb-5" style={{ background: isDark ? "rgba(245,158,11,0.06)" : "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)" }}>
              <p className="text-sm font-semibold" style={{ color: textPrimary }}>{solicitud.nombre}</p>
              <p className="text-xs mt-0.5" style={{ color: textMuted }}>{solicitud.email}</p>
            </div>

            <p className="text-sm mb-5" style={{ color: textMuted }}>
              Se creará una cuenta con rol <strong style={{ color: "#6366f1" }}>Voluntario</strong> y se generará una contraseña temporal. Deberás compartirla manualmente con el usuario.
            </p>

            {error && (
              <div className="rounded-xl px-4 py-3 mb-4 text-sm font-medium"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                {error}
              </div>
            )}

            <AdminButton type="button" variant="ghost" fullWidth onClick={onClose}>
                Cancelar
              </AdminButton>
              <AdminButton type="button" variant="primary" fullWidth loading={loading} loadingText="Creando cuenta..." onClick={handleConfirm}>
                Confirmar
              </AdminButton>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-3 mb-5 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}>
                <Iconify Size={24} IconString="solar:check-circle-bold-duotone" Style={{ color: "#22c55e" }} />
              </div>
              <p className="font-black text-base" style={{ color: textPrimary }}>Cuenta creada</p>
              <p className="text-xs" style={{ color: textMuted }}>Comparte esta contraseña temporal con el usuario</p>
            </div>

            <div className="rounded-2xl p-4 mb-5 flex items-center justify-between gap-3"
              style={{ background: isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: textMuted }}>Contraseña temporal</p>
                <p className="font-mono font-black text-lg tracking-widest" style={{ color: "#6366f1" }}>
                  {result.tempPassword}
                </p>
              </div>
              <button onClick={() => handleCopy(result.tempPassword)}
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: copied ? "rgba(34,197,94,0.15)" : "rgba(99,102,241,0.15)" }}>
                <Iconify Size={16}
                  IconString={copied ? "solar:check-circle-bold" : "solar:copy-bold"}
                  Style={{ color: copied ? "#22c55e" : "#6366f1" }} />
              </button>
            </div>

            <p className="text-xs text-center mb-5" style={{ color: textMuted }}>
              El usuario deberá ingresar con <strong style={{ color: textPrimary }}>{solicitud.email}</strong> y cambiar su contraseña al primer inicio de sesión.
            </p>

            <AdminButton variant="success" fullWidth onClick={onClose}>
              Listo
            </AdminButton>
          </>
        )}
      </motion.div>
    </div>
  );
}

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
  { value: "voluntario",     label: "Voluntario"    },
  { value: "escritor",       label: "Escritor"      },
  { value: "colaborador",    label: "Colaborador"   },
  { value: "administradores", label: "Administrador" },
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
  const [saving, setSaving] = useState(false);
  const roleColor = ROLE_COLORS[v.role];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const methods = useForm<VoluntarioEditFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(voluntarioEditSchema) as any,
    defaultValues: {
      role:      v.role as VoluntarioEditFormValues["role"],
      status:    v.status,
      telefono:  v.telefono,
      municipio: v.municipio,
    },
  });

  const handleSubmit = async (data: VoluntarioEditFormValues) => {
    if (saving) return;
    setSaving(true);
    try {
      await onSave({ ...v, ...data } as Voluntario);
      onClose();
    } finally {
      setSaving(false);
    }
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
          <AdminButton
            variant="ghost"
            size="sm"
            icon="solar:close-circle-bold-duotone"
            onClick={onClose}
          />
        </div>

        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <FormManaged methods={methods as any} onSubmit={handleSubmit} className="space-y-4">
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
            <AdminButton type="button" variant="ghost" fullWidth disabled={saving} onClick={onClose}>
              Cancelar
            </AdminButton>
            <AdminButton type="submit" variant="primary" fullWidth loading={saving} loadingText="Guardando...">
              Guardar Cambios
            </AdminButton>
          </div>
        </FormManaged>
      </motion.div>
    </div>
  );
}

// ── Detalle Solicitud Modal ───────────────────────────────────────────────────
function DetalleSolicitudModal({
  s,
  onClose,
  onAprobar,
  onRechazar,
  canManage,
  isDark,
}: {
  s: Solicitud;
  onClose: () => void;
  onAprobar: (id: string) => void;
  onRechazar: (id: string) => void;
  canManage: boolean;
  isDark: boolean;
}) {
  const modalBg     = isDark ? "#0f1117" : "#ffffff";
  const modalBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const textPrimary = isDark ? "#fff" : "#0f172a";
  const textMuted   = isDark ? "rgba(255,255,255,0.4)" : "#64748b";
  const divider     = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  const statusCfg = SOL_STATUS_CONFIG[s.status];

  function Row({ label, value }: { label: string; value?: string | string[] }) {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    return (
      <div className="flex flex-col gap-0.5">
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: textMuted }}>{label}</p>
        <p className="text-sm font-medium" style={{ color: textPrimary }}>
          {Array.isArray(value) ? value.join(", ") : value}
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(12px)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-xl rounded-3xl border overflow-hidden max-h-[90vh] flex flex-col"
        style={{ background: modalBg, borderColor: modalBorder, boxShadow: "0 32px 100px rgba(0,0,0,0.4)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b" style={{ borderColor: divider }}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white shrink-0"
            style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)", color: "#6366f1" }}>
            {s.nombre.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-base truncate" style={{ color: textPrimary }}>{s.nombre}</p>
            <p className="text-xs truncate" style={{ color: textMuted }}>{s.email}</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-xl shrink-0"
            style={{ background: statusCfg.bg, color: statusCfg.color }}>
            {statusCfg.label}
          </span>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ color: textMuted }}>
            <Iconify Size={18} IconString="solar:close-circle-bold-duotone" Style={{ color: "currentColor" }} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 flex flex-col gap-5">

          {/* Contacto */}
          <div className="grid grid-cols-2 gap-4">
            <Row label="Teléfono" value={s.phone} />
            <Row label="Documento" value={s.idDocument} />
            <Row label="Fecha de nacimiento" value={s.birthDate} />
            <Row label="Dirección" value={s.address} />
            <Row label="Redes sociales" value={s.socialMedia} />
            <Row label="Ocupación" value={s.occupation} />
            <Row label="Nivel educativo" value={s.educationLevel} />
          </div>

          {(s.areas && s.areas.length > 0) && (
            <>
              <div className="h-px" style={{ background: divider }} />
              <Row label="Áreas de interés" value={s.areas} />
            </>
          )}

          {s.availability && (
            <>
              <div className="h-px" style={{ background: divider }} />
              <div className="grid grid-cols-2 gap-4">
                <Row label="Disponibilidad" value={s.availability} />
                <Row label="Horas semanales" value={s.weeklyHours} />
              </div>
            </>
          )}

          {s.skills && (
            <>
              <div className="h-px" style={{ background: divider }} />
              <Row label="Habilidades" value={s.skills} />
            </>
          )}

          {s.motivation && (
            <>
              <div className="h-px" style={{ background: divider }} />
              <Row label="Motivación" value={s.motivation} />
            </>
          )}

          {(s.emergencyName || s.emergencyPhone) && (
            <>
              <div className="h-px" style={{ background: divider }} />
              <div className="grid grid-cols-2 gap-4">
                <Row label="Contacto de emergencia" value={s.emergencyName} />
                <Row label="Relación" value={s.emergencyRelation} />
                <Row label="Teléfono emergencia" value={s.emergencyPhone} />
              </div>
            </>
          )}

          {s.referral && (
            <>
              <div className="h-px" style={{ background: divider }} />
              <Row label="¿Cómo nos conoció?" value={s.referral} />
            </>
          )}
        </div>

        {/* Footer con acciones */}
        {canManage && s.status === "pendiente" && (
          <div className="flex gap-3 p-6 border-t" style={{ borderColor: divider }}>
            <button
              onClick={() => { onRechazar(s.id); onClose(); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors"
              style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.25)" }}
            >
              Rechazar
            </button>
            <button
              onClick={() => { onAprobar(s.id); onClose(); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-black text-white"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 4px 16px rgba(34,197,94,0.3)" }}
            >
              Aprobar
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function AdminVoluntariosPage() {
  const { hasPermission, user } = useAuth();
  const { theme } = useSettings();
  const isDark = theme === "dark";
  const canManage = hasPermission("canManageUsers");

  const [tab, setTab] = useState<"voluntarios" | "solicitudes" | "externos">("solicitudes");
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [externos, setExternos] = useState<Solicitud[]>([]);
  const [_loadingVols, setLoadingVols] = useState(true);
  const [loadingSols, setLoadingSols] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("todos");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [editModal, setEditModal] = useState<Voluntario | null>(null);
  const [incluirModal, setIncluirModal] = useState<Solicitud | null>(null);
  const [detalleModal, setDetalleModal] = useState<Solicitud | null>(null);

  useEffect(() => {
    const VALID_ROLES: UserRole[] = ["administradores", "colaborador", "escritor", "voluntario"];
    getAllUsers()
      .then((res) => {
        const mapped = res.users.map((u) => {
          // Buscar el rol en todos los grupos del usuario, no solo en u.group
          const role = (VALID_ROLES.find((r) => u.groups?.includes(r)) ?? u.group ?? "voluntario") as UserRole;
          return {
            id: u.username,
            name: u.name,
            email: u.email,
            role,
            status: (u.attributes?.["custom:status"] as Voluntario["status"]) ?? (u.enabled ? "activo" : "suspendido"),
            municipio: u.attributes?.municipio ?? "",
            telefono: u.attributes?.telefono ?? "",
            joinedAt: u.attributes?.joinedAt ?? "",
          } as Voluntario;
        });
        setVoluntarios(mapped);
      })
      .catch(console.error)
      .finally(() => setLoadingVols(false));
  }, []);

  useEffect(() => {
    getSolicitudes()
      .then((res) => {
        const todas = res.solicitudes;
        setSolicitudes(todas.filter((s) => s.tipo === "registro" && s.status !== "aprobada"));
        setExternos(todas.filter((s) => s.tipo === "registro" && s.status === "aprobada"));
      })
      .catch(console.error)
      .finally(() => setLoadingSols(false));
  }, []);

  // Filtrar externos: excluir los que ya están registrados como voluntarios
  const externosFiltrados = externos.filter(
    (s) => !voluntarios.some((v) => v.email.toLowerCase() === s.email.toLowerCase())
  );

  const filteredVols = voluntarios.filter((v) => {
    const matchS  = v.name.toLowerCase().includes(search.toLowerCase()) || v.email.toLowerCase().includes(search.toLowerCase());
    const matchR  = filterRole   === "todos" || v.role   === filterRole;
    const matchSt = filterStatus === "todos" || v.status === filterStatus;
    return matchS && matchR && matchSt;
  });

  const pendientesCount = solicitudes.filter((s) => s.status === "pendiente").length;

  const handleSolicitud = async (id: string, accion: "aprobar" | "rechazar") => {
    try {
      const updated = await resolverSolicitud(id, accion);
      if (accion === "aprobar") {
        // Mover de solicitudes a externos
        setSolicitudes((prev) => prev.filter((s) => s.id !== id));
        setExternos((prev) => [...prev, updated]);
      } else {
        setSolicitudes((prev) => prev.map((s) => s.id === id ? updated : s));
      }
    } catch (err) {
      console.error(err);
    }
  };

  async function handleInviteUser(solicitud: Solicitud): Promise<void> {
    await inviteUserToSystem(solicitud.email, solicitud.nombre);
    // Marcar localmente como incluida (no hay campo en DynamoDB para esto aún)
    setExternos((prev) => prev.map((s) =>
      s.id === solicitud.id ? { ...s, sistemaIncluido: true } as Solicitud & { sistemaIncluido: boolean } : s
    ));
  }

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
        <TabButton active={tab === "externos"} onClick={() => setTab("externos")} isDark={isDark}>
          Fuera del Sistema
          {externosFiltrados.filter((s) => !(s as Solicitud & { sistemaIncluido?: boolean }).sistemaIncluido).length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-black" style={{ background: "rgba(99,102,241,0.2)", color: "#6366f1" }}>
              {externosFiltrados.filter((s) => !(s as Solicitud & { sistemaIncluido?: boolean }).sistemaIncluido).length}
            </span>
          )}
        </TabButton>
      </div>

      {/* ── Tab: Solicitudes ── */}
      <AnimatePresence mode="wait">
        {tab === "solicitudes" && (
          <motion.div key="solicitudes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="space-y-3">
              {loadingSols ? (
                <div className="text-center py-16">
                  <p className="text-sm font-medium" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}>Cargando solicitudes...</p>
                </div>
              ) : solicitudes.length === 0 ? (
                <div className="text-center py-16">
                  <p className="font-black text-lg" style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#cbd5e1" }}>
                    Sin solicitudes
                  </p>
                </div>
              ) : solicitudes.map((s) => {
                const statusCfg = SOL_STATUS_CONFIG[s.status];
                const roleColor = ROLE_COLORS[s.rolSolicitado as UserRole] ?? "#94a3b8";
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
                            <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: statusCfg.bg, color: statusCfg.color }}>
                              {statusCfg.label}
                            </span>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-lg" style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}>
                              Formulario público
                            </span>
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#64748b" }}>
                            {s.email} · {new Date(s.fecha).toLocaleDateString("es-DO")}
                          </p>
                          {s.mensaje && (
                          <p className="text-xs mt-2 max-w-lg" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#475569" }}>
                            {s.mensaje}
                          </p>
                          )}
                        </div>
                      </div>

                      {canManage && s.status === "pendiente" && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <AdminButton
                            size="sm"
                            variant="ghost"
                            onClick={() => setDetalleModal(s)}
                          >
                            Ver detalle
                          </AdminButton>
                          <AdminButton
                            size="sm"
                            variant="danger"
                            onClick={() => handleSolicitud(s.id, "rechazar")}
                          >
                            Rechazar
                          </AdminButton>
                          <AdminButton
                            size="sm"
                            variant="success"
                            onClick={() => handleSolicitud(s.id, "aprobar")}
                          >
                            Aprobar
                          </AdminButton>
                        </div>
                      )}
                      {s.status !== "pendiente" && (
                        <AdminButton
                          size="sm"
                          variant="ghost"
                          onClick={() => setDetalleModal(s)}
                        >
                          Ver detalle
                        </AdminButton>
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
              
              <FilterSelect
                value={filterRole}
                onChange={setFilterRole}
                placeholder="Todos los roles"
                icon="solar:shield-user-bold-duotone"
                options={ROLE_OPTIONS.map((r) => ({
                  value: r.value,
                  label: r.label,
                  color: ROLE_COLORS[r.value as keyof typeof ROLE_COLORS],
                }))}
              />
              
              <FilterSelect
                value={filterStatus}
                onChange={setFilterStatus}
                placeholder="Todos los estados"
                icon="solar:check-circle-bold-duotone"
                options={STATUS_OPTIONS.map((s) => {
                  const cfg = STATUS_CONFIG[s.value as keyof typeof STATUS_CONFIG];
                  return {
                    value: s.value,
                    label: s.label,
                    color: cfg.color,
                  };
                })}
              />
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
                                <AdminButton
                                  size="sm"
                                  variant="ghost"
                                  icon="solar:pen-2-bold-duotone"
                                  onClick={() => setEditModal(v)}
                                  className="!text-amber-500 !border-amber-500/25 opacity-0 group-hover:opacity-100"
                                >
                                  Editar
                                </AdminButton>
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

        {/* ── Tab: Fuera del Sistema ── */}
        {tab === "externos" && (
          <motion.div key="externos" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {loadingSols ? (
              <div className="text-center py-16">
                <p className="text-sm font-medium" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}>Cargando...</p>
              </div>
            ) : externosFiltrados.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-black text-lg" style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#cbd5e1" }}>
                  Sin solicitudes externas
                </p>
                <p className="text-sm mt-1" style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#cbd5e1" }}>
                  Los formularios de voluntario del sitio público aparecerán aquí
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {externosFiltrados.map((s) => {
                  const yaIncluido = (s as Solicitud & { sistemaIncluido?: boolean }).sistemaIncluido;
                  return (
                    <div key={s.id} className="rounded-2xl p-5 border" style={cardStyle}>
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm shrink-0"
                            style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)" }}>
                            {s.nombre.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-sm" style={{ color: isDark ? "#fff" : "#0f172a" }}>{s.nombre}</p>
                              {yaIncluido ? (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>
                                  Incluido en sistema
                                </span>
                              ) : (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
                                  Pendiente de inclusión
                                </span>
                              )}
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#64748b" }}>
                              {s.email} · Aprobado el {new Date(s.fecha).toLocaleDateString("es-DO")}
                            </p>
                            {s.mensaje && (
                              <p className="text-xs mt-1.5 max-w-lg" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#475569" }}>
                                {s.mensaje}
                              </p>
                            )}
                          </div>
                        </div>

                        {canManage && !yaIncluido && (
                          <AdminButton
                            size="sm"
                            variant="indigo"
                            icon="solar:user-plus-bold-duotone"
                            onClick={() => setIncluirModal(s)}
                          >
                            Incluir en sistema
                          </AdminButton>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editModal && (
          <VoluntarioModal            v={editModal}
            onClose={() => setEditModal(null)}
            onSave={async (updated) => {
              try {
                await updateUserRole(updated.id, updated.role, updated.status);
                setVoluntarios((prev) => prev.map((v) => v.id === updated.id ? updated : v));
              } catch (err) {
                console.error(err);
              }
              setEditModal(null);
            }}
            isDark={isDark}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {incluirModal && (
          <IncluirModal
            solicitud={incluirModal}
            onClose={() => setIncluirModal(null)}
            onConfirm={handleInviteUser}
            isDark={isDark}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detalleModal && (
          <DetalleSolicitudModal
            s={detalleModal}
            onClose={() => setDetalleModal(null)}
            onAprobar={(id) => handleSolicitud(id, "aprobar")}
            onRechazar={(id) => handleSolicitud(id, "rechazar")}
            canManage={canManage}
            isDark={isDark}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
