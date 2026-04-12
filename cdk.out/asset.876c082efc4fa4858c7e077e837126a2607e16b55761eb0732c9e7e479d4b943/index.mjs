import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { CognitoIdentityProviderClient, AdminAddUserToGroupCommand, AdminRemoveUserFromGroupCommand } from "@aws-sdk/client-cognito-identity-provider";
import { hasPermission, ok, forbidden, badRequest, notFound, serverError } from "./permissions.mjs";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const cognito = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const TABLE = process.env.SOLICITUDES_TABLE;
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const ROLE_GROUPS = ["voluntario", "escritor", "colaborador", "administradores"];

export const handler = async (event) => {
  try {
    if (!hasPermission(event, "canManageUsers")) return forbidden();

    const id = event.pathParameters?.id;
    if (!id) return badRequest("Falta el id");

    const existing = await ddb.send(new GetCommand({ TableName: TABLE, Key: { id } }));
    if (!existing.Item) return notFound("Solicitud no encontrada");

    const body = JSON.parse(event.body ?? "{}");
    const { accion } = body; // "aprobar" | "rechazar"

    if (!["aprobar", "rechazar"].includes(accion)) return badRequest("Acción inválida");

    const updatedStatus = accion === "aprobar" ? "aprobada" : "rechazada";
    const updated = {
      ...existing.Item,
      status: updatedStatus,
      resolvedAt: new Date().toISOString(),
      resolvedBy: event.requestContext?.authorizer?.lambda?.username ?? "",
    };

    // Si se aprueba y es cambio de rol, actualizar en Cognito
    if (accion === "aprobar" && existing.Item.tipo === "cambio_rol" && existing.Item.rolSolicitado) {
      const username = existing.Item.voluntarioUsername;
      if (username) {
        for (const group of ROLE_GROUPS) {
          try {
            await cognito.send(new AdminRemoveUserFromGroupCommand({ UserPoolId: USER_POOL_ID, Username: username, GroupName: group }));
          } catch (_) {}
        }
        await cognito.send(new AdminAddUserToGroupCommand({ UserPoolId: USER_POOL_ID, Username: username, GroupName: existing.Item.rolSolicitado }));
      }
    }

    await ddb.send(new PutCommand({ TableName: TABLE, Item: updated }));
    return ok(updated);
  } catch (err) {
    console.error(err);
    return serverError();
  }
};
