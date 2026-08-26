import { Injectable } from "@nestjs/common";

@Injectable()
export class CropNormalizationService {
  normalize(values: string[]) {
    const crops = new Map<string, { name: string; normalizedName: string }>();
    for (const value of values) {
      const name = value.trim().replace(/\s+/g, " ");
      if (!name) continue;
      const normalizedName = name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-BR");
      crops.set(normalizedName, { name, normalizedName });
    }
    return [...crops.values()];
  }
}
