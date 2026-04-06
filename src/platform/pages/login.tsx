import { useState } from "react";
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

function AnimatedSVG() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 600 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <style>{`
          @keyframes rotateSlowCW {
            from { transform-origin: 300px 270px; transform: rotate(-12deg); }
            to   { transform-origin: 300px 270px; transform: rotate(348deg); }
          }
          @keyframes rotateSlowCCW {
            from { transform-origin: 300px 270px; transform: rotate(-12deg); }
            to   { transform-origin: 300px 270px; transform: rotate(-372deg); }
          }
          @keyframes floatUp {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-18px); }
          }
          @keyframes floatDown {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(14px); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.06; }
            50%       { opacity: 0.13; }
          }
          @keyframes dashMove {
            from { stroke-dashoffset: 0; }
            to   { stroke-dashoffset: -120; }
          }
          @keyframes scaleBreath {
            0%, 100% { transform: scale(1); opacity: 0.07; }
            50%       { transform: scale(1.08); opacity: 0.13; }
          }
          .rect-outer {
            fill: none;
            stroke: rgba(255,255,255,0.10);
            stroke-width: 1.5;
            animation: rotateSlowCW 28s linear infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          .rect-mid {
            fill: none;
            stroke: rgba(255,255,255,0.07);
            stroke-width: 1;
            animation: rotateSlowCCW 22s linear infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          .rect-inner {
            fill: none;
            stroke: rgba(255,255,255,0.05);
            stroke-width: 1;
            animation: rotateSlowCW 34s linear infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          .circle-bot {
            animation: scaleBreath 5s ease-in-out infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          .line-dash {
            stroke-dasharray: 8 6;
            animation: dashMove 4s linear infinite;
          }
          .dot-float-up   { animation: floatUp   3.8s ease-in-out infinite; }
          .dot-float-down { animation: floatDown  4.6s ease-in-out infinite; }
        `}</style>
      </defs>

      <rect className="rect-outer" x="80"  y="100" width="440" height="340" rx="28" />
      <rect className="rect-mid"   x="120" y="140" width="360" height="300" rx="22" />
      <rect className="rect-inner" x="40"  y="60"  width="520" height="410" rx="32" />

      <circle className="circle-bot" cx="80" cy="820" r="180" fill="rgba(255,255,255,0.05)" />
      <circle className="circle-bot" cx="80" cy="820" r="110" fill="rgba(255,255,255,0.05)" style={{ animationDelay: "1.5s" }} />

      <line className="line-dash" x1="0" y1="900" x2="600" y2="150"
        stroke="rgba(255,255,255,0.10)" strokeWidth="1" />

      <circle className="dot-float-up"   cx="480" cy="120" r="5"  fill="rgba(255,255,255,0.15)" />
      <circle className="dot-float-down" cx="520" cy="200" r="3"  fill="rgba(255,255,255,0.10)" />
      <circle className="dot-float-up"   cx="540" cy="80"  r="4"  fill="rgba(255,255,255,0.12)" style={{ animationDelay: "1s" }} />
      <circle className="dot-float-down" cx="60"  cy="300" r="4"  fill="rgba(255,255,255,0.10)" style={{ animationDelay: "0.5s" }} />
      <circle className="dot-float-up"   cx="100" cy="180" r="3"  fill="rgba(255,255,255,0.08)" style={{ animationDelay: "2s" }} />

      <circle cx="560" cy="760" r="90"
        fill="rgba(249,115,22,0.12)"
        style={{ animation: "pulse 6s ease-in-out infinite" }} />
    </svg>
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
          background: "linear-gradient(150deg, #7c2d12 0%, #ea580c 50%, #f97316 100%)",
        }}
      >

        <AnimatedSVG />

        <div className="relative z-10 flex flex-col h-full px-10 py-10 justify-between">

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center flex-1 py-10"
          >
            <img
              src={cenLogo}
              alt="CXUM Logo"
              className="w-full h-auto object-contain opacity-80 drop-shadow-xl"
              style={{ maxWidth: "clamp(160px, 55%, 340px)" }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-between"
          >
            <p className="text-white/25 text-xs">
              © {new Date().getFullYear()} CXUM. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          PANEL DERECHO — formulario limpio
      ════════════════════════════════════════════════ */}
      <div
        className="flex-1 flex flex-col"
        style={{ background: isDark ? "#0f172a" : "#ffffff" }}
      >
        {/* Barra superior */}
        <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b"
          style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9" }}
        >
          {/* Botón volver */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
          >
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 group-hover:scale-105 group-hover:shadow-md"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
              }}
            >
              <Iconify Size={15} IconString="solar:arrow-left-bold"
                Style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#64748b" }} />
            </span>
            <span
              className="text-sm font-semibold transition-colors"
              style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#94a3b8" }}
            >
              Volver al inicio
            </span>
          </Link>

          {/* Logo derecho */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2.5"
          >
            <div className="text-right hidden sm:block">
              <p className={`font-black text-sm tracking-tight leading-none ${isDark ? "text-white" : "text-slate-800"}`}>
                CXUM
              </p>
              <p className={`text-xs ${isDark ? "text-white/30" : "text-slate-400"}`}>
                Plataforma de gestión
              </p>
            </div>
            <img src={LogoCXUM} alt="CXUM" className="h-9 w-auto drop-shadow" />
          </motion.div>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 md:px-16 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm"
          >
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
                    <Iconify Size={14} IconString="solar:danger-circle-bold-duotone"
                      Style={{ color: "#ef4444", flexShrink: 0 }} />
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
                className="w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 mt-1 cursor-pointer"
                style={{
                  background: loading
                    ? "rgba(249,115,22,0.5)"
                    : "linear-gradient(135deg, #f97316, #ea580c)",
                  opacity: loading ? 0.7 : 1,
                  boxShadow: loading ? "none" : "0 4px 18px rgba(249,115,22,0.40)",
                  transition: "opacity 0.2s, box-shadow 0.2s",
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
              <div className="flex-1 h-px"
                style={{ background: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0" }} />
              <span className="text-xs"
                style={{ color: isDark ? "rgba(255,255,255,0.25)" : "#94a3b8" }}>o</span>
              <div className="flex-1 h-px"
                style={{ background: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0" }} />
            </div>

            {/* Olvidé contraseña */}
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
          </motion.div>
        </div>

       
      </div>
    </div>
  );
}
