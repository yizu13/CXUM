import type { DataRow, TextAst, TemplateToken } from "./types";

const VARIABLE_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function tokenizeTemplate(input: string): TemplateToken[] {
  const tokens: TemplateToken[] = [];
  let cursor = 0;

  while (cursor < input.length) {
    const start = input.indexOf("{{", cursor);
    if (start === -1) {
      tokens.push({ type: "text", value: input.slice(cursor) });
      break;
    }

    if (start > cursor) {
      tokens.push({ type: "text", value: input.slice(cursor, start) });
    }

    const end = input.indexOf("}}", start + 2);
    if (end === -1) {
      tokens.push({ type: "text", value: input.slice(start) });
      break;
    }

    const raw = input.slice(start, end + 2);
    const name = input.slice(start + 2, end).trim();
    tokens.push({ type: "variable", name, raw });
    cursor = end + 2;
  }

  return tokens.filter((token) => token.type === "variable" || token.value.length > 0);
}

export function parseTemplate(input: string): TextAst {
  const body = tokenizeTemplate(input);
  const variables = new Set<string>();
  const errors: string[] = [];

  body.forEach((token) => {
    if (token.type !== "variable") return;
    if (!token.name) {
      errors.push(`Variable vacia encontrada en ${token.raw}.`);
      return;
    }
    if (!VARIABLE_NAME.test(token.name)) {
      errors.push(`La variable ${token.raw} debe iniciar con letra o "_" y solo usar letras, numeros o "_".`);
      return;
    }
    variables.add(token.name);
  });

  return { type: "Template", body, variables: Array.from(variables), errors };
}

export function renderTemplate(ast: TextAst, data: DataRow): string {
  return ast.body
    .map((token) => {
      if (token.type === "text") return token.value;
      return data[token.name] ?? token.raw;
    })
    .join("");
}

export function extractVariablesFromTexts(texts: string[]): string[] {
  const all = new Set<string>();
  texts.forEach((text) => parseTemplate(text).variables.forEach((variable) => all.add(variable)));
  return Array.from(all).sort((a, b) => a.localeCompare(b));
}

export function buildSampleData(variables: string[], current: DataRow): DataRow {
  return variables.reduce<DataRow>((sample, variable) => {
    sample[variable] = current[variable] ?? sampleValueFor(variable);
    return sample;
  }, {});
}

function sampleValueFor(variable: string): string {
  const normalized = variable.toLowerCase();
  if (normalized.includes("nombre")) return "Ana Martinez";
  if (normalized.includes("curso")) return "Liderazgo Comunitario";
  if (normalized.includes("fecha")) return "15 de junio de 2026";
  if (normalized.includes("horas")) return "24";
  if (normalized.includes("cedula")) return "000-0000000-0";
  return `Ejemplo ${variable}`;
}
