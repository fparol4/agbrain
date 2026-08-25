import {
  adminHarvestListValidator,
  createHarvestValidator,
  harvestListValidator,
  updateHarvestValidator,
} from '#modules/harvests/harvest.validator'
import { CreateHarvestUseCase } from '#modules/harvests/use-cases/create_harvest.use_case'
import { DeleteHarvestUseCase } from '#modules/harvests/use-cases/delete_harvest.use_case'
import { ListHarvestsUseCase } from '#modules/harvests/use-cases/list_harvests.use_case'
import { ListAllHarvestsUseCase } from '#modules/harvests/use-cases/list_all_harvests.use_case'
import { UpdateHarvestUseCase } from '#modules/harvests/use-cases/update_harvest.use_case'
import type { HttpContext } from '@adonisjs/core/http'

export default class HarvestsController {
  async all({ request, response, auth }: HttpContext) {
    const filters = await request.validateUsing(adminHarvestListValidator)
    const result = await new ListAllHarvestsUseCase().execute(auth.getUserOrFail(), filters)
    return response.ok(result)
  }

  async index({ params, request, response, auth }: HttpContext) {
    const filters = await request.validateUsing(harvestListValidator)
    const result = await new ListHarvestsUseCase().execute(
      auth.getUserOrFail(),
      params.idProducer,
      filters
    )
    return response.ok(result)
  }

  async store({ params, request, response, auth }: HttpContext) {
    const input = await request.validateUsing(createHarvestValidator)
    const harvest = await new CreateHarvestUseCase().execute(
      auth.getUserOrFail(),
      params.idFarm,
      input,
      request.id()
    )
    return response.created({ data: harvest })
  }

  async update({ params, request, response, auth }: HttpContext) {
    const input = await request.validateUsing(updateHarvestValidator)
    const harvest = await new UpdateHarvestUseCase().execute(
      auth.getUserOrFail(),
      params.idHarvest,
      input,
      request.id()
    )
    return response.ok({ data: harvest })
  }

  async destroy({ params, request, response, auth }: HttpContext) {
    await new DeleteHarvestUseCase().execute(auth.getUserOrFail(), params.idHarvest, request.id())
    return response.noContent()
  }
}
