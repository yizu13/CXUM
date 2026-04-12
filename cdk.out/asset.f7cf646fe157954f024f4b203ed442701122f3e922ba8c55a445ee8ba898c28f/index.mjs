import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { randomBytes } from "crypto";
import { hasPermission, ok, forbidden, serverError } from "../_shared/permissions.mjs";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.INVITE_TOKENS_TABLE;
const TTL_MINUTES = 20;

function generateToken() {
  // Formato: CXUM-XXXX-XXXX-XXXX (hex legible)
  const part = () => randomBytes(2).toString("hex").toUpperCase();
  return `CXUM-${part()}-${part()}-${part()}`;
}

export const handler = async (event) => {
  try {
    // Solo usuarios autenticados con cualquier rol pueden generar tokens
    if (!hasPermission(event, "canViewCenters")) return forbidden();

    const requestedBy = event.requestContext?.authorizer?.lambda?.username ?? "";
    const now = Date.now();
    const expiresAt = now + TTL_MINUTES * 60 * 1000;
    const token = generateToken();

    const item = {
      token,
      status: "activo",       // activo | usado | expirado
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(expiresAt).toISOString(),
      expiresAtEpoch: Math.floor(expiresAt / 1000), // TTL nativo de DynamoDB
      createdBy: requestedBy,
    };

    await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));

    return ok({
      token,
      expiresAt: item.expiresAt,
      expiresInMinutes: TTL_MINUTES,
    });
  } catch (err) {
    console.error(err);
    return serverError();
  }
};
