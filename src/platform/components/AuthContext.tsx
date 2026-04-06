import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getAuthUser, checkSession, ROLE_PERMISSIONS } from "./auth";
import type { AuthUser, UserRole } from "./auth";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  hasPermission: (permission: keyof (typeof ROLE_PERMISSIONS)[UserRole]) => boolean;
  hasGroup: (group: string) => boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  hasPermission: () => false,
  hasGroup: () => false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const valid = await checkSession();
        if (valid) {
          const authUser = await getAuthUser();
          setUser(authUser);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const hasPermission = (
    permission: keyof (typeof ROLE_PERMISSIONS)[UserRole]
  ): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role][permission];
  };

  const hasGroup = (group: string): boolean => {
    return user?.groups?.includes(group) ?? false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, hasPermission, hasGroup }}>
      {children}
    </AuthContext.Provider>
  );
}
