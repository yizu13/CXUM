import { useState } from "react";
import Iconify from "../../../components/modularUI/IconsMock";
import AdminButton from "../AdminButton";
import { parseDataFile } from "./fileParsers";
import CertificatePreview from "./CertificatePreview";
import type { CertificateTemplate, ParsedDataSet, TextAreaDefinition, ThemeAwareProps } from "./types";
import { cardStyle, mutedText, strongText, subtleBorder } from "./ui";

interface DataImportPanelProps extends ThemeAwareProps {
  template: CertificateTemplate;
  areas: TextAreaDefinition[];
  variables: string[];
  dataSet: ParsedDataSet | null;
  exporting: boolean;
  onDataSet: (dataSet: ParsedDataSet | null) => void;
  onBack: () => void;
  onExport: () => void;
}

export default function DataImportPanel({
  template,
  areas,
  variables,
  dataSet,
  exporting,
  onDataSet,
  onBack,
  onExport,
  isDark,
}: DataImportPanelProps) {
  const [loading, setLoading] = useState(false);
  const firstRow = dataSet?.rows[0] ?? {};
  const canExport = Boolean(dataSet && dataSet.rows.length > 0 && dataSet.errors.length === 0);

  const handleFile = async (file: File) => {
    setLoading(true);
    try {
      onDataSet(await parseDataFile(file, variables));
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo leer el banco de datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[390px_1fr]">
      <section className="space-y-4">
        <div className="rounded-2xl border p-5" style={cardStyle(isDark)}>
          <h2 className="text-base font-black" style={{ color: strongText(isDark) }}>
            Banco de datos
          </h2>
          <p className="mt-1 text-xs font-medium" style={{ color: mutedText(isDark) }}>
            XLSM, CSV o JSON deben incluir columnas con los mismos nombres de variables.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {variables.map((variable) => (
              <span key={variable} className="rounded-xl px-2.5 py-1 text-xs font-black" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
                {variable}
              </span>
            ))}
            {variables.length === 0 && (
              <span className="text-xs font-bold" style={{ color: "#ef4444" }}>
                No hay variables en las capas de texto.
              </span>
            )}
          </div>

          <label
            className="mt-5 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-5 text-center"
            style={{ borderColor: subtleBorder(isDark), background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc" }}
          >
            <input
              type="file"
              accept=".xls,.xlsx,.xlsm,.csv,.json,application/json,text/csv"
              className="hidden"
              disabled={loading || variables.length === 0}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
                event.currentTarget.value = "";
              }}
            />
            <Iconify Size={40} IconString="solar:database-bold-duotone" Style={{ color: "#f59e0b" }} />
            <p className="mt-3 text-sm font-black" style={{ color: strongText(isDark) }}>
              {loading ? "Validando datos..." : "Subir banco de datos"}
            </p>
            <p className="mt-1 text-xs" style={{ color: mutedText(isDark) }}>
              En JSON tambien se acepta {"{ \"nombre\": [\"Ana\", \"Luis\"] }"}.
            </p>
          </label>
        </div>

        {dataSet && (
          <div className="rounded-2xl border p-5" style={cardStyle(isDark)}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black" style={{ color: strongText(isDark) }}>
                  {dataSet.fileName}
                </h3>
                <p className="text-xs" style={{ color: mutedText(isDark) }}>
                  {dataSet.rows.length} registros detectados
                </p>
              </div>
              <button type="button" onClick={() => onDataSet(null)} className="rounded-xl border px-3 py-1.5 text-xs font-black" style={{ borderColor: subtleBorder(isDark), color: mutedText(isDark) }}>
                Limpiar
              </button>
            </div>

            {dataSet.errors.length > 0 ? (
              <div className="space-y-2">
                {dataSet.errors.map((error) => (
                  <p key={error} className="rounded-xl border p-3 text-xs font-bold" style={{ borderColor: "rgba(239,68,68,0.25)", color: "#ef4444" }}>
                    {error}
                  </p>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border p-3 text-xs font-bold" style={{ borderColor: "rgba(34,197,94,0.25)", color: "#22c55e" }}>
                Validacion completada. Todas las variables requeridas estan presentes.
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <AdminButton variant="ghost" icon="solar:alt-arrow-left-linear" onClick={onBack} fullWidth>
            Texto
          </AdminButton>
          <AdminButton variant="primary" icon="solar:archive-up-bold-duotone" onClick={onExport} disabled={!canExport || exporting} loading={exporting} loadingText="Exportando..." fullWidth>
            Exportar
          </AdminButton>
        </div>
      </section>

      <section className="rounded-2xl border p-4" style={cardStyle(isDark)}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black" style={{ color: strongText(isDark) }}>
              Preview del primer registro
            </h2>
            <p className="mt-1 text-xs font-medium" style={{ color: mutedText(isDark) }}>
              Confirma visualmente el mapeo antes de exportar.
            </p>
          </div>
        </div>

        <CertificatePreview template={template} areas={areas} data={firstRow} isDark={isDark} />

        {dataSet && dataSet.rows.length > 0 && (
          <div className="mt-4 overflow-auto rounded-2xl border" style={{ borderColor: subtleBorder(isDark) }}>
            <table className="min-w-full text-left text-xs">
              <thead style={{ background: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc", color: mutedText(isDark) }}>
                <tr>
                  {dataSet.variables.map((variable) => (
                    <th key={variable} className="px-3 py-2 font-black">{variable}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ color: strongText(isDark) }}>
                {dataSet.rows.slice(0, 5).map((row, index) => (
                  <tr key={index} className="border-t" style={{ borderColor: subtleBorder(isDark) }}>
                    {dataSet.variables.map((variable) => (
                      <td key={variable} className="max-w-44 truncate px-3 py-2">{row[variable]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
