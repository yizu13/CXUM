// ── Response helpers ──────────────────────────────────────────────────────────
export const ok = (data) => ({
  statusCode: 200,
  headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  body: JSON.stringify(data),
});

export const created = (data) => ({
  statusCode: 201,
  headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  body: JSON.stringify(data),
});

export const badRequest = (message = "Bad Request") => ({
  statusCode: 400,
  headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  body: JSON.stringify({ message }),
});

export const forbidden = (message = "Forbidden") => ({
  statusCode: 403,
  headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  body: JSON.stringify({ message }),
});

export const notFound = (message = "Not Found") => ({
  statusCode: 404,
  headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  body: JSON.stringify({ message }),
});

export const serverError = (message = "Internal Server Error") => ({
  statusCode: 500,
  headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  body: JSON.stringify({ message }),
});
