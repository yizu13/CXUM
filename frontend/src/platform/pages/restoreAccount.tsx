import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useSettings } from "../../hooks/context/SettingsContext";
import Iconify from "../../components/modularUI/IconsMock";
import { forgotPassword, confirmForgotPassword } from "../components/cognito";
import AuthMock from "./AuthMock";
import SubmitBtn from "./submitButton";
import {
  AuthField,
  AuthErrorAlert,
  AuthOtpInput,
  PasswordStrength,
} from "../../components/FormComponents";

type Step = "email" | "reset";

const emailSchema = yup.object({
  email: yup.string().email("Correo inválido").required("El correo es requerido"),
});

const resetSchema = yup.object({
  code:     yup.string().min(4, "Ingresa el código").required("El código es requerido"),
  newPass:  yup.string().min(8, "Mínimo 8 caracteres").required("La contraseña es requerida"),
  newPass2: yup
    .string()
    .oneOf([yup.ref("newPass")], "Las contraseñas no coinciden")
    .required("Confirma tu contraseña"),
});

type EmailValues = yup.InferType<typeof emailSchema>;
type ResetValues = yup.InferType<typeof resetSchema>;

export default function RestoreAccountPage() {
  const { theme } = useSettings();
  const isDark    = theme === "dark";
  const navigate  = useNavigate();

  const [step,     setStep]     = useState<Step>("email");
  const [email,    setEmail]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");
  const [success,  setSuccess]  = useState(false);

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textMuted   = isDark ? "text-white/40" : "text-slate-400";
  const cardBg      = isDark ? "bg-white/[0.03]" : "bg-white";
  const cardShadow  = isDark
    ? "0 0 0 1px rgba(255,255,255,0.07)"
    : "0 8px 48px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.05)";

  const emailForm = useForm<EmailValues>({ resolver: yupResolver(emailSchema) });
  const resetForm = useForm<ResetValues>({ resolver: yupResolver(resetSchema) });

  async function handleEmailSubmit({ email: formEmail }: EmailValues) {
    setApiError("");
    setLoading(true);
    try {
      await forgotPassword(formEmail);
      setEmail(formEmail);
      setStep("reset");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const msg: Record<string, string> = {
        UserNotFoundException:  "No existe una cuenta con ese correo.",
        LimitExceededException: "Demasiados intentos. Espera unos minutos.",
      };
      setApiError(msg[err.code] ?? err.message ?? "Error al enviar el código.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetSubmit({ code, newPass }: ResetValues) {
    setApiError("");
    setLoading(true);
    try {
      await confirmForgotPassword(email, code, newPass);
      setSuccess(true);
      setTimeout(() => navigate("/plataforma/login"), 2500);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const msg: Record<string, string> = {
        CodeMismatchException:    "El código es incorrecto.",
        ExpiredCodeException:     "El código ha expirado. Vuelve a solicitar uno.",
        InvalidPasswordException: "La contraseña no cumple los requisitos mínimos.",
      };
      setApiError(msg[err.code] ?? err.message ?? "Error al restablecer la contraseña.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthMock>
        <div
          className={`w-full rounded-3xl p-10 flex flex-col items-center gap-5 text-center ${cardBg}`}
          style={{ boxShadow: cardShadow }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-5"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(34,197,94,0.12)" }}
            >
              <Iconify Size={36} IconString="solar:check-circle-bold-duotone" Style={{ color: "#22c55e" }} />
            </div>
            <h2 className={`text-xl font-black ${textPrimary}`}>¡Contraseña actualizada!</h2>
            <p className={`text-sm ${textMuted}`}>
              Tu contraseña fue restablecida exitosamente. Redirigiendo al login…
            </p>
            <div className="w-full h-1 rounded-full overflow-hidden"
              style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "#22c55e" }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.4, ease: "linear" }}
              />
            </div>
          </motion.div>
        </div>
      </AuthMock>
    );
  }

  return (
    <AuthMock>
      <div className="w-full rounded-3xl p-4 sm:p-8 flex flex-col gap-6 sm:gap-8">
        <div className="flex flex-col items-center gap-2">
          <h1 className={`text-2xl font-black tracking-tight ${textPrimary}`}>
            {step === "email" ? "Recuperar contraseña" : "Nueva contraseña"}
          </h1>
          <p className={`text-sm text-center ${textMuted}`}>
            {step === "email"
              ? "Te enviaremos un código de verificación a tu correo"
              : `Código enviado a ${email}`}
          </p>
        </div>

        {/* Stepper simple */}
        <div className="flex items-center gap-2 justify-center">
          {["Correo", "Restablecer"].map((label, i) => {
            const done   = (step === "reset" && i === 0);
            const active = (step === "email" && i === 0) || (step === "reset" && i === 1);
            return (
              <div key={label} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
                    style={{
                      background: done || active
                        ? "linear-gradient(135deg, #f59e0b, #fb923c)"
                        : isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
                      color: done || active ? "#fff" : isDark ? "rgba(255,255,255,0.25)" : "#94a3b8",
                      boxShadow: active ? "0 0 12px rgba(245,158,11,0.4)" : "none",
                    }}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider"
                    style={{ color: active ? "#f59e0b" : isDark ? "rgba(255,255,255,0.2)" : "#94a3b8" }}>
                    {label}
                  </span>
                </div>
                {i === 0 && (
                  <div className="w-10 h-px mb-4"
                    style={{ background: done ? "#f59e0b" : isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0" }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* ── PASO 1: Email ── */}
          {step === "email" && (
            <motion.form
              key="email"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
              className="flex flex-col gap-5"
            >
              <AuthField
                label="Correo electrónico" type="email"
                placeholder="tu@correo.com" icon="solar:letter-bold-duotone"
                error={emailForm.formState.errors.email?.message}
                registration={emailForm.register("email")}
              />

              {apiError && <AuthErrorAlert msg={apiError} />}

              <SubmitBtn loading={loading} label="Enviar código" icon="solar:letter-bold-duotone" />

              <Link
                to="/plataforma/login"
                className={`text-xs font-semibold text-center hover:underline ${textMuted}`}
              >
                ← Volver al login
              </Link>
            </motion.form>
          )}

          {/* ── PASO 2: Código + nueva contraseña ── */}
          {step === "reset" && (
            <motion.form
              key="reset"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={resetForm.handleSubmit(handleResetSubmit)}
              className="flex flex-col gap-5"
            >
              <AuthOtpInput
                registration={resetForm.register("code")}
                error={resetForm.formState.errors.code?.message}
                size="md"
              />

              <div className="flex flex-col gap-1">
                <AuthField
                  label="Nueva contraseña" type="password"
                  placeholder="••••••••" icon="solar:lock-password-bold-duotone"
                  error={resetForm.formState.errors.newPass?.message}
                  registration={resetForm.register("newPass")}
                />
                <PasswordStrength password={resetForm.watch("newPass") ?? ""} />
              </div>

              <AuthField
                label="Confirmar contraseña" type="password"
                placeholder="••••••••" icon="solar:lock-password-bold-duotone"
                error={resetForm.formState.errors.newPass2?.message}
                registration={resetForm.register("newPass2")}
              />

              {apiError && <AuthErrorAlert msg={apiError} />}

              <SubmitBtn loading={loading} label="Restablecer contraseña" icon="solar:lock-keyhole-unlocked-bold-duotone" />

              <button
                type="button"
                onClick={() => { setStep("email"); setApiError(""); resetForm.clearErrors(); }}
                className={`text-xs font-semibold text-center hover:underline ${textMuted}`}
              >
                ← Volver
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </AuthMock>
  );
}
