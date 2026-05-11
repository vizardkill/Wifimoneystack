import { AccessRequestDB } from '@/core/marketplace/db/access-request.db'

import { trackError } from '@lib/functions/_track_error.function'
import { isValidAccessTransition } from '@lib/helpers/_marketplace-access.helper'
import { buildAccessAuditMeta, writeMarketplaceAuditEvent } from '@lib/helpers/_marketplace-audit.helper'

import { CONFIG_REVOKE_MARKETPLACE_ACCESS } from '@types'

type RequestStatus = CONFIG_REVOKE_MARKETPLACE_ACCESS.RequestStatus
type RequestResponse = CONFIG_REVOKE_MARKETPLACE_ACCESS.RequestResponse
type Payload = CONFIG_REVOKE_MARKETPLACE_ACCESS.Payload

export class CLS_RevokeMarketplaceAccess {
  private _payload!: Payload
  private _statusRequest: RequestStatus = CONFIG_REVOKE_MARKETPLACE_ACCESS.RequestStatus.Pending
  private _requestResponse: RequestResponse | null = null
  private _existing: Awaited<ReturnType<typeof AccessRequestDB.findById>> = null

  constructor(payload: Payload) {
    this._payload = payload
  }

  public async main(): Promise<RequestResponse> {
    const steps = [this._fetchRequest, this._validateTransition, this._applyRevocation, this._writeAudit, this._buildSuccess]

    for (const step of steps) {
      if (this._statusRequest === CONFIG_REVOKE_MARKETPLACE_ACCESS.RequestStatus.Pending) {
        await step.call(this)
      }
    }

    if (this._requestResponse === null) {
      this._statusRequest = CONFIG_REVOKE_MARKETPLACE_ACCESS.RequestStatus.Error
      this._requestResponse = { error: true, message: 'No se pudo revocar el acceso.' }
    }

    return this._requestResponse
  }

  private async _fetchRequest(): Promise<void> {
    try {
      this._existing = await AccessRequestDB.findById(this._payload.request_id)
      if (!this._existing) {
        this._statusRequest = CONFIG_REVOKE_MARKETPLACE_ACCESS.RequestStatus.NotFound
        this._requestResponse = { error: true, message: 'Solicitud de acceso no encontrada.' }
      }
    } catch (err) {
      this._statusRequest = CONFIG_REVOKE_MARKETPLACE_ACCESS.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error cargando la solicitud.' }
      trackError({ error: err as Error, method: 'CLS_RevokeMarketplaceAccess._fetchRequest', controller: 'marketplace' })
    }
  }

  private async _validateTransition(): Promise<void> {
    if (!isValidAccessTransition(this._existing!.status, 'REVOKED')) {
      this._statusRequest = CONFIG_REVOKE_MARKETPLACE_ACCESS.RequestStatus.InvalidTransition
      this._requestResponse = {
        error: true,
        message: `No se puede revocar un acceso en estado ${this._existing!.status}.`
      }
    }
  }

  private async _applyRevocation(): Promise<void> {
    try {
      await AccessRequestDB.updateDecision({
        id: this._payload.request_id,
        status: 'REVOKED',
        decided_by_user_id: this._payload.actor_user_id,
        decision_reason: this._payload.reason,
        revoked_at: new Date()
      })
    } catch (err) {
      this._statusRequest = CONFIG_REVOKE_MARKETPLACE_ACCESS.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error revocando el acceso.' }
      trackError({ error: err as Error, method: 'CLS_RevokeMarketplaceAccess._applyRevocation', controller: 'marketplace' })
    }
  }

  private async _writeAudit(): Promise<void> {
    await writeMarketplaceAuditEvent({
      actor_user_id: this._payload.actor_user_id,
      target_user_id: this._existing!.user_id,
      action: 'ACCESS_REVOKED',
      reason: this._payload.reason,
      metadata: buildAccessAuditMeta({
        request_id: this._payload.request_id,
        previous_status: this._existing!.status,
        new_status: 'REVOKED'
      })
    })
  }

  private async _buildSuccess(): Promise<void> {
    this._statusRequest = CONFIG_REVOKE_MARKETPLACE_ACCESS.RequestStatus.Completed
    this._requestResponse = { data: { request_id: this._payload.request_id } }
  }
}
