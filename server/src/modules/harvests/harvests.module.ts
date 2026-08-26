import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module.js";
import { FarmsModule } from "../farms/farms.module.js";
import { CropNormalizationService } from "./crop-normalization.service.js";
import { Crop } from "./entities/crop.entity.js";
import { Harvest } from "./entities/harvest.entity.js";
import { HarvestsHandler } from "./harvests.handler.js";
import { HarvestsService } from "./harvests.service.js";
import { HarvestsUseCases } from "./usecases/harvests.usecases.js";

@Module({
  imports: [TypeOrmModule.forFeature([Harvest, Crop]), AuthModule, FarmsModule],
  controllers: [HarvestsHandler],
  providers: [HarvestsService, HarvestsUseCases, CropNormalizationService],
  exports: [HarvestsService],
})
export class HarvestsModule {}
