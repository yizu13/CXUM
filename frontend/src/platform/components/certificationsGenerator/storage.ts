import type { CertificateDesignFlow, CertificateGeneration, CertificateTemplate, GeneratorDraft, TextAreaDefinition } from "./types";

const TEMPLATES_KEY = "cxum.certificateTemplates";
const GENERATIONS_KEY = "cxum.certificateGenerations";
const DRAFT_KEY = "cxum.certificateDraft";
const DESIGNS_KEY = "cxum.certificateDesignFlows";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (isQuotaError(error)) {
      localStorage.removeItem(key);
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        console.warn(`No se pudo persistir ${key}: almacenamiento local lleno.`);
      }
      return;
    }
    throw error;
  }
}

export function loadTemplates(): CertificateTemplate[] {
  return readJson<CertificateTemplate[]>(TEMPLATES_KEY, []).filter(hasUsablePreview);
}

export function saveTemplate(template: CertificateTemplate): CertificateTemplate[] {
  const current = loadTemplates().filter((item) => item.id !== template.id);
  const lightweight = toLightweightTemplate(template);
  const next = lightweight ? [lightweight, ...current].slice(0, 18) : current;
  writeJson(TEMPLATES_KEY, next);
  return next;
}

export function deleteTemplate(templateId: string): CertificateTemplate[] {
  const next = loadTemplates().filter((item) => item.id !== templateId);
  writeJson(TEMPLATES_KEY, next);
  deleteDesignFlow(templateId);
  return next;
}

export function loadDesignFlows(): CertificateDesignFlow[] {
  return readJson<CertificateDesignFlow[]>(DESIGNS_KEY, []);
}

export function getDesignFlow(templateId: string): CertificateDesignFlow | null {
  return loadDesignFlows().find((item) => item.templateId === templateId) ?? null;
}

export function saveDesignFlow(
  template: CertificateTemplate,
  areas: TextAreaDefinition[],
): CertificateDesignFlow {
  const current = loadDesignFlows();
  const existing = current.find((item) => item.templateId === template.id);
  const now = new Date().toISOString();
  const flow: CertificateDesignFlow = {
    id: existing?.id ?? makeId("flow"),
    templateId: template.id,
    templateName: template.name,
    templateFileName: template.fileName,
    areas: areas.map((area) => ({ ...area })),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const next = [flow, ...current.filter((item) => item.templateId !== template.id)].slice(0, 50);
  writeJson(DESIGNS_KEY, next);
  return flow;
}

export function deleteDesignFlow(templateId: string): CertificateDesignFlow[] {
  const next = loadDesignFlows().filter((item) => item.templateId !== templateId);
  writeJson(DESIGNS_KEY, next);
  return next;
}

export function loadGenerations(): CertificateGeneration[] {
  return readJson<CertificateGeneration[]>(GENERATIONS_KEY, []);
}

export function saveGeneration(generation: CertificateGeneration): CertificateGeneration[] {
  const current = loadGenerations().filter((item) => item.id !== generation.id);
  const next = [generation, ...current].slice(0, 30);
  writeJson(GENERATIONS_KEY, next);
  return next;
}

export function deleteGeneration(generationId: string): CertificateGeneration[] {
  const next = loadGenerations().filter((item) => item.id !== generationId);
  writeJson(GENERATIONS_KEY, next);
  return next;
}

export function loadDraft(): GeneratorDraft | null {
  const draft = readJson<GeneratorDraft | null>(DRAFT_KEY, null);
  if (!draft) return null;
  return {
    ...draft,
    template: draft.template && hasUsablePreview(draft.template) ? draft.template : null,
    dataSet: null,
  };
}

export function saveDraft(draft: GeneratorDraft): void {
  writeJson(DRAFT_KEY, {
    ...draft,
    template: draft.template ? toLightweightTemplate(draft.template) : null,
    dataSet: null,
  });
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function sanitizeFileName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "certificado";
}

function toLightweightTemplate(template: CertificateTemplate): CertificateTemplate | null {
  const previewIsSmallEnough = template.previewUrl.length < 750_000;
  if (!previewIsSmallEnough) return null;
  return {
    ...template,
    dataUrl: "",
  };
}

function hasUsablePreview(template: CertificateTemplate): boolean {
  return Boolean(template.previewUrl && template.width > 0 && template.height > 0);
}

function isQuotaError(error: unknown): boolean {
  return error instanceof DOMException
    && (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED");
}
