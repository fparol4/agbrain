import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const AuditController = () => import('#modules/audit/audit.controller')

router.get('/api/v1/audit', [AuditController, 'index']).use(middleware.auth())
