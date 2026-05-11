import { type User } from '@prisma/client'

import { UserAuthProviderDB } from '@/core/auth/db/user-auth-provider.db'
import { UserDB } from '@/core/auth/db/user.db'

import { trackError } from '@lib/functions/_track_error.function'
import { logAuthActivityExtra } from '@lib/helpers/_activity-log.helper'
import { generateJWTToken } from '@lib/helpers/_jwt.helper'
import { AuthResultStatus } from '@lib/interfaces'
import { type GoogleLoginPayload } from '@lib/interfaces/_auth.interfaces'

import { GOOGLE_LOGIN } from '../google.types'

type RequestStatus = GOOGLE_LOGIN.RequestStatus
type RequestResponse = GOOGLE_LOGIN.RequestResponse

/**
 * Servicio para autenticar usuarios con Google OAuth
 */
export class CLS_GoogleLogin {
  private _statusRequest: RequestStatus = GOOGLE_LOGIN.RequestStatus.Pending
  private _requestResponse: RequestResponse = {
    status: AuthResultStatus.ERROR,
    error: true,
    message: 'Proceso no iniciado'
  }
  private _payload: GoogleLoginPayload
  private _user: User | null = null

  constructor(payload: GoogleLoginPayload) {
    this._payload = payload
  }

  public async main(): Promise<RequestResponse> {
    try {
      const commands = [
        this._fetchUser,
        this._checkActiveStatus,
        this._verifyOrCreateProvider,
        this._generateToken,
        this._logActivity,
        this._buildSuccessResponse
      ]

      for (const command of commands) {
        if (this._statusRequest === GOOGLE_LOGIN.RequestStatus.Error || this._statusRequest === GOOGLE_LOGIN.RequestStatus.Completed) {
          break
        }
        await command.call(this)
      }

      return this._requestResponse
    } catch (error) {
      this._statusRequest = GOOGLE_LOGIN.RequestStatus.Error

      trackError({
        error: error as Error,
        method: 'CLS_GoogleLogin.main',
        controller: 'google-login',
        user:
          this._user !== null
            ? {
                id: this._user.id,
                email: this._user.email,
                username: `${this._user.first_name} ${this._user.last_name}`.trim(),
                role: this._user.role
              }
            : undefined
      })

      return {
        status: AuthResultStatus.ERROR,
        error: true,
        message: 'Error interno durante la autenticación con Google'
      }
    }
  }

  /**
   * Command 1: Busca el usuario por google_id (si existe vínculo) o por email
   */
  private async _fetchUser(): Promise<void> {
    this._statusRequest = GOOGLE_LOGIN.RequestStatus.FetchingUser

    const googleId = this._payload.provider_data.google_id
    if (!googleId) {
      this._statusRequest = GOOGLE_LOGIN.RequestStatus.Error
      this._requestResponse = {
        status: AuthResultStatus.ERROR,
        error: true,
        message: 'Google ID no recibido. Intenta iniciar sesión de nuevo.'
      }
      throw new Error('Missing Google ID in payload')
    }

    const linkedProvider = await UserAuthProviderDB.getByProviderTypeAndProviderId('google', googleId)
    if (linkedProvider) {
      const linkedUser = await UserDB.getById(linkedProvider.user_id)
      if (linkedUser) {
        this._user = linkedUser
        return
      }
    }

    const normalizedEmail = this._payload.email?.trim().toLowerCase()
    const user = normalizedEmail ? await UserDB.findByEmail(normalizedEmail) : null
    if (!user) {
      this._statusRequest = GOOGLE_LOGIN.RequestStatus.Error
      this._requestResponse = {
        status: AuthResultStatus.ERROR,
        error: true,
        message: 'Usuario no encontrado. Regístrate primero.'
      }
      return
    }

    this._user = user
  }

