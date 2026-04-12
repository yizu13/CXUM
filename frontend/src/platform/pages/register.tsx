import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useSettings } from "../../hooks/context/SettingsContext";
import Iconify from "../../components/modularUI/IconsMock";
import { signUp, confirmSignUp, resendConfirmationCode } from "../components/cognito";
import { validateInviteCode } from "../components/inviteCodes";
import { consumeInviteToken } from "../APIs/inviteTokens";
import AuthMock from "./AuthMock";
import SubmitBtn from "./submitButton";
import {
  AuthField,
  AuthErrorAlert,
  AuthOtpInput,
  PasswordStrength,
} from "../../components/FormComponents";

type Step = "invite" | "form" | "otp";

const inviteSchema = yup.object({
  inviteCode: yup.string().required("Ingresa el código de invitación"),
});

const formSchema = yup.object({
  name:      yup.string().required("El nombre es requerido"),
  email:     yup.string().email("Correo inválido").required("El correo es requerido"),
  password:  yup.string().min(8, "Mínimo 8 caracteres").required("La contraseña es requerida"),
  password2: yup
    .string()
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden")
    .required("Confirma tu contraseña"),
});

const otpSchema = yup.object({
  otp: yup.string().min(4, "Ingresa el código de verificación").required("El código es requerido"),
});

type InviteValues = yup.InferType<typeof inviteSchema>;
type FormValues   = yup.InferType<typeof formSchema>;
type OtpValues    = yup.InferType<typeof otpSchema>;

