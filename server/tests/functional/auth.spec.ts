import { test } from '@japa/runner'

test.group('Auth', () => {
  test('logs in with valid demo credentials', async ({ client }) => {
    const response = await client.post('/api/v1/auth/login').json({
      email: 'joao@raiz.demo',
      password: 'demo123',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      user: {
        name: 'João Oliveira',
        role: 'PRODUCER',
      },
    })
  })

  test('returns a generic error for invalid credentials', async ({ client }) => {
    const response = await client.post('/api/v1/auth/login').json({
      email: 'joao@raiz.demo',
      password: 'invalid-password',
    })

    response.assertStatus(401)
    response.assertBodyContains({
      error: { code: 'E_INVALID_CREDENTIALS' },
    })
  })

  test('protects the current session endpoint', async ({ client }) => {
    const response = await client.get('/api/v1/auth/me').header('accept', 'application/json')
    response.assertStatus(401)
    response.assertBodyContains({ error: { code: 'E_UNAUTHORIZED' } })
  })

  test('returns validation details without exposing internals', async ({ client }) => {
    const response = await client.post('/api/v1/auth/login').json({
      email: 'not-an-email',
      password: 'short',
    })

    response.assertStatus(422)
    response.assertBodyContains({ error: { code: 'E_VALIDATION_ERROR' } })
  })

  test('reports database readiness', async ({ client }) => {
    const response = await client.get('/health')

    response.assertStatus(200)
    response.assertBodyContains({ status: 'ok', checks: { database: 'up' } })
  })
})
