import { useEffect, useMemo, useState } from "react";
import Iconify from "../../../components/modularUI/IconsMock";
import AdminButton from "../AdminButton";
import { parseDataFile } from "./fileParsers";
import CertificatePreview from "./CertificatePreview";
import type { CertificateTemplate, DataRow, ParsedDataSet, TextAreaDefinition, ThemeAwareProps } from "./types";
import { cardStyle, FIELD_CLASS, inputStyle, mutedText, strongText, subtleBorder } from "./ui";

interface DataImportPanelProps extends ThemeAwareProps {
  template: CertificateTemplate;
  areas: TextAreaDefinition[];
  variables: string[];
  dataSet: ParsedDataSet | null;
  exporting: boolean;
  savingDesign: boolean;
  savedDesignAt: string | null;
  onDataSet: (dataSet: ParsedDataSet | null) => void;
  onSaveDesign: () => void | Promise<void>;
  onBack: () => void;
  onExport: () => void;
}

export default function DataImportPanel({
  template,
  areas,
  variables,
  dataSet,
  exporting,
  savingDesign,
  savedDesignAt,
  onDataSet,
  onSaveDesign,
  onBack,
  onExport,
  isDark,
}: DataImportPanelProps) {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"bulk" | "single">("bulk");
  const [singleData, setSingleData] = useState<DataRow>({});
  const firstRow = dataSet?.rows[0] ?? {};
  const canExport = Boolean(dataSet && dataSet.rows.length > 0 && dataSet.errors.length === 0);
  const singleErrors = useMemo(
    () => variables.filter((variable) => !(singleData[variable] ?? "").trim()),
    [singleData, variables],
  );

  useEffect(() => {
    setSingleData((current) =>
      variables.reduce<DataRow>((next, variable) => {
        next[variable] = current[variable] ?? "";
        return next;
      }, {}),
    );
  }, [variables]);

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

  const applySingleCertificate = () => {
    const rows = [variables.reduce<DataRow>((row, variable) => {
      row[variable] = singleData[variable] ?? "";
      return row;
    }, {})];

    onDataSet({
      fileName: "certificado-individual",
      variables,
      rows,
      errors: singleErrors.length > 0
        ? [`Completa los valores requeridos: ${singleErrors.join(", ")}.`]
        : [],
    });
  };

  const switchMode = (nextMode: "bulk" | "single") => {
    setMode(nextMode);
    onDataSet(null);
  };

  useEffect(() => {
    if (mode !== "single" || dataSet?.fileName !== "certificado-individual") return;
    applySingleCertificate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleData, mode]);

  return (
    <div className="grid gap-4 xl:grid-cols-[390px_1fr]">
      <section className="space-y-4">
        <div className="rounded-2xl border p-5" style={cardStyle(isDark)}>
          <div className="mb-4 flex rounded-xl border p-1" style={{ borderColor: subtleBorder(isDark), background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc" }}>
            {[
              { id: "bulk", label: "Banco de datos", icon: "solar:database-bold-duotone" },
              { id: "single", label: "Usuario especifico", icon: "solar:user-id-bold-duotone" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => switchMode(item.id as "bulk" | "single")}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-black transition"
                style={{
                  background: mode === item.id ? "linear-gradient(135deg, #f59e0b, #fb923c)" : "transparent",
                  color: mode === item.id ? "#ffffff" : mutedText(isDark),
                }}
              >
                <Iconify Size={15} IconString={item.icon} Style={{ color: "currentColor" }} />
                {item.label}
              </button>
            ))}
          </div>

          <h2 className="text-base font-black" style={{ color: strongText(isDark) }}>
            {mode === "bulk" ? "Banco de datos" : "Certificado unico"}
          </h2>
          <p className="mt-1 text-xs font-medium" style={{ color: mutedText(isDark) }}>
            {mode === "bulk"
              ? "XLSM, CSV o JSON deben incluir columnas con los mismos nombres de variables."
              : "Completa manualmente los valores para generar un solo certificado."}
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

          {mode === "bulk" ? (
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
          ) : (
            <div className="mt-5 space-y-3">
              {variables.map((variable) => (
                <label key={variable} className="block">
                  <span className="mb-1 block text-xs font-black" style={{ color: mutedText(isDark) }}>
                    {variable}
                  </span>
                  <input
                    value={singleData[variable] ?? ""}
                    onChange={(event) => setSingleData((current) => ({ ...current, [variable]: event.target.value }))}
                    className={FIELD_CLASS}
                    placeholder={`Valor para ${variable}`}
                    style={inputStyle(isDark)}
                  />
                </label>
              ))}
              {variables.length === 0 && (
                <p className="rounded-xl border p-3 text-xs font-bold" style={{ borderColor: "rgba(239,68,68,0.25)", color: "#ef4444" }}>
                  Agrega variables en la plantilla antes de crear un certificado individual.
                </p>
              )}
              <AdminButton
                variant="success"
                icon="solar:check-circle-bold-duotone"
                onClick={applySingleCertificate}
                disabled={variables.length === 0}
                fullWidth
              >
                Preparar certificado unico
              </AdminButton>
            </div>
          )}
        </div>

        {dataSet && (
          <div className="rounded-2xl border p-5" style={cardStyle(isDark)}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black" style={{ color: strongText(isDark) }}>
                  {dataSet.fileName === "certificado-individual" ? "Certificado unico" : dataSet.fileName}
                </h3>
                <p className="text-xs" style={{ color: mutedText(isDark) }}>
                  {dataSet.rows.length} {dataSet.rows.length === 1 ? "registro detectado" : "registros detectados"}
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

        <div className="grid gap-2 sm:grid-cols-3">
          <AdminButton variant="ghost" icon="solar:alt-arrow-left-linear" onClick={onBack} fullWidth>
            Texto
          </AdminButton>
          <AdminButton
            variant="success"
            icon="solar:diskette-bold-duotone"
            onClick={() => void onSaveDesign()}
            disabled={areas.length === 0 || savingDesign}
            loading={savingDesign}
            loadingText="Guardando..."
            fullWidth
          >
            Guardar modificaciones
          </AdminButton>
          <AdminButton variant="primary" icon="solar:archive-up-bold-duotone" onClick={onExport} disabled={!canExport || exporting} loading={exporting} loadingText="Exportando..." fullWidth>
            Exportar
          </AdminButton>
        </div>
        {savedDesignAt && (
          <p className="text-center text-[11px] font-bold" style={{ color: mutedText(isDark) }}>
            Modificaciones guardadas en DynamoDB {new Date(savedDesignAt).toLocaleString()}.
          </p>
        )}
      </section>

      <section className="rounded-2xl border p-4" style={cardStyle(isDark)}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black" style={{ color: strongText(isDark) }}>
              Preview del primer registro
            </h2>
            <p className="mt-1 text-xs font-medium" style={{ color: mutedText(isDark) }}>
              {mode === "single" ? "Revisa el certificado unico antes de exportar." : "Confirma visualmente el mapeo antes de exportar."}
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
