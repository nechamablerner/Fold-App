// Thin wrappers around the four backend Lambda routes (via API Gateway).
// Base invoke URL for the foldApi HTTP API ($default stage).

import { fetchAuthSession } from "aws-amplify/auth";

const BASE_URL = "https://3rhm69t8pc.execute-api.us-east-1.amazonaws.com";
async function getAuthHeaders() {
  try {
    const session = await fetchAuthSession();

    if (!session?.tokens?.idToken) {
      console.warn(
        "No active Cognito session found. User might be logged out.",
      );
      return {
        "Content-Type": "application/json",
      };
    }

    const token = session.tokens.idToken.toString();
    return {
      Authorization: token,
      "Content-Type": "application/json",
    };
  } catch (error) {
    console.error("Failed to fetch auth session:", error);
    return {
      "Content-Type": "application/json",
    };
  }
}

export async function getMenu() {
  const res = await fetch(`${BASE_URL}/menu`);
  if (!res.ok) throw new Error("Failed to fetch menu");
  return res.json();
}

export async function getCart() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}/cart`, {
    method: "GET",
    headers: headers, // [cite: 270]
  });
  if (!res.ok) throw new Error("Failed to fetch cart");
  return res.json();
}

export async function updateCartItem(menuItemId, quantity) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}/cart`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ menuItemId, quantity }),
  });
  if (!res.ok) throw new Error("Failed to update cart item");
  return res.json();
}

export async function deleteFromCart(menuItemId) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}/cart`, {
    method: "DELETE", // Or POST depending on how your backend handle updates
    headers: headers,
    body: JSON.stringify({ menuItemId }),
  });
  if (!res.ok) throw new Error("Failed to remove cart item");
  return res.json();
}
export async function placeOrder() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}/placeOrder`, {
    method: "POST",
    headers: headers,
  });
  if (!res.ok) throw new Error("Failed to place order");
  return res.json();
}
