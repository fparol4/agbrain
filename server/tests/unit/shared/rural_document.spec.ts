import { isValidCnpj, isValidCpf, normalizeDocument } from '#shared/documents/rural_document'
import { test } from '@japa/runner'

test.group('Rural document', () => {
  test('normalizes and validates a CPF', ({ assert }) => {
    assert.equal(normalizeDocument('529.982.247-25'), '52998224725')
    assert.isTrue(isValidCpf('529.982.247-25'))
    assert.isFalse(isValidCpf('111.111.111-11'))
  })

  test('validates a CNPJ', ({ assert }) => {
    assert.isTrue(isValidCnpj('11.222.333/0001-81'))
    assert.isFalse(isValidCnpj('11.111.111/1111-11'))
  })
})
