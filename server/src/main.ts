import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { configureApp } from "./core/http/configure-app.js";
import { dataSource } from "./settings/database/datasource.js";
import { settings } from "./settings/environment.js";

async function bootstrap() {
  await dataSource.initialize();
  await dataSource.destroy();
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.listen(settings.port, settings.host);
}

void bootstrap();
