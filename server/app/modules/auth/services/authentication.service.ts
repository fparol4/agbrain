import type User from '#modules/auth/user.model'
import Producer from '#modules/producers/producer.model'

export class AuthenticationService {
  async serializeSession(user: User) {
    const producer = user.role === 'PRODUCER' ? await Producer.findBy('idUser', user.idUser) : null

    return {
      idUser: user.idUser,
      idProducer: producer?.idProducer,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  }
}
