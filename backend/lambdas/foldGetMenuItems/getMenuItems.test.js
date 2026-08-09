import { jest } from "@jest/globals";

const mockSend = jest.fn();

jest.unstable_mockModule("@aws-sdk/client-dynamodb", () => ({
  DynamoDBClient: jest.fn(() => ({})),
}));

jest.unstable_mockModule("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocumentClient: {
    from: jest.fn(() => ({
      send: mockSend,
    })),
  },
  ScanCommand: jest.fn((input) => input),
}));

process.env.TABLE_NAME = "TestTable";

const { handler } = await import("./index.mjs");

describe("getMenuItems Lambda", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns menu items successfully", async () => {
    mockSend.mockResolvedValue({
      Items: [
        {
          PK: "MENUITEM#1",
          name: "Burger",
        },
      ],
    });

    const event = {
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: "user123",
            },
          },
        },
      },
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(200);

    expect(JSON.parse(response.body)).toEqual([
      {
        PK: "MENUITEM#1",
        name: "Burger",
      },
    ]);

    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  test("returns empty array when no items exist", async () => {
    mockSend.mockResolvedValue({
      Items: [],
    });

    const event = {
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: "user123",
            },
          },
        },
      },
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual([]);
  });

  test("returns 500 when DynamoDB throws an error", async () => {
    mockSend.mockRejectedValue(new Error("Database failure"));

    const event = {
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: "user123",
            },
          },
        },
      },
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(500);

    const body = JSON.parse(response.body);

    expect(body.message).toBe("Database failure");
  });
});
