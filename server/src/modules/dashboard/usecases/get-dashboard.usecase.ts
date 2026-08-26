import { Injectable } from "@nestjs/common";
import { ProducersService } from "../../producers/producers.service.js";
import { DashboardService } from "../dashboard.service.js";
import type { DashboardDto } from "../dtos/dashboard.dto.js";

@Injectable()
export class GetDashboardUseCase {
  constructor(
    private readonly dashboard: DashboardService,
    private readonly producers: ProducersService,
  ) {}
  async execute(input: DashboardDto) {
    const producer = input.idProducer
      ? await this.producers.findOrFail(input.idProducer)
      : undefined;
    return this.dashboard.get(input, producer?.name);
  }
}
