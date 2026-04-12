import { CognitoIdentityProviderClient, ListUsersCommand, AdminListGroupsForUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const cognito = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const PROFILES_TABLE = process.env.PROFILES_TABLE;
const ROLE_GROUPS = ["voluntario", "escritor", "colaborador", "administradores"];

function attributesToObject(attrs = []) {
  const out = {};
  for (const attr of attrs) {
    if (attr?.Name) out[attr.Name] = attr.Value ?? "";
  }
  return out;
}

async function getUserGroups(userPoolId, username) {
  const groups = [];
  let nextToken = undefined;
  do {
    const response = await cognito.send(new AdminListGroupsForUserCommand({ UserPoolId: userPoolId, Username: username, Limit: 60, NextToken: nextToken }));
    for (const group of response.Groups ?? []) {
      if (group.GroupName) groups.push(group.GroupName);
    }
    nextToken = response.NextToken;
  } while (nextToken);
  return groups;
}

function getPrimaryRoleGroup(groups) {
  return groups.find((g) => ROLE_GROUPS.includes(g)) ?? null;
}

async function getAllProfiles() {
  const profiles = {};
  try {
    const result = await ddb.send(new ScanCommand({ TableName: PROFILES_TABLE }));
    for (const item of result.Items ?? []) {
      profiles[item.username] = item;
    }
  } catch (_) {}
  return profiles;
}

async function getAllUsersFromUserPool(userPoolId) {
  const profiles = await getAllProfiles();
  const users = [];
  let paginationToken = undefined;
  do {
    const response = await cognito.send(new ListUsersCommand({ UserPoolId: userPoolId, Limit: 60, PaginationToken: paginationToken }));
    for (const user of response.Users ?? []) {
      const attributes = attributesToObject(user.Attributes);
      const username = user.Username ?? "";
      const groups = await getUserGroups(userPoolId, username);
      const profile = profiles[username] ?? {};
      users.push({
        username,
        email: attributes.email ?? "",
        name: attributes.name ?? "",
        sub: attributes.sub ?? "",
        status: user.UserStatus ?? "",
        userStatus: user.UserStatus ?? "", // Agregar explícitamente para el frontend
        enabled: Boolean(user.Enabled),
        group: getPrimaryRoleGroup(groups),
        groups,
        attributes: {
          ...attributes,
          telefono:  profile.telefono  ?? "",
          municipio: profile.municipio ?? "",
          status:    profile.status    ?? (user.Enabled ? "activo" : "suspendido"),
        },
      });
    }
    paginationToken = response.PaginationToken;
  } while (paginationToken);
  return users;
}

export const handler = async () => {
  try {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    if (!userPoolId) {
      return { statusCode: 500, body: JSON.stringify({ message: "Falta COGNITO_USER_POOL_ID" }) };
    }
    const users = await getAllUsersFromUserPool(userPoolId);
    return { statusCode: 200, body: JSON.stringify({ count: users.length, users }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ message: "Error al obtener usuarios", error: error?.message }) };
  }
};
