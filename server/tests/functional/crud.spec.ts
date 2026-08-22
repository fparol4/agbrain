import User from '#modules/auth/user.model'
import { test } from '@japa/runner'

const idProducer = '00000000-0000-4000-8000-000000000101'
const idFarm = '00000000-0000-4000-8000-000000000201'

test.group('Resource lifecycle', () => {
  test('creates, updates and deletes a producer as administrator', async ({ client, assert }) => {
    const admin = await User.findOrFail('00000000-0000-4000-8000-000000000001')
    const created = await client.post('/api/v1/producers').loginAs(admin).json({
      name: 'Carlos Mendes',
      documentType: 'CPF',
      document: '111.444.777-35',
      email: 'carlos@raiz.demo',
      city: 'Campo Grande',
      state: 'MS',
      status: 'ACTIVE',
    })

    created.assertStatus(201)
    const idCreatedProducer = created.body().data.idProducer
    assert.isString(idCreatedProducer)

    const updated = await client
      .patch(`/api/v1/producers/${idCreatedProducer}`)
      .loginAs(admin)
      .json({ name: 'Carlos Mendes Filho', status: 'INACTIVE' })
    updated.assertStatus(200)
    updated.assertBodyContains({ data: { name: 'Carlos Mendes Filho', status: 'INACTIVE' } })

    const removed = await client.delete(`/api/v1/producers/${idCreatedProducer}`).loginAs(admin)
    removed.assertStatus(204)

    const missing = await client.get(`/api/v1/producers/${idCreatedProducer}`).loginAs(admin)
    missing.assertStatus(404)
  })

  test('creates, updates and deletes a farm as its producer', async ({ client, assert }) => {
    const producer = await User.findOrFail('00000000-0000-4000-8000-000000000002')
    const created = await client
      .post(`/api/v1/producers/${idProducer}/farms`)
      .loginAs(producer)
      .json({
        name: 'Fazenda Ciclo',
        city: 'Sorriso',
        state: 'MT',
        totalArea: 240,
        agriculturalArea: 160,
        vegetationArea: 60,
      })

    created.assertStatus(201)
    const idCreatedFarm = created.body().data.idFarm
    assert.isString(idCreatedFarm)

    const updated = await client
      .patch(`/api/v1/farms/${idCreatedFarm}`)
      .loginAs(producer)
      .json({ totalArea: 260, agriculturalArea: 170, vegetationArea: 70 })
    updated.assertStatus(200)
    updated.assertBodyContains({ data: { totalArea: 260, agriculturalArea: 170 } })

    const removed = await client.delete(`/api/v1/farms/${idCreatedFarm}`).loginAs(producer)
    removed.assertStatus(204)

    const missing = await client.get(`/api/v1/farms/${idCreatedFarm}`).loginAs(producer)
    missing.assertStatus(404)
  })

  test('creates, updates and deletes an annual harvest as its producer', async ({
    client,
    assert,
  }) => {
    const producer = await User.findOrFail('00000000-0000-4000-8000-000000000002')
    const created = await client
      .post(`/api/v1/farms/${idFarm}/harvests`)
      .loginAs(producer)
      .json({ year: 2027, crops: ['Soja', 'Milho'] })

    created.assertStatus(201)
    const idHarvest = created.body().data.idHarvest
    assert.isString(idHarvest)

    const updated = await client
      .patch(`/api/v1/harvests/${idHarvest}`)
      .loginAs(producer)
      .json({ year: 2028, crops: ['Algodão'] })
    updated.assertStatus(200)
    updated.assertBodyContains({ data: { year: 2028, farmName: 'Fazenda Santa Clara' } })

    const removed = await client.delete(`/api/v1/harvests/${idHarvest}`).loginAs(producer)
    removed.assertStatus(204)

    const list = await client
      .get(`/api/v1/producers/${idProducer}/harvests?year=2028`)
      .loginAs(producer)
    list.assertStatus(200)
    list.assertBodyContains({ meta: { total: 0 } })
  })
})
