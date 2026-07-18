import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { motion, AnimatePresence } from "framer-motion";
import { enqueueSnackbar } from "notistack";
import { useSettings } from "../../hooks/context/SettingsContext";
import Iconify from "../modularUI/IconsMock";
import {
  FormManaged,
  RHFTextField,
  RHFTextArea,
  RHFSelect,
  RHFCheckbox,
  RHFChipGroup,
  RHFDatePicker,
} from "./index";
import {
  volunteerSchema,
  volunteerDefaultValues,
  type VolunteerFormValues,
} from "./schemas";


import { submitVolunteer } from "../../platform/APIs/solicitudes";
import { useLanguage } from "../../i18n/LanguageContext";

async function submitVolunteerForm(data: VolunteerFormValues): Promise<void> {
  await submitVolunteer(data);
}


const AREA_OPTIONS = [
  { value: "educacion",      label: "Educación y Capacitación" },
  { value: "salud",          label: "Salud Comunitaria" },
  { value: "medioambiente",  label: "Medio Ambiente" },
  { value: "arte",           label: "Arte y Cultura" },
  { value: "tecnologia",     label: "Tecnología e Innovación" },
  { value: "comunicaciones", label: "Comunicaciones y Redes" },
  { value: "logistica",      label: "Logística y Operaciones" },
  { value: "administrativo", label: "Apoyo Administrativo" },
];

const AVAILABILITY_OPTIONS = [
  { value: "fines_semana",      label: "Fines de semana" },
  { value: "entre_semana",      label: "Entre semana" },
  { value: "tiempo_completo",   label: "Tiempo completo" },
  { value: "eventos_puntuales", label: "Eventos puntuales" },
];

const EDUCATION_OPTIONS = [
  { value: "bachillerato", label: "Bachillerato" },
  { value: "tecnico",      label: "Técnico / Tecnólogo" },
  { value: "licenciatura", label: "Licenciatura" },
  { value: "maestria",     label: "Maestría / Postgrado" },
  { value: "doctorado",    label: "Doctorado" },
];

const REFERRAL_OPTIONS = [
  { value: "redes_sociales", label: "Redes Sociales" },
  { value: "amigo_familiar", label: "Un amigo / familiar" },
  { value: "evento",         label: "Evento presencial" },
  { value: "internet",       label: "Búsqueda en internet" },
  { value: "otro",           label: "Otro" },
];

function SectionLabel({ icon, label, isDark }: { icon: string; label: string; isDark: boolean }) {
  return (
    <div className="flex items-center gap-2.5 mb-1">
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
        style={{ background: "rgba(245,158,11,0.12)" }}
      >
        <Iconify IconString={icon} Size={18} Style={{ color: "#f59e0b" }} />
      </div>
      <span className={`text-sm font-black tracking-wide ${isDark ? "text-white/80" : "text-slate-700"}`}>
        {label}
      </span>
    </div>
  );
}

function Divider({ isDark }: { isDark: boolean }) {
  return <div className={`h-px w-full ${isDark ? "bg-white/6" : "bg-black/5"}`} />;
}


