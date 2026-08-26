import type { TypeOrmModuleOptions } from "@nestjs/typeorm";
import "dotenv/config";

const nodeEnv = process.env.NODE_ENV ?? "development";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export const settings = {
  nodeEnv,
  host: process.env.HOST ?? "127.0.0.1",
  port: Number(process.env.PORT ?? 3333),
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  sessionCookie: process.env.SESSION_COOKIE ?? "agbrain-session",
  sessionSecureCookie:
    process.env.SESSION_SECURE_COOKIE !== undefined
      ? process.env.SESSION_SECURE_COOKIE === "true"
      : nodeEnv === "production",
  sessionTtlHours: Number(process.env.SESSION_TTL_HOURS ?? 2),
  database(): TypeOrmModuleOptions {
    return {
      type: "postgres",
      host: required("DB_HOST", "127.0.0.1"),
      port: Number(required("DB_PORT", "5433")),
      username: required("DB_USER", "agbrain"),
      password: required("DB_PASSWORD", "agbrain"),
      database: required("DB_DATABASE", "agbrain"),
      autoLoadEntities: true,
      synchronize: false,
      logging: false,
    };
  },
};
