import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  AdminUpdateUserAttributesCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { hasPermission, ok, forbidden, badRequest, serverError } from "./permissions.mjs";
import { logActivity } from "./logActivity.mjs";

const cognito = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const PROFILES_TABLE = process.env.PROFILES_TABLE;
const ROLE_GROUPS = ["voluntario", "escritor", "colaborador", "administradores"];

function normalizePhone(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (raw.startsWith("+") && digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

export const handler = async (event) => {
  try {
    if (!hasPermission(event, "canManageUsers")) return forbidden();

    const body = JSON.parse(event.body ?? "{}");
    const { username, role, status, name, telefono, municipio } = body;
    if (!username) return badRequest("Falta el username");

    const normalizedName = name === undefined ? undefined : String(name).trim();
    const normalizedPhone = telefono === undefined ? undefined : normalizePhone(telefono);
    const normalizedMunicipio = municipio === undefined ? undefined : String(municipio).trim();

    if (normalizedName !== undefined && (normalizedName.length < 2 || normalizedName.length > 100)) {
      return badRequest("El nombre debe tener entre 2 y 100 caracteres");
    }
    if (normalizedPhone === null) return badRequest("El telefono debe incluir un numero valido con codigo de area");
    if (normalizedMunicipio !== undefined && (normalizedMunicipio.length < 2 || normalizedMunicipio.length > 100)) {
      return badRequest("El municipio debe tener entre 2 y 100 caracteres");
    }
    if (role && !ROLE_GROUPS.includes(role)) return badRequest("Rol invalido");
    if (status && !["activo", "pendiente", "suspendido"].includes(status)) return badRequest("Status invalido");

    const userAttributes = [];
    if (normalizedName !== undefined) userAttributes.push({ Name: "name", Value: normalizedName });
    if (normalizedPhone !== undefined) userAttributes.push({ Name: "phone_number", Value: normalizedPhone });
    if (normalizedMunicipio !== undefined) userAttributes.push({ Name: "custom:municipio", Value: normalizedMunicipio });
    if (userAttributes.length > 0) {
      await cognito.send(new AdminUpdateUserAttributesCommand({
        UserPoolId: USER_POOL_ID,
        Username: username,
        UserAttributes: userAttributes,
      }));
    }

    if (role) {
      for (const group of ROLE_GROUPS) {
        try {
          await cognito.send(new AdminRemoveUserFromGroupCommand({
            UserPoolId: USER_POOL_ID,
            Username: username,
            GroupName: group,
          }));
        } catch (_) {}
      }
      await cognito.send(new AdminAddUserToGroupCommand({
        UserPoolId: USER_POOL_ID,
        Username: username,
        GroupName: role,
      }));
    }

    if (status) {
      const command = status === "suspendido"
        ? new AdminDisableUserCommand({ UserPoolId: USER_POOL_ID, Username: username })
        : new AdminEnableUserCommand({ UserPoolId: USER_POOL_ID, Username: username });
      await cognito.send(command);
    }

    if (normalizedName !== undefined || normalizedPhone !== undefined || normalizedMunicipio !== undefined || status !== undefined) {
      const existing = await ddb.send(new GetCommand({ TableName: PROFILES_TABLE, Key: { username } }));
      const profile = existing.Item ?? { username };
      await ddb.send(new PutCommand({
        TableName: PROFILES_TABLE,
        Item: {
          ...profile,
          ...(normalizedName !== undefined && { name: normalizedName }),
          ...(normalizedPhone !== undefined && { telefono: normalizedPhone }),
          ...(normalizedMunicipio !== undefined && { municipio: normalizedMunicipio }),
          ...(status !== undefined && { status }),
          updatedAt: new Date().toISOString(),
        },
      }));
    }

    await logActivity({
      type: "usuario",
      icon: "solar:user-check-rounded-bold-duotone",
      color: "#22c55e",
      text: `Usuario actualizado: ${normalizedName ?? username}${role ? ` -> ${role}` : ""}${status ? ` (${status})` : ""}`,
      actor: event.requestContext?.authorizer?.lambda?.username ?? "",
    });

    return ok({
      message: "Usuario actualizado",
      username,
      name: normalizedName,
      role,
      status,
      telefono: normalizedPhone,
      municipio: normalizedMunicipio,
    });
  } catch (err) {
    console.error(err);
    return serverError();
  }
};
