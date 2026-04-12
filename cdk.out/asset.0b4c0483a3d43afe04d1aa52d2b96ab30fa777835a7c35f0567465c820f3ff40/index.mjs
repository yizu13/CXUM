import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand, DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { hasPermission, getRole, ok, created, forbidden, badRequest, notFound, serverError } from "./permissions.mjs";
import { logActivity } from "./logActivity.mjs";

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
        latitud: Number(body.latitud ?? 18.4861),
        longitud: Number(body.longitud ?? -69.9312),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: event.requestContext?.authorizer?.lambda?.username ?? "",
      };

      await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
      await logActivity({ type: "centro", icon: "solar:map-point-bold-duotone", color: "#f59e0b", text: `Centro creado: ${item.nombre}`, actor: item.createdBy });
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
      await logActivity({ type: "centro", icon: "solar:map-point-bold-duotone", color: "#f59e0b", text: `Centro actualizado: ${updated.nombre}`, actor: event.requestContext?.authorizer?.lambda?.username ?? "" });
      return ok(updated);
    }

    // DELETE /admin/centros/{id} — eliminar (solo administradores)
    if (method === "DELETE") {
      if (!id) return badRequest("Falta el id");
      if (getRole(event) !== "administradores") return forbidden("Solo administradores pueden eliminar centros");
      await ddb.send(new DeleteCommand({ TableName: TABLE, Key: { id } }));
      await logActivity({ type: "centro", icon: "solar:trash-bin-trash-bold-duotone", color: "#ef4444", text: `Centro eliminado (id: ${id})`, actor: event.requestContext?.authorizer?.lambda?.username ?? "" });
      return ok({ message: "Centro eliminado", id });
    }

    return badRequest("Método no soportado");
  } catch (err) {
    console.error(err);
    return serverError();
  }
};
