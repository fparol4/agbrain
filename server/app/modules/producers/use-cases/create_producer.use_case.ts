import { AuthorizationService } from '#core/auth/authorization.service'
import { ConflictException } from '#core/errors/domain_exception'
import { AuditService } from '#modules/audit/services/audit.service'
import User, { type UserStatus } from '#modules/auth/user.model'
import Producer, { type DocumentType } from '#modules/producers/producer.model'
import { ProducerRepository } from '#modules/producers/producer.repository'
import { ProducerDocumentService } from '#modules/producers/services/producer_document.service'
import db from '@adonisjs/lucid/services/db'

interface CreateProducerInput {
  name: string
  documentType: DocumentType
  document: string
  email: string
  city: string
  state: string
  status: UserStatus
  password?: string
}

export class CreateProducerUseCase {
  constructor(
    private repository = new ProducerRepository(),
    private documents = new ProducerDocumentService(),
    private authorization = new AuthorizationService(),
    private audit = new AuditService()
  ) {}

  async execute(actor: User, input: CreateProducerInput, requestId?: string) {
    this.authorization.assertAdmin(actor)
    const document = this.documents.normalizeAndValidate(input.documentType, input.document)

    if (await this.repository.documentExists(document)) {
      throw new ConflictException('Já existe um produtor cadastrado com este documento.')
    }
    if (await this.repository.emailExists(input.email)) {
      throw new ConflictException('Já existe um usuário cadastrado com este e-mail.')
    }

    const producer = await db.transaction(async (transaction) => {
      const user = new User()
      user.useTransaction(transaction)
      user.merge({
        name: input.name,
        email: input.email,
        password: input.password ?? 'demo123',
        role: 'PRODUCER',
        status: input.status,
      })
      await user.save()

      const created = new Producer()
      created.useTransaction(transaction)
      created.merge({
        idUser: user.idUser,
        name: input.name,
        documentType: input.documentType,
        document,
        city: input.city,
        state: input.state,
      })
      await created.save()

      await this.audit.record({
        user: actor,
        action: 'CREATE',
        resourceType: 'PRODUCER',
        resourceName: created.name,
        idResource: created.idProducer,
        requestId,
        transaction,
      })

      return created
    })

    return this.repository.getSummary(producer.idProducer)
  }
}
