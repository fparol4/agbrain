import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module.js";
import { ProducersModule } from "../producers/producers.module.js";
import { FarmAreaEvent } from "./entities/farm-area-event.entity.js";
import { Farm } from "./entities/farm.entity.js";
import { FarmsHandler } from "./farms.handler.js";
import { FarmsService } from "./farms.service.js";
import { FarmsUseCases } from "./usecases/farms.usecases.js";

@Module({
  imports: [
    TypeOrmModule.forFeature([Farm, FarmAreaEvent]),
    AuthModule,
    ProducersModule,
  ],
  controllers: [FarmsHandler],
  providers: [FarmsService, FarmsUseCases],
  exports: [FarmsService],
})
export class FarmsModule {}
