import { z } from "zod";

export interface User {
  idUser: string;
  name: string;
  email: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const loginSchema: z.ZodType<LoginInput> = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres."),
});
