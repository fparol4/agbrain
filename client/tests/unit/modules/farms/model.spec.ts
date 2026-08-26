import { describe, expect, it } from "vitest";
import { farmSchema } from "@/modules/farms/model";

const farm = {
  idProducer: "22222222-2222-4222-8222-222222222222",
  name: "Fazenda Esperança",
  city: "Sorriso",
  state: "MT",
  totalArea: 1000,
  agriculturalArea: 700,
  vegetationArea: 300,
};

describe("farmSchema", () => {
  it("accepts available and exactly allocated areas", () => {
    expect(farmSchema.safeParse(farm).success).toBe(true);
    expect(
      farmSchema.safeParse({ ...farm, agriculturalArea: 500, vegetationArea: 300 }).success,
    ).toBe(true);
  });

  it("rejects exceeded area allocation", () => {
    const result = farmSchema.safeParse({
      ...farm,
      agriculturalArea: 800,
      vegetationArea: 300,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Soma das áreas excede a área total.");
    }
  });
});
