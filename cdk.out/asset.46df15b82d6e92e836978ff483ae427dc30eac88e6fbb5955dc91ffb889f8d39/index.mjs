import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.INVITE_TOKENS_TABLE;
const RESERVATION_MINUTES = 10;

export const handler = async (event) => {
  const token = (event.request?.validationData?.inviteToken ?? "").trim().toUpperCase();
  const email = (event.request?.userAttributes?.email ?? event.userName ?? "").trim().toLowerCase();

  if (!token || !email) {
    throw new Error("Se requiere un codigo de invitacion valido");
  }

  const nowEpoch = Math.floor(Date.now() / 1000);
  const reservedUntil = nowEpoch + RESERVATION_MINUTES * 60;

  try {
    await ddb.send(new UpdateCommand({
      TableName: TABLE,
      Key: { token },
      UpdateExpression: "SET #status = :reserved, reservedBy = :email, reservedAt = :reservedAt, reservedUntil = :reservedUntil",
      ConditionExpression: [
        "attribute_exists(#token)",
        "expiresAtEpoch > :nowEpoch",
        "(#status = :active OR (#status = :reserved AND (reservedBy = :email OR reservedUntil < :nowEpoch)))",
      ].join(" AND "),
      ExpressionAttributeNames: {
        "#token": "token",
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":active": "activo",
        ":reserved": "reservado",
        ":email": email,
        ":reservedAt": new Date().toISOString(),
        ":reservedUntil": reservedUntil,
        ":nowEpoch": nowEpoch,
      },
    }));
  } catch (error) {
    console.error("Invite validation failed", { token, email, errorName: error?.name });
    if (error?.name === "ConditionalCheckFailedException") {
      throw new Error("El codigo de invitacion no esta disponible");
    }
    throw error;
  }

  return event;
};
