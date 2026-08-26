import { describe, expect, it } from "vitest";
import { producerSchema } from "@/modules/producers/model";

const validProducer = {
  name: "Produtor Teste",
  documentType: "CPF" as const,
  document: "529.982.247-25",
  email: "produtor@exemplo.com",
  city: "Cuiabá",
  state: "MT",
  status: "ACTIVE" as const,
};

describe("producerSchema", () => {
  it("accepts valid CPF and alphanumeric CNPJ", () => {
    expect(producerSchema.safeParse(validProducer).success).toBe(true);
    expect(
      producerSchema.safeParse({
        ...validProducer,
        documentType: "CNPJ",
        document: "12.ABC.345/01DE-35",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid CPF and CNPJ", () => {
    expect(producerSchema.safeParse({ ...validProducer, document: "111.222.333-44" }).success).toBe(
      false,
    );
    expect(
      producerSchema.safeParse({
        ...validProducer,
        documentType: "CNPJ",
        document: "00.000.000/0000-00",
      }).success,
    ).toBe(false);
  });
});
