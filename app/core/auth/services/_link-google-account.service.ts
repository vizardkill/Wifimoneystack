import { UserAuthProviderDB } from '@/core/auth/db/user-auth-provider.db'
import { trackError } from '@/lib/functions/_track_error.function'

import { AuthResultStatus } from '@lib/interfaces'

import { CONFIG_LINK_GOOGLE_ACCOUNT } from '@types'

type RequestStatus = CONFIG_LINK_GOOGLE_ACCOUNT.RequestStatus
type RequestResponse = CONFIG_LINK_GOOGLE_ACCOUNT.RequestResponse
type Payload = CONFIG_LINK_GOOGLE_ACCOUNT.Payload

export class CLS_LinkGoogleAccount {
  private _payload: Payload
  private _requestResponse: RequestResponse | null = null
  private _statusRequest: RequestStatus = CONFIG_LINK_GOOGLE_ACCOUNT.RequestStatus.Pending

  constructor(payload: Payload) {
    this._payload = payload
  }

  public async main(): Promise<RequestResponse> {
    const steps = [this._linkAccount, this._buildSuccessResponse]

    for (const step of steps) {
      if (this._statusRequest === CONFIG_LINK_GOOGLE_ACCOUNT.RequestStatus.Pending) {
        await step.call(this)
      }
    }

    return this._requestResponse!
  }

  private async _linkAccount(): Promise<void> {
    try {
      const { userId, googleProfile } = this._payload
      await UserAuthProviderDB.linkGoogleAccount(userId, {
        google_id: googleProfile.google_id,
        email: googleProfile.email,
        picture: googleProfile.picture,
        verified_email: googleProfile.verified_email ?? false,
        locale: googleProfile.locale
      })
    } catch (error) {
      this._statusRequest = CONFIG_LINK_GOOGLE_ACCOUNT.RequestStatus.Error
      this._requestResponse = {
        status: AuthResultStatus.ERROR,
        error: true,
        message: 'Error al vincular cuenta de Google.',
        data: {}
      }
      trackError({
        method: 'CLS_LinkGoogleAccount._linkAccount',
        error: error as Error,
        controller: 'link-google-account',
        additionalContext: { userId: this._payload.userId, email: this._payload.googleProfile.email }
      })
    }
  }

  private async _buildSuccessResponse(): Promise<void> {
    this._statusRequest = CONFIG_LINK_GOOGLE_ACCOUNT.RequestStatus.Completed
    this._requestResponse = {
      status: AuthResultStatus.SUCCESS,
      error: false,
      message: 'Cuenta de Google vinculada exitosamente.',
      data: {}
    }
  }
}
