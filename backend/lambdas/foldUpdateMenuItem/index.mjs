import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
  try {
    // Only admins can update menu items
    const claims = event.requestContext?.authorizer?.jwt?.claims || {};
    const groups = claims["cognito:groups"] || "";

    if (!groups.includes("admins")) {
      return {
        statusCode: 403,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Forbidden",
        }),
      };
    }

    const id = event.pathParameters?.id;

    if (!id) {
      return {
        statusCode: 400,
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
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Menu item updated successfully.",
      }),
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: error.message,
      }),
    };
  }
};
