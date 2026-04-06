import { CognitoUser } from "amazon-cognito-identity-js";
import { getCurrentUser } from "./cognito";

export type UserRole = "voluntario" | "escritor" | "colaborador" | "administradores";

export interface AuthUser {
  email: string;
  name: string;
  role: UserRole;
  groups: string[];
  status: "activo" | "pendiente" | "suspendido";
  sub: string;
}

/**
 * Obtiene los atributos del usuario autenticado y devuelve el AuthUser.
 * Lee el rol desde el atributo custom:role de Cognito.
 */
export function getAuthUser(): Promise<AuthUser | null> {
  return new Promise((resolve) => {
    const cognitoUser: CognitoUser | null = getCurrentUser();
    if (!cognitoUser) { resolve(null); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cognitoUser.getSession((err: Error | null, session: any) => {
    if (err || !session?.isValid()) { resolve(null); return; }

    const payload = session.getIdToken().decodePayload();
    const groups: string[] = payload["cognito:groups"] ?? [];

    const VALID_ROLES: UserRole[] = ["administradores", "colaborador", "escritor", "voluntario"];
    const role = VALID_ROLES.find((r) => groups.includes(r)) ?? "voluntario";

    cognitoUser.getUserAttributes((attrErr, attrs) => {
    if (attrErr || !attrs) { resolve(null); return; }

    const get = (name: string) =>
    attrs.find((a) => a.getName() === name)?.getValue() ?? "";

    resolve({
        email:  get("email"),
          name:   get("name"),
            role,
          groups,
          status: (get("custom:status") as AuthUser["status"]) || "activo",
          sub:    get("sub"),
        });
      });
    });
  });
}

/** Verifica si hay una sesión válida activa */
export function checkSession(): Promise<boolean> {
  return new Promise((resolve) => {
    const cognitoUser = getCurrentUser();
    if (!cognitoUser) { resolve(false); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cognitoUser.getSession((err: Error | null, session: any) => {
      resolve(!err && session?.isValid());
    });
  });
}

/** Permisos por rol */
export const ROLE_PERMISSIONS: Record<UserRole, {
  canManageUsers: boolean;
  canManageNews: boolean;
  canManageCenters: boolean;
  canViewStats: boolean;
  canViewCenters: boolean;
}> = {
  voluntario:      { canManageUsers: false, canManageNews: false, canManageCenters: false, canViewStats: true,  canViewCenters: true  },
  escritor:        { canManageUsers: false, canManageNews: true,  canManageCenters: false, canViewStats: true,  canViewCenters: true  },
  colaborador:     { canManageUsers: false, canManageNews: true,  canManageCenters: true,  canViewStats: true,  canViewCenters: true  },
  administradores: { canManageUsers: true,  canManageNews: true,  canManageCenters: true,  canViewStats: true,  canViewCenters: true  },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  voluntario:      "Voluntario",
  escritor:        "Escritor",
  colaborador:     "Colaborador",
  administradores: "Administrador",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  voluntario:      "#6366f1",
  escritor:        "#10b981",
  colaborador:     "#f59e0b",
  administradores: "#ef4444",
};
