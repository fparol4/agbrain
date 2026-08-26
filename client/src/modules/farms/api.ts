import { api } from "@/shared/api/client";
import type { PagedResult } from "@/shared/lib/pagination";
import type { Farm, FarmInput, ListFarmsParams } from "./model";

export const farmsApi = {
  list(params: ListFarmsParams = {}) {
    return api.get<PagedResult<Farm>>("/api/v1/farms", params);
  },
  async create(input: FarmInput) {
    return (await api.post<{ data: Farm }>("/api/v1/farms", input)).data;
  },
  async update(idFarm: string, input: FarmInput) {
    const { idProducer: _, ...body } = input;
    return (await api.patch<{ data: Farm }>(`/api/v1/farms/${idFarm}`, body)).data;
  },
  remove(idFarm: string) {
    return api.delete(`/api/v1/farms/${idFarm}`);
  },
};
