import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { hasPermission, ok, forbidden, serverError } from "../_shared/permissions.mjs";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.SOLICITUDES_TABLE;

export const handler = async (event) => {
  try {
    if (!hasPermission(event, "canManageUsers")) return forbidden();

    const result = await ddb.send(new ScanCommand({ TableName: TABLE }));
    const items = (result.Items ?? []).sort((a, b) => (b.fecha ?? "").localeCompare(a.fecha ?? ""));
    return ok({ count: items.length, solicitudes: items });
  } catch (err) {
    console.error(err);
    return serverError();
  }
};
