import { AuthorizationService } from '#core/auth/authorization.service'
import { AuditService } from '#modules/audit/services/audit.service'
import type User from '#modules/auth/user.model'
import { DashboardQueryService } from '#modules/dashboard/services/dashboard_query.service'

export class GetProducerDashboardUseCase {
  constructor(
    private dashboard = new DashboardQueryService(),
    private authorization = new AuthorizationService(),
    private audit = new AuditService()
  ) {}

  async execute(actor: User, idProducer: string, year?: number, requestId?: string) {
    await this.authorization.assertCanReadProducer(actor, idProducer)
    const result = await this.dashboard.execute(idProducer, year)

    await this.audit.record({
      user: actor,
      action: 'VIEW_DASHBOARD',
      resourceType: 'DASHBOARD',
      resourceName: result.producerName,
      idResource: idProducer,
      requestId,
      metadata: { year: result.year },
    })

    return result
  }
}
