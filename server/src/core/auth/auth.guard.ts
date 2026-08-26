import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import type { Request } from "express";
import { UnauthorizedError } from "../errors/application.error.js";
import { AuthService } from "../../modules/auth/auth.service.js";
import { sessionToken } from "./session-token.js";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const user = await this.auth.userFromToken(sessionToken(request));
    if (!user) throw new UnauthorizedError();
    request.user = user;
    return true;
  }
}

declare module "express-serve-static-core" {
  interface Request {
    user?: import("../../modules/auth/entities/user.entity.js").User;
  }
}
