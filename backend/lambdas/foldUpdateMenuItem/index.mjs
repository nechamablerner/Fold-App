import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getAdminStatusFromEvent } from "./adminAuth.mjs";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME;
const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

export const handler = async (event) => {
  try {
    // Only admins can update menu items
    const isAdmin = getAdminStatusFromEvent(event);

    if (!isAdmin) {
      const path =
        event.rawPath ||
        event.path ||
        event.requestContext?.http?.path ||
        "(unknown)";
      console.log("Admin authorization failed", {
        path,
        pathParameters: event.pathParameters,
        authorizerPresent: !!event?.requestContext?.authorizer,
        claims: event?.requestContext?.authorizer?.jwt?.claims || {},
        headers: event.headers,
      });
      return {
        statusCode: 403,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          message: "Forbidden",
        }),
      };
    }

    const id = event.pathParameters?.id;

    if (!id) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          message: "Menu item ID is required.",
        }),
      };
    }

    const body = JSON.parse(event.body);

    const { name, description, category, price, emoji, tag } = body;

    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `MENUITEM#${id}`,
          SK: "DETAILS",
        },
        UpdateExpression:
          "SET #name = :name, description = :description, category = :category, price = :price, emoji = :emoji, tag = :tag",
        ExpressionAttributeNames: {
          "#name": "name",
        },
        ExpressionAttributeValues: {
          ":name": name,
          ":description": description,
          ":category": category,
          ":price": price,
          ":emoji": emoji,
          ":tag": tag,
        },
        ReturnValues: "ALL_NEW",
      }),
    );

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        message: "Menu item updated successfully.",
      }),
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        message: error.message,
      }),
    };
  }
};
