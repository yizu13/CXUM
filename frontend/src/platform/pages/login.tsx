import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useSettings } from "../../hooks/context/SettingsContext";
import { signIn } from "../components/cognito";
import AuthMock from "./AuthMock";
import SubmitBtn from "./submitButton";
import { AuthField, AuthErrorAlert } from "../../components/FormComponents";
import { useAuth } from "../components/AuthContextComps";

const schema = yup.object({
  email:    yup.string().email("Correo inválido").required("El correo es requerido"),
  password: yup.string().required("La contraseña es requerida"),
});

type FormValues = yup.InferType<typeof schema>;

export default function LoginPage() {
  const { theme } = useSettings();
  const { changeReload, setLogin } = useAuth();
  const isDark    = theme === "dark";
  const navigate  = useNavigate();

  const [apiError, setApiError] = useState("");
  const [loading,  setLoading]  = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: yupResolver(schema) });

  async function onSubmit({ email, password }: FormValues) {
    setApiError("");
    setLoading(true);
    try {
      const result = await signIn(email, password);
      if (result === "newPasswordRequired") {
        navigate(`/plataforma/cambiar-contrasena?email=${encodeURIComponent(email)}`);
        return;
      }
      setLogin(true);
      changeReload();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const msg: Record<string, string> = {
        NotAuthorizedException: "Correo o contraseña incorrectos.",
        UserNotFoundException:  "No existe una cuenta con ese correo.",
      };
      if (err.code === "UserNotConfirmedException") {
        navigate(`/plataforma/verificar?email=${encodeURIComponent(email)}`);
        return;
      }
      setApiError(msg[err.code] ?? err.message ?? "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthMock>
      <div className="mb-8">
        <h2
          className="font-black mb-2"
          style={{
            fontSize: "clamp(1.6rem, 4vw, 2rem)",
            color: isDark ? "#ffffff" : "#0f172a",
            lineHeight: 1.15,
          }}
        >
          ¡Bienvenido de vuelta!
        </h2>
        {/*<p className={`text-sm ${isDark ? "text-white/40" : "text-slate-400"}`}>
          ¿No tienes cuenta?{" "}
          <Link
            to="/plataforma/registro"
            className="font-semibold underline underline-offset-2 hover:opacity-75 transition-opacity"
            style={{ color: "#ea580c" }}
          >
            Regístrate aquí
          </Link>
        </p>*/}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <AuthField
          label="Correo electrónico"
          type="email"
          placeholder="tu@correo.com"
          icon="solar:letter-bold-duotone"
          error={errors.email?.message}
          registration={register("email")}
        />
        <AuthField
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          icon="solar:lock-password-bold-duotone"
          error={errors.password?.message}
          registration={register("password")}
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

        <SubmitBtn loading={loading} label="Iniciar sesión" icon="solar:login-3-bold-duotone" />
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px"
          style={{ background: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0" }} />
        <span className="text-xs"
          style={{ color: isDark ? "rgba(255,255,255,0.25)" : "#94a3b8" }}>o</span>
        <div className="flex-1 h-px"
          style={{ background: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0" }} />
      </div>

      <div className="text-center">
        <span className={`text-sm ${isDark ? "text-white/40" : "text-slate-400"}`}>
          ¿Olvidaste tu contraseña?{" "}
        </span>
        <Link
          to="/plataforma/restaurar"
          className="text-sm font-bold underline underline-offset-2 hover:opacity-75 transition-opacity"
          style={{ color: "#fa9532" }}
        >
          Haz clic aquí
        </Link>
      </div>
    </AuthMock>
  );
}
