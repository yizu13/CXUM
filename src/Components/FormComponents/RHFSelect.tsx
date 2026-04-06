import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, Path } from "react-hook-form";
import { useSettings } from "../../hooks/context/SettingsContext";
import Iconify from "../modularUI/IconsMock";

interface SelectOption {
  value: string;
  label: string;
}

interface RHFSelectProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function RHFSelect<T extends FieldValues>({
  name,
  label,
  options,
  placeholder = "Selecciona una opción",
  helperText,
  required,
  disabled,
}: RHFSelectProps<T>) {
  const { control } = useFormContext<T>();
  const { theme } = useSettings();
  const isDark = theme === "dark";

  const baseSelect = `
    w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none
    appearance-none cursor-pointer transition-all duration-300
    focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const themeSelect = isDark
    ? "bg-white/[0.04] border-white/[0.09] text-white"
    : "bg-white border-black/[0.07] text-slate-800";

  const errorSelect = "border-red-500/70 focus:ring-red-500/30 focus:border-red-500/60";
  const labelColor  = isDark ? "rgba(255,255,255,0.45)" : "#64748b";

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

          {/* Wrapper for custom arrow */}
          <div className="relative">
            <select
              {...field}
              id={String(name)}
              disabled={disabled}
              className={`${baseSelect} ${error ? errorSelect : themeSelect}`}
              value={field.value ?? ""}
            >
              <option value="" disabled style={{ color: "#94a3b8" }}>
                {placeholder}
              </option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Chevron icon */}
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <Iconify
                IconString="iconamoon:arrow-up-2-light"
                Size={18}
                Style={{
                  color: isDark ? "rgba(255,255,255,0.35)" : "#94a3b8",
                  transform: "rotate(180deg)",
                }}
              />
            </div>
          </div>

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
