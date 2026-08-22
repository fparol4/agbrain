import { createId } from '#shared/ids/id'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

const asNumber = (value: unknown) => Number(value)

export default class Farm extends BaseModel {
  static table = 'farms'

  @column({ isPrimary: true, columnName: 'id_farm' })
  declare idFarm: string

  @column({ columnName: 'id_producer' })
  declare idProducer: string

  @column()
  declare name: string

  @column()
  declare city: string

  @column()
  declare state: string

  @column({ columnName: 'total_area', consume: asNumber })
  declare totalArea: number

  @column({ columnName: 'agricultural_area', consume: asNumber })
  declare agriculturalArea: number

  @column({ columnName: 'vegetation_area', consume: asNumber })
  declare vegetationArea: number

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignId(farm: Farm) {
    farm.idFarm ||= createId()
  }
}
