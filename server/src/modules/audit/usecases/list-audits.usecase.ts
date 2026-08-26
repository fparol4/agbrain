import { Injectable } from "@nestjs/common";
import type { ListAuditsDto } from "../dtos/audit.dto.js";
import { AuditService } from "../audit.service.js";

@Injectable()
export class ListAuditsUseCase {
  constructor(private readonly auditService: AuditService) {}

  execute(input: ListAuditsDto) {
    return this.auditService.list(input);
  }
}
