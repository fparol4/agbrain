import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../../core/auth/auth.guard.js";
import { DashboardDto } from "./dtos/dashboard.dto.js";
import { GetDashboardUseCase } from "./usecases/get-dashboard.usecase.js";

@Controller("api/v1/dashboard")
@UseGuards(AuthGuard)
export class DashboardHandler {
  constructor(private readonly useCase: GetDashboardUseCase) {}
  @Get() async get(@Query() input: DashboardDto) {
    return { data: await this.useCase.execute(input) };
  }
}
