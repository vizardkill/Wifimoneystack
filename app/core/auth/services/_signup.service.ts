import { AuthProviderFactory } from '@/core/auth/providers/_auth-provider.factory'
import { authOrchestrator } from '@/core/auth/providers/_auth-provider.orchestrator'

import { trackError } from '@lib/functions/_track_error.function'
import { AuthProviderType, AuthResultStatus } from '@lib/interfaces'
import { type JWTRegisterPayload } from '@lib/interfaces/_auth.interfaces'

import { type CONFIG_REGISTER_USER } from '@types'

export class CLS_RegisterUser {
  private _payload!: CONFIG_REGISTER_USER.Payload
  private _requestResponse!: CONFIG_REGISTER_USER.RequestResponse

  constructor(payload: CONFIG_REGISTER_USER.Payload) {
    this._payload = payload
    this._initializeAuthProviders()
  }

  /**
   * Inicializa los proveedores de autenticación
   */
  private _initializeAuthProviders(): void {
    const jwtProvider = AuthProviderFactory.getProvider(AuthProviderType.JWT)
    authOrchestrator.registerProvider(jwtProvider)
  }

  public async main(): Promise<CONFIG_REGISTER_USER.RequestResponse> {
    try {
      const authPayload: JWTRegisterPayload = {
        first_name: this._payload.first_name,
        last_name: this._payload.last_name,
        email: this._payload.email,
        country_id: this._payload.country_id,
        provider_type: AuthProviderType.JWT,
        password: this._payload.password,
        provider_data: {
          password: this._payload.password
        }
      }

      const result = await authOrchestrator.register(authPayload)

      if (result.error) {
        this._requestResponse = {
          error: true,
          message: result.message,
          status: result.status,
          field: result.field,
          suggestion: result.suggestion
        }
      } else if (result.status === AuthResultStatus.PARTIAL_SUCCESS || result.status === AuthResultStatus.PENDING_VERIFICATION) {
        this._requestResponse = {
          error: false,
          message: result.message,
          status: result.status,
          data: {
            user: result.data?.user
              ? {
                  id: result.data.user.id || '',
                  email: result.data.user.email || '',
                  first_name: result.data.user.first_name || '',
                  last_name: result.data.user.last_name || ''
                }
              : undefined,
            token: result.data?.token
          }
        }
      } else {
        this._requestResponse = {
          error: false,
          message: result.message,
          data: {
            user: result.data?.user
              ? {
                  id: result.data.user.id || '',
                  email: result.data.user.email || '',
                  first_name: result.data.user.first_name || '',
                  last_name: result.data.user.last_name || ''
                }
              : undefined,
            token: result.data?.token
          }
        }
      }

      return this._requestResponse
    } catch (error) {
      trackError({
        method: 'CLS_RegisterUser.main',
        controller: 'register-user',
        error: error as Error,
        additionalContext: { email: this._payload.email }
      })
      this._requestResponse = {
        error: true,
        message: 'Error interno durante el registro'
      }
      return this._requestResponse
    }
  }
}
