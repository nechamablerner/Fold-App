import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
  try {
    // Only admins can create menu items
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

    const body = JSON.parse(event.body);

    const { name, description, category, price, emoji, tag } = body;

    // Validate required fields
    if (!name || !description || !category || !price) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Missing required fields.",
        }),
      };
    }

    // Get existing menu items to determine the next ID
    const scanResult = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "begins_with(PK, :prefix)",
        ExpressionAttributeValues: {
          ":prefix": "MENUITEM#",
        },
      }),
    );

    const items = scanResult.Items || [];

    let nextId = 1;

    if (items.length > 0) {
      const highestId = Math.max(
        ...items.map((item) => Number(item.PK.replace("MENUITEM#", ""))),
      );

      nextId = highestId + 1;
    }

    const newItem = {
      PK: `MENUITEM#${nextId}`,
      SK: "DETAILS",
      name,
      description,
      category,
      price,
      emoji: emoji || "",
      tag: tag || "",
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: newItem,
      }),
    );

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(newItem),
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
