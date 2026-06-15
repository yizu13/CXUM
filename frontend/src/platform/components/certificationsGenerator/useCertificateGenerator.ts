import { useEffect, useMemo, useState } from "react";
import {
  completeCertificateGeneration,
  deleteCertificateGeneration,
  getCertificateDownloadUrl,
  getGenerationUploadUrls,
  listCertificateGenerations,
  uploadCertificateObject,
} from "../../APIs/certificates";
import { buildSampleData, extractVariablesFromTexts, isSystemVariable } from "./ast";
import { exportCertificatesZip } from "./certificateExport";
import {
  clearDraft,
  deleteGeneration,
  deleteTemplate,
  getDesignFlow,
  loadDraft,
  loadGenerations,
  loadTemplates,
  makeId,
  saveDesignFlow,
  saveDraft,
  saveGeneration,
  saveTemplate,
} from "./storage";
import type {
  CertificateGeneration,
  CertificateStep,
  CertificateTemplate,
  DataRow,
  GeneratorDraft,
  ParsedDataSet,
  TextAreaDefinition,
} from "./types";

const DEFAULT_AREA: Omit<TextAreaDefinition, "id" | "label" | "x" | "y"> = {
  width: 420,
  height: 80,
  rotation: 0,
  text: "Otorgado a {{nombre}}",
  fontFamily: "Helvetica",
  fontSize: 34,
  isBold: true,
  isItalic: false,
  isUnderline: false,
  isStrikethrough: false,
  fontStyle: "bold",
  align: "center",
  fill: "#111827",
  opacity: 1,
  lineHeight: 1.18,
  letterSpacing: 0,
  textTransform: "none",
  stroke: "#111827",
  strokeWidth: 0,
  shadowColor: "#000000",
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  typographyPreset: "modern-corporate",
};

const EMPTY_DRAFT: GeneratorDraft = {
  template: null,
  areas: [],
  selectedAreaId: null,
  sampleData: {},
  dataSet: null,
};

const DEFAULT_CERTIFICATE_PUBLIC_BASE_URL = "https://cuadernosxunmanana.org/?certificateId=";

