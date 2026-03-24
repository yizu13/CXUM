import { createContext, useContext } from "react";

interface SettingsTypes {
    theme: "light" | "dark",
    setTheme: (el: "light" | "dark") => void
}
export const SettingsContext = createContext<SettingsTypes>({
    theme: "light",
    setTheme: () => {}
})

export const useSettings = () => useContext(SettingsContext);