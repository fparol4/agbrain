import { AuthorizationService } from '#core/auth/authorization.service'
import type User from '#modules/auth/user.model'
import { ProducerRepository } from '#modules/producers/producer.repository'

export class ListProducersUseCase {
  constructor(
    private repository = new ProducerRepository(),
    private authorization = new AuthorizationService()
  ) {}

  async execute(user: User, filters: Parameters<ProducerRepository['list']>[0]) {
    this.authorization.assertAdmin(user)
    return this.repository.list(filters)
  }
}
