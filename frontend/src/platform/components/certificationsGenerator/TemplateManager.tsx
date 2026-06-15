import { useState } from "react";
import { motion } from "framer-motion";
import Iconify from "../../../components/modularUI/IconsMock";
import AdminButton from "../AdminButton";
import { createTemplateFromFile } from "./fileParsers";
import type { CertificateTemplate, ThemeAwareProps } from "./types";
import { cardStyle, FIELD_CLASS, inputStyle, mutedText, strongText, subtleBorder } from "./ui";

interface TemplateManagerProps extends ThemeAwareProps {
  activeTemplate: CertificateTemplate | null;
  templates: CertificateTemplate[];
  onAddTemplate: (template: CertificateTemplate) => void;
  onSelectTemplate: (template: CertificateTemplate) => void;
  onRemoveTemplate: (templateId: string) => void;
}

export default function TemplateManager({
  activeTemplate,
  templates,
  onAddTemplate,
  onSelectTemplate,
  onRemoveTemplate,
  isDark,
}: TemplateManagerProps) {
  const [templateName, setTemplateName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    setLoading(true);
    try {
      const template = await createTemplateFromFile(file, templateName);
      onAddTemplate(template);
      setTemplateName("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo cargar la plantilla.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(280px,380px)_1fr]">
      <section className="rounded-2xl border p-5" style={cardStyle(isDark)}>
        <div className="mb-4">
          <h2 className="text-base font-black" style={{ color: strongText(isDark) }}>
            Nueva plantilla
          </h2>
          <p className="mt-1 text-xs font-medium" style={{ color: mutedText(isDark) }}>
            Importa un PDF, PNG o JPG disenado previamente.
          </p>
        </div>

        <label className="mb-3 block text-xs font-black" style={{ color: mutedText(isDark) }}>
          Nombre de la plantilla
        </label>
        <input
          value={templateName}
          onChange={(event) => setTemplateName(event.target.value)}
          placeholder="Certificado taller 2026"
          className={`${FIELD_CLASS} mb-4`}
          style={inputStyle(isDark)}
        />

        <label
          className="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-5 text-center transition"
          style={{ borderColor: subtleBorder(isDark), background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc" }}
        >
          <input
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/webp"
            className="hidden"
            disabled={loading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
              event.currentTarget.value = "";
            }}
          />
          <Iconify Size={42} IconString="solar:cloud-upload-bold-duotone" Style={{ color: "#f59e0b" }} />
          <p className="mt-3 text-sm font-black" style={{ color: strongText(isDark) }}>
            {loading ? "Procesando plantilla..." : "Subir background"}
          </p>
          <p className="mt-1 max-w-64 text-xs" style={{ color: mutedText(isDark) }}>
            El primer plano del PDF se convierte en una imagen editable para previsualizar y exportar.
          </p>
        </label>
      </section>

      <section className="rounded-2xl border p-5" style={cardStyle(isDark)}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black" style={{ color: strongText(isDark) }}>
              Plantillas guardadas
            </h2>
            <p className="mt-1 text-xs font-medium" style={{ color: mutedText(isDark) }}>
              {templates.length} disponibles en este navegador.
            </p>
          </div>
          {activeTemplate && (
            <span className="rounded-xl px-3 py-1 text-xs font-black" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
              {activeTemplate.name}
            </span>
          )}
        </div>

        {templates.length === 0 ? (
          <div className="rounded-2xl border px-4 py-12 text-center" style={{ borderColor: subtleBorder(isDark) }}>
            <p className="text-sm font-black" style={{ color: strongText(isDark) }}>
              No hay plantillas guardadas
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => (
              <motion.article
                key={template.id}
                layout
                className="overflow-hidden rounded-2xl border"
                style={{ borderColor: subtleBorder(isDark), background: isDark ? "rgba(255,255,255,0.02)" : "#ffffff" }}
              >
                <button type="button" className="block aspect-[1.414/1] w-full overflow-hidden" onClick={() => onSelectTemplate(template)}>
                  <img src={template.previewUrl} alt={template.name} className="h-full w-full object-cover" />
                </button>
                <div className="p-3">
                  <p className="truncate text-sm font-black" style={{ color: strongText(isDark) }}>
                    {template.name}
                  </p>
                  <p className="truncate text-[11px]" style={{ color: mutedText(isDark) }}>
                    {template.fileName}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <AdminButton size="sm" variant="ghost" icon="solar:check-circle-bold-duotone" onClick={() => onSelectTemplate(template)}>
                      Usar
                    </AdminButton>
                    <button
                      type="button"
                      title="Eliminar plantilla"
                      onClick={() => onRemoveTemplate(template.id)}
                      className="ml-auto flex h-8 w-8 items-center justify-center rounded-xl border"
                      style={{ borderColor: "rgba(239,68,68,0.25)", color: "#ef4444" }}
                    >
                      <Iconify Size={15} IconString="solar:trash-bin-trash-bold-duotone" Style={{ color: "currentColor" }} />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
