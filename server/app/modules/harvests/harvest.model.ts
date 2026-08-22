import { createId } from '#shared/ids/id'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Harvest extends BaseModel {
  static table = 'harvests'

  @column({ isPrimary: true, columnName: 'id_harvest' })
  declare idHarvest: string

  @column({ columnName: 'id_farm' })
  declare idFarm: string

  @column()
  declare year: number

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignId(harvest: Harvest) {
    harvest.idHarvest ||= createId()
  }
}
