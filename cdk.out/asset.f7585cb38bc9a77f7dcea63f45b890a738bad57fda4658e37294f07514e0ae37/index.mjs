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

// Se llama después de confirmar el OTP exitosamente para marcar el token como usado
export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body ?? "{}");
    const token = (body.token ?? "").trim().toUpperCase();
    const usedBy = body.email ?? "";

    if (!token) return res(400, { message: "Falta el token" });

    const result = await ddb.send(new GetCommand({ TableName: TABLE, Key: { token } }));
    const item = result.Item;

    if (!item) return res(404, { message: "Token no encontrado" });
    if (item.status !== "activo") return res(400, { message: "Token no disponible" });

    // Verificar que no haya expirado
    if (new Date() > new Date(item.expiresAt)) {
      await ddb.send(new PutCommand({ TableName: TABLE, Item: { ...item, status: "expirado" } }));
      return res(400, { message: "Token expirado" });
    }

    await ddb.send(new PutCommand({
      TableName: TABLE,
      Item: { ...item, status: "usado", usedBy, usedAt: new Date().toISOString() },
    }));

    return res(200, { message: "Token consumido correctamente" });
  } catch (err) {
    console.error(err);
    return res(500, { message: "Error interno" });
  }
};
