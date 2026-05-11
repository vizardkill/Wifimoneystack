import { type User } from '@prisma/client'
import crypto from 'crypto'

import { PasswordResetTokenDB } from '@/core/auth/db/password-reset-token.db'
import { UserDB } from '@/core/auth/db/user.db'

import { getAppBaseUrl } from '@lib/config'
import { sendPasswordResetEmail } from '@lib/functions/_send_email.function'
import { trackError } from '@lib/functions/_track_error.function'
import { logSecurityActivity } from '@lib/helpers/_activity-log.helper'

import { CONFIG_FORGOT_PASSWORD } from '@types'

/**
 * Servicio para solicitar restablecimiento de contraseña
 */
export class CLS_ForgotPassword {
  private _email: string
  private _statusRequest: CONFIG_FORGOT_PASSWORD.RequestStatus = CONFIG_FORGOT_PASSWORD.RequestStatus.Pending
  private _requestResponse: CONFIG_FORGOT_PASSWORD.RequestResponse | null = null
  private _user: User | null = null
  private _token: string = ''
  private _resetUrl: string = ''

  constructor(email: string) {
    this._email = email
  }

  public async main(): Promise<CONFIG_FORGOT_PASSWORD.RequestResponse> {
    const commands = [
      this._fetchUser,
      this._validateUser,
      this._deleteOldTokens,
      this._generateToken,
      this._createPasswordResetToken,
      this._buildResetUrl,
      this._sendResetEmail,
      this._logActivity,
      this._buildSuccessResponse
    ]

    for (const command of commands) {
      if (this._statusRequest === CONFIG_FORGOT_PASSWORD.RequestStatus.Error || this._statusRequest === CONFIG_FORGOT_PASSWORD.RequestStatus.Completed) {
        break
      }
      await command.call(this)
    }

    if (this._requestResponse === null) {
      return {
        error: false,
        message: 'Si tu correo está registrado con nosotros, recibirás un enlace para restablecer tu contraseña.'
      }
    }

    return this._requestResponse
  }

  /**
   * Comando 1: Buscar usuario por email
   */
  private async _fetchUser(): Promise<void> {
    try {
      this._statusRequest = CONFIG_FORGOT_PASSWORD.RequestStatus.FetchingUser
      this._user = await UserDB.findByEmail(this._email)
      this._statusRequest = CONFIG_FORGOT_PASSWORD.RequestStatus.ValidatingUser
    } catch (error) {
      trackError({
        method: 'CLS_ForgotPassword._fetchUser',
        error: error as Error,
        controller: 'forgot-password'
      })
      this._statusRequest = CONFIG_FORGOT_PASSWORD.RequestStatus.Error
      this._buildErrorResponse('Error al buscar usuario')
    }
  }

  /**
   * Comando 2: Validar que el usuario existe y tiene email verificado
   * Si no cumple condiciones, retorna respuesta genérica
   */
  private async _validateUser(): Promise<void> {
    try {
      if (!this._user?.email_verified) {
        this._statusRequest = CONFIG_FORGOT_PASSWORD.RequestStatus.Completed
        this._requestResponse = {
          error: false,
          message: 'Si tu correo está registrado con nosotros, recibirás un enlace para restablecer tu contraseña.'
        }
        return
      }

      this._statusRequest = CONFIG_FORGOT_PASSWORD.RequestStatus.DeletingOldTokens
    } catch (error) {
      trackError({
        method: 'CLS_ForgotPassword._validateUser',
        error: error as Error,
        controller: 'forgot-password'
      })
      this._statusRequest = CONFIG_FORGOT_PASSWORD.RequestStatus.Error
      this._buildErrorResponse('Error al validar usuario')
    }
  }

  /**
   * Comando 3: Eliminar tokens anteriores del usuario
   */
  private async _deleteOldTokens(): Promise<void> {
    try {
      if (!this._user) {
        return
      }

      await PasswordResetTokenDB.deleteManyByUserId(this._user.id)
      this._statusRequest = CONFIG_FORGOT_PASSWORD.RequestStatus.GeneratingToken
    } catch (error) {
      trackError({
        method: 'CLS_ForgotPassword._deleteOldTokens',
        error: error as Error,
        controller: 'forgot-password'
      })
      this._statusRequest = CONFIG_FORGOT_PASSWORD.RequestStatus.Error
      this._buildErrorResponse('Error al eliminar tokens antiguos')
    }
  }

