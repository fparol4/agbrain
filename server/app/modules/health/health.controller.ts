import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class HealthController {
  async show({ response }: HttpContext) {
    try {
      await db.rawQuery('select 1')

      return response.ok({
        status: 'ok',
        checks: { database: 'up' },
        timestamp: new Date().toISOString(),
      })
    } catch {
      return response.serviceUnavailable({
        status: 'error',
        checks: { database: 'down' },
        timestamp: new Date().toISOString(),
      })
    }
  }
}
