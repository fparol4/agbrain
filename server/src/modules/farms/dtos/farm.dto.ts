import { Type } from "class-transformer";
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { PaginationDto } from "../../../shared/pagination/pagination.dto.js";

export class CreateFarmDto {
  @IsUUID() idProducer!: string;
  @IsString() @MinLength(2) @MaxLength(160) name!: string;
  @IsString() @MinLength(2) @MaxLength(120) city!: string;
  @IsString() @Length(2, 2) @Matches(/^[A-Za-z]{2}$/) state!: string;
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) totalArea!: number;
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) agriculturalArea!: number;
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) vegetationArea!: number;
}

export class UpdateFarmDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(160) name?: string;
  @IsOptional() @IsString() @MinLength(2) @MaxLength(120) city?: string;
  @IsOptional()
  @IsString()
  @Length(2, 2)
  @Matches(/^[A-Za-z]{2}$/)
  state?: string;
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  totalArea?: number;
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  agriculturalArea?: number;
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  vegetationArea?: number;
}

export class ListFarmsDto extends PaginationDto {
  @IsOptional() @IsUUID() idProducer?: string;
  @IsOptional() @IsString() @MaxLength(160) search?: string;
  @IsOptional()
  @IsString()
  @Length(2, 2)
  @Matches(/^[A-Za-z]{2}$/)
  state?: string;
}
