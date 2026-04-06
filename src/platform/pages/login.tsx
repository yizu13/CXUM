import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useSettings } from "../../hooks/context/SettingsContext";
import Iconify from "../../components/modularUI/IconsMock";
import { signIn } from "../components/cognito";
import AuthMock from "./AuthMock";
import SubmitBtn from "./submitButton";

const schema = yup.object({
  email:    yup.string().email("Correo inválido").required("El correo es requerido"),
  password: yup.string().required("La contraseña es requerida"),
});

type FormValues = yup.InferType<typeof schema>;

function Field({
  label, type, placeholder, icon, error,
  registration,
}: {
  label: string; type: string; placeholder: string;
  icon: string; error?: string;
  registration: React.InputHTMLAttributes<HTMLInputElement>;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500 tracking-wide">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <Iconify Size={15} IconString={icon} Style={{ color: "#94a3b8" }} />
        </span>
        <input
          {...registration}
          type={isPassword && show ? "text" : type}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm outline-none
            transition-all duration-150
            bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400
            focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400/70 focus:bg-white
            hover:border-slate-300
            ${error ? "border-red-400 focus:ring-red-300/30 focus:border-red-400" : ""}
          `}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70 transition-opacity"
          >
            <Iconify
              Size={15}
              IconString={show ? "solar:eye-closed-bold-duotone" : "solar:eye-bold-duotone"}
              Style={{ color: "#64748b" }}
            />
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <Iconify Size={12} IconString="solar:danger-circle-bold" Style={{ color: "#ef4444" }} />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { theme } = useSettings();
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
      await signIn(email, password);
      navigate("/plataforma/admin");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const msg: Record<string, string> = {
        NotAuthorizedException:    "Correo o contraseña incorrectos.",
        UserNotFoundException:     "No existe una cuenta con ese correo.",
        UserNotConfirmedException: "Debes verificar tu correo antes de ingresar.",
      };
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
        <p className={`text-sm ${isDark ? "text-white/40" : "text-slate-400"}`}>
          ¿No tienes cuenta?{" "}
          <Link
            to="/plataforma/registro"
            className="font-semibold underline underline-offset-2 hover:opacity-75 transition-opacity"
            style={{ color: "#ea580c" }}
          >
            Regístrate aquí
          </Link>
          , es gratis.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field
          label="Correo electrónico"
          type="email"
          placeholder="tu@correo.com"
          icon="solar:letter-bold-duotone"
          error={errors.email?.message}
          registration={register("email")}
        />
        <Field
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
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium overflow-hidden"
              style={{
                background: "rgba(239,68,68,0.08)",
                color: "#ef4444",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <Iconify Size={14} IconString="solar:danger-circle-bold-duotone"
                Style={{ color: "#ef4444", flexShrink: 0 }} />
              {apiError}
            </motion.div>
          )}
        </AnimatePresence>
        <SubmitBtn loading={loading} label="Iniciar sesión" icon="solar:login-3-bold-duotone"/>
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
          style={{ color: "#ea580c" }}
        >
          Haz clic aquí
        </Link>
      </div>
    </AuthMock>
  );
}
