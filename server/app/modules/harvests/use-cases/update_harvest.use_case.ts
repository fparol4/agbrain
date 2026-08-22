import { AuthorizationService } from '#core/auth/authorization.service'
import { ConflictException, NotFoundException } from '#core/errors/domain_exception'
import { AuditService } from '#modules/audit/services/audit.service'
import type User from '#modules/auth/user.model'
import Farm from '#modules/farms/farm.model'
import { HarvestRepository } from '#modules/harvests/harvest.repository'
import { HarvestCropService } from '#modules/harvests/services/harvest_crop.service'
import db from '@adonisjs/lucid/services/db'

interface UpdateHarvestInput {
  idFarm?: string
  year?: number
  crops?: string[]
}

export class UpdateHarvestUseCase {
  constructor(
    private repository = new HarvestRepository(),
    private cropService = new HarvestCropService(),
    private authorization = new AuthorizationService(),
    private audit = new AuditService()
  ) {}

  async execute(actor: User, idHarvest: string, input: UpdateHarvestInput, requestId?: string) {
    const harvest = await this.repository.findOrFail(idHarvest)
    const currentFarm = await Farm.find(harvest.idFarm)
    if (!currentFarm) throw new NotFoundException('Fazenda')
    await this.authorization.assertCanWriteProducerResources(actor, currentFarm.idProducer)

    const targetFarm = input.idFarm ? await Farm.find(input.idFarm) : currentFarm
    if (!targetFarm) throw new NotFoundException('Fazenda')
    if (targetFarm.idProducer !== currentFarm.idProducer) throw new NotFoundException('Fazenda')

    const year = input.year ?? harvest.year
    if (await this.repository.existsForFarmYear(targetFarm.idFarm, year, harvest.idHarvest)) {
      throw new ConflictException('Esta fazenda já possui uma safra cadastrada para este ano.')
    }

    await db.transaction(async (transaction) => {
      harvest.useTransaction(transaction)
      harvest.merge({ idFarm: targetFarm.idFarm, year })
      await harvest.save()
      if (input.crops) await this.cropService.replace(harvest.idHarvest, input.crops, transaction)

      await this.audit.record({
        user: actor,
        action: 'UPDATE',
        resourceType: 'HARVEST',
        resourceName: `Safra ${year} — ${targetFarm.name}`,
        idResource: harvest.idHarvest,
        requestId,
        transaction,
      })
    })

    return this.repository.findWithContextOrFail(harvest.idHarvest)
  }
}
