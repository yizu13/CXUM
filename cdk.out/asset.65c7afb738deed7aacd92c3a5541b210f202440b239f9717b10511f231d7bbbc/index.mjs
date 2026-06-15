import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { badRequest, created, forbidden, getAuthenticatedUser, notFound, ok, serverError } from "./permissions.mjs";

const s3 = new S3Client({});
const BUCKET = process.env.CERTIFICATES_BUCKET;
const MAX_TEMPLATE_SIZE = 40 * 1024 * 1024;
const MAX_GENERATION_FILE_SIZE = 250 * 1024 * 1024;
const MAX_BATCH_FILES = 300;
const TEMPLATE_TYPES = new Set(["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"]);
const GENERATION_TYPES = new Set(["application/pdf", "application/zip", "application/x-zip-compressed", "application/json"]);

export const handler = async (event) => {
  try {
    const user = getAuthenticatedUser(event);
    if (!user) return forbidden("No autenticado");

    const method = event.requestContext?.http?.method ?? event.httpMethod;
    const path = event.rawPath ?? event.path ?? "";

    if (method === "POST" && path.endsWith("/templates/upload-url")) {
      return createTemplateUploadUrl(event, user);
    }

    if (method === "GET" && path.endsWith("/templates")) {
      return listTemplates();
    }

    if (method === "DELETE" && path.includes("/templates/")) {
      return deleteTemplate(event);
    }

    if (method === "POST" && path.endsWith("/generations/upload-urls")) {
      return createGenerationUploadUrls(event, user);
    }

    if (method === "GET" && path.endsWith("/generations")) {
      return listGenerations(event);
    }

    if (method === "GET" && path.includes("/generations/")) {
      return getGeneration(event);
    }

    if (method === "PUT" && path.includes("/generations/")) {
      return completeGeneration(event);
    }

    if (method === "DELETE" && path.includes("/generations/")) {
      return deleteGeneration(event);
    }

    if (method === "GET" && path.endsWith("/download")) {
      return createDownloadUrl(event);
    }

    if (method === "DELETE" && path.endsWith("/files")) {
      return deleteFile(event);
    }

    return badRequest("Ruta de certificados no soportada");
  } catch (err) {
    console.error(err);
    return serverError();
  }
};

async function createTemplateUploadUrl(event, user) {
  const body = parseBody(event);
  const fileName = cleanFileName(body.fileName);
  const fileType = String(body.fileType ?? "");
  const fileSize = Number(body.fileSize ?? 0);
  const templateName = String(body.templateName ?? fileName.replace(/\.[^.]+$/, "")).trim();

  if (!fileName || !templateName || !fileType) return badRequest("templateName, fileName y fileType son requeridos");
  if (!TEMPLATE_TYPES.has(fileType)) return badRequest("Tipo de plantilla no permitido");
  if (fileSize <= 0 || fileSize > MAX_TEMPLATE_SIZE) return badRequest("Tamano de plantilla invalido");

  const templateId = body.templateId || randomUUID();
  const templateSlug = slugify(templateName);
  const key = `templates/${templateSlug}/${templateId}/${fileName}`;
  const metadataKey = `templates/${templateSlug}/${templateId}/metadata.json`;

  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: fileType,
      Metadata: {
        uploadedBy: user.username,
        originalName: fileName,
        templateName,
        templateId,
      },
    }),
    { expiresIn: 900 },
  );

  await putJson(metadataKey, {
    id: templateId,
    name: templateName,
    fileName,
    fileType,
    fileSize,
    key,
    bucketPrefix: `templates/${templateSlug}/${templateId}`,
    createdAt: new Date().toISOString(),
    createdBy: user.username,
  });

  return created({
    template: {
      id: templateId,
      name: templateName,
      key,
      bucketPrefix: `templates/${templateSlug}/${templateId}`,
      metadataKey,
    },
    uploadUrl,
    expiresIn: 900,
  });
}

async function listTemplates() {
  const metadataObjects = await listAllObjects("templates/");
  const metadataKeys = metadataObjects.map((item) => item.Key).filter((key) => key?.endsWith("/metadata.json"));
  const templates = await Promise.all(metadataKeys.map(readJsonObject));
  return ok({
    templates: templates.filter(Boolean).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    count: templates.filter(Boolean).length,
    bucket: BUCKET,
  });
}

