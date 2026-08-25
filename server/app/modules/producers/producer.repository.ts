import { NotFoundException } from '#core/errors/domain_exception'
import User from '#modules/auth/user.model'
import Producer from '#modules/producers/producer.model'
import { normalizePagination, type PaginationInput } from '#shared/pagination/pagination'
import db from '@adonisjs/lucid/services/db'

interface ListProducersInput extends PaginationInput {
  search?: string
  status?: 'ACTIVE' | 'INACTIVE'
}

export class ProducerRepository {
  async findOrFail(idProducer: string) {
    const producer = await Producer.find(idProducer)
    if (!producer) throw new NotFoundException('Produtor')
    return producer
  }

  async findUserOrFail(idUser: string) {
    const user = await User.find(idUser)
    if (!user) throw new NotFoundException('Usuário')
    return user
  }

  async documentExists(document: string, exceptId?: string) {
    const query = Producer.query().where('document', document)
    if (exceptId) query.whereNot('idProducer', exceptId)
    return Boolean(await query.first())
  }

  async emailExists(email: string, exceptId?: string) {
    const query = User.query().where('email', email)
    if (exceptId) query.whereNot('idUser', exceptId)
    return Boolean(await query.first())
  }

  async list(input: ListProducersInput) {
    const { page, limit, offset } = normalizePagination(input)
    const applyFilters = (query: ReturnType<typeof db.from>) => {
      if (input.status) query.where('u.status', input.status)
      if (input.search) {
        const search = `%${input.search.toLowerCase()}%`
        const document = input.search.replace(/\D/g, '')
        query.where((builder) => {
          const textSearch = builder
            .whereRaw('LOWER(p.name) LIKE ?', [search])
            .orWhereRaw('LOWER(u.email) LIKE ?', [search])
          if (document) textSearch.orWhere('p.document', 'like', `%${document}%`)
        })
      }
      return query
    }

    const rows = await applyFilters(
      db
        .from('producers as p')
        .innerJoin('users as u', 'u.id_user', 'p.id_user')
        .leftJoin('farms as f', 'f.id_producer', 'p.id_producer')
    )
      .select(
        'p.id_producer',
        'p.id_user',
        'p.name',
        'p.document_type',
        'p.document',
        'p.city',
        'p.state',
        'u.email',
        'u.status'
      )
      .countDistinct('f.id_farm as farm_count')
      .sum('f.total_area as total_hectares')
      .groupBy(
        'p.id_producer',
        'p.id_user',
        'p.name',
        'p.document_type',
        'p.document',
        'p.city',
        'p.state',
        'u.email',
        'u.status'
      )
      .orderBy('p.name')
      .limit(limit)
      .offset(offset)

    const [{ total }] = await applyFilters(
      db.from('producers as p').innerJoin('users as u', 'u.id_user', 'p.id_user')
    ).count('* as total')

    return {
      data: rows.map((row) => this.mapSummary(row)),
      meta: {
        page,
        limit,
        total: Number(total),
        lastPage: Math.max(1, Math.ceil(Number(total) / limit)),
      },
    }
  }

  async getSummary(idProducer: string) {
    const row = await db
      .from('producers as p')
      .innerJoin('users as u', 'u.id_user', 'p.id_user')
      .leftJoin('farms as f', 'f.id_producer', 'p.id_producer')
      .where('p.id_producer', idProducer)
      .select(
        'p.id_producer',
        'p.id_user',
        'p.name',
        'p.document_type',
        'p.document',
        'p.city',
        'p.state',
        'u.email',
        'u.status'
      )
      .countDistinct('f.id_farm as farm_count')
      .sum('f.total_area as total_hectares')
      .groupBy(
        'p.id_producer',
        'p.id_user',
        'p.name',
        'p.document_type',
        'p.document',
        'p.city',
        'p.state',
        'u.email',
        'u.status'
      )
      .first()

    if (!row) throw new NotFoundException('Produtor')
    return this.mapSummary(row)
  }

  private mapSummary(row: Record<string, unknown>) {
    return {
      idProducer: String(row.id_producer),
      idUser: String(row.id_user),
      name: String(row.name),
      documentType: String(row.document_type),
      document: String(row.document),
      email: String(row.email),
      city: String(row.city),
      state: String(row.state),
      status: String(row.status),
      farmCount: Number(row.farm_count ?? 0),
      totalHectares: Number(row.total_hectares ?? 0),
    }
  }
}
