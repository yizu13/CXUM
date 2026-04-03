import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useSettings } from "../../hooks/context/SettingsContext";
import Iconify from "../../components/modularUI/IconsMock";
import { forgotPassword, confirmForgotPassword } from "../components/cognito";

type Step = "email" | "reset";

// ─── Campo genérico ───────────────────────────────────────────────────────────
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
          className={`w-full pl-10 ${isPassword ? "pr-10" : "pr-4"} py-3 rounded-xl border text-sm font-medium outline-none
            transition-all duration-200 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60
            ${isDark
              ? "bg-white/[0.05] border-white/[0.08] text-white placeholder:text-white/20"
              : "bg-white border-black/[0.08] text-slate-800 placeholder:text-slate-400"
            }
            ${error ? "border-red-500/60" : ""}
          `}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2">
            <Iconify Size={16}
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

// ─── Indicador fortaleza ──────────────────────────────────────────────────────
function PasswordStrength({ password, isDark }: { password: string; isDark: boolean }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score  = checks.filter(Boolean).length;
  const labels = ["", "Débil", "Regular", "Buena", "Fuerte"];
  const colors = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];
  if (!password) return null;
  return (
    <div className="flex flex-col gap-1.5 mt-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < score ? colors[score] : isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0" }}
          />
        ))}
      </div>
      <span className="text-[10px] font-bold" style={{ color: colors[score] }}>{labels[score]}</span>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function RestoreAccountPage() {
  const { theme } = useSettings();
  const isDark    = theme === "dark";
  const navigate  = useNavigate();

  const [step, setStep]           = useState<Step>("email");
  const [email, setEmail]         = useState("");
  const [code, setCode]           = useState("");
  const [newPass, setNewPass]     = useState("");
  const [newPass2, setNewPass2]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(false);

  const cardBg      = isDark ? "bg-white/[0.03]" : "bg-white";
  const cardShadow  = isDark
    ? "0 0 0 1px rgba(255,255,255,0.07)"
    : "0 8px 48px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.05)";
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textMuted   = isDark ? "text-white/40" : "text-slate-400";

  // ── Paso 1: solicitar código ───────────────────────────────────────────────
  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email) { setError("Ingresa tu correo electrónico."); return; }
    setLoading(true);
    try {
      await forgotPassword(email);
      setStep("reset");
    } catch (err: any) {
      const msg: Record<string, string> = {
        UserNotFoundException:  "No existe una cuenta con ese correo.",
        LimitExceededException: "Demasiados intentos. Espera unos minutos.",
      };
      setError(msg[err.code] ?? err.message ?? "Error al enviar el código.");
    } finally {
      setLoading(false);
    }
  }

  // ── Paso 2: confirmar nueva contraseña ────────────────────────────────────
  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!code || !newPass || !newPass2) { setError("Completa todos los campos."); return; }
    if (newPass !== newPass2) { setError("Las contraseñas no coinciden."); return; }
    if (newPass.length < 8)  { setError("Mínimo 8 caracteres."); return; }
    setLoading(true);
    try {
      await confirmForgotPassword(email, code, newPass);
      setSuccess(true);
      setTimeout(() => navigate("/plataforma/login"), 2500);
    } catch (err: any) {
      const msg: Record<string, string> = {
        CodeMismatchException:    "El código es incorrecto.",
        ExpiredCodeException:     "El código ha expirado. Vuelve a solicitar uno.",
        InvalidPasswordException: "La contraseña no cumple los requisitos mínimos.",
      };
      setError(msg[err.code] ?? err.message ?? "Error al restablecer la contraseña.");
    } finally {
      setLoading(false);
    }
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${isDark ? "bg-[#05070b]" : "bg-[#f8fafc]"}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={`w-full max-w-sm rounded-3xl p-10 flex flex-col items-center gap-5 text-center ${cardBg}`}
          style={{ boxShadow: cardShadow }}
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
          <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0" }}>
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
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${isDark ? "bg-[#05070b]" : "bg-[#f8fafc]"}`}>
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: isDark
          ? "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(245,158,11,0.08) 0%, transparent 70%)"
          : "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(245,158,11,0.06) 0%, transparent 70%)",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 28, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0,  filter: "blur(0px)"  }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={`relative w-full max-w-md rounded-3xl p-8 md:p-10 flex flex-col gap-8 ${cardBg}`}
        style={{ boxShadow: cardShadow }}
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1"
            style={{ background: "linear-gradient(135deg, #f59e0b, #fb923c)" }}
          >
            <Iconify Size={26} IconString="solar:lock-keyhole-unlocked-bold-duotone" Style={{ color: "#fff" }} />
          </div>
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

        {/* ── PASO 1: Email ─────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {step === "email" && (
            <motion.form
              key="email"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={handleEmailSubmit}
              className="flex flex-col gap-5"
            >
              <Field
                label="Correo electrónico" type="email" value={email} onChange={setEmail}
                placeholder="tu@correo.com" icon="solar:letter-bold-duotone" isDark={isDark}
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

              <motion.button
                type="submit" disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #fb923c)",
                  opacity: loading ? 0.7 : 1,
                  boxShadow: "0 4px 20px rgba(245,158,11,0.35)",
                }}
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Enviando…</>
                  : <><Iconify Size={16} IconString="solar:letter-bold-duotone" />Enviar código</>
                }
              </motion.button>

              <Link to="/plataforma/login"
                className={`text-xs font-semibold text-center hover:underline ${textMuted}`}>
                ← Volver al login
              </Link>
            </motion.form>
          )}

          {/* ── PASO 2: Código + nueva contraseña ─────────────────── */}
          {step === "reset" && (
            <motion.form
              key="reset"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={handleResetSubmit}
              className="flex flex-col gap-5"
            >
              {/* OTP */}
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-bold tracking-wide ${isDark ? "text-white/60" : "text-slate-500"}`}>
                  Código de verificación
                </label>
                <input
                  type="text" inputMode="numeric" maxLength={6}
                  value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className={`w-full text-center text-2xl font-black tracking-[0.5em] py-3.5 rounded-xl border outline-none
                    transition-all duration-200 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60
                    ${isDark
                      ? "bg-white/[0.05] border-white/[0.08] text-white placeholder:text-white/15"
                      : "bg-white border-black/[0.08] text-slate-900 placeholder:text-slate-300"
                    }`}
                />
              </div>

              <div className="flex flex-col gap-1">
                <Field
                  label="Nueva contraseña" type="password" value={newPass} onChange={setNewPass}
                  placeholder="••••••••" icon="solar:lock-password-bold-duotone" isDark={isDark}
                />
                <PasswordStrength password={newPass} isDark={isDark} />
              </div>

              <Field
                label="Confirmar contraseña" type="password" value={newPass2} onChange={setNewPass2}
                placeholder="••••••••" icon="solar:lock-password-bold-duotone" isDark={isDark}
                error={newPass2 && newPass !== newPass2 ? "Las contraseñas no coinciden" : undefined}
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

              <motion.button
                type="submit" disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #fb923c)",
                  opacity: loading ? 0.7 : 1,
                  boxShadow: "0 4px 20px rgba(245,158,11,0.35)",
                }}
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Actualizando…</>
                  : <><Iconify Size={16} IconString="solar:lock-keyhole-unlocked-bold-duotone" />Restablecer contraseña</>
                }
              </motion.button>

              <button type="button" onClick={() => { setStep("email"); setError(""); }}
                className={`text-xs font-semibold text-center hover:underline ${textMuted}`}>
                ← Volver
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
