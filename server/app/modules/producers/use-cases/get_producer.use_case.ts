import { AuthorizationService } from '#core/auth/authorization.service'
import type User from '#modules/auth/user.model'
import { ProducerRepository } from '#modules/producers/producer.repository'

export class GetProducerUseCase {
  constructor(
    private repository = new ProducerRepository(),
    private authorization = new AuthorizationService()
  ) {}

  async execute(user: User, idProducer: string) {
    await this.authorization.assertCanReadProducer(user, idProducer)
    return this.repository.getSummary(idProducer)
  }
}
