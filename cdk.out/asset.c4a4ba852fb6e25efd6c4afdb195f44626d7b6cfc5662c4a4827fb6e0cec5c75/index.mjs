import { CognitoIdentityProviderClient, AdminAddUserToGroupCommand, AdminRemoveUserFromGroupCommand, AdminDisableUserCommand, AdminEnableUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { hasPermission, ok, forbidden, badRequest, serverError } from "./permissions.mjs";
import { logActivity } from "./logActivity.mjs";

const cognito = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const PROFILES_TABLE = process.env.PROFILES_TABLE;
const ROLE_GROUPS = ["voluntario", "escritor", "colaborador", "administradores"];

export const handler = async (event) => {
  try {
    if (!hasPermission(event, "canManageUsers")) return forbidden();

    const body = JSON.parse(event.body ?? "{}");
    const { username, role, status, telefono, municipio } = body;
    if (!username) return badRequest("Falta el username");

    // ── Cambiar rol en Cognito ────────────────────────────────────────────────
    if (role) {
      if (!ROLE_GROUPS.includes(role)) return badRequest("Rol inválido");
      for (const group of ROLE_GROUPS) {
        try {
          await cognito.send(new AdminRemoveUserFromGroupCommand({ UserPoolId: USER_POOL_ID, Username: username, GroupName: group }));
        } catch (_) {}
      }
      await cognito.send(new AdminAddUserToGroupCommand({ UserPoolId: USER_POOL_ID, Username: username, GroupName: role }));
    }

    // ── Cambiar status (enable/disable en Cognito) ────────────────────────────
    if (status) {
      if (!["activo", "suspendido"].includes(status)) return badRequest("Status inválido");
      if (status === "suspendido") {
        await cognito.send(new AdminDisableUserCommand({ UserPoolId: USER_POOL_ID, Username: username }));
      } else {
        await cognito.send(new AdminEnableUserCommand({ UserPoolId: USER_POOL_ID, Username: username }));
      }
    }

    // ── Guardar perfil extra en DynamoDB ──────────────────────────────────────
    if (telefono !== undefined || municipio !== undefined || status !== undefined) {
      const existing = await ddb.send(new GetCommand({ TableName: PROFILES_TABLE, Key: { username } }));
      const profile = existing.Item ?? { username };
      await ddb.send(new PutCommand({
        TableName: PROFILES_TABLE,
        Item: {
          ...profile,
          ...(telefono  !== undefined && { telefono }),
          ...(municipio !== undefined && { municipio }),
          ...(status    !== undefined && { status }),
          updatedAt: new Date().toISOString(),
        },
      }));
    }

    await logActivity({
      type: "usuario",
      icon: "solar:user-check-rounded-bold-duotone",
      color: "#22c55e",
      text: `Usuario actualizado: ${username}${role ? ` → ${role}` : ""}${status ? ` (${status})` : ""}`,
      actor: event.requestContext?.authorizer?.lambda?.username ?? "",
    });

    return ok({ message: "Usuario actualizado", username, role, status });
  } catch (err) {
    console.error(err);
    return serverError();
  }
};
