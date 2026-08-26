import { UnauthorizedError } from "../../../src/core/errors/application.error.js";
import { LoginUseCase } from "../../../src/modules/auth/usecases/login.usecase.js";

describe("LoginUseCase", () => {
  const user = {
    idUser: "user",
    email: "admin@test.local",
    passwordHash: "hash",
  };
  const auth = { findUserByEmail: vi.fn(), createSession: vi.fn() };
  const passwords = { verify: vi.fn() };
  const useCase = new LoginUseCase(auth as never, passwords as never);

  beforeEach(() => vi.clearAllMocks());

  it("creates a session for valid credentials", async () => {
    auth.findUserByEmail.mockResolvedValue(user);
    passwords.verify.mockResolvedValue(true);
    auth.createSession.mockResolvedValue({ token: "token" });
    await expect(
      useCase.execute({ email: user.email, password: "password" }),
    ).resolves.toEqual({ user, session: { token: "token" } });
  });

  it("rejects invalid credentials", async () => {
    auth.findUserByEmail.mockResolvedValue(null);
    await expect(
      useCase.execute({ email: user.email, password: "wrong-password" }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
