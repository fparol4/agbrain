import type { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1770000000000 implements MigrationInterface {
  name = "InitialSchema1770000000000";
  async up(query: QueryRunner) {
    await query.query(`
      CREATE TABLE users (
        id_user uuid PRIMARY KEY DEFAULT gen_random_uuid(), name varchar(160) NOT NULL,
        email varchar(254) NOT NULL UNIQUE, password_hash varchar NOT NULL, active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE sessions (
        id_session varchar(64) PRIMARY KEY, id_user uuid NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
        expires_at timestamptz NOT NULL
      );
      CREATE INDEX sessions_expires_at_idx ON sessions(expires_at);
      CREATE TABLE producers (
        id_producer uuid PRIMARY KEY DEFAULT gen_random_uuid(), name varchar(160) NOT NULL,
        document_type varchar(4) NOT NULL CHECK (document_type IN ('CPF', 'CNPJ')),
        document varchar(14) NOT NULL UNIQUE, email varchar(254) NOT NULL UNIQUE,
        city varchar(120) NOT NULL, state varchar(2) NOT NULL CHECK (state ~ '^[A-Z]{2}$'),
        status varchar(8) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
        created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX producers_name_idx ON producers(name);
      CREATE TABLE farms (
        id_farm uuid PRIMARY KEY DEFAULT gen_random_uuid(), id_producer uuid NOT NULL REFERENCES producers(id_producer) ON DELETE CASCADE,
        name varchar(160) NOT NULL, city varchar(120) NOT NULL, state varchar(2) NOT NULL CHECK (state ~ '^[A-Z]{2}$'),
        total_area decimal(14,2) NOT NULL, agricultural_area decimal(14,2) NOT NULL, vegetation_area decimal(14,2) NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT farms_areas_check CHECK (total_area > 0 AND agricultural_area >= 0 AND vegetation_area >= 0 AND agricultural_area + vegetation_area <= total_area)
      );
      CREATE INDEX farms_producer_idx ON farms(id_producer);
      CREATE TABLE farm_area_events (
        id_farm_area_event uuid PRIMARY KEY DEFAULT gen_random_uuid(), id_farm uuid REFERENCES farms(id_farm) ON DELETE SET NULL,
        id_producer uuid NOT NULL REFERENCES producers(id_producer) ON DELETE CASCADE,
        previous_total_area decimal(14,2) NOT NULL, new_total_area decimal(14,2) NOT NULL, occurred_at timestamptz NOT NULL
      );
      CREATE INDEX farm_area_events_producer_date_idx ON farm_area_events(id_producer, occurred_at);
      CREATE TABLE harvests (
        id_harvest uuid PRIMARY KEY DEFAULT gen_random_uuid(), id_farm uuid NOT NULL REFERENCES farms(id_farm) ON DELETE CASCADE,
        year integer NOT NULL CHECK (year BETWEEN 2000 AND 2100), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT harvests_farm_year_unique UNIQUE (id_farm, year)
      );
      CREATE TABLE crops (
        id_crop uuid PRIMARY KEY DEFAULT gen_random_uuid(), name varchar(100) NOT NULL, normalized_name varchar(100) NOT NULL UNIQUE,
        created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE harvest_crops (
        id_harvest uuid NOT NULL REFERENCES harvests(id_harvest) ON DELETE CASCADE,
        id_crop uuid NOT NULL REFERENCES crops(id_crop) ON DELETE RESTRICT,
        PRIMARY KEY (id_harvest, id_crop)
      );
    `);
  }
  async down(query: QueryRunner) {
    await query.query(
      "DROP TABLE harvest_crops, crops, harvests, farm_area_events, farms, producers, sessions, users CASCADE",
    );
  }
}
