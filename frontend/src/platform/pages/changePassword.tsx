import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSettings } from "../../hooks/context/SettingsContext";
import { completeNewPassword } from "../components/cognito";
import AuthMock from "./AuthMock";
import SubmitBtn from "./submitButton";
import { AuthField, AuthErrorAlert, PasswordStrength } from "../../components/FormComponents";
import { useAuth } from "../components/AuthContextComps";

const schema = yup.object({
  tempPassword: yup.string().required("Ingresa tu contraseña temporal"),
  newPassword:  yup.string().min(8, "Mínimo 8 caracteres").required("La nueva contraseña es requerida"),
  confirm:      yup.string()
    .oneOf([yup.ref("newPassword")], "Las contraseñas no coinciden")
    .required("Confirma tu nueva contraseña"),
});

type FormValues = yup.InferType<typeof schema>;

export default function ChangePasswordPage() {
  const { theme } = useSettings();
  const { changeReload, setLogin } = useAuth();
  const isDark   = theme === "dark";
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email    = params.get("email") ?? "";

  const [apiError, setApiError] = useState("");
  const [loading,  setLoading]  = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  async function onSubmit({ tempPassword, newPassword }: FormValues) {
    setApiError("");
    setLoading(true);
    try {
      await completeNewPassword(email, tempPassword, newPassword);
      setLogin(true);
      changeReload();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const msg: Record<string, string> = {
        NotAuthorizedException: "La contraseña temporal es incorrecta.",
        InvalidPasswordException: "La nueva contraseña no cumple los requisitos de seguridad.",
        LimitExceededException: "Demasiados intentos. Intenta más tarde.",
      };
      setApiError(msg[err.code] ?? err.message ?? "Error al cambiar la contraseña.");
    } finally {
      setLoading(false);
    }
  }

  const textMuted = isDark ? "text-white/40" : "text-slate-400";

  return (
    <AuthMock>
      <div className="w-full rounded-3xl p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1"
            style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 1a5 5 0 0 1 5 5v3H7V6a5 5 0 0 1 5-5z" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round"/>
              <rect x="3" y="9" width="18" height="13" rx="3" stroke="#6366f1" strokeWidth="1.8"/>
              <circle cx="12" cy="15.5" r="1.5" fill="#6366f1"/>
            </svg>
          </div>
          <h1 className="text-2xl font-black" style={{ color: isDark ? "#fff" : "#0f172a" }}>
            Cambia tu contraseña
          </h1>
          <p className={`text-sm ${textMuted}`}>
            Es tu primer acceso. Establece una contraseña permanente.
          </p>
          {email && (
            <span className="text-xs font-bold px-3 py-1 rounded-full mt-1"
              style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}>
              {email}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <AuthField
            label="Contraseña temporal"
            type="password"
            placeholder="La que te compartieron"
            icon="solar:key-bold-duotone"
            error={errors.tempPassword?.message}
            registration={register("tempPassword")}
          />

          <div className="flex flex-col gap-1">
            <AuthField
              label="Nueva contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres"
              icon="solar:lock-password-bold-duotone"
              error={errors.newPassword?.message}
              registration={register("newPassword")}
            />
            <PasswordStrength password={watch("newPassword") ?? ""} />
          </div>

          <AuthField
            label="Confirmar nueva contraseña"
            type="password"
            placeholder="Repite la nueva contraseña"
            icon="solar:lock-password-bold-duotone"
            error={errors.confirm?.message}
            registration={register("confirm")}
          />

          <AnimatePresence>
            {apiError && (
              <motion.div
                key="err"
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <AuthErrorAlert msg={apiError} />
              </motion.div>
            )}
          </AnimatePresence>

          <SubmitBtn loading={loading} label="Establecer contraseña" icon="solar:check-circle-bold-duotone" />
        </form>

        <button
          onClick={() => navigate("/plataforma/login")}
          className={`text-xs font-semibold text-center hover:underline ${textMuted}`}
        >
          ← Volver al login
        </button>
      </div>
    </AuthMock>
  );
}
