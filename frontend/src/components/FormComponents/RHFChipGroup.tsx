import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, Path } from "react-hook-form";
import { useSettings } from "../../hooks/context/SettingsContext";

interface ChipOption {
  value: string;
  label: string;
}

interface RHFChipGroupProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  options: ChipOption[];
  helperText?: string;
  required?: boolean;
  /** Allow selecting multiple values (array) vs single value (string) */
  multiple?: boolean;
}

export default function RHFChipGroup<T extends FieldValues>({
  name,
  label,
  options,
  helperText,
  required,
  multiple = false,
}: RHFChipGroupProps<T>) {
  const { control } = useFormContext<T>();
  const { theme } = useSettings();
  const isDark = theme === "dark";

  const labelColor = isDark ? "rgba(255,255,255,0.45)" : "#64748b";

  const isActive = (fieldValue: unknown, optValue: string): boolean => {
    if (multiple) return Array.isArray(fieldValue) && fieldValue.includes(optValue);
    return fieldValue === optValue;
  };

  const toggle = (fieldValue: unknown, optValue: string, onChange: (v: unknown) => void) => {
    if (multiple) {
      const arr = Array.isArray(fieldValue) ? [...fieldValue] : [];
      onChange(arr.includes(optValue) ? arr.filter((v) => v !== optValue) : [...arr, optValue]);
    } else {
      onChange(fieldValue === optValue ? "" : optValue);
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="flex flex-col gap-2">
          <label
            className="text-xs font-semibold tracking-wider uppercase select-none"
            style={{ color: labelColor }}
          >
            {label}
            {required && <span className="ml-1" style={{ color: "#f59e0b" }}>*</span>}
          </label>

          <div className="flex flex-wrap gap-2">
            {options.map((opt) => {
              const active = isActive(field.value, opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(field.value, opt.value, field.onChange)}
                  className="px-3.5 py-2 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer"
                  style={{
                    background: active
                      ? "linear-gradient(135deg, #f59e0b, #fb923c)"
                      : isDark
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(255,255,255,0.9)",
                    borderColor: active
                      ? "transparent"
                      : error
                        ? "rgba(248,113,113,0.5)"
                        : isDark
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.08)",
                    color: active
                      ? "#fff"
                      : isDark
                        ? "rgba(255,255,255,0.6)"
                        : "#475569",
                    boxShadow: active ? "0 4px 12px rgba(245,158,11,0.35)" : "none",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
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
