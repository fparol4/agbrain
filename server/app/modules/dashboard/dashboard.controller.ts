import { dashboardValidator } from '#modules/dashboard/dashboard.validator'
import { GetProducerDashboardUseCase } from '#modules/dashboard/use-cases/get_producer_dashboard.use_case'
import type { HttpContext } from '@adonisjs/core/http'

export default class DashboardController {
  async show({ params, request, response, auth }: HttpContext) {
    const { year } = await request.validateUsing(dashboardValidator)
    const dashboard = await new GetProducerDashboardUseCase().execute(
      auth.getUserOrFail(),
      params.idProducer,
      year,
      request.id()
    )
    return response.ok({ data: dashboard })
  }
}
