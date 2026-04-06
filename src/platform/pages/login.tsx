import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useSettings } from "../../hooks/context/SettingsContext";
import Iconify from "../../components/modularUI/IconsMock";
import { signIn } from "../components/cognito";

// ─── Tiny shared input ────────────────────────────────────────────────────────
function Field({
  label, type, value, onChange, placeholder, icon, isDark, error,
}: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  icon: string; isDark: boolean; error?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="flex flex-col gap-1.5">
      <label className={`text-xs font-bold tracking-wide ${isDark ? "text-white/60" : "text-slate-500"}`}>
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Iconify Size={16} IconString={icon} Style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }} />
        </span>
        <input
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-${isPassword ? "10" : "4"} py-3 rounded-xl border text-sm font-medium outline-none
            transition-all duration-200 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60
            ${isDark
              ? "bg-white/[0.05] border-white/[0.08] text-white placeholder:text-white/20"
              : "bg-white border-black/[0.08] text-slate-800 placeholder:text-slate-400"
            }
            ${error ? "border-red-500/60 focus:ring-red-500/30" : ""}
          `}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <Iconify
              Size={16}
              IconString={show ? "solar:eye-closed-bold-duotone" : "solar:eye-bold-duotone"}
              Style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}
            />
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { theme } = useSettings();
  const isDark = theme === "dark";
  const navigate = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const bg      = isDark ? "bg-[#05070b]"              : "bg-[#f8fafc]";
  const cardBg  = isDark ? "bg-white/[0.03]"           : "bg-white";
  const cardShadow = isDark
    ? "0 0 0 1px rgba(255,255,255,0.07)"
    : "0 8px 48px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.05)";
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textMuted   = isDark ? "text-white/40" : "text-slate-400";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Completa todos los campos."); return; }
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/plataforma/admin");
    } catch (err: any) {
      const msg: Record<string, string> = {
        NotAuthorizedException:     "Correo o contraseña incorrectos.",
        UserNotFoundException:      "No existe una cuenta con ese correo.",
        UserNotConfirmedException:  "Debes verificar tu correo antes de ingresar.",
      };
      setError(msg[err.code] ?? err.message ?? "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${bg}`}>

      {/* Glow de fondo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(245,158,11,0.08) 0%, transparent 70%)"
            : "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(245,158,11,0.06) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 28, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0,  filter: "blur(0px)"  }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={`relative w-full max-w-md rounded-3xl p-8 md:p-10 flex flex-col gap-8 ${cardBg}`}
        style={{ boxShadow: cardShadow }}
      >
        {/* Logo / marca */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1"
            style={{ background: "linear-gradient(135deg, #f59e0b, #fb923c)" }}
          >
            <Iconify Size={26} IconString="solar:shield-user-bold-duotone" Style={{ color: "#fff" }} />
          </div>
          <h1 className={`text-2xl font-black tracking-tight ${textPrimary}`}>
            Bienvenido de vuelta
          </h1>
          <p className={`text-sm text-center ${textMuted}`}>
            Ingresa a tu cuenta de la plataforma CXUM
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field
            label="Correo electrónico" type="email" value={email}
            onChange={setEmail} placeholder="tu@correo.com"
            icon="solar:letter-bold-duotone" isDark={isDark}
          />
          <Field
            label="Contraseña" type="password" value={password}
            onChange={setPassword} placeholder="••••••••"
            icon="solar:lock-password-bold-duotone" isDark={isDark}
          />

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}
            >
              <Iconify Size={15} IconString="solar:danger-circle-bold-duotone" />
              {error}
            </motion.div>
          )}

          <div className="flex justify-end">
            <Link
              to="/plataforma/restaurar"
              className="text-xs font-semibold hover:underline"
              style={{ color: "#f59e0b" }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-opacity"
            style={{
              background: "linear-gradient(135deg, #f59e0b, #fb923c)",
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 4px 20px rgba(245,158,11,0.35)",
            }}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Ingresando…
              </>
            ) : (
              <>
                <Iconify Size={16} IconString="solar:login-3-bold-duotone" />
                Iniciar sesión
              </>
            )}
          </motion.button>
        </form>

        <p className={`text-center text-xs ${textMuted}`}>
          ¿No tienes cuenta?{" "}
          <Link
            to="/plataforma/registro"
            className="font-bold hover:underline"
            style={{ color: "#f59e0b" }}
          >
            Regístrate aquí
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
