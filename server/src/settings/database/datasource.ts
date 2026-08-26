import "reflect-metadata";
import { DataSource } from "typeorm";
import { Session } from "../../modules/auth/entities/session.entity.js";
import { User } from "../../modules/auth/entities/user.entity.js";
import { AuditLog } from "../../modules/audit/entities/audit.entity.js";
import { FarmAreaEvent } from "../../modules/farms/entities/farm-area-event.entity.js";
import { Farm } from "../../modules/farms/entities/farm.entity.js";
import { Crop } from "../../modules/harvests/entities/crop.entity.js";
import { Harvest } from "../../modules/harvests/entities/harvest.entity.js";
import { Producer } from "../../modules/producers/entities/producer.entity.js";
import { settings } from "../environment.js";
import { InitialSchema1770000000000 } from "./migrations/1770000000000-initial-schema.js";
import { AuditSchema1770000001000 } from "./migrations/1770000001000-audit-schema.js";

const config = settings.database();

export const dataSource = new DataSource({
  ...(config as object),
  type: "postgres",
  entities: [
    User,
    Session,
    Producer,
    Farm,
    FarmAreaEvent,
    Harvest,
    Crop,
    AuditLog,
  ],
  migrations: [InitialSchema1770000000000, AuditSchema1770000001000],
  migrationsRun: true,
});
