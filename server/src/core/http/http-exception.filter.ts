import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Inject,
  Optional,
  type ExceptionFilter,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { ApplicationError } from "../errors/application.error.js";

export interface AuditRecorder {
  record(data: {
    operation: string;
    resource: string;
    idResource?: string | null;
    outcome: "FAILURE";
    idActor?: string | null;
    actorName?: string | null;
    actorEmail?: string | null;
    statusCode: number;
    errorCode?: string | null;
    errorMessage?: string | null;
    requestId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<void>;
}

export const AUDIT_RECORDER_TOKEN = "AUDIT_RECORDER";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @Optional()
    @Inject(AUDIT_RECORDER_TOKEN)
    private readonly auditRecorder: AuditRecorder | null = null,
  ) {}

  async catch(error: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    let status: number;
    let code: string;
    let message: string;
    let details: unknown[] | undefined;

    if (error instanceof ApplicationError) {
      status = error.status;
      code = error.code;
      message = error.message;
      details = error.details !== undefined ? [error.details] : undefined;
    } else if (error instanceof HttpException) {
      status = error.getStatus();
      const body = error.getResponse();
      const messages =
        typeof body === "object" && body && "message" in body
          ? (body as Record<string, unknown>).message
          : undefined;
      code =
        status === HttpStatus.UNAUTHORIZED
          ? "E_UNAUTHORIZED"
          : "E_VALIDATION_ERROR";
      message =
        status === HttpStatus.UNAUTHORIZED
          ? "Autenticação necessária."
          : "Os dados informados são inválidos.";
      details = messages
        ? Array.isArray(messages)
          ? (messages as unknown[])
          : [messages]
        : undefined;
    } else {
      status = 500;
      code = "E_INTERNAL_SERVER_ERROR";
      message = "Erro interno do servidor.";
    }

    await this.tryRecordFailure(request, status, code, message);

    return response.status(status).json({
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
      requestId: request.requestId,
    });
  }

  private async tryRecordFailure(
    request: Request,
    status: number,
    code: string,
    message: string,
  ): Promise<void> {
    try {
      if (!this.auditRecorder) return;
      const { resolveAuditMeta } =
        await import("../../modules/audit/audit.request.js");
      const auditMeta =
        request.auditMeta ?? resolveAuditMeta(request.method, request.path);
      if (!auditMeta) return;

      const metadata: Record<string, unknown> = {};
      if (
        auditMeta.operation === "auth.login" &&
        status === 401 &&
        request.body &&
        typeof request.body.email === "string"
      ) {
        const email = String(request.body.email).trim().toLowerCase();
        if (email.length <= 254) metadata.attemptedEmail = email;
      }

      await this.auditRecorder.record({
        operation: auditMeta.operation,
        resource: auditMeta.resource,
        idResource: extractRouteId(request.path),
        outcome: "FAILURE",
        idActor: request.user?.idUser ?? null,
        actorName: request.user?.name ?? null,
        actorEmail: request.user?.email ?? null,
        statusCode: status,
        errorCode: code,
        errorMessage: message,
        requestId: request.requestId ?? null,
        ipAddress: request.ip ?? null,
        userAgent: request.headers["user-agent"] ?? null,
        metadata,
      });
    } catch {
      // Never let audit errors propagate
    }
  }
}

function extractRouteId(path: string): string | null {
  const match = path.match(
    /\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\/|$)/i,
  );
  return match ? match[1] : null;
}
