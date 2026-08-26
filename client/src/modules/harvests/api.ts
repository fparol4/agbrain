import { api } from "@/shared/api/client";
import type { PagedResult } from "@/shared/lib/pagination";
import type { Harvest, HarvestInput, ListHarvestsParams } from "./model";

export const harvestsApi = {
  list(params: ListHarvestsParams = {}) {
    return api.get<PagedResult<Harvest>>("/api/v1/harvests", params);
  },
  async create(input: HarvestInput) {
    return (await api.post<{ data: Harvest }>("/api/v1/harvests", input)).data;
  },
  async update(idHarvest: string, input: HarvestInput) {
    return (await api.patch<{ data: Harvest }>(`/api/v1/harvests/${idHarvest}`, input)).data;
  },
  remove(idHarvest: string) {
    return api.delete(`/api/v1/harvests/${idHarvest}`);
  },
};
