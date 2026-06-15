import type React from "react";
import type { TextAreaDefinition } from "./types";

export interface TypographyPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  patch: Partial<TextAreaDefinition>;
}

export const TYPOGRAPHY_PRESETS: TypographyPreset[] = [
  {
    id: "classic-title",
    name: "Titulo clasico",
    category: "Titulo",
    description: "Serif tradicional para encabezados institucionales.",
    patch: {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: 52,
      isBold: true,
      isItalic: false,
      isUnderline: false,
      fill: "#111827",
      letterSpacing: 1.2,
      lineHeight: 1.05,
      textTransform: "uppercase",
      strokeWidth: 0,
      shadowBlur: 0,
    },
  },
  {
    id: "signature-name",
    name: "Nombre firma",
    category: "Firma",
    description: "Script elegante para nombres o firmas digitales.",
    patch: {
      fontFamily: "'Brush Script MT', 'Segoe Script', 'Lucida Handwriting', cursive",
      fontSize: 64,
      isBold: false,
      isItalic: true,
      isUnderline: false,
      fill: "#172033",
      letterSpacing: 0,
      lineHeight: 1,
      textTransform: "none",
      shadowColor: "#000000",
      shadowBlur: 1,
      shadowOffsetX: 0.5,
      shadowOffsetY: 0.5,
    },
  },
  {
    id: "luxury-name",
    name: "Lujo premium",
    category: "Nombre",
    description: "Serif fina con espaciado sobrio para diplomas premium.",
    patch: {
      fontFamily: "Didot, 'Bodoni 72', 'Baskerville', Georgia, serif",
      fontSize: 48,
      isBold: false,
      isItalic: false,
      fill: "#1f2937",
      letterSpacing: 1.8,
      lineHeight: 1.1,
      textTransform: "capitalize",
    },
  },
  {
    id: "formal-body",
    name: "Cuerpo formal",
    category: "Cuerpo",
    description: "Texto legible para descripciones, fechas e institucion.",
    patch: {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: 24,
      isBold: false,
      isItalic: false,
      isUnderline: false,
      fill: "#374151",
      letterSpacing: 0,
      lineHeight: 1.32,
      textTransform: "none",
      strokeWidth: 0,
      shadowBlur: 0,
    },
  },
  {
    id: "modern-corporate",
    name: "Corporativo moderno",
    category: "Moderno",
    description: "Sans serif limpia para certificados profesionales.",
    patch: {
      fontFamily: "Inter, Arial, Helvetica, sans-serif",
      fontSize: 30,
      isBold: true,
      isItalic: false,
      fill: "#0f172a",
      letterSpacing: 0.4,
      lineHeight: 1.2,
      textTransform: "none",
    },
  },
  {
    id: "folio-code",
    name: "Folio tecnico",
    category: "Folio",
    description: "Monoespaciada para codigos, folios o QR labels.",
    patch: {
      fontFamily: "'Courier New', Consolas, monospace",
      fontSize: 18,
      isBold: false,
      isItalic: false,
      fill: "#475569",
      letterSpacing: 1,
      lineHeight: 1.1,
      textTransform: "uppercase",
    },
  },
  {
    id: "gold-ceremonial",
    name: "Ceremonial dorado",
    category: "Ceremonial",
    description: "Texto destacado con sombra suave y color dorado.",
    patch: {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: 46,
      isBold: true,
      isItalic: false,
      fill: "#b7791f",
      letterSpacing: 1,
      lineHeight: 1.08,
      shadowColor: "#7c2d12",
      shadowBlur: 2,
      shadowOffsetX: 1,
      shadowOffsetY: 1,
    },
  },
  {
    id: "watermark",
    name: "Marca de agua",
    category: "Decorativo",
    description: "Texto amplio y transparente para fondos sutiles.",
    patch: {
      fontFamily: "Arial, Helvetica, sans-serif",
      fontSize: 76,
      isBold: true,
      isItalic: false,
      fill: "#64748b",
      opacity: 0.16,
      letterSpacing: 3,
      lineHeight: 1,
      textTransform: "uppercase",
    },
  },
];

export function normalizeAreaStyle(area: TextAreaDefinition): TextAreaDefinition {
  const isBold = area.isBold ?? area.fontStyle.includes("bold");
  const isItalic = area.isItalic ?? area.fontStyle.includes("italic");
  return {
    ...area,
    isBold,
    isItalic,
    isUnderline: area.isUnderline ?? false,
    isStrikethrough: area.isStrikethrough ?? false,
    opacity: area.opacity ?? 1,
    textTransform: area.textTransform ?? "none",
    stroke: area.stroke ?? "#111827",
    strokeWidth: area.strokeWidth ?? 0,
    shadowColor: area.shadowColor ?? "#000000",
    shadowBlur: area.shadowBlur ?? 0,
    shadowOffsetX: area.shadowOffsetX ?? 0,
    shadowOffsetY: area.shadowOffsetY ?? 0,
    typographyPreset: area.typographyPreset ?? "",
  };
}

export function fontStyleFor(area: TextAreaDefinition): TextAreaDefinition["fontStyle"] {
  const normalized = normalizeAreaStyle(area);
  if (normalized.isBold && normalized.isItalic) return "bold italic";
  if (normalized.isBold) return "bold";
  if (normalized.isItalic) return "italic";
  return "normal";
}

export function applyTextTransform(text: string, transform: TextAreaDefinition["textTransform"]): string {
  if (transform === "uppercase") return text.toUpperCase();
  if (transform === "capitalize") {
    return text.replace(/\p{L}[\p{L}\p{M}'-]*/gu, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  }
  return text;
}

export function cssTextStyle(area: TextAreaDefinition, scale = 1): React.CSSProperties {
  const normalized = normalizeAreaStyle(area);
  return {
    color: normalized.fill,
    opacity: normalized.opacity,
    fontFamily: normalized.fontFamily,
    fontSize: normalized.fontSize * scale,
    fontWeight: normalized.isBold ? 800 : 400,
    fontStyle: normalized.isItalic ? "italic" : "normal",
    textDecoration: [
      normalized.isUnderline ? "underline" : "",
      normalized.isStrikethrough ? "line-through" : "",
    ].filter(Boolean).join(" ") || "none",
    textTransform: normalized.textTransform === "none" ? undefined : normalized.textTransform,
    textAlign: normalized.align,
    lineHeight: normalized.lineHeight,
    letterSpacing: normalized.letterSpacing * scale,
    WebkitTextStroke: normalized.strokeWidth ? `${normalized.strokeWidth * scale}px ${normalized.stroke}` : undefined,
    textShadow: normalized.shadowBlur
      ? `${(normalized.shadowOffsetX ?? 0) * scale}px ${(normalized.shadowOffsetY ?? 0) * scale}px ${normalized.shadowBlur * scale}px ${normalized.shadowColor}`
      : undefined,
  };
}
