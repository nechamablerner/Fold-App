import React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import AdminDashboard from "./AdminDashboard";
import { getAdminMenu, updateMenuItem } from "../utils/api";

vi.mock("../utils/api", () => ({
  getAdminMenu: vi.fn(),
  createMenuItem: vi.fn(),
  updateMenuItem: vi.fn(),
  deleteMenuItem: vi.fn(),
}));

describe("AdminDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("shows an error message when saving an edited item fails", async () => {
    const user = userEvent.setup();

    getAdminMenu.mockResolvedValue([
      {
        PK: "MENUITEM#1",
        name: "Burger",
        description: "Classic burger",
        price: 10,
        category: "mains",
        emoji: "🍔",
        tag: "favorite",
      },
    ]);
    updateMenuItem.mockRejectedValueOnce(new Error("Forbidden"));

    render(<AdminDashboard />);

    await screen.findByText("Burger");

    await user.click(screen.getByRole("button", { name: "Edit" }));

    const nameInput = screen.getByPlaceholderText("Name");
    await user.clear(nameInput);
    await user.type(nameInput, "Veggie Burger");

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Forbidden");
    expect(updateMenuItem).toHaveBeenCalled();
  });
});
