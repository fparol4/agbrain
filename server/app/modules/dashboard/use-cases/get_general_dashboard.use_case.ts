import { AuthorizationService } from '#core/auth/authorization.service'
import { AuditService } from '#modules/audit/services/audit.service'
import type User from '#modules/auth/user.model'
import { DashboardQueryService } from '#modules/dashboard/services/dashboard_query.service'

export class GetGeneralDashboardUseCase {
  constructor(
    private dashboard = new DashboardQueryService(),
    private authorization = new AuthorizationService(),
    private audit = new AuditService()
  ) {}

  async execute(actor: User, year?: number, requestId?: string) {
    this.authorization.assertAdmin(actor)
    const result = await this.dashboard.executeGeneral(year)
    await this.audit.record({
      user: actor,
      action: 'VIEW_DASHBOARD',
      resourceType: 'DASHBOARD',
      resourceName: 'Visão geral',
      requestId,
      metadata: { year: result.year, scope: result.scope },
    })
    return result
  }
}
