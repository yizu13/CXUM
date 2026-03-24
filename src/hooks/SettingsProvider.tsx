import { useState, type ReactNode } from "react";
import { SettingsContext } from "./context/SettingsContext";


type ProviderType={
    children: ReactNode
}


export default function SettingsProvider({children}: ProviderType){
    const [theme, setTheme] = useState<"light" | "dark">("light");
    return(
        <SettingsContext.Provider value={{theme, setTheme}}>
            {children}
        </SettingsContext.Provider>
    )
}