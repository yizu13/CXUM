import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const cognito = new CognitoIdentityProviderClient({});
const USER_POOL_ID = process.env.USER_POOL_ID;

/**
 * GET /admin/users/{username}/temp-password
 * Obtiene o regenera la contraseña temporal de un usuario
 * Solo funciona si el usuario está en estado FORCE_CHANGE_PASSWORD
 */
export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const username = event.pathParameters?.username;
    if (!username) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Username es requerido" }),
      };
    }

    // Obtener información del usuario
    const getUserCmd = new AdminGetUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
    });

    const userResponse = await cognito.send(getUserCmd);

    // Verificar si el usuario está en estado FORCE_CHANGE_PASSWORD
    if (userResponse.UserStatus !== "FORCE_CHANGE_PASSWORD") {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          message: "El usuario ya cambió su contraseña temporal",
          userStatus: userResponse.UserStatus,
        }),
      };
    }

    // Generar nueva contraseña temporal
    const tempPassword = generateTempPassword();

    // Establecer la contraseña temporal
    const setPasswordCmd = new AdminSetUserPasswordCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
      Password: tempPassword,
      Permanent: false, // Temporal, debe cambiarla en el primer login
    });

    await cognito.send(setPasswordCmd);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Contraseña temporal regenerada",
        username,
        tempPassword,
        userStatus: userResponse.UserStatus,
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "Error al obtener contraseña temporal",
        error: error.message,
      }),
    };
  }
};

function generateTempPassword() {
  const length = 12;
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercase = "abcdefghijkmnpqrstuvwxyz";
  const numbers = "23456789";
  const special = "!@#$%&*";

  let password = "";
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  const allChars = uppercase + lowercase + numbers + special;
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
