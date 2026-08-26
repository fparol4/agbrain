import { Injectable } from "@nestjs/common";
import { UnauthorizedError } from "../../../core/errors/application.error.js";
import { AuthService } from "../auth.service.js";
import type { LoginDto } from "../dtos/login.dto.js";
import { PasswordService } from "../password.service.js";

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly auth: AuthService,
    private readonly passwords: PasswordService,
  ) {}

  async execute(input: LoginDto) {
    const user = await this.auth.findUserByEmail(input.email);
    if (
      !user ||
      !(await this.passwords.verify(input.password, user.passwordHash))
    ) {
      throw new UnauthorizedError(
        "E_INVALID_CREDENTIALS",
        "E-mail ou senha inválidos.",
      );
    }
    return { user, session: await this.auth.createSession(user) };
  }
}
