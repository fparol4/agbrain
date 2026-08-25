import { ForbiddenException, NotFoundException } from '#core/errors/domain_exception'
import type User from '#modules/auth/user.model'
import Producer from '#modules/producers/producer.model'

export class AuthorizationService {
  assertAdmin(user: User) {
    if (user.role !== 'ADMIN') throw new ForbiddenException()
  }

  async assertCanReadProducer(user: User, idProducer: string) {
    if (user.role === 'ADMIN') return
    await this.assertProducerOwner(user, idProducer)
  }

  async assertCanWriteProducerResources(user: User, idProducer: string) {
    if (user.role === 'ADMIN') return
    await this.assertProducerOwner(user, idProducer)
  }

  private async assertProducerOwner(user: User, idProducer: string) {
    const producer = await Producer.findBy('idUser', user.idUser)
    if (!producer) throw new NotFoundException('Produtor')
    if (producer.idProducer !== idProducer) throw new ForbiddenException()
  }
}
