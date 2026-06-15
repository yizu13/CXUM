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
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  text: string;
  fontFamily: string;
  fontSize: number;
  fontStyle: "normal" | "bold" | "italic" | "bold italic";
  align: "left" | "center" | "right";
  fill: string;
  lineHeight: number;
  letterSpacing: number;
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
  status: "uploading" | "ready" | "failed";
  error?: string;
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
