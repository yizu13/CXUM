import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSettings } from "../../hooks/context/SettingsContext";
import Iconify from "../../components/modularUI/IconsMock";
import { ROLE_COLORS, ROLE_LABELS } from "../components/auth";
import { useAuth } from "../components/AuthContextComps";
import { generateInviteToken } from "../APIs/inviteTokens";
import type { InviteTokenResponse } from "../APIs/inviteTokens";
import { useActivity } from "../../hooks/useActivity";
import { getCentros } from "../APIs/centros";
import { getNoticiasAdmin } from "../APIs/noticias";
import { getSolicitudes } from "../APIs/solicitudes";
import { getAllUsers } from "../APIs/modifyRole";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

const QUICK_LINKS = [  {
    label: "Centros de Acopio",
    desc: "Ver y gestionar centros",
    path: "/plataforma/admin/centros",
    icon: "solar:map-point-bold-duotone",
    color: "#f59e0b",
    permission: "canViewCenters" as const,
  },
  {
    label: "Noticias",
    desc: "Gestionar contenido y publicaciones",
    path: "/plataforma/admin/noticias",
    icon: "solar:document-text-bold-duotone",
    color: "#3b82f6",
    permission: null,
  },
  {
    label: "Voluntarios",
    desc: "Usuarios, roles y solicitudes",
    path: "/plataforma/admin/voluntarios",
    icon: "solar:users-group-two-rounded-bold-duotone",
    color: "#22c55e",
    permission: "canManageUsers" as const,
  },
  {
    label: "Galería de Medios",
    desc: "Imágenes y archivos subidos",
    path: "/plataforma/admin/media",
    icon: "solar:gallery-bold-duotone",
    color: "#8b5cf6",
    permission: null,
  },
];

