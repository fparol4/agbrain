import { AuthorizationService } from '#core/auth/authorization.service'
import { ConflictException, NotFoundException } from '#core/errors/domain_exception'
import { AuditService } from '#modules/audit/services/audit.service'
import type User from '#modules/auth/user.model'
import Farm from '#modules/farms/farm.model'
import Harvest from '#modules/harvests/harvest.model'
import { HarvestRepository } from '#modules/harvests/harvest.repository'
import { HarvestCropService } from '#modules/harvests/services/harvest_crop.service'
import db from '@adonisjs/lucid/services/db'

interface CreateHarvestInput {
  year: number
  crops: string[]
}

export class CreateHarvestUseCase {
  constructor(
    private repository = new HarvestRepository(),
    private cropService = new HarvestCropService(),
    private authorization = new AuthorizationService(),
    private audit = new AuditService()
  ) {}

  async execute(actor: User, idFarm: string, input: CreateHarvestInput, requestId?: string) {
    const farm = await Farm.find(idFarm)
    if (!farm) throw new NotFoundException('Fazenda')
    await this.authorization.assertCanWriteProducerResources(actor, farm.idProducer)

    if (await this.repository.existsForFarmYear(idFarm, input.year)) {
      throw new ConflictException('Esta fazenda já possui uma safra cadastrada para este ano.')
    }

    const harvest = await db.transaction(async (transaction) => {
      const created = new Harvest()
      created.useTransaction(transaction)
      created.merge({ idFarm, year: input.year })
      await created.save()
      await this.cropService.replace(created.idHarvest, input.crops, transaction)

      await this.audit.record({
        user: actor,
        action: 'CREATE',
        resourceType: 'HARVEST',
        resourceName: `Safra ${created.year} — ${farm.name}`,
        idResource: created.idHarvest,
        requestId,
        transaction,
      })
      return created
    })

    return this.repository.findWithContextOrFail(harvest.idHarvest)
  }
}
