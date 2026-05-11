import { type EmailVerificationToken } from '@prisma/client'

import { UserDB } from '@/core/auth/db/user.db'

import { trackError } from '@lib/functions/_track_error.function'
import { logSecurityActivity } from '@lib/helpers/_activity-log.helper'

import { CONFIG_VERIFY_EMAIL } from '@types'

export class CLS_VerifyEmail {
  private _token: string
  private _requestResponse!: CONFIG_VERIFY_EMAIL.RequestResponse
  private _statusRequest: CONFIG_VERIFY_EMAIL.RequestStatus = CONFIG_VERIFY_EMAIL.RequestStatus.Pending
  private _verificationTokenData!: EmailVerificationToken

  constructor(token: string) {
    this._token = token
  }

  public async main(): Promise<CONFIG_VERIFY_EMAIL.RequestResponse> {
    const steps = [this._validateTokenPayload, this._findAndValidateToken, this._activateUser]

    for (const step of steps) {
      if (this._statusRequest === CONFIG_VERIFY_EMAIL.RequestStatus.Pending) {
        await step.call(this)
      }
    }

    return this._requestResponse
  }

  private async _validateTokenPayload(): Promise<void> {
    if (!this._token) {
      this._statusRequest = CONFIG_VERIFY_EMAIL.RequestStatus.Error
      this._requestResponse = {
        error: true,
        message: 'El token de verificación es inválido o no fue proporcionado.'
      }
    }
  }

  private async _findAndValidateToken(): Promise<void> {
    try {
      const tokenData = await UserDB.findEmailVerificationToken(this._token)
      if (!tokenData) {
        this._statusRequest = CONFIG_VERIFY_EMAIL.RequestStatus.Error
        this._requestResponse = {
          error: true,
          message: 'El token de verificación no fue encontrado.'
        }
        return
      }

      if (tokenData.expires < new Date()) {
        this._statusRequest = CONFIG_VERIFY_EMAIL.RequestStatus.Error
        this._requestResponse = {
          error: true,
          message: 'El token de verificación ha expirado. Por favor, solicita uno nuevo.'
        }
        return
      }
      this._verificationTokenData = tokenData
    } catch (error) {
      this._statusRequest = CONFIG_VERIFY_EMAIL.RequestStatus.Error
      this._requestResponse = {
        error: true,
        message: 'Error al buscar el token de verificación. Por favor, intenta nuevamente.'
      }
      trackError({
        method: 'CLS_VerifyEmail._findAndValidateToken',
        error: error as Error,
        controller: 'CLS_VerifyEmail',
        additionalContext: {
          token: this._token
        }
      })
    }
  }

  private async _activateUser(): Promise<void> {
    try {
      const updatedUser = await UserDB.update(this._verificationTokenData.user_id, {
        email_verified: true,
        is_active: true
      })

      await logSecurityActivity.emailVerified({
        id: updatedUser.id,
        email: updatedUser.email,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        role: updatedUser.role
      })

      await UserDB.deleteEmailVerificationToken(this._verificationTokenData.id)

      this._statusRequest = CONFIG_VERIFY_EMAIL.RequestStatus.Completed
      this._requestResponse = {
        error: false,
        message: '¡Tu cuenta ha sido activada exitosamente!'
      }
    } catch (error) {
      this._statusRequest = CONFIG_VERIFY_EMAIL.RequestStatus.Error
      this._requestResponse = {
        error: true,
        message: 'Error al activar la cuenta. Por favor, intenta nuevamente.'
      }
      trackError({
        method: 'CLS_VerifyEmail._activateUser',
        error: error as Error,
        controller: 'CLS_VerifyEmail',
        additionalContext: {
          token_id: this._verificationTokenData.id
        }
      })
    }
  }
}
