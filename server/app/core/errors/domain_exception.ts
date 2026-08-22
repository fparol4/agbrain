import { Exception } from '@adonisjs/core/exceptions'

export class DomainException extends Exception {
  constructor(message: string, status: number, code: string) {
    super(message, { status, code })
  }
}

export class NotFoundException extends DomainException {
  constructor(resource: string) {
    super(`${resource} não encontrado.`, 404, 'E_RESOURCE_NOT_FOUND')
  }
}

export class ForbiddenException extends DomainException {
  constructor() {
    super('Você não possui permissão para executar esta ação.', 403, 'E_FORBIDDEN')
  }
}

export class ConflictException extends DomainException {
  constructor(message: string) {
    super(message, 409, 'E_CONFLICT')
  }
}
