import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ok, serverError } from "./permissions.mjs";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.CENTROS_TABLE;

export const handler = async (event) => {
  try {
    // Permite acceso público (frontoffice) y autenticado (admin panel)
    // La ruta /admin/centros tiene authorizer, /centros es pública
    const result = await ddb.send(new ScanCommand({ TableName: TABLE }));
    const items = (result.Items ?? []).sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    return ok({ count: items.length, centros: items });
  } catch (err) {
    console.error(err);
    return serverError();
  }
};
