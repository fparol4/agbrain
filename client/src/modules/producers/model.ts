import { isCNPJ, isCPF } from "validation-br";
import { z } from "zod";

export type DocumentType = "CPF" | "CNPJ";
export type ProducerStatus = "ACTIVE" | "INACTIVE";

export interface Producer {
  idProducer: string;
  name: string;
  documentType: DocumentType;
  document: string;
  email: string;
  city: string;
  state: string;
  status: ProducerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProducerInput {
  name: string;
  documentType: DocumentType;
  document: string;
  email: string;
  city: string;
  state: string;
  status: ProducerStatus;
}

export interface ListProducersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProducerStatus;
}

function isValidDocument(documentType: DocumentType, document: string): boolean {
  const normalized = document.replace(/[.\-/]/g, "");
  return documentType === "CPF" ? isCPF(normalized) : isCNPJ(normalized);
}

export const producerSchema: z.ZodType<ProducerInput> = z
  .object({
    name: z.string().min(1, "Nome é obrigatório.").max(160),
    documentType: z.enum(["CPF", "CNPJ"]),
    document: z.string().min(1, "Documento é obrigatório."),
    email: z.string().email("E-mail inválido."),
    city: z.string().min(1, "Cidade é obrigatória.").max(120),
    state: z.string().length(2, "Estado deve ter 2 caracteres."),
    status: z.enum(["ACTIVE", "INACTIVE"]),
  })
  .superRefine((input, context) => {
    if (!isValidDocument(input.documentType, input.document)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${input.documentType} inválido.`,
        path: ["document"],
      });
    }
  });
