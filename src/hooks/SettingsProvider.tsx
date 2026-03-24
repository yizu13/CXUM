import { useState, type ReactNode } from "react";
import { SettingsContext } from "./context/SettingsContext";
import { AnimationProvider } from "./context/AnimationContext";

type ProviderType = {
  children: ReactNode;
};

export default function SettingsProvider({ children }: ProviderType) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  return (
    <SettingsContext.Provider value={{ theme, setTheme }}>
      <AnimationProvider>{children}</AnimationProvider>
    </SettingsContext.Provider>
  );
}
