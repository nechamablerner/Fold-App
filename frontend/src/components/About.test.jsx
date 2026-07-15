import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import About from "./About";

describe("About", () => {
  beforeEach(() => {
    // jsdom doesn't implement scrollIntoView; About's CTA calls it directly.
    Element.prototype.scrollIntoView = vi.fn();
  });

  test("renders the section heading and story copy", () => {
    render(<About />);

    expect(
      screen.getByRole("heading", { name: /built on the.*obsession.*with a good fold/is }),
    ).toBeInTheDocument();
    expect(screen.getByText(/lower east side kitchen/i)).toBeInTheDocument();
  });

  test("renders all four stats with their values and labels", () => {
    render(<About />);

    expect(screen.getByText("5+")).toBeInTheDocument();
    expect(screen.getByText("Years in NYC")).toBeInTheDocument();

    expect(screen.getByText("40+")).toBeInTheDocument();
    expect(screen.getByText("Ingredients sourced locally")).toBeInTheDocument();

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Bread types baked daily")).toBeInTheDocument();

    expect(screen.getByText("★ 4.9")).toBeInTheDocument();
    expect(screen.getByText("On Google")).toBeInTheDocument();
  });

  test("clicking the CTA scrolls the #menu section into view", async () => {
    const user = userEvent.setup();

    // The button looks up the menu section by DOM id, so it needs to exist.
    const menuSection = document.createElement("div");
    menuSection.id = "menu";
    document.body.appendChild(menuSection);

    render(<About />);

    await user.click(
      screen.getByRole("button", { name: /see what we're making today/i }),
    );

    expect(menuSection.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
    });

    document.body.removeChild(menuSection);
  });

  test("does not throw when the #menu section is missing", async () => {
    const user = userEvent.setup();
    render(<About />);

    await expect(
      user.click(
        screen.getByRole("button", { name: /see what we're making today/i }),
      ),
    ).resolves.not.toThrow();
  });
});
