import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useSettings } from "../../hooks/context/SettingsContext";
import { useAuth } from "./AuthContext";
import Iconify from "../../components/modularUI/IconsMock";

export default function AdminLayout() {
  const { theme, setTheme } = useSettings();
  const isDark = theme === "dark";
  const { user } = useAuth();

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: isDark ? "#05070b" : "#f1f5f9" }}
    >
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="flex-shrink-0 h-14 flex items-center justify-between px-6 border-b"
          style={{
            background: isDark
              ? "rgba(10,12,17,0.92)"
              : "rgba(255,255,255,0.92)",
            borderColor: isDark
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.08)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Left: status */}
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#22c55e", display: "inline-block" }}
            />
            <span
              className="text-xs font-semibold"
              style={{
                color: isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.38)",
              }}
            >
              Sistema activo
            </span>
          </div>

          {/* Right: controls */}
          <div className="flex items-center gap-2">
            {/* User badge */}
            <div
              className="hidden sm:flex text-xs font-bold px-2.5 py-1 rounded-lg"
              style={{
                background: isDark
                  ? "rgba(245,158,11,0.1)"
                  : "rgba(245,158,11,0.12)",
                color: "#f59e0b",
                border: "1px solid rgba(245,158,11,0.22)",
              }}
            >
              {user?.email}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
              }}
            >
              <Iconify
                Size={16}
                IconString={
                  isDark
                    ? "solar:sun-bold-duotone"
                    : "solar:moon-bold-duotone"
                }
                Style={{ color: "currentColor" }}
              />
            </button>

            {/* Open site */}
            <button
              onClick={() => window.open("/", "_blank")}
              title="Ver sitio público"
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
              }}
            >
              <Iconify
                Size={16}
                IconString="solar:arrow-right-up-linear"
                Style={{ color: "currentColor" }}
              />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
