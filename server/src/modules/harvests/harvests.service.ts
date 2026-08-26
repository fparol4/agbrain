import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotFoundError } from "../../core/errors/application.error.js";
import { pageMeta } from "../../shared/pagination/pagination.dto.js";
import type { ListHarvestsDto } from "./dtos/harvest.dto.js";
import { Crop } from "./entities/crop.entity.js";
import { Harvest } from "./entities/harvest.entity.js";

@Injectable()
export class HarvestsService {
  constructor(
    @InjectRepository(Harvest) private readonly harvests: Repository<Harvest>,
    @InjectRepository(Crop) private readonly crops: Repository<Crop>,
  ) {}

  async list(input: ListHarvestsDto) {
    const query = this.harvests
      .createQueryBuilder("harvest")
      .leftJoinAndSelect("harvest.farm", "farm")
      .leftJoinAndSelect("farm.producer", "producer")
      .leftJoinAndSelect("harvest.crops", "crop")
      .orderBy("harvest.year", "DESC")
      .addOrderBy("farm.name", "ASC");
    if (input.idProducer)
      query.andWhere("farm.idProducer = :idProducer", {
        idProducer: input.idProducer,
      });
    if (input.idFarm)
      query.andWhere("harvest.idFarm = :idFarm", { idFarm: input.idFarm });
    if (input.year)
      query.andWhere("harvest.year = :year", { year: input.year });
    const [items, total] = await query
      .skip((input.page - 1) * input.limit)
      .take(input.limit)
      .getManyAndCount();
    return {
      data: items.map((item) => this.serialize(item)),
      meta: pageMeta(input.page, input.limit, total),
    };
  }

  async findOrFail(idHarvest: string) {
    const harvest = await this.harvests.findOne({
      where: { idHarvest },
      relations: { crops: true, farm: { producer: true } },
    });
    if (!harvest) throw new NotFoundError("Safra");
    return harvest;
  }

  exists(idFarm: string, year: number) {
    return this.harvests.findOneBy({ idFarm, year });
  }

  async resolveCrops(values: { name: string; normalizedName: string }[]) {
    const result: Crop[] = [];
    for (const value of values) {
      result.push(
        (await this.crops.findOneBy({
          normalizedName: value.normalizedName,
        })) ?? (await this.crops.save(this.crops.create(value))),
      );
    }
    return result;
  }

  create(input: { idFarm: string; year: number; crops: Crop[] }) {
    return this.harvests.save(this.harvests.create(input));
  }
  save(harvest: Harvest, input: Partial<Pick<Harvest, "idFarm" | "year">>) {
    return this.harvests.save(this.harvests.merge(harvest, input));
  }

  async replaceCrops(harvest: Harvest, crops: Crop[]) {
    const currentCrops = harvest.crops ?? [];
    const currentIds = new Set(currentCrops.map((crop) => crop.idCrop));
    const nextIds = new Set(crops.map((crop) => crop.idCrop));
    const cropsToAdd = crops.filter((crop) => !currentIds.has(crop.idCrop));
    const cropsToRemove = currentCrops.filter(
      (crop) => !nextIds.has(crop.idCrop),
    );
    if (cropsToAdd.length === 0 && cropsToRemove.length === 0) return;

    await this.harvests
      .createQueryBuilder()
      .relation(Harvest, "crops")
      .of(harvest)
      .addAndRemove(cropsToAdd, cropsToRemove);
  }
  async remove(harvest: Harvest) {
    await this.harvests.remove(harvest);
  }

  serialize(harvest: Harvest) {
    return {
      idHarvest: harvest.idHarvest,
      idFarm: harvest.idFarm,
      idProducer: harvest.farm?.idProducer,
      farmName: harvest.farm?.name,
      producerName: harvest.farm?.producer?.name,
      year: harvest.year,
      crops: harvest.crops?.map(({ idCrop, name }) => ({ idCrop, name })) ?? [],
    };
  }
}
