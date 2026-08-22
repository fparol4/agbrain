import User from '#modules/auth/user.model'
import FarmAreaEvent from '#modules/farms/farm_area_event.model'
import Farm from '#modules/farms/farm.model'
import Crop from '#modules/harvests/crop.model'
import Harvest from '#modules/harvests/harvest.model'
import Producer from '#modules/producers/producer.model'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'

const ids = {
  admin: '00000000-0000-4000-8000-000000000001',
  joaoUser: '00000000-0000-4000-8000-000000000002',
  anaUser: '00000000-0000-4000-8000-000000000003',
  joao: '00000000-0000-4000-8000-000000000101',
  ana: '00000000-0000-4000-8000-000000000102',
}

export default class MainSeeder extends BaseSeeder {
  async run() {
    if (await User.find(ids.admin)) return

    await db.transaction(async (transaction) => {
      const admin = new User()
      admin.useTransaction(transaction)
      admin.merge({
        idUser: ids.admin,
        name: 'Marina Costa',
        email: 'admin@raiz.demo',
        password: 'demo123',
        role: 'ADMIN',
        status: 'ACTIVE',
      })
      await admin.save()

      const joaoUser = new User()
      joaoUser.useTransaction(transaction)
      joaoUser.merge({
        idUser: ids.joaoUser,
        name: 'João Oliveira',
        email: 'joao@raiz.demo',
        password: 'demo123',
        role: 'PRODUCER',
        status: 'ACTIVE',
      })
      await joaoUser.save()

      const anaUser = new User()
      anaUser.useTransaction(transaction)
      anaUser.merge({
        idUser: ids.anaUser,
        name: 'Ana Martins',
        email: 'ana@raiz.demo',
        password: 'demo123',
        role: 'PRODUCER',
        status: 'ACTIVE',
      })
      await anaUser.save()

      await this.createProducer(transaction, {
        idProducer: ids.joao,
        idUser: ids.joaoUser,
        name: 'João Oliveira',
        document: '52998224725',
        city: 'Sorriso',
        state: 'MT',
      })
      await this.createProducer(transaction, {
        idProducer: ids.ana,
        idUser: ids.anaUser,
        name: 'Ana Martins',
        document: '16899535009',
        city: 'Londrina',
        state: 'PR',
      })

      const joaoFarms = [
        [
          '00000000-0000-4000-8000-000000000201',
          'Fazenda Santa Clara',
          'Sorriso',
          'MT',
          6500,
          4800,
          1700,
          '2026-01-12',
        ],
        [
          '00000000-0000-4000-8000-000000000202',
          'Fazenda Boa Esperança',
          'Rio Verde',
          'GO',
          4200,
          3000,
          1200,
          '2026-02-08',
        ],
        [
          '00000000-0000-4000-8000-000000000203',
          'Fazenda Horizonte',
          'Lucas do Rio Verde',
          'MT',
          3540,
          2600,
          940,
          '2026-03-19',
        ],
        [
          '00000000-0000-4000-8000-000000000204',
          'Fazenda Vale Verde',
          'Uberaba',
          'MG',
          2300,
          1500,
          800,
          '2026-05-03',
        ],
        [
          '00000000-0000-4000-8000-000000000205',
          'Fazenda Recanto',
          'Jataí',
          'GO',
          2000,
          1500,
          500,
          '2026-07-16',
        ],
      ] as const

      for (const [
        idFarm,
        name,
        city,
        state,
        totalArea,
        agriculturalArea,
        vegetationArea,
        date,
      ] of joaoFarms) {
        await this.createFarm(transaction, {
          idFarm,
          idProducer: ids.joao,
          name,
          city,
          state,
          totalArea,
          agriculturalArea,
          vegetationArea,
          date,
        })
      }

      const anaFarms = [
        [
          '00000000-0000-4000-8000-000000000211',
          'Fazenda Primavera',
          'Londrina',
          'PR',
          4600,
          3300,
          1300,
          '2026-01-20',
        ],
        [
          '00000000-0000-4000-8000-000000000212',
          'Sítio Bela Vista',
          'Ribeirão Preto',
          'SP',
          3680,
          2500,
          1180,
          '2026-04-11',
        ],
        [
          '00000000-0000-4000-8000-000000000213',
          'Fazenda Três Irmãos',
          'Maringá',
          'PR',
          3000,
          2090,
          910,
          '2026-06-02',
        ],
      ] as const

      for (const [
        idFarm,
        name,
        city,
        state,
        totalArea,
        agriculturalArea,
        vegetationArea,
        date,
      ] of anaFarms) {
        await this.createFarm(transaction, {
          idFarm,
          idProducer: ids.ana,
          name,
          city,
          state,
          totalArea,
          agriculturalArea,
          vegetationArea,
          date,
        })
      }

      const crops = await this.createCrops(transaction)
      await this.createHarvest(
        transaction,
        '00000000-0000-4000-8000-000000000301',
        joaoFarms[0][0],
        2026,
        [crops.soy, crops.corn]
      )
      await this.createHarvest(
        transaction,
        '00000000-0000-4000-8000-000000000302',
        joaoFarms[1][0],
        2026,
        [crops.soy, crops.coffee]
      )
      await this.createHarvest(
        transaction,
        '00000000-0000-4000-8000-000000000303',
        joaoFarms[2][0],
        2025,
        [crops.cotton]
      )
      await this.createHarvest(
        transaction,
        '00000000-0000-4000-8000-000000000311',
        anaFarms[0][0],
        2026,
        [crops.coffee, crops.corn]
      )
    })
  }

