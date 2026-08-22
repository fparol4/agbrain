import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'producers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id_producer').primary()
      table
        .uuid('id_user')
        .notNullable()
        .unique()
        .references('id_user')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('name', 160).notNullable()
      table.string('document_type', 4).notNullable()
      table.string('document', 14).notNullable().unique()
      table.string('city', 120).notNullable()
      table.string('state', 2).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      table.index(['name'], 'producers_name_idx')
      table.index(['state'], 'producers_state_idx')
    })

    this.schema.raw(
      `ALTER TABLE producers ADD CONSTRAINT producers_document_type_check CHECK (document_type IN ('CPF', 'CNPJ'))`
    )
    this.schema.raw(
      `ALTER TABLE producers ADD CONSTRAINT producers_document_length_check CHECK (char_length(document) IN (11, 14))`
    )
    this.schema.raw(
      `ALTER TABLE producers ADD CONSTRAINT producers_state_check CHECK (state ~ '^[A-Z]{2}$')`
    )
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
