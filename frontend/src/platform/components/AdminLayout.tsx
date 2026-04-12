import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useSettings } from "../../hooks/context/SettingsContext";
import Iconify from "../../components/modularUI/IconsMock";
import { useAuth } from "./AuthContextComps";

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
        <header
          className="shrink-0 h-14 flex items-center justify-between px-6 border-b"
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
          <div className="flex items-center gap-2">
           
          </div>

          <div className="flex items-center gap-2">
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

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
