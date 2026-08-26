import validationBr from "validation-br";

export function normalizeRuralDocument(type: "CPF" | "CNPJ", value: string) {
  return type === "CPF"
    ? value.replace(/\D/g, "")
    : value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function isValidRuralDocument(type: "CPF" | "CNPJ", value: string) {
  return type === "CPF"
    ? validationBr.isCPF(value)
    : validationBr.isCNPJ(value);
}
