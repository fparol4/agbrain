import { createId } from '#shared/ids/id'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Crop extends BaseModel {
  static table = 'crops'

  @column({ isPrimary: true, columnName: 'id_crop' })
  declare idCrop: string

  @column()
  declare name: string

  @column({ columnName: 'normalized_name' })
  declare normalizedName: string

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignId(crop: Crop) {
    crop.idCrop ||= createId()
  }
}
