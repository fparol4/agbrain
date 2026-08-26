import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { decimalTransformer } from "../../../shared/database/decimal.transformer.js";
import { Producer } from "../../producers/entities/producer.entity.js";
import { Harvest } from "../../harvests/entities/harvest.entity.js";

@Entity("farms")
export class Farm {
  @PrimaryGeneratedColumn("uuid", { name: "id_farm" }) idFarm!: string;
  @Column({ name: "id_producer", type: "uuid" }) idProducer!: string;
  @Column({ length: 160 }) name!: string;
  @Column({ length: 120 }) city!: string;
  @Column({ length: 2 }) state!: string;
  @Column({
    name: "total_area",
    type: "decimal",
    precision: 14,
    scale: 2,
    transformer: decimalTransformer,
  })
  totalArea!: number;
  @Column({
    name: "agricultural_area",
    type: "decimal",
    precision: 14,
    scale: 2,
    transformer: decimalTransformer,
  })
  agriculturalArea!: number;
  @Column({
    name: "vegetation_area",
    type: "decimal",
    precision: 14,
    scale: 2,
    transformer: decimalTransformer,
  })
  vegetationArea!: number;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @ManyToOne(() => Producer, (producer) => producer.farms, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "id_producer" })
  producer!: Relation<Producer>;
  @OneToMany(() => Harvest, (harvest) => harvest.farm)
  harvests!: Relation<Harvest[]>;
}
