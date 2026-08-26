import { api } from "@/shared/api/client";
import type { LoginInput, User } from "./model";

export async function getSession(): Promise<User> {
  return (await api.get<{ user: User }>("/api/v1/auth/me")).user;
}

export async function login(input: LoginInput): Promise<User> {
  return (await api.post<{ user: User }>("/api/v1/auth/login", input)).user;
}

export function logout(): Promise<void> {
  return api.delete("/api/v1/auth/session");
}
