import { CognitoJwtVerifier } from "aws-jwt-verify";

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  clientId: process.env.COGNITO_APP_CLIENT_ID,
  tokenUse: "access",
});

function getBearerToken(headers = {}) {
  const raw = headers.authorization ?? headers.Authorization;
  if (!raw?.startsWith("Bearer ")) return null;
  return raw.slice(7).trim();
}

const VALID_ROLES = ["administradores", "colaborador", "escritor", "voluntario"];

export const handler = async (event) => {
  try {
    const token = getBearerToken(event.headers);
    if (!token) return { isAuthorized: false, context: { reason: "missing_token" } };

    const payload = await verifier.verify(token);
    const groups = Array.isArray(payload["cognito:groups"]) ? payload["cognito:groups"] : [];
    const role = VALID_ROLES.find((r) => groups.includes(r)) ?? null;

    // Cualquier usuario autenticado con un rol válido puede pasar
    const isAuthorized = role !== null;

    return {
      isAuthorized,
      context: {
        sub: String(payload.sub ?? ""),
        username: String(payload.username ?? ""),
        email: String(payload.email ?? ""),
        groups: groups.join(","),
        role: role ?? "",
      },
    };
  } catch (error) {
    console.error("Authorizer error:", error);
    return { isAuthorized: false, context: { reason: "unauthorized" } };
  }
};
