import { AuthorizationService } from '#core/auth/authorization.service'
import { AuditService } from '#modules/audit/services/audit.service'
import type User from '#modules/auth/user.model'
import { ProducerRepository } from '#modules/producers/producer.repository'
import db from '@adonisjs/lucid/services/db'

export class DeleteProducerUseCase {
  constructor(
    private repository = new ProducerRepository(),
    private authorization = new AuthorizationService(),
    private audit = new AuditService()
  ) {}

  async execute(actor: User, idProducer: string, requestId?: string) {
    this.authorization.assertAdmin(actor)
    const producer = await this.repository.findOrFail(idProducer)
    const user = await this.repository.findUserOrFail(producer.idUser)

    await db.transaction(async (transaction) => {
      await this.audit.record({
        user: actor,
        action: 'DELETE',
        resourceType: 'PRODUCER',
        resourceName: producer.name,
        idResource: producer.idProducer,
        requestId,
        transaction,
      })
      user.useTransaction(transaction)
      await user.delete()
    })
  }
}
