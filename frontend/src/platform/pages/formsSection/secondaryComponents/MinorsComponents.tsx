import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type CSSProperties, type ReactNode } from "react";
import Iconify from "../../../../components/modularUI/IconsMock";
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { CONFIG_DESCRIPTIONS, type AdminOption } from "../types";

export function asPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function compactNumber(value: number) {
  return Number.isInteger(value) ? value.toLocaleString("es-DO") : value.toFixed(2);
}

export function BarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(1, ...data.map((item) => item.value));
  return (
    <div className="space-y-2">
      {data.slice(0, 7).map((item) => (
        <div key={item.label} className="grid grid-cols-[92px_1fr_42px] items-center gap-2">
          <span className="text-[11px] font-bold truncate opacity-70">{item.label}</span>
          <div className="h-8 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5">
            <div className="h-full rounded-xl" style={{ width: `${(item.value / max) * 100}%`, background: color }} />
          </div>
          <span className="text-xs font-black text-right">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export function LineChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const width = 520;
  const height = 160;
  const max = Math.max(1, ...data.map((item) => item.value));
  const points = data.length > 1
    ? data.map((item, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - (item.value / max) * (height - 20) - 10;
        return `${x},${y}`;
      })
    : ["0,120", `${width},120`];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40 overflow-visible">
      <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((point, index) => {
        const [x, y] = point.split(",").map(Number);
        return <circle key={`${point}-${index}`} cx={x} cy={y} r="5" fill={color} />;
      })}
    </svg>
  );
}

export function ScatterChart({ data, color }: { data: { x: number; y: number; label: string }[]; color: string }) {
  const width = 520;
  const height = 180;
  const maxX = Math.max(1, ...data.map((point) => point.x));
  const maxY = Math.max(1, ...data.map((point) => point.y));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44">
      <line x1="24" y1="154" x2="500" y2="154" stroke="rgba(148,163,184,0.35)" strokeWidth="2" />
      <line x1="24" y1="14" x2="24" y2="154" stroke="rgba(148,163,184,0.35)" strokeWidth="2" />
      {data.map((point) => {
        const x = 24 + (point.x / maxX) * 456;
        const y = 154 - (point.y / maxY) * 130;
        return (
          <g key={`${point.label}-${point.x}-${point.y}`}>
            <circle cx={x} cy={y} r="6" fill={color} opacity="0.85" />
            <title>{`${point.label}: ${compactNumber(point.y)}`}</title>
          </g>
        );
      })}
    </svg>
  );
}

