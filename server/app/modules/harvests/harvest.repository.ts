import { NotFoundException } from '#core/errors/domain_exception'
import Harvest from '#modules/harvests/harvest.model'
import { normalizePagination, type PaginationInput } from '#shared/pagination/pagination'
import db from '@adonisjs/lucid/services/db'

interface ListHarvestsInput extends PaginationInput {
  idProducer?: string
  idFarm?: string
  year?: number
}

interface HarvestRow {
  id_harvest: string
  id_farm: string
  id_producer: string
  farm_name: string
  producer_name: string
  year: number
  created_at: unknown
  updated_at: unknown
}

export class HarvestRepository {
  async findOrFail(idHarvest: string) {
    const harvest = await Harvest.find(idHarvest)
    if (!harvest) throw new NotFoundException('Safra')
    return harvest
  }

  async findWithContextOrFail(idHarvest: string) {
    const row = (await this.baseQuery().where('h.id_harvest', idHarvest).first()) as
      HarvestRow | undefined
    if (!row) throw new NotFoundException('Safra')
    return this.hydrate([row]).then((items) => items[0])
  }

  async existsForFarmYear(idFarm: string, year: number, exceptId?: string) {
    const query = Harvest.query().where('idFarm', idFarm).where('year', year)
    if (exceptId) query.whereNot('idHarvest', exceptId)
    return Boolean(await query.first())
  }

  async list(idProducer: string, input: ListHarvestsInput) {
    return this.listAll({ ...input, idProducer })
  }

  async listAll(input: ListHarvestsInput) {
    const { page, limit, offset } = normalizePagination(input)
    const query = this.baseQuery()
    if (input.idProducer) query.where('p.id_producer', input.idProducer)
    if (input.idFarm) query.where('h.id_farm', input.idFarm)
    if (input.year) query.where('h.year', input.year)

    const rows = (await query
      .orderBy('h.year', 'desc')
      .orderBy('f.name')
      .limit(limit)
      .offset(offset)) as HarvestRow[]

    const countQuery = db.from('harvests as h').innerJoin('farms as f', 'f.id_farm', 'h.id_farm')
    if (input.idProducer) countQuery.where('f.id_producer', input.idProducer)
    if (input.idFarm) countQuery.where('h.id_farm', input.idFarm)
    if (input.year) countQuery.where('h.year', input.year)
    const [{ total }] = await countQuery.count('* as total')

    return {
      data: await this.hydrate(rows),
      meta: {
        page,
        limit,
        total: Number(total),
        lastPage: Math.max(1, Math.ceil(Number(total) / limit)),
      },
    }
  }

  async hydrate(rows: HarvestRow[]) {
    if (!rows.length) return []
    const ids = rows.map((row) => row.id_harvest)
    const cropRows = await db
      .from('harvest_crops as hc')
      .innerJoin('crops as c', 'c.id_crop', 'hc.id_crop')
      .whereIn('hc.id_harvest', ids)
      .select('hc.id_harvest', 'c.id_crop', 'c.name')
      .orderBy('c.name')

    return rows.map((row) => ({
      idHarvest: row.id_harvest,
      idFarm: row.id_farm,
      idProducer: row.id_producer,
      farmName: row.farm_name,
      producerName: row.producer_name,
      year: Number(row.year),
      crops: cropRows
        .filter((crop) => crop.id_harvest === row.id_harvest)
        .map((crop) => ({ idCrop: crop.id_crop, name: crop.name })),
    }))
  }

  private baseQuery() {
    return db
      .from('harvests as h')
      .innerJoin('farms as f', 'f.id_farm', 'h.id_farm')
      .innerJoin('producers as p', 'p.id_producer', 'f.id_producer')
      .select(
        'h.id_harvest',
        'h.id_farm',
        'p.id_producer',
        'f.name as farm_name',
        'p.name as producer_name',
        'h.year',
        'h.created_at',
        'h.updated_at'
      )
  }
}
