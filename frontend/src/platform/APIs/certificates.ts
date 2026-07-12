import { apiFetch } from "./api";
import type { TextAreaDefinition } from "../components/certificationsGenerator/types";

export interface CertificateStoredTemplate {
  id: string;
  name: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  key: string;
  bucketPrefix: string;
  createdAt: string;
  createdBy: string;
}

export interface CertificateStoredGeneration {
  id: string;
  templateId?: string;
  templateName: string;
  createdAt: string;
  createdBy: string;
  records: number;
  bucketPrefix: string;
  status: "uploading" | "ready" | "failed";
  expectedFiles?: number;
  downloadKey?: string;
  hasDigitalCertificates?: boolean;
  digitalCount?: number;
  completedAt?: string;
  error?: string;
}

export interface CertificateStoredFile {
  key: string;
  size?: number;
  lastModified?: string;
  fileName?: string;
}

export interface CertificateStoredDesignFlow {
  id: string;
  templateId: string;
  templateName: string;
  templateFileName: string;
  areas: TextAreaDefinition[];
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface UploadUrlFileInput {
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface UploadUrlItem {
  key: string;
  uploadUrl: string;
  fileName: string;
  contentType: string;
  expiresIn: number;
}

export async function getTemplateUploadUrl(input: {
  templateName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  templateId?: string;
}) {
  return apiFetch<{
    template: Pick<CertificateStoredTemplate, "id" | "name" | "key" | "bucketPrefix"> & { metadataKey: string };
    uploadUrl: string;
    expiresIn: number;
  }>("/admin/certificates/templates/upload-url", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function listCertificateTemplates() {
  return apiFetch<{ templates: CertificateStoredTemplate[]; count: number; bucket: string }>(
    "/admin/certificates/templates",
  );
}

export async function deleteCertificateTemplate(templateId: string, bucketPrefix?: string) {
  return apiFetch<{ message: string; templateId: string; bucketPrefix: string }>(
    `/admin/certificates/templates/${encodeURIComponent(templateId)}`,
    {
      method: "DELETE",
      body: JSON.stringify({ bucketPrefix }),
    },
  );
}

export async function getCertificateDesignFlow(templateId: string) {
  return apiFetch<{ design: CertificateStoredDesignFlow }>(
    `/admin/certificates/designs/${encodeURIComponent(templateId)}`,
  );
}

export async function saveCertificateDesignFlow(input: {
  templateId: string;
  templateName: string;
  templateFileName: string;
  areas: TextAreaDefinition[];
}) {
  return apiFetch<{ design: CertificateStoredDesignFlow }>(
    `/admin/certificates/designs/${encodeURIComponent(input.templateId)}`,
    {
      method: "PUT",
      body: JSON.stringify({
        templateName: input.templateName,
        templateFileName: input.templateFileName,
        areas: input.areas,
      }),
    },
  );
}

export async function deleteCertificateDesignFlow(templateId: string) {
  return apiFetch<{ message: string; templateId: string }>(
    `/admin/certificates/designs/${encodeURIComponent(templateId)}`,
    { method: "DELETE" },
  );
}

export async function getGenerationUploadUrls(input: {
  templateName: string;
  templateId?: string;
  generationId?: string;
  records: number;
  files: UploadUrlFileInput[];
}) {
  return apiFetch<{
    generation: CertificateStoredGeneration;
    uploadUrls: UploadUrlItem[];
    bucket: string;
  }>("/admin/certificates/generations/upload-urls", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function completeCertificateGeneration(
  generationId: string,
  input: {
    bucketPrefix: string;
    records: number;
    downloadKey?: string;
    certificates?: Array<{ certificateId: string; key: string; fileName?: string }>;
    status?: "ready" | "failed";
    error?: string;
  },
) {
  return apiFetch<{ generation: CertificateStoredGeneration }>(
    `/admin/certificates/generations/${encodeURIComponent(generationId)}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
  );
}

export async function listCertificateGenerations(templateName?: string) {
  const query = templateName ? `?templateName=${encodeURIComponent(templateName)}` : "";
  return apiFetch<{ generations: CertificateStoredGeneration[]; count: number; bucket: string }>(
    `/admin/certificates/generations${query}`,
  );
}

export async function getCertificateGeneration(generationId: string, bucketPrefix?: string) {
  const query = bucketPrefix ? `?bucketPrefix=${encodeURIComponent(bucketPrefix)}` : "";
  return apiFetch<{
    generation: CertificateStoredGeneration;
    files: CertificateStoredFile[];
    count: number;
  }>(`/admin/certificates/generations/${encodeURIComponent(generationId)}${query}`);
}

export async function deleteCertificateGeneration(generationId: string, bucketPrefix?: string) {
  return apiFetch<{ message: string; generationId: string; bucketPrefix: string }>(
    `/admin/certificates/generations/${encodeURIComponent(generationId)}`,
    {
      method: "DELETE",
      body: JSON.stringify({ bucketPrefix }),
    },
  );
}

export async function getCertificateDownloadUrl(key: string) {
  return apiFetch<{ downloadUrl: string; key: string; expiresIn: number }>(
    `/admin/certificates/download?key=${encodeURIComponent(key)}`,
  );
}

export async function deleteCertificateFile(key: string) {
  return apiFetch<{ message: string; key: string }>("/admin/certificates/files", {
    method: "DELETE",
    body: JSON.stringify({ key }),
  });
}

export async function uploadCertificateObject(file: Blob, uploadUrl: string, contentType: string) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": contentType },
  });

  if (!response.ok) {
    throw new Error(`Error al subir archivo de certificado: ${response.statusText}`);
  }
}
