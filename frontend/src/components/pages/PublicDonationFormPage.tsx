import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useSnackbar } from "notistack";
import { useSettings } from "../../hooks/context/SettingsContext";
import NavBar from "../layout/NavBar";
import Footer from "../layout/Footer";
import Iconify from "../modularUI/IconsMock";
import type { DonationField, DonationForm } from "../../platform/donations/types";
import { getPublicDonationForm, submitDonationResponse } from "../../platform/APIs/donations";
import { getGuidedFormSteps, shouldDeferCardNavigation, visibleFields } from "../../platform/donations/analytics";
import DonationOptionPicker from "../../platform/donations/DonationOptionPicker";
import { formatDonationDate } from "../../platform/donations/dates";
import { resolveDonationFormIcon } from "../../platform/donations/icons";

function inputType(field: DonationField) {
  if (field.type === "email") return "email";
  if (field.type === "phone") return "tel";
  if (field.type === "date") return "date";
  if (field.type === "number") return "number";
  return "text";
}

function emptyValue() {
  return "";
}

type DonationValues = Record<string, string | number | boolean>;

function getFieldErrors(fields: DonationField[], values: DonationValues) {
  const fieldErrors: Record<string, string> = {};
  fields.forEach((field) => {
    const value = values[field.id] ?? emptyValue();
    const isEmpty = value === "" || value === undefined || value === null;
    if (field.required && isEmpty) {
      fieldErrors[field.id] = "Este campo es obligatorio.";
      return;
    }
    if (isEmpty) return;
    if (field.maxLength && String(value).length > field.maxLength) {
      fieldErrors[field.id] = `Maximo ${field.maxLength} caracteres.`;
    }
    if (field.type === "number") {
      const numberValue = Number(value);
      if (field.min !== undefined && numberValue < field.min) fieldErrors[field.id] = `Minimo ${field.min}.`;
      if (field.max !== undefined && numberValue > field.max) fieldErrors[field.id] = `Maximo ${field.max}.`;
    }
    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
      fieldErrors[field.id] = "Correo invalido.";
    }
    if (field.type === "phone" && String(value).replace(/\D/g, "").length < 7) {
      fieldErrors[field.id] = "Telefono demasiado corto.";
    }
    if (field.type === "date" && Number.isNaN(new Date(String(value)).getTime())) {
      fieldErrors[field.id] = "Fecha invalida.";
    }
  });
  return fieldErrors;
}

