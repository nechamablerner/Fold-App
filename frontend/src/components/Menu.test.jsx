import React from "react";
import { beforeEach, describe, test, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import Menu from "./Menu";
import { getMenu } from "../utils/api";

vi.mock("../utils/api", () => ({
  getMenu: vi.fn(),
}));

describe("Menu component", () => {
  const mockMenuItems = [
    {
      PK: "1",
      name: "Classic Chicken",
      description: "Chicken sandwich",
      price: 12,
      emoji: "🥪",
      tag: "Popular",
      category: "sandwiches",
    },
    {
      PK: "2",
      name: "Falafel Wrap",
      description: "Fresh falafel",
      price: 10,
      emoji: "🌯",
      tag: "Vegan",
      category: "wraps",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("loads menu items and displays sandwiches by default", async () => {
    getMenu.mockResolvedValue(mockMenuItems);

    render(<Menu onAddToCart={vi.fn()} />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading menu...");

    await waitFor(() => {
      expect(screen.getByText("Classic Chicken")).toBeInTheDocument();
    });

    expect(screen.queryByText("Falafel Wrap")).not.toBeInTheDocument();
  });

  test("switches to wraps tab and adds item to cart", async () => {
    const user = userEvent.setup();

    getMenu.mockResolvedValue(mockMenuItems);

    const addToCartMock = vi.fn();

    render(<Menu onAddToCart={addToCartMock} />);

    await waitFor(() => {
      expect(screen.getByText("Classic Chicken")).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("tab", {
        name: "Wraps",
      }),
    );

    expect(screen.getByText("Falafel Wrap")).toBeInTheDocument();

    expect(screen.queryByText("Classic Chicken")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Add Falafel Wrap to order",
      }),
    );

    expect(addToCartMock).toHaveBeenCalledWith(mockMenuItems[1]);
  });

  test("shows an error message when menu loading fails", async () => {
    getMenu.mockRejectedValue(new Error("Failed to load"));

    render(<Menu onAddToCart={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Error: Failed to load",
      );
    });
  });
});
