import JSZip from "jszip";
import QRCode from "qrcode";
import { PDFDocument } from "pdf-lib";
import { parseTemplate, renderTemplate } from "./ast";
import { makeId, sanitizeFileName } from "./storage";
import { applyTextTransform, fontStyleFor, normalizeAreaStyle } from "./typography";
import type {
  CertificateGeneration,
  CertificateTemplate,
  DataRow,
  TextAreaDefinition,
} from "./types";

interface ExportPayload {
  template: CertificateTemplate;
  areas: TextAreaDefinition[];
  rows: DataRow[];
  publicCertificateBaseUrl?: string;
}

export interface CertificateZipExport {
  generation: CertificateGeneration;
  zipBlob: Blob;
  zipFileName: string;
  certificateFiles: DigitalCertificateFile[];
  digitalCertificates: DigitalCertificateFile[];
}

export interface DigitalCertificateFile {
  certificateId: string;
  fileName: string;
  blob: Blob;
}

export async function exportCertificatesZip({
  template,
  areas,
  rows,
  publicCertificateBaseUrl,
}: ExportPayload): Promise<CertificateZipExport> {
  const zip = new JSZip();
  const generationId = makeId("gen");
  const templateSlug = sanitizeFileName(template.name);
  const dateSlug = new Date().toISOString().replace(/[:.]/g, "-");
  const bucketPrefix = `certificados/${templateSlug}/${generationId}-${dateSlug}`;
  const hasQr = areas.some((area) => area.areaKind === "qr");
  const certificateFiles: DigitalCertificateFile[] = [];
  const digitalCertificates: DigitalCertificateFile[] = [];

  await Promise.all(
    rows.map(async (row, index) => {
      const certificateId = hasQr ? makeCertificateId() : "";
      const certificateUrl = hasQr && publicCertificateBaseUrl
        ? buildCertificatePublicUrl(publicCertificateBaseUrl, certificateId)
        : "";
      const data = hasQr ? { ...row, certificateId, certificateUrl } : row;
      const bytes = await buildCertificatePdf(template, areas, data);
      const personName = sanitizeFileName(row.nombre ?? row.name ?? `registro-${index + 1}`);
      const fileName = `${String(index + 1).padStart(3, "0")}-${personName}.pdf`;
      zip.file(`${bucketPrefix}/${fileName}`, bytes);
      const certificateFile = {
        certificateId,
        fileName,
        blob: new Blob([toArrayBuffer(bytes)], { type: "application/pdf" }),
      };
      certificateFiles.push(certificateFile);
      if (hasQr) {
        digitalCertificates.push(certificateFile);
      }
    }),
  );

  const blob = await zip.generateAsync({ type: "blob" });
  const zipFileName = `${templateSlug}-${generationId}.zip`;
  return {
    zipBlob: blob,
    zipFileName,
    generation: {
    id: generationId,
    templateId: template.id,
    templateName: template.name,
    createdAt: new Date().toISOString(),
    records: rows.length,
    bucketPrefix,
    downloadUrl: URL.createObjectURL(blob),
    hasDigitalCertificates: hasQr,
    digitalCount: digitalCertificates.length,
    status: "ready",
    },
    certificateFiles,
    digitalCertificates,
  };
}

async function buildCertificatePdf(
  template: CertificateTemplate,
  areas: TextAreaDefinition[],
  row: DataRow,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([template.width, template.height]);
  const renderedPage = await renderCertificatePage(template, areas, row);
  const pageImage = await pdf.embedPng(dataUrlToUint8Array(renderedPage));

  page.drawImage(pageImage, {
    x: 0,
    y: 0,
    width: template.width,
    height: template.height,
  });

  return pdf.save();
}

