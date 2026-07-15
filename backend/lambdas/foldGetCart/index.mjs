import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
export { dynamodb };

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

export const handler = async (event) => {
  try {
    // 1. Extract the secure user identity inside the try block
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub;
    console.log("User:", claims.sub);

    // 2. Build the partition key using the secure Cognito userId instead of an insecure path parameter
    const pk = `CART#${userId}`;

    // 3. Query DynamoDB for this specific user's cart items
    const itemsResult = await dynamodb.send(
      new QueryCommand({
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: {
          ":pk": pk,
        },
      }),
    );

    // 4. Return the items back to your frontend
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(itemsResult.Items),
    };
  } catch (error) {
    console.error("ERROR:", error);

    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        message: error.message,
      }),
    };
  }
};
