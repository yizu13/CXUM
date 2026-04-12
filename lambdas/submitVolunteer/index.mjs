import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.SOLICITUDES_TABLE;

const cors = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Ruta pública — sin authorizer
export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body ?? "{}");
    const required = ["firstName", "lastName", "email", "phone", "motivation", "areas", "availability", "emergencyName", "emergencyPhone", "emergencyRelation"];
    const missing = required.filter((f) => !body[f]);
    if (missing.length > 0) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ message: `Faltan campos: ${missing.join(", ")}` }) };
    }

    const item = {
      id: randomUUID(),
      tipo: "registro",
      status: "pendiente",
      nombre: `${body.firstName} ${body.lastName}`,
      email: body.email,
      phone: body.phone,
      idDocument: body.idDocument ?? "",
      birthDate: body.birthDate ?? "",
      address: body.address ?? "",
      socialMedia: body.socialMedia ?? "",
      occupation: body.occupation ?? "",
      educationLevel: body.educationLevel ?? "",
      skills: body.skills ?? "",
      areas: body.areas,
      availability: body.availability,
      weeklyHours: body.weeklyHours ?? "",
      motivation: body.motivation,
      referral: body.referral ?? "",
      emergencyName: body.emergencyName,
      emergencyRelation: body.emergencyRelation,
      emergencyPhone: body.emergencyPhone,
      rolSolicitado: "voluntario",
      fecha: new Date().toISOString(),
    };

    await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
    return { statusCode: 201, headers: cors, body: JSON.stringify({ message: "Solicitud enviada correctamente", id: item.id }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ message: "Error al procesar la solicitud" }) };
  }
};
