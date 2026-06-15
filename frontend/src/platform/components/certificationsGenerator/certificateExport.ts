import JSZip from "jszip";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import { parseTemplate, renderTemplate } from "./ast";
import { makeId, sanitizeFileName } from "./storage";
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
}

export interface CertificateZipExport {
  generation: CertificateGeneration;
  zipBlob: Blob;
  zipFileName: string;
}

export async function exportCertificatesZip({
  template,
  areas,
  rows,
}: ExportPayload): Promise<CertificateZipExport> {
  const zip = new JSZip();
  const generationId = makeId("gen");
  const templateSlug = sanitizeFileName(template.name);
  const dateSlug = new Date().toISOString().replace(/[:.]/g, "-");
  const bucketPrefix = `certificados/${templateSlug}/${generationId}-${dateSlug}`;

  await Promise.all(
    rows.map(async (row, index) => {
      const bytes = await buildCertificatePdf(template, areas, row);
      const personName = sanitizeFileName(row.nombre ?? row.name ?? `registro-${index + 1}`);
      zip.file(`${bucketPrefix}/${String(index + 1).padStart(3, "0")}-${personName}.pdf`, bytes);
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
    status: "ready",
    },
  };
}

async function buildCertificatePdf(
  template: CertificateTemplate,
  areas: TextAreaDefinition[],
  row: DataRow,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([template.width, template.height]);
  const background = await embedBackground(pdf, template.previewUrl);

  page.drawImage(background, {
    x: 0,
    y: 0,
    width: template.width,
    height: template.height,
  });

  for (const area of areas) {
    const ast = parseTemplate(area.text);
    const text = renderTemplate(ast, row);
    const font = await resolveFont(pdf, area.fontStyle);
    const color = hexToRgb(area.fill);
    const lines = wrapLines(text, area.width, area.fontSize, font.widthOfTextAtSize.bind(font));
    const lineGap = area.fontSize * area.lineHeight;

    lines.forEach((line, lineIndex) => {
      const lineWidth = font.widthOfTextAtSize(line, area.fontSize);
      const alignOffset =
        area.align === "center" ? (area.width - lineWidth) / 2 : area.align === "right" ? area.width - lineWidth : 0;

      page.drawText(line, {
        x: area.x + alignOffset,
        y: template.height - area.y - area.fontSize - lineIndex * lineGap,
        size: area.fontSize,
        font,
        color,
        rotate: degrees(area.rotation * -1),
        lineHeight: lineGap,
      });
    });
  }

  return pdf.save();
}

async function embedBackground(pdf: PDFDocument, dataUrl: string) {
  const bytes = dataUrlToUint8Array(dataUrl);
  return dataUrl.startsWith("data:image/jpeg") || dataUrl.startsWith("data:image/jpg")
    ? pdf.embedJpg(bytes)
    : pdf.embedPng(bytes);
}

async function resolveFont(pdf: PDFDocument, fontStyle: TextAreaDefinition["fontStyle"]) {
  if (fontStyle === "bold") return pdf.embedFont(StandardFonts.HelveticaBold);
  if (fontStyle === "italic") return pdf.embedFont(StandardFonts.HelveticaOblique);
  if (fontStyle === "bold italic") return pdf.embedFont(StandardFonts.HelveticaBoldOblique);
  return pdf.embedFont(StandardFonts.Helvetica);
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

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized.length === 3 ? expandShortHex(normalized) : normalized, 16);
  return rgb(((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255);
}

function expandShortHex(hex: string): string {
  return hex
    .split("")
    .map((char) => `${char}${char}`)
    .join("");
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