export default function PublicDonationFormPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const { theme } = useSettings();
  const isDark = theme === "dark";

  const [form, setForm] = useState<DonationForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [values, setValues] = useState<DonationValues>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [pendingSection, setPendingSection] = useState("");
  const [visitedStepKeys, setVisitedStepKeys] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getPublicDonationForm(slug)
      .then((data) => {
        setForm(data);
        setLoadError("");
        setValues({});
        setErrors({});
        setCurrentStep(0);
        setPendingSection("");
        setVisitedStepKeys(new Set());
        setSubmitted(false);
      })
      .catch((err: unknown) => {
        setLoadError(err instanceof Error ? err.message : "Formulario no disponible.");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const fields = useMemo(() => (form ? visibleFields(form, values) : []), [form, values]);
  const primaryField = form?.primaryFieldId ? form.fields.find((field) => field.id === form.primaryFieldId) : undefined;
  const groupedFields = useMemo(() => {
    const regularFields = form?.mode === "guided"
      ? fields.filter((field) => field.id !== primaryField?.id)
      : fields;
    return regularFields.reduce<Record<string, DonationField[]>>((groups, field) => {
      groups[field.section] = [...(groups[field.section] ?? []), field];
      return groups;
    }, {});
  }, [fields, form?.mode, primaryField]);
  const guidedSteps = useMemo(() => {
    if (!form) return [];
    return getGuidedFormSteps(form, fields);
  }, [fields, form]);
  const activeStep = guidedSteps[Math.min(currentStep, Math.max(0, guidedSteps.length - 1))];

  useEffect(() => {
    if (guidedSteps.length > 0 && currentStep >= guidedSteps.length) {
      setCurrentStep(guidedSteps.length - 1);
    }
  }, [currentStep, guidedSteps.length]);

  useEffect(() => {
    if (!pendingSection) return;
    const destinationIndex = guidedSteps.findIndex((step) => step.title === pendingSection);
    if (destinationIndex >= 0) {
      if (activeStep) {
        setVisitedStepKeys((current) => new Set(current).add(activeStep.key));
      }
      setCurrentStep(destinationIndex);
      setPendingSection("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeStep, guidedSteps, pendingSection]);

  const pageBg = isDark ? "#05070b" : "#f7fafc";
  const text = isDark ? "#fff" : "#0f172a";
  const muted = isDark ? "rgba(255,255,255,0.52)" : "#64748b";
  const panel = {
    background: isDark ? "rgba(255,255,255,0.035)" : "#ffffff",
    borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
  };
  const control = {
    background: isDark ? "rgba(255,255,255,0.045)" : "#f8fafc",
    borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.12)",
    color: text,
  };

  function setFieldValue(field: DonationField, value: string | boolean) {
    const nextValue = field.type === "number" && value !== "" ? Number(value) : value;
    setValues((current) => ({ ...current, [field.id]: nextValue }));
    setErrors((current) => ({ ...current, [field.id]: "" }));
    const changedStepIndex = guidedSteps.findIndex((step) => step.fields.some((stepField) => stepField.id === field.id));
    if (changedStepIndex >= 0) {
      setVisitedStepKeys((current) => new Set(
        [...current].filter((key) => guidedSteps.findIndex((step) => step.key === key) < changedStepIndex),
      ));
    }
  }

  function validateFields(fieldsToValidate: DonationField[]) {
    const nextErrors = getFieldErrors(fieldsToValidate, values);
    setErrors((current) => {
      const next = { ...current };
      fieldsToValidate.forEach((field) => delete next[field.id]);
      return { ...next, ...nextErrors };
    });
    return Object.keys(nextErrors).length === 0;
  }

  function nextStep() {
    if (!activeStep || !validateFields(activeStep.fields)) return;
    setVisitedStepKeys((current) => new Set(current).add(activeStep.key));
    setCurrentStep((step) => Math.min(guidedSteps.length - 1, step + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitForm() {
    if (!form || submitting) return;
    if (form.mode === "guided") {
      const firstUnvisitedIndex = guidedSteps.findIndex((step, index) =>
        step.fields.length > 0 && index !== currentStep && !visitedStepKeys.has(step.key),
      );
      if (firstUnvisitedIndex >= 0) {
        setCurrentStep(firstUnvisitedIndex);
        enqueueSnackbar("Completa todos los pasos antes de enviar", { variant: "warning" });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    const allErrors = getFieldErrors(fields, values);
    setErrors(allErrors);
    if (Object.keys(allErrors).length > 0) {
      if (form.mode === "guided") {
        const invalidStepIndex = guidedSteps.findIndex((step) =>
          step.fields.some((field) => Boolean(allErrors[field.id])),
        );
        if (invalidStepIndex >= 0) setCurrentStep(invalidStepIndex);
      }
      enqueueSnackbar("Revisa los campos pendientes antes de enviar", { variant: "warning" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const sourceParam = searchParams.get("source");
    setSubmitting(true);
    try {
      const visibleValues = Object.fromEntries(fields.map((field) => [field.id, values[field.id] ?? emptyValue()]));
      await submitDonationResponse(form.id, {
        source: sourceParam === "qr" || sourceParam === "link" ? sourceParam : "direct",
        values: visibleValues,
        userAgent: navigator.userAgent,
      });
      setSubmitted(true);
      enqueueSnackbar("Registro recibido correctamente", { variant: "success" });
    } catch (err: unknown) {
      enqueueSnackbar(err instanceof Error ? err.message : "No se pudo enviar el registro", { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  function renderField(field: DonationField, featured = false) {
    const value = values[field.id] ?? emptyValue();
    const commonClass = `w-full rounded-2xl border px-4 ${featured ? "py-4 text-lg font-black" : "py-3 text-sm"} outline-none transition-all`;

    return (
      <div key={field.id}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <label className="text-sm font-black" style={{ color: text }}>
            {field.label}
            {field.required && <span style={{ color: "#ef4444" }}> *</span>}
          </label>
          {field.maxLength && (
            <span className="text-[10px] font-bold" style={{ color: muted }}>
              {String(value).length}/{field.maxLength}
            </span>
          )}
        </div>

        {field.type === "select" ? (
          <DonationOptionPicker
            value={String(value)}
            options={field.options ?? []}
            display={field.selectDisplay ?? "autocomplete"}
            optionSubmenus={field.optionSubmenus}
            onChange={(nextValue) => setFieldValue(field, nextValue)}
            shouldDeferNavigation={(option) => Boolean(form && shouldDeferCardNavigation(form, field.id, option, values))}
            onNavigate={(section) => {
              if (form?.mode === "guided") setPendingSection(section);
            }}
            style={control}
            featured={featured}
          />
        ) : field.type === "textarea" ? (
          <textarea
            value={String(value)}
            maxLength={field.maxLength}
            placeholder={field.placeholder}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setFieldValue(field, event.target.value)}
            className={`${commonClass} min-h-28 resize-y`}
            style={control}
          />
        ) : field.type === "boolean" ? (
          <div className="grid grid-cols-2 gap-2" role="group" aria-label={field.label}>
            {[{ label: "Si", value: true }, { label: "No", value: false }].map((option) => {
              const selected = value === option.value;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setFieldValue(field, option.value)}
                  className="rounded-2xl border px-4 py-3 flex items-center justify-center gap-2 text-sm font-black"
                  style={{ ...control, borderColor: selected ? "#f59e0b" : control.borderColor, background: selected ? "rgba(245,158,11,0.1)" : control.background }}
                >
                  <Iconify IconString={selected ? "solar:check-circle-bold-duotone" : "solar:circle-linear"} Size={19} Style={{ color: selected ? "#f59e0b" : muted }} />
                  {option.label}
                </button>
              );
            })}
          </div>
        ) : (
          <input
            type={inputType(field)}
            value={String(value)}
            min={field.min}
            max={field.max}
            maxLength={field.maxLength}
            placeholder={field.placeholder}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setFieldValue(field, event.target.value)}
            className={commonClass}
            style={control}
          />
        )}

        {field.helper && <p className="text-xs mt-2" style={{ color: muted }}>{field.helper}</p>}
        {field.id === form?.respondentFieldId && form.respondentSubmissionLimit && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-bold" style={{ color: "#f59e0b" }}>
            <Iconify IconString="solar:shield-check-bold-duotone" Size={15} />
            Maximo {form.respondentSubmissionLimit} {form.respondentSubmissionLimit === 1 ? "registro" : "registros"} con este identificador.
          </p>
        )}
        {errors[field.id] && <p className="text-xs font-bold mt-2" style={{ color: "#ef4444" }}>{errors[field.id]}</p>}
      </div>
    );
  }

  if (loading || !form || loadError) {
    return (
      <div style={{ background: pageBg, minHeight: "100vh" }}>
        <NavBar />
        <main className="pt-36 pb-20 px-4">
          <div className="max-w-xl mx-auto rounded-2xl border p-8 text-center" style={panel}>
            <Iconify IconString={loading ? "solar:refresh-bold-duotone" : "solar:file-remove-bold-duotone"} Size={38} Style={{ color: "#f59e0b", margin: "0 auto 12px" }} />
            <h1 className="text-2xl font-black" style={{ color: text }}>{loading ? "Cargando formulario" : "Formulario no disponible"}</h1>
            <p className="text-sm mt-2" style={{ color: muted }}>
              {loading ? "Estamos preparando el formulario." : loadError || "Puede estar oculto, en borrador o haber cambiado de enlace."}
            </p>
            {!loading && (
              <Link to="/formularios" className="inline-flex mt-5 px-4 py-2 rounded-xl text-sm font-black text-white" style={{ background: "#f59e0b" }}>
                Ver formularios publicados
              </Link>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ background: pageBg, minHeight: "100vh" }}>
      <NavBar />
      <main className="pt-32 sm:pt-36 pb-16 px-4 sm:px-6">
        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={(event) => event.preventDefault()}
          className="max-w-3xl mx-auto"
        >
          <Link to="/formularios" className="inline-flex items-center gap-2 text-xs font-black mb-5" style={{ color: muted }}>
            <Iconify IconString="solar:alt-arrow-left-linear" Size={15} />
            Formularios
          </Link>

          <div className="rounded-3xl border overflow-hidden" style={panel}>
            <div className="p-5 sm:p-8 border-b" style={{ borderColor: panel.borderColor }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: "#f59e0b" }}>
                    Registro de formulario
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight mt-2" style={{ color: text }}>
                    {form.title}
                  </h1>
                  {form.eventDate && (
                    <p className="inline-flex items-center gap-1.5 text-xs font-black mt-3" style={{ color: "#f59e0b" }}>
                      <Iconify IconString="solar:calendar-date-bold-duotone" Size={16} />
                      {formatDonationDate(form.eventDate)}
                    </p>
                  )}
                  <p className="text-sm mt-3 max-w-2xl" style={{ color: muted }}>{form.description}</p>
                </div>
                <div className="flex w-10 h-10 sm:w-12 sm:h-12 rounded-2xl items-center justify-center shrink-0"
                  style={{ background: "rgba(245,158,11,0.14)", border: "1px solid rgba(245,158,11,0.24)" }}>
                  <Iconify IconString={resolveDonationFormIcon(form.headerIcon)} Size={26} Style={{ color: "#f59e0b" }} />
                </div>
              </div>
            </div>

            {submitted ? (
              <div className="p-8 sm:p-12 text-center">
                <Iconify IconString="solar:check-circle-bold-duotone" Size={52} Style={{ color: "#22c55e", margin: "0 auto 14px" }} />
                <h2 className="text-2xl font-black" style={{ color: text }}>Registro recibido</h2>
                <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: muted }}>{form.thankYouMessage}</p>
                <Link to="/formularios" className="inline-flex mt-6 px-4 py-2 rounded-xl text-sm font-black text-white" style={{ background: "#f59e0b" }}>
                  Ver mas formularios
                </Link>
              </div>
            ) : (
              <div className="p-5 sm:p-8 space-y-6">
                {form.mode === "guided" && activeStep ? (
                  <>
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="text-xs font-black" style={{ color: "#f59e0b" }}>
                          Paso {currentStep + 1} de {guidedSteps.length}
                        </span>
                        <span className="text-xs font-bold truncate" style={{ color: muted }}>{activeStep.title}</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${((currentStep + 1) / guidedSteps.length) * 100}%`, background: "#f59e0b" }} />
                      </div>
                    </div>

                    <motion.section
                      key={activeStep.key}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="rounded-2xl border p-5 sm:p-6 space-y-5"
                      style={{ borderColor: currentStep === 0 && primaryField ? "rgba(245,158,11,0.28)" : panel.borderColor, background: currentStep === 0 && primaryField ? "rgba(245,158,11,0.08)" : "transparent" }}
                    >
                      <div>
                        <h2 className="text-xl font-black" style={{ color: text }}>{activeStep.title}</h2>
                        <p className="text-xs mt-1" style={{ color: muted }}>Completa esta etapa para continuar.</p>
                      </div>
                      <div className="grid gap-5">
                        {activeStep.fields.length > 0 ? (
                          activeStep.fields.map((field) => renderField(field, field.id === primaryField?.id))
                        ) : (
                          <div className="rounded-xl border border-dashed px-4 py-5 text-center text-xs font-bold" style={{ color: muted, borderColor: panel.borderColor }}>
                            Esta etapa se habilitara segun las respuestas de los pasos anteriores.
                          </div>
                        )}
                      </div>
                    </motion.section>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        disabled={currentStep === 0}
                        onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
                        className="rounded-2xl py-4 text-sm font-black border flex items-center justify-center gap-2 disabled:opacity-40"
                        style={{ ...control, color: text }}
                      >
                        <Iconify IconString="solar:alt-arrow-left-linear" Size={18} />
                        Anterior
                      </button>
                      {currentStep < guidedSteps.length - 1 ? (
                        <button
                          type="button"
                          onClick={nextStep}
                          className="rounded-2xl py-4 text-sm font-black text-white flex items-center justify-center gap-2"
                          style={{ background: "#f59e0b" }}
                        >
                          Continuar
                          <Iconify IconString="solar:alt-arrow-right-linear" Size={18} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={submitForm}
                          disabled={submitting}
                          className="rounded-2xl py-4 text-sm font-black text-white flex items-center justify-center gap-2 disabled:opacity-60"
                          style={{ background: "linear-gradient(135deg, #ef4444, #f59e0b)" }}
                        >
                          <Iconify IconString="solar:send-square-bold-duotone" Size={19} />
                          {submitting ? "Enviando" : "Enviar"}
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {Object.entries(groupedFields).map(([section, sectionFields]) => (
                      <section key={section} className="space-y-4">
                        <div className="grid gap-4">
                          {sectionFields.map((field) => renderField(field))}
                        </div>
                      </section>
                    ))}
                    <button
                      type="button"
                      onClick={submitForm}
                      disabled={submitting}
                      className="w-full rounded-2xl py-4 text-sm font-black text-white flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg, #ef4444, #f59e0b)" }}
                    >
                      <Iconify IconString="solar:send-square-bold-duotone" Size={19} />
                      {submitting ? "Enviando" : "Enviar"}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.form>
      </main>
      <Footer />
    </div>
  );
}
