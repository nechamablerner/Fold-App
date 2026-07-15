import { useState, useEffect, useCallback } from "react";
import {
  getMenu,
  getCart,
  updateCartItem,
  deleteFromCart,
  placeOrder,
} from "../utils/api";

// DynamoDB keys look like "MENUITEM#3" -> we just want "3"
function stripPrefix(key = "") {
  return key.split("#")[1] ?? key;
}

// Manages cart state backed by the real API (GetCart/updateCartItem/deleteFromCart),
// merging raw cart line items (quantity only) with /menu details (name/price/emoji/tag)
// so components get objects shaped like: { id, name, emoji, tag, price, quantity }
export function useCart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [cartRaw, menuItems] = await Promise.all([getCart(), getMenu()]);

      const menuById = new Map(menuItems.map((m) => [stripPrefix(m.PK), m]));

      const merged = cartRaw
        .filter((row) => row.SK?.startsWith("MENUITEM#"))
        .map((row) => {
          const menuItemId = stripPrefix(row.SK);
          const details = menuById.get(menuItemId) || {};
          return {
            id: menuItemId,
            name: details.name,
            emoji: details.emoji,
            tag: details.tag,
            price: Number(details.price) || 0,
            quantity: Number(row.quantity) || 1,
          };
        });

      setCartItems(merged);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // menuItem is a raw item from /menu (has PK, name, price, emoji, tag)
  const addToCart = useCallback(
    async (menuItem) => {
      const menuItemId = stripPrefix(menuItem.PK);
      const existing = cartItems.find((item) => item.id === menuItemId);
      const newQuantity = existing ? existing.quantity + 1 : 1;

      setCartItems((prev) =>
        existing
          ? prev.map((item) =>
              item.id === menuItemId
                ? { ...item, quantity: newQuantity }
                : item,
            )
          : [
              ...prev,
              {
                id: menuItemId,
                name: menuItem.name,
                emoji: menuItem.emoji,
                tag: menuItem.tag,
                price: Number(menuItem.price) || 0,
                quantity: 1,
              },
            ],
      );

      try {
        await updateCartItem(menuItemId, newQuantity);
      } catch (err) {
        setError(err.message);
        refresh(); // roll back to server state on failure
      }
    },
    [cartItems, refresh],
  );

  const updateQuantity = useCallback(
    async (menuItemId, newQuantity) => {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === menuItemId ? { ...item, quantity: newQuantity } : item,
        ),
      );
      try {
        await updateCartItem(menuItemId, newQuantity);
      } catch (err) {
        setError(err.message);
        refresh();
      }
    },
    [refresh],
  );

  const removeItem = useCallback(
    async (menuItemId) => {
      setCartItems((prev) => prev.filter((item) => item.id !== menuItemId));
      try {
        await deleteFromCart(menuItemId);
      } catch (err) {
        setError(err.message);
        refresh();
      }
    },
    [refresh],
  );

  // Finalizes the cart into an order (backend computes the authoritative total
  // and clears the cart). Any "payment" happens in the UI only — this is what
  // actually places the order.
  const checkout = useCallback(async () => {
    const result = await placeOrder(); // { orderId, total }
    await refresh();
    return result;
  }, [refresh]);

  return {
    cartItems,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeItem,
    checkout,
  };
}
