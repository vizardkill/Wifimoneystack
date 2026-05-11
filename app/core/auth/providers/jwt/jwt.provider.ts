import { trackError } from '@lib/functions/_track_error.function'
import {
  type AuthLoginPayload,
  AuthProviderType,
  type AuthRegisterPayload,
  type AuthResult,
  type AuthValidationResult,
  type IAuthProvider
} from '@lib/interfaces'
import { type JWTLoginPayload, type JWTRegisterPayload } from '@lib/interfaces/_auth.interfaces'

import { CLS_JWTLogin } from './services/_jwt-login.service'
import { CLS_JWTRegister } from './services/_jwt-register.service'
import { CLS_JWTValidateToken } from './services/_jwt-validate-token.service'

/**
 * Proveedor de autenticación JWT
 * Actúa como Facade delegando a servicios específicos
 */
export class CLS_JWTProvider implements IAuthProvider {
  readonly providerType = AuthProviderType.JWT

  /**
   * Registra un nuevo usuario con JWT
   * Delega al servicio CLS_JWTRegister
   */
  async register(payload: AuthRegisterPayload): Promise<AuthResult> {
    try {
      const jwtPayload = payload as JWTRegisterPayload
      const service = new CLS_JWTRegister(jwtPayload)
      return await service.main()
    } catch (error) {
      trackError({
        method: 'CLS_JWTProvider.register',
        error: error as Error,
        controller: 'jwt-provider'
      })

      throw error
    }
  }

  /**
   * Autentica un usuario existente con JWT
   * Delega al servicio CLS_JWTLogin
   */
  async authenticate(payload: AuthLoginPayload): Promise<AuthResult> {
    try {
      const jwtPayload = payload as JWTLoginPayload
      const service = new CLS_JWTLogin(jwtPayload)
      return await service.main()
    } catch (error) {
      trackError({
        method: 'CLS_JWTProvider.authenticate',
        error: error as Error,
        controller: 'jwt-provider'
      })

      throw error
    }
  }

  /**
   * Valida un token JWT
   * Delega al servicio CLS_JWTValidateToken
   */
  async validateToken(token: string): Promise<AuthValidationResult> {
    try {
      const service = new CLS_JWTValidateToken(token)
      return (await service.execute()) as AuthValidationResult
    } catch (error) {
      trackError({
        method: 'CLS_JWTProvider.validateToken',
        error: error as Error,
        controller: 'jwt-provider'
      })

      return {
        valid: false,
        error: 'Error al validar token'
      }
    }
  }
}
