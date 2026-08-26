import { Injectable } from "@nestjs/common";
import { ConflictError } from "../../../core/errors/application.error.js";
import { FarmsService } from "../../farms/farms.service.js";
import { CropNormalizationService } from "../crop-normalization.service.js";
import type {
  CreateHarvestDto,
  ListHarvestsDto,
  UpdateHarvestDto,
} from "../dtos/harvest.dto.js";
import { HarvestsService } from "../harvests.service.js";

@Injectable()
export class HarvestsUseCases {
  constructor(
    private readonly harvests: HarvestsService,
    private readonly farms: FarmsService,
    private readonly normalization: CropNormalizationService,
  ) {}
  list(input: ListHarvestsDto) {
    return this.harvests.list(input);
  }
  async get(id: string) {
    return this.harvests.serialize(await this.harvests.findOrFail(id));
  }

  async create(input: CreateHarvestDto) {
    await this.farms.findOrFail(input.idFarm);
    if (await this.harvests.exists(input.idFarm, input.year))
      throw new ConflictError(
        "Esta fazenda já possui uma safra cadastrada para este ano.",
      );
    const crops = await this.harvests.resolveCrops(
      this.normalization.normalize(input.crops),
    );
    return this.harvests.serialize(
      await this.harvests.findOrFail(
        (await this.harvests.create({ ...input, crops })).idHarvest,
      ),
    );
  }

  async update(id: string, input: UpdateHarvestDto) {
    const harvest = await this.harvests.findOrFail(id);
    const idFarm = input.idFarm ?? harvest.idFarm;
    const year = input.year ?? harvest.year;
    if (input.idFarm) await this.farms.findOrFail(input.idFarm);
    const duplicate = await this.harvests.exists(idFarm, year);
    if (duplicate && duplicate.idHarvest !== id)
      throw new ConflictError(
        "Esta fazenda já possui uma safra cadastrada para este ano.",
      );
    const crops =
      input.crops === undefined
        ? undefined
        : await this.harvests.resolveCrops(
            this.normalization.normalize(input.crops),
          );
    await this.harvests.save(harvest, { idFarm, year });
    if (crops) await this.harvests.replaceCrops(harvest, crops);
    return this.harvests.serialize(await this.harvests.findOrFail(id));
  }

  async delete(id: string) {
    await this.harvests.remove(await this.harvests.findOrFail(id));
  }
}
