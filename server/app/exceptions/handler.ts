import app from '@adonisjs/core/services/app'
import { ExceptionHandler, type HttpContext } from '@adonisjs/core/http'
import { DomainException } from '#core/errors/domain_exception'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * Status pages are used to display a custom HTML pages for certain error
   * codes. You might want to enable them in production only, but feel
   * free to enable them in development as well.
   */
  protected renderStatusPages = app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    if (error instanceof DomainException) {
      return ctx.response.status(error.status).send({
        error: {
          code: error.code,
          message: error.message,
        },
        requestId: ctx.request.id(),
      })
    }

    const errorCode = this.getErrorCode(error)

    if (errorCode === 'E_UNAUTHORIZED_ACCESS') {
      return ctx.response.unauthorized({
        error: {
          code: 'E_UNAUTHORIZED',
          message: 'Autenticação necessária.',
        },
        requestId: ctx.request.id(),
      })
    }

    if (errorCode === 'E_VALIDATION_ERROR') {
      return ctx.response.unprocessableEntity({
        error: {
          code: 'E_VALIDATION_ERROR',
          message: 'Os dados informados são inválidos.',
          details: this.getValidationMessages(error),
        },
        requestId: ctx.request.id(),
      })
    }

    if (errorCode === '23505') {
      return ctx.response.conflict({
        error: {
          code: 'E_CONFLICT',
          message: 'Já existe um registro com esses dados.',
        },
        requestId: ctx.request.id(),
      })
    }

    if (errorCode === '23514' || errorCode === '23503') {
      return ctx.response.unprocessableEntity({
        error: {
          code: 'E_INVALID_RELATION',
          message: 'Os dados informados violam uma regra de integridade.',
        },
        requestId: ctx.request.id(),
      })
    }

    return super.handle(error, ctx)
  }

  private getErrorCode(error: unknown) {
    if (!error || typeof error !== 'object' || !('code' in error)) return undefined
    const code = Reflect.get(error, 'code')
    return typeof code === 'string' ? code : undefined
  }

  private getValidationMessages(error: unknown) {
    if (!error || typeof error !== 'object' || !('messages' in error)) return []
    const messages = Reflect.get(error, 'messages')
    return Array.isArray(messages) ? messages : []
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
