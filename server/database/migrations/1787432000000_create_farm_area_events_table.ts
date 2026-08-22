import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'farm_area_events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id_farm_area_event').primary()
      table.uuid('id_farm').nullable().references('id_farm').inTable('farms').onDelete('SET NULL')
      table
        .uuid('id_producer')
        .notNullable()
        .references('id_producer')
        .inTable('producers')
        .onDelete('CASCADE')
      table.decimal('previous_total_area', 14, 2).notNullable()
      table.decimal('new_total_area', 14, 2).notNullable()
      table.timestamp('occurred_at', { useTz: true }).notNullable()

      table.index(['id_producer', 'occurred_at'], 'farm_area_events_producer_date_idx')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
