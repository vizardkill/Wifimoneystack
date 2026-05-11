import { type User } from '@prisma/client'
import bcrypt from 'bcryptjs'

import { UserDB } from '@/core/auth/db/user.db'

import { trackError } from '@lib/functions/_track_error.function'
import { logAuthActivityExtra } from '@lib/helpers/_activity-log.helper'
import { generateJWTToken } from '@lib/helpers/_jwt.helper'
import { AuthResultStatus } from '@lib/interfaces'
import { type JWTLoginPayload } from '@lib/interfaces/_auth.interfaces'

import { JWT_LOGIN } from '../jwt.types'

type RequestStatus = JWT_LOGIN.RequestStatus
type RequestResponse = JWT_LOGIN.RequestResponse

/**
 * Servicio para autenticar usuarios con JWT
 */
export class CLS_JWTLogin {
  private _statusRequest: RequestStatus = JWT_LOGIN.RequestStatus.Pending
  private _requestResponse: RequestResponse = {
    status: AuthResultStatus.ERROR,
    error: true,
    message: 'Proceso no iniciado'
  }
  private _payload: JWTLoginPayload
  private _user!: User

  constructor(payload: JWTLoginPayload) {
    this._payload = payload
  }

  public async main(): Promise<RequestResponse> {
    try {
      const commands = [
        this._validatePayload,
        this._fetchUser,
        this._validatePassword,
        this._checkActiveStatus,
        this._generateToken,
        this._logActivity,
        this._buildSuccessResponse
      ]

      for (const command of commands) {
        if (this._statusRequest === JWT_LOGIN.RequestStatus.Error || this._statusRequest === JWT_LOGIN.RequestStatus.Completed) {
          break
        }
        await command.call(this)
      }

      return this._requestResponse
    } catch (error) {
      this._statusRequest = JWT_LOGIN.RequestStatus.Error

      trackError({
        error: error as Error,
        method: 'CLS_JWTLogin.main',
        controller: 'jwt-login'
      })

      return {
        status: AuthResultStatus.ERROR,
        error: true,
        message: 'Error interno durante la autenticación'
      }
    }
  }

  /**
   * Command 1: Valida el payload
   */
  private async _validatePayload(): Promise<void> {
    this._statusRequest = JWT_LOGIN.RequestStatus.ValidatingPayload

    if (!this._payload.email || !this._payload.password) {
      this._statusRequest = JWT_LOGIN.RequestStatus.Error
      this._requestResponse = {
        status: AuthResultStatus.ERROR,
        error: true,
        message: 'Email y contraseña son requeridos'
      }
      throw new Error('Missing credentials')
    }
  }

  /**
   * Command 2: Busca el usuario en la base de datos
   */
  private async _fetchUser(): Promise<void> {
    this._statusRequest = JWT_LOGIN.RequestStatus.FetchingUser

    const user = await UserDB.findByEmail(this._payload.email || '')
    if (!user) {
      this._statusRequest = JWT_LOGIN.RequestStatus.Error
      this._requestResponse = {
        status: AuthResultStatus.ERROR,
        error: true,
        message: 'Credenciales inválidas'
      }
      throw new Error('User not found')
    }

    this._user = user
  }

  /**
   * Command 3: Valida la contraseña
   */
  private async _validatePassword(): Promise<void> {
    this._statusRequest = JWT_LOGIN.RequestStatus.ValidatingPassword

    const isPasswordValid = await bcrypt.compare(this._payload.password, this._user.password)
    if (!isPasswordValid) {
      this._statusRequest = JWT_LOGIN.RequestStatus.Error
      this._requestResponse = {
        status: AuthResultStatus.ERROR,
        error: true,
        message: 'Credenciales inválidas'
      }
      throw new Error('Invalid password')
    }
  }

  /**
   * Command 4: Verifica si el usuario está activo
   */
  private async _checkActiveStatus(): Promise<void> {
    this._statusRequest = JWT_LOGIN.RequestStatus.CheckingActiveStatus

    if (!this._user.is_active) {
      this._statusRequest = JWT_LOGIN.RequestStatus.Error
      this._requestResponse = {
        status: AuthResultStatus.PENDING_VERIFICATION,
        error: true,
        message: 'Cuenta no activada. Verifica tu email.'
      }
      throw new Error('User not active')
    }
  }

  /**
   * Command 5: Genera el token JWT
   */
  private async _generateToken(): Promise<void> {
    this._statusRequest = JWT_LOGIN.RequestStatus.GeneratingToken

    const jwtResult = await generateJWTToken(this._user)

    if (jwtResult.error) {
      this._statusRequest = JWT_LOGIN.RequestStatus.Error
      this._requestResponse = jwtResult
      throw new Error('Failed to generate JWT token')
    }

    this._requestResponse = jwtResult
  }

  /**
   * Command 6: Registra la actividad de login
   */
  private async _logActivity(): Promise<void> {
    this._statusRequest = JWT_LOGIN.RequestStatus.LoggingActivity

    await logAuthActivityExtra.registered({
      id: this._user.id,
      email: this._user.email,
      first_name: this._user.first_name,
      last_name: this._user.last_name,
      role: this._user.role
    })
  }

  /**
   * Command 7: Construye la respuesta exitosa
   */
  private async _buildSuccessResponse(): Promise<void> {
    this._statusRequest = JWT_LOGIN.RequestStatus.Completed
  }
}
