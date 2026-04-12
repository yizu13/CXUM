import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ok, serverError } from "./permissions.mjs";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.ACTIVITY_TABLE;

export const handler = async () => {
  try {
    const result = await ddb.send(new QueryCommand({
      TableName: TABLE,
      IndexName: "byDate",
      KeyConditionExpression: "#pk = :pk",
      ExpressionAttributeNames: { "#pk": "pk" },
      ExpressionAttributeValues: { ":pk": "ACTIVITY" },
      ScanIndexForward: false, // más reciente primero
      Limit: 20,
    }));
    return ok({ events: result.Items ?? [] });
  } catch (err) {
    console.error(err);
    return serverError();
  }
};
