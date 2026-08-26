import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import type { DashboardDto } from "./dtos/dashboard.dto.js";

type CountRow = { count: string };
type SumRow = {
  total: string | null;
  agricultural: string | null;
  vegetation: string | null;
};

@Injectable()
export class DashboardService {
  constructor(private readonly database: DataSource) {}

  async get(input: DashboardDto, producerName?: string) {
    const params = input.idProducer ? [input.idProducer] : [];
    const farmWhere = input.idProducer ? "WHERE id_producer = $1" : "";
    const harvestWhere = input.idProducer ? "WHERE f.id_producer = $1" : "";
    const producerWhere = input.idProducer ? "WHERE p.id_producer = $1" : "";

    const [producerCount] = await this.database.query<CountRow[]>(
      "SELECT COUNT(*)::text AS count FROM producers",
    );
    const [statusRows, farmTotals, latestYearRows] = await Promise.all([
      this.database.query<{ status: string; value: string }[]>(
        "SELECT status, COUNT(*)::text AS value FROM producers GROUP BY status ORDER BY status",
      ),
      this.database.query<SumRow[]>(
        `SELECT COUNT(*)::text AS total, COALESCE(SUM(total_area), 0)::text AS agricultural, COALESCE(SUM(vegetation_area), 0)::text AS vegetation FROM farms ${farmWhere}`,
        params,
      ),
      this.database.query<{ year: number }[]>(
        `SELECT MAX(h.year)::integer AS year FROM harvests h JOIN farms f ON f.id_farm = h.id_farm ${harvestWhere}`,
        params,
      ),
    ]);
    const year =
      input.year ?? latestYearRows[0]?.year ?? new Date().getUTCFullYear();
    const yearParameter = params.length + 1;
    const cropParams = [...params, year];

    const [availableYears, states, crops, soil, events, topProducers] =
      await Promise.all([
        this.database.query<{ year: number }[]>(
          `SELECT DISTINCT h.year FROM harvests h JOIN farms f ON f.id_farm = h.id_farm ${harvestWhere} ORDER BY h.year DESC`,
          params,
        ),
        this.database.query<{ name: string; value: string }[]>(
          `SELECT state AS name, COUNT(*)::text AS value FROM farms ${farmWhere} GROUP BY state ORDER BY value DESC`,
          params,
        ),
        this.database.query<{ name: string; value: string }[]>(
          `SELECT c.name, COUNT(*)::text AS value FROM harvest_crops hc JOIN crops c ON c.id_crop = hc.id_crop JOIN harvests h ON h.id_harvest = hc.id_harvest JOIN farms f ON f.id_farm = h.id_farm ${harvestWhere} ${harvestWhere ? "AND" : "WHERE"} h.year = $${yearParameter} GROUP BY c.id_crop, c.name ORDER BY value DESC`,
          cropParams,
        ),
        this.database.query<{ agricultural: string; vegetation: string }[]>(
          `SELECT COALESCE(SUM(agricultural_area), 0)::text AS agricultural, COALESCE(SUM(vegetation_area), 0)::text AS vegetation FROM farms ${farmWhere}`,
          params,
        ),
        this.database.query<
          { previous: string; current: string; occurred_at: Date }[]
        >(
          `SELECT previous_total_area::text AS previous, new_total_area::text AS current, occurred_at FROM farm_area_events ${farmWhere} ORDER BY occurred_at`,
          params,
        ),
        input.idProducer
          ? Promise.resolve([])
          : this.database.query<
              {
                id_producer: string;
                name: string;
                farm_count: string;
                total_hectares: string;
              }[]
            >(
              `SELECT p.id_producer, p.name, COUNT(f.id_farm)::text AS farm_count, COALESCE(SUM(f.total_area), 0)::text AS total_hectares FROM producers p LEFT JOIN farms f ON f.id_producer = p.id_producer ${producerWhere} GROUP BY p.id_producer, p.name ORDER BY COALESCE(SUM(f.total_area), 0) DESC LIMIT 5`,
              params,
            ),
      ]);

    const totalFarms = Number(farmTotals[0]?.total ?? 0);
    const totalHectares = Number(farmTotals[0]?.agricultural ?? 0);
    const common = {
      scope: input.idProducer ? "PRODUCER" : "GENERAL",
      ...(input.idProducer
        ? { idProducer: input.idProducer, producerName }
        : {}),
      year,
      availableYears: availableYears.map((row) => Number(row.year)),
      totalFarms,
      totalHectares,
      activeCrops: crops.length,
      states: states.map((row) => ({
        name: row.name,
        value: Number(row.value),
      })),
      crops: crops.map((row) => ({ name: row.name, value: Number(row.value) })),
      soilUse: [
        {
          name: "Área agricultável",
          value: Number(soil[0]?.agricultural ?? 0),
        },
        { name: "Vegetação", value: Number(soil[0]?.vegetation ?? 0) },
      ],
      areaProgress: this.areaProgress(events),
    };
    if (input.idProducer) return common;
    return {
      ...common,
      totalProducers: Number(producerCount?.count ?? 0),
      producerStatus: statusRows.map((row) => ({
        name: row.status,
        value: Number(row.value),
      })),
      topProducers: topProducers.map((row) => ({
        idProducer: row.id_producer,
        name: row.name,
        farmCount: Number(row.farm_count),
        totalHectares: Number(row.total_hectares),
      })),
    };
  }

  private areaProgress(
    events: { previous: string; current: string; occurred_at: Date }[],
  ) {
    const now = new Date();
    const months = Array.from(
      { length: 7 },
      (_, index) =>
        new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 6 + index, 1),
        ),
    );
    let cumulative = 0;
    let eventIndex = 0;
    return months.map((month) => {
      const monthEnd = new Date(
        Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1) - 1,
      );
      while (
        eventIndex < events.length &&
        new Date(events[eventIndex].occurred_at) <= monthEnd
      ) {
        cumulative +=
          Number(events[eventIndex].current) -
          Number(events[eventIndex].previous);
        eventIndex += 1;
      }
      return {
        month: new Intl.DateTimeFormat("pt-BR", {
          month: "short",
          timeZone: "UTC",
        })
          .format(month)
          .replace(".", ""),
        hectares: Math.max(0, cumulative),
      };
    });
  }
}
