import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../../core/auth/auth.guard.js";
import { ListAuditsDto } from "./dtos/audit.dto.js";
import { ListAuditsUseCase } from "./usecases/list-audits.usecase.js";

@Controller("api/v1/audits")
@UseGuards(AuthGuard)
export class AuditHandler {
  constructor(private readonly listAudits: ListAuditsUseCase) {}

  @Get()
  list(@Query() input: ListAuditsDto) {
    return this.listAudits.execute(input);
  }
}
