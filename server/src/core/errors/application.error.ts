export class ApplicationError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(resource: string) {
    super(404, "E_RESOURCE_NOT_FOUND", `${resource} não encontrado.`);
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string) {
    super(409, "E_CONFLICT", message);
  }
}

export class BusinessRuleError extends ApplicationError {
  constructor(code: string, message: string) {
    super(422, code, message);
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(code = "E_UNAUTHORIZED", message = "Autenticação necessária.") {
    super(401, code, message);
  }
}
