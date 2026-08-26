import { Injectable } from "@nestjs/common";
import { BusinessRuleError } from "../../../core/errors/application.error.js";
import { ProducersService } from "../../producers/producers.service.js";
import type {
  CreateFarmDto,
  ListFarmsDto,
  UpdateFarmDto,
} from "../dtos/farm.dto.js";
import { FarmsService } from "../farms.service.js";

@Injectable()
export class FarmsUseCases {
  constructor(
    private readonly farms: FarmsService,
    private readonly producers: ProducersService,
  ) {}
  list(input: ListFarmsDto) {
    return this.farms.list(input);
  }
  async get(id: string) {
    return this.farms.serialize(await this.farms.findOrFail(id));
  }

  async create(input: CreateFarmDto) {
    await this.producers.findOrFail(input.idProducer);
    this.assertAreas(input);
    return this.farms.serialize(
      await this.farms.create({ ...input, state: input.state.toUpperCase() }),
    );
  }

  async update(id: string, input: UpdateFarmDto) {
    const farm = await this.farms.findOrFail(id);
    this.assertAreas({
      totalArea: input.totalArea ?? farm.totalArea,
      agriculturalArea: input.agriculturalArea ?? farm.agriculturalArea,
      vegetationArea: input.vegetationArea ?? farm.vegetationArea,
    });
    return this.farms.serialize(
      await this.farms.save(farm, {
        ...input,
        state: input.state?.toUpperCase(),
      }),
    );
  }

  async delete(id: string) {
    await this.farms.remove(await this.farms.findOrFail(id));
  }

  private assertAreas(input: {
    totalArea: number;
    agriculturalArea: number;
    vegetationArea: number;
  }) {
    if (input.agriculturalArea + input.vegetationArea > input.totalArea) {
      throw new BusinessRuleError(
        "E_INVALID_FARM_AREA",
        "A soma das áreas não pode ultrapassar a área total.",
      );
    }
  }
}
