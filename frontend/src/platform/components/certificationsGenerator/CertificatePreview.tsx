import { useEffect, useMemo, useRef, useState } from "react";
import { parseTemplate, renderTemplate } from "./ast";
import type { CertificateTemplate, DataRow, TextAreaDefinition, ThemeAwareProps } from "./types";
import { applyTextTransform, cssTextStyle } from "./typography";
import { mutedText, subtleBorder } from "./ui";

interface CertificatePreviewProps extends ThemeAwareProps {
  template: CertificateTemplate;
  areas: TextAreaDefinition[];
  data: DataRow;
}

export default function CertificatePreview({ template, areas, data, isDark }: CertificatePreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  const scale = useMemo(() => Math.min(1, Math.max(320, containerWidth - 2) / template.width), [containerWidth, template.width]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="overflow-auto rounded-2xl border" style={{ borderColor: subtleBorder(isDark) }}>
      <div
        className="relative"
        style={{
          width: template.width * scale,
          height: template.height * scale,
          background: isDark ? "#080a0f" : "#e2e8f0",
        }}
      >
        <img src={template.previewUrl} alt={template.name} className="absolute inset-0 h-full w-full object-fill" />
        {areas.map((area) => {
          if (area.areaKind === "qr") {
            return (
              <div
                key={area.id}
                className="absolute flex items-center justify-center border text-[10px] font-black"
                style={{
                  left: area.x * scale,
                  top: area.y * scale,
                  width: area.width * scale,
                  height: area.height * scale,
                  transform: `rotate(${area.rotation}deg)`,
                  transformOrigin: "top left",
                  borderColor: "rgba(15,23,42,0.35)",
                  background: "repeating-linear-gradient(45deg,#fff,#fff 6px,#e2e8f0 6px,#e2e8f0 12px)",
                  color: "#0f172a",
                }}
              >
                QR
              </div>
            );
          }
          const text = applyTextTransform(renderTemplate(parseTemplate(area.text), data), area.textTransform);
          return (
            <div
              key={area.id}
              className="absolute whitespace-pre-wrap"
              style={{
                left: area.x * scale,
                top: area.y * scale,
                width: area.width * scale,
                height: area.height * scale,
                transform: `rotate(${area.rotation}deg)`,
                transformOrigin: "top left",
                overflow: "hidden",
                ...cssTextStyle(area, scale),
              }}
            >
              {text}
            </div>
          );
        })}
        {areas.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-black" style={{ color: mutedText(isDark) }}>
            Sin areas de texto
          </div>
        )}
      </div>
    </div>
  );
}
