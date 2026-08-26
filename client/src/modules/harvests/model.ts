import { z } from "zod";

export interface Crop {
  idCrop: string;
  name: string;
}

export interface Harvest {
  idHarvest: string;
  idFarm: string;
  idProducer?: string;
  farmName?: string;
  producerName?: string;
  year: number;
  crops: Crop[];
}

export interface HarvestFormInput {
  idFarm: string;
  year: number;
  crops: string;
}

export interface HarvestInput {
  idFarm: string;
  year: number;
  crops: string[];
}

export interface ListHarvestsParams {
  idProducer?: string;
  idFarm?: string;
  year?: number;
  page?: number;
  limit?: number;
}

export function normalizeCrops(raw: string): string[] {
  const seen = new Set<string>();
  return raw
    .split(/[,\n]/)
    .map((name) => name.trim())
    .filter(Boolean)
    .filter((name) => {
      const key = name.toLocaleLowerCase("pt-BR");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 30);
}

export const harvestSchema: z.ZodType<HarvestFormInput> = z.object({
  idFarm: z.string().uuid("Fazenda é obrigatória."),
  year: z.coerce.number().int().min(2000).max(2100),
  crops: z
    .string()
    .min(1, "Pelo menos uma cultura é obrigatória.")
    .refine((value) => normalizeCrops(value).length > 0, {
      message: "Informe ao menos uma cultura.",
    })
    .refine((value) => normalizeCrops(value).every((crop) => crop.length <= 100), {
      message: "Nome de cultura não pode exceder 100 caracteres.",
    }),
});
