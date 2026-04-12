import { CognitoIdentityProviderClient, AdminAddUserToGroupCommand, AdminRemoveUserFromGroupCommand, AdminUpdateUserAttributesCommand, AdminDisableUserCommand, AdminEnableUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { hasPermission, ok, forbidden, badRequest, serverError } from "./permissions.mjs";

const cognito = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const ROLE_GROUPS = ["voluntario", "escritor", "colaborador", "administradores"];

export const handler = async (event) => {
  try {
    if (!hasPermission(event, "canManageUsers")) return forbidden();

    const body = JSON.parse(event.body ?? "{}");
    const { username, role, status } = body;
    if (!username) return badRequest("Falta el username");

    // Cambiar rol: remover grupos anteriores y agregar el nuevo
    if (role) {
      if (!ROLE_GROUPS.includes(role)) return badRequest("Rol inválido");

      for (const group of ROLE_GROUPS) {
        try {
          await cognito.send(new AdminRemoveUserFromGroupCommand({ UserPoolId: USER_POOL_ID, Username: username, GroupName: group }));
        } catch (_) { /* ignorar si no estaba en el grupo */ }
      }
      await cognito.send(new AdminAddUserToGroupCommand({ UserPoolId: USER_POOL_ID, Username: username, GroupName: role }));
    }

    // Cambiar status
    if (status) {
      if (!["activo", "suspendido"].includes(status)) return badRequest("Status inválido");

      await cognito.send(new AdminUpdateUserAttributesCommand({
        UserPoolId: USER_POOL_ID,
        Username: username,
        UserAttributes: [{ Name: "custom:status", Value: status }],
      }));

      if (status === "suspendido") {
        await cognito.send(new AdminDisableUserCommand({ UserPoolId: USER_POOL_ID, Username: username }));
      } else {
        await cognito.send(new AdminEnableUserCommand({ UserPoolId: USER_POOL_ID, Username: username }));
      }
    }

    return ok({ message: "Usuario actualizado", username, role, status });
  } catch (err) {
    console.error(err);
    return serverError();
  }
};
