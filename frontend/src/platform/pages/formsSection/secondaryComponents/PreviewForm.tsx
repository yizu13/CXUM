import Iconify from "../../../../components/modularUI/IconsMock";
import LogoCXUM from "../../../../assets/logoCXUM.png";

import type { previewFormObject } from "../types";
import { enqueueSnackbar } from "notistack";
import { motion } from "framer-motion";
import type { DonationField } from "../../../donations/types";
import { formatDonationDate } from "../../../donations/dates";
import { resolveDonationFormIcon } from "../../../donations/icons";


export default function PreviewForm({ cardStyle, inputStyle, text, muted, selectedForm, qrDataUrl, previewSteps, previewStep, previewPrimaryField, isDark, renderPreviewField, setPreviewStep, previewGroupedFields }: previewFormObject) {

      const publicUrl = selectedForm ? `${window.location.origin}/formularios/${selectedForm.slug}?source=link` : "";
      const previewActiveStep = previewSteps?.[Math.min(previewStep, Math.max(0, previewSteps.length - 1))];



      function copyLink() {
        navigator.clipboard.writeText(publicUrl);
        enqueueSnackbar("Link copiado", { variant: "success" });
      }
    
      function downloadQr() {
        if (!selectedForm || !qrDataUrl) return;
        const canvas = document.createElement("canvas");
        canvas.width = 720;
        canvas.height = 720;
        const context = canvas.getContext("2d");
        if (!context) return;
    
        const qrImage = new Image();
        const logoImage = new Image();
        qrImage.onload = () => {
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(qrImage, 0, 0, canvas.width, canvas.height);
          logoImage.onload = () => {
            const size = 132;
            const x = (canvas.width - size) / 2;
            const y = (canvas.height - size) / 2;
            context.fillStyle = "#ffffff";
            context.beginPath();
            context.roundRect(x - 12, y - 12, size + 24, size + 24, 28);
            context.fill();
            context.drawImage(logoImage, x, y, size, size);
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = `${selectedForm.slug}-qr.png`;
            link.click();
          };
          logoImage.src = LogoCXUM;
        };
        qrImage.src = qrDataUrl;
      }
      
    return(
        <aside className="space-y-4 xl:sticky xl:top-4">
            <div className="rounded-2xl border p-5" style={cardStyle}>
              <h2 className="font-black mb-1" style={{ color: text }}>Acceso publico</h2>
              <p className="text-xs mb-4" style={{ color: muted }}>Link unico y QR visual con el logo al centro.</p>
              <div className="relative mx-auto w-56 h-56 rounded-2xl bg-white p-3">
                {qrDataUrl && <img src={qrDataUrl} alt="QR del formulario" className="w-full h-full" />}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center p-2">
                    <img src={LogoCXUM} alt="CXUM" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
              <button onClick={copyLink} className="w-full mt-4 py-2.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2" style={{ background: "#f59e0b" }}>
                <Iconify IconString="solar:copy-bold-duotone" Size={17} />
                Copiar link
              </button>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button onClick={downloadQr} className="py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5" style={{ color: "#22c55e", background: "rgba(34,197,94,0.12)" }}>
                  <Iconify IconString="solar:download-bold-duotone" Size={15} />
                  QR PNG
                </button>
                <a href={publicUrl} target="_blank" rel="noreferrer" className="py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5" style={{ color: "#3b82f6", background: "rgba(59,130,246,0.12)" }}>
                  <Iconify IconString="solar:arrow-right-up-linear" Size={15} />
                  Abrir
                </a>
              </div>
              <a href={publicUrl} target="_blank" rel="noreferrer" className="block mt-2 text-xs font-bold truncate text-center" style={{ color: muted }}>
                {publicUrl}
              </a>
            </div>

            <div className="rounded-2xl border p-4" style={cardStyle}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-black" style={{ color: text }}>Vista previa del frontoffice</h2>
                  <p className="text-xs mt-1 leading-5" style={{ color: muted }}>Replica el encabezado, los controles y la navegacion que vera la persona.</p>
                </div>
                <span className="text-[10px] font-black px-2 py-1 rounded-lg shrink-0" style={{ color: "#f59e0b", background: "rgba(245,158,11,0.12)" }}>
                  {selectedForm.mode === "guided" ? "Guiado" : "Plano"}
                </span>
              </div>

              <div className="rounded-3xl border" style={{ borderColor: cardStyle.borderColor, background: cardStyle.background }}>
                <div className="p-5 border-b" style={{ borderColor: cardStyle.borderColor }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: "#f59e0b" }}>Registro de formulario</span>
                      <h3 className="text-2xl font-black tracking-tight mt-2 wrap-break-word" style={{ color: text }}>{selectedForm.title}</h3>
                      {selectedForm.eventDate && (
                        <p className="inline-flex items-center gap-1.5 text-[11px] font-black mt-2" style={{ color: "#f59e0b" }}>
                          <Iconify IconString="solar:calendar-date-bold-duotone" Size={14} />
                          {formatDonationDate(selectedForm.eventDate)}
                        </p>
                      )}
                      <p className="text-xs mt-2 leading-5" style={{ color: muted }}>{selectedForm.description}</p>
                    </div>
                    <span className="grid w-10 h-10 sm:w-11 sm:h-11 rounded-2xl place-items-center shrink-0" style={{ background: "rgba(245,158,11,0.14)", border: "1px solid rgba(245,158,11,0.24)" }}>
                      <Iconify IconString={resolveDonationFormIcon(selectedForm.headerIcon)} Size={23} Style={{ color: "#f59e0b" }} />
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  {selectedForm.mode === "guided" && previewActiveStep ? (
                    <>
                      <div>
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <span className="text-xs font-black" style={{ color: "#f59e0b" }}>Paso {previewStep + 1} de {previewSteps?.length}</span>
                          <span className="text-xs font-bold truncate" style={{ color: muted }}>{previewActiveStep?.title}</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)" }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${((previewStep + 1) / previewSteps?.length) * 100}%`, background: "#f59e0b" }} />
                        </div>
                      </div>

                      <motion.section
                        key={previewActiveStep.key}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="rounded-2xl border p-4 space-y-4"
                        style={{ borderColor: previewStep === 0 && previewPrimaryField ? "rgba(245,158,11,0.28)" : cardStyle.borderColor, background: previewStep === 0 && previewPrimaryField ? "rgba(245,158,11,0.08)" : "transparent" }}
                      >
                        <div>
                          <h4 className="text-lg font-black" style={{ color: text }}>{previewActiveStep.title}</h4>
                          <p className="text-xs mt-1" style={{ color: muted }}>Completa esta etapa para continuar.</p>
                        </div>
                        <div className="grid gap-4">
                          {previewActiveStep.fields.length > 0 ? (
                            previewActiveStep.fields.map((field) => renderPreviewField(field, field.id === previewPrimaryField?.id))
                          ) : (
                            <div className="rounded-xl border border-dashed px-4 py-5 text-center text-xs font-bold" style={{ color: muted, borderColor: cardStyle.borderColor }}>
                              Esta etapa se habilitara segun las respuestas de los pasos anteriores.
                            </div>
                          )}
                        </div>
                      </motion.section>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={previewStep === 0}
                          onClick={() => setPreviewStep((step) => Math.max(0, step - 1))}
                          className="rounded-2xl py-3 text-xs font-black border flex items-center justify-center gap-1.5 disabled:opacity-40"
                          style={inputStyle}
                        >
                          <Iconify IconString="solar:alt-arrow-left-linear" Size={16} />
                          Anterior
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewStep((step: number) => Math.min(previewSteps.length - 1, step + 1))}
                          className="rounded-2xl py-3 text-xs font-black text-white flex items-center justify-center gap-1.5"
                          style={{ background: previewStep === previewSteps.length - 1 ? "linear-gradient(135deg, #ef4444, #f59e0b)" : "#f59e0b" }}
                        >
                          {previewStep === previewSteps.length - 1 ? "Enviar" : "Continuar"}
                          <Iconify IconString={previewStep === previewSteps.length - 1 ? "solar:send-square-bold-duotone" : "solar:alt-arrow-right-linear"} Size={16} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {Object.entries(previewGroupedFields).map(([section, fields]) => (
                        <section key={section} className="space-y-4">
                          <div className="grid gap-4">{fields.map((field: DonationField) => renderPreviewField(field))}</div>
                        </section>
                      ))}
                      <button type="button" className="w-full rounded-2xl py-3 text-xs font-black text-white flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #ef4444, #f59e0b)" }}>
                        <Iconify IconString="solar:send-square-bold-duotone" Size={17} />
                        Enviar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </aside>
    )
}
