import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminAddUserToGroupCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { hasPermission, ok, forbidden, badRequest, serverError } from "./permissions.mjs";
import { logActivity } from "./logActivity.mjs";

const cognito = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

function generateTempPassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const special = "!@#$";
  let pwd = "";
  for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  pwd += special[Math.floor(Math.random() * special.length)];
  pwd += Math.floor(Math.random() * 9) + 1;
  // Mezclar
  return pwd.split("").sort(() => Math.random() - 0.5).join("");
}

export const handler = async (event) => {
  try {
    if (!hasPermission(event, "canManageUsers")) return forbidden();

    const body = JSON.parse(event.body ?? "{}");
    const { email, name } = body;
    if (!email || !name) return badRequest("Faltan email y name");

    const tempPassword = generateTempPassword();

    // Crear usuario en Cognito — Cognito envía el email automáticamente
    await cognito.send(new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      TemporaryPassword: tempPassword,
      UserAttributes: [
        { Name: "email",          Value: email },
        { Name: "name",           Value: name  },
        { Name: "email_verified", Value: "true" },
      ],
      DesiredDeliveryMediums: ["EMAIL"],
      MessageAction: "SUPPRESS", // No enviamos el email de Cognito, lo manejamos nosotros
    }));

    await cognito.send(new AdminAddUserToGroupCommand({ UserPoolId: USER_POOL_ID, Username: email, GroupName: "voluntario" }));
    await logActivity({ type: "usuario", icon: "solar:user-plus-bold-duotone", color: "#6366f1", text: `Usuario incluido en sistema: ${name} (${email})`, actor: event.requestContext?.authorizer?.lambda?.username ?? "" });
    return ok({ message: "Usuario creado correctamente", email, tempPassword });
  } catch (err) {
    console.error(err);
    if (err.name === "UsernameExistsException") {
      return { statusCode: 409, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ message: "Ya existe un usuario con ese correo" }) };
    }
    return serverError();
  }
};
