import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export async function logActivity({ type, icon, color, text, actor = "" }) {
  const table = process.env.ACTIVITY_TABLE;
  if (!table) return;

  try {
    await ddb.send(new PutCommand({
      TableName: table,
      Item: {
        pk: "ACTIVITY",
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        type,
        icon,
        color,
        text,
        actor,
      },
    }));
  } catch (err) {
    console.error("logActivity error:", err);
  }
}
