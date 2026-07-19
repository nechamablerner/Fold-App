import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { handler } from "./index.mjs";

const ddbMock = mockClient(DynamoDBDocumentClient);

beforeEach(() => {
  ddbMock.reset();
  process.env.TABLE_NAME = "fold-test-table";
});

function makeEvent({ userId = "user-123", body = JSON.stringify({ menuItemId: "3" }) } = {}) {
  const event = {
    requestContext: {
      authorizer: {
        jwt: {
          claims: { sub: userId },
        },
      },
    },
  };
  if (body !== null) event.body = body;
  return event;
}

describe("foldDeleteItem handler", () => {
  test("deletes the cart item and returns 200", async () => {
    ddbMock.on(DeleteCommand).resolves({});

    const event = makeEvent({
      userId: "user-123",
      body: JSON.stringify({ menuItemId: "3" }),
    });
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ message: "Item removed from cart" });

    expect(ddbMock.calls()).toHaveLength(1);
    expect(ddbMock.call(0).args[0].input).toEqual({
      TableName: "fold-test-table",
      Key: {
        PK: "CART#user-123",
        SK: "MENUITEM#3",
      },
    });
  });

  test("scopes the delete to the authenticated user's cart", async () => {
    ddbMock.on(DeleteCommand).resolves({});

    const event = makeEvent({
      userId: "another-user",
      body: JSON.stringify({ menuItemId: "7" }),
    });
    await handler(event);

    expect(ddbMock.call(0).args[0].input.Key).toEqual({
      PK: "CART#another-user",
      SK: "MENUITEM#7",
    });
  });

  test("returns 400 when menuItemId is missing from the body", async () => {
    const event = makeEvent({ body: JSON.stringify({}) });
    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      message: "Missing required field: menuItemId (body)",
    });
    expect(ddbMock.calls()).toHaveLength(0);
  });

  test("returns 400 when the request has no body at all", async () => {
    const event = makeEvent({ body: null });
    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(ddbMock.calls()).toHaveLength(0);
  });

  test("returns 500 when DynamoDB throws", async () => {
    ddbMock.on(DeleteCommand).rejects(new Error("DynamoDB is down"));

    const event = makeEvent({ body: JSON.stringify({ menuItemId: "3" }) });
    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({ error: "DynamoDB is down" });
  });
});
