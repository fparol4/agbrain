import { createId } from '#shared/ids/id'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { UserRole } from '#modules/auth/user.model'

export type AuditAction = 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW_DASHBOARD'

export default class Audit extends BaseModel {
  static table = 'audit_logs'

  @column({ isPrimary: true, columnName: 'id_audit' })
  declare idAudit: string

  @column({ columnName: 'id_user' })
  declare idUser: string | null

  @column({ columnName: 'user_name' })
  declare userName: string

  @column({ columnName: 'user_role' })
  declare userRole: UserRole

  @column()
  declare action: AuditAction

  @column({ columnName: 'resource_type' })
  declare resourceType: string

  @column({ columnName: 'resource_name' })
  declare resourceName: string

  @column({ columnName: 'id_resource' })
  declare idResource: string | null

  @column({ columnName: 'request_id' })
  declare requestId: string | null

  @column()
  declare metadata: Record<string, unknown>

  @column.dateTime({ autoCreate: true, columnName: 'occurred_at' })
  declare occurredAt: DateTime

  @beforeCreate()
  static assignId(audit: Audit) {
    audit.idAudit ||= createId()
  }
}
