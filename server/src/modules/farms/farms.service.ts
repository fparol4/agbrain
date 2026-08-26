import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { NotFoundError } from "../../core/errors/application.error.js";
import { pageMeta } from "../../shared/pagination/pagination.dto.js";
import type {
  CreateFarmDto,
  ListFarmsDto,
  UpdateFarmDto,
} from "./dtos/farm.dto.js";
import { FarmAreaEvent } from "./entities/farm-area-event.entity.js";
import { Farm } from "./entities/farm.entity.js";

@Injectable()
export class FarmsService {
  constructor(
    @InjectRepository(Farm) private readonly farms: Repository<Farm>,
    @InjectRepository(FarmAreaEvent)
    private readonly events: Repository<FarmAreaEvent>,
  ) {}

  async list(input: ListFarmsDto) {
    const query = this.farms
      .createQueryBuilder("farm")
      .leftJoinAndSelect("farm.producer", "producer")
      .orderBy("farm.name", "ASC");
    if (input.idProducer)
      query.andWhere("farm.idProducer = :idProducer", {
        idProducer: input.idProducer,
      });
    if (input.state)
      query.andWhere("farm.state = :state", {
        state: input.state.toUpperCase(),
      });
    if (input.search)
      query.andWhere(
        new Brackets((filter) =>
          filter
            .where("LOWER(farm.name) LIKE LOWER(:search)", {
              search: `%${input.search}%`,
            })
            .orWhere("LOWER(farm.city) LIKE LOWER(:search)", {
              search: `%${input.search}%`,
            })
            .orWhere("LOWER(producer.name) LIKE LOWER(:search)", {
              search: `%${input.search}%`,
            }),
        ),
      );
    const [farms, total] = await query
      .skip((input.page - 1) * input.limit)
      .take(input.limit)
      .getManyAndCount();
    return {
      data: farms.map((farm) => this.serialize(farm)),
      meta: pageMeta(input.page, input.limit, total),
    };
  }

  async findOrFail(idFarm: string) {
    const farm = await this.farms.findOne({
      where: { idFarm },
      relations: { producer: true },
    });
    if (!farm) throw new NotFoundError("Fazenda");
    return farm;
  }

  async create(input: CreateFarmDto & { state: string }) {
    const farm = await this.farms.save(this.farms.create(input));
    await this.record(farm, 0, farm.totalArea);
    return this.findOrFail(farm.idFarm);
  }

  async save(farm: Farm, input: UpdateFarmDto & { state?: string }) {
    const previousArea = farm.totalArea;
    const saved = await this.farms.save(this.farms.merge(farm, input));
    if (previousArea !== saved.totalArea) {
      await this.record(saved, previousArea, saved.totalArea);
    }
    return this.findOrFail(saved.idFarm);
  }

  async remove(farm: Farm) {
    await this.record(farm, farm.totalArea, 0);
    await this.farms.remove(farm);
  }

  private record(farm: Farm, previousTotalArea: number, newTotalArea: number) {
    return this.events.save({
      idFarm: farm.idFarm,
      idProducer: farm.idProducer,
      previousTotalArea,
      newTotalArea,
      occurredAt: new Date(),
    });
  }

  serialize(farm: Farm) {
    return {
      ...farm,
      producerName: farm.producer?.name,
      producer: undefined,
      harvests: undefined,
    };
  }
}
