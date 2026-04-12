import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, Path } from "react-hook-form";
import { useRef, useEffect, useState } from "react";
import { useSettings } from "../../hooks/context/SettingsContext";
import Iconify from "../modularUI/IconsMock";

// ─── Inputmask lazy-loaded (only when needed) ────────────────────────────────
type MaskMode = "cedula" | "phone" | "phone-intl" | "none";

function removeMask(input: HTMLInputElement) {
  import("inputmask").then(({ default: Inputmask }) => {
    if (Inputmask.isValid !== undefined) {
      const im = (input as HTMLInputElement).inputmask;
      if (im) im.remove();
    }
  });
}

function applyMask(input: HTMLInputElement, mode: MaskMode) {
  import("inputmask").then(({ default: Inputmask }) => {
    // Remove any existing mask first
    const existing = (input as HTMLInputElement).inputmask;
    if (existing) existing.remove();

    if (mode === "cedula") {
      Inputmask({ mask: "999-9999999-9", placeholder: "_", showMaskOnHover: false }).mask(input);
    } else if (mode === "phone") {
      Inputmask({ mask: "999-999-9999", placeholder: "_", showMaskOnHover: false }).mask(input);
    }
  });
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface RHFTextFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  /** "cedula" → switch entre cédula (con máscara) y pasaporte (libre) */
  documentMode?: boolean;
  /** "phone" → switch entre teléfono convencional (con máscara) y número internacional (libre) */
  phoneMode?: boolean;
}

// ─── Shared styles ───────────────────────────────────────────────────────────
const TOGGLE_BASE =
  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide transition-all duration-200 cursor-pointer select-none";

// ─── Component ───────────────────────────────────────────────────────────────
export default function RHFTextField<T extends FieldValues>({
  name,
  label,
  placeholder,
  type = "text",
  helperText,
  required,
  disabled,
  autoComplete,
  documentMode = false,
  phoneMode = false,
}: RHFTextFieldProps<T>) {
  const { control } = useFormContext<T>();
  const { theme } = useSettings();
  const isDark = theme === "dark";
  const inputRef = useRef<HTMLInputElement>(null);

  // document toggle: false = cédula (masked), true = pasaporte (free)
  const [isPassport, setIsPassport] = useState(false);
  // phone toggle: false = convencional (masked), true = internacional (free)
  const [isIntlPhone, setIsIntlPhone] = useState(false);

  const maskMode: MaskMode = documentMode && !isPassport
    ? "cedula"
    : phoneMode && !isIntlPhone
    ? "phone"
    : "none";

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    if (maskMode === "none") {
      // Remove mask when switching to passport or international mode
      removeMask(input);
    } else {
      applyMask(input, maskMode);
    }

    return () => {
      // Cleanup on unmount
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const im = (input as any).inputmask;
      if (im) im.remove();
    };
  }, [maskMode]);

  // ── Styling ──────────────────────────────────────────────────────────────
  const baseInput = [
    "w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none",
    "transition-all duration-300",
    "focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" ");

  const themeInput = isDark
    ? "bg-white/[0.04] border-white/[0.09] text-white placeholder:text-white/25"
    : "bg-white border-black/[0.07] text-slate-800 placeholder:text-slate-400";

  const errorInput = "border-red-500/70 focus:ring-red-500/30 focus:border-red-500/60";
  const labelColor = isDark ? "rgba(255,255,255,0.45)" : "#64748b";

  const toggleActive = isDark
    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
    : "bg-amber-50 text-amber-600 border border-amber-200";
  const toggleInactive = isDark
    ? "bg-white/[0.04] text-white/40 border border-white/[0.08] hover:text-white/60"
    : "bg-black/[0.03] text-slate-400 border border-black/[0.06] hover:text-slate-600";

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="flex flex-col gap-1.5">

          <div className="flex items-start justify-between gap-2 flex-wrap">
            <label
              htmlFor={String(name)}
              className="text-xs font-semibold tracking-wider uppercase select-none"
              style={{ color: labelColor }}
            >
              {label}{required && <span className="ml-1" style={{ color: "#f59e0b" }}>*</span>}
            </label>

            {documentMode && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => { setIsPassport(false); field.onChange(""); }}
                  className={`${TOGGLE_BASE} ${!isPassport ? toggleActive : toggleInactive}`}
                >
                  <Iconify IconString="solar:card-bold-duotone" Size={12} />
                  Cédula
                </button>
                <button
                  type="button"
                  onClick={() => { setIsPassport(true); field.onChange(""); }}
                  className={`${TOGGLE_BASE} ${isPassport ? toggleActive : toggleInactive}`}
                >
                  <Iconify IconString="solar:passport-bold-duotone" Size={12} />
                  Pasaporte
                </button>
              </div>
            )}

            {phoneMode && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => { setIsIntlPhone(false); field.onChange(""); }}
                  className={`${TOGGLE_BASE} ${!isIntlPhone ? toggleActive : toggleInactive}`}
                >
                  <Iconify IconString="solar:phone-bold-duotone" Size={12} />
                  Convencional
                </button>
                <button
                  type="button"
                  onClick={() => { setIsIntlPhone(true); field.onChange(""); }}
                  className={`${TOGGLE_BASE} ${isIntlPhone ? toggleActive : toggleInactive}`}
                >
                  <Iconify IconString="solar:global-bold-duotone" Size={12} />
                  Internacional
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            {(documentMode || phoneMode) && (
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <Iconify
                  IconString={
                    documentMode
                      ? isPassport ? "solar:passport-bold-duotone" : "solar:card-bold-duotone"
                      : isIntlPhone ? "solar:global-bold-duotone" : "solar:phone-bold-duotone"
                  }
                  Size={16}
                  Style={{ color: isDark ? "rgba(245,158,11,0.6)" : "#f59e0b" }}
                />
              </div>
            )}
            <input
              {...field}
              ref={inputRef}
              id={String(name)}
              type={type}
              placeholder={
                documentMode
                  ? isPassport ? "AB-1234567" : "000-0000000-0"
                  : phoneMode
                  ? isIntlPhone ? "+1 809 000 0000" : "000-000-0000"
                  : placeholder
              }
              disabled={disabled}
              autoComplete={autoComplete}
              className={[
                baseInput,
                error ? errorInput : themeInput,
                (documentMode || phoneMode) ? "pl-10" : "",
              ].join(" ")}
              value={field.value ?? ""}
            />
          </div>

          <div className="min-h-4">
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