  private async createProducer(
    transaction: TransactionClientContract,
    input: {
      idProducer: string
      idUser: string
      name: string
      document: string
      city: string
      state: string
    }
  ) {
    const producer = new Producer()
    producer.useTransaction(transaction)
    producer.merge({ ...input, documentType: 'CPF' })
    await producer.save()
  }

  private async createFarm(
    transaction: TransactionClientContract,
    input: {
      idFarm: string
      idProducer: string
      name: string
      city: string
      state: string
      totalArea: number
      agriculturalArea: number
      vegetationArea: number
      date: string
    }
  ) {
    const { date, ...farmInput } = input
    const farm = new Farm()
    farm.useTransaction(transaction)
    farm.merge(farmInput)
    await farm.save()

    const event = new FarmAreaEvent()
    event.useTransaction(transaction)
    event.merge({
      idFarm: farm.idFarm,
      idProducer: farm.idProducer,
      previousTotalArea: 0,
      newTotalArea: farm.totalArea,
      occurredAt: DateTime.fromISO(date, { zone: 'UTC' }),
    })
    await event.save()
  }

  private async createCrops(transaction: TransactionClientContract) {
    const values = [
      ['00000000-0000-4000-8000-000000000401', 'Soja', 'soja'],
      ['00000000-0000-4000-8000-000000000402', 'Milho', 'milho'],
      ['00000000-0000-4000-8000-000000000403', 'Café', 'cafe'],
      ['00000000-0000-4000-8000-000000000404', 'Algodão', 'algodao'],
    ] as const
    const result: Record<string, string> = {}
    for (const [idCrop, name, normalizedName] of values) {
      const crop = new Crop()
      crop.useTransaction(transaction)
      crop.merge({ idCrop, name, normalizedName })
      await crop.save()
      result[
        normalizedName === 'soja'
          ? 'soy'
          : normalizedName === 'milho'
            ? 'corn'
            : normalizedName === 'cafe'
              ? 'coffee'
              : 'cotton'
      ] = idCrop
    }
    return result as { soy: string; corn: string; coffee: string; cotton: string }
  }

  private async createHarvest(
    transaction: TransactionClientContract,
    idHarvest: string,
    idFarm: string,
    year: number,
    cropIds: string[]
  ) {
    const harvest = new Harvest()
    harvest.useTransaction(transaction)
    harvest.merge({ idHarvest, idFarm, year })
    await harvest.save()
    await transaction
      .table('harvest_crops')
      .multiInsert(cropIds.map((idCrop) => ({ id_harvest: idHarvest, id_crop: idCrop })))
  }
}
