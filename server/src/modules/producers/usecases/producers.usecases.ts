import { Injectable } from "@nestjs/common";
import {
  BusinessRuleError,
  ConflictError,
} from "../../../core/errors/application.error.js";
import {
  isValidRuralDocument,
  normalizeRuralDocument,
} from "../../../shared/documents/rural-document.js";
import type {
  CreateProducerDto,
  ListProducersDto,
  UpdateProducerDto,
} from "../dtos/producer.dto.js";
import { ProducersService } from "../producers.service.js";

@Injectable()
export class ProducersUseCases {
  constructor(private readonly producers: ProducersService) {}

  list(input: ListProducersDto) {
    return this.producers.list(input);
  }
  get(id: string) {
    return this.producers.findOrFail(id);
  }

  async create(input: CreateProducerDto) {
    const document = normalizeRuralDocument(input.documentType, input.document);
    this.assertDocument(input.documentType, document);
    if (await this.producers.findByDocument(document))
      throw new ConflictError("Documento já cadastrado.");
    const email = input.email.trim().toLowerCase();
    if (await this.producers.findByEmail(email))
      throw new ConflictError("E-mail já cadastrado.");
    return this.producers.create({
      ...input,
      document,
      email,
      state: input.state.toUpperCase(),
    });
  }

  async update(id: string, input: UpdateProducerDto) {
    const producer = await this.producers.findOrFail(id);
    const type = input.documentType ?? producer.documentType;
    const document = input.document
      ? normalizeRuralDocument(type, input.document)
      : producer.document;
    this.assertDocument(type, document);
    const documentOwner = await this.producers.findByDocument(document);
    if (documentOwner && documentOwner.idProducer !== id)
      throw new ConflictError("Documento já cadastrado.");
    const email = input.email?.trim().toLowerCase() ?? producer.email;
    const emailOwner = await this.producers.findByEmail(email);
    if (emailOwner && emailOwner.idProducer !== id)
      throw new ConflictError("E-mail já cadastrado.");
    return this.producers.save(producer, {
      ...input,
      documentType: type,
      document,
      email,
      state: input.state?.toUpperCase(),
    });
  }

  async delete(id: string) {
    await this.producers.remove(await this.producers.findOrFail(id));
  }

  private assertDocument(type: "CPF" | "CNPJ", document: string) {
    if (!isValidRuralDocument(type, document))
      throw new BusinessRuleError("E_INVALID_DOCUMENT", `${type} inválido.`);
  }
}
