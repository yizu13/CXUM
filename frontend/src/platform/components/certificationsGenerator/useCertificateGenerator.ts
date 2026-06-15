import { useEffect, useMemo, useState } from "react";
import {
  completeCertificateGeneration,
  deleteCertificateGeneration,
  getCertificateDownloadUrl,
  getGenerationUploadUrls,
  listCertificateGenerations,
  uploadCertificateObject,
} from "../../APIs/certificates";
import { buildSampleData, extractVariablesFromTexts } from "./ast";
import { exportCertificatesZip } from "./certificateExport";
import {
  clearDraft,
  deleteGeneration,
  deleteTemplate,
  loadDraft,
  loadGenerations,
  loadTemplates,
  makeId,
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
  fontStyle: "bold",
  align: "center",
  fill: "#111827",
  lineHeight: 1.18,
  letterSpacing: 0,
};

const EMPTY_DRAFT: GeneratorDraft = {
  template: null,
  areas: [],
  selectedAreaId: null,
  sampleData: {},
  dataSet: null,
};

export function useCertificateGenerator() {
  const restored = loadDraft();
  const [step, setStep] = useState<CertificateStep>("template");
  const [templates, setTemplates] = useState<CertificateTemplate[]>(() => loadTemplates());
  const [generations, setGenerations] = useState<CertificateGeneration[]>(() => loadGenerations());
  const [draft, setDraft] = useState<GeneratorDraft>(restored ?? EMPTY_DRAFT);
  const [exporting, setExporting] = useState(false);

  const variables = useMemo(
    () => extractVariablesFromTexts(draft.areas.map((area) => area.text)),
    [draft.areas],
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
          status: generation.status,
          error: generation.error,
        })));
      })
      .catch((error) => {
        console.warn("No se pudieron cargar generaciones remotas", error);
      });
  }, []);

  useEffect(() => {
    const nextSample = buildSampleData(variables, draft.sampleData);
    if (JSON.stringify(nextSample) !== JSON.stringify(draft.sampleData)) {
      setDraft((current) => ({ ...current, sampleData: nextSample }));
    }
  }, [draft.sampleData, variables]);

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
    setDraft({ ...EMPTY_DRAFT, template });
    setStep("areas");
  };

  const addTemplate = (template: CertificateTemplate) => {
    const next = saveTemplate(template);
    setTemplates(next);
    selectTemplate(template);
  };

  const removeTemplate = (templateId: string) => {
    setTemplates(deleteTemplate(templateId));
    if (draft.template?.id === templateId) setDraft(EMPTY_DRAFT);
  };

  const addArea = () => {
    if (!draft.template) return;
    const areaNumber = draft.areas.length + 1;
    const area: TextAreaDefinition = {
      ...DEFAULT_AREA,
      id: makeId("area"),
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

  const runExport = async () => {
    if (!draft.template || !draft.dataSet || draft.dataSet.errors.length > 0) return;
    setExporting(true);
    try {
      const exported = await exportCertificatesZip({
        template: draft.template,
        areas: draft.areas,
        rows: draft.dataSet.rows,
      });
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
        ],
      });
      const zipUpload = uploadPlan.uploadUrls[0];
      await uploadCertificateObject(exported.zipBlob, zipUpload.uploadUrl, "application/zip");
      const completed = await completeCertificateGeneration(uploadPlan.generation.id, {
        bucketPrefix: uploadPlan.generation.bucketPrefix,
        records: draft.dataSet.rows.length,
        downloadKey: zipUpload.key,
        status: "ready",
      });
      const generation: CertificateGeneration = {
        ...exported.generation,
        bucketPrefix: completed.generation.bucketPrefix,
        downloadKey: completed.generation.downloadKey,
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
    setStep("template");
  };

  return {
    step,
    setStep,
    draft,
    templates,
    generations,
    variables,
    selectedArea,
    exporting,
    selectTemplate,
    addTemplate,
    removeTemplate,
    addArea,
    updateArea,
    removeArea,
    selectArea,
    updateSampleData,
    setDataSet,
    runExport,
    removeGeneration,
    downloadGeneration,
    resetAll,
  };
}
