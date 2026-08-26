import { describe, expect, it } from "vitest";
import { OPERATION_LABELS, RESOURCE_LABELS } from "@/modules/audit/labels";

describe("Audit Labels Mapping", () => {
  it("maps all 11 audited operations to friendly Portuguese labels", () => {
    expect(OPERATION_LABELS["auth.login"]).toBe("Login");
    expect(OPERATION_LABELS["auth.logout"]).toBe("Logout");
    expect(OPERATION_LABELS["producer.create"]).toBe("Produtor criado");
    expect(OPERATION_LABELS["producer.update"]).toBe("Produtor alterado");
    expect(OPERATION_LABELS["producer.delete"]).toBe("Produtor excluído");
    expect(OPERATION_LABELS["farm.create"]).toBe("Fazenda criada");
    expect(OPERATION_LABELS["farm.update"]).toBe("Fazenda alterada");
    expect(OPERATION_LABELS["farm.delete"]).toBe("Fazenda excluída");
    expect(OPERATION_LABELS["harvest.create"]).toBe("Safra criada");
    expect(OPERATION_LABELS["harvest.update"]).toBe("Safra alterada");
    expect(OPERATION_LABELS["harvest.delete"]).toBe("Safra excluída");
  });

  it("maps resources to Portuguese labels", () => {
    expect(RESOURCE_LABELS["SESSION"]).toBe("Sessão");
    expect(RESOURCE_LABELS["PRODUCER"]).toBe("Produtor");
    expect(RESOURCE_LABELS["FARM"]).toBe("Fazenda");
    expect(RESOURCE_LABELS["HARVEST"]).toBe("Safra");
  });
});
