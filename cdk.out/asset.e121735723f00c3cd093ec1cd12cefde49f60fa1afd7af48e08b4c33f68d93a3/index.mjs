import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminListGroupsForUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
});

const ROLE_GROUPS = ["voluntario", "escritor", "colaborador", "administrador"];

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
    const response = await cognito.send(
      new AdminListGroupsForUserCommand({
        UserPoolId: userPoolId,
        Username: username,
        Limit: 60,
        NextToken: nextToken,
      })
    );
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

async function getAllUsersFromUserPool(userPoolId) {
  const users = [];
  let paginationToken = undefined;
  do {
    const response = await cognito.send(
      new ListUsersCommand({ UserPoolId: userPoolId, Limit: 60, PaginationToken: paginationToken })
    );
    for (const user of response.Users ?? []) {
      const attributes = attributesToObject(user.Attributes);
      const username = user.Username ?? "";
      const groups = await getUserGroups(userPoolId, username);
      users.push({
        username,
        email: attributes.email ?? "",
        name: attributes.name ?? "",
        sub: attributes.sub ?? "",
        status: user.UserStatus ?? "",
        enabled: Boolean(user.Enabled),
        group: getPrimaryRoleGroup(groups),
        groups,
        attributes,
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
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Falta la variable COGNITO_USER_POOL_ID" }),
      };
    }
    const users = await getAllUsersFromUserPool(userPoolId);
    return {
      statusCode: 200,
      body: JSON.stringify({ count: users.length, users }),
    };
  } catch (error) {
    console.error("Error listing users with groups:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error al obtener los usuarios con sus grupos",
        error: error?.message ?? "Unknown error",
      }),
    };
  }
};
