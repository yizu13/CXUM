import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminAddUserToGroupCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { hasPermission, ok, forbidden, badRequest, notFound, serverError } from "./permissions.mjs";
import { logActivity } from "./logActivity.mjs";

const cognito = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const SOLICITUDES_TABLE = process.env.SOLICITUDES_TABLE;
const PROFILES_TABLE = process.env.PROFILES_TABLE;

function generateTempPassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const special = "!@#$";
  let pwd = "";
  for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  pwd += special[Math.floor(Math.random() * special.length)];
  pwd += Math.floor(Math.random() * 9) + 1;
  return pwd.split("").sort(() => Math.random() - 0.5).join("");
}

function normalizePhone(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (raw.startsWith("+") && digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

function conflict(message) {
  return {
    statusCode: 409,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ message }),
  };
}

export const handler = async (event) => {
  try {
    if (!hasPermission(event, "canManageUsers")) return forbidden();

    const body = JSON.parse(event.body ?? "{}");
    const solicitudId = String(body.solicitudId ?? "").trim();
    if (!solicitudId) return badRequest("Falta solicitudId");

    const result = await ddb.send(new GetCommand({ TableName: SOLICITUDES_TABLE, Key: { id: solicitudId } }));
    const solicitud = result.Item;
    if (!solicitud) return notFound("Solicitud no encontrada");
    if (solicitud.tipo !== "registro" || solicitud.status !== "aprobada") {
      return badRequest("Solo se pueden incluir solicitudes de voluntariado aprobadas");
    }
    if (solicitud.sistemaIncluido) return conflict("Esta solicitud ya fue incluida en el sistema");

    const email = String(solicitud.email ?? "").trim().toLowerCase();
    const name = String(solicitud.nombre ?? "").trim();
    const telefono = normalizePhone(solicitud.phone);
    const municipio = String(solicitud.municipio ?? "").trim();
    if (!email || !name) return badRequest("La solicitud no contiene nombre y correo validos");
    if (telefono === null) return badRequest("El telefono de la solicitud no tiene un formato valido");

    const tempPassword = generateTempPassword();
    const userAttributes = [
      { Name: "email", Value: email },
      { Name: "name", Value: name },
      { Name: "email_verified", Value: "true" },
    ];
    if (telefono) userAttributes.push({ Name: "phone_number", Value: telefono });
    if (municipio) userAttributes.push({ Name: "custom:municipio", Value: municipio });

    await cognito.send(new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      TemporaryPassword: tempPassword,
      UserAttributes: userAttributes,
      DesiredDeliveryMediums: ["EMAIL"],
      MessageAction: "SUPPRESS",
    }));

    await cognito.send(new AdminAddUserToGroupCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      GroupName: "voluntario",
    }));

    const now = new Date().toISOString();
    await ddb.send(new PutCommand({
      TableName: PROFILES_TABLE,
      Item: {
        username: email,
        email,
        name,
        telefono,
        municipio,
        solicitudId,
        idDocument: solicitud.idDocument ?? "",
        birthDate: solicitud.birthDate ?? "",
        address: solicitud.address ?? "",
        socialMedia: solicitud.socialMedia ?? "",
        occupation: solicitud.occupation ?? "",
        educationLevel: solicitud.educationLevel ?? "",
        skills: solicitud.skills ?? "",
        areas: solicitud.areas ?? [],
        availability: solicitud.availability ?? "",
        weeklyHours: solicitud.weeklyHours ?? "",
        emergencyName: solicitud.emergencyName ?? "",
        emergencyRelation: solicitud.emergencyRelation ?? "",
        emergencyPhone: solicitud.emergencyPhone ?? "",
        status: "activo",
        createdAt: now,
        updatedAt: now,
      },
    }));

    const updatedSolicitudResult = await ddb.send(new UpdateCommand({
      TableName: SOLICITUDES_TABLE,
      Key: { id: solicitudId },
      UpdateExpression: "SET sistemaIncluido = :included, systemUsername = :username, includedAt = :includedAt, includedBy = :includedBy",
      ConditionExpression: "#status = :approved AND (attribute_not_exists(sistemaIncluido) OR sistemaIncluido = :notIncluded)",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":included": true,
        ":notIncluded": false,
        ":approved": "aprobada",
        ":username": email,
        ":includedAt": now,
        ":includedBy": event.requestContext?.authorizer?.lambda?.username ?? "",
      },
      ReturnValues: "ALL_NEW",
    }));

    await logActivity({
      type: "usuario",
      icon: "solar:user-plus-bold-duotone",
      color: "#6366f1",
      text: `Usuario incluido en sistema: ${name} (${email})`,
      actor: event.requestContext?.authorizer?.lambda?.username ?? "",
    });

    return ok({
      message: "Usuario creado correctamente",
      email,
      tempPassword,
      solicitud: updatedSolicitudResult.Attributes,
      user: {
        username: email,
        name,
        email,
        role: "voluntario",
        status: "activo",
        telefono,
        municipio,
        userStatus: "FORCE_CHANGE_PASSWORD",
      },
    });
  } catch (err) {
    console.error(err);
    if (err?.name === "UsernameExistsException") return conflict("Ya existe un usuario con ese correo");
    if (err?.name === "ConditionalCheckFailedException") return conflict("La solicitud ya fue incluida o cambio de estado");
    return serverError();
  }
};
