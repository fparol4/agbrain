import { describe, expect, it, vi, beforeEach } from "vitest";
import { api, ApiError } from "@/shared/api/client";

describe("API helper", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sets credentials to include and sets application/json headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      text: async () => JSON.stringify({ success: true }),
    });
    globalThis.fetch = fetchMock;

    await api.post("/api/v1/test", { sample: "data" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/v1/test");
    expect(init.credentials).toBe("include");
    expect(init.headers.get("Accept")).toBe("application/json");
    expect(init.headers.get("Content-Type")).toBe("application/json");
    expect(init.body).toBe(JSON.stringify({ sample: "data" }));
  });

  it("serializes only defined and non-empty query parameters", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      text: async () => JSON.stringify([]),
    });
    globalThis.fetch = fetchMock;

    await api.get("/api/v1/items", {
      page: 1,
      search: "agro",
      emptyStr: "",
      nilVal: null,
      undefVal: undefined,
    });

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/v1/items?page=1&search=agro");
  });

  it("returns undefined for 204 No Content responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 204,
      ok: true,
      text: async () => "",
    });
    globalThis.fetch = fetchMock;

    const result = await api.delete("/api/v1/items/123");
    expect(result).toBeUndefined();
  });

  it("parses server error envelope and throws ApiError", async () => {
    const errorBody = {
      error: {
        code: "E_INVALID_CREDENTIALS",
        message: "Credenciais inválidas.",
        details: ["Detalhe 1"],
      },
      requestId: "123e4567-e89b-12d3-a456-426614174000",
    };
    const fetchMock = vi.fn().mockResolvedValue({
      status: 401,
      ok: false,
      text: async () => JSON.stringify(errorBody),
    });
    globalThis.fetch = fetchMock;

    await expect(api.get("/api/v1/auth/me")).rejects.toThrow(ApiError);

    try {
      await api.get("/api/v1/auth/me");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(401);
      expect(apiErr.code).toBe("E_INVALID_CREDENTIALS");
      expect(apiErr.message).toBe("Credenciais inválidas.");
      expect(apiErr.details).toEqual(["Detalhe 1"]);
    }
  });
});
