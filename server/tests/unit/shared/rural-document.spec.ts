import {
  isValidRuralDocument,
  normalizeRuralDocument,
} from "../../../src/shared/documents/rural-document.js";

describe("rural documents", () => {
  it("validates CPF", () =>
    expect(isValidRuralDocument("CPF", "529.982.247-25")).toBe(true));
  it("validates legacy numeric CNPJ", () =>
    expect(isValidRuralDocument("CNPJ", "11.222.333/0001-81")).toBe(true));
  it("validates official alphanumeric CNPJ", () =>
    expect(isValidRuralDocument("CNPJ", "12.ABC.345/01DE-35")).toBe(true));
  it("normalizes alphanumeric CNPJ", () =>
    expect(normalizeRuralDocument("CNPJ", "12.abc.345/01de-35")).toBe(
      "12ABC34501DE35",
    ));
});
