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
import { CreateFarmDto, ListFarmsDto, UpdateFarmDto } from "./dtos/farm.dto.js";
import { FarmsUseCases } from "./usecases/farms.usecases.js";

@Controller("api/v1/farms")
@UseGuards(AuthGuard)
export class FarmsHandler {
  constructor(private readonly useCases: FarmsUseCases) {}

  @Get()
  list(@Query() input: ListFarmsDto) {
    return this.useCases.list(input);
  }

  @Post()
  @AuditOperation("farm.create", "FARM")
  async create(@Body() input: CreateFarmDto) {
    return { data: await this.useCases.create(input) };
  }

  @Get(":id")
  async get(@Param("id", new ParseUUIDPipe()) id: string) {
    return { data: await this.useCases.get(id) };
  }

  @Patch(":id")
  @AuditOperation("farm.update", "FARM")
  async update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() input: UpdateFarmDto,
  ) {
    return { data: await this.useCases.update(id, input) };
  }

  @Delete(":id")
  @HttpCode(204)
  @AuditOperation("farm.delete", "FARM")
  delete(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.useCases.delete(id);
  }
}
