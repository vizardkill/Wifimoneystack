import { AccessRequestDB } from '@/core/marketplace/db/access-request.db'
import { MarketplaceAuditEventDB } from '@/core/marketplace/db/marketplace-audit-event.db'

import { trackError } from '@lib/functions/_track_error.function'
import { canRequestAccess } from '@lib/helpers/_marketplace-access.helper'
import type { ICreateAccessRequestInput } from '@lib/interfaces'

import { CONFIG_REQUEST_MARKETPLACE_ACCESS } from '@types'

type RequestStatus = CONFIG_REQUEST_MARKETPLACE_ACCESS.RequestStatus
type RequestResponse = CONFIG_REQUEST_MARKETPLACE_ACCESS.RequestResponse
type Payload = CONFIG_REQUEST_MARKETPLACE_ACCESS.Payload

export class CLS_RequestMarketplaceAccess {
  private _payload!: Payload
  private _statusRequest: RequestStatus = CONFIG_REQUEST_MARKETPLACE_ACCESS.RequestStatus.Pending
  private _requestResponse: RequestResponse | null = null

  constructor(payload: Payload) {
    this._payload = payload
  }

  public async main(): Promise<RequestResponse> {
    const steps = [this._checkExistingRequest, this._createRequest, this._writeAudit, this._buildSuccess]

    for (const step of steps) {
      if (this._statusRequest === CONFIG_REQUEST_MARKETPLACE_ACCESS.RequestStatus.Pending) {
        await step.call(this)
      }
    }

    if (this._requestResponse === null) {
      this._statusRequest = CONFIG_REQUEST_MARKETPLACE_ACCESS.RequestStatus.Error
      this._requestResponse = { error: true, message: 'No se pudo registrar la solicitud de acceso.' }
    }

    return this._requestResponse
  }

  private async _checkExistingRequest(): Promise<void> {
    try {
      const existing = await AccessRequestDB.findByUserId(this._payload.user_id)
      if (existing && !canRequestAccess(existing.status)) {
        this._statusRequest = CONFIG_REQUEST_MARKETPLACE_ACCESS.RequestStatus.AlreadyRequested
        this._requestResponse = {
          error: true,
          message: `Ya tienes una solicitud de acceso en estado: ${existing.status}.`,
          status: CONFIG_REQUEST_MARKETPLACE_ACCESS.RequestStatus.AlreadyRequested
        }
      }
    } catch (err) {
      this._statusRequest = CONFIG_REQUEST_MARKETPLACE_ACCESS.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error verificando solicitud existente.' }
      trackError({ error: err as Error, method: 'CLS_RequestMarketplaceAccess._checkExistingRequest', controller: 'marketplace' })
    }
  }

  private _newRequestId = ''

  private async _createRequest(): Promise<void> {
    try {
      const input: ICreateAccessRequestInput = {
        user_id: this._payload.user_id,
        company_name: this._payload.company_name,
        business_url: this._payload.business_url,
        business_type: this._payload.business_type,
        request_notes: this._payload.request_notes
      }
      const request = await AccessRequestDB.create(input)
      this._newRequestId = request.id
    } catch (err) {
      this._statusRequest = CONFIG_REQUEST_MARKETPLACE_ACCESS.RequestStatus.Error
      this._requestResponse = { error: true, message: 'No se pudo crear la solicitud de acceso.' }
      trackError({ error: err as Error, method: 'CLS_RequestMarketplaceAccess._createRequest', controller: 'marketplace' })
    }
  }

  private async _writeAudit(): Promise<void> {
    try {
      await MarketplaceAuditEventDB.create({
        actor_user_id: this._payload.user_id,
        target_user_id: this._payload.user_id,
        action: 'ACCESS_REQUESTED',
        metadata: { request_id: this._newRequestId }
      })
    } catch {
      // Audit failure must not block main flow
    }
  }

  private async _buildSuccess(): Promise<void> {
    this._statusRequest = CONFIG_REQUEST_MARKETPLACE_ACCESS.RequestStatus.Completed
    this._requestResponse = {
      data: { request_id: this._newRequestId, access_status: 'PENDING' }
    }
  }
}
