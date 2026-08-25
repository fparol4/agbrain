import { NotFoundException } from '#core/errors/domain_exception'
import Farm from '#modules/farms/farm.model'
import { normalizePagination, type PaginationInput } from '#shared/pagination/pagination'
import db from '@adonisjs/lucid/services/db'

interface ListFarmsInput extends PaginationInput {
  search?: string
  state?: string
}

interface AdminListFarmsInput extends ListFarmsInput {
  idProducer?: string
}

export class FarmRepository {
  async findOrFail(idFarm: string) {
    const farm = await Farm.find(idFarm)
    if (!farm) throw new NotFoundException('Fazenda')
    return farm
  }

  async list(idProducer: string, input: ListFarmsInput) {
    const { page, limit } = normalizePagination(input)
    const query = Farm.query().where('idProducer', idProducer).orderBy('name')

    if (input.state) query.where('state', input.state)
    if (input.search) {
      const search = `%${input.search.toLowerCase()}%`
      query.where((builder) => {
        builder.whereRaw('LOWER(name) LIKE ?', [search]).orWhereRaw('LOWER(city) LIKE ?', [search])
      })
    }

    const result = await query.paginate(page, limit)
    return {
      data: result.all().map((farm) => farm.serialize()),
      meta: result.getMeta(),
    }
  }

  async listAll(input: AdminListFarmsInput) {
    const { page, limit, offset } = normalizePagination(input)
    const applyFilters = (query: ReturnType<typeof db.from>) => {
      if (input.idProducer) query.where('f.id_producer', input.idProducer)
      if (input.state) query.where('f.state', input.state)
      if (input.search) {
        const search = `%${input.search.toLowerCase()}%`
        query.where((builder) => {
          builder
            .whereRaw('LOWER(f.name) LIKE ?', [search])
            .orWhereRaw('LOWER(f.city) LIKE ?', [search])
            .orWhereRaw('LOWER(p.name) LIKE ?', [search])
        })
      }
      return query
    }
    const base = () =>
      db.from('farms as f').innerJoin('producers as p', 'p.id_producer', 'f.id_producer')
    const rows = await applyFilters(base())
      .select(
        'f.id_farm',
        'f.id_producer',
        'p.name as producer_name',
        'f.name',
        'f.city',
        'f.state',
        'f.total_area',
        'f.agricultural_area',
        'f.vegetation_area',
        'f.created_at',
        'f.updated_at'
      )
      .orderBy('f.name')
      .limit(limit)
      .offset(offset)
    const [{ total }] = await applyFilters(base()).count('* as total')
    return {
      data: rows.map((row) => ({
        idFarm: String(row.id_farm),
        idProducer: String(row.id_producer),
        producerName: String(row.producer_name),
        name: String(row.name),
        city: String(row.city),
        state: String(row.state),
        totalArea: Number(row.total_area),
        agriculturalArea: Number(row.agricultural_area),
        vegetationArea: Number(row.vegetation_area),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
      meta: {
        page,
        limit,
        total: Number(total),
        lastPage: Math.max(1, Math.ceil(Number(total) / limit)),
      },
    }
  }
}
