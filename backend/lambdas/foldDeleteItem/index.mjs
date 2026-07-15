import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

export const handler = async (event) => {
  const claims = event.requestContext.authorizer.jwt.claims;
  const userId = claims.sub;

  try {
    const body = JSON.parse(event.body || "{}");
    const { menuItemId } = body;

    if (!menuItemId) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "Missing required field: menuItemId (body)" }),
      };
    }

    await docClient.send(
      new DeleteCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: `CART#${userId}`,
          SK: `MENUITEM#${menuItemId}`,
        },
      }),
    );

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        message: "Item removed from cart",
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: error.message,
      }),
    };
  }
};
