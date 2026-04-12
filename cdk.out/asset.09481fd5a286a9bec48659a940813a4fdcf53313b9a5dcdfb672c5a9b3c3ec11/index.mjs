import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { ok, badRequest, forbidden, serverError } from "./permissions.mjs";

const s3 = new S3Client({});
const BUCKET = process.env.IMAGES_BUCKET;

export const handler = async (event) => {
  try {
    // Verificar autenticación
    const username = event.requestContext?.authorizer?.lambda?.username;
    if (!username) return forbidden("No autenticado");

    const method = event.requestContext?.http?.method ?? event.httpMethod;

    // GET - Listar imágenes
    if (method === "GET") {
      const prefix = event.queryStringParameters?.prefix || "noticias/";
      const maxKeys = parseInt(event.queryStringParameters?.limit || "100");

      const command = new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: prefix,
        MaxKeys: maxKeys,
      });

      const response = await s3.send(command);

      const images = (response.Contents || [])
        .filter((item) => item.Key && item.Size > 0) // Filtrar carpetas vacías
        .map((item) => ({
          key: item.Key,
          url: `https://${BUCKET}.s3.amazonaws.com/${item.Key}`,
          size: item.Size,
          lastModified: item.LastModified,
        }))
        .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

      return ok({
        images,
        count: images.length,
        bucket: BUCKET,
      });
    }

    // DELETE - Eliminar imagen
    if (method === "DELETE") {
      const body = JSON.parse(event.body ?? "{}");
      const { key } = body;

      if (!key) {
        return badRequest("key es requerido");
      }

      // Solo permitir eliminar imágenes en la carpeta noticias/
      if (!key.startsWith("noticias/")) {
        return forbidden("Solo se pueden eliminar imágenes de la carpeta noticias/");
      }

      const command = new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      });

      await s3.send(command);

      return ok({
        message: "Imagen eliminada",
        key,
      });
    }

    return badRequest("Método no soportado");
  } catch (err) {
    console.error(err);
    return serverError();
  }
};
