import { motion } from "framer-motion";
import Iconify from "../../components/modularUI/IconsMock";
import { useSettings } from "../../hooks/context/SettingsContext";

// ─────────────────────────────────────────────────────────────────────────────
// Variants
// ─────────────────────────────────────────────────────────────────────────────
//  "primary"   → gradient amber  (CTA principal)
//  "ghost"     → borde sutil     (acciones secundarias)
//  "danger"    → borde rojo      (eliminar / rechazar)
//  "success"   → gradient verde  (aprobar / confirmar)
//  "indigo"    → gradient indigo (incluir en sistema)
//  "back"      → flecha izquierda + ghost (volver al listado)
// ─────────────────────────────────────────────────────────────────────────────

export type AdminButtonVariant = "primary" | "ghost" | "danger" | "success" | "indigo" | "back";
export type AdminButtonSize    = "sm" | "md";

export interface AdminButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  icon?: string;
  iconRight?: string;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  className?: string;
  style?: React.CSSProperties;
  fullWidth?: boolean;
  /** Forzar dark si el componente padre no tiene provider */
  forceDark?: boolean;
}

const SIZE_CLASSES: Record<AdminButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
};

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default function AdminButton({
  children,
  onClick,
  type = "button",
  variant = "ghost",
  size = "md",
  icon,
  iconRight,
  disabled = false,
  loading = false,
  loadingText,
  className = "",
  style,
  fullWidth = false,
  forceDark,
}: AdminButtonProps) {
  const { theme } = useSettings();
  const isDark = forceDark !== undefined ? forceDark : theme === "dark";

  const variantStyle = (() => {
    switch (variant) {
      case "primary":
        return {
          background: "linear-gradient(135deg, #f59e0b, #fb923c)",
          boxShadow: "0 4px 20px rgba(245,158,11,0.3)",
          color: "#ffffff",
          border: "none",
        };
      case "success":
        return {
          background: "linear-gradient(135deg, #22c55e, #16a34a)",
          boxShadow: "0 4px 16px rgba(34,197,94,0.3)",
          color: "#ffffff",
          border: "none",
        };
      case "indigo":
        return {
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
          color: "#ffffff",
          border: "none",
        };
      case "danger":
        return {
          background: "transparent",
          color: "#ef4444",
          border: "1px solid rgba(239,68,68,0.25)",
        };
      case "back":
        return {
          background: "transparent",
          color: isDark ? "rgba(255,255,255,0.6)" : "#475569",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
        };
      case "ghost":
      default:
        return {
          background: "transparent",
          color: isDark ? "rgba(255,255,255,0.4)" : "#64748b",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
        };
    }
  })();

  const resolvedIcon =
    variant === "back" && !icon ? "solar:arrow-left-line-duotone" : icon;

  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={isDisabled ? {} : { scale: 1.025 }}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className={[
        "inline-flex items-center justify-center rounded-xl font-bold",
        "transition-opacity cursor-pointer",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        SIZE_CLASSES[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ ...variantStyle, ...style }}
    >
      {loading ? (
        <>
          <Spinner />
          {loadingText ?? children}
        </>
      ) : (
        <>
          {resolvedIcon && (
            <Iconify
              Size={size === "sm" ? 13 : 16}
              IconString={resolvedIcon}
              Style={{ color: "currentColor", flexShrink: 0 }}
            />
          )}
          {children}
          {iconRight && (
            <Iconify
              Size={size === "sm" ? 13 : 16}
              IconString={iconRight}
              Style={{ color: "currentColor", flexShrink: 0 }}
            />
          )}
        </>
      )}
    </motion.button>
  );
}
