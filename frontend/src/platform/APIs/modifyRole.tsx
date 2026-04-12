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

export async function updateUserRole(username: string, role?: string, status?: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/admin/users/${username}`, {
    method: "PUT",
    body: JSON.stringify({ username, role, status }),
  });
}
