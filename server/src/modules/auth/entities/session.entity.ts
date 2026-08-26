import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import type { Relation } from "typeorm";
import { User } from "./user.entity.js";

@Entity("sessions")
export class Session {
  @PrimaryColumn({ name: "id_session", length: 64 })
  idSession!: string;

  @Column({ name: "id_user", type: "uuid" })
  idUser!: string;

  @Column({ name: "expires_at", type: "timestamptz" })
  expiresAt!: Date;

  @ManyToOne(() => User, (user) => user.sessions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "id_user" })
  user!: Relation<User>;
}
