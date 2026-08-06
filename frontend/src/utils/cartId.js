// Generates and persists a per-browser cart ID.
// No login required — each browser gets its own cart, stored in localStorage
// so it survives page reloads and repeat visits.
//
// Usage: import { getCartId } from "../utils/cartId";
// Call getCartId() anywhere you need the current cart's ID
// (e.g. before calling GetCart, updateCartItem, or deleteFromCart).

const CART_ID_KEY = "foldCartId";

export function getCartId() {
  let cartId = localStorage.getItem(CART_ID_KEY);

  if (!cartId) {
    cartId = crypto.randomUUID();
    localStorage.setItem(CART_ID_KEY, cartId);
  }

  return cartId;
}