  /**
   * Command 2: Verifica si el usuario está activo
   */
  private async _checkActiveStatus(): Promise<void> {
    this._statusRequest = GOOGLE_LOGIN.RequestStatus.CheckingActiveStatus

    if (this._user === null) {
      this._statusRequest = GOOGLE_LOGIN.RequestStatus.Error
      this._requestResponse = {
        status: AuthResultStatus.ERROR,
        error: true,
        message: 'No se pudo resolver el usuario autenticado.'
      }
      throw new Error('User not loaded before active status check')
    }

    if (!this._user.is_active) {
      this._statusRequest = GOOGLE_LOGIN.RequestStatus.Error
      this._requestResponse = {
        status: AuthResultStatus.PENDING_VERIFICATION,
        error: true,
        message: 'Cuenta no activada'
      }
      throw new Error('User not active')
    }
  }

  /**
   * Command 3: Verifica o crea el proveedor de Google
   */
  private async _verifyOrCreateProvider(): Promise<void> {
    this._statusRequest = GOOGLE_LOGIN.RequestStatus.VerifyingOrCreatingProvider

    if (this._user === null) {
      this._statusRequest = GOOGLE_LOGIN.RequestStatus.Error
      this._requestResponse = {
        status: AuthResultStatus.ERROR,
        error: true,
        message: 'No se pudo resolver el usuario autenticado.'
      }
      throw new Error('User not loaded before provider verification')
    }

    const googleProvider = await UserAuthProviderDB.getByUserIdAndProvider(this._user.id, 'google')
    const profileData = this._payload.provider_data.profile

    const nextProviderData = {
      google_id: this._payload.provider_data.google_id,
      access_token: this._payload.provider_data.access_token,
      ...(profileData !== undefined ? { profile: profileData } : {})
    }

    if (!googleProvider) {
      await UserAuthProviderDB.create({
        user_id: this._user.id,
        provider_type: 'google',
        provider_id: this._payload.provider_data.google_id,
        provider_data: nextProviderData,
        is_primary: false
      })
      return
    }

    await UserAuthProviderDB.update(this._user.id, 'google', {
      provider_id: this._payload.provider_data.google_id,
      provider_data: nextProviderData
    })
  }

  /**
   * Command 4: Genera el token JWT
   */
  private async _generateToken(): Promise<void> {
    this._statusRequest = GOOGLE_LOGIN.RequestStatus.GeneratingToken

    if (this._user === null) {
      this._statusRequest = GOOGLE_LOGIN.RequestStatus.Error
      this._requestResponse = {
        status: AuthResultStatus.ERROR,
        error: true,
        message: 'No se pudo resolver el usuario autenticado.'
      }
      throw new Error('User not loaded before token generation')
    }

    const jwtResult = await generateJWTToken(this._user)

    if (jwtResult.error) {
      this._statusRequest = GOOGLE_LOGIN.RequestStatus.Error
      this._requestResponse = jwtResult
      throw new Error('Failed to generate JWT token')
    }

    this._requestResponse = {
      status: AuthResultStatus.SUCCESS,
      error: false,
      message: 'Autenticación exitosa con Google',
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
          google_id: this._payload.provider_data.google_id,
          provider_type: 'google'
        }
      }
    }
  }

  /**
   * Command 5: Registra la actividad de login
   */
  private async _logActivity(): Promise<void> {
    this._statusRequest = GOOGLE_LOGIN.RequestStatus.LoggingActivity

    if (this._user === null) {
      this._statusRequest = GOOGLE_LOGIN.RequestStatus.Error
      this._requestResponse = {
        status: AuthResultStatus.ERROR,
        error: true,
        message: 'No se pudo resolver el usuario autenticado.'
      }
      throw new Error('User not loaded before activity logging')
    }

    await logAuthActivityExtra.registered({
      id: this._user.id,
      email: this._user.email,
      first_name: this._user.first_name,
      last_name: this._user.last_name,
      role: this._user.role
    })
  }

  /**
   * Command 6: Construye la respuesta exitosa
   */
  private async _buildSuccessResponse(): Promise<void> {
    this._statusRequest = GOOGLE_LOGIN.RequestStatus.Completed
  }
}
