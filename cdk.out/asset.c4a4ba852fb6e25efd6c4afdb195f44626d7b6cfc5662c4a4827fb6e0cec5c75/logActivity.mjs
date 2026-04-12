import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

/**
 * Registra un evento de actividad en DynamoDB.
 * @param {object} opts
 * @param {string} opts.type - Tipo de evento: "noticia"|"centro"|"usuario"|"solicitud"|"sistema"
 * @param {string} opts.icon - Iconify icon string
 * @param {string} opts.color - Color hex
 * @param {string} opts.text - Descripción del evento
 * @param {string} [opts.actor] - Username del actor
 */
export async function logActivity({ type, icon, color, text, actor = "" }) {
  const table = process.env.ACTIVITY_TABLE;
  if (!table) return; // silencioso si no está configurado

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
    // No lanzar — el log no debe romper la operación principal
  }
}
