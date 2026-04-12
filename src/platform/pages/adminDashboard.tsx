import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSettings } from "../../hooks/context/SettingsContext";
import Iconify from "../../components/modularUI/IconsMock";
import { ROLE_COLORS, ROLE_LABELS } from "../components/auth";
import { useAuth } from "../components/AuthContextComps";

const QUICK_LINKS = [
  {
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
];

const RECENT_ACTIVITY = [
  { icon: "solar:map-point-bold-duotone",            color: "#f59e0b", text: "Centro Norte CXUM actualizado",          time: "hace 2h" },
  { icon: "solar:document-bold-duotone",             color: "#3b82f6", text: "Nueva noticia publicada: 'Jornada SDN'", time: "hace 5h" },
  { icon: "solar:user-check-rounded-bold-duotone",   color: "#22c55e", text: "Solicitud de Ana Reyes aprobada",        time: "hace 1d" },
  { icon: "solar:bell-bing-bold-duotone",            color: "#ef4444", text: "Nueva solicitud de cambio de rol",       time: "hace 1d" },
  { icon: "solar:map-point-bold-duotone",            color: "#8b5cf6", text: "Centro Médico Oeste: nuevo responsable", time: "hace 2d" },
];

export default function AdminDashboardPage() {
  const { user, hasPermission } = useAuth();
  const { theme } = useSettings();
  const isDark = theme === "dark";

  const roleColor = user ? ROLE_COLORS[user.role] : "#f59e0b";
  const roleLabel = user ? ROLE_LABELS[user.role] : "";

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
            <p className="text-sm" style={{ color: textSecondary }}>
              {greeting},{" "}
              <span className="font-bold" style={{ color: textPrimary }}>
                {user?.name?.split(" ")[0] ?? "Usuario"}
              </span>{" "}
              👋
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
          { label: "Centros Activos",      value: "3", sub: "+1 este mes",  icon: "solar:map-point-bold-duotone",                  color: "#f59e0b" },
          { label: "Voluntarios",          value: "6", sub: "1 pendiente",  icon: "solar:users-group-two-rounded-bold-duotone",    color: "#22c55e" },
          { label: "Noticias Publicadas",  value: "2", sub: "1 borrador",   icon: "solar:document-text-bold-duotone",              color: "#3b82f6" },
          { label: "Solicitudes Nuevas",   value: "2", sub: "pendientes",   icon: "solar:bell-bing-bold-duotone",                  color: "#ef4444" },
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
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
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
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
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
          className="rounded-2xl p-5 border"
          style={cardStyle}
        >
          <h2 className="font-black text-base mb-4" style={{ color: textPrimary }}>
            Actividad Reciente
          </h2>
          <div className="space-y-4">
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${a.color}15`, border: `1px solid ${a.color}25` }}
                >
                  <Iconify Size={14} IconString={a.icon} Style={{ color: a.color }} />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs font-medium leading-snug"
                    style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#475569" }}
                  >
                    {a.text}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: textSecondary }}>
                    {a.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
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
    </div>
  );
}
