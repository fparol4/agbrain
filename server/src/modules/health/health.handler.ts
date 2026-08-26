import { Controller, Get, Res } from "@nestjs/common";
import { DataSource } from "typeorm";
import type { Response } from "express";

@Controller("health")
export class HealthHandler {
  constructor(private readonly database: DataSource) {}
  @Get()
  async get(@Res({ passthrough: true }) response: Response) {
    try {
      await this.database.query("SELECT 1");
      return { status: "ok", checks: { database: "up" } };
    } catch {
      response.status(503);
      return { status: "error", checks: { database: "down" } };
    }
  }
}
