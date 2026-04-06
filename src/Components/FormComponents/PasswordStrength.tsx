import { useSettings } from "../../hooks/context/SettingsContext";

interface PasswordStrengthProps {
  password: string;
}

/**
 * Indicador visual de fortaleza de contraseña (4 barras + etiqueta).
 * No renderiza nada si el password está vacío.
 * Usado en register y restoreAccount.
 */
export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const { theme } = useSettings();
  const isDark    = theme === "dark";

  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score  = checks.filter(Boolean).length;
  const labels = ["", "Débil", "Regular", "Buena", "Fuerte"];
  const colors = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];

  if (!password) return null;

  return (
    <div className="flex flex-col gap-1.5 mt-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              background:
                i < score
                  ? colors[score]
                  : isDark
                  ? "rgba(255,255,255,0.1)"
                  : "#e2e8f0",
            }}
          />
        ))}
      </div>
      <span className="text-[10px] font-bold" style={{ color: colors[score] }}>
        {labels[score]}
      </span>
    </div>
  );
}
