import Iconify from "../../../components/modularUI/IconsMock";
import type { CertificateGeneration, ThemeAwareProps } from "./types";
import { cardStyle, mutedText, strongText, subtleBorder } from "./ui";

interface GenerationsPanelProps extends ThemeAwareProps {
  generations: CertificateGeneration[];
  onDelete: (generationId: string) => void;
  onDownload: (generation: CertificateGeneration) => void;
}

export default function GenerationsPanel({ generations, onDelete, onDownload, isDark }: GenerationsPanelProps) {
  return (
    <section className="rounded-2xl border p-5" style={cardStyle(isDark)}>
      <div className="mb-5">
        <h2 className="text-base font-black" style={{ color: strongText(isDark) }}>
          Generaciones masivas
        </h2>
        <p className="mt-1 text-xs font-medium" style={{ color: mutedText(isDark) }}>
          Cada exportacion queda agrupada por plantilla, id y fecha.
        </p>
      </div>

      {generations.length === 0 ? (
        <div className="rounded-2xl border px-4 py-14 text-center" style={{ borderColor: subtleBorder(isDark) }}>
          <Iconify Size={44} IconString="solar:archive-bold-duotone" Style={{ color: isDark ? "rgba(255,255,255,0.18)" : "#cbd5e1" }} />
          <p className="mt-3 text-sm font-black" style={{ color: mutedText(isDark) }}>
            Aun no hay generaciones
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {generations.map((generation) => (
            <article key={generation.id} className="rounded-2xl border p-4" style={{ borderColor: subtleBorder(isDark), background: isDark ? "rgba(255,255,255,0.02)" : "#ffffff" }}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: generation.status === "ready" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)" }}>
                  <Iconify Size={22} IconString={generation.status === "ready" ? "solar:check-circle-bold-duotone" : "solar:danger-triangle-bold-duotone"} Style={{ color: generation.status === "ready" ? "#22c55e" : "#ef4444" }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black" style={{ color: strongText(isDark) }}>
                    {generation.templateName}
                  </p>
                  <p className="truncate text-xs" style={{ color: mutedText(isDark) }}>
                    {generation.bucketPrefix}
                  </p>
                  <p className="mt-1 text-[11px]" style={{ color: mutedText(isDark) }}>
                    {new Date(generation.createdAt).toLocaleString("es-DO")} · {generation.records} certificados
                  </p>
                  {generation.hasDigitalCertificates && (
                    <p className="mt-1 text-[11px] font-black" style={{ color: "#22c55e" }}>
                      {generation.digitalCount ?? generation.records} versiones digitales con QR
                    </p>
                  )}
                  {generation.error && <p className="mt-1 text-xs font-bold text-red-500">{generation.error}</p>}
                </div>
                <div className="flex gap-2">
                  {(generation.downloadUrl || generation.downloadKey) && (
                    <button type="button" onClick={() => onDownload(generation)} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black text-white" style={{ background: "linear-gradient(135deg, #f59e0b, #fb923c)" }}>
                      <Iconify Size={15} IconString="solar:download-bold-duotone" Style={{ color: "#fff" }} />
                      Descargar
                    </button>
                  )}
                  <button type="button" onClick={() => onDelete(generation.id)} className="flex h-9 w-9 items-center justify-center rounded-xl border" style={{ borderColor: "rgba(239,68,68,0.25)", color: "#ef4444" }} title="Eliminar generacion">
                    <Iconify Size={16} IconString="solar:trash-bin-trash-bold-duotone" Style={{ color: "currentColor" }} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
