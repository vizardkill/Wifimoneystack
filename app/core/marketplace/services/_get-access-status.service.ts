import { AccessRequestDB } from '@/core/marketplace/db/access-request.db'

import { trackError } from '@lib/functions/_track_error.function'

import { CONFIG_GET_MARKETPLACE_ACCESS_STATUS } from '@types'

type RequestStatus = CONFIG_GET_MARKETPLACE_ACCESS_STATUS.RequestStatus
type RequestResponse = CONFIG_GET_MARKETPLACE_ACCESS_STATUS.RequestResponse
type Payload = CONFIG_GET_MARKETPLACE_ACCESS_STATUS.Payload

export class CLS_GetMarketplaceAccessStatus {
  private _payload!: Payload
  private _statusRequest: RequestStatus = CONFIG_GET_MARKETPLACE_ACCESS_STATUS.RequestStatus.Pending
  private _requestResponse: RequestResponse | null = null

  constructor(payload: Payload) {
    this._payload = payload
  }

  public async main(): Promise<RequestResponse> {
    const steps = [this._fetchStatus, this._buildResponse]

    for (const step of steps) {
      if (this._statusRequest === CONFIG_GET_MARKETPLACE_ACCESS_STATUS.RequestStatus.Pending) {
        await step.call(this)
      }
    }

    if (this._requestResponse === null) {
      this._statusRequest = CONFIG_GET_MARKETPLACE_ACCESS_STATUS.RequestStatus.Error
      this._requestResponse = { error: true, message: 'No se pudo consultar el estado de acceso.' }
    }

    return this._requestResponse
  }

  private _accessRequest: Awaited<ReturnType<typeof AccessRequestDB.findByUserId>> = null

  private async _fetchStatus(): Promise<void> {
    try {
      this._accessRequest = await AccessRequestDB.findByUserId(this._payload.user_id)
    } catch (err) {
      this._statusRequest = CONFIG_GET_MARKETPLACE_ACCESS_STATUS.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error consultando estado de acceso.' }
      trackError({ error: err as Error, method: 'CLS_GetMarketplaceAccessStatus._fetchStatus', controller: 'marketplace' })
    }
  }

  private async _buildResponse(): Promise<void> {
    const req = this._accessRequest
    this._statusRequest = CONFIG_GET_MARKETPLACE_ACCESS_STATUS.RequestStatus.Completed
    this._requestResponse = {
      data: {
        access_status: req?.status ?? 'NONE',
        request_id: req?.id ?? null,
        decided_at: req?.decided_at ?? null,
        decision_reason: req?.decision_reason ?? null
      }
    }
  }
}
