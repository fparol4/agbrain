import { CropNormalizationService } from '#modules/harvests/services/crop_normalization.service'
import { test } from '@japa/runner'

test.group('Crop normalization service', () => {
  test('normalizes accents, whitespace and duplicates', ({ assert }) => {
    const crops = new CropNormalizationService().normalize([' Café ', 'cafe', 'Milho  verde'])

    assert.deepEqual(crops, [
      { name: 'cafe', normalizedName: 'cafe' },
      { name: 'Milho verde', normalizedName: 'milho verde' },
    ])
  })
})
