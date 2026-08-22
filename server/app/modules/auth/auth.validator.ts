import vine from '@vinejs/vine'

export const loginValidator = vine.create(
  vine.object({
    email: vine.string().trim().toLowerCase().email(),
    password: vine.string().minLength(7).maxLength(128),
  })
)
