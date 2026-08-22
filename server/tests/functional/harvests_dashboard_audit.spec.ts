import User from '#modules/auth/user.model'
import { test } from '@japa/runner'

const idProducer = '00000000-0000-4000-8000-000000000101'

test.group('Harvests, dashboard and audit', () => {
  test('returns harvests with farm and producer names', async ({ client }) => {
    const producer = await User.findOrFail('00000000-0000-4000-8000-000000000002')
    const response = await client
      .get(`/api/v1/producers/${idProducer}/harvests?year=2026`)
      .loginAs(producer)

    response.assertStatus(200)
    response.assertBodyContains({
      data: [
        {
          producerName: 'João Oliveira',
          year: 2026,
        },
      ],
    })
  })

  test('returns all dashboard aggregations', async ({ client, assert }) => {
    const admin = await User.findOrFail('00000000-0000-4000-8000-000000000001')
    const response = await client
      .get(`/api/v1/producers/${idProducer}/dashboard?year=2026`)
      .loginAs(admin)

    response.assertStatus(200)
    const dashboard = response.body().data
    assert.equal(dashboard.totalFarms, 5)
    assert.equal(dashboard.totalHectares, 18540)
    assert.lengthOf(dashboard.states, 3)
    assert.lengthOf(dashboard.areaProgress, 7)
  })

  test('exposes audit events only to administrators', async ({ client }) => {
    const admin = await User.findOrFail('00000000-0000-4000-8000-000000000001')
    const producer = await User.findOrFail('00000000-0000-4000-8000-000000000002')

    const denied = await client.get('/api/v1/audit').loginAs(producer)
    denied.assertStatus(403)

    const allowed = await client.get('/api/v1/audit').loginAs(admin)
    allowed.assertStatus(200)
  })
})
