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
  CreateHarvestDto,
  ListHarvestsDto,
  UpdateHarvestDto,
} from "./dtos/harvest.dto.js";
import { HarvestsUseCases } from "./usecases/harvests.usecases.js";

@Controller("api/v1/harvests")
@UseGuards(AuthGuard)
export class HarvestsHandler {
  constructor(private readonly useCases: HarvestsUseCases) {}

  @Get()
  list(@Query() input: ListHarvestsDto) {
    return this.useCases.list(input);
  }

  @Post()
  @AuditOperation("harvest.create", "HARVEST")
  async create(@Body() input: CreateHarvestDto) {
    return { data: await this.useCases.create(input) };
  }

  @Get(":id")
  async get(@Param("id", new ParseUUIDPipe()) id: string) {
    return { data: await this.useCases.get(id) };
  }

  @Patch(":id")
  @AuditOperation("harvest.update", "HARVEST")
  async update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() input: UpdateHarvestDto,
  ) {
    return { data: await this.useCases.update(id, input) };
  }

  @Delete(":id")
  @HttpCode(204)
  @AuditOperation("harvest.delete", "HARVEST")
  delete(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.useCases.delete(id);
  }
}
