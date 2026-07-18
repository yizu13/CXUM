import { motion } from "framer-motion";
import Iconify from "../../../../components/modularUI/IconsMock";
import type { bucketTabObject } from "../types";
import type { DonationResponse } from "../../../donations/types";

export default function BucketTab({ renderFilters, cardStyle, text, muted, selectedResponses, selectedForm, inputStyle, bucketPage, refreshResponses, setBucketPage } : bucketTabObject ){
      const bucketPageSize = 20;

      const pagedResponses = selectedResponses.slice((bucketPage - 1) * bucketPageSize, bucketPage * bucketPageSize);

      const bucketPageCount = Math.max(1, Math.ceil(selectedResponses.length / bucketPageSize));

    function exportCsv() {
    if (!selectedForm) return;
    const headers = ["Fecha", "Identificador", "Fuente", "Dispositivo", "Lugar", ...selectedForm.fields.map((field) => field.label)];
    const rows = selectedResponses.map((response) => [
      new Date(response.submittedAt).toLocaleString("es-DO"),
      response.respondentLabel ?? "No especificado",
      response.source,
      response.device ?? "unknown",
      response.locationLabel,
      ...selectedForm.fields.map((field) => String(response.values[field.id] ?? "")),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedForm.slug}-respuestas.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
    
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {renderFilters()}
          <div className="rounded-2xl border overflow-hidden" style={cardStyle}>
            <div className="p-4 flex items-center justify-between gap-3 border-b" style={{ borderColor: cardStyle.borderColor }}>
              <div>
                <h2 className="font-black" style={{ color: text }}>Bucket de datos</h2>
                <p className="text-xs" style={{ color: muted }}>Detalle de quien lleno el formulario, fuente, fecha, lugar y campos dinamicos.</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={refreshResponses} className="px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5" style={{ color: "#3b82f6", background: "rgba(59,130,246,0.12)" }}>
                  <Iconify IconString="solar:refresh-bold-duotone" Size={15} />
                  Refrescar
                </button>
                <button onClick={exportCsv} className="px-3 py-2 rounded-xl text-xs font-black text-white flex items-center gap-1.5" style={{ background: "#22c55e" }}>
                  <Iconify IconString="solar:download-bold-duotone" Size={15} />
                  CSV
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr style={{ color: muted }}>
                    <th className="text-left px-4 py-3 font-black">Fecha</th>
                    <th className="text-left px-4 py-3 font-black">Identificador</th>
                    <th className="text-left px-4 py-3 font-black">Fuente</th>
                    <th className="text-left px-4 py-3 font-black">Dispositivo</th>
                    <th className="text-left px-4 py-3 font-black">Lugar</th>
                    {selectedForm.fields.map((field) => (
                      <th key={field.id} className="text-left px-4 py-3 font-black whitespace-nowrap">{field.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedResponses.map((response: DonationResponse) => (
                    <tr key={response.id} className="border-t" style={{ borderColor: cardStyle.borderColor, color: text }}>
                      <td className="px-4 py-3 whitespace-nowrap">{new Date(response.submittedAt).toLocaleString("es-DO")}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-bold">{response.respondentLabel ?? "No especificado"}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-lg text-xs font-black" style={{ color: "#f59e0b", background: "rgba(245,158,11,0.12)" }}>
                          {response.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{response.device ?? "unknown"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{response.locationLabel}</td>
                      {selectedForm.fields.map((field) => (
                        <td key={field.id} className="px-4 py-3 whitespace-nowrap">{String(response.values[field.id] ?? "-")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {selectedResponses.length === 0 && (
                <div className="p-8 text-center text-sm font-bold" style={{ color: muted }}>
                  No hay respuestas con los filtros actuales.
                </div>
              )}
            </div>
            {selectedResponses.length > 0 && (
              <div className="p-3 border-t flex items-center justify-between gap-3" style={{ borderColor: cardStyle.borderColor }}>
                <span className="text-xs font-bold" style={{ color: muted }}>
                  Pagina {bucketPage} de {bucketPageCount} · {selectedResponses.length} registros
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={bucketPage === 1}
                    onClick={() => setBucketPage((page) => Math.max(1, page - 1))}
                    className="w-9 h-9 rounded-xl border grid place-items-center disabled:opacity-40"
                    style={inputStyle}
                    title="Pagina anterior"
                  >
                    <Iconify IconString="solar:alt-arrow-left-linear" Size={17} />
                  </button>
                  <button
                    type="button"
                    disabled={bucketPage === bucketPageCount}
                    onClick={() => setBucketPage((page) => Math.min(bucketPageCount, page + 1))}
                    className="w-9 h-9 rounded-xl border grid place-items-center disabled:opacity-40"
                    style={inputStyle}
                    title="Pagina siguiente"
                  >
                    <Iconify IconString="solar:alt-arrow-right-linear" Size={17} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
    )
}