export function useCertificateGenerator() {
  const restored = loadDraft();
  const [step, setStep] = useState<CertificateStep>("template");
  const [templates, setTemplates] = useState<CertificateTemplate[]>(() => loadTemplates());
  const [generations, setGenerations] = useState<CertificateGeneration[]>(() => loadGenerations());
  const [draft, setDraft] = useState<GeneratorDraft>(restored ?? EMPTY_DRAFT);
  const [exporting, setExporting] = useState(false);
  const [savedDesignAt, setSavedDesignAt] = useState<string | null>(null);

  const allVariables = useMemo(
    () => extractVariablesFromTexts(draft.areas.map((area) => area.text)),
    [draft.areas],
  );

  const variables = useMemo(
    () => allVariables.filter((variable) => !isSystemVariable(variable)),
    [allVariables],
  );

  const systemVariables = useMemo(
    () => allVariables.filter(isSystemVariable),
    [allVariables],
  );

  const selectedArea = useMemo(
    () => draft.areas.find((area) => area.id === draft.selectedAreaId) ?? null,
    [draft.areas, draft.selectedAreaId],
  );

  useEffect(() => {
    listCertificateGenerations()
      .then((response) => {
        setGenerations(response.generations.map((generation) => ({
          id: generation.id,
          templateId: generation.templateId ?? "",
          templateName: generation.templateName,
          createdAt: generation.createdAt,
          records: generation.records,
          bucketPrefix: generation.bucketPrefix,
          downloadKey: generation.downloadKey,
          hasDigitalCertificates: generation.hasDigitalCertificates,
          digitalCount: generation.digitalCount,
          status: generation.status,
          error: generation.error,
        })));
      })
      .catch((error) => {
        console.warn("No se pudieron cargar generaciones remotas", error);
      });
  }, []);

  useEffect(() => {
    const nextSample = buildSampleData(allVariables, draft.sampleData);
    if (JSON.stringify(nextSample) !== JSON.stringify(draft.sampleData)) {
      setDraft((current) => ({ ...current, sampleData: nextSample }));
    }
  }, [allVariables, draft.sampleData]);

  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  const selectTemplate = (template: CertificateTemplate) => {
    const hasProgress = Boolean(draft.template && (draft.areas.length > 0 || draft.dataSet));
    if (hasProgress) {
      const accepted = window.confirm(
        "Cambiar el background reinicia las areas, textos y datos cargados. Deseas continuar?",
      );
      if (!accepted) return;
    }
    const savedFlow = getDesignFlow(template.id);
    const restoredAreas = savedFlow?.areas ?? [];
    setDraft({
      ...EMPTY_DRAFT,
      template,
      areas: restoredAreas,
      selectedAreaId: restoredAreas[0]?.id ?? null,
    });
    setSavedDesignAt(savedFlow?.updatedAt ?? null);
    setStep("areas");
  };

  const addTemplate = (template: CertificateTemplate) => {
    const next = saveTemplate(template);
    setTemplates(next);
    selectTemplate(template);
  };

  const removeTemplate = (templateId: string) => {
    setTemplates(deleteTemplate(templateId));
    if (draft.template?.id === templateId) {
      setDraft(EMPTY_DRAFT);
      setSavedDesignAt(null);
    }
  };

  const addArea = () => {
    if (!draft.template) return;
    const areaNumber = draft.areas.length + 1;
    const area: TextAreaDefinition = {
      ...DEFAULT_AREA,
      id: makeId("area"),
      areaKind: "text",
      label: `Area ${areaNumber}`,
      x: Math.max(24, draft.template.width / 2 - DEFAULT_AREA.width / 2),
      y: Math.max(24, draft.template.height / 2 - DEFAULT_AREA.height / 2),
    };
    setDraft((current) => ({
      ...current,
      areas: [...current.areas, area],
      selectedAreaId: area.id,
    }));
  };

  const addQrAreaPair = () => {
    if (!draft.template) return;
    const size = Math.min(150, Math.max(92, draft.template.width * 0.12));
    const rightMargin = 56;
    const bottomMargin = 72;
    const qrX = Math.max(24, draft.template.width - size - rightMargin);
    const qrY = Math.max(24, draft.template.height - size - bottomMargin);
    const qrArea: TextAreaDefinition = {
      ...DEFAULT_AREA,
      id: makeId("qr"),
      areaKind: "qr",
      label: "Codigo QR",
      x: qrX,
      y: qrY,
      width: size,
      height: size,
      text: "",
      fontSize: 12,
      fill: "#111827",
      typographyPreset: "",
    };
    const idArea: TextAreaDefinition = {
      ...DEFAULT_AREA,
      id: makeId("cid"),
      areaKind: "certificateId",
      label: "ID unico",
      x: Math.max(24, qrX - 90),
      y: qrY + size + 10,
      width: size + 180,
      height: 28,
      text: "{{certificateId}}",
      fontFamily: "'Courier New', Consolas, monospace",
      fontSize: 15,
      isBold: true,
      fontStyle: "bold",
      align: "center",
      fill: "#334155",
      letterSpacing: 0.8,
      typographyPreset: "folio-code",
    };

    setDraft((current) => ({
      ...current,
      areas: [...current.areas, qrArea, idArea],
      selectedAreaId: qrArea.id,
    }));
  };

  const updateArea = (areaId: string, patch: Partial<TextAreaDefinition>) => {
    setDraft((current) => ({
      ...current,
      areas: current.areas.map((area) => (area.id === areaId ? { ...area, ...patch } : area)),
    }));
  };

  const removeArea = (areaId: string) => {
    setDraft((current) => ({
      ...current,
      areas: current.areas.filter((area) => area.id !== areaId),
      selectedAreaId: current.selectedAreaId === areaId ? null : current.selectedAreaId,
    }));
  };

  const selectArea = (areaId: string | null) => {
    setDraft((current) => ({ ...current, selectedAreaId: areaId }));
  };

  const updateSampleData = (sampleData: DataRow) => {
    setDraft((current) => ({ ...current, sampleData }));
  };

  const setDataSet = (dataSet: ParsedDataSet | null) => {
    setDraft((current) => ({ ...current, dataSet }));
  };

  const saveCurrentDesignFlow = () => {
    if (!draft.template) return;
    const flow = saveDesignFlow(draft.template, draft.areas);
    setSavedDesignAt(flow.updatedAt);
  };

  const runExport = async () => {
    if (!draft.template || !draft.dataSet || draft.dataSet.errors.length > 0) return;
    setExporting(true);
    try {
      const exported = await exportCertificatesZip({
        template: draft.template,
        areas: draft.areas,
        rows: draft.dataSet.rows,
        publicCertificateBaseUrl: getPublicCertificateBaseUrl(),
      });
      const digitalUploadInputs = exported.digitalCertificates.map((certificate) => ({
        fileName: certificate.fileName,
        contentType: "application/pdf",
        fileSize: certificate.blob.size,
      }));
      const uploadPlan = await getGenerationUploadUrls({
        templateId: draft.template.id,
        templateName: draft.template.name,
        generationId: exported.generation.id,
        records: draft.dataSet.rows.length,
        files: [
          {
            fileName: exported.zipFileName,
            contentType: "application/zip",
            fileSize: exported.zipBlob.size,
          },
          ...digitalUploadInputs,
        ],
      });
      const zipUpload = uploadPlan.uploadUrls[0];
      await uploadCertificateObject(exported.zipBlob, zipUpload.uploadUrl, "application/zip");
      const digitalUploads = uploadPlan.uploadUrls.slice(1);
      await Promise.all(exported.digitalCertificates.map((certificate, index) => {
        const upload = digitalUploads[index];
        return uploadCertificateObject(certificate.blob, upload.uploadUrl, "application/pdf");
      }));
      const completed = await completeCertificateGeneration(uploadPlan.generation.id, {
        bucketPrefix: uploadPlan.generation.bucketPrefix,
        records: draft.dataSet.rows.length,
        downloadKey: zipUpload.key,
        certificates: exported.digitalCertificates.map((certificate, index) => ({
          certificateId: certificate.certificateId,
          key: digitalUploads[index]?.key ?? "",
          fileName: certificate.fileName,
        })).filter((certificate) => certificate.key),
        status: "ready",
      });
      const generation: CertificateGeneration = {
        ...exported.generation,
        bucketPrefix: completed.generation.bucketPrefix,
        downloadKey: completed.generation.downloadKey,
        hasDigitalCertificates: exported.digitalCertificates.length > 0,
        digitalCount: exported.digitalCertificates.length,
        status: completed.generation.status,
      };
      setGenerations(saveGeneration(generation));
      setStep("generations");
    } catch (error) {
      const failed: CertificateGeneration = {
        id: makeId("gen"),
        templateId: draft.template.id,
        templateName: draft.template.name,
        createdAt: new Date().toISOString(),
        records: draft.dataSet.rows.length,
        bucketPrefix: `certificados/${draft.template.name}`,
        status: "failed",
        error: error instanceof Error ? error.message : "Error desconocido al exportar.",
      };
      setGenerations(saveGeneration(failed));
    } finally {
      setExporting(false);
    }
  };

  const removeGeneration = async (generationId: string) => {
    const generation = generations.find((item) => item.id === generationId);
    try {
      if (generation?.bucketPrefix) {
        await deleteCertificateGeneration(generationId, generation.bucketPrefix);
      }
    } catch (error) {
      console.warn("No se pudo eliminar la generacion remota", error);
    } finally {
      setGenerations(deleteGeneration(generationId));
    }
  };

  const downloadGeneration = async (generation: CertificateGeneration) => {
    if (generation.downloadUrl) {
      window.open(generation.downloadUrl, "_blank");
      return;
    }
    if (!generation.downloadKey) return;
    const { downloadUrl } = await getCertificateDownloadUrl(generation.downloadKey);
    window.open(downloadUrl, "_blank");
  };

  const resetAll = () => {
    clearDraft();
    setDraft(EMPTY_DRAFT);
    setSavedDesignAt(null);
    setStep("template");
  };

  return {
    step,
    setStep,
    draft,
    templates,
    generations,
    variables,
    systemVariables,
    selectedArea,
    exporting,
    selectTemplate,
    addTemplate,
    removeTemplate,
    addArea,
    addQrAreaPair,
    updateArea,
    removeArea,
    selectArea,
    updateSampleData,
    setDataSet,
    saveCurrentDesignFlow,
    savedDesignAt,
    runExport,
    removeGeneration,
    downloadGeneration,
    resetAll,
  };
}

function getPublicCertificateBaseUrl(): string {
  const configuredBase = import.meta.env.VITE_CERTIFICATE_PUBLIC_BASE_URL;
  if (configuredBase) return configuredBase.replace(/\/$/, "");
  if (window.location.hostname.endsWith("cuadernosxunmanana.org")) {
    return `${window.location.origin.replace(/\/$/, "")}/?certificateId=`;
  }
  return DEFAULT_CERTIFICATE_PUBLIC_BASE_URL;
}
