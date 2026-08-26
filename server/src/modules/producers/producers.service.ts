import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { NotFoundError } from "../../core/errors/application.error.js";
import { pageMeta } from "../../shared/pagination/pagination.dto.js";
import type {
  CreateProducerDto,
  ListProducersDto,
  UpdateProducerDto,
} from "./dtos/producer.dto.js";
import { Producer } from "./entities/producer.entity.js";

@Injectable()
export class ProducersService {
  constructor(
    @InjectRepository(Producer)
    private readonly producers: Repository<Producer>,
  ) {}

  async list(input: ListProducersDto) {
    const query = this.producers
      .createQueryBuilder("producer")
      .orderBy("producer.name", "ASC");
    if (input.status)
      query.andWhere("producer.status = :status", { status: input.status });
    if (input.search) {
      const search = input.search;
      query.andWhere(
        new Brackets((filter) =>
          filter
            .where("LOWER(producer.name) LIKE LOWER(:search)", {
              search: `%${search}%`,
            })
            .orWhere("LOWER(producer.email) LIKE LOWER(:search)", {
              search: `%${search}%`,
            })
            .orWhere("producer.document LIKE :document", {
              document: `%${search.replace(/[^A-Z0-9]/gi, "").toUpperCase()}%`,
            }),
        ),
      );
    }
    const [data, total] = await query
      .skip((input.page - 1) * input.limit)
      .take(input.limit)
      .getManyAndCount();
    return { data, meta: pageMeta(input.page, input.limit, total) };
  }

  async findOrFail(idProducer: string) {
    const producer = await this.producers.findOne({
      where: { idProducer },
      relations: { farms: true },
    });
    if (!producer) throw new NotFoundError("Produtor");
    return producer;
  }

  findByDocument(document: string) {
    return this.producers.findOneBy({ document });
  }
  findByEmail(email: string) {
    return this.producers.findOneBy({ email });
  }
  create(
    input: CreateProducerDto & {
      document: string;
      email: string;
      state: string;
    },
  ) {
    return this.producers.save(this.producers.create(input));
  }
  save(
    producer: Producer,
    input: UpdateProducerDto & {
      document?: string;
      email?: string;
      state?: string;
    },
  ) {
    return this.producers.save(this.producers.merge(producer, input));
  }
  async remove(producer: Producer) {
    await this.producers.remove(producer);
  }
}
