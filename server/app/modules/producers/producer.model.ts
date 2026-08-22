import { createId } from '#shared/ids/id'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export type DocumentType = 'CPF' | 'CNPJ'

export default class Producer extends BaseModel {
  static table = 'producers'

  @column({ isPrimary: true, columnName: 'id_producer' })
  declare idProducer: string

  @column({ columnName: 'id_user' })
  declare idUser: string

  @column()
  declare name: string

  @column({ columnName: 'document_type' })
  declare documentType: DocumentType

  @column()
  declare document: string

  @column()
  declare city: string

  @column()
  declare state: string

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignId(producer: Producer) {
    producer.idProducer ||= createId()
  }
}
