import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { Farm } from "../../farms/entities/farm.entity.js";
import { Crop } from "./crop.entity.js";

@Entity("harvests")
@Unique("harvests_farm_year_unique", ["idFarm", "year"])
export class Harvest {
  @PrimaryGeneratedColumn("uuid", { name: "id_harvest" }) idHarvest!: string;
  @Column({ name: "id_farm", type: "uuid" }) idFarm!: string;
  @Column({ type: "integer" }) year!: number;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
  @ManyToOne(() => Farm, (farm) => farm.harvests, { onDelete: "CASCADE" })
  @JoinColumn({ name: "id_farm" })
  farm!: Relation<Farm>;
  @ManyToMany(() => Crop, (crop) => crop.harvests)
  @JoinTable({
    name: "harvest_crops",
    joinColumn: { name: "id_harvest" },
    inverseJoinColumn: { name: "id_crop" },
  })
  crops!: Relation<Crop[]>;
}
