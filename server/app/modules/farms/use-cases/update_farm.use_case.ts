import { AuthorizationService } from '#core/auth/authorization.service'
import { AuditService } from '#modules/audit/services/audit.service'
import type User from '#modules/auth/user.model'
import FarmAreaEvent from '#modules/farms/farm_area_event.model'
import { FarmRepository } from '#modules/farms/farm.repository'
import { FarmAreaService } from '#modules/farms/services/farm_area.service'
import db from '@adonisjs/lucid/services/db'

interface UpdateFarmInput {
  name?: string
  city?: string
  state?: string
  totalArea?: number
  agriculturalArea?: number
  vegetationArea?: number
}

export class UpdateFarmUseCase {
  constructor(
    private repository = new FarmRepository(),
    private areas = new FarmAreaService(),
    private authorization = new AuthorizationService(),
    private audit = new AuditService()
  ) {}

  async execute(actor: User, idFarm: string, input: UpdateFarmInput, requestId?: string) {
    const farm = await this.repository.findOrFail(idFarm)
    await this.authorization.assertCanWriteProducerResources(actor, farm.idProducer)

    const previousTotalArea = farm.totalArea
    const nextAreas = {
      totalArea: input.totalArea ?? farm.totalArea,
      agriculturalArea: input.agriculturalArea ?? farm.agriculturalArea,
      vegetationArea: input.vegetationArea ?? farm.vegetationArea,
    }
    this.areas.assertValid(nextAreas)

    await db.transaction(async (transaction) => {
      farm.useTransaction(transaction)
      farm.merge({
        name: input.name ?? farm.name,
        city: input.city ?? farm.city,
        state: input.state ?? farm.state,
        ...nextAreas,
      })
      await farm.save()

      if (previousTotalArea !== farm.totalArea) {
        const event = new FarmAreaEvent()
        event.useTransaction(transaction)
        event.merge({
          idFarm: farm.idFarm,
          idProducer: farm.idProducer,
          previousTotalArea,
          newTotalArea: farm.totalArea,
        })
        await event.save()
      }

      await this.audit.record({
        user: actor,
        action: 'UPDATE',
        resourceType: 'FARM',
        resourceName: farm.name,
        idResource: farm.idFarm,
        requestId,
        transaction,
      })
    })

    return farm.serialize()
  }
}
