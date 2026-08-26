import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { ProducersModule } from "../producers/producers.module.js";
import { DashboardHandler } from "./dashboard.handler.js";
import { DashboardService } from "./dashboard.service.js";
import { GetDashboardUseCase } from "./usecases/get-dashboard.usecase.js";

@Module({
  imports: [AuthModule, ProducersModule],
  controllers: [DashboardHandler],
  providers: [DashboardService, GetDashboardUseCase],
})
export class DashboardModule {}
