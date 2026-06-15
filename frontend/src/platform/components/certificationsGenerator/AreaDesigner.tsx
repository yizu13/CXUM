import { useEffect, useMemo, useRef, useState } from "react";
import { Image as KonvaImage, Layer, Rect, Stage, Text, Transformer } from "react-konva";
import type Konva from "konva";
import Iconify from "../../../components/modularUI/IconsMock";
import AdminButton from "../AdminButton";
import { parseTemplate, renderTemplate } from "./ast";
import type { CertificateTemplate, DataRow, TextAreaDefinition, ThemeAwareProps } from "./types";
import { applyTextTransform, fontStyleFor, normalizeAreaStyle } from "./typography";
import { cardStyle, mutedText, strongText, subtleBorder } from "./ui";

interface AreaDesignerProps extends ThemeAwareProps {
  template: CertificateTemplate;
  areas: TextAreaDefinition[];
  selectedAreaId: string | null;
  sampleData: DataRow;
  onAddArea: () => void;
  onAddQrAreaPair: () => void;
  onSelectArea: (areaId: string | null) => void;
  onUpdateArea: (areaId: string, patch: Partial<TextAreaDefinition>) => void;
  onRemoveArea: (areaId: string) => void;
  onNext: () => void;
}

export default function AreaDesigner({
  template,
  areas,
  selectedAreaId,
  sampleData,
  onAddArea,
  onAddQrAreaPair,
  onSelectArea,
  onUpdateArea,
  onRemoveArea,
  onNext,
  isDark,
}: AreaDesignerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const areaRefs = useRef<Record<string, Konva.Rect>>({});
  const [background, setBackground] = useState<HTMLImageElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(900);

  const scale = useMemo(() => {
    const available = Math.max(320, containerWidth - 2);
    return Math.min(1, available / template.width);
  }, [containerWidth, template.width]);

  useEffect(() => {
    const image = new Image();
    image.onload = () => setBackground(image);
    image.src = template.previewUrl;
  }, [template.previewUrl]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;
    const selectedNode = selectedAreaId ? areaRefs.current[selectedAreaId] : null;
    transformer.nodes(selectedNode ? [selectedNode] : []);
    transformer.getLayer()?.batchDraw();
  }, [areas, selectedAreaId]);

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_290px]">
      <section className="rounded-2xl border p-4" style={cardStyle(isDark)}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black" style={{ color: strongText(isDark) }}>
              Definicion de areas
            </h2>
            <p className="mt-1 text-xs font-medium" style={{ color: mutedText(isDark) }}>
              Mueve y redimensiona cada area sobre el background.
            </p>
          </div>
          <div className="flex gap-2">
            <AdminButton variant="ghost" icon="solar:add-square-bold-duotone" onClick={onAddArea}>
              Area
            </AdminButton>
            <AdminButton variant="ghost" icon="solar:qr-code-bold-duotone" onClick={onAddQrAreaPair}>
              QR + ID
            </AdminButton>
            <AdminButton variant="primary" iconRight="solar:alt-arrow-right-linear" disabled={areas.length === 0} onClick={onNext}>
              Editar texto
            </AdminButton>
          </div>
        </div>

        <div
          ref={containerRef}
          className="overflow-auto rounded-2xl border"
          style={{ borderColor: subtleBorder(isDark), background: isDark ? "#080a0f" : "#e2e8f0" }}
        >
          <Stage
            width={template.width * scale}
            height={template.height * scale}
            scaleX={scale}
            scaleY={scale}
            onMouseDown={(event) => {
              if (event.target === event.target.getStage()) onSelectArea(null);
            }}
            onTouchStart={(event) => {
              if (event.target === event.target.getStage()) onSelectArea(null);
            }}
          >
            <Layer>
              {background && <KonvaImage image={background} x={0} y={0} width={template.width} height={template.height} />}
              {areas.map((area) => {
                const selected = selectedAreaId === area.id;
                return (
                  <Rect
                    key={`${area.id}-box`}
                    ref={(node) => {
                      if (node) areaRefs.current[area.id] = node;
                    }}
                    x={area.x}
                    y={area.y}
                    width={area.width}
                    height={area.height}
                    rotation={area.rotation}
                    fill={selected ? "rgba(245,158,11,0.12)" : "rgba(59,130,246,0.08)"}
                    stroke={selected ? "#f59e0b" : "#3b82f6"}
                    strokeWidth={selected ? 2 : 1.2}
                    dash={selected ? undefined : [8, 6]}
                    draggable
                    onClick={() => onSelectArea(area.id)}
                    onTap={() => onSelectArea(area.id)}
                    onDragEnd={(event) => onUpdateArea(area.id, { x: event.target.x(), y: event.target.y() })}
                    onTransformEnd={(event) => {
                      const node = event.target;
                      const scaleX = node.scaleX();
                      const scaleY = node.scaleY();
                      node.scaleX(1);
                      node.scaleY(1);
                      onUpdateArea(area.id, {
                        x: node.x(),
                        y: node.y(),
                        width: Math.max(60, node.width() * scaleX),
                        height: Math.max(30, node.height() * scaleY),
                        rotation: node.rotation(),
                      });
                    }}
                  />
                );
              })}
              {areas.map((area) => {
                if (area.areaKind === "qr") {
                  return (
                    <Text
                      key={`${area.id}-text`}
                      x={area.x}
                      y={area.y + area.height / 2 - 10}
                      width={area.width}
                      height={24}
                      rotation={area.rotation}
                      text="QR"
                      fontSize={20}
                      fontStyle="bold"
                      fill="#0f172a"
                      align="center"
                      listening={false}
                    />
                  );
                }
                const normalized = normalizeAreaStyle(area);
                const text = applyTextTransform(renderTemplate(parseTemplate(area.text), sampleData), normalized.textTransform);
                return (
                  <Text
                    key={`${area.id}-text`}
                    x={area.x}
                    y={area.y + 6}
                    width={area.width}
                    height={area.height}
                    rotation={area.rotation}
                    text={text}
                    fontSize={Math.min(area.fontSize, 38)}
                    fontFamily={area.fontFamily}
                    fontStyle={fontStyleFor(area)}
                    fill={area.fill}
                    opacity={normalized.opacity}
                    align={area.align}
                    lineHeight={area.lineHeight}
                    letterSpacing={area.letterSpacing}
                    textDecoration={[normalized.isUnderline ? "underline" : "", normalized.isStrikethrough ? "line-through" : ""].filter(Boolean).join(" ")}
                    stroke={normalized.stroke}
                    strokeWidth={normalized.strokeWidth}
                    shadowColor={normalized.shadowColor}
                    shadowBlur={normalized.shadowBlur}
                    shadowOffsetX={normalized.shadowOffsetX}
                    shadowOffsetY={normalized.shadowOffsetY}
                    listening={false}
                  />
                );
              })}
              <Transformer ref={transformerRef} rotateEnabled enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right", "middle-left", "middle-right"]} />
            </Layer>
          </Stage>
        </div>
      </section>

      <aside className="rounded-2xl border p-4" style={cardStyle(isDark)}>
        <h3 className="mb-3 text-sm font-black" style={{ color: strongText(isDark) }}>
          Areas creadas
        </h3>
        <div className="space-y-2">
          {areas.map((area) => (
            <div
              key={area.id}
              onClick={() => onSelectArea(area.id)}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left"
              style={{
                borderColor: selectedAreaId === area.id ? "rgba(245,158,11,0.55)" : subtleBorder(isDark),
                background: selectedAreaId === area.id ? "rgba(245,158,11,0.1)" : "transparent",
              }}
            >
              <Iconify Size={18} IconString={area.areaKind === "qr" ? "solar:qr-code-bold-duotone" : area.areaKind === "certificateId" ? "solar:hashtag-square-bold-duotone" : "solar:text-square-bold-duotone"} Style={{ color: "#f59e0b" }} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-black" style={{ color: strongText(isDark) }}>
                  {area.label}
                </span>
                <span className="block truncate text-[11px]" style={{ color: mutedText(isDark) }}>
                  {area.areaKind === "qr" ? "Version digital" : `${area.width.toFixed(0)} x ${area.height.toFixed(0)}`}
                </span>
              </span>
              <button
                type="button"
                title="Eliminar area"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemoveArea(area.id);
                }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                style={{ color: "#ef4444" }}
              >
                <Iconify Size={14} IconString="solar:trash-bin-trash-bold-duotone" Style={{ color: "currentColor" }} />
              </button>
            </div>
          ))}
        </div>
        {areas.length === 0 && (
          <p className="rounded-xl border p-4 text-center text-xs font-medium" style={{ borderColor: subtleBorder(isDark), color: mutedText(isDark) }}>
            Crea al menos un area para poder colocar texto.
          </p>
        )}
      </aside>
    </div>
  );
}
