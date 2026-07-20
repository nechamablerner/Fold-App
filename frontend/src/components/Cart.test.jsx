import React from "react";
import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Cart from "./Cart";

describe("Cart Component", () => {
  test("displays cart items and calculates total correctly", () => {
    const cartItems = [
      {
        id: 1,
        name: "Burger",
        price: 10,
        quantity: 2,
        emoji: "🍔",
      },
    ];

    render(
      <Cart
        cartItems={cartItems}
        onUpdateQuantity={() => {}}
        onRemoveItem={() => {}}
        onCheckout={() => {}}
      />,
    );

    expect(screen.getByText("Burger")).toBeInTheDocument();

    expect(screen.getAllByText("$20.00").length).toBe(2);

    expect(screen.getByText(/Proceed to Checkout/)).toBeInTheDocument();
  });

  test("clicking + button calls update quantity", async () => {
    const user = userEvent.setup();

    const updateQuantityMock = vi.fn();

    const cartItems = [
      {
        id: 1,
        name: "Burger",
        price: 10,
        quantity: 1,
      },
    ];

    render(
      <Cart
        cartItems={cartItems}
        onUpdateQuantity={updateQuantityMock}
        onRemoveItem={() => {}}
        onCheckout={() => {}}
      />,
    );

    const plusButton = screen.getByRole("button", {
      name: /Increase quantity of Burger/i,
    });

    await user.click(plusButton);

    expect(updateQuantityMock).toHaveBeenCalledWith(1, 2);
  });
});
