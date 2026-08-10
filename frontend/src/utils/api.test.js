import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCart } from "./api.js";
import { fetchAuthSession } from "aws-amplify/auth";

vi.mock("aws-amplify/auth", () => ({
  fetchAuthSession: vi.fn(),
}));

describe("api auth headers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
  });

  it("sends the Cognito token for authenticated requests", async () => {
    fetchAuthSession.mockResolvedValue({
      tokens: {
        accessToken: { toString: () => "access-token" },
        idToken: { toString: () => "id-token" },
      },
    });

    await getCart();

    expect(fetchAuthSession).toHaveBeenCalledWith({ forceRefresh: true });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/cart"),
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer id-token",
        }),
      }),
    );
  });
});