  /**
   * Comando 4: Generar nuevo token aleatorio
   */
  private async _generateToken(): Promise<void> {
    try {
      this._token = crypto.randomUUID()
      this._statusRequest = CONFIG_FORGOT_PASSWORD.RequestStatus.CreatingToken
    } catch (error) {
      trackError({
        method: 'CLS_ForgotPassword._generateToken',
        error: error as Error,
        controller: 'forgot-password'
      })
      this._statusRequest = CONFIG_FORGOT_PASSWORD.RequestStatus.Error
      this._buildErrorResponse('Error al generar token')
    }
  }

  /**
   * Comando 5: Crear registro de token en BD
   */
  private async _createPasswordResetToken(): Promise<void> {
    try {
      if (!this._user) {
        return
      }

      const expires = new Date(Date.now() + 1 * 60 * 60 * 1000)

      await PasswordResetTokenDB.create({
        user_id: this._user.id,
        token: this._token,
        expires
      })

      this._statusRequest = CONFIG_FORGOT_PASSWORD.RequestStatus.BuildingResetUrl
    } catch (error) {
      trackError({
        method: 'CLS_ForgotPassword._createPasswordResetToken',
        error: error as Error,
        controller: 'forgot-password'
      })
      this._statusRequest = CONFIG_FORGOT_PASSWORD.RequestStatus.Error
      this._buildErrorResponse('Error al crear token de restablecimiento')
    }
  }

  /**
   * Comando 6: Construir URL de restablecimiento
   */
  private async _buildResetUrl(): Promise<void> {
    try {
      this._resetUrl = `${getAppBaseUrl()}/reset-password?token=${this._token}`
      this._statusRequest = CONFIG_FORGOT_PASSWORD.RequestStatus.SendingEmail
    } catch (error) {
      trackError({
        method: 'CLS_ForgotPassword._buildResetUrl',
        error: error as Error,
        controller: 'forgot-password'
      })
      this._statusRequest = CONFIG_FORGOT_PASSWORD.RequestStatus.Error
      this._buildErrorResponse('Error al construir URL de restablecimiento')
    }
  }

  /**
   * Comando 7: Enviar email con link de restablecimiento
   */
  private async _sendResetEmail(): Promise<void> {
    try {
      if (!this._user) {
        return
      }

      await sendPasswordResetEmail(this._user.email, this._resetUrl)
      this._statusRequest = CONFIG_FORGOT_PASSWORD.RequestStatus.LoggingActivity
    } catch (error) {
      trackError({
        method: 'CLS_ForgotPassword._sendResetEmail',
        error: error as Error,
        controller: 'forgot-password'
      })
      this._statusRequest = CONFIG_FORGOT_PASSWORD.RequestStatus.LoggingActivity
    }
  }

  /**
   * Comando 8: Registrar actividad de seguridad
   */
  private async _logActivity(): Promise<void> {
    try {
      if (!this._user) {
        return
      }

      await logSecurityActivity.passwordResetRequested(this._user.id, this._user.email)
      this._statusRequest = CONFIG_FORGOT_PASSWORD.RequestStatus.Completed
    } catch (error) {
      trackError({
        method: 'CLS_ForgotPassword._logActivity',
        error: error as Error,
        controller: 'forgot-password'
      })
      this._statusRequest = CONFIG_FORGOT_PASSWORD.RequestStatus.Completed
    }
  }

  /**
   * Comando 9: Construir respuesta exitosa
   */
  private async _buildSuccessResponse(): Promise<void> {
    this._requestResponse = {
      error: false,
      message: 'Si tu correo está registrado con nosotros, recibirás un enlace para restablecer tu contraseña.'
    }
  }

  /**
   * Construir respuesta de error
   */
  private _buildErrorResponse(message: string): void {
    this._requestResponse = {
      error: true,
      message
    }
  }
}
