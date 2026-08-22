import { AuthorizationService } from '#core/auth/authorization.service'
import type User from '#modules/auth/user.model'
import { HarvestRepository } from '#modules/harvests/harvest.repository'

export class ListHarvestsUseCase {
  constructor(
    private repository = new HarvestRepository(),
    private authorization = new AuthorizationService()
  ) {}

  async execute(user: User, idProducer: string, filters: Parameters<HarvestRepository['list']>[1]) {
    await this.authorization.assertCanReadProducer(user, idProducer)
    return this.repository.list(idProducer, filters)
  }
}
