import { describe, expect, it } from "vitest";
import { normalizeCrops } from "@/modules/harvests/model";

describe("normalizeCrops", () => {
  it("trims, removes blanks and deduplicates case-insensitively", () => {
    expect(normalizeCrops(" Soja , Milho \n SOJA , Algodão ,   , milho \nCafé ")).toEqual([
      "Soja",
      "Milho",
      "Algodão",
      "Café",
    ]);
  });

  it("caps results at 30 items", () => {
    const input = Array.from({ length: 40 }, (_, index) => `Cultura ${index + 1}`).join(", ");
    expect(normalizeCrops(input)).toHaveLength(30);
  });
});
