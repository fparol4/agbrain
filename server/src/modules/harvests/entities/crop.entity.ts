import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { Harvest } from "./harvest.entity.js";

@Entity("crops")
export class Crop {
  @PrimaryGeneratedColumn("uuid", { name: "id_crop" }) idCrop!: string;
  @Column({ length: 100 }) name!: string;
  @Column({ name: "normalized_name", length: 100, unique: true })
  normalizedName!: string;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
  @ManyToMany(() => Harvest, (harvest) => harvest.crops)
  harvests!: Relation<Harvest[]>;
}
