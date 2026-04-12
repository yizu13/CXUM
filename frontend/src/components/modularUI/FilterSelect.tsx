import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSettings } from "../../hooks/context/SettingsContext";
import Iconify from "./IconsMock";

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; color?: string }[];
  placeholder?: string;
  icon?: string;
}

export default function FilterSelect({
  value,
  onChange,
  options,
  placeholder = "Filtrar...",
  icon = "solar:filter-bold-duotone",
}: FilterSelectProps) {
  const { theme } = useSettings();
  const isDark = theme === "dark";
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const activeColor = selectedOption?.color;

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const triggerBorder = open
    ? "rgba(245,158,11,0.5)"
    : isDark
    ? "rgba(255,255,255,0.1)"
    : "rgba(0,0,0,0.1)";

  return (
    <div ref={ref} className="relative select-none">
      {/* ── Trigger ── */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 pl-3 pr-3 py-2.5 rounded-xl border text-sm font-semibold outline-none cursor-pointer transition-all duration-200 whitespace-nowrap"
        style={{
          background: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
          borderColor: triggerBorder,
          color: activeColor || (isDark ? "rgba(255,255,255,0.7)" : "#334155"),
          boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.05)",
          minWidth: "140px",
          maxWidth: "100%",
        }}
      >
        {/* Leading icon */}
        <Iconify
          Size={15}
          IconString={icon}
          Style={{ color: activeColor || (isDark ? "rgba(255,255,255,0.3)" : "#94a3b8"), flexShrink: 0 }}
        />

        {/* Label */}
        <span className="flex-1 text-left truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {/* Active badge dot */}
        {value !== "todos" && (
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: activeColor || "#f59e0b" }}
          />
        )}

        {/* Chevron */}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="shrink-0"
        >
          <Iconify
            Size={14}
            IconString="solar:alt-arrow-down-linear"
            Style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}
          />
        </motion.span>
      </button>

      {/* ── Dropdown panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 z-50 min-w-full overflow-hidden"
            style={{
              borderRadius: "14px",
              border: isDark
                ? "1px solid rgba(255,255,255,0.09)"
                : "1px solid rgba(0,0,0,0.09)",
              background: isDark
                ? "rgba(15,17,23,0.96)"
                : "rgba(255,255,255,0.98)",
              backdropFilter: "blur(20px)",
              boxShadow: isDark
                ? "0 12px 40px rgba(0,0,0,0.5)"
                : "0 12px 40px rgba(0,0,0,0.12)",
            }}
          >
            <div className="p-1.5 flex flex-col gap-0.5">
              {/* "Todos" option */}
              <button
                type="button"
                onClick={() => { onChange("todos"); setOpen(false); }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold w-full text-left transition-colors duration-150"
                style={{
                  background: value === "todos"
                    ? isDark ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.09)"
                    : "transparent",
                  color: value === "todos"
                    ? "#f59e0b"
                    : isDark ? "rgba(255,255,255,0.55)" : "#64748b",
                }}
                onMouseEnter={(e) => {
                  if (value !== "todos")
                    (e.currentTarget as HTMLElement).style.background = isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.04)";
                }}
                onMouseLeave={(e) => {
                  if (value !== "todos")
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: value === "todos" ? "#f59e0b" : "transparent", border: "1px solid", borderColor: isDark ? "rgba(255,255,255,0.2)" : "#cbd5e1" }}
                />
                {placeholder}
                {value === "todos" && (
                  <Iconify Size={13} IconString="solar:check-circle-bold" Style={{ color: "#f59e0b", marginLeft: "auto" }} />
                )}
              </button>

              {/* Divider */}
              <div className="h-px mx-2 my-0.5" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }} />

              {/* Options */}
              {options.map((opt) => {
                const isSelected = value === opt.value;
                const optColor = opt.color || (isDark ? "rgba(255,255,255,0.7)" : "#334155");
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold w-full text-left transition-colors duration-150"
                    style={{
                      background: isSelected
                        ? isDark ? `${opt.color}18` : `${opt.color}12`
                        : "transparent",
                      color: isSelected ? optColor : isDark ? "rgba(255,255,255,0.65)" : "#475569",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        (e.currentTarget as HTMLElement).style.background = isDark
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(0,0,0,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    {/* Color dot */}
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: optColor }}
                    />
                    {opt.label}
                    {isSelected && (
                      <Iconify Size={13} IconString="solar:check-circle-bold" Style={{ color: optColor, marginLeft: "auto" }} />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
