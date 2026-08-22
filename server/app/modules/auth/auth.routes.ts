import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const AuthController = () => import('#modules/auth/auth.controller')

router
  .group(() => {
    router.post('/login', [AuthController, 'login'])
    router.get('/me', [AuthController, 'me']).use(middleware.auth())
    router.delete('/session', [AuthController, 'logout']).use(middleware.auth())
  })
  .prefix('/api/v1/auth')
