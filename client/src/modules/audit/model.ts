export type AuditOperation =
  | "auth.login"
  | "auth.logout"
  | "producer.create"
  | "producer.update"
  | "producer.delete"
  | "farm.create"
  | "farm.update"
  | "farm.delete"
  | "harvest.create"
  | "harvest.update"
  | "harvest.delete";

export type AuditResource = "SESSION" | "PRODUCER" | "FARM" | "HARVEST";
export type AuditOutcome = "SUCCESS" | "FAILURE";

export interface AuditLog {
  idAudit: string;
  operation: AuditOperation;
  resource: AuditResource;
  idResource: string | null;
  outcome: AuditOutcome;
  idActor: string | null;
  actorName: string | null;
  actorEmail: string | null;
  statusCode: number;
  errorCode: string | null;
  errorMessage: string | null;
  requestId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown>;
  occurredAt: string;
}

export interface ListAuditsParams {
  page?: number;
  limit?: number;
  operation?: AuditOperation;
  resource?: AuditResource;
  outcome?: AuditOutcome;
  from?: string;
  to?: string;
  search?: string;
}
