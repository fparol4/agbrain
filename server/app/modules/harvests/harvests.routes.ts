import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const HarvestsController = () => import('#modules/harvests/harvests.controller')

router
  .group(() => {
    router.get('/producers/:idProducer/harvests', [HarvestsController, 'index'])
    router.post('/farms/:idFarm/harvests', [HarvestsController, 'store'])
    router.patch('/harvests/:idHarvest', [HarvestsController, 'update'])
    router.delete('/harvests/:idHarvest', [HarvestsController, 'destroy'])
  })
  .prefix('/api/v1')
  .use(middleware.auth())