export default function AdminDashboardPage() {
  const { user, hasPermission, loading } = useAuth();
  const { theme } = useSettings();
  const isDark = theme === "dark";

  const roleColor = user ? ROLE_COLORS[user.role] : "#f59e0b";
  const roleLabel = user ? ROLE_LABELS[user.role] : "";

  const { events: activityEvents, loading: activityLoading } = useActivity();

  const [kpis, setKpis] = useState({ centros: "—", voluntarios: "—", noticias: "—", solicitudes: "—" });
  const [inviteData, setInviteData]   = useState<InviteTokenResponse | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [copied, setCopied]           = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.allSettled([
      getCentros(),
      getNoticiasAdmin(),
      getSolicitudes(),
      getAllUsers(),
    ]).then(([centrosRes, noticiasRes, solicitudesRes, usersRes]) => {
      setKpis({
        centros:     centrosRes.status     === "fulfilled" ? String(centrosRes.value.centros.filter((c) => c.estado === "activo").length) : "—",
        noticias:    noticiasRes.status    === "fulfilled" ? String(noticiasRes.value.noticias.filter((n) => n.estado === "publicado").length) : "—",
        solicitudes: solicitudesRes.status === "fulfilled" ? String(solicitudesRes.value.solicitudes.filter((s) => s.status === "pendiente").length) : "—",
        voluntarios: usersRes.status       === "fulfilled" ? String(usersRes.value.count) : "—",
      });
    });
  }, [user]);

  async function handleGenerateToken() {
    setInviteLoading(true);
    setInviteError("");
    try {
      const data = await generateInviteToken();
      setInviteData(data);
      setCopied(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      setInviteError(`No se pudo generar el token: ${msg}`);
    } finally {
      setInviteLoading(false);
    }
  }

  function handleCopy() {
    if (!inviteData) return;
    navigator.clipboard.writeText(inviteData.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const now    = new Date();
  const hour   = now.getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  // Shared style helpers
  const cardStyle = {
    background:   isDark ? "rgba(255,255,255,0.025)" : "#ffffff",
    borderColor:  isDark ? "rgba(255,255,255,0.07)"  : "rgba(0,0,0,0.07)",
    boxShadow:    isDark ? "none" : "0 1px 6px rgba(0,0,0,0.06)",
  };

  const textPrimary   = isDark ? "#ffffff" : "#0f172a";
  const textSecondary = isDark ? "rgba(255,255,255,0.4)" : "#64748b";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black"
            style={{ background: `${roleColor}25`, border: `1px solid ${roleColor}40`, color: roleColor }}
          >
            {user?.name?.charAt(0) ?? "U"}
          </div>
          <div>
            <p className="text-sm flex gap-1 items-center mb-1" style={{ color: textSecondary }}>
              {greeting},{" "}
              <span className="font-bold" style={{ color: textPrimary }}>
                {user?.name?.split(" ")[0] ?? "Usuario"}
              </span>{" "}
              <span className=" flex">
                <Iconify IconString="ph:hand-waving-duotone" Size={18} />
              </span>
              
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-lg"
                style={{ background: `${roleColor}15`, color: roleColor }}
              >
                {roleLabel}
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-lg"
                style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}
              >
                Sesión activa
              </span>
            </div>
          </div>
        </div>
        <h1 className="font-black text-2xl tracking-tight mt-4" style={{ color: textPrimary }}>
          Panel de Administración
        </h1>
        <p className="text-sm mt-1" style={{ color: textSecondary }}>
          Aquí tienes un resumen de la actividad de CXUM
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Centros Activos",      value: kpis.centros,     sub: "ver centros",   icon: "solar:map-point-bold-duotone",                  color: "#f59e0b" },
          { label: "Voluntarios",          value: kpis.voluntarios, sub: "ver usuarios",  icon: "solar:users-group-two-rounded-bold-duotone",    color: "#22c55e" },
          { label: "Noticias Publicadas",  value: kpis.noticias,    sub: "ver noticias",  icon: "solar:document-text-bold-duotone",              color: "#3b82f6" },
          { label: "Solicitudes Nuevas",   value: kpis.solicitudes, sub: "pendientes",    icon: "solar:bell-bing-bold-duotone",                  color: "#ef4444" },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className="rounded-2xl p-5 border"
            style={cardStyle}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${kpi.color}18`, border: `1px solid ${kpi.color}30` }}
              >
                <Iconify Size={18} IconString={kpi.icon} Style={{ color: kpi.color }} />
              </div>
              <span className="text-xs font-medium" style={{ color: textSecondary }}>{kpi.sub}</span>
            </div>
            <p className="font-black text-3xl" style={{ color: textPrimary }}>{kpi.value}</p>
            <p className="text-xs font-medium mt-1" style={{ color: textSecondary }}>{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick links */}
        <div className="lg:col-span-2">
          <h2 className="font-black text-base mb-4" style={{ color: textPrimary }}>
            Acceso rápido
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {QUICK_LINKS.filter((l) => !l.permission || hasPermission(l.permission)).map((link, i) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
              >
                <Link
                  to={link.path}
                  className="flex items-center gap-4 p-4 rounded-2xl border group transition-all duration-200"
                  style={cardStyle}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(245,158,11,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = cardStyle.borderColor;
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${link.color}18`, border: `1px solid ${link.color}30` }}
                  >
                    <Iconify Size={20} IconString={link.icon} Style={{ color: link.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm" style={{ color: textPrimary }}>{link.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: textSecondary }}>{link.desc}</p>
                  </div>
                  <Iconify
                    Size={16}
                    IconString="solar:alt-arrow-right-linear"
                    Style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#cbd5e1" }}
                  />
                </Link>
              </motion.div>
            ))}

            {/* Sitio público */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl border group transition-all duration-200"
                style={{
                  background:  isDark ? "rgba(255,255,255,0.015)" : "#f8fafc",
                  borderColor: isDark ? "rgba(255,255,255,0.06)"  : "rgba(0,0,0,0.06)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(148,163,184,0.1)", border: "1px solid rgba(148,163,184,0.2)" }}
                >
                  <Iconify Size={20} IconString="solar:global-bold-duotone" Style={{ color: "#94a3b8" }} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#475569" }}>
                    Sitio Público
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: textSecondary }}>
                    Ver CXUM desde el exterior
                  </p>
                </div>
                <Iconify
                  Size={14}
                  IconString="solar:arrow-right-up-linear"
                  Style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#cbd5e1" }}
                />
              </a>
            </motion.div>
          </div>
        </div>

        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border flex flex-col"
          style={{ ...cardStyle, maxHeight: "500px" }}
        >
          <div className="p-5 pb-3 shrink-0">
            <h2 className="font-black text-base" style={{ color: textPrimary }}>
              Actividad Reciente
            </h2>
          </div>
          
          {activityLoading ? (
            <div className="px-5 pb-5">
              <p className="text-xs" style={{ color: textSecondary }}>Cargando...</p>
            </div>
          ) : activityEvents.length === 0 ? (
            <div className="px-5 pb-5">
              <p className="text-xs" style={{ color: textSecondary }}>Sin actividad reciente.</p>
            </div>
          ) : (
            <SimpleBar style={{ maxHeight: "420px", paddingLeft: "20px", paddingRight: "20px", paddingBottom: "20px" }}>
              <div className="space-y-4">
                {activityEvents.map((a) => (
                  <div key={a.id} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${a.color}15`, border: `1px solid ${a.color}25` }}>
                      <Iconify Size={14} IconString={a.icon} Style={{ color: a.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-snug" style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#475569" }}>
                        {a.text}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: textSecondary }}>
                        {new Date(a.createdAt).toLocaleString("es-DO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        {a.actor && ` · ${a.actor}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </SimpleBar>
          )}
        </motion.div>
      </div>

      {/* Role info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 rounded-2xl p-5 border"
        style={{ background: `${roleColor}08`, borderColor: `${roleColor}20` }}
      >
        <div className="flex items-center gap-3">
          <Iconify Size={20} IconString="solar:shield-user-bold-duotone" Style={{ color: roleColor }} />
          <div>
            <p className="font-bold text-sm" style={{ color: textPrimary }}>
              Tu nivel de acceso:{" "}
              <span style={{ color: roleColor }}>{roleLabel}</span>
            </p>
            <p className="text-xs mt-0.5" style={{ color: textSecondary }}>
              {user?.role === "administradores" && "Tienes acceso completo al sistema incluyendo gestión de usuarios."}
              {user?.role === "colaborador"     && "Puedes gestionar noticias y centros de acopio."}
              {user?.role === "escritor"        && "Puedes crear y editar noticias y ver centros de acopio."}
              {user?.role === "voluntario"      && "Puedes ver estadísticas y consultar centros de acopio."}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Invite token — visible para administradores (espera a que user cargue) */}
      {!loading && hasPermission("canManageUsers") && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-4 rounded-2xl p-5 border"
          style={cardStyle}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Iconify Size={18} IconString="solar:key-bold-duotone" Style={{ color: "#f59e0b" }} />
              <p className="font-black text-sm" style={{ color: textPrimary }}>Token de invitación</p>
            </div>
            <button
              onClick={handleGenerateToken}
              disabled={inviteLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-opacity disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #f59e0b, #fb923c)" }}
            >
              <Iconify Size={13} IconString="solar:refresh-bold" Style={{ color: "#fff" }} />
              {inviteLoading ? "Generando..." : "Generar nuevo"}
            </button>
          </div>

          {inviteError && (
            <p className="text-xs font-medium" style={{ color: "#ef4444" }}>{inviteError}</p>
          )}

          {!inviteError && inviteData ? (
            <div
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
              style={{ background: isDark ? "rgba(245,158,11,0.08)" : "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}
            >
              <div>
                <p className="font-mono font-black text-base tracking-widest" style={{ color: "#f59e0b" }}>
                  {inviteData.token}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: textSecondary }}>
                  Expira: {new Date(inviteData.expiresAt).toLocaleTimeString()} · {inviteData.expiresInMinutes} min
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: copied ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)" }}
              >
                <Iconify
                  Size={15}
                  IconString={copied ? "solar:check-circle-bold" : "solar:copy-bold"}
                  Style={{ color: copied ? "#22c55e" : "#f59e0b" }}
                />
              </button>
            </div>
          ) : !inviteError && (
            <p className="text-xs" style={{ color: textSecondary }}>
              Genera un token para que un nuevo usuario pueda registrarse. Caduca en 20 minutos.
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
