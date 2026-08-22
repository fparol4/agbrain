import Audit, { type AuditAction } from '#modules/audit/audit.model'
import { normalizePagination, type PaginationInput } from '#shared/pagination/pagination'
import { DateTime } from 'luxon'

interface AuditFilters extends PaginationInput {
  idUser?: string
  action?: AuditAction
  from?: Date
  to?: Date
}

export class AuditRepository {
  async list(filters: AuditFilters) {
    const { page, limit } = normalizePagination(filters)
    const query = Audit.query().orderBy('occurredAt', 'desc')

    if (filters.idUser) query.where('idUser', filters.idUser)
    if (filters.action) query.where('action', filters.action)
    if (filters.from)
      query.where('occurredAt', '>=', DateTime.fromJSDate(filters.from).startOf('day').toSQL()!)
    if (filters.to)
      query.where('occurredAt', '<=', DateTime.fromJSDate(filters.to).endOf('day').toSQL()!)

    const result = await query.paginate(page, limit)
    return {
      data: result.all().map((audit) => audit.serialize()),
      meta: result.getMeta(),
    }
  }
}