async function renderCertificatePage(
  template: CertificateTemplate,
  areas: TextAreaDefinition[],
  row: DataRow,
): Promise<string> {
  await document.fonts?.ready;
  const canvas = document.createElement("canvas");
  canvas.width = template.width;
  canvas.height = template.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No se pudo preparar el render del certificado.");

  const background = await loadImage(template.previewUrl);
  context.drawImage(background, 0, 0, template.width, template.height);

  for (const area of areas) {
    context.save();
    context.translate(area.x, area.y);
    context.rotate((area.rotation * Math.PI) / 180);
    context.beginPath();
    context.rect(0, 0, area.width, area.height);
    context.clip();

    if (area.areaKind === "qr") {
      const qrUrl = row.certificateUrl;
      if (qrUrl) {
        const qrDataUrl = await QRCode.toDataURL(qrUrl, {
          errorCorrectionLevel: "M",
          margin: 1,
          color: { dark: "#111827", light: "#ffffff" },
        });
        const qrImage = await loadImage(qrDataUrl);
        const size = Math.min(area.width, area.height);
        context.drawImage(qrImage, (area.width - size) / 2, (area.height - size) / 2, size, size);
      }
      context.restore();
      continue;
    }

    const normalized = normalizeAreaStyle(area);
    const ast = parseTemplate(area.text);
    const text = applyTextTransform(renderTemplate(ast, row), normalized.textTransform);
    const opacity = normalized.opacity ?? 1;
    const strokeWidth = normalized.strokeWidth ?? 0;
    const lineGap = normalized.fontSize * normalized.lineHeight;

    context.globalAlpha = opacity;
    context.font = canvasFontFor(normalized);
    context.textBaseline = "top";
    context.fillStyle = normalized.fill;
    context.strokeStyle = normalized.stroke ?? "#111827";
    context.lineWidth = strokeWidth;
    context.lineJoin = "round";
    context.shadowColor = normalized.shadowColor ?? "#000000";
    context.shadowBlur = normalized.shadowBlur ?? 0;
    context.shadowOffsetX = normalized.shadowOffsetX ?? 0;
    context.shadowOffsetY = normalized.shadowOffsetY ?? 0;

    const lines = wrapLines(text, normalized.width, normalized.fontSize, (value) =>
      measureTextWidth(context, value, normalized.letterSpacing),
    );

    lines.forEach((line, lineIndex) => {
      const lineWidth = measureTextWidth(context, line, normalized.letterSpacing);
      const alignOffset =
        normalized.align === "center"
          ? (normalized.width - lineWidth) / 2
          : normalized.align === "right"
            ? normalized.width - lineWidth
            : 0;
      const y = lineIndex * lineGap;

      if (strokeWidth > 0) {
        drawTextWithLetterSpacing(context, line, alignOffset, y, normalized.letterSpacing, "stroke");
      }
      drawTextWithLetterSpacing(context, line, alignOffset, y, normalized.letterSpacing, "fill");

      const decorations = [
        normalized.isUnderline ? y + normalized.fontSize * 0.92 : null,
        normalized.isStrikethrough ? y + normalized.fontSize * 0.48 : null,
      ].filter((item): item is number => item !== null);

      context.save();
      context.shadowBlur = 0;
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 0;
      context.strokeStyle = normalized.fill;
      context.lineWidth = Math.max(0.8, normalized.fontSize * 0.045);
      decorations.forEach((decorationY) => {
        context.beginPath();
        context.moveTo(alignOffset, decorationY);
        context.lineTo(alignOffset + lineWidth, decorationY);
        context.stroke();
      });
      context.restore();
    });

    context.restore();
  }

  return canvas.toDataURL("image/png");
}

function canvasFontFor(area: TextAreaDefinition): string {
  const style = fontStyleFor(area);
  const italic = style.includes("italic") ? "italic" : "normal";
  const weight = style.includes("bold") ? "800" : "400";
  return `${italic} ${weight} ${area.fontSize}px ${area.fontFamily}`;
}

function makeCertificateId(): string {
  if (crypto.randomUUID) return crypto.randomUUID();

  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (char) =>
    (Number(char) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(char) / 4).toString(16),
  );
}

function buildCertificatePublicUrl(baseUrl: string, certificateId: string): string {
  const trimmed = baseUrl.trim();
  const encodedId = encodeURIComponent(certificateId);
  if (trimmed.includes("{certificateId}")) return trimmed.replace("{certificateId}", encodedId);
  if (trimmed.endsWith("=") || trimmed.endsWith("/")) return `${trimmed}${encodedId}`;
  if (trimmed.includes("?")) return `${trimmed}&certificateId=${encodedId}`;
  return `${trimmed.replace(/\/$/, "")}/certificates/${encodedId}`;
}

function wrapLines(
  text: string,
  maxWidth: number,
  fontSize: number,
  measure: (value: string, size: number) => number,
): string[] {
  return text.split("\n").flatMap((paragraph) => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) return [""];
    const lines: string[] = [];
    let current = "";

    words.forEach((word) => {
      const next = current ? `${current} ${word}` : word;
      if (measure(next, fontSize) <= maxWidth || !current) {
        current = next;
      } else {
        lines.push(current);
        current = word;
      }
    });

    if (current) lines.push(current);
    return lines;
  });
}

function measureTextWidth(context: CanvasRenderingContext2D, text: string, letterSpacing: number): number {
  return context.measureText(text).width + Math.max(0, text.length - 1) * letterSpacing;
}

function drawTextWithLetterSpacing(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  letterSpacing: number,
  mode: "fill" | "stroke",
): void {
  if (letterSpacing === 0) {
    if (mode === "fill") context.fillText(text, x, y);
    else context.strokeText(text, x, y);
    return;
  }

  let cursor = x;
  Array.from(text).forEach((char) => {
    if (mode === "fill") context.fillText(char, cursor, y);
    else context.strokeText(char, cursor, y);
    cursor += context.measureText(char).width + letterSpacing;
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo cargar una imagen del certificado."));
    image.src = src;
  });
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const [, base64] = dataUrl.split(",");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}
