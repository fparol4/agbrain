import vine from '@vinejs/vine'

const producerFields = {
  name: vine.string().trim().minLength(2).maxLength(160),
  documentType: vine.enum(['CPF', 'CNPJ'] as const),
  document: vine.string().trim().minLength(11).maxLength(18),
  email: vine.string().trim().toLowerCase().email().maxLength(254),
  city: vine.string().trim().minLength(2).maxLength(120),
  state: vine.string().trim().toUpperCase().fixedLength(2),
  status: vine.enum(['ACTIVE', 'INACTIVE'] as const),
}

export const createProducerValidator = vine.create(
  vine.object({
    ...producerFields,
    password: vine.string().minLength(7).maxLength(128).optional(),
  })
)

export const updateProducerValidator = vine.create(
  vine.object({
    name: producerFields.name.optional(),
    documentType: producerFields.documentType.optional(),
    document: producerFields.document.optional(),
    email: producerFields.email.optional(),
    city: producerFields.city.optional(),
    state: producerFields.state.optional(),
    status: producerFields.status.optional(),
  })
)

export const producerListValidator = vine.create(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
    search: vine.string().trim().maxLength(160).optional(),
    status: vine.enum(['ACTIVE', 'INACTIVE'] as const).optional(),
  })
)
