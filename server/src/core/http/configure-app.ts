import { ValidationPipe, type INestApplication } from "@nestjs/common";

export function configureApp(app: INestApplication) {
  app.enableCors({
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PATCH", "DELETE"],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  // HttpExceptionFilter is now registered via AuditModule as APP_FILTER (DI-aware)
}
