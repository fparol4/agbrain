import { Type } from "class-transformer";
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";
import { PaginationDto } from "../../../shared/pagination/pagination.dto.js";

const OPERATIONS = [
  "auth.login",
  "auth.logout",
  "producer.create",
  "producer.update",
  "producer.delete",
  "farm.create",
  "farm.update",
  "farm.delete",
  "harvest.create",
  "harvest.update",
  "harvest.delete",
] as const;

const RESOURCES = ["SESSION", "PRODUCER", "FARM", "HARVEST"] as const;
const OUTCOMES = ["SUCCESS", "FAILURE"] as const;

export type AuditOperation = (typeof OPERATIONS)[number];
export type AuditResource = (typeof RESOURCES)[number];
export type AuditOutcome = (typeof OUTCOMES)[number];

export { OPERATIONS, RESOURCES, OUTCOMES };

export class ListAuditsDto extends PaginationDto {
  @IsOptional()
  @IsIn(OPERATIONS)
  operation?: AuditOperation;

  @IsOptional()
  @IsIn(RESOURCES)
  resource?: AuditResource;

  @IsOptional()
  @IsIn(OUTCOMES)
  outcome?: AuditOutcome;

  @IsOptional()
  @IsUUID()
  idActor?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  @Type(() => String)
  search?: string;
}
