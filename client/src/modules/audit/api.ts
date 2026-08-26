import { api } from "@/shared/api/client";
import type { PagedResult } from "@/shared/lib/pagination";
import type { AuditLog, ListAuditsParams } from "./model";

export function listAudits(params: ListAuditsParams) {
  return api.get<PagedResult<AuditLog>>("/api/v1/audits", params);
}
