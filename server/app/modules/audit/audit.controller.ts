import { auditListValidator } from '#modules/audit/audit.validator'
import { ListAuditEventsUseCase } from '#modules/audit/use-cases/list_audit_events.use_case'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuditController {
  async index({ request, response, auth }: HttpContext) {
    const filters = await request.validateUsing(auditListValidator)
    const result = await new ListAuditEventsUseCase().execute(auth.getUserOrFail(), filters)
    return response.ok(result)
  }
}
