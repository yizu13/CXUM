import { validateInviteToken } from "../APIs/inviteTokens";

/**
 * Valida un token de invitación dinámico contra el backend.
 * Devuelve { valid, reason, expiresAt }
 */
export async function validateInviteCode(token: string): Promise<{ valid: boolean; reason?: string }> {
  try {
    const result = await validateInviteToken(token);
    return result;
  } catch {
    return { valid: false, reason: "No se pudo validar el código. Intenta de nuevo." };
  }
}
