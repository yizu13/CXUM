import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.INVITE_TOKENS_TABLE;

const cors = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
};

function res(statusCode, body) {
  return { statusCode, headers: cors, body: JSON.stringify(body) };
}

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body ?? "{}");
    const token = (body.token ?? "").trim().toUpperCase();

    if (!token) return res(400, { valid: false, reason: "Falta el token" });

    const result = await ddb.send(new GetCommand({ TableName: TABLE, Key: { token } }));
    const item = result.Item;

    if (!item) return res(400, { valid: false, reason: "Token inválido" });

    if (item.status === "usado") return res(400, { valid: false, reason: "Este token ya fue utilizado" });

    const now = new Date();
    const expiresAt = new Date(item.expiresAt);
    if (now > expiresAt) {
      // Marcar como expirado
      await ddb.send(new PutCommand({ TableName: TABLE, Item: { ...item, status: "expirado" } }));
      return res(400, { valid: false, reason: "El token ha expirado" });
    }

    // Token válido — devolver info sin marcarlo aún (se marca al completar registro)
    return res(200, {
      valid: true,
      expiresAt: item.expiresAt,
    });
  } catch (err) {
    console.error(err);
    return res(500, { valid: false, reason: "Error interno" });
  }
};
