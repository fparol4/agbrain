import router from '@adonisjs/core/services/router'

const HealthController = () => import('#modules/health/health.controller')

router.get('/health', [HealthController, 'show'])
