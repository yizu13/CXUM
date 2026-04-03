import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";

// ─── Pool config ──────────────────────────────────────────────────────────────
// Variables de entorno requeridas en .env:
//   VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
//   VITE_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
const poolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID as string,
  ClientId:   import.meta.env.VITE_COGNITO_CLIENT_ID   as string,
};

export const userPool = new CognitoUserPool(poolData);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Devuelve el usuario Cognito actualmente autenticado, o null */
export function getCurrentUser(): CognitoUser | null {
  return userPool.getCurrentUser();
}

/**
 * Registro: crea el usuario en Cognito.
 * Cognito enviará automáticamente el OTP de confirmación al correo.
 */
export function signUp(name: string, email: string, password: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const attrs = [
      new CognitoUserAttribute({ Name: "email", Value: email }),
      new CognitoUserAttribute({ Name: "name",  Value: name  }),
    ];
    userPool.signUp(email, password, attrs, [], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/** Confirma el OTP enviado al correo tras el sign-up */
export function confirmSignUp(email: string, code: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    user.confirmRegistration(code, true, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/** Reenvía el código OTP de confirmación */
export function resendConfirmationCode(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    user.resendConfirmationCode((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/** Login con email + contraseña */
export function signIn(email: string, password: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });
    user.authenticateUser(authDetails, {
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    });
  });
}

/** Cierra sesión local */
export function signOut(): void {
  userPool.getCurrentUser()?.signOut();
}

/** Inicia recuperación de contraseña — envía código al correo */
export function forgotPassword(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    user.forgotPassword({
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    });
  });
}

/** Confirma la nueva contraseña con el código recibido */
export function confirmForgotPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    user.confirmPassword(code, newPassword, {
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    });
  });
}
