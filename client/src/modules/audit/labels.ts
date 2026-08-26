import type { AuditOperation, AuditResource } from "./model";

export const OPERATION_LABELS: Record<AuditOperation, string> = {
  "auth.login": "Login",
  "auth.logout": "Logout",
  "producer.create": "Produtor criado",
  "producer.update": "Produtor alterado",
  "producer.delete": "Produtor excluído",
  "farm.create": "Fazenda criada",
  "farm.update": "Fazenda alterada",
  "farm.delete": "Fazenda excluída",
  "harvest.create": "Safra criada",
  "harvest.update": "Safra alterada",
  "harvest.delete": "Safra excluída",
};

export const RESOURCE_LABELS: Record<AuditResource, string> = {
  SESSION: "Sessão",
  PRODUCER: "Produtor",
  FARM: "Fazenda",
  HARVEST: "Safra",
};
