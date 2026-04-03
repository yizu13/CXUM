import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useSettings } from "../../hooks/context/SettingsContext";
import Iconify from "../../components/modularUI/IconsMock";
import { signUp, confirmSignUp, resendConfirmationCode } from "../components/cognito";
import { validateInviteCode } from "../components/inviteCodes";

// ─── Tipos de paso ─────────────────────────────────────────────────────────────
type Step = "invite" | "form" | "otp";

// ─── Campo genérico reutilizable ──────────────────────────────────────────────
function Field({
  label, type, value, onChange, placeholder, icon, isDark, error, hint,
}: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  icon: string; isDark: boolean; error?: string; hint?: string;
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
      {hint && !error && <p className={`text-xs ${isDark ? "text-white/30" : "text-slate-400"}`}>{hint}</p>}
    </div>
  );
}

// ─── Indicador de fortaleza de contraseña ─────────────────────────────────────
function PasswordStrength({ password, isDark }: { password: string; isDark: boolean }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Débil", "Regular", "Buena", "Fuerte"];
  const colors = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];

  if (!password) return null;
  return (
    <div className="flex flex-col gap-1.5 mt-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < score ? colors[score] : isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0" }}
          />
        ))}
      </div>
      <span className="text-[10px] font-bold" style={{ color: colors[score] }}>
        {labels[score]}
      </span>
    </div>
  );
}

