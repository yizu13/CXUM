import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.CONTACTOS_TABLE;

const cors = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Ruta pública — sin authorizer
export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body ?? "{}");
    const required = ["firstName", "lastName", "email", "subject", "message"];
    const missing = required.filter((f) => !body[f]);
    if (missing.length > 0) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ message: `Faltan campos: ${missing.join(", ")}` }) };
    }

    const item = {
      id: randomUUID(),
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      subject: body.subject,
      message: body.message,
      status: "nuevo",
      createdAt: new Date().toISOString(),
    };

    await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
    return { statusCode: 201, headers: cors, body: JSON.stringify({ message: "Mensaje enviado correctamente" }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ message: "Error al enviar el mensaje" }) };
  }
};
