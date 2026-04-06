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
} from "./index";
import {
  volunteerSchema,
  volunteerDefaultValues,
  type VolunteerFormValues,
} from "./schemas";

// ─────────────────────────────────────────────────────────────────────────────
//  Service — swap to your actual API / emailjs call
// ─────────────────────────────────────────────────────────────────────────────
async function submitVolunteerForm(data: VolunteerFormValues): Promise<void> {
  // TODO: replace with your actual API call
  console.log("[VolunteerForm] submitted →", data);
  await new Promise((r) => setTimeout(r, 1400));
}

// ─────────────────────────────────────────────────────────────────────────────
//  Static option lists
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
//  Section header helper
// ─────────────────────────────────────────────────────────────────────────────
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
  return <div className={`h-px w-full ${isDark ? "bg-white/[0.06]" : "bg-black/5"}`} />;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function VolunteerFormSection() {
  const { theme } = useSettings();
  const isDark = theme === "dark";

  const methods = useForm<VolunteerFormValues>({
    resolver: yupResolver(volunteerSchema),
    defaultValues: volunteerDefaultValues,
    mode: "onTouched",
  });

  const { formState: { isSubmitting }, reset } = methods;

  const onSubmit = async (data: VolunteerFormValues) => {
    try {
      await submitVolunteerForm(data);
      enqueueSnackbar("¡Solicitud enviada! Nos pondremos en contacto en 3–5 días hábiles.", { variant: "success" });
      reset();
    } catch {
      enqueueSnackbar("Ocurrió un error al enviar la solicitud. Por favor intenta nuevamente.", { variant: "error" });
    }
  };

  const cardBg        = isDark ? "bg-white/[0.03] border-white/[0.07]" : "bg-white/80 border-black/[0.06]";
  const textSecondary = isDark ? "text-white/45" : "text-slate-500";

  return (
    <FormManaged methods={methods} onSubmit={onSubmit}>
      <div className={`w-full max-w-3xl mx-auto p-8 md:p-12 rounded-3xl border backdrop-blur-md ${cardBg}`}>
        <div className="flex flex-col gap-8">

          <div className="flex flex-col gap-3">
            <SectionLabel icon="solar:user-bold-duotone" label="Información Personal" isDark={isDark} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RHFTextField<VolunteerFormValues>
                name="firstName"
                label="Nombre"
                placeholder="Tu nombre"
                required
                autoComplete="given-name"
              />
              <RHFTextField<VolunteerFormValues>
                name="lastName"
                label="Apellido"
                placeholder="Tu apellido"
                required
                autoComplete="family-name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RHFTextField<VolunteerFormValues>
                name="idDocument"
                label="Documento de Identidad"
                required
                documentMode
              />
              <RHFTextField<VolunteerFormValues>
                name="birthDate"
                label="Fecha de Nacimiento"
                placeholder=""
                type="date"
                required
              />
            </div>

            <RHFTextField<VolunteerFormValues>
              name="address"
              label="Dirección"
              placeholder="Calle, sector, ciudad"
              autoComplete="street-address"
            />
          </div>

          <Divider isDark={isDark} />

          <div className="flex flex-col gap-3">
            <SectionLabel icon="solar:phone-bold-duotone" label="Datos de Contacto" isDark={isDark} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RHFTextField<VolunteerFormValues>
                name="email"
                label="Correo Electrónico"
                placeholder="correo@ejemplo.com"
                type="email"
                required
                autoComplete="email"
              />
              <RHFTextField<VolunteerFormValues>
                name="phone"
                label="Teléfono / WhatsApp"
                type="tel"
                required
                autoComplete="tel"
                phoneMode
              />
            </div>

            <RHFTextField<VolunteerFormValues>
              name="socialMedia"
              label="Redes Sociales"
              placeholder="@tu_usuario (Instagram, Facebook, etc.)"
            />
          </div>

          <Divider isDark={isDark} />

          <div className="flex flex-col gap-3">
            <SectionLabel icon="solar:bag-bold-duotone" label="Perfil Profesional" isDark={isDark} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RHFTextField<VolunteerFormValues>
                name="occupation"
                label="Profesión / Ocupación"
                placeholder="Estudiante, Ingeniero, Médico…"
              />
              <RHFSelect<VolunteerFormValues>
                name="educationLevel"
                label="Nivel de Educación"
                options={EDUCATION_OPTIONS}
                placeholder="Selecciona tu nivel"
              />
            </div>

            <RHFTextArea<VolunteerFormValues>
              name="skills"
              label="Habilidades y Experiencia"
              placeholder="Describe brevemente tus habilidades, experiencias previas en voluntariado o áreas de interés…"
              rows={4}
            />
          </div>

          <Divider isDark={isDark} />

          {/* ── 4. Áreas de Interés ── */}
          <div className="flex flex-col gap-3">
            <SectionLabel icon="solar:star-bold-duotone" label="Áreas de Interés" isDark={isDark} />
            <p className={`text-xs ${textSecondary}`}>
              Selecciona una o más áreas en las que te gustaría colaborar:
            </p>
            <RHFChipGroup<VolunteerFormValues>
              name="areas"
              label=""
              options={AREA_OPTIONS}
              multiple
              required
            />
          </div>

          <Divider isDark={isDark} />

          {/* ── 5. Disponibilidad ── */}
          <div className="flex flex-col gap-3">
            <SectionLabel icon="solar:calendar-bold-duotone" label="Disponibilidad" isDark={isDark} />

            <RHFChipGroup<VolunteerFormValues>
              name="availability"
              label="¿Cuándo estás disponible?"
              options={AVAILABILITY_OPTIONS}
              required
            />

            <RHFTextField<VolunteerFormValues>
              name="weeklyHours"
              label="¿Horas semanales disponibles?"
              placeholder="Ej: 5 horas"
            />
          </div>

          <Divider isDark={isDark} />

          {/* ── 6. Motivación ── */}
          <div className="flex flex-col gap-3">
            <SectionLabel icon="solar:heart-bold-duotone" label="Motivación" isDark={isDark} />

            <RHFTextArea<VolunteerFormValues>
              name="motivation"
              label="¿Por qué quieres ser voluntario en CXUM?"
              placeholder="Cuéntanos qué te motiva, qué esperas aportar y qué esperas aprender…"
              rows={4}
              required
            />

            <RHFSelect<VolunteerFormValues>
              name="referral"
              label="¿Cómo te enteraste de CXUM?"
              options={REFERRAL_OPTIONS}
              placeholder="Selecciona una opción"
            />
          </div>

          <Divider isDark={isDark} />

          {/* ── 7. Contacto de Emergencia ── */}
          <div className="flex flex-col gap-3">
            <SectionLabel icon="solar:shield-bold-duotone" label="Contacto de Emergencia" isDark={isDark} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RHFTextField<VolunteerFormValues>
                name="emergencyName"
                label="Nombre Completo"
                placeholder="Nombre de contacto"
                required
              />
              <RHFTextField<VolunteerFormValues>
                name="emergencyRelation"
                label="Relación"
                placeholder="Madre, Padre, Hermano/a…"
                required
              />
            </div>

            <RHFTextField<VolunteerFormValues>
              name="emergencyPhone"
              label="Teléfono de Emergencia"
              type="tel"
              required
              phoneMode
            />
          </div>

          {/* ── 8. Términos + Submit ── */}
          <div className="flex flex-col gap-5 pt-2">
            <RHFCheckbox<VolunteerFormValues>
              name="acceptTerms"
              label={
                <>
                  Acepto los{" "}
                  <span
                    style={{ color: "#f59e0b" }}
                    className="underline cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    términos y condiciones
                  </span>{" "}
                  y autorizo el uso de mis datos para fines relacionados con el
                  voluntariado en CXUM.
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
                    Enviando solicitud…
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Iconify IconString="solar:heart-send-bold-duotone" Size={20} />
                    ENVIAR SOLICITUD DE VOLUNTARIADO
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {!isSubmitting && (
              <p className={`text-center text-xs ${textSecondary}`}>
                Te contactaremos en un plazo de 3–5 días hábiles.
              </p>
            )}
          </div>

        </div>
      </div>
    </FormManaged>
  );
}
