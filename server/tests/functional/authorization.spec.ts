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
  })

  test('prevents a producer from reading another dashboard', async ({ client }) => {
    const producer = await User.findOrFail('00000000-0000-4000-8000-000000000002')

    const own = await client.get(`/api/v1/producers/${joaoProducer}/dashboard`).loginAs(producer)
    own.assertStatus(200)

    const another = await client.get(`/api/v1/producers/${anaProducer}/dashboard`).loginAs(producer)
    another.assertStatus(403)
  })
})
