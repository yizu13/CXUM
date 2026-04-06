import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { useSettings } from "../../hooks/context/SettingsContext";
import type { UserRole } from "../components/auth";
import { ROLE_PERMISSIONS } from "../components/auth";
import { type ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Si se especifica, el usuario debe tener este permiso */
  requiredPermission?: keyof (typeof ROLE_PERMISSIONS)[UserRole];
  /** Ruta a la que redirigir si no hay sesión. Default: /plataforma/login */
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requiredPermission,
  redirectTo = "/plataforma/login",
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { theme } = useSettings();
  const isDark = theme === "dark";
  const location = useLocation();

  const bg          = isDark ? "#05070b" : "#f1f5f9";
  const cardBg      = isDark ? "rgba(255,255,255,0.03)" : "#ffffff";
  const cardBorder  = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const textPrimary = isDark ? "#ffffff" : "#0f172a";
  const textMuted   = isDark ? "rgba(255,255,255,0.4)" : "#64748b";

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: bg }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #f59e0b, #fb923c)" }}
          >
            <span
              className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin block"
            />
          </div>
          <p className="text-sm font-semibold" style={{ color: textMuted }}>
            Verificando sesión…
          </p>
        </div>
      </div>
    );
  }

  // ── Sin sesión ───────────────────────────────────────────────────────────────
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // ── Cuenta suspendida ────────────────────────────────────────────────────────
  if (user.status === "suspendido") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: bg }}>
        <div
          className="text-center max-w-sm w-full mx-auto px-8 py-10 rounded-3xl border"
          style={{ background: cardBg, borderColor: cardBorder }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}
          >
            <span className="text-3xl">🚫</span>
          </div>
          <h2 className="text-xl font-black mb-2" style={{ color: textPrimary }}>
            Cuenta suspendida
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: textMuted }}>
            Tu cuenta ha sido suspendida. Contacta al administrador para más información.
          </p>
        </div>
      </div>
    );
  }

  // ── Sin permiso ──────────────────────────────────────────────────────────────
  if (requiredPermission && !ROLE_PERMISSIONS[user.role][requiredPermission]) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: bg }}>
        <div
          className="text-center max-w-sm w-full mx-auto px-8 py-10 rounded-3xl border"
          style={{ background: cardBg, borderColor: cardBorder }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)" }}
          >
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-xl font-black mb-2" style={{ color: textPrimary }}>
            Acceso restringido
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: textMuted }}>
            No tienes permisos para acceder a esta sección. Contacta a tu administrador si crees que esto es un error.
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
            style={{
              color: "#f59e0b",
              border: "1px solid rgba(245,158,11,0.3)",
            }}
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
