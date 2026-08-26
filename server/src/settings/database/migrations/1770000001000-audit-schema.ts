import type { MigrationInterface, QueryRunner } from "typeorm";

export class AuditSchema1770000001000 implements MigrationInterface {
  name = "AuditSchema1770000001000";

  async up(query: QueryRunner) {
    await query.query(`
      CREATE TABLE audit_logs (
        id_audit uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        operation varchar(80) NOT NULL,
        resource varchar(40) NOT NULL,
        id_resource uuid,
        outcome varchar(8) NOT NULL CHECK (outcome IN ('SUCCESS', 'FAILURE')),
        id_actor uuid,
        actor_name varchar(160),
        actor_email varchar(254),
        status_code integer NOT NULL,
        error_code varchar(80),
        error_message varchar(300),
        request_id varchar(128),
        ip_address varchar(64),
        user_agent varchar(512),
        metadata jsonb NOT NULL DEFAULT '{}',
        occurred_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX audit_logs_occurred_at_idx ON audit_logs(occurred_at DESC);
      CREATE INDEX audit_logs_operation_occurred_at_idx ON audit_logs(operation, occurred_at DESC);
      CREATE INDEX audit_logs_resource_occurred_at_idx ON audit_logs(resource, occurred_at DESC);
      CREATE INDEX audit_logs_outcome_occurred_at_idx ON audit_logs(outcome, occurred_at DESC);
      CREATE INDEX audit_logs_id_actor_occurred_at_idx ON audit_logs(id_actor, occurred_at DESC);
    `);
  }

  async down(query: QueryRunner) {
    await query.query(`
      DROP INDEX IF EXISTS audit_logs_id_actor_occurred_at_idx;
      DROP INDEX IF EXISTS audit_logs_outcome_occurred_at_idx;
      DROP INDEX IF EXISTS audit_logs_resource_occurred_at_idx;
      DROP INDEX IF EXISTS audit_logs_operation_occurred_at_idx;
      DROP INDEX IF EXISTS audit_logs_occurred_at_idx;
      DROP TABLE IF EXISTS audit_logs;
    `);
  }
}
