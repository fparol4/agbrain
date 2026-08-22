import { AuthorizationService } from '#core/auth/authorization.service'
import type User from '#modules/auth/user.model'
import { FarmRepository } from '#modules/farms/farm.repository'

export class GetFarmUseCase {
  constructor(
    private repository = new FarmRepository(),
    private authorization = new AuthorizationService()
  ) {}

  async execute(user: User, idFarm: string) {
    const farm = await this.repository.findOrFail(idFarm)
    await this.authorization.assertCanReadProducer(user, farm.idProducer)
    return farm.serialize()
  }
}
