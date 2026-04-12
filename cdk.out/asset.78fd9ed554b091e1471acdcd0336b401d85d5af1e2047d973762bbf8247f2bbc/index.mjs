import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand, DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { hasPermission, getRole, ok, created, forbidden, badRequest, notFound, serverError } from "./permissions.mjs";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.CENTROS_TABLE;

export const handler = async (event) => {
  try {
    if (!hasPermission(event, "canManageCenters")) return forbidden();

    const method = event.requestContext?.http?.method ?? event.httpMethod;
    const id = event.pathParameters?.id;

    // POST /admin/centros — crear
    if (method === "POST") {
      const body = JSON.parse(event.body ?? "{}");
      if (!body.nombre || !body.tipo || !body.estado) return badRequest("Faltan campos requeridos");

      const item = {
        id: randomUUID(),
        nombre: body.nombre,
        tipo: body.tipo,
        estado: body.estado,
        direccion: body.direccion ?? "",
        municipio: body.municipio ?? "",
        telefono: body.telefono ?? "",
        horario: body.horario ?? "",
        responsable: body.responsable ?? "",
        capacidad: Number(body.capacidad ?? 0),
        ocupacion: Number(body.ocupacion ?? 0),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: event.requestContext?.authorizer?.lambda?.username ?? "",
      };

      await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
      return created(item);
    }

    // PUT /admin/centros/{id} — editar
    if (method === "PUT") {
      if (!id) return badRequest("Falta el id");
      const existing = await ddb.send(new GetCommand({ TableName: TABLE, Key: { id } }));
      if (!existing.Item) return notFound("Centro no encontrado");

      const body = JSON.parse(event.body ?? "{}");
      const updated = {
        ...existing.Item,
        ...body,
        id,
        updatedAt: new Date().toISOString(),
      };
      await ddb.send(new PutCommand({ TableName: TABLE, Item: updated }));
      return ok(updated);
    }

    // DELETE /admin/centros/{id} — eliminar (solo administradores)
    if (method === "DELETE") {
      if (!id) return badRequest("Falta el id");
      if (getRole(event) !== "administradores") return forbidden("Solo administradores pueden eliminar centros");
      await ddb.send(new DeleteCommand({ TableName: TABLE, Key: { id } }));
      return ok({ message: "Centro eliminado", id });
    }

    return badRequest("Método no soportado");
  } catch (err) {
    console.error(err);
    return serverError();
  }
};
