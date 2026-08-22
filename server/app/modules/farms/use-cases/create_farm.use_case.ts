import { AuthorizationService } from '#core/auth/authorization.service'
import { AuditService } from '#modules/audit/services/audit.service'
import type User from '#modules/auth/user.model'
import FarmAreaEvent from '#modules/farms/farm_area_event.model'
import Farm from '#modules/farms/farm.model'
import { FarmAreaService, type FarmAreas } from '#modules/farms/services/farm_area.service'
import db from '@adonisjs/lucid/services/db'

interface CreateFarmInput extends FarmAreas {
  name: string
  city: string
  state: string
}

export class CreateFarmUseCase {
  constructor(
    private areas = new FarmAreaService(),
    private authorization = new AuthorizationService(),
    private audit = new AuditService()
  ) {}

  async execute(actor: User, idProducer: string, input: CreateFarmInput, requestId?: string) {
    await this.authorization.assertCanWriteProducerResources(actor, idProducer)
    this.areas.assertValid(input)

    return db.transaction(async (transaction) => {
      const farm = new Farm()
      farm.useTransaction(transaction)
      farm.merge({ idProducer, ...input })
      await farm.save()

      const event = new FarmAreaEvent()
      event.useTransaction(transaction)
      event.merge({
        idFarm: farm.idFarm,
        idProducer,
        previousTotalArea: 0,
        newTotalArea: farm.totalArea,
      })
      await event.save()

      await this.audit.record({
        user: actor,
        action: 'CREATE',
        resourceType: 'FARM',
        resourceName: farm.name,
        idResource: farm.idFarm,
        requestId,
        transaction,
      })

      return farm.serialize()
    })
  }
}
