export type CertificateStep = "template" | "areas" | "text" | "data" | "generations";

export type TemplateSourceType = "pdf" | "image";

export interface CertificateTemplate {
  id: string;
  name: string;
  sourceType: TemplateSourceType;
  fileName: string;
  dataUrl: string;
  previewUrl: string;
  createdAt: string;
  width: number;
  height: number;
}

export interface TextAreaDefinition {
  id: string;
  areaKind?: "text" | "qr" | "certificateId";
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  text: string;
  fontFamily: string;
  fontSize: number;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrikethrough?: boolean;
  fontStyle: "normal" | "bold" | "italic" | "bold italic";
  align: "left" | "center" | "right";
  fill: string;
  opacity?: number;
  lineHeight: number;
  letterSpacing: number;
  textTransform?: "none" | "uppercase" | "capitalize";
  stroke?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  typographyPreset?: string;
}

export type TemplateToken =
  | { type: "text"; value: string }
  | { type: "variable"; name: string; raw: string };

export interface TextAst {
  type: "Template";
  body: TemplateToken[];
  variables: string[];
  errors: string[];
}

export type DataRow = Record<string, string>;

export interface ParsedDataSet {
  fileName: string;
  variables: string[];
  rows: DataRow[];
  errors: string[];
}

export interface CertificateGeneration {
  id: string;
  templateId: string;
  templateName: string;
  createdAt: string;
  records: number;
  bucketPrefix: string;
  downloadUrl?: string;
  downloadKey?: string;
  hasDigitalCertificates?: boolean;
  digitalCount?: number;
  status: "uploading" | "ready" | "failed";
  error?: string;
}

export interface CertificateDesignFlow {
  id: string;
  templateId: string;
  templateName: string;
  templateFileName: string;
  areas: TextAreaDefinition[];
  createdAt: string;
  updatedAt: string;
}

export interface GeneratorDraft {
  template: CertificateTemplate | null;
  areas: TextAreaDefinition[];
  selectedAreaId: string | null;
  sampleData: DataRow;
  dataSet: ParsedDataSet | null;
}

export interface ThemeAwareProps {
  isDark: boolean;
}
