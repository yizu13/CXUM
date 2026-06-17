export const ok = (data) => ({
  statusCode: 200,
  headers: cors(),
  body: JSON.stringify(data),
});

export const created = (data) => ({
  statusCode: 201,
  headers: cors(),
  body: JSON.stringify(data),
});

export const badRequest = (message = "Solicitud invalida") => ({
  statusCode: 400,
  headers: cors(),
  body: JSON.stringify({ message }),
});

export const forbidden = (message = "No tienes permiso para esta accion") => ({
  statusCode: 403,
  headers: cors(),
  body: JSON.stringify({ message }),
});

export const notFound = (message = "Recurso no encontrado") => ({
  statusCode: 404,
  headers: cors(),
  body: JSON.stringify({ message }),
});

export const serverError = (message = "Error interno del servidor") => ({
  statusCode: 500,
  headers: cors(),
  body: JSON.stringify({ message }),
});

export function getAuthenticatedUser(event) {
  const auth = event.requestContext?.authorizer?.lambda;
  if (!auth?.username && !auth?.sub) return null;
  return {
    username: auth.username ?? auth.sub,
    email: auth.email ?? "",
    role: auth.role ?? "",
    sub: auth.sub ?? "",
  };
}

function cors() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
  };
}
