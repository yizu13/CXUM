import Iconify from "../../../components/modularUI/IconsMock";
import type { TextAreaDefinition, ThemeAwareProps } from "./types";
import { TYPOGRAPHY_PRESETS, fontStyleFor } from "./typography";
import { FIELD_CLASS, inputStyle, mutedText, strongText, subtleBorder, TOOL_BUTTON_CLASS } from "./ui";

interface TypographyControlsProps extends ThemeAwareProps {
  area: TextAreaDefinition;
  onChange: (patch: Partial<TextAreaDefinition>) => void;
}

const FONT_SIZES = [14, 16, 18, 20, 24, 30, 36, 44, 56, 72, 88];
const FONT_FAMILIES = [
  { label: "Sans moderna", value: "Inter, Arial, Helvetica, sans-serif" },
  { label: "Serif clasica", value: "Georgia, 'Times New Roman', serif" },
  { label: "Serif lujo", value: "Didot, 'Bodoni 72', 'Baskerville', Georgia, serif" },
  { label: "Firma elegante", value: "'Brush Script MT', 'Segoe Script', 'Lucida Handwriting', cursive" },
  { label: "Manuscrita formal", value: "'Segoe Script', 'Lucida Handwriting', cursive" },
  { label: "Monoespaciada", value: "'Courier New', Consolas, monospace" },
  { label: "Condensada", value: "'Arial Narrow', Arial, sans-serif" },
];

export default function TypographyControls({ area, onChange, isDark }: TypographyControlsProps) {
  const setStyleFlag = (key: "isBold" | "isItalic" | "isUnderline" | "isStrikethrough") => {
    const next = { [key]: !area[key] } as Partial<TextAreaDefinition>;
    const preview = { ...area, ...next };
    onChange({ ...next, fontStyle: fontStyleFor(preview) });
  };

  const applyPreset = (presetId: string) => {
    const preset = TYPOGRAPHY_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    const next = { ...preset.patch, typographyPreset: preset.id };
    onChange({ ...next, fontStyle: fontStyleFor({ ...area, ...next }) });
  };

  return (
    <div className="space-y-4">
      <section>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="text-xs font-black uppercase" style={{ color: mutedText(isDark) }}>
            Presets
          </h3>
          <span className="text-[10px] font-bold" style={{ color: mutedText(isDark) }}>
            2-3 fuentes max.
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {TYPOGRAPHY_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className="rounded-xl border p-3 text-left transition"
              style={{
                borderColor: area.typographyPreset === preset.id ? "rgba(245,158,11,0.55)" : subtleBorder(isDark),
                background: area.typographyPreset === preset.id ? "rgba(245,158,11,0.1)" : "transparent",
              }}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-xs font-black" style={{ color: strongText(isDark), fontFamily: preset.patch.fontFamily }}>
                  {preset.name}
                </span>
                <span className="rounded-lg px-2 py-0.5 text-[10px] font-black" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
                  {preset.category}
                </span>
              </span>
              <span className="mt-1 block text-[11px]" style={{ color: mutedText(isDark) }}>
                {preset.description}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2">
        <label className="col-span-2 block">
          <span className="mb-1 block text-xs font-black" style={{ color: mutedText(isDark) }}>
            Fuente
          </span>
          <select value={area.fontFamily} onChange={(event) => onChange({ fontFamily: event.target.value })} className={FIELD_CLASS} style={inputStyle(isDark)}>
            {FONT_FAMILIES.map((font) => (
              <option key={font.label} value={font.value}>{font.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-black" style={{ color: mutedText(isDark) }}>
            Tamano
          </span>
          <select value={area.fontSize} onChange={(event) => onChange({ fontSize: Number(event.target.value) })} className={FIELD_CLASS} style={inputStyle(isDark)}>
            {FONT_SIZES.map((size) => (
              <option key={size} value={size}>{size}px</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-black" style={{ color: mutedText(isDark) }}>
            Color
          </span>
          <input type="color" value={area.fill} onChange={(event) => onChange({ fill: event.target.value })} className="h-10 w-full rounded-xl border p-1" style={inputStyle(isDark)} />
        </label>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-black uppercase" style={{ color: mutedText(isDark) }}>
          Formato
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "isBold", icon: "solar:text-bold-bold", label: "Negrita" },
            { key: "isItalic", icon: "solar:text-italic-bold", label: "Cursiva" },
            { key: "isUnderline", icon: "solar:text-underline-bold", label: "Subrayado" },
            { key: "isStrikethrough", icon: "solar:text-cross-bold", label: "Tachado" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              title={item.label}
              className={TOOL_BUTTON_CLASS}
              onClick={() => setStyleFlag(item.key as "isBold" | "isItalic" | "isUnderline" | "isStrikethrough")}
              style={{ borderColor: subtleBorder(isDark), color: area[item.key as keyof TextAreaDefinition] ? "#f59e0b" : mutedText(isDark) }}
            >
              <Iconify Size={16} IconString={item.icon} Style={{ color: "currentColor" }} />
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-xs font-black" style={{ color: mutedText(isDark) }}>
            Transformacion
          </span>
          <select value={area.textTransform ?? "none"} onChange={(event) => onChange({ textTransform: event.target.value as TextAreaDefinition["textTransform"] })} className={FIELD_CLASS} style={inputStyle(isDark)}>
            <option value="none">Normal</option>
            <option value="uppercase">MAYUSCULAS</option>
            <option value="capitalize">Capitalizar</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-black" style={{ color: mutedText(isDark) }}>
            Opacidad
          </span>
          <input type="number" min={0.05} max={1} step={0.05} value={area.opacity ?? 1} onChange={(event) => onChange({ opacity: Number(event.target.value) })} className={FIELD_CLASS} style={inputStyle(isDark)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-black" style={{ color: mutedText(isDark) }}>
            Letras
          </span>
          <input type="number" min={-1} max={8} step={0.2} value={area.letterSpacing} onChange={(event) => onChange({ letterSpacing: Number(event.target.value) })} className={FIELD_CLASS} style={inputStyle(isDark)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-black" style={{ color: mutedText(isDark) }}>
            Lineas
          </span>
          <input type="number" min={0.8} max={2.2} step={0.05} value={area.lineHeight} onChange={(event) => onChange({ lineHeight: Number(event.target.value) })} className={FIELD_CLASS} style={inputStyle(isDark)} />
        </label>
      </section>

      <section className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-xs font-black" style={{ color: mutedText(isDark) }}>
            Contorno
          </span>
          <input type="number" min={0} max={6} step={0.25} value={area.strokeWidth ?? 0} onChange={(event) => onChange({ strokeWidth: Number(event.target.value) })} className={FIELD_CLASS} style={inputStyle(isDark)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-black" style={{ color: mutedText(isDark) }}>
            Color borde
          </span>
          <input type="color" value={area.stroke ?? "#111827"} onChange={(event) => onChange({ stroke: event.target.value })} className="h-10 w-full rounded-xl border p-1" style={inputStyle(isDark)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-black" style={{ color: mutedText(isDark) }}>
            Sombra
          </span>
          <input type="number" min={0} max={12} step={0.5} value={area.shadowBlur ?? 0} onChange={(event) => onChange({ shadowBlur: Number(event.target.value) })} className={FIELD_CLASS} style={inputStyle(isDark)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-black" style={{ color: mutedText(isDark) }}>
            Color sombra
          </span>
          <input type="color" value={area.shadowColor ?? "#000000"} onChange={(event) => onChange({ shadowColor: event.target.value })} className="h-10 w-full rounded-xl border p-1" style={inputStyle(isDark)} />
        </label>
      </section>
    </div>
  );
}
