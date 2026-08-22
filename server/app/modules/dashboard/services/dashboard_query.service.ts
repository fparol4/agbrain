import { NotFoundException } from '#core/errors/domain_exception'
import Producer from '#modules/producers/producer.model'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

const stateNames: Record<string, string> = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapá',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Pará',
  PB: 'Paraíba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piauí',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondônia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins',
}

export class DashboardQueryService {
  async execute(idProducer: string, requestedYear?: number) {
    const producer = await Producer.find(idProducer)
    if (!producer) throw new NotFoundException('Produtor')

    const [{ farm_count: farmCount, total_hectares: totalHectares }] = await db
      .from('farms')
      .where('id_producer', idProducer)
      .count('* as farm_count')
      .sum('total_area as total_hectares')

    const latestYearRow = await db
      .from('harvests as h')
      .innerJoin('farms as f', 'f.id_farm', 'h.id_farm')
      .where('f.id_producer', idProducer)
      .max('h.year as year')
      .first()
    const year =
      requestedYear ?? (latestYearRow?.year ? Number(latestYearRow.year) : DateTime.now().year)

    const states = await db
      .from('farms')
      .where('id_producer', idProducer)
      .select('state')
      .count('* as value')
      .groupBy('state')
      .orderBy('value', 'desc')

    const cropRows = await db
      .from('harvest_crops as hc')
      .innerJoin('crops as c', 'c.id_crop', 'hc.id_crop')
      .innerJoin('harvests as h', 'h.id_harvest', 'hc.id_harvest')
      .innerJoin('farms as f', 'f.id_farm', 'h.id_farm')
      .where('f.id_producer', idProducer)
      .where('h.year', year)
      .select('c.name')
      .count('* as value')
      .groupBy('c.id_crop', 'c.name')
      .orderBy('value', 'desc')

    const [{ agricultural_area: agriculturalArea, vegetation_area: vegetationArea }] = await db
      .from('farms')
      .where('id_producer', idProducer)
      .sum('agricultural_area as agricultural_area')
      .sum('vegetation_area as vegetation_area')

    const areaEvents = await db
      .from('farm_area_events')
      .where('id_producer', idProducer)
      .select('previous_total_area', 'new_total_area', 'occurred_at')
      .orderBy('occurred_at')

    return {
      idProducer,
      producerName: producer.name,
      year,
      availableYears: await this.availableYears(idProducer),
      totalFarms: Number(farmCount ?? 0),
      totalHectares: Number(totalHectares ?? 0),
      activeCrops: cropRows.length,
      states: states.map((state) => ({
        name: stateNames[String(state.state)] ?? String(state.state),
        value: Number(state.value),
      })),
      crops: cropRows.map((crop) => ({ name: String(crop.name), value: Number(crop.value) })),
      soilUse: [
        { name: 'Área agricultável', value: Number(agriculturalArea ?? 0) },
        { name: 'Vegetação', value: Number(vegetationArea ?? 0) },
      ],
      areaProgress: this.areaProgress(areaEvents),
    }
  }

  private async availableYears(idProducer: string) {
    const rows = await db
      .from('harvests as h')
      .innerJoin('farms as f', 'f.id_farm', 'h.id_farm')
      .where('f.id_producer', idProducer)
      .distinct('h.year')
      .orderBy('h.year', 'desc')
    return rows.map((row) => Number(row.year))
  }

  private areaProgress(events: Record<string, unknown>[]) {
    const now = DateTime.now().startOf('month')
    const months = Array.from({ length: 7 }, (_, index) => now.minus({ months: 6 - index }))
    let cumulative = 0
    let eventIndex = 0

    return months.map((month) => {
      const monthEnd = month.endOf('month')
      while (eventIndex < events.length) {
        const occurredAt = DateTime.fromJSDate(new Date(String(events[eventIndex].occurred_at)))
        if (occurredAt > monthEnd) break
        cumulative +=
          Number(events[eventIndex].new_total_area) - Number(events[eventIndex].previous_total_area)
        eventIndex += 1
      }
      return {
        month: month.setLocale('pt-BR').toFormat('LLL').replace('.', ''),
        hectares: Math.max(0, cumulative),
      }
    })
  }
}
