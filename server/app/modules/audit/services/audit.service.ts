import Audit, { type AuditAction } from '#modules/audit/audit.model'
import type User from '#modules/auth/user.model'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

interface RecordAuditInput {
  user: User
  action: AuditAction
  resourceType: string
  resourceName: string
  idResource?: string | null
  requestId?: string | null
  metadata?: Record<string, unknown>
  transaction?: TransactionClientContract
}

export class AuditService {
  async record(input: RecordAuditInput) {
    return Audit.create(
      {
        idUser: input.user.idUser,
        userName: input.user.name,
        userRole: input.user.role,
        action: input.action,
        resourceType: input.resourceType,
        resourceName: input.resourceName,
        idResource: input.idResource ?? null,
        requestId: input.requestId ?? null,
        metadata: input.metadata ?? {},
      },
      input.transaction ? { client: input.transaction } : undefined
    )
  }
}
