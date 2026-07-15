import { jest } from "@jest/globals";

const mockSend = jest.fn();

jest.unstable_mockModule("@aws-sdk/lib-dynamodb", () => ({
  QueryCommand: jest.fn((params) => params),
  DynamoDBDocumentClient: {
    from: jest.fn(() => ({
      send: mockSend,
    })),
  },
}));

const { handler } = await import("./index.mjs");

describe("Get Cart Lambda", () => {
  beforeEach(() => {
    process.env.TABLE_NAME = "team2";
    mockSend.mockReset();
  });

  test("returns cart items successfully", async () => {
    mockSend.mockResolvedValue({
      Items: [
        {
          PK: "CART#123",
          SK: "MENUITEM#1",
          ItemName: "Burger",
          Price: 10,
        },
      ],
    });

    const event = {
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: "123",
            },
          },
        },
      },
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);

    expect(body.length).toBe(1);
    expect(body[0].ItemName).toBe("Burger");
  });

  test("returns empty array when cart is empty", async () => {
    mockSend.mockResolvedValue({
      Items: [],
    });

    const event = {
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: "123",
            },
          },
        },
      },
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);

    expect(body).toEqual([]);
  });

  test("returns 500 when DynamoDB throws an error", async () => {
    mockSend.mockRejectedValue(new Error("DynamoDB failure"));

    const event = {
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: "123",
            },
          },
        },
      },
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(500);

    const body = JSON.parse(result.body);

    expect(body.message).toBe("DynamoDB failure");
  });
});