export function PieChart({ data }: { data: { label: string; value: number }[] }) {
  const colors = ["#f59e0b", "#ef4444", "#22c55e", "#3b82f6", "#8b5cf6", "#14b8a6"];
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const gradient = data
    .slice(0, 6)
    .map((item, index, items) => {
      const cumulative = items.slice(0, index).reduce((sum, current) => sum + current.value, 0);
      const start = (cumulative / total) * 100;
      const end = ((cumulative + item.value) / total) * 100;
      return `${colors[index]} ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <div className="flex items-center gap-5">
      <div className="w-32 h-32 rounded-full shrink-0" style={{ background: `conic-gradient(${gradient})` }} />
      <div className="space-y-2 min-w-0">
        {data.slice(0, 6).map((item, index) => (
          <div key={item.label} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colors[index] }} />
            <span className="font-bold truncate">{item.label}</span>
            <span className="opacity-60">{asPercent(item.value / total)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BoxPlot({
  min,
  q1,
  median,
  q3,
  max,
}: {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}) {
  const span = Math.max(1, max - min);
  const position = (value: number) => `${((value - min) / span) * 100}%`;
  return (
    <div className="h-16 relative">
      <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-300" />
      <div className="absolute top-5 h-6 rounded-lg border" style={{ left: position(q1), right: `${100 - Number(position(q3).replace("%", ""))}%`, borderColor: "#f59e0b", background: "rgba(245,158,11,0.12)" }} />
      {[min, median, max].map((value) => (
        <div key={value} className="absolute top-3 bottom-3 w-0.5 rounded-full" style={{ left: position(value), background: value === median ? "#ef4444" : "#94a3b8" }} />
      ))}
      <div className="absolute left-0 bottom-0 text-[10px] font-bold opacity-60">{compactNumber(min)}</div>
      <div className="absolute bottom-0 text-[10px] font-bold" style={{ left: position(median), color: "#ef4444" }}>{compactNumber(median)}</div>
      <div className="absolute right-0 bottom-0 text-[10px] font-bold opacity-60">{compactNumber(max)}</div>
    </div>
  );
}

export function AdminSelect<T extends string>({
  value,
  options,
  onChange,
  className = "",
  style,
  placeholder = "Buscar o seleccionar",
  allowCustom = false,
}: {
  value: T;
  options: AdminOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  style?: CSSProperties;
  placeholder?: string;
  allowCustom?: boolean;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((option) => option.value === value)?.label ?? value;
  const [inputValue, setInputValue] = useState(selectedLabel);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const filteredOptions = useMemo(() => {
    const term = inputValue.trim().toLowerCase();
    if (!term || inputValue === selectedLabel) return options;
    return options.filter((option) =>
      `${option.label} ${option.value} ${option.description ?? ""}`.toLowerCase().includes(term),
    );
  }, [inputValue, options, selectedLabel]);

  useEffect(() => {
    setInputValue(selectedLabel);
  }, [selectedLabel]);

  useEffect(() => {
    if (!open) return;
    function closeOnOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        const customValue = inputValue.trim();
        if (allowCustom && customValue) {
          onChange(customValue as T);
          setInputValue(customValue);
        } else {
          setInputValue(selectedLabel);
        }
      }
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [allowCustom, inputValue, onChange, open, selectedLabel]);

function choose(option: AdminOption<T>) {
    onChange(option.value);
    setInputValue(option.label);
    setOpen(false);
    setHighlightedIndex(0);
  }

  return (
    <div ref={rootRef} className={`relative rounded-xl border ${className}`} style={style}>
      <Iconify
        IconString="solar:magnifer-linear"
        Size={16}
        Style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", opacity: 0.55, pointerEvents: "none" }}
      />
      <input
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        value={inputValue}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={(event) => {
          setOpen(true);
          setHighlightedIndex(Math.max(0, options.findIndex((option) => option.value === value)));
          event.currentTarget.select();
        }}
        onChange={(event) => {
          setInputValue(event.target.value);
          setOpen(true);
          setHighlightedIndex(0);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setHighlightedIndex((index) => Math.min(filteredOptions.length - 1, index + 1));
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlightedIndex((index) => Math.max(0, index - 1));
          }
          if (event.key === "Enter") {
            event.preventDefault();
            const option = filteredOptions[highlightedIndex];
            if (option) {
              choose(option);
            } else if (allowCustom && inputValue.trim()) {
              const customValue = inputValue.trim() as T;
              onChange(customValue);
              setInputValue(customValue);
              setOpen(false);
            }
          }
          if (event.key === "Escape") {
            setOpen(false);
            setInputValue(selectedLabel);
          }
        }}
        className="w-full h-full min-h-9.5 bg-transparent pl-9 pr-10 py-2 font-bold outline-none cursor-default"
        style={{ color: style?.color, fontSize: "inherit" }}
      />
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 grid place-items-center rounded-lg"
        style={{ color: style?.color }}
        title={open ? "Cerrar opciones" : "Abrir opciones"}
        tabIndex={-1}
      >
        <Iconify IconString="solar:alt-arrow-down-linear" Size={16} Style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 160ms ease" }} />
      </button>

      {open && (
  <div
    id={listId}
    role="listbox"
    className="
      absolute left-0 right-0 top-[calc(100%+6px)]
      z-[80] overflow-hidden rounded-xl border shadow-2xl
    "
    style={{
      background: style?.color === "#ffffff" ? "#0c0e12" : "#ffffff",
      borderColor: String(
        style?.borderColor ?? "rgba(15,23,42,0.12)"
      ),
      color: style?.color,
    }}
  >
    <SimpleBar
      className="submenu-simplebar"
      style={{ maxHeight: "16rem", marginLeft: 4 }}
      autoHide={false}
    >
      <div className="p-1.5">
        {filteredOptions.length === 0 ? (
          <div className="px-3 py-4 text-center text-xs font-bold opacity-60">
            {allowCustom && inputValue.trim()
              ? "Presiona Enter para crear este submenu"
              : "No hay coincidencias"}
          </div>
        ) : (
          filteredOptions.map((option, index) => {
            const selected = option.value === value;
            const highlighted = index === highlightedIndex;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  choose(option);
                }}
                className="
                  mt-1 flex w-full items-start gap-2.5
                  rounded-lg px-3 py-2.5 text-left
                  transition-colors
                "
                style={{
                  background:
                    selected || highlighted
                      ? "rgba(245,158,11,0.13)"
                      : "transparent",
                }}
              >
                <span
                  className="
                    mt-0.5 grid size-5 shrink-0
                    place-items-center rounded-md
                  "
                  style={{
                    color: selected ? "#f59e0b" : "transparent",
                  }}
                >
                  <Iconify
                    IconString="solar:check-circle-bold-duotone"
                    Size={16}
                  />
                </span>

                <span className="min-w-0">
                  <span className="block whitespace-normal wrap-break-word text-xs font-black">
                    {option.label}
                  </span>

                  {option.description && (
                    <span className="mt-0.5 block whitespace-normal wrap-break-word text-[11px] leading-4 opacity-60">
                      {option.description}
                    </span>
                  )}
                </span>
              </button>
            );
          })
        )}
      </div>
    </SimpleBar>
  </div>
)}
    </div>
  );
}

export function ConfigLabel({ title, description, muted }: { title: string; description: string; muted: string }) {
  return (
    <span className="block min-w-0">
      <span className="block text-[11px] font-black uppercase tracking-widest" style={{ color: muted }}>{title}</span>
      <span className="block mt-0.5 text-[11px] leading-4 font-medium normal-case" style={{ color: muted, opacity: 0.82 }}>{description}</span>
    </span>
  );
}

export function ConfigSectionHeader({ icon, title, description, text, muted, action }: { icon: string; title: string; description: string; text: string; muted: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="flex items-start gap-3 min-w-0">
        <span className="w-9 h-9 shrink-0 rounded-xl grid place-items-center" style={{ color: "#f59e0b", background: "rgba(245,158,11,0.12)" }}>
          <Iconify IconString={icon} Size={19} />
        </span>
        <div>
          <h2 className="font-black" style={{ color: text }}>{title}</h2>
          <p className="text-xs mt-1 leading-5 max-w-2xl" style={{ color: muted }}>{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

export function fieldInput(
    inputStyle: CSSProperties | undefined,
    muted: string,
    label: string,
    value: string | number | undefined,
    onChange: (value: string) => void,
    type = "text",
  ) {
    return (
      <label className="grid gap-1.5">
        <ConfigLabel title={label} description={CONFIG_DESCRIPTIONS[label] ?? "Configura como se comporta este valor en el formulario final."} muted={muted} />
        <input
          type={type}
          value={value ?? ""}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onChange(event.target.value)
          }
          className={`
            rounded-xl border px-3 py-2 text-sm outline-none
            ${type === "number"
              ? "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              : ""
            }
          `}
          style={inputStyle}
        />
      </label>
    );
  }