import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'farms'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id_farm').primary()
      table
        .uuid('id_producer')
        .notNullable()
        .references('id_producer')
        .inTable('producers')
        .onDelete('CASCADE')
      table.string('name', 160).notNullable()
      table.string('city', 120).notNullable()
      table.string('state', 2).notNullable()
      table.decimal('total_area', 14, 2).notNullable()
      table.decimal('agricultural_area', 14, 2).notNullable()
      table.decimal('vegetation_area', 14, 2).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      table.index(['id_producer'], 'farms_id_producer_idx')
      table.index(['state'], 'farms_state_idx')
    })

    this.schema.raw(
      `ALTER TABLE farms ADD CONSTRAINT farms_areas_check CHECK (
        total_area > 0 AND agricultural_area >= 0 AND vegetation_area >= 0
        AND agricultural_area + vegetation_area <= total_area
      )`
    )
    this.schema.raw(
      `ALTER TABLE farms ADD CONSTRAINT farms_state_check CHECK (state ~ '^[A-Z]{2}$')`
    )
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
