import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthGuard } from "../../core/auth/auth.guard.js";
import { sessionToken } from "../../core/auth/session-token.js";
import { AuditOperation } from "../audit/audit.decorator.js";
import { settings } from "../../settings/environment.js";
import { AuthService } from "./auth.service.js";
import { LoginDto } from "./dtos/login.dto.js";
import { LoginUseCase } from "./usecases/login.usecase.js";

@Controller("api/v1/auth")
export class AuthHandler {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly auth: AuthService,
  ) {}

  @Post("login")
  @HttpCode(200)
  @AuditOperation("auth.login", "SESSION")
  async login(
    @Body() input: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.loginUseCase.execute(input);
    response.cookie(settings.sessionCookie, result.session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: settings.sessionSecureCookie,
      expires: result.session.expiresAt,
      path: "/",
    });
    return { user: this.auth.serialize(result.user) };
  }

  @Get("me")
  @UseGuards(AuthGuard)
  me(@Req() request: Request) {
    return { user: this.auth.serialize(request.user!) };
  }

  @Delete("session")
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @AuditOperation("auth.logout", "SESSION")
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.auth.deleteSession(sessionToken(request));
    response.clearCookie(settings.sessionCookie, { path: "/" });
  }
}
