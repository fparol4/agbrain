import vine from '@vinejs/vine'

export const dashboardValidator = vine.create(
  vine.object({
    year: vine.number().min(2000).max(2100).optional(),
  })
)
