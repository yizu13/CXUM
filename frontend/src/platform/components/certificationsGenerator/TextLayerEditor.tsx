import Iconify from "../../../components/modularUI/IconsMock";
import AdminButton from "../AdminButton";
import { parseTemplate } from "./ast";
import CertificatePreview from "./CertificatePreview";
import TypographyControls from "./TypographyControls";
import type { CertificateTemplate, DataRow, TextAreaDefinition, ThemeAwareProps } from "./types";
import { cardStyle, FIELD_CLASS, inputStyle, mutedText, strongText, subtleBorder, TOOL_BUTTON_CLASS } from "./ui";

interface TextLayerEditorProps extends ThemeAwareProps {
  template: CertificateTemplate;
  areas: TextAreaDefinition[];
  selectedArea: TextAreaDefinition | null;
  selectedAreaId: string | null;
  variables: string[];
  systemVariables: string[];
  sampleData: DataRow;
  onSelectArea: (areaId: string | null) => void;
  onUpdateArea: (areaId: string, patch: Partial<TextAreaDefinition>) => void;
  onUpdateSampleData: (data: DataRow) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function TextLayerEditor({
  template,
  areas,
  selectedArea,
  selectedAreaId,
  variables,
  systemVariables,
  sampleData,
  onSelectArea,
  onUpdateArea,
  onUpdateSampleData,
  onBack,
  onNext,
  isDark,
}: TextLayerEditorProps) {
  const ast = selectedArea ? parseTemplate(selectedArea.text) : null;

  const patchSelected = (patch: Partial<TextAreaDefinition>) => {
    if (selectedArea) onUpdateArea(selectedArea.id, patch);
  };

  const insertVariable = (variable: string) => {
    if (!selectedArea) return;
    patchSelected({ text: `${selectedArea.text}${selectedArea.text.endsWith(" ") ? "" : " "}{{${variable}}}` });
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
      <section className="space-y-4">
        <div className="rounded-2xl border p-4" style={cardStyle(isDark)}>
          <h2 className="mb-3 text-base font-black" style={{ color: strongText(isDark) }}>
            Capas de texto
          </h2>
          <div className="space-y-2">
            {areas.map((area) => (
              <button
                key={area.id}
                type="button"
                onClick={() => onSelectArea(area.id)}
                className="flex w-full items-center gap-2 rounded-xl border p-3 text-left"
                style={{
                  borderColor: selectedAreaId === area.id ? "rgba(245,158,11,0.55)" : subtleBorder(isDark),
                  color: strongText(isDark),
                  background: selectedAreaId === area.id ? "rgba(245,158,11,0.1)" : "transparent",
                }}
              >
                <Iconify Size={17} IconString="solar:text-bold-duotone" Style={{ color: "#f59e0b" }} />
                <span className="min-w-0 flex-1 truncate text-xs font-black">{area.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-4" style={cardStyle(isDark)}>
          <h3 className="mb-3 text-sm font-black" style={{ color: strongText(isDark) }}>
            Datos de preview
          </h3>
          <div className="space-y-3">
            {variables.map((variable) => (
              <label key={variable} className="block">
                <span className="mb-1 block text-xs font-black" style={{ color: mutedText(isDark) }}>
                  {variable}
                </span>
                <input
                  value={sampleData[variable] ?? ""}
                  onChange={(event) => onUpdateSampleData({ ...sampleData, [variable]: event.target.value })}
                  className={FIELD_CLASS}
                  style={inputStyle(isDark)}
                />
              </label>
            ))}
            {systemVariables.length > 0 && (
              <div className="rounded-xl border p-3" style={{ borderColor: subtleBorder(isDark), background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc" }}>
                <p className="mb-2 text-xs font-black" style={{ color: mutedText(isDark) }}>
                  Variables autogeneradas
                </p>
                <div className="space-y-2">
                  {systemVariables.map((variable) => (
                    <div key={variable}>
                      <p className="text-[11px] font-black" style={{ color: "#f59e0b" }}>
                        {`{{${variable}}}`}
                      </p>
                      <p className="truncate text-xs font-medium" style={{ color: strongText(isDark) }}>
                        {sampleData[variable]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {variables.length === 0 && systemVariables.length === 0 && (
              <p className="text-xs font-medium" style={{ color: mutedText(isDark) }}>
                Agrega variables en formato {"{{nombre}}"} para habilitar el preview personalizado.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border p-4" style={cardStyle(isDark)}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black" style={{ color: strongText(isDark) }}>
              Editor de contenido
            </h2>
            <p className="mt-1 text-xs font-medium" style={{ color: mutedText(isDark) }}>
              Escribe texto libre y variables con doble llave.
            </p>
          </div>
          <div className="flex gap-2">
            <AdminButton variant="ghost" icon="solar:alt-arrow-left-linear" onClick={onBack}>
              Areas
            </AdminButton>
            <AdminButton variant="primary" iconRight="solar:alt-arrow-right-linear" onClick={onNext}>
              Datos
            </AdminButton>
          </div>
        </div>

        {selectedArea ? (
          <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_340px]">
            <div>
              <label className="mb-2 block text-xs font-black" style={{ color: mutedText(isDark) }}>
                Texto de la capa
              </label>
              <textarea
                value={selectedArea.text}
                rows={6}
                onChange={(event) => patchSelected({ text: event.target.value })}
                className={`${FIELD_CLASS} resize-y`}
                style={inputStyle(isDark)}
              />

              <div className="mt-3 flex flex-wrap gap-2">
                {variables.map((variable) => (
                  <button
                    key={variable}
                    type="button"
                    onClick={() => insertVariable(variable)}
                    className="rounded-xl border px-3 py-1.5 text-xs font-black"
                    style={{ borderColor: subtleBorder(isDark), color: "#f59e0b" }}
                  >
                    {`{{${variable}}}`}
                  </button>
                ))}
              </div>

              {ast && ast.errors.length > 0 && (
                <div className="mt-3 rounded-xl border p-3 text-xs font-bold" style={{ borderColor: "rgba(239,68,68,0.25)", color: "#ef4444" }}>
                  {ast.errors.join(" ")}
                </div>
              )}
            </div>

            <aside className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-black" style={{ color: mutedText(isDark) }}>
                  Etiqueta
                </span>
                <input value={selectedArea.label} onChange={(event) => patchSelected({ label: event.target.value })} className={FIELD_CLASS} style={inputStyle(isDark)} />
              </label>

              <div className="flex flex-wrap gap-2">
                {[
                  { value: "left", icon: "solar:align-left-bold" },
                  { value: "center", icon: "solar:align-horizontal-center-bold" },
                  { value: "right", icon: "solar:align-right-bold" },
                ].map((item) => (
                  <button key={item.value} type="button" className={TOOL_BUTTON_CLASS} onClick={() => patchSelected({ align: item.value as TextAreaDefinition["align"] })} style={{ borderColor: subtleBorder(isDark), color: selectedArea.align === item.value ? "#f59e0b" : mutedText(isDark) }}>
                    <Iconify Size={16} IconString={item.icon} Style={{ color: "currentColor" }} />
                  </button>
                ))}
              </div>

              <TypographyControls area={selectedArea} onChange={patchSelected} isDark={isDark} />
            </aside>
          </div>
        ) : (
          <div className="mb-5 rounded-2xl border p-6 text-center text-sm font-black" style={{ borderColor: subtleBorder(isDark), color: mutedText(isDark) }}>
            Selecciona un area para editar su texto.
          </div>
        )}

        <CertificatePreview template={template} areas={areas} data={sampleData} isDark={isDark} />
      </section>
    </div>
  );
}
