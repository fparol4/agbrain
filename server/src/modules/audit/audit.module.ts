import { Module } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  AUDIT_RECORDER_TOKEN,
  HttpExceptionFilter,
} from "../../core/http/http-exception.filter.js";
import { AuthModule } from "../auth/auth.module.js";
import { AuditHandler } from "./audit.handler.js";
import { AuditInterceptor } from "./audit.interceptor.js";
import { AuditService } from "./audit.service.js";
import { AuditLog } from "./entities/audit.entity.js";
import { ListAuditsUseCase } from "./usecases/list-audits.usecase.js";

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog]), AuthModule],
  controllers: [AuditHandler],
  providers: [
    AuditService,
    ListAuditsUseCase,
    {
      provide: AUDIT_RECORDER_TOKEN,
      useExisting: AuditService,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  exports: [AuditService],
})
export class AuditModule {}
