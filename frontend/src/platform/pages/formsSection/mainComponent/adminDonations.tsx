import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { useSnackbar } from "notistack";
import { useSettings } from "../../../../hooks/context/SettingsContext";
import Iconify from "../../../../components/modularUI/IconsMock";
import type {
  DonationField,
  DonationFilters,
  DonationForm,
  DonationResponse,
} from "../../../donations/types";
import DonationOptionPicker from "../../../donations/DonationOptionPicker";
import {
  createDonationField,
  createDonationForm,
} from "../../../donations/storage";
import {
  createAdminDonationForm,
  deleteAdminDonationForm,
  getAdminDonationForms,
  getAdminDonationResponses,
  updateAdminDonationForm,
} from "../../../APIs/donations";
import {
  filterResponses,
  getGuidedFormSteps,
  shouldDeferCardNavigation,
  visibleFields,
} from "../../../donations/analytics";
import DynamicFields from "../secondaryComponents/DynamicFields";
import { AdminSelect } from "../secondaryComponents/MinorsComponents";
import type { AdminOption, TabKey } from "../types";
import PreviewForm from "../secondaryComponents/PreviewForm";
import ReportsTab from "../secondaryComponents/ReportsTab";
import BucketTab from "../secondaryComponents/bucketTab";



export default function AdminDonationsPage() {
  const { theme } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const isDark = theme === "dark";
  const [forms, setForms] = useState<DonationForm[]>([]);
  const [responses, setResponses] = useState<DonationResponse[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("builder");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [target, setTarget] = useState(100);
  const [scatterXFieldId, setScatterXFieldId] = useState("");
  const [scatterYFieldId, setScatterYFieldId] = useState("");
  const [conditionFieldId, setConditionFieldId] = useState("");
  const [conditionValue, setConditionValue] = useState("");
  const [outcomeFieldId, setOutcomeFieldId] = useState("");
  const [bucketPage, setBucketPage] = useState(1);
  const [previewStep, setPreviewStep] = useState(0);
  const [previewPendingSection, setPreviewPendingSection] = useState("");
  const [previewValues, setPreviewValues] = useState<Record<string, string | number | boolean>>({});
  const [filters, setFilters] = useState<DonationFilters>({
    formId: forms[0]?.id ?? "all",
    search: "",
    source: "all",
    device: "all",
    location: "",
    dateFrom: "",
    dateTo: "",
    fieldId: "",
    fieldValue: "",
  });

  const selectedForm = useMemo(() => forms.find((form) => form.id === selectedId) ?? forms[0], [forms, selectedId]);
  const selectedResponses = useMemo(
    () => filterResponses(responses, { ...filters, formId: filters.formId === "all" ? selectedForm?.id ?? "all" : filters.formId }),
    [filters, responses, selectedForm],
  );
  const numericFields = useMemo(
    () => selectedForm?.fields.filter((field) => field.type === "number") ?? [],
    [selectedForm],
  );
  const conditionFields = useMemo(
    () => selectedForm?.fields.filter((field) => field.type === "select" || field.type === "boolean") ?? [],
    [selectedForm],
  );
  const sectionOptions = useMemo<AdminOption<string>[]>(() => {
    if (!selectedForm) return [];
    const counts = new Map<string, number>();
    selectedForm.fields.forEach((field) => {
      const section = field.section || "General";
      counts.set(section, (counts.get(section) ?? 0) + 1);
    });
    return [...counts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([section, count]) => ({
        label: section,
        value: section,
        description: `${count} ${count === 1 ? "campo configurado" : "campos configurados"} en este submenu.`,
      }));
  }, [selectedForm]);
  const previewFields = useMemo(
    () => selectedForm ? visibleFields(selectedForm, previewValues) : [],
    [previewValues, selectedForm],
  );
  const previewPrimaryField = selectedForm?.primaryFieldId
    ? selectedForm.fields.find((field) => field.id === selectedForm.primaryFieldId)
    : undefined;
  const previewGroupedFields = useMemo(() => {
    if (!selectedForm) return {} as Record<string, DonationField[]>;
    const regularFields = selectedForm.mode === "guided"
      ? previewFields.filter((field) => field.id !== previewPrimaryField?.id)
      : previewFields;
    return regularFields.reduce<Record<string, DonationField[]>>((groups, field) => {
      const section = field.section || "General";
      groups[section] = [...(groups[section] ?? []), field];
      return groups;
    }, {});
  }, [previewFields, previewPrimaryField?.id, selectedForm]);
  const previewSteps = useMemo(() => {
    if (!selectedForm) return [];
    return getGuidedFormSteps(selectedForm, previewFields);
  }, [previewFields, selectedForm]);

  const text = isDark ? "#ffffff" : "#0f172a";
  const muted = isDark ? "rgba(255,255,255,0.48)" : "#64748b";
  const cardStyle = {
    background: isDark ? "rgba(255,255,255,0.028)" : "#ffffff",
    borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
    boxShadow: isDark ? "none" : "0 1px 8px rgba(15,23,42,0.05)",
  };
  const inputStyle = {
    background: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc",
    borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.12)",
    color: text,
  };

  const qrUrl = selectedForm ? `${window.location.origin}/formularios/${selectedForm.slug}?source=qr` : "";



  useEffect(() => {
    Promise.all([getAdminDonationForms(), getAdminDonationResponses()])
      .then(([formsData, responsesData]) => {
        setForms(formsData.forms);
        setResponses(responsesData.responses);
        const firstId = formsData.forms[0]?.id ?? "";
        setSelectedId(firstId);
        setFilters((current) => ({ ...current, formId: firstId || "all" }));
      })
      .catch((err: unknown) => {
        enqueueSnackbar(err instanceof Error ? err.message : "No se pudo cargar donaciones", { variant: "error" });
      })
      .finally(() => setLoading(false));
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (!selectedForm) return;
    QRCode.toDataURL(qrUrl, {
      width: 360,
      margin: 2,
      color: { dark: "#0f172a", light: "#ffffff" },
    }).then(setQrDataUrl);
  }, [qrUrl, selectedForm]);

  useEffect(() => {
    const values: Record<string, string | number | boolean> = {};
    selectedForm?.fields.forEach((field) => {
      values[field.id] = "";
    });
    setPreviewValues(values);
    setPreviewStep(0);
    setPreviewPendingSection("");
  }, [selectedForm]);

  useEffect(() => {
    if (previewSteps.length > 0 && previewStep >= previewSteps.length) {
      setPreviewStep(previewSteps.length - 1);
    }
  }, [previewStep, previewSteps.length]);

  useEffect(() => {
    if (!previewPendingSection) return;
    const destinationIndex = previewSteps.findIndex((step) => step.title === previewPendingSection);
    if (destinationIndex >= 0) {
      setPreviewStep(destinationIndex);
      setPreviewPendingSection("");
    }
  }, [previewPendingSection, previewSteps]);

  useEffect(() => {
    const numericIds = numericFields.map((field) => field.id);
    const categoricalId = conditionFields[0]?.id ?? "";
    setScatterXFieldId(numericIds[0] ?? "");
    setScatterYFieldId(numericIds[1] ?? "");
    setOutcomeFieldId(numericIds[0] ?? "");
    setConditionFieldId(categoricalId);
    setConditionValue("");
  }, [conditionFields, numericFields, selectedForm?.id]);

  useEffect(() => {
    setBucketPage(1);
  }, [filters]);

  function persist(nextForms: DonationForm[]) {
    setForms(nextForms);
  }

  function updateForm(patch: Partial<DonationForm>) {
    if (!selectedForm) return;
    const nextForm = { ...selectedForm, ...patch, updatedAt: new Date().toISOString() };
    persist(forms.map((form) => (form.id === nextForm.id ? nextForm : form)));
  }

  function updateField(fieldId: string, patch: Partial<DonationField>) {
    if (!selectedForm) return;
    updateForm({
      fields: selectedForm.fields.map((field) => (field.id === fieldId ? { ...field, ...patch } : field)),
    });
  }

  function updateFieldSection(fieldId: string, nextSectionValue: string) {
    if (!selectedForm) return;
    const requestedSection = nextSectionValue.trim().replace(/\s+/g, " ").slice(0, 80) || "General";
    const existingSection = selectedForm.fields
      .map((field) => field.section || "General")
      .find((section) => section.toLocaleLowerCase("es") === requestedSection.toLocaleLowerCase("es"));
    const nextSection = existingSection ?? requestedSection;
    const currentField = selectedForm.fields.find((field) => field.id === fieldId);
    if (!currentField) return;
    const oldSection = currentField.section || "General";
    const sectionWillBeEmpty = selectedForm.fields.filter((field) => (field.section || "General") === oldSection).length === 1;

    updateForm({
      fields: selectedForm.fields.map((field) => {
        const updatedField = field.id === fieldId ? { ...field, section: nextSection } : field;
        if (!sectionWillBeEmpty || !updatedField.optionSubmenus) return updatedField;
        return {
          ...updatedField,
          optionSubmenus: Object.fromEntries(
            Object.entries(updatedField.optionSubmenus).map(([option, section]) => [option, section === oldSection ? nextSection : section]),
          ),
        };
      }),
    });
  }

  async function addForm() {
    const form = createDonationForm();
    try {
      const created = await createAdminDonationForm(form);
      persist([created, ...forms]);
      setSelectedId(created.id);
      setFilters((current) => ({ ...current, formId: created.id }));
      enqueueSnackbar("Formulario creado", { variant: "success" });
    } catch (err: unknown) {
      enqueueSnackbar(err instanceof Error ? err.message : "No se pudo crear el formulario", { variant: "error" });
    }
  }

  async function duplicateForm() {
    if (!selectedForm) return;
    const stamp = Date.now();
    const duplicate: DonationForm = {
      ...selectedForm,
      id: `form-${stamp}`,
      title: `${selectedForm.title} copia`,
      slug: `${selectedForm.slug}-copia-${stamp}`,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fields: selectedForm.fields.map((field) => ({ ...field })),
    };
    try {
      const created = await createAdminDonationForm(duplicate);
      persist([created, ...forms]);
      setSelectedId(created.id);
      setFilters((current) => ({ ...current, formId: created.id, fieldId: "", fieldValue: "" }));
      enqueueSnackbar("Formulario duplicado como borrador", { variant: "success" });
    } catch (err: unknown) {
      enqueueSnackbar(err instanceof Error ? err.message : "No se pudo duplicar", { variant: "error" });
    }
  }

  async function deleteForm() {
    if (!selectedForm || forms.length <= 1) {
      enqueueSnackbar("Debe existir al menos un formulario", { variant: "warning" });
      return;
    }
    try {
      await deleteAdminDonationForm(selectedForm.id);
      const nextForms = forms.filter((form) => form.id !== selectedForm.id);
      persist(nextForms);
      setSelectedId(nextForms[0].id);
      setFilters((current) => ({ ...current, formId: nextForms[0].id, fieldId: "", fieldValue: "" }));
      enqueueSnackbar("Formulario eliminado", { variant: "success" });
    } catch (err: unknown) {
      enqueueSnackbar(err instanceof Error ? err.message : "No se pudo eliminar", { variant: "error" });
    }
  }

  async function saveSelectedForm() {
    if (!selectedForm) return;
    setSaving(true);
    try {
      const saved = await updateAdminDonationForm(selectedForm.id, selectedForm);
      persist(forms.map((form) => (form.id === saved.id ? saved : form)));
      enqueueSnackbar("Formulario guardado", { variant: "success" });
    } catch (err: unknown) {
      enqueueSnackbar(err instanceof Error ? err.message : "No se pudo guardar", { variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  function addField() {
    if (!selectedForm) return;
    updateForm({ fields: [...selectedForm.fields, createDonationField(selectedForm.fields.length)] });
  }

  function removeField(fieldId: string) {
    if (!selectedForm || selectedForm.fields.length <= 1) return;
    const removedField = selectedForm.fields.find((field) => field.id === fieldId);
    const remainingFields = selectedForm.fields.filter((field) => field.id !== fieldId);
    const removedSection = removedField?.section || "General";
    const sectionWasRemoved = !remainingFields.some((field) => (field.section || "General") === removedSection);
    updateForm({
      fields: remainingFields.map((field) => {
        if (!sectionWasRemoved || !field.optionSubmenus) return field;
        return {
          ...field,
          optionSubmenus: Object.fromEntries(
            Object.entries(field.optionSubmenus).filter(([, section]) => section !== removedSection),
          ),
        };
      }),
      primaryFieldId: selectedForm.primaryFieldId === fieldId ? undefined : selectedForm.primaryFieldId,
      respondentFieldId: selectedForm.respondentFieldId === fieldId ? undefined : selectedForm.respondentFieldId,
      respondentSubmissionLimit: selectedForm.respondentFieldId === fieldId ? undefined : selectedForm.respondentSubmissionLimit,
      locationFieldId: selectedForm.locationFieldId === fieldId ? undefined : selectedForm.locationFieldId,
    });
  }

  async function refreshResponses() {
    try {
      const data = await getAdminDonationResponses();
      setResponses(data.responses);
      enqueueSnackbar("Datos actualizados", { variant: "success" });
    } catch (err: unknown) {
      enqueueSnackbar(err instanceof Error ? err.message : "No se pudieron actualizar los datos", { variant: "error" });
    }
  }

  function renderPreviewField(field: DonationField, featured = false) {
    const value = previewValues[field.id] ?? "";
    const setValue = (nextValue: string | number | boolean) => {
      setPreviewValues((current) => ({ ...current, [field.id]: nextValue }));
    };
    const controlClass = `w-full rounded-2xl border px-4 ${featured ? "py-4 text-base font-black" : "py-3 text-sm"} outline-none`;

    return (
      <div key={field.id}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <label className="text-sm font-black" style={{ color: text }}>
            {field.label}
            {field.required && <span style={{ color: "#ef4444" }}> *</span>}
          </label>
          {field.maxLength && (
            <span className="text-[10px] font-bold" style={{ color: muted }}>{String(value).length}/{field.maxLength}</span>
          )}
        </div>

        {field.type === "select" ? (
          <DonationOptionPicker
            value={String(value)}
            onChange={setValue}
            options={field.options ?? []}
            display={field.selectDisplay ?? "autocomplete"}
            optionSubmenus={field.optionSubmenus}
            onNavigate={selectedForm?.mode === "guided" ? setPreviewPendingSection : undefined}
            shouldDeferNavigation={(option) => Boolean(selectedForm && shouldDeferCardNavigation(selectedForm, field.id, option, previewValues))}
            style={inputStyle}
            featured={featured}
          />
        ) : field.type === "textarea" ? (
          <textarea
            value={String(value)}
            maxLength={field.maxLength}
            placeholder={field.placeholder}
            onChange={(event) => setValue(event.target.value)}
            className={`${controlClass} min-h-28 resize-y`}
            style={inputStyle}
          />
        ) : field.type === "boolean" ? (
          <div className="grid grid-cols-2 gap-2">
            {[{ label: "Si", value: true }, { label: "No", value: false }].map((option) => {
              const selected = value === option.value;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setValue(option.value)}
                  className="rounded-2xl border px-4 py-3 flex items-center justify-center gap-2 text-sm font-black"
                  style={{ ...inputStyle, borderColor: selected ? "#f59e0b" : inputStyle.borderColor, background: selected ? "rgba(245,158,11,0.1)" : inputStyle.background }}
                >
                  <Iconify IconString={selected ? "solar:check-circle-bold-duotone" : "solar:circle-linear"} Size={18} Style={{ color: selected ? "#f59e0b" : muted }} />
                  {option.label}
                </button>
              );
            })}
          </div>
        ) : (
          <input
            type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
            value={String(value)}
            min={field.min}
            max={field.max}
            maxLength={field.maxLength}
            placeholder={field.placeholder}
            onChange={(event) => setValue(field.type === "number" && event.target.value ? Number(event.target.value) : event.target.value)}
            className={`${controlClass} ${[
    "rounded-xl border px-3 py-2 text-sm outline-none",
    field.type === "number" &&
      "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
  ]
    .filter(Boolean)
    .join(" ")}`}
            style={inputStyle}
          />
        )}

        {field.helper && <p className="text-xs mt-2 leading-5" style={{ color: muted }}>{field.helper}</p>}
        {field.id === selectedForm?.respondentFieldId && selectedForm.respondentSubmissionLimit && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-bold" style={{ color: "#f59e0b" }}>
            <Iconify IconString="solar:shield-check-bold-duotone" Size={15} />
            Maximo {selectedForm.respondentSubmissionLimit} {selectedForm.respondentSubmissionLimit === 1 ? "registro" : "registros"} con este identificador.
          </p>
        )}
      </div>
    );
  }

  function renderFilters() {
    const fields = selectedForm?.fields ?? [];
    return (
      <div className="rounded-2xl border p-4 grid md:grid-cols-6 xl:grid-cols-8 gap-3" style={cardStyle}>
        <input
          value={filters.search}
          onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          placeholder="Buscar en respuestas"
          className="md:col-span-2 rounded-xl border px-3 py-2 text-sm outline-none"
          style={inputStyle}
        />
        <input
          value={filters.location}
          onChange={(event) => setFilters((current) => ({ ...current, location: event.target.value }))}
          placeholder="Lugar / ubicacion"
          className="rounded-xl border px-3 py-2 text-sm outline-none"
          style={inputStyle}
        />
        <AdminSelect
          value={filters.source}
          onChange={(value) => setFilters((current) => ({ ...current, source: value }))}
          options={[
            { label: "Todas las fuentes", value: "all" },
            { label: "QR", value: "qr" },
            { label: "Link", value: "link" },
            { label: "Directo", value: "direct" },
          ]}
          className="text-sm"
          style={inputStyle}
        />
        <AdminSelect
          value={filters.device}
          onChange={(value) => setFilters((current) => ({ ...current, device: value }))}
          options={[
            { label: "Todos los dispositivos", value: "all" },
            { label: "Movil", value: "mobile" },
            { label: "Tableta", value: "tablet" },
            { label: "Escritorio", value: "desktop" },
            { label: "Desconocido", value: "unknown" },
          ]}
          className="text-sm"
          style={inputStyle}
        />
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))}
          className="rounded-xl border px-3 py-2 text-sm outline-none"
          style={inputStyle}
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))}
          className="rounded-xl border px-3 py-2 text-sm outline-none"
          style={inputStyle}
        />
        <AdminSelect
          value={filters.fieldId}
          onChange={(value) => setFilters((current) => ({ ...current, fieldId: value }))}
          options={[
            { label: "Campo dinamico", value: "" },
            ...fields.map((field) => ({ label: field.label, value: field.id })),
          ]}
          className="text-sm"
          style={inputStyle}
        />
        <input
          value={filters.fieldValue}
          onChange={(event) => setFilters((current) => ({ ...current, fieldValue: event.target.value }))}
          placeholder="Valor del campo"
          className="md:col-span-2 rounded-xl border px-3 py-2 text-sm outline-none"
          style={inputStyle}
        />
        <div className="md:col-span-4 xl:col-span-6 flex items-center gap-2 text-xs font-bold" style={{ color: muted }}>
          <Iconify IconString="solar:filter-bold-duotone" Size={16} Style={{ color: "#f59e0b" }} />
          {selectedResponses.length} respuestas coinciden con los filtros activos.
        </div>
        <button
          type="button"
          onClick={() => setFilters((current) => ({ ...current, search: "", source: "all", device: "all", location: "", dateFrom: "", dateTo: "", fieldId: "", fieldValue: "" }))}
          className="rounded-xl px-3 py-2 text-xs font-black"
          style={{ color: muted, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.05)" }}
        >
          Limpiar filtros
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border p-6 text-sm font-bold" style={cardStyle}>Cargando modulo de donaciones...</div>
      </div>
    );
  }

  if (!selectedForm) {
    return (
      <div className="p-6">
        <button onClick={addForm} className="px-4 py-2 rounded-xl text-sm font-black text-white" style={{ background: "#f59e0b" }}>
          Crear primer formulario
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em]" style={{ color: "#f59e0b" }}>Modulo de donaciones</p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1" style={{ color: text }}>Formularios, datos y reportes</h1>
          <p className="text-sm mt-1" style={{ color: muted }}>
            Crea formularios dinamicos, publica enlaces, analiza resultados y revisa cada respuesta.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminSelect
            value={selectedForm.id}
            onChange={(value) => {
              setSelectedId(value);
              setFilters((current) => ({ ...current, formId: value, fieldId: "", fieldValue: "" }));
            }}
            options={forms.map((form) => ({ label: form.title, value: form.id }))}
            className="text-sm min-w-56"
            style={inputStyle}
          />
          <button onClick={saveSelectedForm} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-black text-white flex items-center gap-2 disabled:opacity-60" style={{ background: "#22c55e" }}>
            <Iconify IconString="solar:diskette-bold-duotone" Size={17} />
            {saving ? "Guardando" : "Guardar"}
          </button>
          <button onClick={addForm} className="px-4 py-2 rounded-xl text-sm font-black text-white flex items-center gap-2" style={{ background: "#f59e0b" }}>
            <Iconify IconString="solar:add-circle-bold-duotone" Size={17} />
            Nuevo
          </button>
          <button onClick={duplicateForm} className="px-3 py-2 rounded-xl text-sm font-black flex items-center gap-2" style={{ color: "#3b82f6", background: "rgba(59,130,246,0.12)" }}>
            <Iconify IconString="solar:copy-bold-duotone" Size={16} />
            Duplicar
          </button>
          <button onClick={deleteForm} className="px-3 py-2 rounded-xl text-sm font-black flex items-center gap-2" style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)" }}>
            <Iconify IconString="solar:trash-bin-trash-bold-duotone" Size={16} />
            Eliminar
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {[
          { key: "builder" as const, label: "Constructor", icon: "solar:settings-bold-duotone" },
          { key: "reports" as const, label: "Reportes", icon: "solar:chart-2-bold-duotone" },
          { key: "bucket" as const, label: "Bucket de datos", icon: "solar:database-bold-duotone" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 border shrink-0"
            style={{
              background: activeTab === tab.key ? "rgba(245,158,11,0.14)" : cardStyle.background,
              borderColor: activeTab === tab.key ? "rgba(245,158,11,0.35)" : cardStyle.borderColor,
              color: activeTab === tab.key ? "#f59e0b" : muted,
            }}
          >
            <Iconify IconString={tab.icon} Size={17} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "builder" && (
        <div className="grid xl:grid-cols-[minmax(0,1fr)_430px] gap-4 items-start">
         <DynamicFields  cardStyle={cardStyle} inputStyle={inputStyle} text={text} muted={muted} selectedForm={selectedForm} updateForm={updateForm} addField={addField} removeField={removeField} updateField={updateField} updateFieldSection={updateFieldSection} sectionOptions={sectionOptions} isDark={isDark} />

          <PreviewForm  cardStyle={cardStyle} inputStyle={inputStyle} text={text} muted={muted} selectedForm={selectedForm} qrDataUrl={qrDataUrl} previewSteps={previewSteps} previewStep={previewStep} previewPrimaryField={previewPrimaryField} isDark={isDark} renderPreviewField={renderPreviewField} setPreviewStep={setPreviewStep} previewGroupedFields={previewGroupedFields} />
          
        </div>
      )}

      {activeTab === "reports" && (
        <ReportsTab renderFilters={renderFilters} cardStyle={cardStyle} text={text} muted={muted} selectedResponses={selectedResponses} selectedForm={selectedForm} target={target} scatterXFieldId={scatterXFieldId} scatterYFieldId={scatterYFieldId} setScatterXFieldId={setScatterXFieldId} setScatterYFieldId={setScatterYFieldId} numericFields={numericFields} inputStyle={inputStyle} isDark={isDark} conditionFields={conditionFields} conditionFieldId={conditionFieldId} setConditionFieldId={setConditionFieldId} setConditionValue={setConditionValue} conditionValue={conditionValue} outcomeFieldId={outcomeFieldId} setTarget={setTarget} setOutcomeFieldId={setOutcomeFieldId} />
      )}

      {activeTab === "bucket" && (
        <BucketTab renderFilters={renderFilters} cardStyle={cardStyle} text={text} muted={muted} selectedResponses={selectedResponses} selectedForm={selectedForm} inputStyle={inputStyle} bucketPage={bucketPage} refreshResponses={refreshResponses} setBucketPage={setBucketPage} />
      )}
    </div>
  );
}
