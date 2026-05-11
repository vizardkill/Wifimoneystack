import { type User } from '@prisma/client'
import crypto from 'crypto'

import { UserAuthProviderDB } from '@/core/auth/db/user-auth-provider.db'
import { UserDB } from '@/core/auth/db/user.db'

import { trackError } from '@lib/functions/_track_error.function'
import { logAuthActivityExtra } from '@lib/helpers/_activity-log.helper'
import { validateGoogleToken } from '@lib/helpers/_google-oauth.helper'
import { generateJWTToken } from '@lib/helpers/_jwt.helper'
import { AuthResultStatus } from '@lib/interfaces'
import { type GoogleRegisterPayload } from '@lib/interfaces/_auth.interfaces'

import { GOOGLE_REGISTER, type GoogleUserProfile } from '../google.types'

type RequestStatus = GOOGLE_REGISTER.RequestStatus
type RequestResponse = GOOGLE_REGISTER.RequestResponse

/**
 * Servicio para registrar usuarios con Google OAuth
 */
export class CLS_GoogleRegister {
  private _statusRequest: RequestStatus = GOOGLE_REGISTER.RequestStatus.Pending
  private _requestResponse: RequestResponse = {
    status: AuthResultStatus.ERROR,
    error: true,
    message: 'Proceso no iniciado'
  }
  private _payload: GoogleRegisterPayload
  private _googleProfile!: GoogleUserProfile
  private _user!: User

  constructor(payload: GoogleRegisterPayload) {
    this._payload = payload
  }

  public async main(): Promise<RequestResponse> {
    try {
      const commands = [
        this._validateGoogleToken,
        this._checkExistingUser,
        this._createUser,
        this._updateUserStatus,
        this._createAuthProvider,
        this._generateToken,
        this._logActivity,
        this._buildSuccessResponse
      ]

      for (const command of commands) {
        if (this._statusRequest === GOOGLE_REGISTER.RequestStatus.Error || this._statusRequest === GOOGLE_REGISTER.RequestStatus.Completed) {
          break
        }
        await command.call(this)
      }

      return this._requestResponse
    } catch (error) {
      // Si el error fue controlado por un Command (status ya es Error), devolver
      // la respuesta específica que ese Command preparó (ej: "usuario ya existe").
      if (this._statusRequest === GOOGLE_REGISTER.RequestStatus.Error && this._requestResponse.message !== 'Proceso no iniciado') {
        trackError({
          error: error as Error,
          method: 'CLS_GoogleRegister.main',
          controller: 'google-register'
        })
        return this._requestResponse
      }

      this._statusRequest = GOOGLE_REGISTER.RequestStatus.Error

      trackError({
        error: error as Error,
        method: 'CLS_GoogleRegister.main',
        controller: 'google-register'
      })

      return {
        status: AuthResultStatus.ERROR,
        error: true,
        message: 'Error interno durante el registro con Google'
      }
    }
  }

  /**
   * Command 1: Valida el token de Google
   */
  private async _validateGoogleToken(): Promise<void> {
    this._statusRequest = GOOGLE_REGISTER.RequestStatus.ValidatingToken

    const googleProfile = await validateGoogleToken(this._payload.provider_data.access_token)
    if (!googleProfile) {
      this._statusRequest = GOOGLE_REGISTER.RequestStatus.Error
      this._requestResponse = {
        status: AuthResultStatus.ERROR,
        error: true,
        message: 'Token de Google inválido'
      }
      throw new Error('Invalid Google token')
    }

    this._googleProfile = googleProfile
  }

  /**
   * Command 2: Verifica si el usuario ya existe
   */
  private async _checkExistingUser(): Promise<void> {
    this._statusRequest = GOOGLE_REGISTER.RequestStatus.CheckingExistingUser

    const existingUser = await UserDB.findByEmail(this._googleProfile.email)
    if (existingUser) {
      this._statusRequest = GOOGLE_REGISTER.RequestStatus.Error
      this._requestResponse = {
        status: AuthResultStatus.ERROR,
        error: true,
        message: 'El email ya está registrado'
      }
      throw new Error('User already exists')
    }
  }

  /**
   * Command 3: Crea el usuario con datos de Google
   */
  private async _createUser(): Promise<void> {
    this._statusRequest = GOOGLE_REGISTER.RequestStatus.CreatingUser
    const randomPassword = crypto.randomBytes(32).toString('hex')

    this._user = await UserDB.create({
      first_name: this._googleProfile.given_name || this._payload.first_name,
      last_name: this._googleProfile.family_name || this._payload.last_name,
      email: this._googleProfile.email,
      password: randomPassword,
      email_verified: this._googleProfile.verified_email,
      is_active: this._googleProfile.verified_email
    })
  }

  /**
   * Command 4: Actualiza el estado del usuario si Google verifica el email
   */
  private async _updateUserStatus(): Promise<void> {
    this._statusRequest = GOOGLE_REGISTER.RequestStatus.UpdatingUserStatus

    if (this._googleProfile.verified_email) {
      await UserDB.update(this._user.id, {
        email_verified: true,
        is_active: true
      })
    }
  }

  /**
   * Command 5: Crea el registro de proveedor de autenticación
   */
  private async _createAuthProvider(): Promise<void> {
    this._statusRequest = GOOGLE_REGISTER.RequestStatus.CreatingAuthProvider

    await UserAuthProviderDB.create({
      user_id: this._user.id,
      provider_type: 'google',
      provider_id: this._googleProfile.id,
      provider_data: {
        google_id: this._googleProfile.id,
        access_token: this._payload.provider_data.access_token,
        profile: this._payload.provider_data.profile
      },
      is_primary: true
    })
  }

  /**
   * Command 6: Genera el token JWT
   */
  private async _generateToken(): Promise<void> {
    this._statusRequest = GOOGLE_REGISTER.RequestStatus.GeneratingToken

    const jwtResult = await generateJWTToken(this._user)

    if (jwtResult.error) {
      this._statusRequest = GOOGLE_REGISTER.RequestStatus.Error
      this._requestResponse = jwtResult
      throw new Error('Failed to generate JWT token')
    }

    this._requestResponse = {
      status: AuthResultStatus.SUCCESS,
      error: false,
      message: 'Usuario registrado exitosamente con Google',
      data: {
        token: jwtResult.data?.token,
        user: {
          id: this._user.id,
          email: this._user.email,
          first_name: this._user.first_name,
          last_name: this._user.last_name,
          role: this._user.role
        },
        provider_data: {
          google_id: this._googleProfile.id,
          verified_email: this._googleProfile.verified_email
        }
      }
    }
  }

  /**
   * Command 7: Registra la actividad
   */
  private async _logActivity(): Promise<void> {
    this._statusRequest = GOOGLE_REGISTER.RequestStatus.LoggingActivity

    await logAuthActivityExtra.registered({
      id: this._user.id,
      email: this._user.email,
      first_name: this._user.first_name,
      last_name: this._user.last_name,
      role: this._user.role
    })
  }

  /**
   * Command 8: Construye la respuesta exitosa
   */
  private async _buildSuccessResponse(): Promise<void> {
    this._statusRequest = GOOGLE_REGISTER.RequestStatus.Completed
  }
}
