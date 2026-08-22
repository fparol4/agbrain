import { AuthorizationService } from '#core/auth/authorization.service'
import type User from '#modules/auth/user.model'
import { FarmRepository } from '#modules/farms/farm.repository'

export class ListFarmsUseCase {
  constructor(
    private repository = new FarmRepository(),
    private authorization = new AuthorizationService()
  ) {}

  async execute(user: User, idProducer: string, filters: Parameters<FarmRepository['list']>[1]) {
    await this.authorization.assertCanReadProducer(user, idProducer)
    return this.repository.list(idProducer, filters)
  }
}
