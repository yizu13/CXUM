import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

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
    const usedBy = (body.email ?? "").trim().toLowerCase();

    if (!token || !usedBy) return res(400, { message: "Faltan el token o el correo" });

    const usedAt = new Date().toISOString();
    await ddb.send(new UpdateCommand({
      TableName: TABLE,
      Key: { token },
      UpdateExpression: "SET #status = :used, usedBy = :email, usedAt = :usedAt REMOVE reservedBy, reservedAt, reservedUntil",
      ConditionExpression: "#status = :reserved AND reservedBy = :email",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":reserved": "reservado",
        ":used": "usado",
        ":email": usedBy,
        ":usedAt": usedAt,
      },
    }));

    return res(200, { message: "Token consumido correctamente" });
  } catch (err) {
    console.error(err);
    if (err?.name === "ConditionalCheckFailedException") {
      return res(409, { message: "Token no disponible para esta cuenta" });
    }
    return res(500, { message: "Error interno" });
  }
};
