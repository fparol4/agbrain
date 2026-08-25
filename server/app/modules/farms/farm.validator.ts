import vine from '@vinejs/vine'

const name = vine.string().trim().minLength(2).maxLength(160)
const city = vine.string().trim().minLength(2).maxLength(120)
const state = vine.string().trim().toUpperCase().fixedLength(2)
const area = vine.number().min(0)

export const createFarmValidator = vine.create(
  vine.object({
    name,
    city,
    state,
    totalArea: vine.number().positive(),
    agriculturalArea: area,
    vegetationArea: area,
  })
)

export const updateFarmValidator = vine.create(
  vine.object({
    name: name.optional(),
    city: city.optional(),
    state: state.optional(),
    totalArea: vine.number().positive().optional(),
    agriculturalArea: area.optional(),
    vegetationArea: area.optional(),
  })
)

export const farmListValidator = vine.create(
  vine.object({
    search: vine.string().trim().maxLength(160).optional(),
    state: state.optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export const adminFarmListValidator = vine.create(
  vine.object({
    idProducer: vine.string().uuid().optional(),
    search: vine.string().trim().maxLength(160).optional(),
    state: state.optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)
