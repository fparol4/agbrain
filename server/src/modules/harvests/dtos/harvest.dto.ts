import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { PaginationDto } from "../../../shared/pagination/pagination.dto.js";

export class CreateHarvestDto {
  @IsUUID() idFarm!: string;
  @IsInt() @Min(2000) @Max(2100) year!: number;
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @Matches(/\S/, { each: true })
  @MaxLength(100, { each: true })
  crops!: string[];
}

export class UpdateHarvestDto {
  @IsOptional() @IsUUID() idFarm?: string;
  @IsOptional() @IsInt() @Min(2000) @Max(2100) year?: number;
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @Matches(/\S/, { each: true })
  @MaxLength(100, { each: true })
  crops?: string[];
}

export class ListHarvestsDto extends PaginationDto {
  @IsOptional() @IsUUID() idProducer?: string;
  @IsOptional() @IsUUID() idFarm?: string;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;
}
