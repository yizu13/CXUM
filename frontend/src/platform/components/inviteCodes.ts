/**
 * Códigos de invitación válidos.
 * En producción esto debe venir de tu backend / base de datos,
 * nunca hardcodeado en el frontend. Este archivo es solo para
 * el arranque del proyecto; reemplázalo por una llamada a tu API.
 *
 * Ejemplo de endpoint sugerido:
 *   POST /api/invite-codes/validate   { code: string } → 200 | 400
 */
export async function validateInviteCode(code: string): Promise<boolean> {
  // ── Temporal: lista local ─────────────────────────────────────────────────
  // Reemplazar por: const res = await fetch('/api/invite-codes/validate', {...})
  const VALID_CODES = (import.meta.env.VITE_INVITE_CODES ?? "").split(",").map((c: string) => c.trim());
  return VALID_CODES.includes(code.trim().toUpperCase());
}
