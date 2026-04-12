import { useState } from "react";
import { useSettings } from "../../hooks/context/SettingsContext";
import Iconify from "../modularUI/IconsMock";

interface AuthFieldProps {
  label: string;
  type: string;
  placeholder: string;
  icon: string;
  error?: string;
  hint?: string;
  registration: React.InputHTMLAttributes<HTMLInputElement>;
}

/**
 * Campo de formulario con icono lateral, toggle de contraseña y mensaje de error.
 * Usado en las páginas de autenticación (login, register, restoreAccount).
 * Detecta el tema automáticamente desde SettingsContext.
 */
export default function AuthField({
  label,
  type,
  placeholder,
  icon,
  error,
  hint,
  registration,
}: AuthFieldProps) {
  const { theme } = useSettings();
  const isDark    = theme === "dark";
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className={`text-xs font-bold tracking-wide ${isDark ? "text-white/60" : "text-slate-500"}`}
      >
        {label}
      </label>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Iconify
            Size={16}
            IconString={icon}
            Style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}
          />
        </span>

        <input
          {...registration}
          type={isPassword && show ? "text" : type}
          placeholder={placeholder}
          className={[
            "w-full py-3 rounded-xl border text-sm font-medium outline-none",
            "transition-all duration-200",
            "focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60",
            isPassword ? "pl-10 pr-10" : "pl-10 pr-4",
            isDark
              ? "bg-white/5 border-white/8 text-white placeholder:text-white/20"
              : "bg-white border-black/8 text-slate-800 placeholder:text-slate-400",
            error ? "border-red-500/60" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <Iconify
              Size={16}
              IconString={show ? "solar:eye-closed-bold-duotone" : "solar:eye-bold-duotone"}
              Style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}
            />
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400 font-medium flex items-center gap-1">
          <Iconify Size={12} IconString="solar:danger-circle-bold" Style={{ color: "#f87171" }} />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className={`text-xs ${isDark ? "text-white/30" : "text-slate-400"}`}>{hint}</p>
      )}
    </div>
  );
}
