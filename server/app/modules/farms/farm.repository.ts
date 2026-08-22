import { NotFoundException } from '#core/errors/domain_exception'
import Farm from '#modules/farms/farm.model'
import { normalizePagination, type PaginationInput } from '#shared/pagination/pagination'

interface ListFarmsInput extends PaginationInput {
  search?: string
  state?: string
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
}
