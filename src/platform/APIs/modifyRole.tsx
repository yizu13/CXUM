const API_BASE_URL = "https://0g9zfpq4fj.execute-api.us-east-2.amazonaws.com";

function getCognitoAccessToken(): string | null {
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;

  if (!clientId) {
    throw new Error("Falta VITE_COGNITO_CLIENT_ID");
  }

  const lastAuthUserKey = `CognitoIdentityServiceProvider.${clientId}.LastAuthUser`;
  const userId = localStorage.getItem(lastAuthUserKey);

  if (!userId) {
    console.error("No se encontró LastAuthUser", { lastAuthUserKey });
    return null;
  }

  const accessTokenKey = `CognitoIdentityServiceProvider.${clientId}.${userId}.accessToken`;
  const accessToken = localStorage.getItem(accessTokenKey);

  return accessToken;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const accessToken = getCognitoAccessToken();

  if (!accessToken) {
    throw new Error("No se encontró access token en localStorage");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}

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
}

export interface ListUsersResponse {
  count: number;
  users: UserFromApi[];
}

export async function getAllUsers(): Promise<ListUsersResponse> {
  return apiFetch<ListUsersResponse>("/admin/usersget", {
    method: "GET",
  });
}