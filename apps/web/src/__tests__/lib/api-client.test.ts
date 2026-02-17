import { describe, expect, it, vi } from "vitest";
import { apiClient } from "../../lib/api/client";

describe("apiClient", () => {
  it("sends bearer token when provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await apiClient("/health", { token: "abc123" });

    expect(fetchMock).toHaveBeenCalledOnce();
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = options.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer abc123");
  });

  it("throws parsed API message on non-2xx responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: "Bad request" }),
      })
    );

    await expect(apiClient("/bad")).rejects.toThrow("Bad request");
  });
});
