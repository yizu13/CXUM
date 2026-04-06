import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, Path } from "react-hook-form";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSettings } from "../../hooks/context/SettingsContext";
import Iconify from "../modularUI/IconsMock";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DAYS_ES = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Returns weekday index 0=Monday … 6=Sunday */
function getFirstDayOfWeek(year: number, month: number): number {
  const d = new Date(year, month, 1).getDay(); // 0=Sun
  return (d + 6) % 7; // shift so Mon=0
}

function parseISODate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplay(value: string): string {
  const d = parseISODate(value);
  if (!d) return "";
  return `${String(d.getDate()).padStart(2, "0")} / ${MONTHS_ES[d.getMonth()]} / ${d.getFullYear()}`;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface RHFDatePickerProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  required?: boolean;
  helperText?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

// ─── Calendar Popover ─────────────────────────────────────────────────────────
interface CalendarProps {
  value: string;
  onChange: (iso: string) => void;
  onClose: () => void;
  isDark: boolean;
  minDate?: Date;
  maxDate?: Date;
}

function Calendar({ value, onChange, onClose, isDark, minDate, maxDate }: CalendarProps) {
  const today = new Date();
  const selected = parseISODate(value);

  const initYear = selected ? selected.getFullYear() : today.getFullYear();
  const initMonth = selected ? selected.getMonth() : today.getMonth();

  const [viewYear, setViewYear] = useState(initYear);
  const [viewMonth, setViewMonth] = useState(initMonth);
  const [mode, setMode] = useState<"days" | "months" | "years">("days");

  // Year range page (groups of 12)
  const yearRangeStart = Math.floor(viewYear / 12) * 12;

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth);

  // Build grid cells: nulls for leading blanks + day numbers
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  function isDisabled(day: number): boolean {
    const d = new Date(viewYear, viewMonth, day);
    if (minDate && d < minDate) return true;
    if (maxDate && d > maxDate) return true;
    return false;
  }

  function isSelected(day: number): boolean {
    if (!selected) return false;
    return (
      selected.getFullYear() === viewYear &&
      selected.getMonth() === viewMonth &&
      selected.getDate() === day
    );
  }

  function isToday(day: number): boolean {
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
  }

  function selectDay(day: number) {
    if (isDisabled(day)) return;
    onChange(toISODate(new Date(viewYear, viewMonth, day)));
    onClose();
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const bg    = isDark ? "rgba(15,15,20,0.97)"   : "rgba(255,255,255,0.98)";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const textPrimary = isDark ? "#fff"        : "#1e293b";
  const textMuted   = isDark ? "rgba(255,255,255,0.35)" : "#94a3b8";
  const hoverBg     = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const todayRing   = "#f59e0b";
  const accentBg    = "linear-gradient(135deg,#f59e0b,#fb923c)";

  const cellBase: React.CSSProperties = {
    width: 36, height: 36,
    display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s",
    userSelect: "none",
  };

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 20,
        boxShadow: isDark
          ? "0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)"
          : "0 24px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
        padding: "20px 16px 16px",
        width: 308,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button
          type="button"
          onClick={mode === "days" ? prevMonth : () => {
            if (mode === "years") setViewYear(y => y - 12);
            else setViewMonth(m => m - 1);
          }}
          style={{
            ...cellBase, width: 32, height: 32,
            background: hoverBg, color: textMuted,
            border: `1px solid ${border}`,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = textPrimary)}
          onMouseLeave={e => (e.currentTarget.style.color = textMuted)}
        >
          <Iconify IconString="solar:alt-arrow-left-bold" Size={14} />
        </button>

        <div style={{ display: "flex", gap: 6 }}>
          {mode !== "years" && (
            <button
              type="button"
              onClick={() => setMode(m => m === "months" ? "days" : "months")}
              style={{
                background: mode === "months" ? "rgba(245,158,11,0.15)" : hoverBg,
                border: `1px solid ${mode === "months" ? "rgba(245,158,11,0.3)" : border}`,
                borderRadius: 8,
                padding: "4px 10px",
                color: mode === "months" ? "#f59e0b" : textPrimary,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {MONTHS_ES[viewMonth].slice(0, 3)}
            </button>
          )}
          <button
            type="button"
            onClick={() => setMode(m => m === "years" ? "days" : "years")}
            style={{
              background: mode === "years" ? "rgba(245,158,11,0.15)" : hoverBg,
              border: `1px solid ${mode === "years" ? "rgba(245,158,11,0.3)" : border}`,
              borderRadius: 8,
              padding: "4px 10px",
              color: mode === "years" ? "#f59e0b" : textPrimary,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {mode === "years" ? `${yearRangeStart} – ${yearRangeStart + 11}` : viewYear}
          </button>
        </div>

        <button
          type="button"
          onClick={mode === "days" ? nextMonth : () => {
            if (mode === "years") setViewYear(y => y + 12);
            else setViewMonth(m => m + 1);
          }}
          style={{
            ...cellBase, width: 32, height: 32,
            background: hoverBg, color: textMuted,
            border: `1px solid ${border}`,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = textPrimary)}
          onMouseLeave={e => (e.currentTarget.style.color = textMuted)}
        >
          <Iconify IconString="solar:alt-arrow-right-bold" Size={14} />
        </button>
      </div>

      {mode === "days" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 6 }}>
            {DAYS_ES.map(d => (
              <div
                key={d}
                style={{
                  textAlign: "center", fontSize: 11, fontWeight: 700,
                  color: textMuted, padding: "2px 0", letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
            {cells.map((day, i) => {
              if (day === null) return <div key={`blank-${i}`} />;
              const sel = isSelected(day);
              const tod = isToday(day);
              const dis = isDisabled(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  disabled={dis}
                  style={{
                    ...cellBase,
                    background: sel ? "transparent" : "transparent",
                    backgroundImage: sel ? accentBg : undefined,
                    color: sel ? "#fff" : dis ? textMuted : textPrimary,
                    opacity: dis ? 0.35 : 1,
                    cursor: dis ? "not-allowed" : "pointer",
                    outline: tod && !sel ? `2px solid ${todayRing}` : "none",
                    outlineOffset: -2,
                    fontWeight: sel ? 700 : tod ? 700 : 500,
                    boxShadow: sel ? "0 4px 12px rgba(245,158,11,0.4)" : undefined,
                  }}
                  onMouseEnter={e => {
                    if (!sel && !dis) e.currentTarget.style.background = hoverBg;
                  }}
                  onMouseLeave={e => {
                    if (!sel) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </>
      )}

      {mode === "months" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginTop: 4 }}>
          {MONTHS_ES.map((m, i) => {
            const isCurrent = i === viewMonth;
            return (
              <button
                key={m}
                type="button"
                onClick={() => { setViewMonth(i); setMode("days"); }}
                style={{
                  padding: "10px 4px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent && isDark ? "#fff" : textPrimary,
                  backgroundImage: isCurrent ? accentBg : undefined,
                  background: isCurrent ? "transparent" : "transparent",
                  border: `1px solid ${isCurrent ? "transparent" : border}`,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  boxShadow: isCurrent ? "0 4px 12px rgba(245,158,11,0.35)" : undefined,
                }}
                onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = hoverBg; }}
                onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = "transparent"; }}
              >
                {m.slice(0, 3)}
              </button>
            );
          })}
        </div>
      )}

      {mode === "years" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginTop: 4 }}>
          {Array.from({ length: 12 }, (_, i) => yearRangeStart + i).map(y => {
            const isCurrent = y === viewYear;
            return (
              <button
                key={y}
                type="button"
                onClick={() => { setViewYear(y); setMode("months"); }}
                style={{
                  padding: "10px 4px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent && isDark ? "#fff" : textPrimary,
                  backgroundImage: isCurrent ? accentBg : undefined,
                  background: isCurrent ? "transparent" : "transparent",
                  border: `1px solid ${isCurrent ? "transparent" : border}`,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  boxShadow: isCurrent ? "0 4px 12px rgba(245,158,11,0.35)" : undefined,
                }}
                onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = hoverBg; }}
                onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = "transparent"; }}
              >
                {y}
              </button>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 14, borderTop: `1px solid ${border}`, paddingTop: 12 }}>
        <button
          type="button"
          onClick={() => {
            setViewYear(today.getFullYear());
            setViewMonth(today.getMonth());
            setMode("days");
          }}
          style={{
            width: "100%",
            padding: "7px 0",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 600,
            color: "#f59e0b",
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.2)",
            cursor: "pointer",
            letterSpacing: "0.04em",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(245,158,11,0.14)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(245,158,11,0.08)")}
        >
          Hoy — {today.getDate()} de {MONTHS_ES[today.getMonth()]} {today.getFullYear()}
        </button>
      </div>
    </div>
  );
}

export default function RHFDatePicker<T extends FieldValues>({
  name,
  label,
  required,
  helperText,
  disabled,
  minDate,
  maxDate,
}: RHFDatePickerProps<T>) {
  const { control } = useFormContext<T>();
  const { theme } = useSettings();
  const isDark = theme === "dark";
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  const handleOutside = useCallback((e: MouseEvent) => {
    if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open, handleOutside]);

  // ── Styling ─────────────────────────────────────────────────────────────
  const labelColor = isDark ? "rgba(255,255,255,0.45)" : "#64748b";

  const inputBase = [
    "w-full px-4 py-3 pl-10 rounded-xl border text-sm font-medium outline-none",
    "transition-all duration-300 cursor-pointer",
    "focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" ");

  const themeInput = isDark
    ? "bg-white/[0.04] border-white/[0.09] text-white"
    : "bg-white border-black/[0.07] text-slate-800";

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div ref={wrapRef} className="flex flex-col gap-1.5" style={{ position: "relative" }}>

          {/* Label */}
          <label
            className="text-xs font-semibold tracking-wider uppercase select-none"
            style={{ color: labelColor }}
          >
            {label}{required && <span className="ml-1" style={{ color: "#f59e0b" }}>*</span>}
          </label>

          {/* Input trigger */}
          <div className="relative">
            {/* Calendar icon */}
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
              <Iconify
                IconString="solar:calendar-bold-duotone"
                Size={16}
                Style={{ color: isDark ? "rgba(245,158,11,0.6)" : "#f59e0b" }}
              />
            </div>

            <button
              type="button"
              disabled={disabled}
              onClick={() => !disabled && setOpen(o => !o)}
              className={[
                inputBase,
                error
                  ? "border-red-500/70 focus:ring-red-500/30 focus:border-red-500/60"
                  : themeInput,
                open ? (isDark
                  ? "border-amber-500/60 ring-2 ring-amber-500/40"
                  : "border-amber-500/60 ring-2 ring-amber-500/40") : "",
              ].join(" ")}
              style={{ textAlign: "left", minHeight: 46 }}
            >
              {field.value ? (
                <span>{formatDisplay(field.value as string)}</span>
              ) : (
                <span style={{ color: isDark ? "rgba(255,255,255,0.25)" : "#94a3b8" }}>
                  DD / Mes / AAAA
                </span>
              )}
            </button>

            {/* Clear button */}
            {field.value && !disabled && (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); field.onChange(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{
                  color: isDark ? "rgba(255,255,255,0.35)" : "#94a3b8",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 2,
                  lineHeight: 1,
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = isDark ? "#fff" : "#1e293b")}
                onMouseLeave={e => (e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.35)" : "#94a3b8")}
              >
                <Iconify IconString="solar:close-circle-bold" Size={15} />
              </button>
            )}
          </div>

          {/* Calendar Popover */}
          {open && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                zIndex: 9999,
                animation: "datepicker-in 0.18s cubic-bezier(0.34,1.56,0.64,1) both",
              }}
            >
              <style>{`
                @keyframes datepicker-in {
                  from { opacity: 0; transform: translateY(-8px) scale(0.97); }
                  to   { opacity: 1; transform: translateY(0)    scale(1);    }
                }
              `}</style>
              <Calendar
                value={field.value as string ?? ""}
                onChange={v => { field.onChange(v); field.onBlur(); }}
                onClose={() => setOpen(false)}
                isDark={isDark}
                minDate={minDate}
                maxDate={maxDate}
              />
            </div>
          )}

          {/* Helper / Error */}
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
