import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audit_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id_audit').primary()
      table.uuid('id_user').nullable().references('id_user').inTable('users').onDelete('SET NULL')
      table.string('user_name', 160).notNullable()
      table.string('user_role', 16).notNullable()
      table.string('action', 32).notNullable()
      table.string('resource_type', 64).notNullable()
      table.string('resource_name', 180).notNullable()
      table.uuid('id_resource').nullable()
      table.string('request_id', 120).nullable()
      table.jsonb('metadata').notNullable().defaultTo('{}')
      table.timestamp('occurred_at', { useTz: true }).notNullable()

      table.index(['occurred_at'], 'audit_logs_occurred_at_idx')
      table.index(['id_user', 'occurred_at'], 'audit_logs_user_date_idx')
      table.index(['action'], 'audit_logs_action_idx')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
