import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, Path } from "react-hook-form";
import { useState, useRef, useEffect, useId } from "react";
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
  placeholder = "Buscar o seleccionar…",
  helperText,
  required,
  disabled,
}: RHFSelectProps<T>) {
  const { control } = useFormContext<T>();
  const { theme } = useSettings();
  const isDark = theme === "dark";
  const id = useId();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    if (listRef.current) {
      const item = listRef.current.children[highlighted] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlighted]);

  const labelColor = isDark ? "rgba(255,255,255,0.45)" : "#64748b";

  const triggerBase = [
    "w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none text-left",
    "flex items-center justify-between gap-2 transition-all duration-300 cursor-pointer",
    "focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" ");

  const triggerTheme = (hasError: boolean) => [
    triggerBase,
    hasError
      ? "border-red-500/70 focus:ring-red-500/30 focus:border-red-500/60"
      : isDark
      ? "bg-white/[0.04] border-white/[0.09]"
      : "bg-white border-black/[0.07]",
  ].join(" ");

  const dropdownBg = isDark
    ? "bg-[#1a1a1f] border-white/[0.09]"
    : "bg-white border-black/[0.07]";

  const optionBase = "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm cursor-pointer transition-all duration-150";
  const optionHighlight = isDark
    ? "bg-amber-500/[0.12] text-amber-300"
    : "bg-amber-50 text-amber-700";
  const optionNormal = isDark
    ? "text-white/75 hover:bg-white/[0.05]"
    : "text-slate-700 hover:bg-slate-50";

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const selected = options.find((o) => o.value === field.value);

        function choose(opt: SelectOption) {
          field.onChange(opt.value);
          setOpen(false);
          setQuery("");
          setHighlighted(0);
        }

        function handleKey(e: React.KeyboardEvent) {
          if (!open) {
            if (e.key === "Enter" || e.key === "ArrowDown") { setOpen(true); e.preventDefault(); }
            return;
          }
          if (e.key === "ArrowDown") { setHighlighted((h) => Math.min(h + 1, filtered.length - 1)); e.preventDefault(); }
          else if (e.key === "ArrowUp") { setHighlighted((h) => Math.max(h - 1, 0)); e.preventDefault(); }
          else if (e.key === "Enter") { if (filtered[highlighted]) choose(filtered[highlighted]); e.preventDefault(); }
          else if (e.key === "Escape") { setOpen(false); setQuery(""); }
        }

        return (
          <div className="flex flex-col gap-1.5" ref={containerRef}>
            <label
              htmlFor={id}
              className="text-xs font-semibold tracking-wider uppercase select-none"
              style={{ color: labelColor }}
            >
              {label}{required && <span className="ml-1" style={{ color: "#f59e0b" }}>*</span>}
            </label>

            <div className="relative">
              <button
                id={id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setOpen((o) => !o);
                  setHighlighted(0);
                  setTimeout(() => inputRef.current?.focus(), 30);
                }}
                onKeyDown={handleKey}
                className={triggerTheme(!!error)}
                aria-haspopup="listbox"
                aria-expanded={open}
              >
                <span className={selected ? (isDark ? "text-white" : "text-slate-800") : (isDark ? "text-white/30" : "text-slate-400")}>
                  {selected ? selected.label : placeholder}
                </span>

                <span className="flex items-center gap-1 shrink-0">
                  {selected && (
                    <span
                      role="button"
                      aria-label="Limpiar"
                      onClick={(e) => { e.stopPropagation(); field.onChange(""); setQuery(""); }}
                      className="flex items-center justify-center w-4 h-4 rounded-full transition-all"
                      style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}
                    >
                      <Iconify IconString="solar:close-circle-bold" Size={14} />
                    </span>
                  )}
                  <Iconify
                    IconString="solar:alt-arrow-down-bold-duotone"
                    Size={16}
                    Style={{
                      color: isDark ? "rgba(255,255,255,0.35)" : "#94a3b8",
                      transform: open ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.25s ease",
                    }}
                  />
                </span>
              </button>

              {open && (
                <div
                  className={`absolute z-50 left-0 right-0 mt-2 rounded-2xl border shadow-2xl overflow-hidden ${dropdownBg}`}
                  style={{
                    boxShadow: isDark
                      ? "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(245,158,11,0.08)"
                      : "0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(245,158,11,0.12)",
                  }}
                >
                  <div className={`px-3 pt-3 pb-2 border-b ${isDark ? "border-white/6" : "border-black/5"}` }>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2">
                        <Iconify
                          IconString="solar:magnifer-linear"
                          Size={14}
                          Style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}
                        />
                      </div>
                      <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setHighlighted(0); }}
                        onKeyDown={handleKey}
                        placeholder="Buscar…"
                        className={[
                          "w-full pl-8 pr-3 py-2 rounded-lg text-xs font-medium outline-none border transition-all",
                          isDark
                            ? "bg-white/5 border-white/[0.07] text-white placeholder:text-white/30 focus:border-amber-500/40"
                            : "bg-slate-50 border-black/6 text-slate-800 placeholder:text-slate-400 focus:border-amber-400/50",
                        ].join(" ")}
                      />
                    </div>
                  </div>

                  <ul
                    ref={listRef}
                    role="listbox"
                    className="max-h-52 overflow-y-auto p-2 soft-scrollbar"
                    style={{ scrollbarWidth: "thin" }}
                  >
                    <style>
                      {`
                      .soft-scrollbar {
                          scrollbar-width: thin;
                          scrollbar-color: rgba(148, 163, 184, 0.45) transparent; /* Firefox */
                        }

                        .soft-scrollbar::-webkit-scrollbar {
                          width: 8px;
                        }

                        .soft-scrollbar::-webkit-scrollbar-track {
                          background: transparent;
                          border-radius: 999px;
                        }

                        .soft-scrollbar::-webkit-scrollbar-thumb {
                          background: rgba(148, 163, 184, 0.35);
                          border-radius: 999px;
                          border: 2px solid transparent;
                          background-clip: padding-box;
                          transition: background 0.2s ease;
                        }

                        .soft-scrollbar::-webkit-scrollbar-thumb:hover {
                          background: rgba(148, 163, 184, 0.55);
                          background-clip: padding-box;
                        }`}
                    </style>
                    {filtered.length === 0 ? (
                      <li className={`px-3 py-3 text-xs text-center ${isDark ? "text-white/30" : "text-slate-400"}`}>
                        Sin resultados para «{query}»
                      </li>
                    ) : (
                      filtered.map((opt, idx) => {
                        const isActive = field.value === opt.value;
                        const isHigh = idx === highlighted;
                        return (
                          <li
                            key={opt.value}
                            role="option"
                            aria-selected={isActive}
                            onMouseDown={() => choose(opt)}
                            onMouseEnter={() => setHighlighted(idx)}
                            className={[optionBase, isHigh ? optionHighlight : optionNormal].join(" ")}
                          >
                            
                            <span className="flex-1 truncate">{opt.label}</span>
                            {isActive && (
                              <Iconify IconString="solar:check-circle-bold" Size={14} Style={{ color: "#f59e0b" }} />
                            )}
                          </li>
                        );
                      })
                    )}
                  </ul>

                  <div className={`px-3 py-2 border-t text-[10px] flex items-center gap-1.5 ${isDark ? "border-white/4 text-white/20" : "border-black/4 text-slate-300"}`}>
                    <Iconify IconString="solar:keyboard-bold-duotone" Size={10} />
                    <span>↑↓ navegar &nbsp;·&nbsp; Enter seleccionar &nbsp;·&nbsp; Esc cerrar</span>
                  </div>
                </div>
              )}
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
        );
      }}
    />
  );
}
