import { AuditService } from '#modules/audit/services/audit.service'
import { loginValidator } from '#modules/auth/auth.validator'
import { AuthenticationService } from '#modules/auth/services/authentication.service'
import { LoginUseCase } from '#modules/auth/use-cases/login.use-case'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  private loginUseCase = new LoginUseCase()
  private authenticationService = new AuthenticationService()
  private auditService = new AuditService()

  async login({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)
    const user = await this.loginUseCase.execute(payload)

    await auth.use('web').login(user)
    await this.auditService.record({
      user,
      action: 'LOGIN',
      resourceType: 'SESSION',
      resourceName: 'Sessão iniciada',
      idResource: user.idUser,
      requestId: request.id(),
    })

    return response.ok({ user: await this.authenticationService.serializeSession(user) })
  }

  async me({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    return response.ok({ user: await this.authenticationService.serializeSession(user) })
  }

  async logout({ request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    await this.auditService.record({
      user,
      action: 'LOGOUT',
      resourceType: 'SESSION',
      resourceName: 'Sessão encerrada',
      idResource: user.idUser,
      requestId: request.id(),
    })
    await auth.use('web').logout()
    return response.noContent()
  }
}
