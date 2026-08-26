import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { Farm } from "../../farms/entities/farm.entity.js";

export type DocumentType = "CPF" | "CNPJ";
export type ProducerStatus = "ACTIVE" | "INACTIVE";

@Entity("producers")
export class Producer {
  @PrimaryGeneratedColumn("uuid", { name: "id_producer" })
  idProducer!: string;

  @Column({ length: 160 })
  name!: string;

  @Column({ name: "document_type", type: "varchar", length: 4 })
  documentType!: DocumentType;

  @Column({ length: 14, unique: true })
  document!: string;

  @Column({ length: 254, unique: true })
  email!: string;

  @Column({ length: 120 })
  city!: string;

  @Column({ length: 2 })
  state!: string;

  @Column({ type: "varchar", length: 8, default: "ACTIVE" })
  status!: ProducerStatus;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @OneToMany(() => Farm, (farm) => farm.producer)
  farms!: Relation<Farm[]>;
}
