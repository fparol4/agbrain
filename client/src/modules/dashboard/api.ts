import { api } from "@/shared/api/client";
import type { Dashboard } from "./model";

export async function getDashboard(params: { idProducer?: string; year?: number }) {
  return (await api.get<{ data: Dashboard }>("/api/v1/dashboard", params)).data;
}
