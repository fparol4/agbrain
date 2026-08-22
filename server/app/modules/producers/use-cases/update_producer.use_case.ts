import { AuthorizationService } from '#core/auth/authorization.service'
import { ConflictException } from '#core/errors/domain_exception'
import { AuditService } from '#modules/audit/services/audit.service'
import type User from '#modules/auth/user.model'
import type { UserStatus } from '#modules/auth/user.model'
import type { DocumentType } from '#modules/producers/producer.model'
import { ProducerRepository } from '#modules/producers/producer.repository'
import { ProducerDocumentService } from '#modules/producers/services/producer_document.service'
import db from '@adonisjs/lucid/services/db'

interface UpdateProducerInput {
  name?: string
  documentType?: DocumentType
  document?: string
  email?: string
  city?: string
  state?: string
  status?: UserStatus
}

export class UpdateProducerUseCase {
  constructor(
    private repository = new ProducerRepository(),
    private documents = new ProducerDocumentService(),
    private authorization = new AuthorizationService(),
    private audit = new AuditService()
  ) {}

  async execute(actor: User, idProducer: string, input: UpdateProducerInput, requestId?: string) {
    this.authorization.assertAdmin(actor)
    const producer = await this.repository.findOrFail(idProducer)
    const user = await this.repository.findUserOrFail(producer.idUser)

    const documentType = input.documentType ?? producer.documentType
    const document = input.document
      ? this.documents.normalizeAndValidate(documentType, input.document)
      : producer.document

    if (await this.repository.documentExists(document, producer.idProducer)) {
      throw new ConflictException('Já existe um produtor cadastrado com este documento.')
    }
    if (input.email && (await this.repository.emailExists(input.email, user.idUser))) {
      throw new ConflictException('Já existe um usuário cadastrado com este e-mail.')
    }

    await db.transaction(async (transaction) => {
      producer.useTransaction(transaction)
      producer.merge({
        name: input.name ?? producer.name,
        documentType,
        document,
        city: input.city ?? producer.city,
        state: input.state ?? producer.state,
      })
      await producer.save()

      user.useTransaction(transaction)
      user.merge({
        name: input.name ?? user.name,
        email: input.email ?? user.email,
        status: input.status ?? user.status,
      })
      await user.save()

      await this.audit.record({
        user: actor,
        action: 'UPDATE',
        resourceType: 'PRODUCER',
        resourceName: producer.name,
        idResource: producer.idProducer,
        requestId,
        transaction,
      })
    })

    return this.repository.getSummary(idProducer)
  }
}
