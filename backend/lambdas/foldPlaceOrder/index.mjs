// fold_placeOrder
// POST /placeOrder (Cognito-authenticated; cart is identified by the JWT's userId)
//
// Finalizes a cart into an order:
//   1. Reads all CART#<userId>/MENUITEM#<id> line items
//   2. Looks up each menu item's current price server-side (never trusts client totals)
//   3. Writes ORDER#<orderId>/METADATA (status, total) + ORDER#<orderId>/MENUITEM#<id> line items
//   4. Clears the cart (deletes the CART#<userId> line items)
//   5. Sends an order confirmation email via SES to the authenticated user's email
//
// Env vars required: TABLE_NAME, SENDER_EMAIL (an SES-verified sender identity)

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  GetCommand,
  PutCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const sesClient = new SESClient({});
const TABLE_NAME = process.env.TABLE_NAME;
const SENDER_EMAIL = process.env.SENDER_EMAIL;
// Matches the NYC_TAX_RATE constant used client-side in App.jsx/Cart.jsx —
// keep both in sync since this is the authoritative, server-computed total.
const NYC_TAX_RATE = 0.08875;

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

// Strips the "MENUITEM#" prefix DynamoDB uses internally so emails show a
// clean item id (e.g. "3" instead of "MENUITEM#3").
function stripPrefix(key = "") {
  return key.split("#")[1] ?? key;
}

function buildOrderEmailHtml({ orderId, subtotal, tax, total, orderLineItems }) {
  const rows = orderLineItems
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #2a2a26;color:#f3f3ef;font-family:Arial,Helvetica,sans-serif;font-size:15px;">
            ${item.name} &times; ${item.quantity}
          </td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid #2a2a26;color:#f3f3ef;font-family:Arial,Helvetica,sans-serif;font-size:15px;">
            $${item.price.toFixed(2)}
          </td>
        </tr>`,
    )
    .join("");

  return `
  <div style="margin:0;padding:0;background-color:#f4f3ec;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f3ec;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#0c0c0a;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 24px 32px;text-align:center;">
                <span style="font-family:Arial,Helvetica,sans-serif;font-size:28px;font-weight:800;letter-spacing:1px;color:#e8ff6b;">FOLD</span>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px 32px;">
                <p style="margin:0 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;color:#ffffff;">
                  Order confirmed!
                </p>
                <p style="margin:0 0 24px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#9a988f;">
                  Order ID: ${orderId}
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${rows}
                  <tr>
                    <td style="padding:14px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#9a988f;">
                      Subtotal
                    </td>
                    <td align="right" style="padding:14px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#9a988f;">
                      $${subtotal}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#9a988f;">
                      Tax (NYC, 8.875%)
                    </td>
                    <td align="right" style="padding:4px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#9a988f;">
                      $${tax}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0 0 0;border-top:1px solid #2a2a26;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:#e8ff6b;">
                      Total
                    </td>
                    <td align="right" style="padding:12px 0 0 0;border-top:1px solid #2a2a26;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:#e8ff6b;">
                      $${total}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#151511;text-align:center;">
                <span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b6a63;">
                  Thanks for ordering with FOLD. We'll see you soon!
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>`;
}

async function sendOrderConfirmationEmail({
  toEmail,
  orderId,
  subtotal,
  tax,
  total,
  orderLineItems,
}) {
  if (!toEmail || !SENDER_EMAIL) {
    console.warn(
      "Skipping order confirmation email: missing recipient email or SENDER_EMAIL env var",
    );
    return;
  }

  const itemLines = orderLineItems
    .map((item) => `  - ${item.name} x${item.quantity} — $${item.price.toFixed(2)}`)
    .join("\n");

  const bodyText = `Thanks for your order from FOLD!\n\nOrder ID: ${orderId}\n\nItems:\n${itemLines}\n\nSubtotal: $${subtotal}\nTax (NYC, 8.875%): $${tax}\nTotal: $${total}\n\nWe'll see you soon!`;
  const bodyHtml = buildOrderEmailHtml({ orderId, subtotal, tax, total, orderLineItems });

  try {
    await sesClient.send(
      new SendEmailCommand({
        Source: SENDER_EMAIL,
        Destination: { ToAddresses: [toEmail] },
        Message: {
          Subject: { Data: `FOLD Order Confirmation - ${orderId}` },
          Body: {
            Text: { Data: bodyText },
            Html: { Data: bodyHtml },
          },
        },
      }),
    );
  } catch (error) {
    // A failed email should never fail the order itself — the order already
    // succeeded in DynamoDB by the time this runs. Just log it.
    console.error("Failed to send order confirmation email:", error);
  }
}

export const handler = async (event) => {
  const claims = event.requestContext.authorizer.jwt.claims;
  const userId = claims.sub;
  const userEmail = claims.email;
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

    let subtotal = 0;
    const orderLineItems = lineItems.map((item, i) => {
      const details = menuLookups[i].Item || {};
      const price = Number(details.price) || 0;
      const quantity = Number(item.quantity) || 1;
      subtotal += price * quantity;
      return {
        menuItemId: item.SK,
        name: details.name || stripPrefix(item.SK),
        price,
        quantity,
      };
    });

    const tax = subtotal * NYC_TAX_RATE;
    const total = subtotal + tax;

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
            subtotal: subtotal.toFixed(2),
            tax: tax.toFixed(2),
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

    // 5. Send the confirmation email (best-effort; doesn't block the response)
    await sendOrderConfirmationEmail({
      toEmail: userEmail,
      orderId,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      orderLineItems,
    });

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        orderId,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
      }),
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