// ─── Stepper visual ───────────────────────────────────────────────────────────
function Stepper({ current, isDark }: { current: number; isDark: boolean }) {
  const steps = ["Código", "Datos", "Verificación"];
  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300"
                style={{
                  background: done || active
                    ? "linear-gradient(135deg, #f59e0b, #fb923c)"
                    : isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
                  color: done || active ? "#fff" : isDark ? "rgba(255,255,255,0.3)" : "#94a3b8",
                  boxShadow: active ? "0 0 16px rgba(245,158,11,0.45)" : "none",
                }}
              >
                {done
                  ? <Iconify Size={13} IconString="solar:check-circle-bold" Style={{ color: "#fff" }} />
                  : i + 1
                }
              </div>
              <span
                className="text-[9px] font-bold uppercase tracking-wider"
                style={{ color: active ? "#f59e0b" : isDark ? "rgba(255,255,255,0.25)" : "#94a3b8" }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-px mx-2 mb-4 transition-all duration-500"
                style={{ background: done ? "#f59e0b" : isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function RegisterPage() {
  const { theme } = useSettings();
  const isDark    = theme === "dark";
  const navigate  = useNavigate();

  const [step,     setStep]     = useState<Step>("invite");
  const [email,    setEmail]    = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");
  const [otpSent,  setOtpSent]  = useState(false);

  const stepIndex: Record<Step, number> = { invite: 0, form: 1, otp: 2 };

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textMuted   = isDark ? "text-white/40" : "text-slate-400";

  const inviteForm = useForm<InviteValues>({ resolver: yupResolver(inviteSchema) });
  const mainForm   = useForm<FormValues>  ({ resolver: yupResolver(formSchema)   });
  const otpForm    = useForm<OtpValues>   ({ resolver: yupResolver(otpSchema)    });

  async function handleInviteSubmit({ inviteCode }: InviteValues) {
    setApiError("");
    setLoading(true);
    try {
      const result = await validateInviteCode(inviteCode);
      if (!result.valid) {
        setApiError(result.reason ?? "Código de invitación inválido o expirado.");
        return;
      }
      setInviteToken(inviteCode.trim().toUpperCase());
      setStep("form");
    } catch {
      setApiError("No se pudo validar el código. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFormSubmit({ name, email: formEmail, password }: FormValues) {
    setApiError("");
    setLoading(true);
    try {
      await signUp(name, formEmail, password);
      setEmail(formEmail);
      setOtpSent(true);
      setStep("otp");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const msg: Record<string, string> = {
        UsernameExistsException:  "Ya existe una cuenta con ese correo.",
        InvalidPasswordException: "La contraseña no cumple los requisitos de seguridad.",
      };
      setApiError(msg[err.code] ?? err.message ?? "Error al registrar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit({ otp }: OtpValues) {
    setApiError("");
    setLoading(true);
    try {
      await confirmSignUp(email, otp);
      // Marcar el token como usado al confirmar exitosamente
      if (inviteToken) {
        await consumeInviteToken(inviteToken, email).catch(() => {/* no bloquear el flujo */});
      }
      navigate("/plataforma/login?verified=1");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const msg: Record<string, string> = {
        CodeMismatchException:  "El código es incorrecto.",
        ExpiredCodeException:   "El código ha expirado. Solicita uno nuevo.",
        NotAuthorizedException: "Esta cuenta ya fue confirmada.",
      };
      setApiError(msg[err.code] ?? err.message ?? "Error al verificar.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setApiError("");
    setLoading(true);
    try {
      await resendConfirmationCode(email);
      setOtpSent(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setApiError(err.message ?? "No se pudo reenviar el código.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthMock>
      <div className="w-full rounded-3xl p-4 sm:p-8 flex flex-col gap-6 sm:gap-8">
        <div className="flex flex-col items-center gap-2">
          <h1 className={`text-2xl font-black tracking-tight ${textPrimary}`}>Crear cuenta</h1>
          <p className={`text-sm text-center ${textMuted}`}>
            Solo miembros con código de invitación pueden registrarse
          </p>
        </div>

        <Stepper current={stepIndex[step]} isDark={isDark} />

        <AnimatePresence mode="wait">
          {/* ── PASO 1: Código de invitación ── */}
          {step === "invite" && (
            <motion.form
              key="invite"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={inviteForm.handleSubmit(handleInviteSubmit)}
              className="flex flex-col gap-5"
            >
              <div
                className="flex items-start gap-3 p-4 rounded-2xl"
                style={{ background: isDark ? "rgba(245,158,11,0.08)" : "rgba(245,158,11,0.06)" }}
              >
                <Iconify Size={18} IconString="solar:key-bold-duotone"
                  Style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
                <p className={`text-xs leading-relaxed ${isDark ? "text-white/55" : "text-slate-500"}`}>
                  Para registrarte en la plataforma CXUM necesitas un{" "}
                  <strong className={textPrimary}>código de invitación</strong> proporcionado
                  por un administrador. Si no lo tienes, contacta al equipo.
                </p>
              </div>

              <AuthField
                label="Código de invitación"
                type="text"
                placeholder="CXUM-XXXX-XXXX"
                icon="solar:ticket-bold-duotone"
                hint="El código es sensible a mayúsculas"
                error={inviteForm.formState.errors.inviteCode?.message}
                registration={{
                  ...inviteForm.register("inviteCode"),
                  onChange: (e) => {
                    e.target.value = e.target.value.toUpperCase();
                    inviteForm.register("inviteCode").onChange(e);
                  },
                }}
              />

              {apiError && <AuthErrorAlert msg={apiError} />}

              <SubmitBtn loading={loading} label="Validar código" icon="solar:arrow-right-bold" />

              <p className={`text-center text-xs ${textMuted}`}>
                ¿Ya tienes cuenta?{" "}
                <Link to="/plataforma/login" className="font-bold hover:underline" style={{ color: "#f59e0b" }}>
                  Inicia sesión
                </Link>
              </p>
            </motion.form>
          )}

          {/* ── PASO 2: Datos del usuario ── */}
          {step === "form" && (
            <motion.form
              key="form"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={mainForm.handleSubmit(handleFormSubmit)}
              className="flex flex-col gap-5"
            >
              <AuthField
                label="Nombre completo" type="text"
                placeholder="María Pérez" icon="solar:user-bold-duotone"
                error={mainForm.formState.errors.name?.message}
                registration={mainForm.register("name")}
              />
              <AuthField
                label="Correo electrónico" type="email"
                placeholder="tu@correo.com" icon="solar:letter-bold-duotone"
                error={mainForm.formState.errors.email?.message}
                registration={mainForm.register("email")}
              />
              <div className="flex flex-col gap-1">
                <AuthField
                  label="Contraseña" type="password"
                  placeholder="••••••••" icon="solar:lock-password-bold-duotone"
                  error={mainForm.formState.errors.password?.message}
                  registration={mainForm.register("password")}
                />
                <PasswordStrength password={mainForm.watch("password") ?? ""} />
              </div>
              <AuthField
                label="Confirmar contraseña" type="password"
                placeholder="••••••••" icon="solar:lock-password-bold-duotone"
                error={mainForm.formState.errors.password2?.message}
                registration={mainForm.register("password2")}
              />

              {apiError && <AuthErrorAlert msg={apiError} />}

              <SubmitBtn loading={loading} label="Crear cuenta" icon="solar:user-plus-bold" />

              <button
                type="button"
                onClick={() => { setStep("invite"); setApiError(""); mainForm.clearErrors(); }}
                className={`text-xs font-semibold text-center hover:underline ${textMuted}`}
              >
                ← Volver
              </button>
            </motion.form>
          )}

          {step === "otp" && (
            <motion.form
              key="otp"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={otpForm.handleSubmit(handleOtpSubmit)}
              className="flex flex-col gap-5"
            >
              <div
                className="flex items-start gap-3 p-4 rounded-2xl"
                style={{ background: isDark ? "rgba(59,130,246,0.08)" : "rgba(59,130,246,0.05)" }}
              >
                <Iconify Size={18} IconString="solar:letter-opened-bold-duotone"
                  Style={{ color: "#3b82f6", flexShrink: 0, marginTop: 1 }} />
                <p className={`text-xs leading-relaxed ${isDark ? "text-white/55" : "text-slate-500"}`}>
                  Enviamos un código de verificación a{" "}
                  <strong className={isDark ? "text-white" : "text-slate-800"}>{email}</strong>.
                  Introdúcelo para activar tu cuenta.
                </p>
              </div>

              <AuthOtpInput
                registration={otpForm.register("otp")}
                error={otpForm.formState.errors.otp?.message}
                size="lg"
              />

              {apiError && <AuthErrorAlert msg={apiError} />}

              {otpSent && !apiError && (
                <p className="text-xs text-center" style={{ color: "#22c55e" }}>
                  ✓ Código reenviado exitosamente
                </p>
              )}

              <SubmitBtn loading={loading} label="Verificar correo" icon="solar:check-circle-bold" />

              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className={`text-xs font-semibold text-center hover:underline ${textMuted}`}
              >
                ¿No recibiste el código? Reenviar
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </AuthMock>
  );
}
