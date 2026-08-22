import { DomainException } from '#core/errors/domain_exception'
import User from '#modules/auth/user.model'

interface LoginInput {
  email: string
  password: string
}

export class LoginUseCase {
  async execute({ email, password }: LoginInput) {
    try {
      const user = await User.verifyCredentials(email, password)
      if (user.status !== 'ACTIVE') throw new Error('Inactive user')
      return user
    } catch {
      throw new DomainException('E-mail ou senha inválidos.', 401, 'E_INVALID_CREDENTIALS')
    }
  }
}
