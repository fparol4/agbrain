import { Injectable } from "@nestjs/common";
import {
  randomBytes,
  scrypt as callbackScrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(callbackScrypt);

@Injectable()
export class PasswordService {
  async hash(password: string) {
    const salt = randomBytes(16).toString("hex");
    const hash = (await scrypt(password, salt, 64)) as Buffer;
    return `scrypt$${salt}$${hash.toString("hex")}`;
  }

  async verify(password: string, encoded: string) {
    const [algorithm, salt, stored] = encoded.split("$");
    if (algorithm !== "scrypt" || !salt || !stored) return false;
    const candidate = (await scrypt(password, salt, 64)) as Buffer;
    const expected = Buffer.from(stored, "hex");
    return (
      candidate.length === expected.length &&
      timingSafeEqual(candidate, expected)
    );
  }
}
