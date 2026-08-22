export interface NormalizedCrop {
  name: string
  normalizedName: string
}

export class CropNormalizationService {
  normalize(values: string[]) {
    const crops = new Map<string, NormalizedCrop>()

    for (const value of values) {
      const name = value.trim().replace(/\s+/g, ' ')
      if (!name) continue
      const normalizedName = name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('pt-BR')
      crops.set(normalizedName, { name, normalizedName })
    }

    return [...crops.values()]
  }
}
