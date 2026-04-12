import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { ok, notFound, serverError } from "./permissions.mjs";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.NOTICIAS_TABLE;

// Esta lambda NO requiere authorizer — es pública para el frontoffice
// Para el admin panel se usa con authorizer y devuelve todos los estados
export const handler = async (event) => {
  try {
    const slug = event.pathParameters?.slug;
    const isAdmin = event.requestContext?.authorizer?.lambda?.role !== undefined;

    // GET /noticias/{slug} — detalle público
    if (slug) {
      const result = await ddb.send(new ScanCommand({
        TableName: TABLE,
        FilterExpression: "#slug = :slug",
        ExpressionAttributeNames: { "#slug": "slug" },
        ExpressionAttributeValues: { ":slug": slug },
      }));
      const item = result.Items?.[0];
      if (!item) return notFound("Noticia no encontrada");
      if (!isAdmin && item.estado !== "publicado") return notFound("Noticia no encontrada");
      return ok(item);
    }

    // GET /noticias — listado
    const result = await ddb.send(new ScanCommand({ TableName: TABLE }));
    let items = result.Items ?? [];

    // Público solo ve publicadas
    if (!isAdmin) items = items.filter((n) => n.estado === "publicado");

    items.sort((a, b) => (b.fechaPublicacion ?? "").localeCompare(a.fechaPublicacion ?? ""));
    return ok({ count: items.length, noticias: items });
  } catch (err) {
    console.error(err);
    return serverError();
  }
};
