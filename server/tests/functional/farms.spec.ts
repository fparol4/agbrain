import User from '#modules/auth/user.model'
import { test } from '@japa/runner'

const idProducer = '00000000-0000-4000-8000-000000000101'

test.group('Farms', () => {
  test('creates and returns a farm for its producer', async ({ client }) => {
    const producer = await User.findOrFail('00000000-0000-4000-8000-000000000002')
    const response = await client
      .post(`/api/v1/producers/${idProducer}/farms`)
      .loginAs(producer)
      .json({
        name: 'Fazenda Teste',
        city: 'Sorriso',
        state: 'MT',
        totalArea: 100,
        agriculturalArea: 70,
        vegetationArea: 30,
      })

    response.assertStatus(201)
    response.assertBodyContains({ data: { name: 'Fazenda Teste', totalArea: 100 } })
  })

  test('rejects an invalid area allocation', async ({ client }) => {
    const producer = await User.findOrFail('00000000-0000-4000-8000-000000000002')
    const response = await client
      .post(`/api/v1/producers/${idProducer}/farms`)
      .loginAs(producer)
      .json({
        name: 'Fazenda Inválida',
        city: 'Sorriso',
        state: 'MT',
        totalArea: 100,
        agriculturalArea: 80,
        vegetationArea: 30,
      })

    response.assertStatus(422)
    response.assertBodyContains({ error: { code: 'E_INVALID_FARM_AREA' } })
  })
})
