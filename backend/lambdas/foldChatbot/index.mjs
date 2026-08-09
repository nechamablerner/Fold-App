import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  // 0. Handle CORS
  if (event.requestContext?.http?.method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
      },
      body: "",
    };
  }

  const body = JSON.parse(event.body || "{}");
  const userMessage = body.message || "";

  // Safety Check: Ensure API Key exists
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY environment variable");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server configuration error" }),
    };
  }

  let menuData = [];

  // 1. Fetch menu items
  try {
    const command = new ScanCommand({
      TableName: process.env.TABLE_NAME,
    });
    const response = await docClient.send(command);
    menuData = response.Items || [];
  } catch (err) {
    console.error("Error fetching from DynamoDB:", err);
  }

  // 2. Format system prompt
  const systemPrompt = `
    You are an AI assistant for the restaurant "Fold", a kosher sandwich and wrap shop.
    Answer customer questions strictly using the menu items retrieved from our database below.
    If an item or question cannot be answered using this data, politely inform the customer.

    CRITICAL RULES:
    1. Only recommend dishes that are explicitly listed on our provided menu.
    2. If a customer mentions an allergy, check the menu carefully. If unsure, tell them to call the restaurant directly.
    3. Our hours: Mon-Thu 11am-9pm, Fri 11am-3pm, Sun 12pm-9pm. CLOSED on Saturdays.

    MENU DATABASE ITEMS:
    ${JSON.stringify(menuData, null, 2)}

    Customer Question: ${userMessage}
    `;

  // 3. Call Google Gemini API (Updated to Model 1.5 Flash)
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 250,
        },
      }),
    });

    const parsedData = await response.json();

    // Handle possible error from Google's API
    if (parsedData.error) {
      console.error("Google API Error:", parsedData.error);
      throw new Error(parsedData.error.message);
    }

    const botReply =
      parsedData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I couldn't process that. Please ask about our menu!";

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
      },
      body: JSON.stringify({ reply: botReply }),
    };
  } catch (err) {
    console.error("Gemini API execution error:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Failed to connect to AI server" }),
    };
  }
};
