import { type JwtPayload } from 'jsonwebtoken'

import { UserDB } from '@/core/auth/db/user.db'

import { trackError } from '@lib/functions/_track_error.function'
import { validateJWTToken } from '@lib/helpers/_jwt.helper'

import { type JWT_VALIDATE_TOKEN } from '../jwt.types'

type RequestResponse = JWT_VALIDATE_TOKEN.RequestResponse

/**
 * Servicio simple para validar tokens JWT
 */
export class CLS_JWTValidateToken {
  constructor(private token: string) {}

  public async execute(): Promise<RequestResponse> {
    try {
      const decoded = await validateJWTToken(this.token)
      if (typeof decoded === 'string' || typeof decoded.id !== 'string' || typeof decoded.exp !== 'number') {
        return {
          valid: false,
          error: 'Token inválido o expirado'
        }
      }

      const payload = decoded as JwtPayload & { id: string; exp: number }

      const user = await UserDB.getById(payload.id)
      if (!user?.is_active) {
        return {
          valid: false,
          error: 'Usuario no encontrado o inactivo'
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
        },
        expires_at: new Date(payload.exp * 1000)
      }
    } catch (error) {
      trackError({
        method: 'CLS_JWTValidateToken.execute',
        error: error as Error,
        controller: 'jwt-validate-token'
      })

      return {
        valid: false,
        error: 'Token inválido o expirado'
      }
    }
  }
}
