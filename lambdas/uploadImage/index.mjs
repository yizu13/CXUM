import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { ok, badRequest, forbidden, serverError } from "./permissions.mjs";

const s3 = new S3Client({});
const BUCKET = process.env.IMAGES_BUCKET;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const handler = async (event) => {
  try {
    // Verificar autenticación (cualquier usuario autenticado puede subir)
    const username = event.requestContext?.authorizer?.lambda?.username;
    if (!username) return forbidden("No autenticado");

    const body = JSON.parse(event.body ?? "{}");
    const { fileName, fileType, fileSize } = body;

    // Validaciones
    if (!fileName || !fileType) {
      return badRequest("fileName y fileType son requeridos");
    }

    if (!ALLOWED_TYPES.includes(fileType)) {
      return badRequest(`Tipo de archivo no permitido. Permitidos: ${ALLOWED_TYPES.join(", ")}`);
    }

    if (fileSize && fileSize > MAX_SIZE) {
      return badRequest(`Archivo muy grande. Máximo: ${MAX_SIZE / 1024 / 1024}MB`);
    }

    // Generar nombre único
    const ext = fileName.split(".").pop();
    const key = `noticias/${Date.now()}-${randomUUID()}.${ext}`;

    // Generar URL presignada para PUT
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: fileType,
      Metadata: {
        uploadedBy: username,
        originalName: fileName,
      },
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 minutos

    // URL pública de la imagen (después de subir)
    const publicUrl = `https://${BUCKET}.s3.amazonaws.com/${key}`;

    return ok({
      uploadUrl,
      publicUrl,
      key,
      expiresIn: 300,
    });
  } catch (err) {
    console.error(err);
    return serverError();
  }
};