export default function VolunteerFormSection() {
  const { theme } = useSettings();
  const { t } = useLanguage();
  const isDark = theme === "dark";
  const volunteerText = t("volunteerForm");
  const areaOptions = AREA_OPTIONS.map((option, index) => ({ ...option, label: volunteerText.options.areas[index] }));
  const availabilityOptions = AVAILABILITY_OPTIONS.map((option, index) => ({ ...option, label: volunteerText.options.availability[index] }));
  const educationOptions = EDUCATION_OPTIONS.map((option, index) => ({ ...option, label: volunteerText.options.education[index] }));
  const referralOptions = REFERRAL_OPTIONS.map((option, index) => ({ ...option, label: volunteerText.options.referral[index] }));

  const methods = useForm<VolunteerFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(volunteerSchema) as any,
    defaultValues: volunteerDefaultValues,
    mode: "onTouched",
  });

  const { formState: { isSubmitting }, reset } = methods;

  const onSubmit = async (data: VolunteerFormValues) => {
    try {
      await submitVolunteerForm(data);
      enqueueSnackbar(volunteerText.success, { variant: "success" });
      reset();
    } catch {
      enqueueSnackbar(volunteerText.error, { variant: "error" });
    }
  };

  const cardBg        = isDark ? "bg-white/[0.03] border-white/[0.07]" : "bg-white/80 border-black/[0.06]";
  const textSecondary = isDark ? "text-white/45" : "text-slate-500";

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <FormManaged methods={methods as any} onSubmit={onSubmit}>
      <div className={`w-full max-w-3xl mx-auto p-5 sm:p-8 md:p-12 rounded-3xl border backdrop-blur-md ${cardBg}`}>
        <div className="flex flex-col gap-8">

          <div className="flex flex-col gap-3">
            <SectionLabel icon="solar:user-bold-duotone" label={volunteerText.personalInfo} isDark={isDark} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RHFTextField<VolunteerFormValues>
                name="firstName"
                label={volunteerText.firstName}
                placeholder={volunteerText.firstNamePlaceholder}
                required
                autoComplete="given-name"
              />
              <RHFTextField<VolunteerFormValues>
                name="lastName"
                label={volunteerText.lastName}
                placeholder={volunteerText.lastNamePlaceholder}
                required
                autoComplete="family-name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RHFTextField<VolunteerFormValues>
                name="idDocument"
                label={volunteerText.idDocument}
                required
                documentMode
              />
              <RHFDatePicker<VolunteerFormValues>
                name="birthDate"
                label={volunteerText.birthDate}
                required
                maxDate={new Date()}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RHFTextField<VolunteerFormValues>
                name="address"
                label={volunteerText.address}
                placeholder={volunteerText.addressPlaceholder}
                autoComplete="street-address"
              />
              <RHFTextField<VolunteerFormValues>
                name="municipio"
                label={volunteerText.municipio}
                placeholder={volunteerText.municipioPlaceholder}
                required
                autoComplete="address-level2"
              />
            </div>
          </div>

          <Divider isDark={isDark} />

          <div className="flex flex-col gap-3">
            <SectionLabel icon="solar:phone-bold-duotone" label={volunteerText.contactData} isDark={isDark} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RHFTextField<VolunteerFormValues>
                name="email"
                label={volunteerText.email}
                placeholder="correo@ejemplo.com"
                type="email"
                required
                autoComplete="email"
              />
              <RHFTextField<VolunteerFormValues>
                name="phone"
                label={volunteerText.phone}
                type="tel"
                required
                autoComplete="tel"
                phoneMode
              />
            </div>

            <RHFTextField<VolunteerFormValues>
              name="socialMedia"
              label={volunteerText.socialMedia}
              placeholder={volunteerText.socialMediaPlaceholder}
            />
          </div>

          <Divider isDark={isDark} />

          <div className="flex flex-col gap-3">
            <SectionLabel icon="solar:bag-bold-duotone" label={volunteerText.professionalProfile} isDark={isDark} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RHFTextField<VolunteerFormValues>
                name="occupation"
                label={volunteerText.occupation}
                placeholder={volunteerText.occupationPlaceholder}
              />
              <RHFSelect<VolunteerFormValues>
                name="educationLevel"
                label={volunteerText.educationLevel}
                options={educationOptions}
                placeholder={volunteerText.educationPlaceholder}
              />
            </div>

            <RHFTextArea<VolunteerFormValues>
              name="skills"
              label={volunteerText.skills}
              placeholder={volunteerText.skillsPlaceholder}
              rows={4}
            />
          </div>

          <Divider isDark={isDark} />

          {/* ── 4. Áreas de Interés ── */}
          <div className="flex flex-col gap-3">
            <SectionLabel icon="solar:star-bold-duotone" label={volunteerText.interestAreas} isDark={isDark} />
            <p className={`text-xs ${textSecondary}`}>
              {volunteerText.interestHint}
            </p>
            <RHFChipGroup<VolunteerFormValues>
              name="areas"
              label=""
              options={areaOptions}
              multiple
              required
            />
          </div>

          <Divider isDark={isDark} />

          {/* ── 5. Disponibilidad ── */}
          <div className="flex flex-col gap-3">
            <SectionLabel icon="solar:calendar-bold-duotone" label={volunteerText.availability} isDark={isDark} />

            <RHFChipGroup<VolunteerFormValues>
              name="availability"
              label={volunteerText.availabilityQuestion}
              options={availabilityOptions}
              required
            />

            <RHFTextField<VolunteerFormValues>
              name="weeklyHours"
              label={volunteerText.weeklyHours}
              placeholder={volunteerText.weeklyHoursPlaceholder}
            />
          </div>

          <Divider isDark={isDark} />

          {/* ── 6. Motivación ── */}
          <div className="flex flex-col gap-3">
            <SectionLabel icon="solar:heart-bold-duotone" label={volunteerText.motivation} isDark={isDark} />

            <RHFTextArea<VolunteerFormValues>
              name="motivation"
              label={volunteerText.motivationQuestion}
              placeholder={volunteerText.motivationPlaceholder}
              rows={4}
              required
            />

            <RHFSelect<VolunteerFormValues>
              name="referral"
              label={volunteerText.referral}
              options={referralOptions}
              placeholder={volunteerText.referralPlaceholder}
            />
          </div>

          <Divider isDark={isDark} />

          {/* ── 7. Contacto de Emergencia ── */}
          <div className="flex flex-col gap-3">
            <SectionLabel icon="solar:shield-bold-duotone" label={volunteerText.emergencyContact} isDark={isDark} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RHFTextField<VolunteerFormValues>
                name="emergencyName"
                label={volunteerText.emergencyName}
                placeholder={volunteerText.emergencyNamePlaceholder}
                required
              />
              <RHFTextField<VolunteerFormValues>
                name="emergencyRelation"
                label={volunteerText.emergencyRelation}
                placeholder={volunteerText.emergencyRelationPlaceholder}
                required
              />
            </div>

            <RHFTextField<VolunteerFormValues>
              name="emergencyPhone"
              label={volunteerText.emergencyPhone}
              type="tel"
              required
              phoneMode
            />
          </div>

          <div className="flex flex-col gap-5 pt-2">
            <RHFCheckbox<VolunteerFormValues>
              name="acceptTerms"
              label={
                <>
                  {volunteerText.terms}
                </>
              }
            />

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={!isSubmitting ? { scale: 1.02 } : {}}
              whileTap={!isSubmitting ? { scale: 0.97 } : {}}
              className="w-full py-4 rounded-xl font-black text-sm tracking-wider cursor-pointer
                flex items-center justify-center gap-2.5 transition-all duration-300
                disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg,#f59e0b,#fb923c)",
                color: "#fff",
                boxShadow: "0 10px 30px rgba(245,158,11,0.4)",
                letterSpacing: "0.08em",
              }}
            >
              <AnimatePresence mode="wait">
                {isSubmitting ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    {volunteerText.sending}
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Iconify IconString="solar:file-send-bold-duotone" Size={20} />
                    {volunteerText.submit}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {!isSubmitting && (
              <p className={`text-center text-xs ${textSecondary}`}>
                {volunteerText.thanks}
              </p>
            )}
          </div>

        </div>
      </div>
    </FormManaged>
  );
}
