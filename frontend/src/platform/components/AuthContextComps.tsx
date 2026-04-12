import { createContext, useContext } from "react";
import { ROLE_PERMISSIONS } from "./auth";
import type { AuthUser, UserRole } from "./auth";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  hasPermission: (permission: keyof (typeof ROLE_PERMISSIONS)[UserRole]) => boolean;
  hasGroup: (group: string) => boolean;
  changeReload: () => void;
  setLogin: (login: boolean) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  hasPermission: () => false,
  hasGroup: () => false,
  changeReload: () => {},
   setLogin: () => {},
});

export const useAuth = () => useContext(AuthContext);