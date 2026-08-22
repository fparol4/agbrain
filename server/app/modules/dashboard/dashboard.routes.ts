import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const DashboardController = () => import('#modules/dashboard/dashboard.controller')

router
  .get('/api/v1/producers/:idProducer/dashboard', [DashboardController, 'show'])
  .use(middleware.auth())
