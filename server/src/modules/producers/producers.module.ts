import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module.js";
import { Producer } from "./entities/producer.entity.js";
import { ProducersHandler } from "./producers.handler.js";
import { ProducersService } from "./producers.service.js";
import { ProducersUseCases } from "./usecases/producers.usecases.js";

@Module({
  imports: [TypeOrmModule.forFeature([Producer]), AuthModule],
  controllers: [ProducersHandler],
  providers: [ProducersService, ProducersUseCases],
  exports: [ProducersService],
})
export class ProducersModule {}
