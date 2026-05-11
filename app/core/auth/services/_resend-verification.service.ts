import { type User } from '@prisma/client'
import crypto from 'crypto'

import { UserDB } from '@/core/auth/db/user.db'

import { getAppBaseUrl } from '@lib/config'
import { sendVerificationEmail } from '@lib/functions/_send_email.function'
import { trackError } from '@lib/functions/_track_error.function'

import { CONFIG_VERIFY_EMAIL } from '@types'

export class CLS_ResendVerificationEmail {
  private _email: string
  private _requestResponse!: CONFIG_VERIFY_EMAIL.RequestResponse
  private _statusRequest: CONFIG_VERIFY_EMAIL.RequestStatus = CONFIG_VERIFY_EMAIL.RequestStatus.Pending
  private _userData!: User

  constructor(email: string) {
    this._email = email
  }

  public async main(): Promise<CONFIG_VERIFY_EMAIL.RequestResponse> {
    const steps = [this._findUser, this._generateAndSendNewToken]

    for (const step of steps) {
      if (this._statusRequest === CONFIG_VERIFY_EMAIL.RequestStatus.Pending) {
        await step.call(this)
      }
    }

    return this._requestResponse
  }

  private async _findUser(): Promise<void> {
    const user = await UserDB.findByEmail(this._email)

    if (!user) {
      this._statusRequest = CONFIG_VERIFY_EMAIL.RequestStatus.Completed
      this._requestResponse = {
        error: false,
        message: 'Se ha enviado un nuevo enlace de verificación al correo ingresado'
      }
      return
    }

    if (user.email_verified) {
      this._statusRequest = CONFIG_VERIFY_EMAIL.RequestStatus.Error
      this._requestResponse = {
        error: true,
        message: 'Esta cuenta ya ha sido verificada. Puedes iniciar sesión.'
      }
      return
    }

    this._userData = user
  }

  private async _generateAndSendNewToken(): Promise<void> {
    try {
      await UserDB.deleteAllEmailVerificationTokens(this._userData.id)

      const token = crypto.randomUUID()
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

      await UserDB.createEmailVerificationToken(this._userData.id, {
        token,
        expires
      })

      const validationUrl = `${getAppBaseUrl()}/api/v1/auth/sessions/verify?token=${token}`
      await sendVerificationEmail(this._userData.first_name, this._email, validationUrl)

      this._statusRequest = CONFIG_VERIFY_EMAIL.RequestStatus.Completed
      this._requestResponse = {
        error: false,
        message: 'Se ha enviado un nuevo enlace de verificación al correo ingresado'
      }
    } catch (error) {
      this._statusRequest = CONFIG_VERIFY_EMAIL.RequestStatus.Error
      this._requestResponse = {
        error: true,
        message: 'Error al enviar el correo de verificación. Por favor, inténtalo de nuevo más tarde.'
      }
      trackError({
        method: 'CLS_ResendVerificationEmail._generateAndSendNewToken',
        error: error as Error,
        controller: 'CLS_ResendVerificationEmail',
        additionalContext: {
          email: this._email
        }
      })
    }
  }
}
