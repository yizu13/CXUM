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
} from "./index";
import {
  contactSchema,
  contactDefaultValues,
  type ContactFormValues,
} from "./schemas";

// ─────────────────────────────────────────────────────────────────────────────
//  Service — swap to your actual API / emailjs call
// ─────────────────────────────────────────────────────────────────────────────
async function submitContactForm(data: ContactFormValues): Promise<void> {
  // TODO: replace with your actual API call, e.g.:
  // await emailjs.send(SERVICE_ID, TEMPLATE_ID, { ...data }, PUBLIC_KEY);
  console.log("[ContactForm] submitted →", data);
  await new Promise((r) => setTimeout(r, 1200));
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ContactFormSection() {
  const { theme } = useSettings();
  const isDark = theme === "dark";

  const methods = useForm<ContactFormValues>({
    resolver: yupResolver(contactSchema),
    defaultValues: contactDefaultValues,
    mode: "onTouched",
  });

  const { formState: { isSubmitting }, reset } = methods;

  const onSubmit = async (data: ContactFormValues) => {
    try {
      await submitContactForm(data);
      enqueueSnackbar("¡Mensaje enviado! Te respondemos en 24 horas.", { variant: "success" });
      reset();
    } catch {
      enqueueSnackbar("Ocurrió un error al enviar. Por favor intenta nuevamente.", { variant: "error" });
    }
  };

  const cardBg        = isDark ? "bg-white/[0.03] border-white/[0.07]" : "bg-white/80 border-black/[0.06]";
  const textPrimary   = isDark ? "text-white"   : "text-slate-900";
  const textSecondary = isDark ? "text-white/45" : "text-slate-500";

  return (
    <FormManaged methods={methods} onSubmit={onSubmit}>
      <div className={`flex flex-col gap-6 p-8 rounded-3xl border backdrop-blur-md ${cardBg}`}>
        <h2 className={`text-xl font-black ${textPrimary}`}>Envíanos un mensaje</h2>

        {/* Name row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RHFTextField<ContactFormValues>
            name="firstName"
            label="Nombre"
            placeholder="Tu nombre"
            required
            autoComplete="given-name"
          />
          <RHFTextField<ContactFormValues>
            name="lastName"
            label="Apellido"
            placeholder="Tu apellido"
            required
            autoComplete="family-name"
          />
        </div>

        <RHFTextField<ContactFormValues>
          name="email"
          label="Correo electrónico"
          placeholder="correo@ejemplo.com"
          type="email"
          required
          autoComplete="email"
        />

        <RHFTextField<ContactFormValues>
          name="subject"
          label="Asunto"
          placeholder="¿En qué podemos ayudarte?"
          required
        />

        <RHFTextArea<ContactFormValues>
          name="message"
          label="Mensaje"
          placeholder="Escribe tu mensaje aquí..."
          rows={5}
          required
        />

        {/* Submit button */}
        <div className="flex flex-col gap-3">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide cursor-pointer
              flex items-center justify-center gap-2 transition-all duration-300
              disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg,#f59e0b,#fb923c)",
              color: "#fff",
              boxShadow: "0 8px 24px rgba(245,158,11,0.35)",
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
                  Enviando...
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Iconify IconString="solar:plain-3-bold-duotone" Size={18} />
                  Enviar Mensaje
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {!isSubmitting && (
            <p className={`text-center text-xs ${textSecondary}`}>
              Te respondemos en un plazo de 24 horas hábiles.
            </p>
          )}
        </div>
      </div>
    </FormManaged>
  );
}