async function deleteTemplate(event) {
  const templateId = event.pathParameters?.templateId;
  const body = parseBody(event);
  const prefix = body.bucketPrefix || event.queryStringParameters?.bucketPrefix || (templateId ? await findTemplatePrefix(templateId) : "");

  if (!prefix || !isSafePrefix(prefix, "templates/")) return badRequest("bucketPrefix o templateId invalido");
  await deletePrefix(prefix.endsWith("/") ? prefix : `${prefix}/`);
  return ok({ message: "Plantilla eliminada", templateId, bucketPrefix: prefix });
}

async function createGenerationUploadUrls(event, user) {
  const body = parseBody(event);
  const templateName = String(body.templateName ?? "").trim();
  const files = Array.isArray(body.files) ? body.files.slice(0, MAX_BATCH_FILES) : [];

  if (!templateName) return badRequest("templateName es requerido");
  if (files.length === 0) return badRequest("files debe contener al menos un archivo");

  const generationId = body.generationId || randomUUID();
  const templateId = body.templateId || "";
  const templateSlug = slugify(templateName);
  const dateSlug = new Date().toISOString().replace(/[:.]/g, "-");
  const bucketPrefix = `generations/${templateSlug}/${generationId}-${dateSlug}`;
  const invalidFile = files.find((file, index) => {
    const fileName = cleanFileName(file.fileName || `certificado-${index + 1}.pdf`);
    const fileType = String(file.contentType || file.fileType || "application/pdf");
    const fileSize = Number(file.fileSize ?? file.size ?? 0);
    return !fileName || !GENERATION_TYPES.has(fileType) || fileSize <= 0 || fileSize > MAX_GENERATION_FILE_SIZE;
  });
  if (invalidFile) return badRequest("Uno o mas archivos de la generacion son invalidos");

  const uploadUrls = await Promise.all(
    files.map(async (file, index) => {
      const fileName = cleanFileName(file.fileName || `certificado-${index + 1}.pdf`);
      const fileType = String(file.contentType || file.fileType || "application/pdf");
      const fileSize = Number(file.fileSize ?? file.size ?? 0);

      const key = `${bucketPrefix}/${String(index + 1).padStart(3, "0")}-${fileName}`;
      const uploadUrl = await getSignedUrl(
        s3,
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          ContentType: fileType,
          Metadata: {
            uploadedBy: user.username,
            templateName,
            templateId,
            generationId,
          },
        }),
        { expiresIn: 900 },
      );
      return { key, uploadUrl, fileName, contentType: fileType, expiresIn: 900 };
    }),
  );

  const generation = {
    id: generationId,
    templateId,
    templateName,
    createdAt: new Date().toISOString(),
    createdBy: user.username,
    records: Number(body.records ?? files.length),
    bucketPrefix,
    status: "uploading",
    expectedFiles: uploadUrls.length,
  };

  await putJson(`${bucketPrefix}/metadata.json`, generation);
  return created({ generation, uploadUrls, bucket: BUCKET });
}

async function listGenerations(event) {
  const templateSlug = event.queryStringParameters?.templateName
    ? `${slugify(event.queryStringParameters.templateName)}/`
    : "";
  const prefix = `generations/${templateSlug}`;
  const objects = await listAllObjects(prefix);
  const metadataKeys = objects.map((item) => item.Key).filter((key) => key?.endsWith("/metadata.json"));
  const generations = await Promise.all(metadataKeys.map(readJsonObject));

  return ok({
    generations: generations.filter(Boolean).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    count: generations.filter(Boolean).length,
    bucket: BUCKET,
  });
}

async function getGeneration(event) {
  const generationId = event.pathParameters?.generationId;
  const prefix = event.queryStringParameters?.bucketPrefix || (generationId ? await findGenerationPrefix(generationId) : "");
  if (!prefix || !isSafePrefix(prefix, "generations/")) return notFound("Generacion no encontrada");

  const objects = await listAllObjects(prefix.endsWith("/") ? prefix : `${prefix}/`);
  const files = objects
    .filter((item) => item.Key && !item.Key.endsWith("/metadata.json"))
    .map((item) => ({
      key: item.Key,
      size: item.Size,
      lastModified: item.LastModified,
      fileName: item.Key.split("/").pop(),
    }));
  const metadata = await readJsonObject(`${prefix.replace(/\/$/, "")}/metadata.json`);

  return ok({ generation: metadata ?? { id: generationId, bucketPrefix: prefix }, files, count: files.length });
}

