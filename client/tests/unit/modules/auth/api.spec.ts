import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/shared/api/client";
import { getSession, login, logout } from "@/modules/auth/api";

const user = {
  idUser: "11111111-1111-4111-8111-111111111111",
  name: "Administrador",
  email: "admin@agbrain.local",
};

describe("auth API", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("loads and unwraps the current session", async () => {
    vi.spyOn(api, "get").mockResolvedValue({ user });
    await expect(getSession()).resolves.toEqual(user);
    expect(api.get).toHaveBeenCalledWith("/api/v1/auth/me");
  });

  it("logs in and unwraps the user", async () => {
    vi.spyOn(api, "post").mockResolvedValue({ user });
    const input = { email: user.email, password: "password123" };
    await expect(login(input)).resolves.toEqual(user);
    expect(api.post).toHaveBeenCalledWith("/api/v1/auth/login", input);
  });

  it("deletes the server session", async () => {
    vi.spyOn(api, "delete").mockResolvedValue(undefined);
    await logout();
    expect(api.delete).toHaveBeenCalledWith("/api/v1/auth/session");
  });
});
