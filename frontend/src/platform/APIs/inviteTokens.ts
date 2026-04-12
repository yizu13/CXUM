import { apiFetch, publicFetch } from "./api";

export interface InviteTokenResponse {
  token: string;
  expiresAt: string;
  expiresInMinutes: number;
}

export interface ValidateTokenResponse {
  valid: boolean;
  reason?: string;
  expiresAt?: string;
}

// Genera un token nuevo (requiere estar autenticado)
export const generateInviteToken = () =>
  apiFetch<InviteTokenResponse>("/admin/invite-token");

// Valida un token antes de registrarse (público)
export const validateInviteToken = (token: string) =>
  publicFetch<ValidateTokenResponse>("/invite/validate", {
    method: "POST",
    body: JSON.stringify({ token }),
  });

// Marca el token como usado después de confirmar OTP (público)
export const consumeInviteToken = (token: string, email: string) =>
  publicFetch<{ message: string }>("/invite/consume", {
    method: "POST",
    body: JSON.stringify({ token, email }),
  });
