import { AuthorizationService } from '#core/auth/authorization.service'
import type User from '#modules/auth/user.model'
import { HarvestRepository } from '#modules/harvests/harvest.repository'

export class ListAllHarvestsUseCase {
  constructor(
    private repository = new HarvestRepository(),
    private authorization = new AuthorizationService()
  ) {}

  async execute(user: User, filters: Parameters<HarvestRepository['listAll']>[0]) {
    this.authorization.assertAdmin(user)
    return this.repository.listAll(filters)
  }
}
