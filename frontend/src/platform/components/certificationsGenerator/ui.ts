import type React from "react";

export function cardStyle(isDark: boolean): React.CSSProperties {
  return {
    background: isDark ? "rgba(255,255,255,0.025)" : "#ffffff",
    borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    boxShadow: isDark ? "none" : "0 1px 6px rgba(0,0,0,0.06)",
  };
}

export function inputStyle(isDark: boolean): React.CSSProperties {
  return {
    background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
    borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
    color: isDark ? "rgba(255,255,255,0.76)" : "#334155",
  };
}

export function mutedText(isDark: boolean): string {
  return isDark ? "rgba(255,255,255,0.45)" : "#64748b";
}

export function strongText(isDark: boolean): string {
  return isDark ? "#ffffff" : "#0f172a";
}

export function panelBg(isDark: boolean): string {
  return isDark ? "rgba(15,17,23,0.88)" : "#ffffff";
}

export function subtleBorder(isDark: boolean): string {
  return isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
}

export const FIELD_CLASS =
  "w-full rounded-xl border px-3 py-2 text-sm font-medium outline-none transition focus:ring-2 focus:ring-amber-500/30";

export const TOOL_BUTTON_CLASS =
  "h-9 min-w-9 rounded-xl border px-3 text-xs font-black transition";
