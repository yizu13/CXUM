import AdminButton from "../components/AdminButton";
import AreaDesigner from "../components/certificationsGenerator/AreaDesigner";
import DataImportPanel from "../components/certificationsGenerator/DataImportPanel";
import GenerationsPanel from "../components/certificationsGenerator/GenerationsPanel";
import StepTabs from "../components/certificationsGenerator/StepTabs";
import TemplateManager from "../components/certificationsGenerator/TemplateManager";
import TextLayerEditor from "../components/certificationsGenerator/TextLayerEditor";
import { useCertificateGenerator } from "../components/certificationsGenerator/useCertificateGenerator";
import type { CertificateStep } from "../components/certificationsGenerator/types";
import { useSettings } from "../../hooks/context/SettingsContext";
import { mutedText, strongText } from "../components/certificationsGenerator/ui";

export default function CertifificationGeneratorPage() {
  const { theme } = useSettings();
  const isDark = theme === "dark";
  const generator = useCertificateGenerator();
  const { draft, variables } = generator;

  const disabledSteps: CertificateStep[] = [];
  if (!draft.template) disabledSteps.push("areas", "text", "data");
  if (draft.template && draft.areas.length === 0) disabledSteps.push("text", "data");

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight sm:text-2xl" style={{ color: strongText(isDark) }}>
            Generador de Certificados
          </h1>
          <p className="mt-1 max-w-3xl text-sm" style={{ color: mutedText(isDark) }}>
            Construye una plantilla por capas, valida un banco de datos y exporta certificados personalizados en masa.
          </p>
        </div>
        <AdminButton variant="ghost" icon="solar:restart-bold-duotone" onClick={generator.resetAll}>
          Reiniciar
        </AdminButton>
      </header>

      <StepTabs active={generator.step} onChange={generator.setStep} disabledSteps={disabledSteps} isDark={isDark} />

      {generator.step === "template" && (
        <TemplateManager
          activeTemplate={draft.template}
          templates={generator.templates}
          onAddTemplate={generator.addTemplate}
          onSelectTemplate={generator.selectTemplate}
          onRemoveTemplate={generator.removeTemplate}
          isDark={isDark}
        />
      )}

      {generator.step === "areas" && draft.template && (
        <AreaDesigner
          template={draft.template}
          areas={draft.areas}
          selectedAreaId={draft.selectedAreaId}
          sampleData={draft.sampleData}
          onAddArea={generator.addArea}
          onSelectArea={generator.selectArea}
          onUpdateArea={generator.updateArea}
          onRemoveArea={generator.removeArea}
          onNext={() => generator.setStep("text")}
          isDark={isDark}
        />
      )}

      {generator.step === "text" && draft.template && (
        <TextLayerEditor
          template={draft.template}
          areas={draft.areas}
          selectedArea={generator.selectedArea}
          selectedAreaId={draft.selectedAreaId}
          variables={variables}
          sampleData={draft.sampleData}
          onSelectArea={generator.selectArea}
          onUpdateArea={generator.updateArea}
          onUpdateSampleData={generator.updateSampleData}
          onBack={() => generator.setStep("areas")}
          onNext={() => generator.setStep("data")}
          isDark={isDark}
        />
      )}

      {generator.step === "data" && draft.template && (
        <DataImportPanel
          template={draft.template}
          areas={draft.areas}
          variables={variables}
          dataSet={draft.dataSet}
          exporting={generator.exporting}
          onDataSet={generator.setDataSet}
          onBack={() => generator.setStep("text")}
          onExport={generator.runExport}
          isDark={isDark}
        />
      )}

      {generator.step === "generations" && (
        <GenerationsPanel
          generations={generator.generations}
          onDelete={generator.removeGeneration}
          onDownload={generator.downloadGeneration}
          isDark={isDark}
        />
      )}
    </div>
  );
}
