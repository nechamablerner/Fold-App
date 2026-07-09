// Thin wrappers around the four backend Lambda routes (via API Gateway).
// Base invoke URL for the foldApi HTTP API ($default stage).

const BASE_URL = "https://tkzt0gym4e.execute-api.us-east-1.amazonaws.com";

export async function getMenu() {
  const res = await fetch(`${BASE_URL}/menu`);
  if (!res.ok) throw new Error("Failed to fetch menu");
  return res.json();
}

export async function getCart(cartId) {
  const res = await fetch(`${BASE_URL}/GetCart/cart/${cartId}`);
  if (!res.ok) throw new Error("Failed to fetch cart");
  return res.json();
}

export async function updateCartItem(cartId, menuItemId, quantity) {
  const res = await fetch(
    `${BASE_URL}/updateCartItem/cart/${cartId}/menuItem/${menuItemId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    },
  );
  if (!res.ok) throw new Error("Failed to update cart item");
  return res.json();
}

export async function deleteFromCart(cartId, menuItemId) {
  const res = await fetch(
    `${BASE_URL}/deleteFromCart/cart/${cartId}/menuItem/${menuItemId}`,
    { method: "DELETE" },
  );
  if (!res.ok) throw new Error("Failed to remove cart item");
  return res.json();
}

export async function placeOrder(cartId) {
  const res = await fetch(`${BASE_URL}/placeOrder/cart/${cartId}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to place order");
  return res.json();
}
