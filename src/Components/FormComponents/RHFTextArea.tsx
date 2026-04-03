import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, Path } from "react-hook-form";
import { useSettings } from "../../hooks/context/SettingsContext";

interface RHFTextAreaProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder?: string;
  rows?: number;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function RHFTextArea<T extends FieldValues>({
  name,
  label,
  placeholder,
  rows = 4,
  helperText,
  required,
  disabled,
}: RHFTextAreaProps<T>) {
  const { control } = useFormContext<T>();
  const { theme } = useSettings();
  const isDark = theme === "dark";

  const baseInput = `
    w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none
    resize-none transition-all duration-300
    focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const themeInput = isDark
    ? "bg-white/[0.04] border-white/[0.09] text-white placeholder:text-white/25"
    : "bg-white border-black/[0.07] text-slate-800 placeholder:text-slate-400";

  const errorInput = "border-red-500/70 focus:ring-red-500/30 focus:border-red-500/60";
  const labelColor = isDark ? "rgba(255,255,255,0.45)" : "#64748b";

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={String(name)}
            className="text-xs font-semibold tracking-wider uppercase select-none"
            style={{ color: labelColor }}
          >
            {label}
            {required && (
              <span className="ml-1" style={{ color: "#f59e0b" }}>*</span>
            )}
          </label>

          <textarea
            {...field}
            id={String(name)}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            className={`${baseInput} ${error ? errorInput : themeInput}`}
            value={field.value ?? ""}
          />

          <div className="min-h-[1rem]">
            {error ? (
              <p className="text-xs font-medium flex items-center gap-1" style={{ color: "#f87171" }}>
                <span>⚠</span> {error.message}
              </p>
            ) : helperText ? (
              <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}>
                {helperText}
              </p>
            ) : null}
          </div>
        </div>
      )}
    />
  );
}
