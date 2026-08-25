import vine from '@vinejs/vine'

const year = vine.number().min(2000).max(2100)
const crops = vine.array(vine.string().trim().minLength(2).maxLength(100)).maxLength(30)

export const createHarvestValidator = vine.create(
  vine.object({
    year,
    crops,
  })
)

export const updateHarvestValidator = vine.create(
  vine.object({
    idFarm: vine.string().uuid().optional(),
    year: year.optional(),
    crops: crops.optional(),
  })
)

export const harvestListValidator = vine.create(
  vine.object({
    idFarm: vine.string().uuid().optional(),
    year: year.optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export const adminHarvestListValidator = vine.create(
  vine.object({
    idProducer: vine.string().uuid().optional(),
    idFarm: vine.string().uuid().optional(),
    year: year.optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)
