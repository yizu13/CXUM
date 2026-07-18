import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import SimpleBar from "simplebar-react";

import { useSettings } from "../../hooks/context/SettingsContext";
import { useAuth } from "./AuthContextComps";
import { signOut } from "./cognito";
import {
  ROLE_COLORS,
  ROLE_ICONS,
  ROLE_LABELS,
  type AuthUser,
} from "./auth";

import Iconify from "../../components/modularUI/IconsMock";
import LogoCXUM from "../../assets/LogoCXUM.png";

import "simplebar-react/dist/simplebar.min.css";

const SIDEBAR_EXPANDED_WIDTH = 256;
const SIDEBAR_COLLAPSED_WIDTH = 76;
const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";

// ── Types ─────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  path: string;
  icon: string;
  iconActive: string;
  requiredGroup?: string[];
  badge?: string;
}

interface SidebarLogoProps {
  collapsed: boolean;
  isDark: boolean;
}

interface SidebarNavItemProps {
  item: NavItem;
  collapsed: boolean;
  user: AuthUser | null;
  isDark: boolean;
  onClose?: () => void;
}

// ── Navigation ────────────────────────────────────────────────────────────────

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
    label: "Galería de Medios",
    path: "/plataforma/admin/media",
    icon: "solar:gallery-linear",
    iconActive: "solar:gallery-bold-duotone",
  },
  {
    label: "Certificados",
    path: "/plataforma/admin/certificados",
    icon: "solar:diploma-linear",
    iconActive: "solar:diploma-bold-duotone",
  },
  {
    label: "Formularios",
    path: "/plataforma/admin/donaciones",
    icon: "solar:file-text-broken",
    iconActive: "solar:file-text-bold-duotone",
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

function SidebarLogo({
  collapsed,
  isDark,
}: SidebarLogoProps) {
  return (
    <div
      className={[
        "flex min-w-0 items-center",
        collapsed
          ? "w-full justify-center"
          : "w-full gap-3",
      ].join(" ")}
    >
      <img
        src={LogoCXUM}
        alt="CXUM Logo"
        className="h-8 w-8 shrink-0 object-contain"
      />

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="sidebar-logo-content"
            initial={{
              opacity: 0,
              x: -8,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: -8,
            }}
            transition={{
              duration: 0.18,
              ease: "easeOut",
            }}
            className="min-w-0 overflow-hidden"
          >
            <p
              className="
                whitespace-nowrap text-sm
                font-black leading-none tracking-tight
              "
              style={{
                color: isDark ? "#ffffff" : "#0f172a",
              }}
            >
              CXUM
            </p>

            <p
              className="
                mt-1 whitespace-nowrap
                text-[10px] font-medium
              "
              style={{
                color: isDark
                  ? "rgba(255,255,255,0.35)"
                  : "#94a3b8",
              }}
            >
              Panel de Administración
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Navigation item ───────────────────────────────────────────────────────────

function SidebarNavItem({
  item,
  collapsed,
  user,
  isDark,
  onClose,
}: SidebarNavItemProps) {
  const hasAccess =
    !item.requiredGroup ||
    item.requiredGroup.some((group) =>
      user?.groups?.includes(group),
    );

  if (!hasAccess) {
    return null;
  }

  return (
    <NavLink
      to={item.path}
      end={item.path === "/plataforma/admin"}
      onClick={onClose}
      aria-label={item.label}
      title={collapsed ? item.label : undefined}
      className={[
        "group relative flex min-h-11 w-full items-center",
        "overflow-hidden rounded-xl",
        "transition-colors duration-200",
        "focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-amber-500/40",
        collapsed
          ? "justify-center px-2"
          : "gap-3 px-3",
        isDark
          ? "hover:bg-white/5"
          : "hover:bg-slate-950/5",
      ].join(" ")}
      style={({ isActive }) => ({
        background: isActive
          ? isDark
            ? "rgba(245,158,11,0.14)"
            : "rgba(245,158,11,0.10)"
          : undefined,
        color: isActive
          ? "#f59e0b"
          : isDark
            ? "rgba(255,255,255,0.48)"
            : "#64748b",
      })}
    >
      {({ isActive }) => (
        <>
          <div
            className="
              relative flex h-5 w-5 shrink-0
              items-center justify-center
            "
          >
            <Iconify
              Size={20}
              IconString={
                isActive
                  ? item.iconActive
                  : item.icon
              }
              Style={{
                color: isActive
                  ? "#f59e0b"
                  : "currentColor",
              }}
            />

            {collapsed && item.badge && (
              <span
                className="
                  absolute -right-1 -top-1
                  h-1.5 w-1.5 rounded-full
                "
                style={{
                  background: "#ef4444",
                  boxShadow:
                    "0 0 0 2px rgba(12,14,18,0.85)",
                }}
              />
            )}
          </div>

          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                key={`label-${item.path}`}
                initial={{
                  opacity: 0,
                  x: -6,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -6,
                }}
                transition={{
                  duration: 0.16,
                  ease: "easeOut",
                }}
                className="
                  min-w-0 flex-1 overflow-hidden
                  whitespace-nowrap text-sm font-semibold
                "
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {!collapsed && item.badge && (
              <motion.span
                key={`badge-${item.path}`}
                initial={{
                  opacity: 0,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                }}
                transition={{
                  duration: 0.15,
                }}
                className="
                  shrink-0 whitespace-nowrap rounded-md
                  px-1.5 py-0.5 text-[9px] font-black
                "
                style={{
                  background: "rgba(239,68,68,0.14)",
                  color: "#ef4444",
                }}
              >
                {item.badge}
              </motion.span>
            )}
          </AnimatePresence>

          {isActive && (
            <motion.div
              layoutId="sidebar-active-indicator"
              className="
                absolute left-0 top-1/2
                h-5 w-0.5 -translate-y-1/2
                rounded-full
              "
              style={{
                background: "#f59e0b",
              }}
              transition={{
                type: "spring",
                stiffness: 450,
                damping: 35,
              }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

// ── Main sidebar ──────────────────────────────────────────────────────────────

export default function AdminSidebar({
  onClose,
}: {
  onClose?: () => void;
}) {
  const { user, setUser } = useAuth();
  const { theme } = useSettings();

  const navigate = useNavigate();

  const isDark = theme === "dark";

  const [collapsed, setCollapsed] = useState(false);


  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.matchMedia(
      DESKTOP_MEDIA_QUERY,
    ).matches;
  });

  /*
   * El sidebar solamente puede permanecer colapsado
   * en escritorio. Al cambiar a móvil, se expande.
   */
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(
      DESKTOP_MEDIA_QUERY,
    );

    const synchronizeViewport = (
      desktop: boolean,
    ) => {
      setIsDesktop(desktop);

      if (!desktop) {
        setCollapsed(false);
      }
    };

    synchronizeViewport(mediaQuery.matches);

    const handleViewportChange = (
      event: MediaQueryListEvent,
    ) => {
      synchronizeViewport(event.matches);
    };

    mediaQuery.addEventListener(
      "change",
      handleViewportChange,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleViewportChange,
      );
    };
  }, []);

  const effectiveCollapsed =
    isDesktop && collapsed;

  const roleColor = user
    ? ROLE_COLORS[user.role]
    : "#6366f1";

  const roleIcon = user
    ? ROLE_ICONS[user.role]
    : "solar:user-bold-duotone";

  const roleLabel = user
    ? ROLE_LABELS[user.role]
    : "";

  // ── Theme colors ────────────────────────────────────────────────────────────

  const background = isDark
    ? "#0a0c11"
    : "#ffffff";

  const borderColor = isDark
    ? "rgba(255,255,255,0.06)"
    : "rgba(15,23,42,0.08)";

  const dividerColor = isDark
    ? "rgba(255,255,255,0.06)"
    : "rgba(15,23,42,0.07)";

  const toggleColor = isDark
    ? "rgba(255,255,255,0.48)"
    : "#64748b";

  const toggleHoverBackground = isDark
    ? "rgba(255,255,255,0.07)"
    : "rgba(15,23,42,0.06)";

  const userCardBackground = isDark
    ? "rgba(255,255,255,0.035)"
    : "rgba(15,23,42,0.035)";

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleToggleSidebar = () => {
    if (!isDesktop) {
      return;
    }

    setCollapsed((current) => !current);
  };

  const handleNavigate = () => {
    if (!isDesktop) {
      onClose?.();
    }
  };

  const handleLogout = () => {
    signOut();
    setUser(null);
    navigate("/plataforma/login");
    onClose?.();
  };

  return (
    <motion.aside
      initial={false}
      animate={{
        width: effectiveCollapsed
          ? SIDEBAR_COLLAPSED_WIDTH
          : SIDEBAR_EXPANDED_WIDTH,
      }}
      transition={{
        duration: 0.24,
        ease: [0.4, 0, 0.2, 1],
      }}
      aria-label="Navegación administrativa"
      data-collapsed={effectiveCollapsed}
      className="
        relative flex h-screen h-dvh
        shrink-0 flex-col overflow-visible border-r
      "
      style={{
        background,
        borderColor,
        willChange: "width",
      }}
    >
      {/* Header */}
      <div
        className={[
          "relative flex h-[76px] shrink-0 items-center",
          effectiveCollapsed
            ? "justify-center px-2"
            : "px-4",
          onClose && !isDesktop
            ? "pr-12"
            : "",
        ].join(" ")}
      >
        <SidebarLogo
          collapsed={effectiveCollapsed}
          isDark={isDark}
        />

        {/* Botón de cerrar en móvil */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            title="Cerrar menú"
            className="
              absolute right-3 top-1/2
              flex h-8 w-8 -translate-y-1/2
              items-center justify-center rounded-lg
              transition-colors
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-amber-500/40
              lg:hidden
            "
            style={{
              color: toggleColor,
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background =
                toggleHoverBackground;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background =
                "transparent";
            }}
          >
            <Iconify
              Size={18}
              IconString="solar:close-circle-linear"
              Style={{
                color: "currentColor",
              }}
            />
          </button>
        )}
      </div>

      {/* Botón de colapsar/expandir */}
      <button
        type="button"
        onClick={handleToggleSidebar}
        aria-expanded={!effectiveCollapsed}
        aria-label={
          effectiveCollapsed
            ? "Expandir menú lateral"
            : "Colapsar menú lateral"
        }
        title={
          effectiveCollapsed
            ? "Expandir menú"
            : "Colapsar menú"
        }
        className="
          absolute -right-3 top-6 z-50
          hidden h-7 w-7
          items-center justify-center
          rounded-full border shadow-md
          transition-transform duration-200
          hover:scale-105
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-amber-500/40
          lg:flex
        "
        style={{
          color: toggleColor,
          background,
          borderColor,
        }}
      >
        <Iconify
          Size={16}
          IconString={
            effectiveCollapsed
              ? "solar:alt-arrow-right-linear"
              : "solar:alt-arrow-left-linear"
          }
          Style={{
            color: "currentColor",
          }}
        />
      </button>

      {/* Divider superior */}
      <div
        className={[
          "mb-4 h-px shrink-0",
          effectiveCollapsed
            ? "mx-3"
            : "mx-4",
        ].join(" ")}
        style={{
          background: dividerColor,
        }}
      />

      {/* Navigation */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <SimpleBar
          autoHide
          className="h-full"
          style={{
            height: "100%",
            maxHeight: "100%",
          }}
        >
          <nav
            aria-label="Secciones administrativas"
            className={[
              "flex flex-col gap-1 py-1",
              effectiveCollapsed
                ? "px-2"
                : "px-3",
            ].join(" ")}
          >
            {NAV_ITEMS.map((item) => (
              <SidebarNavItem
                key={item.path}
                item={item}
                collapsed={effectiveCollapsed}
                user={user}
                isDark={isDark}
                onClose={handleNavigate}
              />
            ))}
          </nav>
        </SimpleBar>
      </div>

      {/* Divider inferior */}
      <div
        className={[
          "mt-4 h-px shrink-0",
          effectiveCollapsed
            ? "mx-3"
            : "mx-4",
        ].join(" ")}
        style={{
          background: dividerColor,
        }}
      />

      {/* User card */}
      <div
        className={[
          "shrink-0 py-4",
          effectiveCollapsed
            ? "px-2"
            : "px-3",
        ].join(" ")}
      >
        <div
          title={
            effectiveCollapsed
              ? `${user?.name ?? "Usuario"}${
                  roleLabel
                    ? ` · ${roleLabel}`
                    : ""
                }`
              : undefined
          }
          className={[
            "flex min-h-14 items-center rounded-xl",
            "overflow-hidden transition-all duration-200",
            effectiveCollapsed
              ? "justify-center p-2"
              : "gap-3 p-3",
          ].join(" ")}
          style={{
            background: userCardBackground,
          }}
        >
          <div
            className="
              flex h-8 w-8 shrink-0
              items-center justify-center
              rounded-lg text-xs font-black
            "
            style={{
              background: `${roleColor}20`,
              border: `1px solid ${roleColor}45`,
              color: roleColor,
            }}
          >
            <Iconify
              Size={18}
              IconString={roleIcon}
              Style={{
                color: "currentColor",
              }}
            />
          </div>

          <AnimatePresence initial={false}>
            {!effectiveCollapsed && (
              <motion.div
                key="sidebar-user-information"
                initial={{
                  opacity: 0,
                  x: -6,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -6,
                }}
                transition={{
                  duration: 0.16,
                  ease: "easeOut",
                }}
                className="
                  min-w-0 flex-1 overflow-hidden
                "
              >
                <p
                  className="
                    truncate text-xs font-bold
                  "
                  style={{
                    color: isDark
                      ? "#ffffff"
                      : "#0f172a",
                  }}
                >
                  {user?.name ?? "Usuario"}
                </p>

                <p
                  className="
                    mt-0.5 truncate
                    text-[10px] font-semibold
                  "
                  style={{
                    color: roleColor,
                  }}
                >
                  {roleLabel}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Logout */}
      <div
        className={[
          "shrink-0 pb-5",
          effectiveCollapsed
            ? "px-2"
            : "px-3",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Cerrar sesión"
          title={
            effectiveCollapsed
              ? "Cerrar sesión"
              : undefined
          }
          className={[
            "flex min-h-11 w-full items-center rounded-xl",
            "overflow-hidden transition-all duration-200",
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-red-500/30",
            effectiveCollapsed
              ? "justify-center px-2"
              : "gap-3 px-3",
          ].join(" ")}
          style={{
            color: "rgba(239,68,68,0.65)",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.color =
              "#ef4444";

            event.currentTarget.style.background =
              "rgba(239,68,68,0.08)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.color =
              "rgba(239,68,68,0.65)";

            event.currentTarget.style.background =
              "transparent";
          }}
        >
          <div
            className="
              flex h-5 w-5 shrink-0
              items-center justify-center
            "
          >
            <Iconify
              Size={18}
              IconString="solar:logout-2-bold-duotone"
              Style={{
                color: "currentColor",
              }}
            />
          </div>

          <AnimatePresence initial={false}>
            {!effectiveCollapsed && (
              <motion.span
                key="sidebar-logout-label"
                initial={{
                  opacity: 0,
                  x: -6,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -6,
                }}
                transition={{
                  duration: 0.16,
                  ease: "easeOut",
                }}
                className="
                  overflow-hidden whitespace-nowrap
                  text-sm font-semibold
                "
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