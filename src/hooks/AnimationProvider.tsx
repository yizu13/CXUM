import { useState, type ReactNode } from "react";
import { AnimationContext } from "./context/AnimationContext";



export function AnimationProvider({ children }: { children: ReactNode }) {
  const [navReady, setNavReady] = useState(false);
  return (
    <AnimationContext.Provider value={{ navReady, setNavReady }}>
      {children}
    </AnimationContext.Provider>
  );
}
