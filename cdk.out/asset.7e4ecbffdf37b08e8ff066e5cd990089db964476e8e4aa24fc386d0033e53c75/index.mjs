import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminListGroupsForUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const cognito = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const PROFILES_TABLE = process.env.PROFILES_TABLE;
const ROLE_GROUPS = ["voluntario", "escritor", "colaborador", "administradores"];

// Max concurrent Cognito calls to avoid TooManyRequestsException
const CONCURRENCY_LIMIT = 5;

function attributesToObject(attrs = []) {
  const out = {};
  for (const attr of attrs) {
    if (attr?.Name) out[attr.Name] = attr.Value ?? "";
  }
  return out;
}

/**
 * Retry a function with exponential backoff on throttling errors.
 */
async function withRetry(fn, maxAttempts = 5) {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      const isThrottle =
        err?.name === "TooManyRequestsException" ||
        err?.name === "ThrottlingException" ||
        err?.$metadata?.httpStatusCode === 429;

      attempt++;
      if (!isThrottle || attempt >= maxAttempts) throw err;

      const delay = Math.min(100 * 2 ** attempt + Math.random() * 100, 5000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

async function getUserGroups(userPoolId, username) {
  const groups = [];
  let nextToken = undefined;
  do {
    const response = await withRetry(() =>
      cognito.send(
        new AdminListGroupsForUserCommand({
          UserPoolId: userPoolId,
          Username: username,
          Limit: 60,
          NextToken: nextToken,
        })
      )
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

/**
 * Run async tasks with a bounded concurrency pool.
 */
async function runWithConcurrency(tasks, limit) {
  const results = [];
  const executing = new Set();

  for (const task of tasks) {
    const p = task().then((result) => {
      executing.delete(p);
      return result;
    });
    executing.add(p);
    results.push(p);

    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

async function getAllUsersFromUserPool(userPoolId) {
  const profiles = await getAllProfiles();

  // Collect all raw users first (pagination)
  const rawUsers = [];
  let paginationToken = undefined;
  do {
    const response = await withRetry(() =>
      cognito.send(
        new ListUsersCommand({
          UserPoolId: userPoolId,
          Limit: 60,
          PaginationToken: paginationToken,
        })
      )
    );
    for (const user of response.Users ?? []) {
      rawUsers.push(user);
    }
    paginationToken = response.PaginationToken;
  } while (paginationToken);

  // Fetch groups for all users concurrently (bounded by CONCURRENCY_LIMIT)
  const tasks = rawUsers.map((user) => async () => {
    const attributes = attributesToObject(user.Attributes);
    const username = user.Username ?? "";
    const groups = await getUserGroups(userPoolId, username);
    const profile = profiles[username] ?? {};

    return {
      username,
      email: attributes.email ?? "",
      name: attributes.name ?? profile.name ?? "",
      sub: attributes.sub ?? "",
      status: user.UserStatus ?? "",
      enabled: Boolean(user.Enabled),
      group: getPrimaryRoleGroup(groups),
      groups,
      attributes: {
        ...attributes,
        telefono:  attributes.phone_number ?? profile.telefono ?? "",
        municipio: attributes["custom:municipio"] ?? profile.municipio ?? "",
        status:    profile.status    ?? (user.Enabled ? "activo" : "suspendido"),
      },
    };
  });

  return runWithConcurrency(tasks, CONCURRENCY_LIMIT);
}

export const handler = async () => {
  try {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    if (!userPoolId) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Falta COGNITO_USER_POOL_ID" }),
      };
    }
    const users = await getAllUsersFromUserPool(userPoolId);
    return {
      statusCode: 200,
      body: JSON.stringify({ count: users.length, users }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error al obtener usuarios", error: error?.message }),
    };
  }
};
