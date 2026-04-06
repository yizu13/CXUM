import { useState, useEffect, type ReactNode } from "react";
import { getAuthUser, checkSession, ROLE_PERMISSIONS } from "./auth";
import type { AuthUser, UserRole } from "./auth";
import { AuthContext } from "./AuthContextComps";
import { useNavigate } from "react-router-dom";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(false);
  const [login, setLogin] = useState(false);
  const navigate = useNavigate();

  const changeReload = () => setReload((prev) => !prev);

  useEffect(() => {
    (async () => {
      try {
        const valid = await checkSession();
        if (valid && login) {
          const authUser = await getAuthUser();
          setUser(authUser);
          navigate("/plataforma/admin");
          setLogin(false);
        } else if (valid){
          const authUser = await getAuthUser();
          setUser(authUser);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload]);

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
    <AuthContext.Provider value={{ user, loading, setUser, hasPermission, hasGroup, changeReload, setLogin }}>
      {children}
    </AuthContext.Provider>
  );
}
