import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const ProducersController = () => import('#modules/producers/producers.controller')

router
  .group(() => {
    router.get('/', [ProducersController, 'index'])
    router.post('/', [ProducersController, 'store'])
    router.get('/:idProducer', [ProducersController, 'show'])
    router.patch('/:idProducer', [ProducersController, 'update'])
    router.delete('/:idProducer', [ProducersController, 'destroy'])
  })
  .prefix('/api/v1/producers')
  .use(middleware.auth())
