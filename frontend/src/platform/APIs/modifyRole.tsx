import { apiFetch } from "./api";

export type UserRole = "voluntario" | "escritor" | "colaborador" | "administrador";

export interface UserFromApi {
  username: string;
  email: string;
  name: string;
  sub: string;
  status: string;
  enabled: boolean;
  group: UserRole | null;
  groups: string[];
  attributes: Record<string, string>;
  userStatus?: string; // Estado de Cognito: FORCE_CHANGE_PASSWORD, CONFIRMED, etc.
}

export interface ListUsersResponse {
  count: number;
  users: UserFromApi[];
}

export async function getAllUsers(): Promise<ListUsersResponse> {
  return apiFetch<ListUsersResponse>("/admin/usersget", { method: "GET" });
}

export interface UpdateUserInput {
  name: string;
  role: string;
  status: string;
  telefono: string;
  municipio: string;
}

export async function updateUserRole(username: string, data: UpdateUserInput): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/admin/users/${username}`, {
    method: "PUT",
    body: JSON.stringify({ username, ...data }),
  });
}
