import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "@/services/api";

describe("ApiClient Service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("adds Authorization Bearer header when token exists", async () => {
    localStorage.setItem("lablink_access_token", "test-token-123");

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify([{ id: "eq-1", name: "Artix-7" }]),
    });
    global.fetch = mockFetch;

    await api.getEquipment();

    expect(mockFetch).toHaveBeenCalled();
    const callArgs = mockFetch.mock.calls[0];
    const headers = callArgs[1].headers;
    expect(headers["Authorization"]).toBe("Bearer test-token-123");
  });

  it("handles authentication error correctly", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ detail: "Invalid credentials" }),
    });
    global.fetch = mockFetch;

    await expect(
      api.login({ email: "wrong@lablink.demo", password: "wrong" })
    ).rejects.toThrow("Invalid credentials");
  });
});
