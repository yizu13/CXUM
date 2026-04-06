import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, Path } from "react-hook-form";
import { useSettings } from "../../hooks/context/SettingsContext";

interface RHFCheckboxProps<T extends FieldValues> {
  name: Path<T>;
  label: React.ReactNode;
  helperText?: string;
  disabled?: boolean;
}

export default function RHFCheckbox<T extends FieldValues>({
  name,
  label,
  helperText,
  disabled,
}: RHFCheckboxProps<T>) {
  const { control } = useFormContext<T>();
  const { theme } = useSettings();
  const isDark = theme === "dark";

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="flex flex-col gap-1">
          <label
            className={`flex items-start gap-3 cursor-pointer group select-none ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {/* Custom checkbox box */}
            <div
              className={`
                mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0
                transition-all duration-200
                ${field.value
                  ? "border-amber-500 bg-amber-500"
                  : isDark
                    ? "border-white/20 bg-white/[0.04] group-hover:border-amber-500/60"
                    : "border-black/15 bg-white group-hover:border-amber-500/60"
                }
                ${error ? "border-red-500/70" : ""}
              `}
            >
              {field.value && (
                <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                  <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>

            {/* Hidden real checkbox for a11y */}
            <input
              type="checkbox"
              checked={!!field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={disabled}
              className="sr-only"
            />

            <span
              className="text-xs leading-relaxed"
              style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#64748b" }}
            >
              {label}
            </span>
          </label>

          <div className="min-h-[1rem] pl-8">
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
