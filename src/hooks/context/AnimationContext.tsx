import { createContext, useContext, useState, type ReactNode } from "react";

interface AnimationContextType {
  navReady: boolean;
  setNavReady: (v: boolean) => void;
}

export const AnimationContext = createContext<AnimationContextType>({
  navReady: false,
  setNavReady: () => {},
});

export const useAnimation = () => useContext(AnimationContext);

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [navReady, setNavReady] = useState(false);
  return (
    <AnimationContext.Provider value={{ navReady, setNavReady }}>
      {children}
    </AnimationContext.Provider>
  );
}
