import {
  adminFarmListValidator,
  createFarmValidator,
  farmListValidator,
  updateFarmValidator,
} from '#modules/farms/farm.validator'
import { CreateFarmUseCase } from '#modules/farms/use-cases/create_farm.use_case'
import { DeleteFarmUseCase } from '#modules/farms/use-cases/delete_farm.use_case'
import { GetFarmUseCase } from '#modules/farms/use-cases/get_farm.use_case'
import { ListFarmsUseCase } from '#modules/farms/use-cases/list_farms.use_case'
import { ListAllFarmsUseCase } from '#modules/farms/use-cases/list_all_farms.use_case'
import { UpdateFarmUseCase } from '#modules/farms/use-cases/update_farm.use_case'
import type { HttpContext } from '@adonisjs/core/http'

export default class FarmsController {
  async all({ request, response, auth }: HttpContext) {
    const filters = await request.validateUsing(adminFarmListValidator)
    const result = await new ListAllFarmsUseCase().execute(auth.getUserOrFail(), filters)
    return response.ok(result)
  }

  async index({ params, request, response, auth }: HttpContext) {
    const filters = await request.validateUsing(farmListValidator)
    const result = await new ListFarmsUseCase().execute(
      auth.getUserOrFail(),
      params.idProducer,
      filters
    )
    return response.ok(result)
  }

  async store({ params, request, response, auth }: HttpContext) {
    const input = await request.validateUsing(createFarmValidator)
    const farm = await new CreateFarmUseCase().execute(
      auth.getUserOrFail(),
      params.idProducer,
      input,
      request.id()
    )
    return response.created({ data: farm })
  }

  async show({ params, response, auth }: HttpContext) {
    const farm = await new GetFarmUseCase().execute(auth.getUserOrFail(), params.idFarm)
    return response.ok({ data: farm })
  }

  async update({ params, request, response, auth }: HttpContext) {
    const input = await request.validateUsing(updateFarmValidator)
    const farm = await new UpdateFarmUseCase().execute(
      auth.getUserOrFail(),
      params.idFarm,
      input,
      request.id()
    )
    return response.ok({ data: farm })
  }

  async destroy({ params, request, response, auth }: HttpContext) {
    await new DeleteFarmUseCase().execute(auth.getUserOrFail(), params.idFarm, request.id())
    return response.noContent()
  }
}
