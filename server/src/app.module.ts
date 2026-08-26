import { MiddlewareConsumer, Module, type NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppHandler } from "./app.handler.js";
import { RequestIdMiddleware } from "./core/http/request-id.middleware.js";
import { AuditModule } from "./modules/audit/audit.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { DashboardModule } from "./modules/dashboard/dashboard.module.js";
import { FarmsModule } from "./modules/farms/farms.module.js";
import { HarvestsModule } from "./modules/harvests/harvests.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { ProducersModule } from "./modules/producers/producers.module.js";
import { settings } from "./settings/environment.js";

@Module({
  imports: [
    TypeOrmModule.forRoot(settings.database()),
    AuthModule,
    ProducersModule,
    FarmsModule,
    HarvestsModule,
    DashboardModule,
    HealthModule,
    AuditModule,
  ],
  controllers: [AppHandler],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
