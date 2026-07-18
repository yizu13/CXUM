export const ROLE_PERMISSIONS = {
  voluntario:      { canManageUsers: false, canManageNews: false, canManageCenters: false, canViewCenters: true  },
  escritor:        { canManageUsers: false, canManageNews: true,  canManageCenters: false, canViewCenters: true  },
  colaborador:     { canManageUsers: false, canManageNews: true,  canManageCenters: true,  canViewCenters: true  },
  administradores: { canManageUsers: true,  canManageNews: true,  canManageCenters: true,  canViewCenters: true  },
};

export function getRole(event) {
  return event.requestContext?.authorizer?.lambda?.role ?? "";
}

export function hasPermission(event, permission) {
  const role = getRole(event);
  return ROLE_PERMISSIONS[role]?.[permission] === true;
}

export function forbidden(message = "No tienes permiso para esta acción") {
  return { statusCode: 403, headers: cors(), body: JSON.stringify({ message }) };
}

export function ok(data) {
  return { statusCode: 200, headers: cors(), body: JSON.stringify(data) };
}

export function created(data) {
  return { statusCode: 201, headers: cors(), body: JSON.stringify(data) };
}

export function badRequest(message) {
  return { statusCode: 400, headers: cors(), body: JSON.stringify({ message }) };
}

export function serverError(message = "Error interno del servidor") {
  return { statusCode: 500, headers: cors(), body: JSON.stringify({ message }) };
}

export function notFound(message = "Recurso no encontrado") {
  return { statusCode: 404, headers: cors(), body: JSON.stringify({ message }) };
}

function cors() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
  };
}