async function completeGeneration(event) {
  const generationId = event.pathParameters?.generationId;
  const body = parseBody(event);
  const prefix = body.bucketPrefix || event.queryStringParameters?.bucketPrefix || (generationId ? await findGenerationPrefix(generationId) : "");
  if (!prefix || !isSafePrefix(prefix, "generations/")) return badRequest("bucketPrefix o generationId invalido");
  if (body.downloadKey && !isSafeObjectKey(body.downloadKey)) return badRequest("downloadKey invalido");

  const metadataKey = `${prefix.replace(/\/$/, "")}/metadata.json`;
  const current = await readJsonObject(metadataKey);
  if (!current) return notFound("Generacion no encontrada");

  const updated = {
    ...current,
    records: Number(body.records ?? current.records ?? 0),
    downloadKey: body.downloadKey ?? current.downloadKey,
    status: body.status === "failed" ? "failed" : "ready",
    error: body.error ?? undefined,
    completedAt: new Date().toISOString(),
  };

  await putJson(metadataKey, updated);
  return ok({ generation: updated });
}

async function deleteGeneration(event) {
  const generationId = event.pathParameters?.generationId;
  const body = parseBody(event);
  const prefix = body.bucketPrefix || event.queryStringParameters?.bucketPrefix || (generationId ? await findGenerationPrefix(generationId) : "");

  if (!prefix || !isSafePrefix(prefix, "generations/")) return badRequest("bucketPrefix o generationId invalido");
  await deletePrefix(prefix.endsWith("/") ? prefix : `${prefix}/`);
  return ok({ message: "Generacion eliminada", generationId, bucketPrefix: prefix });
}

async function createDownloadUrl(event) {
  const key = event.queryStringParameters?.key;
  if (!isSafeObjectKey(key)) return badRequest("key invalido");

  const downloadUrl = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: 900 },
  );
  return ok({ downloadUrl, key, expiresIn: 900 });
}

async function deleteFile(event) {
  const body = parseBody(event);
  const key = body.key;
  if (!isSafeObjectKey(key)) return badRequest("key invalido");
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  return ok({ message: "Archivo eliminado", key });
}

async function listAllObjects(prefix) {
  const objects = [];
  let ContinuationToken;
  do {
    const result = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix, ContinuationToken }));
    objects.push(...(result.Contents ?? []));
    ContinuationToken = result.NextContinuationToken;
  } while (ContinuationToken);
  return objects;
}

async function deletePrefix(prefix) {
  const objects = await listAllObjects(prefix);
  for (let index = 0; index < objects.length; index += 1000) {
    const chunk = objects.slice(index, index + 1000);
    if (chunk.length === 0) continue;
    await s3.send(new DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: { Objects: chunk.map((item) => ({ Key: item.Key })) },
    }));
  }
}

async function findTemplatePrefix(templateId) {
  const metadata = await listAllObjects("templates/");
  const found = metadata.find((item) => item.Key?.includes(`/${templateId}/metadata.json`));
  return found?.Key?.replace(/\/metadata\.json$/, "") ?? "";
}

async function findGenerationPrefix(generationId) {
  const metadata = await listAllObjects("generations/");
  const found = metadata.find((item) => item.Key?.includes(`/${generationId}-`) && item.Key.endsWith("/metadata.json"));
  return found?.Key?.replace(/\/metadata\.json$/, "") ?? "";
}

async function putJson(key, value) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: JSON.stringify(value),
    ContentType: "application/json",
  }));
}

async function readJsonObject(key) {
  try {
    const result = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    const text = await result.Body.transformToString();
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function parseBody(event) {
  if (!event.body) return {};
  const raw = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
  return JSON.parse(raw);
}

function isSafeObjectKey(key) {
  return typeof key === "string"
    && !key.includes("..")
    && (key.startsWith("templates/") || key.startsWith("generations/"));
}

function isSafePrefix(prefix, allowedRoot) {
  return typeof prefix === "string"
    && prefix.startsWith(allowedRoot)
    && !prefix.includes("..")
    && prefix.split("/").length >= 3;
}

function cleanFileName(value) {
  return String(value ?? "")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
}

function slugify(value) {
  return String(value ?? "certificado")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "certificado";
}
