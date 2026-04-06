import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useSettings } from "../../hooks/context/SettingsContext";
import Iconify from "../../components/modularUI/IconsMock";
import { signIn } from "../components/cognito";
import LogoCXUM from "../../assets/LogoCXUM.png";
import cenLogo from "../../assets/logoCentralizado.png";

function Field({
  label, type, value, onChange, placeholder, icon, error,
}: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  icon: string; error?: string;
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
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm outline-none
            transition-all duration-150
            bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400
            focus:ring-2 focus:ring-[#1447a0]/25 focus:border-[#1447a0]/60 focus:bg-white
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

export default function LoginPage() {
  const { theme }     = useSettings();
  const isDark        = theme === "dark";
  const navigate      = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

   const [isLarge, setIsLarge] = useState(false);

    useEffect(() => {
      const mediaQuery = window.matchMedia('(min-width: 1024px)');
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleUpdate = (e: any) => setIsLarge(e.matches);
      mediaQuery.addEventListener('change', handleUpdate);
      
      setIsLarge(mediaQuery.matches);

      return () => mediaQuery.removeEventListener('change', handleUpdate);
    }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Completa todos los campos."); return; }
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
      setError(msg[err.code] ?? err.message ?? "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex">

      <div
        className="hidden lg:flex flex-col relative overflow-hidden"
        style={{
          width: "48%",
          background: "linear-gradient(150deg, #0a2058 0%, #1447a0 55%, #1a5dcc 100%)",
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 600 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="80"  y="100" width="420" height="340" rx="24"
            fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5"
            transform="rotate(-12 300 270)" />
          <rect x="120" y="140" width="360" height="300" rx="20"
            fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"
            transform="rotate(-12 300 270)" />
          <rect x="40"  y="60"  width="500" height="400" rx="28"
            fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"
            transform="rotate(-12 300 270)" />
          <circle cx="80" cy="820" r="180" fill="rgba(255,255,255,0.04)" />
          <circle cx="80" cy="820" r="120" fill="rgba(255,255,255,0.04)" />
          <line x1="0" y1="900" x2="600" y2="200"
            stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        </svg>

        <div className="relative z-10 flex flex-col h-full px-10 py-10 justify-center items-center">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex justify-center items-center flex-col text-center gap-4 py-20 "
          >
            <img src={cenLogo} alt="CXUM Logo" className="w-140 h-auto object-contain opacity-70" />

          </motion.div>



          <p className="text-white/20 text-xs flex absolute bottom-10 left-10">© {new Date().getFullYear()} CXUM. Todos los derechos reservados.</p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          PANEL DERECHO — formulario blanco/limpio
      ══════════════════════════════════════════════ */}
      <div
        className="flex-1 flex flex-col"
        style={{ background: isDark ? "#0f172a" : "#ffffff" }}
      >
        {/* Barra superior — botón volver + logo mobile */}
        <div className="flex items-center justify-between px-8 pt-7 pb-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold transition-all duration-150 group"
            style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#64748b" }}
          >
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 group-hover:scale-105"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
              }}
            >
              <Iconify Size={15} IconString="solar:arrow-left-bold" Style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#64748b" }} />
            </span>
            <span className={`${isDark ? "text-white/40 group-hover:text-white/70" : "text-slate-400 group-hover:text-slate-600"} transition-colors`}>
              Volver al inicio
            </span>
          </Link>
          { isLarge ? (
            <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="text-right">
              <p className={`font-black text-lg tracking-tight leading-none ${isDark ? "text-white" : "text-slate-800"}`}>CXUM</p>
              <p className={` text-xs ${isDark ? "text-white/40" : "text-slate-800/40"}`}>Plataforma de gestión</p>
            </div>
            <img src={LogoCXUM} alt="CXUM" className="h-10 w-auto drop-shadow mb-3" />
          </motion.div>

          ):(<>
          <div className="lg:hidden flex items-center gap-2">
            <img src={LogoCXUM} alt="CXUM" className="h-8 w-auto" />
            <span className={`font-black text-base ${isDark ? "text-white" : "text-slate-800"}`}>CXUM</span>
          </div>

          <div className="w-28" />
          </>)}
        </div>

        <div className="flex-1 flex items-center justify-center px-8 md:px-16 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm"
          >
            <div className="mb-8">
              <h2
                className="font-black mb-1.5"
                style={{
                  fontSize: "2rem",
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
                  style={{ color: "#1447a0" }}
                >
                  Regístrate aquí
                </Link>
                , es gratis.
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="tu@correo.com"
                icon="solar:letter-bold-duotone"
              />
              <Field
                label="Contraseña"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                icon="solar:lock-password-bold-duotone"
              />

              <AnimatePresence>
                {error && (
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
                    <Iconify Size={14} IconString="solar:danger-circle-bold-duotone" Style={{ color: "#ef4444", flexShrink: 0 }} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Botón principal */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.015, y: loading ? 0 : -1 }}
                whileTap={{ scale: loading ? 1 : 0.985 }}
                className="w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 mt-1 transition-opacity"
                style={{
                  background: loading
                    ? "rgba(20,71,160,0.5)"
                    : "#0f172a",
                  opacity: loading ? 0.7 : 1,
                  boxShadow: loading ? "none" : "0 4px 16px rgba(15,23,42,0.25)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Ingresando…
                  </>
                ) : (
                  <>
                    <Iconify Size={15} IconString="solar:login-3-bold-duotone" Style={{ color: "white" }} />
                    Iniciar sesión
                  </>
                )}
              </motion.button>
            </form>

            {/* Divisor */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0" }} />
              <span className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.25)" : "#94a3b8" }}>o</span>
              <div className="flex-1 h-px" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0" }} />
            </div>

            {/* Olvidé contraseña */}
            <div className="text-center">
              <span className={`text-sm ${isDark ? "text-white/40" : "text-slate-400"}`}>
                ¿Olvidaste tu contraseña?{" "}
              </span>
              <Link
                to="/plataforma/restaurar"
                className="text-sm font-bold underline underline-offset-2 hover:opacity-75 transition-opacity"
                style={{ color: "#1447a0" }}
              >
                Haz clic aquí
              </Link>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
