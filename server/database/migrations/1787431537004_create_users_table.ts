import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id_user').primary()
      table.string('name', 160).notNullable()
      table.string('email', 254).notNullable().unique()
      table.string('password_hash').notNullable()
      table.string('role', 16).notNullable()
      table.string('status', 16).notNullable().defaultTo('ACTIVE')

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })

    this.schema.raw(
      `ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('ADMIN', 'PRODUCER'))`
    )
    this.schema.raw(
      `ALTER TABLE users ADD CONSTRAINT users_status_check CHECK (status IN ('ACTIVE', 'INACTIVE'))`
    )
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
