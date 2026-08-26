import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("audit_logs")
@Index(["occurredAt"])
@Index(["operation", "occurredAt"])
@Index(["resource", "occurredAt"])
@Index(["outcome", "occurredAt"])
@Index(["idActor", "occurredAt"])
export class AuditLog {
  @PrimaryGeneratedColumn("uuid", { name: "id_audit" })
  idAudit!: string;

  @Column({ name: "operation", type: "varchar", length: 80 })
  operation!: string;

  @Column({ name: "resource", type: "varchar", length: 40 })
  resource!: string;

  @Column({ name: "id_resource", type: "uuid", nullable: true })
  idResource!: string | null;

  @Column({ name: "outcome", type: "varchar", length: 8 })
  outcome!: "SUCCESS" | "FAILURE";

  @Column({ name: "id_actor", type: "uuid", nullable: true })
  idActor!: string | null;

  @Column({ name: "actor_name", type: "varchar", length: 160, nullable: true })
  actorName!: string | null;

  @Column({ name: "actor_email", type: "varchar", length: 254, nullable: true })
  actorEmail!: string | null;

  @Column({ name: "status_code", type: "integer" })
  statusCode!: number;

  @Column({ name: "error_code", type: "varchar", length: 80, nullable: true })
  errorCode!: string | null;

  @Column({
    name: "error_message",
    type: "varchar",
    length: 300,
    nullable: true,
  })
  errorMessage!: string | null;

  @Column({ name: "request_id", type: "varchar", length: 128, nullable: true })
  requestId!: string | null;

  @Column({ name: "ip_address", type: "varchar", length: 64, nullable: true })
  ipAddress!: string | null;

  @Column({ name: "user_agent", type: "varchar", length: 512, nullable: true })
  userAgent!: string | null;

  @Column({ name: "metadata", type: "jsonb", default: {} })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({
    name: "occurred_at",
    type: "timestamptz",
    default: () => "now()",
  })
  occurredAt!: Date;
}
