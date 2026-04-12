const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

function getCognitoAccessToken(): string | null {
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  if (!clientId) throw new Error("Falta VITE_COGNITO_CLIENT_ID");
  const userId = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.LastAuthUser`);
  if (!userId) return null;
  return localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.${userId}.accessToken`);
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const accessToken = getCognitoAccessToken();
  if (!accessToken) throw new Error("No se encontró access token");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error ${response.status}: ${text}`);
  }
  return response.json() as Promise<T>;
}

export async function publicFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error ${response.status}: ${text}`);
  }
  return response.json() as Promise<T>;
}
