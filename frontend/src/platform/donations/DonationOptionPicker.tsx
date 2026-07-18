import { type CSSProperties, useEffect, useId, useMemo, useRef, useState } from "react";
import Iconify from "../../components/modularUI/IconsMock";
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import type { DonationSelectDisplay } from "./types";

type DonationOptionPickerProps = {
  value: string;
  options: string[];
  display?: DonationSelectDisplay;
  optionSubmenus?: Record<string, string>;
  onChange: (value: string) => void;
  onNavigate?: (section: string) => void;
  shouldDeferNavigation?: (option: string, section: string) => boolean;
  style?: CSSProperties;
  featured?: boolean;
};

export default function DonationOptionPicker({
  value,
  options,
  display = "autocomplete",
  optionSubmenus,
  onChange,
  onNavigate,
  shouldDeferNavigation,
  style,
  featured = false,
}: DonationOptionPickerProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const filteredOptions = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term || query === value) return options;
    return options.filter((option) => option.toLowerCase().includes(term));
  }, [options, query, value]);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    function closeOnOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery(value);
      }
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [open, value]);

  function choose(option: string, navigate = false) {
    onChange(option);
    setQuery(option);
    setOpen(false);
    if (navigate) {
      const section = optionSubmenus?.[option];
      if (section && !shouldDeferNavigation?.(option, section)) onNavigate?.(section);
    }
  }

  if (display === "cards") {
    return (
      <div className="grid sm:grid-cols-2 gap-2.5">
        {options.map((option) => {
          const selected = option === value;
          const destination = optionSubmenus?.[option];
          const deferredNavigation = destination ? shouldDeferNavigation?.(option, destination) : false;
          return (
            <button
              key={option}
              type="button"
              onClick={() => choose(option, true)}
              className="min-h-20 rounded-2xl border p-3.5 text-left flex items-center gap-3 transition-all"
              style={{
                ...style,
                borderColor: selected ? "#f59e0b" : style?.borderColor,
                background: selected ? "rgba(245,158,11,0.11)" : style?.background,
                boxShadow: selected ? "0 0 0 2px rgba(245,158,11,0.1)" : "none",
              }}
            >
              <span className="w-10 h-10 rounded-xl grid place-items-center shrink-0" style={{ color: selected ? "#f59e0b" : style?.color, background: selected ? "rgba(245,158,11,0.14)" : "rgba(148,163,184,0.1)" }}>
                <Iconify IconString={selected ? "solar:check-circle-bold-duotone" : "solar:box-minimalistic-linear"} Size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className={`${featured ? "text-base" : "text-sm"} block font-black wrap-break-word`} style={{ color: style?.color }}>{option}</span>
                <span className="block mt-1 text-[11px] leading-4 opacity-60 wrap-break-word" style={{ color: style?.color }}>
                  {destination
                    ? deferredNavigation ? "Mostrar campos relacionados" : `Abrir submenu ${destination}`
                    : "Seleccionar esta opcion"}
                </span>
              </span>
              <Iconify IconString={deferredNavigation ? "solar:document-add-bold-duotone" : "solar:alt-arrow-right-linear"} Size={17} Style={{ color: selected ? "#f59e0b" : style?.color, opacity: selected ? 1 : 0.45 }} />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative rounded-2xl border" style={style}>
      <Iconify IconString="solar:magnifer-linear" Size={17} Style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.55, pointerEvents: "none" }} />
      <input
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        autoComplete="off"
        value={query}
        placeholder="Buscar o seleccionar"
        onFocus={(event) => {
          setOpen(true);
          setHighlightedIndex(Math.max(0, options.indexOf(value)));
          event.currentTarget.select();
        }}
        onChange={(event) => {
          setQuery(event.target.value);
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
            if (option) choose(option);
          }
          if (event.key === "Escape") {
            setOpen(false);
            setQuery(value);
          }
        }}
        className={`w-full bg-transparent pl-11 pr-11 outline-none font-bold cursor-default ${featured ? "py-4 text-base" : "py-3 text-sm"}`}
        style={{ color: style?.color }}
      />
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl grid place-items-center"
        style={{ color: style?.color }}
        title={open ? "Cerrar opciones" : "Abrir opciones"}
        tabIndex={-1}
      >
        <Iconify IconString="solar:alt-arrow-down-linear" Size={17} Style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 160ms ease" }} />
      </button>

      {open && (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-90 max-h-64 overflow-y-auto rounded-2xl border p-1.5 shadow-2xl"
          style={{ background: style?.color === "#fff" || style?.color === "#ffffff" ? "#111827" : "#ffffff", borderColor: style?.borderColor, color: style?.color }}
        >
          <SimpleBar
          className="submenu-simplebar"
          style={{ maxHeight: "6rem" }}
          autoHide={false}
        >
          <div className="p-1.5">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-5 text-center text-xs font-bold opacity-60">No hay coincidencias</div>
          ) : filteredOptions.map((option, index) => {
            const selected = option === value;
            const highlighted = index === highlightedIndex;
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  choose(option);
                }}
                className="w-full rounded-xl px-3 py-3 text-left flex items-center gap-2.5 mt-1 "
                style={{ background: selected || highlighted ? "rgba(245,158,11,0.13)" : "transparent" }}
              >
                <Iconify IconString={selected ? "solar:check-circle-bold-duotone" : "solar:circle-linear"} Size={18} Style={{ color: selected ? "#f59e0b" : style?.color, opacity: selected ? 1 : 0.35 }} />
                <span className="text-sm font-black wrap-break-word">{option}</span>
              </button>
            );
          })}
          </div>
          </SimpleBar>
        </div>
      )}
    </div>
    
  );
}

