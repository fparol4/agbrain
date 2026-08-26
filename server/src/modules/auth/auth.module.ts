import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthGuard } from "../../core/auth/auth.guard.js";
import { AuthHandler } from "./auth.handler.js";
import { AuthService } from "./auth.service.js";
import { Session } from "./entities/session.entity.js";
import { User } from "./entities/user.entity.js";
import { PasswordService } from "./password.service.js";
import { LoginUseCase } from "./usecases/login.usecase.js";

@Module({
  imports: [TypeOrmModule.forFeature([User, Session])],
  controllers: [AuthHandler],
  providers: [AuthService, PasswordService, LoginUseCase, AuthGuard],
  exports: [AuthService, PasswordService, AuthGuard],
})
export class AuthModule {}
