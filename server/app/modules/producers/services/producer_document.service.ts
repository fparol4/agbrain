import { DomainException } from '#core/errors/domain_exception'
import type { DocumentType } from '#modules/producers/producer.model'
import { isValidRuralDocument, normalizeDocument } from '#shared/documents/rural_document'

export class ProducerDocumentService {
  normalizeAndValidate(type: DocumentType, value: string) {
    const document = normalizeDocument(value)
    if (!isValidRuralDocument(type, document)) {
      throw new DomainException(`${type} inválido.`, 422, 'E_INVALID_DOCUMENT')
    }
    return document
  }
}
