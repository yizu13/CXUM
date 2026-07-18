import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import SimpleBar from "simplebar-react";
import Iconify from "../../../../components/modularUI/IconsMock";
import {
  DONATION_ICON_CATALOG,
  isValidIconifyName,
  resolveDonationFormIcon,
} from "../../../donations/icons";

type IconifyPickerProps = {
  value?: string;
  onChange: (value: string) => void;
  inputStyle?: CSSProperties;
  text: string;
  muted: string;
  isDark: boolean;
};

export default function IconifyPicker({ value, onChange, inputStyle, text, muted, isDark }: IconifyPickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const draft = value ?? resolveDonationFormIcon(value);
  const normalizedDraft = draft.trim().toLowerCase();
  const validDraft = isValidIconifyName(normalizedDraft);

  useEffect(() => {
    function closeOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, []);

  useEffect(() => {
    if (open) window.setTimeout(() => searchRef.current?.focus(), 0);
  }, [open]);

  const filteredIcons = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return DONATION_ICON_CATALOG;
    return DONATION_ICON_CATALOG.filter((icon) =>
      [icon.label, icon.value, icon.category, ...icon.keywords].join(" ").toLowerCase().includes(query),
    );
  }, [search]);

  function commit(nextValue: string) {
    const normalized = nextValue.trim().toLowerCase();
    if (!isValidIconifyName(normalized)) return;
    onChange(normalized);
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="flex min-h-11 items-stretch rounded-xl border" style={inputStyle}>
        <span className="grid w-11 shrink-0 place-items-center border-r" style={{ borderColor: inputStyle?.borderColor }}>
          <Iconify IconString={validDraft ? normalizedDraft : resolveDonationFormIcon(value)} Size={23} Style={{ color: "#f59e0b" }} />
        </span>
        <input
          value={draft}
          maxLength={120}
          spellCheck={false}
          aria-label="Identificador del icono Iconify"
          placeholder="solar:heart-bold-duotone"
          onChange={(event) => {
            const nextValue = event.target.value;
            onChange(nextValue);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit(draft);
            }
          }}
          onBlur={() => commit(draft)}
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm font-bold outline-none"
          style={{ color: text }}
        />
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="grid w-11 shrink-0 place-items-center border-l transition-colors"
          style={{ color: open ? "#f59e0b" : muted, borderColor: inputStyle?.borderColor }}
          title="Abrir catalogo de Iconify"
          aria-label="Abrir catalogo de Iconify"
          aria-expanded={open}
        >
          <Iconify IconString={open ? "solar:close-circle-bold" : "solar:widget-2-bold-duotone"} Size={20} />
        </button>
      </div>

      {!validDraft && (
        <p className="mt-1.5 text-xs font-bold text-red-500">
          Usa el formato prefijo:nombre. Ejemplo: solar:heart-bold-duotone.
        </p>
      )}

      {open && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-[90] overflow-hidden rounded-xl border shadow-2xl"
          style={{
            color: text,
            borderColor: inputStyle?.borderColor,
            background: isDark ? "#111827" : "#ffffff",
          }}
        >
          <div className="border-b p-3" style={{ borderColor: inputStyle?.borderColor }}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black">Catalogo Iconify</p>
                <p className="mt-0.5 text-[11px]" style={{ color: muted }}>Selecciona una sugerencia o pega cualquier identificador de Iconify.</p>
              </div>
              <span className="shrink-0 text-[10px] font-black" style={{ color: muted }}>{filteredIcons.length} iconos</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border px-3" style={inputStyle}>
              <Iconify IconString="solar:magnifer-linear" Size={17} Style={{ color: muted }} />
              <input
                ref={searchRef}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por uso, nombre o categoria"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"
                style={{ color: text }}
              />
            </div>
          </div>

          <SimpleBar style={{ maxHeight: 300 }}>
            {filteredIcons.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3">
                {filteredIcons.map((icon) => {
                  const selected = resolveDonationFormIcon(value) === icon.value;
                  return (
                    <button
                      key={icon.value}
                      type="button"
                      onClick={() => {
                        commit(icon.value);
                        setOpen(false);
                      }}
                      className="flex min-h-16 items-center gap-2 rounded-lg border p-2 text-left transition-colors"
                      style={{
                        borderColor: selected ? "rgba(245,158,11,0.58)" : inputStyle?.borderColor,
                        background: selected
                          ? "rgba(245,158,11,0.12)"
                          : isDark ? "rgba(255,255,255,0.025)" : "#f8fafc",
                      }}
                      title={icon.value}
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ color: "#f59e0b", background: "rgba(245,158,11,0.12)" }}>
                        <Iconify IconString={icon.value} Size={21} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-black">{icon.label}</span>
                        <span className="mt-0.5 block truncate text-[10px]" style={{ color: muted }}>{icon.category}</span>
                      </span>
                      {selected && <Iconify IconString="solar:check-circle-bold" Size={15} Style={{ color: "#f59e0b", marginLeft: "auto" }} />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-8 text-center">
                <Iconify IconString="solar:magnifer-linear" Size={25} Style={{ color: muted, margin: "0 auto 8px" }} />
                <p className="text-xs font-bold" style={{ color: muted }}>No hay coincidencias en el catalogo sugerido.</p>
              </div>
            )}
          </SimpleBar>
        </div>
      )}
    </div>
  );
}
