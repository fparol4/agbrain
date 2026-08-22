import { DomainException } from '#core/errors/domain_exception'
import { FarmAreaService } from '#modules/farms/services/farm_area.service'
import { test } from '@japa/runner'

test.group('Farm area service', () => {
  const service = new FarmAreaService()

  test('accepts a valid allocation', ({ assert }) => {
    assert.doesNotThrow(() =>
      service.assertValid({ totalArea: 100, agriculturalArea: 60, vegetationArea: 30 })
    )
  })

  test('rejects allocation above total area', ({ assert }) => {
    assert.throws(
      () => service.assertValid({ totalArea: 100, agriculturalArea: 80, vegetationArea: 30 }),
      DomainException
    )
  })
})
