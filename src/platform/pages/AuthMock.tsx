import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSettings } from "../../hooks/context/SettingsContext";
import Iconify from "../../components/modularUI/IconsMock";
import LogoCXUM from "../../assets/LogoCXUM.png";
import cenLogo from "../../assets/logoCentralizado.png";

// ─── SVG animado del panel izquierdo ─────────────────────────────────────────
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
            fill: none; stroke: rgba(255,255,255,0.10); stroke-width: 1.5;
            animation: rotateSlowCW 28s linear infinite;
            transform-box: fill-box; transform-origin: center;
          }
          .rect-mid {
            fill: none; stroke: rgba(255,255,255,0.07); stroke-width: 1;
            animation: rotateSlowCCW 22s linear infinite;
            transform-box: fill-box; transform-origin: center;
          }
          .rect-inner {
            fill: none; stroke: rgba(255,255,255,0.05); stroke-width: 1;
            animation: rotateSlowCW 34s linear infinite;
            transform-box: fill-box; transform-origin: center;
          }
          .circle-bot {
            animation: scaleBreath 5s ease-in-out infinite;
            transform-box: fill-box; transform-origin: center;
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

// ─── Mock compartido ──────────────────────────────────────────────────────────
// Mantiene exactamente el layout de login.tsx: panel naranja izquierdo + panel
// blanco/dark derecho. Los formularios se inyectan como children en el panel derecho.
export default function AuthMock({ children }: { children: React.ReactNode }) {
  const { theme } = useSettings();
  const isDark    = theme === "dark";

  return (
    <div className="min-h-screen w-full flex">

      {/* ── Panel izquierdo ── */}
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

      {/* ── Panel derecho ── */}
      <div
        className="flex-1 flex flex-col"
        style={{ background: isDark ? "#0f172a" : "#ffffff" }}
      >
        {/* Barra superior */}
        <div
          className="flex items-center justify-between px-8 pt-7 pb-4 border-b"
          style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9" }}
        >
          <Link to="/" className="flex items-center gap-2 group">
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

        {/* Contenido del formulario */}
        <div className="flex-1 flex items-center justify-center px-8 md:px-16 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
