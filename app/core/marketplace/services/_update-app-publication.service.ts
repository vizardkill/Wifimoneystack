import { MarketplaceAppDB } from '@/core/marketplace/db/marketplace-app.db'

import { trackError } from '@lib/functions/_track_error.function'
import { buildAppAuditMeta, writeMarketplaceAuditEvent } from '@lib/helpers/_marketplace-audit.helper'

import { CONFIG_UPDATE_MARKETPLACE_APP_PUBLICATION } from '@types'

type RequestStatus = CONFIG_UPDATE_MARKETPLACE_APP_PUBLICATION.RequestStatus
type RequestResponse = CONFIG_UPDATE_MARKETPLACE_APP_PUBLICATION.RequestResponse
type Payload = CONFIG_UPDATE_MARKETPLACE_APP_PUBLICATION.Payload

export class CLS_UpdateMarketplaceAppPublication {
  private _payload!: Payload
  private _statusRequest: RequestStatus = CONFIG_UPDATE_MARKETPLACE_APP_PUBLICATION.RequestStatus.Pending
  private _requestResponse: RequestResponse | null = null
  private _previousStatus = ''

  constructor(payload: Payload) {
    this._payload = payload
  }

  public async main(): Promise<RequestResponse> {
    const steps = [this._validateRequirements, this._applyStatus, this._writeAudit, this._buildSuccess]

    for (const step of steps) {
      if (this._statusRequest === CONFIG_UPDATE_MARKETPLACE_APP_PUBLICATION.RequestStatus.Pending) {
        await step.call(this)
      }
    }

    if (this._requestResponse === null) {
      this._statusRequest = CONFIG_UPDATE_MARKETPLACE_APP_PUBLICATION.RequestStatus.Error
      this._requestResponse = { error: true, message: 'No se pudo actualizar el estado de publicación.' }
    }

    return this._requestResponse
  }

  private async _validateRequirements(): Promise<void> {
    try {
      const app = await MarketplaceAppDB.findById(this._payload.app_id)
      if (!app) {
        this._statusRequest = CONFIG_UPDATE_MARKETPLACE_APP_PUBLICATION.RequestStatus.Error
        this._requestResponse = { error: true, message: 'Aplicación no encontrada.' }
        return
      }
      this._previousStatus = app.status

      if (this._payload.publish) {
        const { valid, reasons } = await MarketplaceAppDB.validatePublicationRequirements(this._payload.app_id)
        if (!valid) {
          this._statusRequest = CONFIG_UPDATE_MARKETPLACE_APP_PUBLICATION.RequestStatus.ValidationFailed
          this._requestResponse = {
            error: true,
            message: `No cumple requisitos de publicación: ${reasons.join(', ')}.`
          }
        }
      }
    } catch (err) {
      this._statusRequest = CONFIG_UPDATE_MARKETPLACE_APP_PUBLICATION.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error validando la aplicación.' }
      trackError({ error: err as Error, method: 'CLS_UpdateMarketplaceAppPublication._validateRequirements', controller: 'marketplace' })
    }
  }

  private async _applyStatus(): Promise<void> {
    try {
      const newStatus = this._payload.publish ? 'ACTIVE' : 'INACTIVE'
      await MarketplaceAppDB.updateStatus(this._payload.app_id, newStatus, this._payload.publish ? new Date() : null)
    } catch (err) {
      this._statusRequest = CONFIG_UPDATE_MARKETPLACE_APP_PUBLICATION.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error actualizando el estado de publicación.' }
      trackError({ error: err as Error, method: 'CLS_UpdateMarketplaceAppPublication._applyStatus', controller: 'marketplace' })
    }
  }

  private async _writeAudit(): Promise<void> {
    const action = this._payload.publish ? 'APP_PUBLISHED' : 'APP_UNPUBLISHED'
    await writeMarketplaceAuditEvent({
      actor_user_id: this._payload.actor_user_id,
      app_id: this._payload.app_id,
      action: action,
      metadata: buildAppAuditMeta({
        app_id: this._payload.app_id,
        previous_status: this._previousStatus,
        new_status: this._payload.publish ? 'ACTIVE' : 'INACTIVE',
        action: action
      })
    })
  }

  private async _buildSuccess(): Promise<void> {
    const newStatus = this._payload.publish ? 'ACTIVE' : 'INACTIVE'
    this._statusRequest = CONFIG_UPDATE_MARKETPLACE_APP_PUBLICATION.RequestStatus.Completed
    this._requestResponse = { data: { app_id: this._payload.app_id, new_status: newStatus } }
  }
}
