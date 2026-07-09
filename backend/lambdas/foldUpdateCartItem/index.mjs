import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

export const handler = async (event) => {
  try {
    const cartId = event.pathParameters?.cartId;
    const menuItemId = event.pathParameters?.menuItemId;

    const body = JSON.parse(event.body || "{}");
    const { quantity } = body;

    if (!cartId || !menuItemId || quantity === undefined) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          message:
            "Missing required fields: cartId (path), menuItemId (path), or quantity (body)",
        }),
      };
    }

    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: `CART#${cartId}`,
        SK: `MENUITEM#${menuItemId}`,
      },
      UpdateExpression: "SET quantity = :newQuantity",
      ExpressionAttributeValues: {
        ":newQuantity": Number(quantity),
      },
      ReturnValues: "UPDATED_NEW",
    };

    const command = new UpdateCommand(params);
    const result = await docClient.send(command);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        message: "Cart item updated successfully",
        updatedAttributes: result.Attributes,
      }),
    };
  } catch (error) {
    console.error("Error updating cart item:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
    };
  }
};
