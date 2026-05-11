import { AccessRequestDB } from '@/core/marketplace/db/access-request.db'

import { trackError } from '@lib/functions/_track_error.function'
import { isValidAccessTransition } from '@lib/helpers/_marketplace-access.helper'
import { buildAccessAuditMeta, writeMarketplaceAuditEvent } from '@lib/helpers/_marketplace-audit.helper'

import { CONFIG_DECIDE_MARKETPLACE_ACCESS_REQUEST } from '@types'

type RequestStatus = CONFIG_DECIDE_MARKETPLACE_ACCESS_REQUEST.RequestStatus
type RequestResponse = CONFIG_DECIDE_MARKETPLACE_ACCESS_REQUEST.RequestResponse
type Payload = CONFIG_DECIDE_MARKETPLACE_ACCESS_REQUEST.Payload

export class CLS_DecideMarketplaceAccessRequest {
  private _payload!: Payload
  private _statusRequest: RequestStatus = CONFIG_DECIDE_MARKETPLACE_ACCESS_REQUEST.RequestStatus.Pending
  private _requestResponse: RequestResponse | null = null
  private _existing: Awaited<ReturnType<typeof AccessRequestDB.findById>> = null

  constructor(payload: Payload) {
    this._payload = payload
  }

  public async main(): Promise<RequestResponse> {
    const steps = [this._fetchRequest, this._validateTransition, this._applyDecision, this._writeAudit, this._buildSuccess]

    for (const step of steps) {
      if (this._statusRequest === CONFIG_DECIDE_MARKETPLACE_ACCESS_REQUEST.RequestStatus.Pending) {
        await step.call(this)
      }
    }

    if (this._requestResponse === null) {
      this._statusRequest = CONFIG_DECIDE_MARKETPLACE_ACCESS_REQUEST.RequestStatus.Error
      this._requestResponse = { error: true, message: 'No se pudo procesar la decisión.' }
    }

    return this._requestResponse
  }

  private async _fetchRequest(): Promise<void> {
    try {
      this._existing = await AccessRequestDB.findById(this._payload.request_id)
      if (!this._existing) {
        this._statusRequest = CONFIG_DECIDE_MARKETPLACE_ACCESS_REQUEST.RequestStatus.NotFound
        this._requestResponse = { error: true, message: 'Solicitud de acceso no encontrada.' }
      }
    } catch (err) {
      this._statusRequest = CONFIG_DECIDE_MARKETPLACE_ACCESS_REQUEST.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error cargando la solicitud.' }
      trackError({ error: err as Error, method: 'CLS_DecideMarketplaceAccessRequest._fetchRequest', controller: 'marketplace' })
    }
  }

  private async _validateTransition(): Promise<void> {
    const existing = this._existing!
    const newStatus = this._payload.decision
    if (!isValidAccessTransition(existing.status, newStatus)) {
      this._statusRequest = CONFIG_DECIDE_MARKETPLACE_ACCESS_REQUEST.RequestStatus.InvalidTransition
      this._requestResponse = {
        error: true,
        message: `No se puede pasar de ${existing.status} a ${newStatus}.`
      }
    }
  }

  private async _applyDecision(): Promise<void> {
    try {
      await AccessRequestDB.updateDecision({
        id: this._payload.request_id,
        status: this._payload.decision,
        decided_by_user_id: this._payload.actor_user_id,
        decision_reason: this._payload.reason
      })
    } catch (err) {
      this._statusRequest = CONFIG_DECIDE_MARKETPLACE_ACCESS_REQUEST.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error actualizando la solicitud.' }
      trackError({ error: err as Error, method: 'CLS_DecideMarketplaceAccessRequest._applyDecision', controller: 'marketplace' })
    }
  }

  private async _writeAudit(): Promise<void> {
    const action = this._payload.decision === 'APPROVED' ? 'ACCESS_APPROVED' : 'ACCESS_REJECTED'
    await writeMarketplaceAuditEvent({
      actor_user_id: this._payload.actor_user_id,
      target_user_id: this._existing!.user_id,
      action: action,
      reason: this._payload.reason,
      metadata: buildAccessAuditMeta({
        request_id: this._payload.request_id,
        previous_status: this._existing!.status,
        new_status: this._payload.decision
      })
    })
  }

  private async _buildSuccess(): Promise<void> {
    this._statusRequest = CONFIG_DECIDE_MARKETPLACE_ACCESS_REQUEST.RequestStatus.Completed
    this._requestResponse = {
      data: {
        request_id: this._payload.request_id,
        new_status: this._payload.decision
      }
    }
  }
}
