import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('harvests', (table) => {
      table.uuid('id_harvest').primary()
      table.uuid('id_farm').notNullable().references('id_farm').inTable('farms').onDelete('CASCADE')
      table.integer('year').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      table.unique(['id_farm', 'year'], { indexName: 'harvests_farm_year_unique' })
      table.index(['id_farm'], 'harvests_id_farm_idx')
    })

    this.schema.raw(
      `ALTER TABLE harvests ADD CONSTRAINT harvests_year_check CHECK (year BETWEEN 2000 AND 2100)`
    )

    this.schema.createTable('crops', (table) => {
      table.uuid('id_crop').primary()
      table.string('name', 100).notNullable()
      table.string('normalized_name', 100).notNullable().unique()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })

    this.schema.createTable('harvest_crops', (table) => {
      table
        .uuid('id_harvest')
        .notNullable()
        .references('id_harvest')
        .inTable('harvests')
        .onDelete('CASCADE')
      table
        .uuid('id_crop')
        .notNullable()
        .references('id_crop')
        .inTable('crops')
        .onDelete('RESTRICT')
      table.primary(['id_harvest', 'id_crop'])
      table.index(['id_crop'], 'harvest_crops_id_crop_idx')
    })
  }

  async down() {
    this.schema.dropTable('harvest_crops')
    this.schema.dropTable('crops')
    this.schema.dropTable('harvests')
  }
}
