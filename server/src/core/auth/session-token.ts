import type { Request } from "express";
import { settings } from "../../settings/environment.js";

export function sessionToken(request: Request) {
  const cookies = request.headers.cookie?.split(";") ?? [];
  const prefix = `${settings.sessionCookie}=`;
  const cookie = cookies
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix));
  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : undefined;
}
