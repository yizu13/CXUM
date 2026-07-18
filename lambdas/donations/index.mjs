import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import {
  badRequest,
  canManageDonations,
  created,
  forbidden,
  getActor,
  notFound,
  ok,
  serverError,
} from "./permissions.mjs";
import { logActivity } from "./logActivity.mjs";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const FORMS_TABLE = process.env.DONATION_FORMS_TABLE;
const RESPONSES_TABLE = process.env.DONATION_RESPONSES_TABLE;

const FIELD_TYPES = new Set(["text", "number", "select", "textarea", "date", "email", "phone", "boolean"]);
const FORM_STATUSES = new Set(["draft", "published", "hidden"]);
const FORM_MODES = new Set(["flat", "guided"]);
const CONDITION_OPERATORS = new Set(["equals", "notEquals", "contains", "greaterThan", "lessThan"]);
const SELECT_DISPLAYS = new Set(["autocomplete", "cards"]);

function toSlug(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseBody(event) {
  try {
    return JSON.parse(event.body ?? "{}");
  } catch {
    return null;
  }
}

function finiteNumber(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function normalizeField(field, index) {
  const id = String(field.id || `field_${index}_${Date.now()}`);
  const type = FIELD_TYPES.has(field.type) ? field.type : "text";
  const normalized = {
    id,
    label: String(field.label || "Campo sin titulo").slice(0, 120),
    type,
    required: Boolean(field.required),
    priority: finiteNumber(field.priority) ?? index + 1,
    section: String(field.section || "General").slice(0, 80),
  };

  if (field.placeholder) normalized.placeholder = String(field.placeholder).slice(0, 160);
  if (field.helper) normalized.helper = String(field.helper).slice(0, 240);
  const maxLength = finiteNumber(field.maxLength);
  const min = finiteNumber(field.min);
  const max = finiteNumber(field.max);
  if (maxLength !== undefined) normalized.maxLength = Math.max(1, Math.floor(maxLength));
  if (min !== undefined) normalized.min = min;
  if (max !== undefined) normalized.max = max;
  if (Array.isArray(field.options)) normalized.options = field.options.map((item) => String(item).trim()).filter(Boolean).slice(0, 50);
  if (type === "select") {
    normalized.selectDisplay = SELECT_DISPLAYS.has(field.selectDisplay) ? field.selectDisplay : "autocomplete";
    if (field.optionSubmenus && typeof field.optionSubmenus === "object") {
      const options = new Set(normalized.options ?? []);
      const mappings = Object.entries(field.optionSubmenus)
        .filter(([option, section]) => options.has(option) && String(section).trim())
        .slice(0, 50)
        .map(([option, section]) => [option, String(section).trim().slice(0, 80)]);
      if (mappings.length > 0) normalized.optionSubmenus = Object.fromEntries(mappings);
    }
  }
  if (field.condition?.fieldId && CONDITION_OPERATORS.has(field.condition.operator)) {
    normalized.condition = {
      fieldId: String(field.condition.fieldId),
      operator: field.condition.operator,
      value: String(field.condition.value ?? ""),
    };
  }

  return normalized;
}

function normalizeForm(body, existing = undefined, actor = "") {
  if (!body?.title) return { error: "El titulo es obligatorio" };
  const fields = Array.isArray(body.fields) ? body.fields.map(normalizeField) : [];
  if (fields.length === 0) return { error: "Debe incluir al menos un campo" };
  const fieldIds = new Set(fields.map((field) => field.id));
  const sections = new Set(fields.map((field) => field.section));
  if (fieldIds.size !== fields.length) return { error: "Los identificadores de campo deben ser unicos" };
  for (const field of fields) {
    if (field.type === "select" && (!field.options || field.options.length === 0)) {
      return { error: `${field.label} necesita al menos una opcion` };
    }
    if (field.min !== undefined && field.max !== undefined && field.min > field.max) {
      return { error: `El minimo de ${field.label} no puede superar el maximo` };
    }
    if (field.condition && (!fieldIds.has(field.condition.fieldId) || field.condition.fieldId === field.id)) {
      return { error: `La condicion de ${field.label} referencia un campo invalido` };
    }
    for (const section of Object.values(field.optionSubmenus ?? {})) {
      if (!sections.has(section)) return { error: `El submenu ${section} configurado en ${field.label} no existe` };
      if (section === field.section) return { error: `${field.label} no puede navegar a su propio submenu` };
    }
  }

  for (const [property, label] of [
    ["primaryFieldId", "campo prioritario"],
    ["respondentFieldId", "campo identificador"],
    ["locationFieldId", "campo de ubicacion"],
  ]) {
    if (body[property] && !fieldIds.has(body[property])) return { error: `El ${label} no existe` };
  }

  const now = new Date().toISOString();
  const slug = toSlug(body.slug || body.title);
  if (!slug) return { error: "El slug publico no es valido" };

  const item = {
    ...(existing ?? {}),
    id: existing?.id ?? body.id ?? randomUUID(),
    title: String(body.title).slice(0, 140),
    slug,
    description: String(body.description ?? "").slice(0, 800),
    status: FORM_STATUSES.has(body.status) ? body.status : "draft",
    mode: FORM_MODES.has(body.mode) ? body.mode : "guided",
    primaryFieldId: body.primaryFieldId || undefined,
    respondentFieldId: body.respondentFieldId || body.primaryFieldId || undefined,
    locationFieldId: body.locationFieldId || undefined,
    thankYouMessage: String(body.thankYouMessage ?? "Gracias por apoyar esta iniciativa.").slice(0, 500),
    fields,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    createdBy: existing?.createdBy ?? actor,
    updatedBy: actor,
  };

  return { item };
}

function passesCondition(field, values) {
  if (!field.condition) return true;
  const actual = values[field.condition.fieldId];
  const expected = String(field.condition.value ?? "").toLowerCase();
  const actualText = String(actual ?? "").toLowerCase();
  const actualNumber = Number(actual);
  const expectedNumber = Number(field.condition.value);

  if (field.condition.operator === "equals") return actualText === expected;
  if (field.condition.operator === "notEquals") return actualText !== expected;
  if (field.condition.operator === "contains") return actualText.includes(expected);
  if (field.condition.operator === "greaterThan") return Number.isFinite(actualNumber) && actualNumber > expectedNumber;
  if (field.condition.operator === "lessThan") return Number.isFinite(actualNumber) && actualNumber < expectedNumber;
  return true;
}

function validateResponse(form, rawValues) {
  const values = {};
  const errors = [];
  const submenuControllers = form.fields.filter(
    (field) => field.type === "select" && field.optionSubmenus && Object.keys(field.optionSubmenus).length > 0,
  );
  const visibleFields = [...form.fields]
    .sort((a, b) => a.priority - b.priority)
    .filter((field) => passesCondition(field, rawValues ?? {}))
    .filter((field) => {
      const controllers = submenuControllers.filter((controller) =>
        Object.values(controller.optionSubmenus ?? {}).includes(field.section),
      );
      if (controllers.length === 0) return true;
      return controllers.some((controller) =>
        controller.optionSubmenus?.[String(rawValues?.[controller.id] ?? "")] === field.section,
      );
    });

  for (const field of visibleFields) {
    const raw = rawValues?.[field.id];
    const empty = raw === undefined || raw === null || raw === "";
    if (field.required && empty) {
      errors.push(`${field.label} es obligatorio`);
      continue;
    }
    if (empty) continue;

    if (field.type === "number") {
      const numberValue = Number(raw);
      if (!Number.isFinite(numberValue)) errors.push(`${field.label} debe ser numerico`);
      if (field.min !== undefined && numberValue < field.min) errors.push(`${field.label} debe ser mayor o igual a ${field.min}`);
      if (field.max !== undefined && numberValue > field.max) errors.push(`${field.label} debe ser menor o igual a ${field.max}`);
      values[field.id] = numberValue;
      continue;
    }

    if (field.type === "boolean") {
      values[field.id] = Boolean(raw);
      continue;
    }

    const value = String(raw);
    if (field.maxLength && value.length > field.maxLength) errors.push(`${field.label} supera ${field.maxLength} caracteres`);
    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.push(`${field.label} no es un correo valido`);
    if (field.type === "phone" && value.replace(/\D/g, "").length < 7) errors.push(`${field.label} no es un telefono valido`);
    if (field.type === "date" && Number.isNaN(new Date(value).getTime())) errors.push(`${field.label} no es una fecha valida`);
    if (field.type === "select" && Array.isArray(field.options) && field.options.length > 0 && !field.options.includes(value)) {
      errors.push(`${field.label} no tiene una opcion valida`);
    }
    values[field.id] = value;
  }

  return { values, errors };
}

async function getFormBySlug(slug) {
  const result = await ddb.send(new QueryCommand({
    TableName: FORMS_TABLE,
    IndexName: "slug-index",
    KeyConditionExpression: "#slug = :slug",
    ExpressionAttributeNames: { "#slug": "slug" },
    ExpressionAttributeValues: { ":slug": slug },
    Limit: 1,
  }));
  return result.Items?.[0];
}

async function scanAll(params) {
  const items = [];
  let ExclusiveStartKey;
  do {
    const result = await ddb.send(new ScanCommand({ ...params, ExclusiveStartKey }));
    items.push(...(result.Items ?? []));
    ExclusiveStartKey = result.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return items;
}

async function queryAll(params) {
  const items = [];
  let ExclusiveStartKey;
  do {
    const result = await ddb.send(new QueryCommand({ ...params, ExclusiveStartKey }));
    items.push(...(result.Items ?? []));
    ExclusiveStartKey = result.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return items;
}

async function slugIsAvailable(slug, currentId = "") {
  const form = await getFormBySlug(slug);
  return !form || form.id === currentId;
}

function detectDevice(userAgent = "") {
  const normalized = String(userAgent).toLowerCase();
  if (!normalized) return "unknown";
  if (/ipad|tablet|kindle|silk/.test(normalized)) return "tablet";
  if (/mobile|iphone|ipod|android/.test(normalized)) return "mobile";
  return "desktop";
}

async function listForms({ admin }) {
  let forms = await scanAll({ TableName: FORMS_TABLE });
  if (!admin) forms = forms.filter((form) => form.status === "published");
  forms.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
  return ok({ count: forms.length, forms });
}

async function listResponses(event) {
  if (!canManageDonations(event)) return forbidden();
  const formId = event.queryStringParameters?.formId;
  let items;

  if (formId) {
    items = await queryAll({
      TableName: RESPONSES_TABLE,
      IndexName: "formId-index",
      KeyConditionExpression: "formId = :formId",
      ExpressionAttributeValues: { ":formId": formId },
    });
  } else {
    items = await scanAll({ TableName: RESPONSES_TABLE });
  }

  items.sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? ""));
  return ok({ count: items.length, responses: items });
}

export const handler = async (event) => {
  try {
    const method = event.requestContext?.http?.method ?? event.httpMethod;
    const routePath = event.requestContext?.http?.path ?? event.path ?? "";
    const params = event.pathParameters ?? {};
    const actor = getActor(event);

    if (method === "GET" && routePath.startsWith("/admin/donation-responses")) {
      return listResponses(event);
    }

    if (method === "GET" && routePath.startsWith("/admin/donation-forms")) {
      if (!canManageDonations(event)) return forbidden();
      return listForms({ admin: true });
    }

    if (method === "POST" && routePath === "/admin/donation-forms") {
      if (!canManageDonations(event)) return forbidden();
      const body = parseBody(event);
      if (!body) return badRequest("JSON invalido");
      const normalized = normalizeForm(body, undefined, actor);
      if (normalized.error) return badRequest(normalized.error);
      if (!(await slugIsAvailable(normalized.item.slug))) return badRequest("El slug publico ya esta en uso");
      await ddb.send(new PutCommand({ TableName: FORMS_TABLE, Item: normalized.item }));
      await logActivity({ type: "donacion", icon: "solar:file-text-bold-duotone", color: "#ef4444", text: `Formulario creado: ${normalized.item.title}`, actor });
      return created(normalized.item);
    }

    if (["PUT", "DELETE"].includes(method) && routePath.startsWith("/admin/donation-forms/")) {
      if (!canManageDonations(event)) return forbidden();
      const id = params.id;
      if (!id) return badRequest("Falta el id");

      const existing = await ddb.send(new GetCommand({ TableName: FORMS_TABLE, Key: { id } }));
      if (!existing.Item) return notFound("Formulario no encontrado");

      if (method === "DELETE") {
        const linkedResponses = await ddb.send(new QueryCommand({
          TableName: RESPONSES_TABLE,
          IndexName: "formId-index",
          KeyConditionExpression: "formId = :formId",
          ExpressionAttributeValues: { ":formId": id },
          Limit: 1,
          ProjectionExpression: "id",
        }));
        if ((linkedResponses.Items ?? []).length > 0) {
          return badRequest("El formulario tiene respuestas. Cambialo a oculto para conservar su historial");
        }
        await ddb.send(new DeleteCommand({ TableName: FORMS_TABLE, Key: { id } }));
        await logActivity({ type: "donacion", icon: "solar:trash-bin-trash-bold-duotone", color: "#ef4444", text: `Formulario eliminado: ${existing.Item.title}`, actor });
        return ok({ message: "Formulario eliminado", id });
      }

      const body = parseBody(event);
      if (!body) return badRequest("JSON invalido");
      const normalized = normalizeForm(body, existing.Item, actor);
      if (normalized.error) return badRequest(normalized.error);
      if (!(await slugIsAvailable(normalized.item.slug, id))) return badRequest("El slug publico ya esta en uso");
      await ddb.send(new PutCommand({ TableName: FORMS_TABLE, Item: normalized.item }));
      await logActivity({ type: "donacion", icon: "solar:file-text-bold-duotone", color: "#f59e0b", text: `Formulario actualizado: ${normalized.item.title}`, actor });
      return ok(normalized.item);
    }

    if (method === "GET" && params.slug) {
      const form = await getFormBySlug(params.slug);
      if (!form || form.status !== "published") return notFound("Formulario no encontrado");
      return ok(form);
    }

    if (method === "GET") {
      return listForms({ admin: false });
    }

    if (method === "POST" && routePath.includes("/responses")) {
      const formId = params.formId;
      if (!formId) return badRequest("Falta el formulario");
      const formResult = await ddb.send(new GetCommand({ TableName: FORMS_TABLE, Key: { id: formId } }));
      const form = formResult.Item;
      if (!form || form.status !== "published") return notFound("Formulario no encontrado");

      const body = parseBody(event);
      if (!body) return badRequest("JSON invalido");
      const validation = validateResponse(form, body.values ?? {});
      if (validation.errors.length > 0) return badRequest(validation.errors.join(". "));

      const respondentFieldId = form.respondentFieldId || form.primaryFieldId;
      const respondentLabel = respondentFieldId
        ? String(validation.values[respondentFieldId] ?? "No especificado")
        : "No especificado";
      const locationLabel = form.locationFieldId
        ? String(validation.values[form.locationFieldId] ?? "No especificado")
        : "No especificado";
      const userAgent = body.userAgent ? String(body.userAgent).slice(0, 240) : "";

      const response = {
        id: randomUUID(),
        formId,
        submittedAt: new Date().toISOString(),
        source: ["qr", "link", "direct"].includes(body.source) ? body.source : "direct",
        respondentLabel: respondentLabel.slice(0, 160),
        locationLabel: locationLabel.slice(0, 120),
        device: detectDevice(userAgent),
        values: validation.values,
        userAgent,
      };

      await ddb.send(new PutCommand({ TableName: RESPONSES_TABLE, Item: response }));
      return created(response);
    }

    return badRequest("Metodo no soportado");
  } catch (err) {
    console.error(err);
    return serverError();
  }
};
