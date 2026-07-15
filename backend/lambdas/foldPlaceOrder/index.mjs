// fold_placeOrder
// POST /placeOrder (Cognito-authenticated; cart is identified by the JWT's userId)
//
// Finalizes a cart into an order:
//   1. Reads all CART#<userId>/MENUITEM#<id> line items
//   2. Looks up each menu item's current price server-side (never trusts client totals)
//   3. Writes ORDER#<orderId>/METADATA (status, total) + ORDER#<orderId>/MENUITEM#<id> line items
//   4. Clears the cart (deletes the CART#<userId> line items)
//
// Env var required: TABLE_NAME

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  GetCommand,
  PutCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

export const handler = async (event) => {
  const claims = event.requestContext.authorizer.jwt.claims;
  const userId = claims.sub;
  try {
    // 1. Read the cart's line items
    const cartResult = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: { ":pk": `CART#${userId}` },
      }),
    );

    const lineItems = (cartResult.Items || []).filter((row) =>
      row.SK?.startsWith("MENUITEM#"),
    );

    if (lineItems.length === 0) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "Cart is empty" }),
      };
    }

    // 2. Look up the current price of each menu item (item.SK is e.g. "MENUITEM#3",
    // which doubles as that menu item's own PK)
    const menuLookups = await Promise.all(
      lineItems.map((item) =>
        docClient.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: { PK: item.SK, SK: "DETAILS" },
          }),
        ),
      ),
    );

    let total = 0;
    const orderLineItems = lineItems.map((item, i) => {
      const details = menuLookups[i].Item || {};
      const price = Number(details.price) || 0;
      const quantity = Number(item.quantity) || 1;
      total += price * quantity;
      return { menuItemId: item.SK, price, quantity };
    });

    // 3. Write the order (metadata + line items)
    const orderId = randomUUID();

    await Promise.all([
      docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `ORDER#${orderId}`,
            SK: "METADATA",
            status: "Placed",
            total: total.toFixed(2),
          },
        }),
      ),
      ...orderLineItems.map((item) =>
        docClient.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: {
              PK: `ORDER#${orderId}`,
              SK: item.menuItemId,
              price: item.price,
              quantity: item.quantity,
            },
          }),
        ),
      ),
    ]);

    // 4. Clear the cart now that it's been turned into an order
    await Promise.all(
      lineItems.map((item) =>
        docClient.send(
          new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { PK: `CART#${userId}`, SK: item.SK },
          }),
        ),
      ),
    );

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ orderId, total: total.toFixed(2) }),
    };
  } catch (error) {
    console.error("ERROR:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
