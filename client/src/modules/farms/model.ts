import { z } from "zod";

export interface Farm {
  idFarm: string;
  idProducer: string;
  producerName?: string;
  name: string;
  city: string;
  state: string;
  totalArea: number;
  agriculturalArea: number;
  vegetationArea: number;
  createdAt: string;
  updatedAt: string;
}

export interface FarmInput {
  idProducer: string;
  name: string;
  city: string;
  state: string;
  totalArea: number;
  agriculturalArea: number;
  vegetationArea: number;
}

export interface ListFarmsParams {
  idProducer?: string;
  page?: number;
  limit?: number;
  search?: string;
  state?: string;
}

export const farmSchema: z.ZodType<FarmInput> = z
  .object({
    idProducer: z.string().uuid("Produtor é obrigatório."),
    name: z.string().min(1, "Nome é obrigatório.").max(160),
    city: z.string().min(1, "Cidade é obrigatória.").max(120),
    state: z.string().length(2, "Estado deve ter 2 caracteres."),
    totalArea: z.coerce.number().positive("Área total deve ser positiva."),
    agriculturalArea: z.coerce.number().min(0, "Área agricultável não pode ser negativa."),
    vegetationArea: z.coerce.number().min(0, "Área de vegetação não pode ser negativa."),
  })
  .superRefine((input, context) => {
    if (input.agriculturalArea + input.vegetationArea > input.totalArea) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Soma das áreas excede a área total.",
        path: ["agriculturalArea"],
      });
    }
  });
