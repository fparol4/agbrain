import { DomainException } from '#core/errors/domain_exception'

export interface FarmAreas {
  totalArea: number
  agriculturalArea: number
  vegetationArea: number
}

export class FarmAreaService {
  assertValid(areas: FarmAreas) {
    if (areas.totalArea <= 0) {
      throw new DomainException('A área total deve ser maior que zero.', 422, 'E_INVALID_FARM_AREA')
    }
    if (areas.agriculturalArea < 0 || areas.vegetationArea < 0) {
      throw new DomainException('As áreas não podem ser negativas.', 422, 'E_INVALID_FARM_AREA')
    }
    if (areas.agriculturalArea + areas.vegetationArea > areas.totalArea) {
      throw new DomainException(
        'A soma das áreas não pode ultrapassar a área total.',
        422,
        'E_INVALID_FARM_AREA'
      )
    }
  }
}
