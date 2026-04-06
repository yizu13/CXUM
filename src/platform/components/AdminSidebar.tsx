import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "../../hooks/context/SettingsContext";
import { signOut } from "./cognito";
import { ROLE_LABELS, ROLE_COLORS } from "./auth";
import Iconify from "../../components/modularUI/IconsMock";
import { useAuth } from "./AuthContextComps";
import LogoCXUM from "../../assets/LogoCXUM.png";

// ── Nav items ─────────────────────────────────────────────────────────────────
interface NavItem {
  label: string;
  path: string;
  icon: string;
  iconActive: string;
  requiredGroup?: string[];
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Panel Principal",
    path: "/plataforma/admin",
    icon: "solar:widget-2-linear",
    iconActive: "solar:widget-2-bold-duotone",
  },
  {
    label: "Centros de Acopio",
    path: "/plataforma/admin/centros",
    icon: "solar:map-point-linear",
    iconActive: "solar:map-point-bold-duotone",
  },
  {
    label: "Noticias",
    path: "/plataforma/admin/noticias",
    icon: "solar:document-text-linear",
    iconActive: "solar:document-text-bold-duotone",
  },
  {
    label: "Voluntarios",
    path: "/plataforma/admin/voluntarios",
    icon: "solar:users-group-two-rounded-linear",
    iconActive: "solar:users-group-two-rounded-bold-duotone",
    requiredGroup: ["administradores"],
    badge: "Admin",
  },
];

// ── Logo ──────────────────────────────────────────────────────────────────────
function SidebarLogo({ collapsed, isDark }: { collapsed: boolean; isDark: boolean }) {
  return (
    <div className="flex items-center gap-3 px-1 py-1">
      <img src={LogoCXUM} alt="CXUM Logo" className="w-8 h-8" />
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden cursor-default"
          >
            <p
              className="font-black text-sm tracking-tight leading-none whitespace-nowrap"
              style={{ color: isDark ? "#fff" : "#0f172a" }}
            >
              CXUM
            </p>
            <p
              className="text-[10px] font-medium whitespace-nowrap"
              style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}
            >
              Panel de Administración
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Nav Item ──────────────────────────────────────────────────────────────────
function SidebarNavItem({
  item,
  collapsed,
  user,
  isDark,
}: {
  item: NavItem;
  collapsed: boolean;
  user: import("./auth").AuthUser | null;
  isDark: boolean;
}) {
  const hasAccess = !item.requiredGroup || item.requiredGroup.some((g) => user?.groups?.includes(g));
  if (!hasAccess) return null;

  return (
    <NavLink
      to={item.path}
      end={item.path === "/plataforma/admin"}
      className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 cursor-pointer"
      style={({ isActive }) => ({
        background: isActive
          ? isDark ? "rgba(245,158,11,0.14)" : "rgba(245,158,11,0.1)"
          : "transparent",
        color: isActive
          ? "#f59e0b"
          : isDark ? "rgba(255,255,255,0.4)" : "#64748b",
      })}
    >
      {({ isActive }) => (
        <>
          <div className="shrink-0 w-5 h-5 flex items-center justify-center">
            <Iconify
              Size={20}
              IconString={isActive ? item.iconActive : item.icon}
              Style={{ color: isActive ? "#f59e0b" : "currentColor" }}
            />
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap text-sm font-semibold flex-1"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>

          {!collapsed && item.badge && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[9px] font-black px-1.5 py-0.5 rounded-md whitespace-nowrap"
              style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444" }}
            >
              {item.badge}
            </motion.span>
          )}

          {/* Tooltip colapsado */}
          {collapsed && (
            <div
              className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl"
              style={{
                background: isDark ? "#1a1d24" : "#1e293b",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
              }}
            >
              {item.label}
              <div
                className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 rotate-45"
                style={{ background: isDark ? "#1a1d24" : "#1e293b", borderLeft: "1px solid rgba(255,255,255,0.1)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
          )}

          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
              style={{ background: "#f59e0b" }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

// ── Main Sidebar ──────────────────────────────────────────────────────────────
export default function AdminSidebar() {
  const { user, setUser } = useAuth();
  const { theme } = useSettings();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    signOut();
    setUser(null);
    navigate("/plataforma/login");
  };

  const roleColor = user ? ROLE_COLORS[user.role] : "#6366f1";
  const roleLabel = user ? ROLE_LABELS[user.role] : "";

  // Theme-aware colors
  const bg          = isDark ? "#0a0c11" : "#ffffff";
  const border      = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const divider     = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const toggleColor = isDark ? "rgba(255,255,255,0.3)" : "#94a3b8";
  const toggleHoverBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative shrink-0 h-screen flex flex-col border-r overflow-hidden"
      style={{ background: bg, borderColor: border }}
    >
      <div className="flex items-center justify-between px-4 pt-5 pb-4">
        <SidebarLogo collapsed={collapsed} isDark={isDark} />
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: toggleColor }}
          onMouseEnter={(e) => (e.currentTarget.style.background = toggleHoverBg)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          title={collapsed ? "Expandir" : "Colapsar"}
        >
          <Iconify
            Size={16}
            IconString={
              collapsed
                ? "solar:alt-arrow-right-linear"
                : "solar:alt-arrow-left-linear"
            }
            Style={{ color: "currentColor" }}
          />
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px mb-4" style={{ background: divider }} />

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem
            key={item.path}
            item={item}
            collapsed={collapsed}
            user={user}
            isDark={isDark}
          />
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 h-px mt-4" style={{ background: divider }} />

      {/* User Card */}
      <div className="px-3 py-4">
        <div
          className={`flex items-center gap-3 p-3 rounded-xl ${collapsed ? "justify-center" : ""}`}
          style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
        >
          <div
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs"
            style={{
              background: `${roleColor}30`,
              border: `1px solid ${roleColor}50`,
              color: roleColor,
            }}
          >
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden flex-1 min-w-0"
              >
                <p
                  className="text-xs font-bold truncate"
                  style={{ color: isDark ? "#fff" : "#0f172a" }}
                >
                  {user?.name ?? "Usuario"}
                </p>
                <p className="text-[10px] font-semibold truncate" style={{ color: roleColor }}>
                  {roleLabel}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="px-3 pb-5">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${collapsed ? "justify-center" : ""} cursor-pointer`}
          style={{ color: "rgba(239,68,68,0.6)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ef4444";
            e.currentTarget.style.background = "rgba(239,68,68,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(239,68,68,0.6)";
            e.currentTarget.style.background = "transparent";
          }}
          title="Cerrar sesión"
        >
          <div className="shrink-0 w-5 h-5 flex items-center justify-center">
            <Iconify
              Size={18}
              IconString="solar:logout-2-bold-duotone"
              Style={{ color: "currentColor" }}
            />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-semibold whitespace-nowrap overflow-hidden"
              >
                Cerrar sesión
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
