import {
  createProducerValidator,
  producerListValidator,
  updateProducerValidator,
} from '#modules/producers/producer.validator'
import { CreateProducerUseCase } from '#modules/producers/use-cases/create_producer.use_case'
import { DeleteProducerUseCase } from '#modules/producers/use-cases/delete_producer.use_case'
import { GetProducerUseCase } from '#modules/producers/use-cases/get_producer.use_case'
import { ListProducersUseCase } from '#modules/producers/use-cases/list_producers.use_case'
import { UpdateProducerUseCase } from '#modules/producers/use-cases/update_producer.use_case'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProducersController {
  async index({ request, response, auth }: HttpContext) {
    const filters = await request.validateUsing(producerListValidator)
    const result = await new ListProducersUseCase().execute(auth.getUserOrFail(), filters)
    return response.ok(result)
  }

  async store({ request, response, auth }: HttpContext) {
    const input = await request.validateUsing(createProducerValidator)
    const producer = await new CreateProducerUseCase().execute(
      auth.getUserOrFail(),
      input,
      request.id()
    )
    return response.created({ data: producer })
  }

  async show({ params, response, auth }: HttpContext) {
    const producer = await new GetProducerUseCase().execute(auth.getUserOrFail(), params.idProducer)
    return response.ok({ data: producer })
  }

  async update({ params, request, response, auth }: HttpContext) {
    const input = await request.validateUsing(updateProducerValidator)
    const producer = await new UpdateProducerUseCase().execute(
      auth.getUserOrFail(),
      params.idProducer,
      input,
      request.id()
    )
    return response.ok({ data: producer })
  }

  async destroy({ params, request, response, auth }: HttpContext) {
    await new DeleteProducerUseCase().execute(auth.getUserOrFail(), params.idProducer, request.id())
    return response.noContent()
  }
}
