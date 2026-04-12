import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useSettings } from "../../hooks/context/SettingsContext";
import { confirmSignUp, resendConfirmationCode } from "../components/cognito";
import AuthMock from "./AuthMock";
import SubmitBtn from "./submitButton";
import { AuthOtpInput, AuthErrorAlert } from "../../components/FormComponents";
import Iconify from "../../components/modularUI/IconsMock";

const schema = yup.object({
  otp: yup.string().min(4, "Ingresa el código de verificación").required("El código es requerido"),
});

type FormValues = yup.InferType<typeof schema>;

export default function VerifyEmailPage() {
  const { theme } = useSettings();
  const isDark    = theme === "dark";
  const navigate  = useNavigate();
  const [params]  = useSearchParams();
  const email     = params.get("email") ?? "";

  const [apiError,  setApiError]  = useState("");
  const [loading,   setLoading]   = useState(false);
  const [resent,    setResent]    = useState(false);
  const [resending, setResending] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const textMuted = isDark ? "text-white/40" : "text-slate-400";

  async function onSubmit({ otp }: FormValues) {
    setApiError("");
    setLoading(true);
    try {
      await confirmSignUp(email, otp);
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
    setResending(true);
    try {
      await resendConfirmationCode(email);
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setApiError(err.message ?? "No se pudo reenviar el código.");
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthMock>
      <div className="w-full flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1"
            style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)" }}>
            <Iconify Size={24} IconString="solar:letter-opened-bold-duotone" Style={{ color: "#3b82f6" }} />
          </div>
          <h1 className="text-2xl font-black" style={{ color: isDark ? "#fff" : "#0f172a" }}>
            Verifica tu correo
          </h1>
          <p className={`text-sm ${textMuted}`}>
            Enviamos un código de 6 dígitos a
          </p>
          {email && (
            <span className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
              {email}
            </span>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <AuthOtpInput
            registration={register("otp")}
            error={errors.otp?.message}
            size="lg"
          />

          <AnimatePresence>
            {apiError && (
              <motion.div key="err" initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <AuthErrorAlert msg={apiError} />
              </motion.div>
            )}
          </AnimatePresence>

          {resent && (
            <p className="text-xs text-center font-medium" style={{ color: "#22c55e" }}>
              ✓ Código reenviado exitosamente
            </p>
          )}

          <SubmitBtn loading={loading} label="Verificar correo" icon="solar:check-circle-bold-duotone" />
        </form>

        {/* Reenviar */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className={`text-xs font-semibold hover:underline disabled:opacity-50 ${textMuted}`}
          >
            {resending ? "Reenviando..." : "¿No recibiste el código? Reenviar"}
          </button>
          <Link to="/plataforma/login"
            className={`text-xs font-semibold hover:underline ${textMuted}`}>
            ← Volver al login
          </Link>
        </div>
      </div>
    </AuthMock>
  );
}
