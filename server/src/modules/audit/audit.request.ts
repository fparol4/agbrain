import type { AuditMeta } from "./audit.decorator.js";
import type { AuditOperation, AuditResource } from "./dtos/audit.dto.js";

// Protected mutation routes that guards protect (auth guard runs before interceptor).
// For these, if a guard rejects the request, the interceptor hasn't run yet.
// The exception filter needs to resolve operation/resource from method+path.
const PROTECTED_MUTATIONS: Array<{
  method: string;
  pattern: RegExp;
  operation: AuditOperation;
  resource: AuditResource;
}> = [
  {
    method: "POST",
    pattern: /^\/api\/v1\/auth\/login$/,
    operation: "auth.login",
    resource: "SESSION",
  },
  {
    method: "DELETE",
    pattern: /^\/api\/v1\/auth\/session$/,
    operation: "auth.logout",
    resource: "SESSION",
  },
  {
    method: "POST",
    pattern: /^\/api\/v1\/producers$/,
    operation: "producer.create",
    resource: "PRODUCER",
  },
  {
    method: "PATCH",
    pattern: /^\/api\/v1\/producers\/[^/]+$/,
    operation: "producer.update",
    resource: "PRODUCER",
  },
  {
    method: "DELETE",
    pattern: /^\/api\/v1\/producers\/[^/]+$/,
    operation: "producer.delete",
    resource: "PRODUCER",
  },
  {
    method: "POST",
    pattern: /^\/api\/v1\/farms$/,
    operation: "farm.create",
    resource: "FARM",
  },
  {
    method: "PATCH",
    pattern: /^\/api\/v1\/farms\/[^/]+$/,
    operation: "farm.update",
    resource: "FARM",
  },
  {
    method: "DELETE",
    pattern: /^\/api\/v1\/farms\/[^/]+$/,
    operation: "farm.delete",
    resource: "FARM",
  },
  {
    method: "POST",
    pattern: /^\/api\/v1\/harvests$/,
    operation: "harvest.create",
    resource: "HARVEST",
  },
  {
    method: "PATCH",
    pattern: /^\/api\/v1\/harvests\/[^/]+$/,
    operation: "harvest.update",
    resource: "HARVEST",
  },
  {
    method: "DELETE",
    pattern: /^\/api\/v1\/harvests\/[^/]+$/,
    operation: "harvest.delete",
    resource: "HARVEST",
  },
];

export function resolveAuditMeta(
  method: string,
  path: string,
): AuditMeta | null {
  for (const entry of PROTECTED_MUTATIONS) {
    if (entry.method === method.toUpperCase() && entry.pattern.test(path)) {
      return { operation: entry.operation, resource: entry.resource };
    }
  }
  return null;
}

declare module "express-serve-static-core" {
  interface Request {
    auditMeta?: AuditMeta;
  }
}
