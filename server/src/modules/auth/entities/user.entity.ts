import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { Session } from "./session.entity.js";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid", { name: "id_user" })
  idUser!: string;

  @Column({ length: 160 })
  name!: string;

  @Column({ length: 254, unique: true })
  email!: string;

  @Column({ name: "password_hash" })
  passwordHash!: string;

  @Column({ default: true })
  active!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @OneToMany(() => Session, (session) => session.user)
  sessions!: Relation<Session[]>;
}
