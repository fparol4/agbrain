import { createId } from '#shared/ids/id'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import hash from '@adonisjs/core/services/hash'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export type UserRole = 'ADMIN' | 'PRODUCER'
export type UserStatus = 'ACTIVE' | 'INACTIVE'

export default class User extends withAuthFinder(hash, {
  uids: ['email'],
  passwordColumnName: 'password',
})(BaseModel) {
  static table = 'users'

  @column({ isPrimary: true, columnName: 'id_user' })
  declare idUser: string

  @column()
  declare name: string

  @column()
  declare email: string

  @column({ columnName: 'password_hash', serializeAs: null })
  declare password: string

  @column()
  declare role: UserRole

  @column()
  declare status: UserStatus

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignId(user: User) {
    user.idUser ||= createId()
    user.email = user.email.trim().toLowerCase()
  }
}
