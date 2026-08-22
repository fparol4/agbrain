import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RequestLoggerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const startedAt = performance.now()

    try {
      return await next()
    } finally {
      const user = ctx.auth?.user
      ctx.logger.info({
        requestId: ctx.request.id(),
        idUser: user?.idUser,
        method: ctx.request.method(),
        path: ctx.request.url(),
        status: ctx.response.getStatus(),
        durationMs: Number((performance.now() - startedAt).toFixed(2)),
      })
    }
  }
}
