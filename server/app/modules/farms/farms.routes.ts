import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const FarmsController = () => import('#modules/farms/farms.controller')

router
  .group(() => {
    router.get('/farms', [FarmsController, 'all'])
    router.get('/producers/:idProducer/farms', [FarmsController, 'index'])
    router.post('/producers/:idProducer/farms', [FarmsController, 'store'])
    router.get('/farms/:idFarm', [FarmsController, 'show'])
    router.patch('/farms/:idFarm', [FarmsController, 'update'])
    router.delete('/farms/:idFarm', [FarmsController, 'destroy'])
  })
  .prefix('/api/v1')
  .use(middleware.auth())
