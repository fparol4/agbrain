import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { decimalTransformer } from "../../../shared/database/decimal.transformer.js";
import { Producer } from "../../producers/entities/producer.entity.js";
import { Farm } from "./farm.entity.js";

@Entity("farm_area_events")
export class FarmAreaEvent {
  @PrimaryGeneratedColumn("uuid", { name: "id_farm_area_event" })
  idFarmAreaEvent!: string;
  @Column({ name: "id_farm", type: "uuid", nullable: true }) idFarm!:
    string | null;
  @Column({ name: "id_producer", type: "uuid" }) idProducer!: string;
  @Column({
    name: "previous_total_area",
    type: "decimal",
    precision: 14,
    scale: 2,
    transformer: decimalTransformer,
  })
  previousTotalArea!: number;
  @Column({
    name: "new_total_area",
    type: "decimal",
    precision: 14,
    scale: 2,
    transformer: decimalTransformer,
  })
  newTotalArea!: number;
  @Column({ name: "occurred_at", type: "timestamptz" }) occurredAt!: Date;

  @ManyToOne(() => Farm, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "id_farm" })
  farm!: Relation<Farm> | null;
  @ManyToOne(() => Producer, { onDelete: "CASCADE" })
  @JoinColumn({ name: "id_producer" })
  producer!: Relation<Producer>;
}
