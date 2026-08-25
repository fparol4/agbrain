import { AuthorizationService } from '#core/auth/authorization.service'
import type User from '#modules/auth/user.model'
import { FarmRepository } from '#modules/farms/farm.repository'

export class ListAllFarmsUseCase {
  constructor(
    private repository = new FarmRepository(),
    private authorization = new AuthorizationService()
  ) {}

  async execute(user: User, filters: Parameters<FarmRepository['listAll']>[0]) {
    this.authorization.assertAdmin(user)
    return this.repository.listAll(filters)
  }
}
