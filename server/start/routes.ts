/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import '#modules/auth/auth.routes'
import '#modules/producers/producers.routes'
import '#modules/farms/farms.routes'
import '#modules/harvests/harvests.routes'
import '#modules/dashboard/dashboard.routes'
import '#modules/audit/audit.routes'
import '#modules/health/health.routes'

router.get('/', async () => ({ name: 'Ag Brain API', version: 'v1' }))