// ─── Stepper visual ───────────────────────────────────────────────────────────
function Stepper({ current, isDark }: { current: number; isDark: boolean }) {
  const steps = ["Código", "Datos", "Verificación"];
  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((label, i) => {
        const done    = i < current;
        const active  = i === current;
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

// ─── Alerta de error ──────────────────────────────────────────────────────────
function ErrorAlert({ msg }: { msg: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
      style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}
    >
      <Iconify Size={15} IconString="solar:danger-circle-bold-duotone" />
      {msg}
    </motion.div>
  );
}

// ─── Page principal ───────────────────────────────────────────────────────────
export default function RegisterPage() {
  const { theme } = useSettings();
  const isDark    = theme === "dark";
  const navigate  = useNavigate();

  // ── Pasos
  const [step, setStep] = useState<Step>("invite");

  // ── Paso 1: código de invitación
  const [inviteCode, setInviteCode] = useState("");

  // ── Paso 2: datos del usuario
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [password2, setPassword2] = useState("");

  // ── Paso 3: OTP
  const [otp,     setOtp]     = useState("");
  const [otpSent, setOtpSent] = useState(false); // para mostrar el reenvío

  // ── Estado general
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const stepIndex: Record<Step, number> = { invite: 0, form: 1, otp: 2 };

  const cardBg     = isDark ? "bg-white/[0.03]" : "bg-white";
  const cardShadow = isDark
    ? "0 0 0 1px rgba(255,255,255,0.07)"
    : "0 8px 48px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.05)";
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textMuted   = isDark ? "text-white/40" : "text-slate-400";

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleInviteSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!inviteCode.trim()) { setError("Ingresa el código de invitación."); return; }
    setLoading(true);
    try {
      const valid = await validateInviteCode(inviteCode);
      if (!valid) { setError("Código de invitación inválido o ya utilizado."); return; }
      setStep("form");
    } catch {
      setError("No se pudo validar el código. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name || !email || !password || !password2) {
      setError("Completa todos los campos."); return;
    }
    if (password !== password2) {
      setError("Las contraseñas no coinciden."); return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres."); return;
    }
    setLoading(true);
    try {
      await signUp(name, email, password);
      // Cognito envía el OTP automáticamente al correo
      setOtpSent(true);
      setStep("otp");
    } catch (err: any) {
      const msg: Record<string, string> = {
        UsernameExistsException: "Ya existe una cuenta con ese correo.",
        InvalidPasswordException: "La contraseña no cumple los requisitos de seguridad.",
      };
      setError(msg[err.code] ?? err.message ?? "Error al registrar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (otp.length < 4) { setError("Ingresa el código de verificación."); return; }
    setLoading(true);
    try {
      await confirmSignUp(email, otp);
      navigate("/plataforma/login?verified=1");
    } catch (err: any) {
      const msg: Record<string, string> = {
        CodeMismatchException:   "El código es incorrecto.",
        ExpiredCodeException:    "El código ha expirado. Solicita uno nuevo.",
        NotAuthorizedException:  "Esta cuenta ya fue confirmada.",
      };
      setError(msg[err.code] ?? err.message ?? "Error al verificar.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setLoading(true);
    try {
      await resendConfirmationCode(email);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message ?? "No se pudo reenviar el código.");
    } finally {
      setLoading(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 py-12 ${isDark ? "bg-[#05070b]" : "bg-[#f8fafc]"}`}
    >
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
            <Iconify Size={26} IconString="solar:user-plus-bold-duotone" Style={{ color: "#fff" }} />
          </div>
          <h1 className={`text-2xl font-black tracking-tight ${textPrimary}`}>Crear cuenta</h1>
          <p className={`text-sm text-center ${textMuted}`}>
            Solo miembros con código de invitación pueden registrarse
          </p>
        </div>

        {/* Stepper */}
        <Stepper current={stepIndex[step]} isDark={isDark} />

        {/* ── PASO 1: Código de invitación ───────────────────────── */}
        <AnimatePresence mode="wait">
          {step === "invite" && (
            <motion.form
              key="invite"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={handleInviteSubmit}
              className="flex flex-col gap-5"
            >
              <div
                className="flex items-start gap-3 p-4 rounded-2xl"
                style={{ background: isDark ? "rgba(245,158,11,0.08)" : "rgba(245,158,11,0.06)" }}
              >
                <Iconify Size={18} IconString="solar:key-bold-duotone" Style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
                <p className={`text-xs leading-relaxed ${isDark ? "text-white/55" : "text-slate-500"}`}>
                  Para registrarte en la plataforma CXUM necesitas un{" "}
                  <strong className={textPrimary}>código de invitación</strong> proporcionado
                  por un administrador. Si no lo tienes, contacta al equipo.
                </p>
              </div>

              <Field
                label="Código de invitación" type="text"
                value={inviteCode} onChange={(v) => setInviteCode(v.toUpperCase())}
                placeholder="CXUM-XXXX-XXXX"
                icon="solar:ticket-bold-duotone" isDark={isDark}
                error={undefined}
                hint="El código es sensible a mayúsculas"
              />

              {error && <ErrorAlert msg={error} />}

              <SubmitBtn loading={loading} label="Validar código" icon="solar:arrow-right-bold" />

              <p className={`text-center text-xs ${textMuted}`}>
                ¿Ya tienes cuenta?{" "}
                <Link to="/plataforma/login" className="font-bold hover:underline" style={{ color: "#f59e0b" }}>
                  Inicia sesión
                </Link>
              </p>
            </motion.form>
          )}

          {/* ── PASO 2: Datos del usuario ──────────────────────────── */}
          {step === "form" && (
            <motion.form
              key="form"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={handleFormSubmit}
              className="flex flex-col gap-5"
            >
              <Field label="Nombre completo" type="text" value={name} onChange={setName}
                placeholder="María Pérez" icon="solar:user-bold-duotone" isDark={isDark} />

              <Field label="Correo electrónico" type="email" value={email} onChange={setEmail}
                placeholder="tu@correo.com" icon="solar:letter-bold-duotone" isDark={isDark} />

              <div className="flex flex-col gap-1">
                <Field label="Contraseña" type="password" value={password} onChange={setPassword}
                  placeholder="••••••••" icon="solar:lock-password-bold-duotone" isDark={isDark} />
                <PasswordStrength password={password} isDark={isDark} />
              </div>

              <Field label="Confirmar contraseña" type="password" value={password2} onChange={setPassword2}
                placeholder="••••••••" icon="solar:lock-password-bold-duotone" isDark={isDark}
                error={password2 && password !== password2 ? "Las contraseñas no coinciden" : undefined} />

              {error && <ErrorAlert msg={error} />}

              <SubmitBtn loading={loading} label="Crear cuenta" icon="solar:user-plus-bold" />

              <button type="button" onClick={() => { setStep("invite"); setError(""); }}
                className={`text-xs font-semibold text-center hover:underline ${textMuted}`}>
                ← Volver
              </button>
            </motion.form>
          )}

          {/* ── PASO 3: OTP ────────────────────────────────────────── */}
          {step === "otp" && (
            <motion.form
              key="otp"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={handleOtpSubmit}
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

              {/* Input OTP grande */}
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-bold tracking-wide ${isDark ? "text-white/60" : "text-slate-500"}`}>
                  Código de verificación
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className={`w-full text-center text-3xl font-black tracking-[0.4em] py-4 rounded-xl border outline-none
                    transition-all duration-200 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60
                    ${isDark
                      ? "bg-white/[0.05] border-white/[0.08] text-white placeholder:text-white/15"
                      : "bg-white border-black/[0.08] text-slate-900 placeholder:text-slate-300"
                    }`}
                />
              </div>

              {error && <ErrorAlert msg={error} />}

              {otpSent && !error && (
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
      </motion.div>
    </div>
  );
}

// ─── Botón de submit compartido ───────────────────────────────────────────────
function SubmitBtn({ loading, label, icon }: { loading: boolean; label: string; icon: string }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      className="w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2"
      style={{
        background: "linear-gradient(135deg, #f59e0b, #fb923c)",
        opacity: loading ? 0.7 : 1,
        boxShadow: "0 4px 20px rgba(245,158,11,0.35)",
      }}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          Procesando…
        </>
      ) : (
        <>
          <Iconify Size={16} IconString={icon} />
          {label}
        </>
      )}
    </motion.button>
  );
}
