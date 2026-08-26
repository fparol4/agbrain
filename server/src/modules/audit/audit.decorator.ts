import { SetMetadata } from "@nestjs/common";
import type {
  AuditOperation as AuditOperationName,
  AuditResource,
} from "./dtos/audit.dto.js";

export const AUDIT_KEY = "audit_operation";

export interface AuditMeta {
  operation: AuditOperationName;
  resource: AuditResource;
}

export const AuditOperation = (
  operation: AuditOperationName,
  resource: AuditResource,
) => SetMetadata<string, AuditMeta>(AUDIT_KEY, { operation, resource });
