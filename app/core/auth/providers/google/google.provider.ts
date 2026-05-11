import { UserDB } from '@/core/auth/db/user.db'

import { trackError } from '@lib/functions/_track_error.function'
import { exchangeGoogleCodeForTokens, generateGoogleAuthUrl, validateGoogleToken } from '@lib/helpers/_google-oauth.helper'
import {
  type AuthLinkResult,
  type AuthLoginPayload,
  AuthProviderType,
  type AuthRegisterPayload,
  type AuthResult,
  type AuthValidationResult,
  type IAuthProvider
} from '@lib/interfaces'
import { type GoogleLoginPayload, type GoogleRegisterPayload } from '@lib/interfaces/_auth.interfaces'

import { type GoogleUserProfile } from './google.types'
import { CLS_GoogleLogin } from './services/_google-login.service'
import { CLS_GoogleRegister } from './services/_google-register.service'
import { CLS_GoogleValidateToken } from './services/_google-validate-token.service'

/**
 * Proveedor de autenticación Google OAuth2
 * Actúa como Facade delegando a servicios específicos
 */
export class CLS_GoogleProvider implements IAuthProvider {
  readonly providerType = AuthProviderType.GOOGLE

  /**
   * Registra un nuevo usuario con Google OAuth
   * Delega al servicio CLS_GoogleRegister
   */
  async register(payload: AuthRegisterPayload): Promise<AuthResult> {
    try {
      const googlePayload = payload as GoogleRegisterPayload
      const service = new CLS_GoogleRegister(googlePayload)
      return await service.main()
    } catch (error) {
      trackError({
        method: 'CLS_GoogleProvider.register',
        error: error as Error,
        controller: 'google-provider'
      })

      throw error
    }
  }

  /**
   * Autentica un usuario existente con Google OAuth
   * Delega al servicio CLS_GoogleLogin
   */
  async authenticate(payload: AuthLoginPayload): Promise<AuthResult> {
    try {
      const googlePayload = payload as GoogleLoginPayload
      const service = new CLS_GoogleLogin(googlePayload)
      return await service.main()
    } catch (error) {
      trackError({
        method: 'CLS_GoogleProvider.authenticate',
        error: error as Error,
        controller: 'google-provider'
      })

      throw error
    }
  }

  /**
   * Valida un token de Google
   * Delega al servicio CLS_GoogleValidateToken
   */
  async validateToken(token: string): Promise<AuthValidationResult> {
    try {
      const service = new CLS_GoogleValidateToken(token)
      return (await service.execute()) as AuthValidationResult
    } catch (_error) {
      return {
        valid: false,
        error: 'Error al validar token de Google'
      }
    }
  }

  /**
   * Vincula una cuenta existente con Google
   */
  async linkAccount(userId: string, providerData: Record<string, unknown>): Promise<AuthLinkResult> {
    try {
      const accessToken = providerData.access_token as string
      if (!accessToken) {
        return {
          success: false,
          message: 'Token de acceso de Google requerido'
        }
      }

      const googleProfile = await validateGoogleToken(accessToken)
      if (!googleProfile) {
        return {
          success: false,
          message: 'Token de Google inválido'
        }
      }

      const user = await UserDB.getById(userId)
      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado'
        }
      }

      if (user.email !== googleProfile.email) {
        return {
          success: false,
          message: 'El email de Google no coincide con el de la cuenta'
        }
      }

      await UserDB.update(userId, {
        email_verified: googleProfile.verified_email,
        is_active: true
      })

      return {
        success: true,
        message: 'Cuenta vinculada exitosamente con Google'
      }
    } catch (error) {
      trackError({
        method: 'CLS_GoogleProvider.linkAccount',
        error: error as Error,
        controller: 'google-provider'
      })

      return {
        success: false,
        message: 'Error al vincular cuenta con Google'
      }
    }
  }

  /**
   * Genera URL de autorización de Google
   */
  generateAuthUrl(state: string): string {
    return generateGoogleAuthUrl(state)
  }

  /**
   * Intercambia authorization code por tokens
   */
  async exchangeCodeForTokens(code: string): Promise<GoogleUserProfile | null> {
    return exchangeGoogleCodeForTokens(code)
  }
}
