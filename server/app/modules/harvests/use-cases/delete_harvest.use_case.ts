import { AuthorizationService } from '#core/auth/authorization.service'
import { NotFoundException } from '#core/errors/domain_exception'
import { AuditService } from '#modules/audit/services/audit.service'
import type User from '#modules/auth/user.model'
import Farm from '#modules/farms/farm.model'
import { HarvestRepository } from '#modules/harvests/harvest.repository'
import db from '@adonisjs/lucid/services/db'

export class DeleteHarvestUseCase {
  constructor(
    private repository = new HarvestRepository(),
    private authorization = new AuthorizationService(),
    private audit = new AuditService()
  ) {}

  async execute(actor: User, idHarvest: string, requestId?: string) {
    const harvest = await this.repository.findOrFail(idHarvest)
    const farm = await Farm.find(harvest.idFarm)
    if (!farm) throw new NotFoundException('Fazenda')
    await this.authorization.assertCanWriteProducerResources(actor, farm.idProducer)

    await db.transaction(async (transaction) => {
      await this.audit.record({
        user: actor,
        action: 'DELETE',
        resourceType: 'HARVEST',
        resourceName: `Safra ${harvest.year} — ${farm.name}`,
        idResource: harvest.idHarvest,
        requestId,
        transaction,
      })
      harvest.useTransaction(transaction)
      await harvest.delete()
    })
  }
}
