import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { createHash, randomBytes } from "node:crypto";
import { Repository } from "typeorm";
import { settings } from "../../settings/environment.js";
import { Session } from "./entities/session.entity.js";
import { User } from "./entities/user.entity.js";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Session) private readonly sessions: Repository<Session>,
  ) {}

  findUserByEmail(email: string) {
    return this.users.findOneBy({
      email: email.trim().toLowerCase(),
      active: true,
    });
  }

  async createSession(user: User) {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(
      Date.now() + settings.sessionTtlHours * 60 * 60 * 1000,
    );
    await this.sessions.save({
      idSession: this.tokenId(token),
      idUser: user.idUser,
      expiresAt,
    });
    return { token, expiresAt };
  }

  async userFromToken(token?: string) {
    if (!token) return null;
    const session = await this.sessions.findOne({
      where: { idSession: this.tokenId(token) },
      relations: { user: true },
    });
    if (!session || session.expiresAt <= new Date() || !session.user.active) {
      if (session) await this.sessions.delete(session.idSession);
      return null;
    }
    return session.user;
  }

  async deleteSession(token?: string) {
    if (token) await this.sessions.delete(this.tokenId(token));
  }

  serialize(user: User) {
    return { idUser: user.idUser, name: user.name, email: user.email };
  }

  private tokenId(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }
}
