import * as XLSX from "xlsx";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import type { CertificateTemplate, DataRow, ParsedDataSet } from "./types";
import { makeId } from "./storage";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

async function renderPdfPreview(file: File): Promise<{ previewUrl: string; width: number; height: number }> {
  const bytes = await readFileAsArrayBuffer(file);
  const pdfDocument = await pdfjsLib.getDocument({ data: bytes }).promise;
  const page = await pdfDocument.getPage(1);
  const viewport = page.getViewport({ scale: 2 });
  const target = window.document.createElement("canvas");
  target.width = viewport.width;
  target.height = viewport.height;
  const context = target.getContext("2d");
  if (!context) throw new Error("No se pudo preparar el lienzo del PDF.");
  await page.render({ canvas: target, canvasContext: context, viewport }).promise;
  return { previewUrl: target.toDataURL("image/png"), width: viewport.width, height: viewport.height };
}

async function getImageSize(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("No se pudo leer la imagen."));
    img.src = dataUrl;
  });
}

export async function createTemplateFromFile(file: File, name: string): Promise<CertificateTemplate> {
  const dataUrl = await readFileAsDataUrl(file);
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const preview = isPdf ? await renderPdfPreview(file) : { ...(await getImageSize(dataUrl)), previewUrl: dataUrl };

  return {
    id: makeId("tpl"),
    name: name.trim() || file.name.replace(/\.[^.]+$/, ""),
    sourceType: isPdf ? "pdf" : "image",
    fileName: file.name,
    dataUrl,
    previewUrl: preview.previewUrl,
    createdAt: new Date().toISOString(),
    width: preview.width,
    height: preview.height,
  };
}

export async function parseDataFile(file: File, requiredVariables: string[]): Promise<ParsedDataSet> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const parsed = extension === "json" ? await parseJsonData(file) : await parseSpreadsheetData(file);
  return validateDataSet({ ...parsed, fileName: file.name }, requiredVariables);
}

async function parseSpreadsheetData(file: File): Promise<Omit<ParsedDataSet, "errors">> {
  const buffer = await readFileAsArrayBuffer(file);
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<DataRow>(sheet, { defval: "", raw: false });
  const variables = Object.keys(rows[0] ?? {});
  return {
    fileName: file.name,
    variables,
    rows: rows.map((row) => normalizeRow(row, variables)),
  };
}

async function parseJsonData(file: File): Promise<Omit<ParsedDataSet, "errors">> {
  const text = await file.text();
  const json = JSON.parse(text) as Record<string, unknown> | DataRow[];

  if (Array.isArray(json)) {
    const variables = Object.keys(json[0] ?? {});
    return { fileName: file.name, variables, rows: json.map((row) => normalizeRow(row, variables)) };
  }

  const variables = Object.keys(json);
  const lengths = variables.map((key) => (Array.isArray(json[key]) ? json[key].length : -1));
  const rowCount = Math.max(0, ...lengths);
  const rows = Array.from({ length: rowCount }, (_, index) =>
    variables.reduce<DataRow>((row, key) => {
      const values = json[key];
      row[key] = Array.isArray(values) ? stringifyCell(values[index]) : "";
      return row;
    }, {}),
  );
  return { fileName: file.name, variables, rows };
}

function validateDataSet(dataSet: Omit<ParsedDataSet, "errors">, requiredVariables: string[]): ParsedDataSet {
  const errors: string[] = [];
  const missing = requiredVariables.filter((variable) => !dataSet.variables.includes(variable));
  if (missing.length) errors.push(`Faltan columnas o claves: ${missing.join(", ")}.`);
  if (dataSet.rows.length === 0) errors.push("El archivo no contiene registros.");

  dataSet.variables.forEach((variable) => {
    const emptyRows = dataSet.rows.filter((row) => row[variable] === undefined).length;
    if (emptyRows > 0) errors.push(`La columna ${variable} tiene ${emptyRows} filas sin valor.`);
  });

  return { ...dataSet, errors };
}

function normalizeRow(source: Record<string, unknown>, variables: string[]): DataRow {
  return variables.reduce<DataRow>((row, variable) => {
    row[variable] = stringifyCell(source[variable]);
    return row;
  }, {});
}

function stringifyCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toLocaleDateString("es-DO");
  return String(value);
}
