import { useEffect, useState, type ReactNode } from "react";
import { SettingsContext } from "./context/SettingsContext";
import { AnimationProvider } from "./AnimationProvider";


type ProviderType = {
  children: ReactNode;
};

export default function SettingsProvider({ children }: ProviderType) {
  const [theme, seTheme] = useState<"light" | "dark">("light");
  useEffect(()=>{
    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (storedTheme) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      seTheme(storedTheme);
    }
  },[])
  const setTheme = (el: "light" | "dark") => {
    seTheme(el);
    localStorage.setItem("theme", el);
  };
  return (
    <SettingsContext.Provider value={{ theme, setTheme }}>
      <AnimationProvider>{children}</AnimationProvider>
    </SettingsContext.Provider>
  );
}
