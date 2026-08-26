import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { Observable, tap } from "rxjs";
import type { AuditMeta } from "./audit.decorator.js";
import { AUDIT_KEY } from "./audit.decorator.js";
import { AuditService } from "./audit.service.js";

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.get<AuditMeta | undefined>(
      AUDIT_KEY,
      context.getHandler(),
    );

    if (!meta) return next.handle();

    const req = context.switchToHttp().getRequest<Request>();
    // Place audit meta on request so the exception filter can read it
    req.auditMeta = meta;

    return next.handle().pipe(
      tap({
        next: async (result: unknown) => {
          const idResource = extractIdResource(result);
          const metadata = extractMetadata(meta.operation, result);
          await this.auditService.record({
            operation: meta.operation,
            resource: meta.resource,
            idResource,
            outcome: "SUCCESS",
            idActor: req.user?.idUser ?? null,
            actorName: req.user?.name ?? null,
            actorEmail: req.user?.email ?? null,
            statusCode: context
              .switchToHttp()
              .getResponse<import("express").Response>().statusCode,
            requestId: req.requestId ?? null,
            ipAddress: req.ip ?? null,
            userAgent: req.headers["user-agent"] ?? null,
            metadata,
          });
        },
      }),
    );
  }
}

function extractIdResource(result: unknown): string | null {
  if (
    result &&
    typeof result === "object" &&
    "data" in result &&
    result.data &&
    typeof result.data === "object"
  ) {
    const data = result.data as Record<string, unknown>;
    for (const key of Object.keys(data)) {
      if (key.startsWith("id") && typeof data[key] === "string") {
        return data[key] as string;
      }
    }
  }
  return null;
}

function extractMetadata(
  operation: string,
  result: unknown,
): Record<string, unknown> {
  if (!result || typeof result !== "object") return {};
  const data =
    "data" in result && result.data && typeof result.data === "object"
      ? (result.data as Record<string, unknown>)
      : {};
  const meta: Record<string, unknown> = {};
  if (operation.endsWith(".create") || operation.endsWith(".update")) {
    if ("name" in data && typeof data.name === "string") {
      meta.resourceName = data.name;
    }
    if ("year" in data && typeof data.year === "number") {
      meta.year = data.year;
    }
  }
  return meta;
}
