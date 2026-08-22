import { AuthorizationService } from '#core/auth/authorization.service'
import { AuditRepository } from '#modules/audit/audit.repository'
import type User from '#modules/auth/user.model'

export class ListAuditEventsUseCase {
  constructor(
    private repository = new AuditRepository(),
    private authorization = new AuthorizationService()
  ) {}

  async execute(user: User, filters: Parameters<AuditRepository['list']>[0]) {
    this.authorization.assertAdmin(user)
    return this.repository.list(filters)
  }
}
