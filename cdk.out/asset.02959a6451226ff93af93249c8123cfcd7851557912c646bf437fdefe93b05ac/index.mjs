import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { hasPermission, getRole, ok, created, forbidden, badRequest, notFound, serverError } from "../_shared/permissions.mjs";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.NOTICIAS_TABLE;

function toSlug(titulo) {
  return titulo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export const handler = async (event) => {
  try {
    if (!hasPermission(event, "canManageNews")) return forbidden();

    const method = event.requestContext?.http?.method ?? event.httpMethod;
    const id = event.pathParameters?.id;

    if (method === "POST") {
      const body = JSON.parse(event.body ?? "{}");
      if (!body.titulo || !body.contenido) return badRequest("Faltan campos requeridos");

      const tags = typeof body.tags === "string"
        ? body.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : (body.tags ?? []);

      const item = {
        id: randomUUID(),
        titulo: body.titulo,
        slug: toSlug(body.titulo),
        resumen: body.resumen ?? "",
        contenido: body.contenido,
        categoria: body.categoria ?? "general",
        autor: body.autor ?? event.requestContext?.authorizer?.lambda?.username ?? "",
        estado: body.estado ?? "borrador",
        portada: body.portada ?? "",
        tags,
        vistas: 0,
        likes: 0,
        compartidos: 0,
        fechaPublicacion: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: event.requestContext?.authorizer?.lambda?.username ?? "",
      };

      await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
      return created(item);
    }

    if (method === "PUT") {
      if (!id) return badRequest("Falta el id");
      const existing = await ddb.send(new GetCommand({ TableName: TABLE, Key: { id } }));
      if (!existing.Item) return notFound("Noticia no encontrada");

      const body = JSON.parse(event.body ?? "{}");
      const tags = typeof body.tags === "string"
        ? body.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : (body.tags ?? existing.Item.tags);

      const updated = { ...existing.Item, ...body, id, tags, updatedAt: new Date().toISOString() };
      await ddb.send(new PutCommand({ TableName: TABLE, Item: updated }));
      return ok(updated);
    }

    if (method === "DELETE") {
      if (!id) return badRequest("Falta el id");
      if (getRole(event) !== "administradores") return forbidden("Solo administradores pueden eliminar noticias");
      await ddb.send(new DeleteCommand({ TableName: TABLE, Key: { id } }));
      return ok({ message: "Noticia eliminada", id });
    }

    return badRequest("Método no soportado");
  } catch (err) {
    console.error(err);
    return serverError();
  }
};
