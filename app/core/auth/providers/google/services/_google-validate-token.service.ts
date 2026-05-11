import { UserDB } from '@/core/auth/db/user.db'
import { trackError } from '@/lib/functions/_track_error.function'

import { validateGoogleToken } from '@lib/helpers/_google-oauth.helper'

import { type GOOGLE_VALIDATE_TOKEN } from '../google.types'

type RequestResponse = GOOGLE_VALIDATE_TOKEN.RequestResponse

/**
 * Servicio simple para validar tokens de Google
 */
export class CLS_GoogleValidateToken {
  constructor(private token: string) {}

  public async execute(): Promise<RequestResponse> {
    try {
      const googleProfile = await validateGoogleToken(this.token)
      if (!googleProfile) {
        return {
          valid: false,
          error: 'Token de Google inválido'
        }
      }

      const user = await UserDB.findByEmail(googleProfile.email)
      if (!user) {
        return {
          valid: false,
          error: 'Usuario no encontrado'
        }
      }

      return {
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        }
      }
    } catch (error) {
      trackError({
        method: 'CLS_GoogleValidateToken.execute',
        controller: 'google-validate-token',
        error: error as Error
      })
      return {
        valid: false,
        error: 'Error al validar token de Google'
      }
    }
  }
}
