import { useSettings } from "../../hooks/context/SettingsContext";
import Iconify from "../modularUI/IconsMock";

interface AuthOtpInputProps {
  registration: React.InputHTMLAttributes<HTMLInputElement>;
  error?: string;
  /** Tamaño visual del texto. "lg" para register (text-3xl), "md" para restore (text-2xl). */
  size?: "md" | "lg";
}

/**
 * Input OTP de gran tamaño para verificación de código numérico.
 * Filtra automáticamente caracteres no numéricos.
 * Usado en register (paso OTP) y restoreAccount (paso reset).
 */
export default function AuthOtpInput({
  registration,
  error,
  size = "lg",
}: AuthOtpInputProps) {
  const { theme } = useSettings();
  const isDark    = theme === "dark";

  const textSize = size === "lg" ? "text-3xl" : "text-2xl";

  const { onChange, ...rest } = registration as React.InputHTMLAttributes<HTMLInputElement> & {
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
  };

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.target.value = e.target.value.replace(/\D/g, "");
    onChange?.(e);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className={`text-xs font-bold tracking-wide ${isDark ? "text-white/60" : "text-slate-500"}`}
      >
        Código de verificación
      </label>

      <input
        {...rest}
        onChange={handleChange}
        type="text"
        inputMode="numeric"
        maxLength={6}
        placeholder="000000"
        className={[
          "w-full text-center font-black tracking-[0.4em] py-4 rounded-xl border outline-none",
          "transition-all duration-200",
          "focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60",
          textSize,
          isDark
            ? "bg-white/5 border-white/8 text-white placeholder:text-white/15"
            : "bg-white border-black/8 text-slate-900 placeholder:text-slate-300",
          error ? "border-red-500/60" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      />

      {error && (
        <p className="text-xs text-red-400 font-medium flex items-center gap-1">
          <Iconify Size={12} IconString="solar:danger-circle-bold" Style={{ color: "#f87171" }} />
          {error}
        </p>
      )}
    </div>
  );
}
