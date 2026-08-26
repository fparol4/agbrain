import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import { PaginationDto } from "../../../shared/pagination/pagination.dto.js";
import type {
  DocumentType,
  ProducerStatus,
} from "../entities/producer.entity.js";

export class CreateProducerDto {
  @IsString() @MinLength(2) @MaxLength(160) name!: string;
  @IsEnum(["CPF", "CNPJ"]) documentType!: DocumentType;
  @IsString() @MaxLength(18) document!: string;
  @IsEmail() @MaxLength(254) email!: string;
  @IsString() @MinLength(2) @MaxLength(120) city!: string;
  @IsString() @Length(2, 2) @Matches(/^[A-Za-z]{2}$/) state!: string;
  @IsOptional() @IsEnum(["ACTIVE", "INACTIVE"]) status?: ProducerStatus;
}

export class UpdateProducerDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(160) name?: string;
  @IsOptional() @IsEnum(["CPF", "CNPJ"]) documentType?: DocumentType;
  @IsOptional() @IsString() @MaxLength(18) document?: string;
  @IsOptional() @IsEmail() @MaxLength(254) email?: string;
  @IsOptional() @IsString() @MinLength(2) @MaxLength(120) city?: string;
  @IsOptional()
  @IsString()
  @Length(2, 2)
  @Matches(/^[A-Za-z]{2}$/)
  state?: string;
  @IsOptional() @IsEnum(["ACTIVE", "INACTIVE"]) status?: ProducerStatus;
}

export class ListProducersDto extends PaginationDto {
  @IsOptional() @IsString() @MaxLength(160) search?: string;
  @IsOptional() @IsEnum(["ACTIVE", "INACTIVE"]) status?: ProducerStatus;
}
