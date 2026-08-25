import User from '#modules/auth/user.model'
import { test } from '@japa/runner'

const joaoProducer = '00000000-0000-4000-8000-000000000101'
const anaProducer = '00000000-0000-4000-8000-000000000102'

test.group('Authorization', () => {
  test('allows only administrators to list producers', async ({ client }) => {
    const producer = await User.findOrFail('00000000-0000-4000-8000-000000000002')
    const admin = await User.findOrFail('00000000-0000-4000-8000-000000000001')

    const denied = await client.get('/api/v1/producers').loginAs(producer)
    denied.assertStatus(403)

    const allowed = await client.get('/api/v1/producers').loginAs(admin)
    allowed.assertStatus(200)
    allowed.assertBodyContains({ meta: { total: 2 } })

    const filtered = await client.get('/api/v1/producers?search=Ana').loginAs(admin)
    filtered.assertStatus(200)
    filtered.assertBodyContains({ meta: { total: 1 }, data: [{ name: 'Ana Martins' }] })
  })

  test('prevents a producer from reading another dashboard', async ({ client }) => {
    const producer = await User.findOrFail('00000000-0000-4000-8000-000000000002')

    const own = await client.get(`/api/v1/producers/${joaoProducer}/dashboard`).loginAs(producer)
    own.assertStatus(200)

    const another = await client.get(`/api/v1/producers/${anaProducer}/dashboard`).loginAs(producer)
    another.assertStatus(403)
  })

  test('allows an administrator to manage farms and harvests for a selected producer', async ({
    client,
  }) => {
    const admin = await User.findOrFail('00000000-0000-4000-8000-000000000001')

    const createdFarm = await client
      .post(`/api/v1/producers/${anaProducer}/farms`)
      .loginAs(admin)
      .json({
        name: 'Fazenda Administrada',
        city: 'Maringá',
        state: 'PR',
        totalArea: 120,
        agriculturalArea: 80,
        vegetationArea: 40,
      })
    createdFarm.assertStatus(201)
    const idFarm = createdFarm.body().data.idFarm

    const updatedFarm = await client
      .patch(`/api/v1/farms/${idFarm}`)
      .loginAs(admin)
      .json({ name: 'Fazenda Administrada II', totalArea: 130 })
    updatedFarm.assertStatus(200)
    updatedFarm.assertBodyContains({ data: { name: 'Fazenda Administrada II', totalArea: 130 } })

    const createdHarvest = await client
      .post(`/api/v1/farms/${idFarm}/harvests`)
      .loginAs(admin)
      .json({ year: 2027, crops: ['Soja', 'Milho'] })
    createdHarvest.assertStatus(201)
    const idHarvest = createdHarvest.body().data.idHarvest

    const updatedHarvest = await client
      .patch(`/api/v1/harvests/${idHarvest}`)
      .loginAs(admin)
      .json({ year: 2028, crops: ['Algodão'] })
    updatedHarvest.assertStatus(200)
    updatedHarvest.assertBodyContains({ data: { year: 2028, crops: [{ name: 'Algodão' }] } })

    const deletedHarvest = await client.delete(`/api/v1/harvests/${idHarvest}`).loginAs(admin)
    deletedHarvest.assertStatus(204)
    const deletedFarm = await client.delete(`/api/v1/farms/${idFarm}`).loginAs(admin)
    deletedFarm.assertStatus(204)

    const audit = await client.get('/api/v1/audit?action=DELETE').loginAs(admin)
    audit.assertStatus(200)
    audit.assertBodyContains({ data: [{ userRole: 'ADMIN' }] })
  })

  test('prevents a producer from mutating another producer resources', async ({ client }) => {
    const joao = await User.findOrFail('00000000-0000-4000-8000-000000000002')

    const farm = await client.post(`/api/v1/producers/${anaProducer}/farms`).loginAs(joao).json({
      name: 'Fazenda Indevida',
      city: 'Londrina',
      state: 'PR',
      totalArea: 10,
      agriculturalArea: 8,
      vegetationArea: 2,
    })
    farm.assertStatus(403)

    const harvest = await client
      .post('/api/v1/farms/00000000-0000-4000-8000-000000000211/harvests')
      .loginAs(joao)
      .json({ year: 2029, crops: ['Soja'] })
    harvest.assertStatus(403)
  })

  test('exposes general operational views only to administrators', async ({ client }) => {
    const admin = await User.findOrFail('00000000-0000-4000-8000-000000000001')
    const producer = await User.findOrFail('00000000-0000-4000-8000-000000000002')

    const dashboard = await client.get('/api/v1/dashboard?year=2026').loginAs(admin)
    dashboard.assertStatus(200)
    dashboard.assertBodyContains({
      data: { scope: 'GENERAL', totalProducers: 2, totalFarms: 8 },
    })

    const farms = await client
      .get(`/api/v1/farms?idProducer=${anaProducer}&state=PR`)
      .loginAs(admin)
    farms.assertStatus(200)
    farms.assertBodyContains({ meta: { total: 2 }, data: [{ producerName: 'Ana Martins' }] })

    const harvests = await client
      .get(`/api/v1/harvests?idProducer=${anaProducer}&year=2026`)
      .loginAs(admin)
    harvests.assertStatus(200)
    harvests.assertBodyContains({ meta: { total: 1 }, data: [{ producerName: 'Ana Martins' }] })

    const deniedDashboard = await client.get('/api/v1/dashboard').loginAs(producer)
    deniedDashboard.assertStatus(403)
    const deniedFarms = await client.get('/api/v1/farms').loginAs(producer)
    deniedFarms.assertStatus(403)
    const deniedHarvests = await client.get('/api/v1/harvests').loginAs(producer)
    deniedHarvests.assertStatus(403)
  })
})
