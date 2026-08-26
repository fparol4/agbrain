import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../../core/auth/auth.guard.js";
import { AuditOperation } from "../audit/audit.decorator.js";
import {
  CreateProducerDto,
  ListProducersDto,
  UpdateProducerDto,
} from "./dtos/producer.dto.js";
import { ProducersUseCases } from "./usecases/producers.usecases.js";

@Controller("api/v1/producers")
@UseGuards(AuthGuard)
export class ProducersHandler {
  constructor(private readonly useCases: ProducersUseCases) {}

  @Get()
  list(@Query() input: ListProducersDto) {
    return this.useCases.list(input);
  }

  @Post()
  @AuditOperation("producer.create", "PRODUCER")
  async create(@Body() input: CreateProducerDto) {
    return { data: await this.useCases.create(input) };
  }

  @Get(":id")
  async get(@Param("id", new ParseUUIDPipe()) id: string) {
    return { data: await this.useCases.get(id) };
  }

  @Patch(":id")
  @AuditOperation("producer.update", "PRODUCER")
  async update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() input: UpdateProducerDto,
  ) {
    return { data: await this.useCases.update(id, input) };
  }

  @Delete(":id")
  @HttpCode(204)
  @AuditOperation("producer.delete", "PRODUCER")
  delete(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.useCases.delete(id);
  }
}
