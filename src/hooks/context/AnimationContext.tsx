import { createContext, useContext } from "react";

interface AnimationContextType {
  navReady: boolean;
  setNavReady: (v: boolean) => void;
}

export const AnimationContext = createContext<AnimationContextType>({
  navReady: false,
  setNavReady: () => {},
});

export const useAnimation = () => useContext(AnimationContext);
