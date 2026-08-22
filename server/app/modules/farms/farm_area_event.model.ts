import { createId } from '#shared/ids/id'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

const asNumber = (value: unknown) => Number(value)

export default class FarmAreaEvent extends BaseModel {
  static table = 'farm_area_events'

  @column({ isPrimary: true, columnName: 'id_farm_area_event' })
  declare idFarmAreaEvent: string

  @column({ columnName: 'id_farm' })
  declare idFarm: string | null

  @column({ columnName: 'id_producer' })
  declare idProducer: string

  @column({ columnName: 'previous_total_area', consume: asNumber })
  declare previousTotalArea: number

  @column({ columnName: 'new_total_area', consume: asNumber })
  declare newTotalArea: number

  @column.dateTime({ autoCreate: true, columnName: 'occurred_at' })
  declare occurredAt: DateTime

  @beforeCreate()
  static assignId(event: FarmAreaEvent) {
    event.idFarmAreaEvent ||= createId()
  }
}
