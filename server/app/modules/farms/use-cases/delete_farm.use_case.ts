import { AuthorizationService } from '#core/auth/authorization.service'
import { AuditService } from '#modules/audit/services/audit.service'
import type User from '#modules/auth/user.model'
import FarmAreaEvent from '#modules/farms/farm_area_event.model'
import { FarmRepository } from '#modules/farms/farm.repository'
import db from '@adonisjs/lucid/services/db'

export class DeleteFarmUseCase {
  constructor(
    private repository = new FarmRepository(),
    private authorization = new AuthorizationService(),
    private audit = new AuditService()
  ) {}

  async execute(actor: User, idFarm: string, requestId?: string) {
    const farm = await this.repository.findOrFail(idFarm)
    await this.authorization.assertCanWriteProducerResources(actor, farm.idProducer)

    await db.transaction(async (transaction) => {
      const event = new FarmAreaEvent()
      event.useTransaction(transaction)
      event.merge({
        idFarm: farm.idFarm,
        idProducer: farm.idProducer,
        previousTotalArea: farm.totalArea,
        newTotalArea: 0,
      })
      await event.save()

      await this.audit.record({
        user: actor,
        action: 'DELETE',
        resourceType: 'FARM',
        resourceName: farm.name,
        idResource: farm.idFarm,
        requestId,
        transaction,
      })

      farm.useTransaction(transaction)
      await farm.delete()
    })
  }
}
