import { api } from "@/shared/api/client";
import type { PagedResult } from "@/shared/lib/pagination";
import type { ListProducersParams, Producer, ProducerInput } from "./model";

export const producersApi = {
  list(params: ListProducersParams = {}) {
    return api.get<PagedResult<Producer>>("/api/v1/producers", params);
  },
  async create(input: ProducerInput) {
    return (await api.post<{ data: Producer }>("/api/v1/producers", input)).data;
  },
  async update(idProducer: string, input: ProducerInput) {
    return (await api.patch<{ data: Producer }>(`/api/v1/producers/${idProducer}`, input)).data;
  },
  remove(idProducer: string) {
    return api.delete(`/api/v1/producers/${idProducer}`);
  },
};
