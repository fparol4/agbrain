import vine from '@vinejs/vine'

export const auditListValidator = vine.create(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
    idUser: vine.string().uuid().optional(),
    action: vine
      .enum(['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'VIEW_DASHBOARD'] as const)
      .optional(),
    from: vine.date({ formats: ['YYYY-MM-DD'] }).optional(),
    to: vine.date({ formats: ['YYYY-MM-DD'] }).optional(),
  })
)
